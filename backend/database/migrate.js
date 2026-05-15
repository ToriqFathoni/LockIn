const db = require('../database');

async function runMigrations() {
  try {
    // 0. Enable UUID extension
    await db.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 1. Create users table with UUID primary key
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('client', 'freelancer', 'both')),
        phone VARCHAR(20),
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create freelancer_profiles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS freelancer_profiles (
        id SERIAL PRIMARY KEY,
        freelancer_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        skills TEXT[] DEFAULT '{}',
        achievements TEXT[] DEFAULT '{}',
        experience TEXT,
        cv_file_name TEXT,
        cv_file_type TEXT,
        cv_file_data TEXT,
        country VARCHAR(100),
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query(`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS estimated_time TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS job_type TEXT DEFAULT NULL
    `);
    
    console.log('Migration: users, freelancer_profiles, and projects columns ensured.');

    // 3. Drop existing chat tables to recreate with correct schema
    await db.query(`DROP TABLE IF EXISTS messages CASCADE`);
    await db.query(`DROP TABLE IF EXISTS conversations CASCADE`);

    // 4. Create conversations table with UUID foreign keys
    await db.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_1_id, user_2_id),
        CHECK (user_1_id != user_2_id)
      )
    `);

    // 5. Create messages table with UUID sender_id
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Add job_id FK to conversations if projects table exists
    try {
      const projectsExist = await db.query(`
        SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'projects')
      `);
      
      if (projectsExist.rows[0].exists) {
        await db.query(`
          ALTER TABLE conversations
          ADD CONSTRAINT conversations_job_id_fkey
          FOREIGN KEY (job_id) REFERENCES projects(id) ON DELETE SET NULL
        `).catch(() => {
          // Constraint may already exist, ignore
        });
      }
    } catch (e) {
      console.log('⚠️  Note: job_id FK might not be applicable (projects table may not exist)');
    }

    // 7. Create indexes for performance
    await db.query(`CREATE INDEX IF NOT EXISTS idx_conversations_user_1_id ON conversations(user_1_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_conversations_user_2_id ON conversations(user_2_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_freelancer_id ON freelancer_profiles(freelancer_id)`);

    console.log('✅ Migration completed: Users table with UUID primary keys created successfully');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  }
}

module.exports = { runMigrations };
