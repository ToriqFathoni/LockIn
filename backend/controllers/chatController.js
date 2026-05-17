const chatService = require('../services/chatService');
const projectService = require('../services/projectService');

async function createConversation(req, res) {
  try {
    const { other_user_id, job_id } = req.body;
    const userId = req.user.id;

    if (!other_user_id) {
      return res.status(400).json({ error: 'other_user_id is required' });
    }

    if (userId === other_user_id) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    const conversation = await chatService.getOrCreateConversation(userId, other_user_id, job_id || null);

    // If conversation is newly created (first time) and job_id exists, send template message
    if (job_id && conversation) {
      try {
        const project = await projectService.getPublicProjectById(job_id);
        if (project) {
          const templateMessage = `Halo! 👋 Saya tertarik dengan pekerjaan "${project.title}". 

Saya merasa memiliki kualifikasi dan pengalaman yang sesuai dengan kebutuhan Anda. Saya siap untuk mendiskusikan detail proyek dan memberikan solusi terbaik.

Terima kasih atas perhatiannya!`;

          await chatService.sendMessage(conversation.id, userId, templateMessage);
        }
      } catch (err) {
        console.error('Error sending template message:', err);
        // Continue even if template message fails
      }
    }

    return res.status(201).json({ conversation });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getConversations(req, res) {
  try {
    const userId = req.user.id;

    const conversations = await chatService.getConversationsByUserId(userId);

    return res.json({ conversations });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }

    // Verify user has access
    await chatService.getConversationById(conversationId, userId);

    const messages = await chatService.getMessagesByConversationId(conversationId, userId);

    return res.json({ messages });
  } catch (err) {
    console.error(err);
    if (err.message.includes('not found') || err.message.includes('unauthorized')) {
      return res.status(404).json({ error: 'Conversation not found or unauthorized' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}

async function sendMessage(req, res) {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = await chatService.sendMessage(conversationId, userId, content);

    return res.status(201).json({ message });
  } catch (err) {
    console.error(err);
    if (err.message.includes('not found') || err.message.includes('unauthorized')) {
      return res.status(404).json({ error: 'Conversation not found or unauthorized' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
};
