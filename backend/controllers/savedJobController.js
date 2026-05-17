const savedJobService = require('../services/savedJobService');

async function saveJob(req, res) {
  try {
    const freelancerId = req.user.id;
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const saved = await savedJobService.saveJob(freelancerId, projectId);

    return res.status(201).json({ saved });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function unsaveJob(req, res) {
  try {
    const freelancerId = req.user.id;
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const unsaved = await savedJobService.unsaveJob(freelancerId, projectId);

    if (!unsaved) {
      return res.status(404).json({ error: 'Saved job not found' });
    }

    return res.json({ unsaved });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getSavedJobs(req, res) {
  try {
    const freelancerId = req.user.id;

    const savedJobs = await savedJobService.getSavedJobs(freelancerId);

    return res.json({ savedJobs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function checkSavedStatus(req, res) {
  try {
    const freelancerId = req.user.id;
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const isSaved = await savedJobService.isSaved(freelancerId, projectId);

    return res.json({ isSaved });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkSavedStatus,
};
