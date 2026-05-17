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
  const result = await db.query(
    `SELECT 
        p.*,
        u.id as client_id,
        u.name as client_name,
        u.email as client_email,
        u.location as client_location
     FROM projects p
     LEFT JOIN users u ON u.id = p.client_id
     WHERE p.id = $1`,
    [projectId]
  );
  
  if (!result.rows.length) return null;
  
  const row = result.rows[0];
  return {
    ...row,
    client: {
      id: row.client_id,
      name: row.client_name || 'Unknown Client',
      email: row.client_email,
      rating: 4.8,
      verified: true,
      location: row.client_location || 'Remote',
    }
  };
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

async function getPublicProjectById(projectId) {
  const result = await db.query(
      `SELECT p.*, 
              u.id AS client_id, u.name AS client_name, u.email AS client_email, u.location AS client_location,
              COALESCE(fp.avatar_url, u.profile_picture) as client_avatar
       FROM projects p
       LEFT JOIN users u ON u.id = p.client_id
       LEFT JOIN freelancer_profiles fp ON fp.freelancer_id = u.id
       WHERE p.id = $1 AND p.status = 'open'`,
    [projectId]
  );
  
  if (!result.rows.length) return null;
  
  const row = result.rows[0];
  return {
    ...row,
    client: {
      id: row.client_id,
        name: row.client_name || 'Unknown Client',
      email: row.client_email,
        rating: 4.8,
      verified: true, // default verified
        location: row.client_location || 'Remote',
        avatar: row.client_avatar || null,
    }
  };
}

async function getAppliedProjectsForFreelancer(freelancerId) {
  const result = await db.query(
    `SELECT 
        p.*, 
        b.status as bid_status,
        c.status as contract_status,
        u.name as client_name,
        cv.id as conversation_id
     FROM projects p
     JOIN users u ON u.id = p.client_id
     LEFT JOIN bids b ON b.project_id = p.id AND b.freelancer_id = $1
     LEFT JOIN contracts c ON c.project_id = p.id AND c.freelancer_id = $1
     LEFT JOIN conversations cv ON cv.job_id = p.id AND (cv.user_1_id = $1 OR cv.user_2_id = $1)
      WHERE (b.id IS NOT NULL OR c.id IS NOT NULL OR cv.id IS NOT NULL) AND p.client_id != $1
      ORDER BY p.created_at DESC`,
    [freelancerId]
  );
  return result.rows;
}

async function getProjectDetailsForFreelancer(freelancerId, projectId) {
  const result = await db.query(
    `SELECT 
        p.*,
        b.status as bid_status,
        c.status as contract_status,
        u.id as client_id,
        u.name as client_name,
        u.email as client_email,
        u.location as client_location,
        COALESCE(fp.avatar_url, u.profile_picture) as client_avatar,
        cv.id as conversation_id
     FROM projects p
     JOIN users u ON u.id = p.client_id
     LEFT JOIN freelancer_profiles fp ON fp.freelancer_id = u.id
     LEFT JOIN bids b ON b.project_id = p.id AND b.freelancer_id = $1
     LEFT JOIN contracts c ON c.project_id = p.id AND c.freelancer_id = $1
     LEFT JOIN conversations cv ON cv.job_id = p.id AND (cv.user_1_id = $1 OR cv.user_2_id = $1)
     WHERE p.id = $2 AND (
       p.status = 'open' 
       OR b.id IS NOT NULL 
       OR c.id IS NOT NULL 
       OR cv.id IS NOT NULL
     )`,
    [freelancerId, projectId]
  );

  if (!result.rows.length) return null;

  const row = result.rows[0];
  return {
    ...row,
    client: {
      id: row.client_id,
      name: row.client_name || 'Unknown Client',
      email: row.client_email,
      rating: 4.8,
      verified: true,
      location: row.client_location || 'Remote',
      avatar: row.client_avatar || null,
    }
  };
}

module.exports = {
  createProjectForClient,
  updateProjectForClient,
  deleteProjectForClient,
  getProjectById,
  getAllProjects,
  getAllPublicProjects,
  getPublicProjectById,
  getAppliedProjectsForFreelancer,
  getProjectDetailsForFreelancer,
};
