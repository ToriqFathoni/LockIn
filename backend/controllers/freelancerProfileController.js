const freelancerProfileService = require('../services/freelancerProfileService');
const cloudinary = require('../utils/cloudinary');

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
    const body = { ...req.body };

    if (body.avatar_base64) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        try {
          const uploadResult = await cloudinary.uploader.upload(body.avatar_base64, {
            folder: 'avatars',
          });
          body.avatar_url = uploadResult.secure_url;
        } catch (uploadError) {
          console.error("Cloudinary upload failed:", uploadError);
          return res.status(500).json({ error: 'Gagal mengunggah foto ke Cloudinary.' });
        }
      } else {
        return res.status(400).json({ error: 'Cloudinary belum dikonfigurasi di server. File gambar tidak dapat disimpan ke Database.' });
      }
      delete body.avatar_base64;
    }

    await freelancerProfileService.updateProfile(freelancerId, body);
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
    // We treat profileId as freelancerId here to match the logic mapping.
    const profile = await freelancerProfileService.getProfileDetails(profileId) || await freelancerProfileService.getProfileById(profileId);
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
