const express = require('express');
const router = express.Router();
const controller = require('../controllers/bidController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.use(authenticateToken);

router.get('/', controller.getAllBids);
router.get('/check/:projectId', controller.checkBidStatus);
router.get('/project/:projectId', controller.getBidsByProject);
router.get('/:bidId', controller.getBidById);
router.put('/:bidId/reject', controller.rejectBid);
router.post('/', controller.createBid);
router.put('/:bidId', controller.updateBid);
router.delete('/:bidId', controller.deleteBid);

module.exports = router;
