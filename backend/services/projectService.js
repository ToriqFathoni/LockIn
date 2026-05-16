const db = require('../database');

async function createProjectForClient(clientId, payload) {
  const { title, description = null, budget_min = null, budget_max = null, status = 'open', expires_at = null, skills = [], estimated_time = null, job_type = null } = payload;

  const result = await db.query(
    `INSERT INTO projects (client_id, title, description, budget_min, budget_max, status, expires_at, skills, estimated_time, job_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [clientId, title, description, budget_min, budget_max, status, expires_at, skills, estimated_time, job_type]
  );

  return result.rows[0];
}

async function updateProjectForClient(projectId, clientId, payload) {
  const allowed = ['title', 'description', 'budget_min', 'budget_max', 'status', 'expires_at', 'skills', 'estimated_time', 'job_type'];
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      fields.push(`${key} = $${idx}`);
      values.push(payload[key]);
      idx += 1;
    }
  }

  if (fields.length === 0) {
    const current = await db.query('SELECT * FROM projects WHERE id = $1 AND client_id = $2', [projectId, clientId]);
    return current.rows[0] || null;
  }

  values.push(projectId, clientId);
  const result = await db.query(
    `UPDATE projects
     SET ${fields.join(', ')}
     WHERE id = $${idx} AND client_id = $${idx + 1}
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

async function deleteProjectForClient(projectId, clientId) {
  const result = await db.query('DELETE FROM projects WHERE id = $1 AND client_id = $2 RETURNING *', [projectId, clientId]);
  return result.rows[0] || null;
}

async function getProjectById(projectId) {
  const result = await db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
  return result.rows[0] || null;
}

async function getAllProjects(clientId) {
  const result = await db.query('SELECT * FROM projects WHERE client_id = $1 AND (status != \'canceled\' OR status IS NULL) ORDER BY created_at DESC', [clientId]);
  return result.rows;
}

async function getAllPublicProjects() {
  const result = await db.query(
    `SELECT p.*, u.name AS client_name
     FROM projects p
     JOIN users u ON u.id = p.client_id
     WHERE p.status = 'open'
     ORDER BY p.created_at DESC
     LIMIT 50`
  );
  return result.rows;
}

module.exports = {
  createProjectForClient,
  updateProjectForClient,
  deleteProjectForClient,
  getProjectById,
  getAllProjects,
  getAllPublicProjects,
};
