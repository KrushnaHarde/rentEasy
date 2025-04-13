// controllers/notificationController.js
const Notification = require('../models/notification');
const mongoose = require("mongoose"); // Make sure it's imported

// Create a new notification
const createNotification = async (recipientId, title, message, type, rentalId = null, productId = null) => {
    try {
        return await Notification.create({
            recipient: recipientId,
            title,
            message,
            type,
            rentalId,
            productId
        });
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
    try {
        const user = req.user.id || req.user._id;
        const notifications = await Notification.find({ recipient: user })
            .sort('-createdAt')
            .limit(50);

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params._id);

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        if (notification.recipient.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: "Not authorized to update this notification" });
        }

        notification.isRead = true;
        await notification.save();

        res.json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
};

const markAllAsRead = async (req, res) => {
    try {

        const userId = new mongoose.Types.ObjectId(req.user.id); // Ensure ObjectId type
        const result = await Notification.updateMany(
            { recipient: userId, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ message: "All notifications marked as read", result });
    } catch (error) {
        res.status(500).json({ error: "Failed to mark notifications as read" });
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        if (notification.recipient.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: "Not authorized to delete this notification" });
        }

        await notification.remove();

        res.json({ message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete notification" });
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};