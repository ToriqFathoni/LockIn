const express = require('express');
const router = express.Router();
const controller = require('../controllers/chatController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);


router.post('/', controller.createConversation);
router.get('/', controller.getConversations);
router.get('/:conversationId/messages', controller.getMessages);
router.post('/:conversationId/messages', controller.sendMessage);

module.exports = router;
