const db = require('../database');

async function getProjectById(projectId) {
  const result = await db.query('SELECT id, client_id, status FROM projects WHERE id = $1', [projectId]);
  return result.rows[0] || null;
}

async function getBidById(bidId) {
  const result = await db.query('SELECT * FROM bids WHERE id = $1', [bidId]);
  return result.rows[0] || null;
}

async function getBidByIdAndFreelancerId(bidId, freelancerId) {
  const result = await db.query('SELECT * FROM bids WHERE id = $1 AND freelancer_id = $2', [bidId, freelancerId]);
  return result.rows[0] || null;
}

async function createBidForFreelancer(freelancerId, payload) {
  const { project_id, cover_letter = null, bid_amount, delivery_days = null } = payload;

  const project = await getProjectById(project_id);
  if (!project) {
    const error = new Error('Project not found');
    error.code = 'PROJECT_NOT_FOUND';
    throw error;
  }

  if (project.status !== 'open') {
    const error = new Error('Project is not open for bids');
    error.code = 'PROJECT_NOT_OPEN';
    throw error;
  }

  const result = await db.query(
    `INSERT INTO bids (freelancer_id, project_id, cover_letter, bid_amount, delivery_days)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [freelancerId, project_id, cover_letter, bid_amount, delivery_days]
  );

  return result.rows[0];
}

async function updateBidForFreelancer(bidId, freelancerId, payload) {
  const allowed = ['cover_letter', 'bid_amount', 'delivery_days'];
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
    return getBidByIdAndFreelancerId(bidId, freelancerId);
  }

  values.push(bidId, freelancerId);
  const result = await db.query(
    `UPDATE bids
     SET ${fields.join(', ')}
     WHERE id = $${idx} AND freelancer_id = $${idx + 1}
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

async function deleteBidForFreelancer(bidId, freelancerId) {
  const result = await db.query('DELETE FROM bids WHERE id = $1 AND freelancer_id = $2 RETURNING *', [bidId, freelancerId]);
  return result.rows[0] || null;
}

async function getAllBids(freelancerId) {
  const result = await db.query('SELECT * FROM bids WHERE freelancer_id = $1', [freelancerId]);
  return result.rows;
}

async function getBidByProjectAndFreelancer(projectId, freelancerId) {
  const result = await db.query(
    'SELECT * FROM bids WHERE project_id = $1 AND freelancer_id = $2',
    [projectId, freelancerId]
  );
  return result.rows[0] || null;
}

async function getBidsByProject(projectId) {
  // Combine real bids and message-based applications
  const result = await db.query(
    `WITH message_applicants AS (
        SELECT 
            cv.job_id,
            u.id as freelancer_id,
            u.name as freelancer_name,
            fp.bio as freelancer_bio,
            fp.skills as freelancer_skills,
            cv.created_at
        FROM conversations cv
        JOIN users u ON (cv.user_1_id = u.id OR cv.user_2_id = u.id)
        JOIN projects p ON p.id = cv.job_id
        LEFT JOIN freelancer_profiles fp ON fp.freelancer_id = u.id
        WHERE cv.job_id = $1 AND u.id != p.client_id
    )
    SELECT 
        b.id,
        COALESCE(b.freelancer_id, ma.freelancer_id) as freelancer_id,
        COALESCE(b.project_id, ma.job_id) as project_id,
        COALESCE(b.cover_letter, 'Applied via message') as cover_letter,
        COALESCE(b.bid_amount, 0) as bid_amount,
        COALESCE(b.status, 'pending') as status,
        COALESCE(b.created_at, ma.created_at) as created_at,
        COALESCE(u.name, ma.freelancer_name) as freelancer_name,
        COALESCE(fp.bio, ma.freelancer_bio) as freelancer_bio,
        COALESCE(fp.skills, ma.freelancer_skills) as freelancer_skills,
        COALESCE(fp.avatar_url, u.profile_picture) as profile_picture,
        (CASE WHEN b.id IS NULL THEN TRUE ELSE FALSE END) as is_message_only
    FROM bids b
    FULL OUTER JOIN message_applicants ma ON b.project_id = ma.job_id AND b.freelancer_id = ma.freelancer_id
    LEFT JOIN users u ON u.id = COALESCE(b.freelancer_id, ma.freelancer_id)
    LEFT JOIN freelancer_profiles fp ON fp.freelancer_id = COALESCE(b.freelancer_id, ma.freelancer_id)
    WHERE b.project_id = $1 OR ma.job_id = $1
    ORDER BY created_at DESC`,
    [projectId]
  );
  return result.rows;
}

async function rejectBidForClient(bidId, clientId) {
  const bid = await getBidById(bidId);
  if (!bid) return null;

  const project = await getProjectById(bid.project_id);
  if (!project || project.client_id !== clientId) {
    const error = new Error('Unauthorized');
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  const result = await db.query(
    'UPDATE bids SET status = $1 WHERE id = $2 RETURNING *',
    ['rejected', bidId]
  );
  return result.rows[0];
}

module.exports = {
  createBidForFreelancer,
  updateBidForFreelancer,
  deleteBidForFreelancer,
  getBidById,
  getBidByIdAndFreelancerId,
  getAllBids,
  getBidByProjectAndFreelancer,
  getBidsByProject,
  rejectBidForClient,
};
