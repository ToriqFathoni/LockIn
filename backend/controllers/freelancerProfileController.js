const freelancerProfileService = require('../services/freelancerProfileService');

async function createOrGetMyProfile(req, res) {
  try {
    const freelancerId = req.user.id;
    await freelancerProfileService.createDefaultProfile(freelancerId);
    const profile = await freelancerProfileService.getProfileDetails(freelancerId);
    return res.status(201).json({ profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateMyProfile(req, res) {
  try {
    const freelancerId = req.user.id;
    await freelancerProfileService.updateProfile(freelancerId, req.body);
    const profile = await freelancerProfileService.getProfileDetails(freelancerId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.json({ profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getAllProfiles(req, res) {
  try {
    const profiles = await freelancerProfileService.getAllProfiles();
    return res.json({ profiles });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getProfileById(req, res) {
  try {
    const { profileId } = req.params;
    const profile = await freelancerProfileService.getProfileById(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    return res.json({ profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createOrGetMyProfile,
  updateMyProfile,
  getAllProfiles,
  getProfileById,
};
