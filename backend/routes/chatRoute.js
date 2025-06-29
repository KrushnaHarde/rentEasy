const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/authentication'); 

router.use(requireAuth('token'));

// Get conversations for a user
router.get('/conversations/:userId/:userType',ChatController.getConversations);     // wprked

// Get messages for a conversation
router.get('/messages/:conversationId', ChatController.getMessages);    // worked after // 

// Start new conversation
router.post('/conversations/start', ChatController.startConversation);      // worked - tested

// Get unread count
router.get('/unread-count/:userId/:userType', ChatController.getUnreadCount);       // worked - tested

// Mark conversation as read
router.put('/conversations/:conversationId/read', ChatController.markAsRead);

// Delete conversation
router.delete('/conversations/:conversationId', ChatController.deleteConversation);

module.exports = router;