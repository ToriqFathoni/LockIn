const db = require('../database');

async function saveJob(freelancerId, projectId) {
  try {
    const result = await db.query(
      `INSERT INTO saved_jobs (freelancer_id, project_id)
       VALUES ($1, $2)
       ON CONFLICT (freelancer_id, project_id) DO NOTHING
       RETURNING *`,
      [freelancerId, projectId]
    );
    return result.rows[0] || null;
  } catch (err) {
    throw err;
  }
}

async function unsaveJob(freelancerId, projectId) {
  try {
    const result = await db.query(
      'DELETE FROM saved_jobs WHERE freelancer_id = $1 AND project_id = $2 RETURNING *',
      [freelancerId, projectId]
    );
    return result.rows[0] || null;
  } catch (err) {
    throw err;
  }
}

async function getSavedJobs(freelancerId) {
  try {
    const result = await db.query(
      `SELECT 
        sj.id,
        sj.created_at,
        p.id as project_id,
        p.title,
        p.description,
        p.budget_min,
        p.budget_max,
        p.status,
        p.skills,
        p.estimated_time,
        p.job_type,
        p.created_at as project_created_at,
        u.id as client_id,
        u.name as client_name,
        u.email as client_email,
        u.location as client_location
       FROM saved_jobs sj
       INNER JOIN projects p ON sj.project_id = p.id
      LEFT JOIN users u ON p.client_id = u.id
       WHERE sj.freelancer_id = $1 AND p.status = 'open'
       ORDER BY sj.created_at DESC`,
      [freelancerId]
    );
    return result.rows;
  } catch (err) {
    throw err;
  }
}

async function isSaved(freelancerId, projectId) {
  try {
    const result = await db.query(
      'SELECT id FROM saved_jobs WHERE freelancer_id = $1 AND project_id = $2',
      [freelancerId, projectId]
    );
    return result.rows.length > 0;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  saveJob,
  unsaveJob,
  getSavedJobs,
  isSaved,
};
