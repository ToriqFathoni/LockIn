const db = require('../database');

async function runMigrations() {
  try {
    await db.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT NULL
    `);

    await db.query(`
      ALTER TABLE freelancer_profiles
      ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS cv_file_name TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS cv_file_type TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS cv_file_data TEXT DEFAULT NULL
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_1_id INTEGER NOT NULL REFERENCES users(id),
        user_2_id INTEGER NOT NULL REFERENCES users(id),
        job_id INTEGER REFERENCES projects(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_1_id, user_2_id),
        CHECK (user_1_id != user_2_id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_user_1_id ON conversations(user_1_id)
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_user_2_id ON conversations(user_2_id)
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)
    `);

    console.log('Migration: users, freelancer_profiles, conversations, and messages tables ensured.');
  } catch (err) {
    console.error('Migration warning:', err.message);
  }
}

module.exports = { runMigrations };
