const express = require('express');
const router = express.Router();
const controller = require('../controllers/savedJobController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.post('/', controller.saveJob);
router.post('/unsave', controller.unsaveJob);
router.get('/', controller.getSavedJobs);
router.get('/check/:projectId', controller.checkSavedStatus);

module.exports = router;
