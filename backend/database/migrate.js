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
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS estimated_time TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS job_type TEXT DEFAULT NULL
    `);
    
    console.log('Migration: users, freelancer_profiles, and projects columns ensured.');
  } catch (err) {
    console.error('Migration warning:', err.message);
  }
}

module.exports = { runMigrations };
