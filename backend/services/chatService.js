const db = require('../database');

async function getOrCreateConversation(user1Id, user2Id, jobId = null) {
  // Ensure consistent ordering of UUIDs for the UNIQUE constraint
  const [userId1, userId2] = String(user1Id).localeCompare(String(user2Id)) < 0 ? [user1Id, user2Id] : [user2Id, user1Id];

  try {
    const existing = await db.query(
      'SELECT * FROM conversations WHERE user_1_id = $1 AND user_2_id = $2',
      [userId1, userId2]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    const result = await db.query(
      `INSERT INTO conversations (user_1_id, user_2_id, job_id)
       VALUES ($1, $2, $3)
       RETURNING id, user_1_id, user_2_id, job_id, created_at, updated_at`,
      [userId1, userId2, jobId]
    );

    return result.rows[0];
  } catch (err) {
    throw err;
  }
}

async function getConversationsByUserId(userId) {
  try {
    const result = await db.query(
      `SELECT 
        c.id,
        c.user_1_id,
        c.user_2_id,
        c.job_id,
        c.created_at,
        c.updated_at,
        (CASE WHEN c.user_1_id = $1 THEN c.user_2_id ELSE c.user_1_id END) as other_user_id,
        u.name as other_user_name,
        u.email as other_user_email,
        fp.avatar_url as other_user_avatar,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
       FROM conversations c
       JOIN users u ON (CASE WHEN c.user_1_id = $1 THEN c.user_2_id ELSE c.user_1_id END) = u.id
       LEFT JOIN freelancer_profiles fp ON u.id = fp.freelancer_id
       WHERE c.user_1_id = $1 OR c.user_2_id = $1
       ORDER BY c.updated_at DESC`,
      [userId]
    );

    return result.rows;
  } catch (err) {
    throw err;
  }
}

async function getConversationById(conversationId, userId) {
  try {
    const result = await db.query(
      `SELECT c.id, c.user_1_id, c.user_2_id, c.job_id, c.created_at, c.updated_at
       FROM conversations c
       WHERE c.id = $1 AND (c.user_1_id = $2 OR c.user_2_id = $2)`,
      [conversationId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Conversation not found or unauthorized');
    }

    return result.rows[0];
  } catch (err) {
    throw err;
  }
}

async function sendMessage(conversationId, senderId, content) {
  try {
    const convResult = await db.query(
      `SELECT id FROM conversations 
       WHERE id = $1 AND (user_1_id = $2 OR user_2_id = $2)`,
      [conversationId, senderId]
    );

    if (convResult.rows.length === 0) {
      throw new Error('Conversation not found or unauthorized');
    }

    const result = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, conversation_id, sender_id, content, created_at`,
      [conversationId, senderId, content]
    );

    await db.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversationId]
    );

    return result.rows[0];
  } catch (err) {
    throw err;
  }
}

async function getMessagesByConversationId(conversationId, userId) {
  try {
    const convResult = await db.query(
      `SELECT id FROM conversations 
       WHERE id = $1 AND (user_1_id = $2 OR user_2_id = $2)`,
      [conversationId, userId]
    );

    if (convResult.rows.length === 0) {
      throw new Error('Conversation not found or unauthorized');
    }

    const result = await db.query(
      `SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.created_at,
        u.name as sender_name,
        u.email as sender_email
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

    return result.rows;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getOrCreateConversation,
  getConversationsByUserId,
  getConversationById,
  sendMessage,
  getMessagesByConversationId,
};
