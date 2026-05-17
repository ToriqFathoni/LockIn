const db = require('../database');
const bcrypt = require('bcryptjs');

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function createUser({
  name,
  email,
  password,
  role = 'both',
  phone = null,
  location = null,
  skills = [],
  achievements = [],
  experience = null,
  cv = null,
}) {
  const hashed = await bcrypt.hash(password, 10);
  const client = await db.pool.connect();
  const normalizedSkills = normalizeList(skills);
  const normalizedAchievements = normalizeList(achievements);
  const cvFileName = cv && typeof cv === 'object' ? cv.name ?? null : null;
  const cvFileType = cv && typeof cv === 'object' ? cv.type ?? null : null;
  const cvFileData = cv && typeof cv === 'object' ? cv.data ?? null : null;

  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'INSERT INTO users (name,email,password,role,phone,location) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,name,email,role,created_at,phone,location',
      [name, email, hashed, role, phone, location]
    );

    const user = userResult.rows[0];

    await client.query(
      `INSERT INTO freelancer_profiles (
        freelancer_id,
        skills,
        achievements,
        experience,
        cv_file_name,
        cv_file_type,
        cv_file_data,
        country,
        bio
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (freelancer_id) DO NOTHING`,
      [
        user.id,
        normalizedSkills,
        normalizedAchievements,
        experience,
        cvFileName,
        cvFileType,
        cvFileData,
        location,
        experience,
      ]
    );

    await client.query('COMMIT');
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function findByEmail(email) {
  const result = await db.query('SELECT id,name,email,password,role,phone,location FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

module.exports = {
  createUser,
  findByEmail,
};
