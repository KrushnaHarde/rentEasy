// routes/notification.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authentication.js');
const { 
    getUserNotifications,
    markAsRead,
    markAllAsRead, 
    deleteNotification 
} = require('../controllers/notificationController');

// Get all notifications for the current user

router.use(requireAuth("token"));

router.get('/',  getUserNotifications);
// Mark a notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Delete a notification
// router.delete('/:id', deleteNotification);

// routes/notificationRoutes.js


module.exports = router;