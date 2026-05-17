const projectService = require('../services/projectService');

function hasInvalidBudgetRange(budgetMin, budgetMax) {
  if (budgetMin == null || budgetMax == null) return false;
  return Number(budgetMin) > Number(budgetMax);
}

async function createProject(req, res) {
  try {
    const clientId = req.user.id;
    const {
      title,
      description = null,
      budget_min = null,
      budget_max = null,
      status = 'open',
      skills = [],
      estimated_time = null,
      job_type = null,
      expires_at,
      expires_date,
      expries_date,
    } = req.body || {};

    const finalExpiresAt = expires_at ?? expires_date ?? expries_date ?? null;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    if (hasInvalidBudgetRange(budget_min, budget_max)) {
      return res.status(400).json({ error: 'budget_min cannot be greater than budget_max' });
    }

    const allowedStatus = ['open', 'progress', 'closed', 'canceled'];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use: open, progress, closed, canceled' });
    }

    const project = await projectService.createProjectForClient(clientId, {
      title,
      description,
      budget_min,
      budget_max,
      status,
      skills,
      estimated_time,
      job_type,
      expires_at: finalExpiresAt,
    });
    return res.status(201).json({ project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateProject(req, res) {
  try {
    const clientId = req.user.id;
    const { projectId } = req.params;
    const {
      title,
      description,
      budget_min,
      budget_max,
      status,
      skills,
      estimated_time,
      job_type,
      expires_at,
      expires_date,
      expries_date,
    } = req.body || {};

    const finalExpiresAt = expires_at ?? expires_date ?? expries_date;

    if (hasInvalidBudgetRange(budget_min, budget_max)) {
      return res.status(400).json({ error: 'budget_min cannot be greater than budget_max' });
    }

    const allowedStatus = ['open', 'progress', 'closed', 'canceled'];
    if (status != null && !allowedStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use: open, progress, closed, canceled' });
    }

    const payload = {};
    if (title !== undefined) payload.title = title;
    if (description !== undefined) payload.description = description;
    if (budget_min !== undefined) payload.budget_min = budget_min;
    if (budget_max !== undefined) payload.budget_max = budget_max;
    if (status !== undefined) payload.status = status;
    if (skills !== undefined) payload.skills = skills;
    if (estimated_time !== undefined) payload.estimated_time = estimated_time;
    if (job_type !== undefined) payload.job_type = job_type;
    if (finalExpiresAt !== undefined) payload.expires_at = finalExpiresAt;

    const project = await projectService.updateProjectForClient(projectId, clientId, payload);
    if (!project) {
      return res.status(404).json({ error: 'Project not found or not owned by this client' });
    }

    return res.json({ project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteProject(req, res) {
  try {
    const clientId = req.user.id;
    const { projectId } = req.params;

    const deleted = await projectService.deleteProjectForClient(projectId, clientId);
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found or not owned by this client' });
    }

    return res.json({ deleted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getAllProjects(req, res) {
  try {
    const clientId = req.user.id;
    const projects = await projectService.getAllProjects(clientId);
    return res.json({ projects });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getProjectById(req, res) {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;
    
    console.log(`[getProjectById] userId=${userId}, projectId=${projectId}`);

    const project = await projectService.getProjectById(projectId);
    if (!project) {
      console.log(`[getProjectById] Project not found: ${projectId}`);
      return res.status(404).json({ error: 'Project not found' });
    }

    // Allow access if user is the owner
    if (project.client_id === userId) {
      console.log(`[getProjectById] User is owner, returning project`);
      return res.json(project);
    }

    // Otherwise, check if freelancer has applied or has contract
    // and add contract/bid status to the response
    const projectForFreelancer = await projectService.getProjectDetailsForFreelancer(userId, projectId);
    if (projectForFreelancer) {
      console.log(`[getProjectById] User has contract/bid, returning project with status`, {
        contract_status: projectForFreelancer.contract_status,
        bid_status: projectForFreelancer.bid_status
      });
      return res.json(projectForFreelancer);
    }

    console.log(`[getProjectById] Freelancer not authorized for project ${projectId}`);
    return res.status(403).json({ error: 'Not authorized to view this project' });
  } catch (err) {
    console.error('[getProjectById] Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getProjectDetailsForFreelancer(req, res) {
  try {
    const freelancerId = req.user.id;
    const { projectId } = req.params;

    const project = await projectService.getProjectDetailsForFreelancer(freelancerId, projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found or not accessible' });
    }

    return res.json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getPublicProjects(req, res) {
  try {
    const projects = await projectService.getAllPublicProjects();
    return res.json({ projects });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getPublicProjectById(req, res) {
  try {
    const { projectId } = req.params;

    const project = await projectService.getPublicProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getAppliedProjects(req, res) {
  try {
    const freelancerId = req.user.id;
    const projects = await projectService.getAppliedProjectsForFreelancer(freelancerId);
    return res.json({ projects });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createProject,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  getPublicProjects,
  getPublicProjectById,
  getAppliedProjects,
  getProjectDetailsForFreelancer,
};
