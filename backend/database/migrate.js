const db = require('../database');

async function runMigrations() {
  try {
    await db.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT NULL
    `);
    console.log('Migration: users phone/location columns ensured.');
  } catch (err) {
    console.error('Migration warning:', err.message);
  }
}

module.exports = { runMigrations };
