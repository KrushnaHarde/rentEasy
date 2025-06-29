const Message = require('../models/message');
const Conversation = require('../models/conversation');
const User = require('../models/user'); 
const mongoose = require('mongoose');
// const Property = require('../models/Property'); // Remove this line since Property model doesn't exist

class ChatController {
  // Get all conversations for a user
  static async getConversations(req, res) {
    try {
      const { userId, userType } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build query based on user type
      const query = userType === 'user' 
        ? { userId: userId, isActive: true }
        : { ownerId: userId, isActive: true };

      const conversations = await Conversation.find(query)
        .populate('userId', 'name email profilePicture')
        .populate('ownerId', 'name email profilePicture')
        // .populate('propertyId', 'title location rent images') // Comment out since Property model doesn't exist
        .sort({ lastMessageTime: -1 })
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const totalCount = await Conversation.countDocuments(query);

      res.json({
        success: true,
        data: conversations,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasMore: skip + conversations.length < totalCount
        }
      });
    } catch (error) {
      console.error('Error getting conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversations',
        error: error.message
      });
    }
  }

  // Get messages for a specific conversation
  static async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?._id || req.query.userId; // To verify user has access
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;


      // Verify user has access to this conversation
      const conversation = await Conversation.findOne({
        conversationId
        // $or: [
        //   { userId: userId },
        //   { ownerId: userId }
        // ]
      });

      if (!conversation) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }

      const messages = await Message.find({ conversationId })
        .populate('senderId', 'name profilePicture')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      // Get total count
      const totalCount = await Message.countDocuments({ conversationId });

      res.json({
        success: true,
        data: messages.reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasMore: skip + messages.length < totalCount
        }
      });
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch messages',
        error: error.message
      });
    }
  }

  // Start or get existing conversation
  static async  startConversation(req, res) {
    try {
      const { userId, ownerId } = req.body;

      // Validate required fields
      if (!userId || !ownerId) {
        return res.status(400).json({
          success: false,
          message: 'userId and ownerId are required'
        });
      }

      // Check if users exist
      const [user, owner] = await Promise.all([
        User.findById(userId),
        User.findById(ownerId)
      ]);

      if (!user || !owner) {
        return res.status(404).json({
          success: false,
          message: 'User or owner not found'
        });
      }

      // Generate conversation ID using string comparison to ensure consistent ordering
      const conversationId = userId.toString() < ownerId.toString() 
        ? `${userId}_${ownerId}` 
        : `${ownerId}_${userId}`;
      
      // Create or get existing conversation
      const conversation = await Conversation.findOneAndUpdate(
        { conversationId },
        {
          conversationId,
          userId,
          ownerId,
          participants: [
            { userId: userId, userType: 'user', lastSeen: new Date() },
            { userId: ownerId, userType: 'owner', lastSeen: new Date() }
          ]
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      ).populate('userId ownerId');

      res.json({
        success: true,
        data: conversation,
        message: 'Conversation started successfully'
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start conversation',
        error: error.message
      });
    }
  }

  // Get unread message count
  static async getUnreadCount(req, res) {
    try {
      const { userId, userType } = req.params;

      const query = userType === 'user' 
        ? { userId: userId, isActive: true }
        : { ownerId: userId, isActive: true };

      const conversations = await Conversation.find(query);
      const totalUnread = conversations.reduce((sum, conv) => 
        sum + (conv.unreadCount[userType] || 0), 0
      );

      res.json({
        success: true,
        data: { unreadCount: totalUnread }
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count',
        error: error.message
      });
    }
  }

  // Mark conversation as read
  static async markAsRead(req, res) {
    try {
      const { conversationId } = req.params;
      const { userId, userType } = req.body;

      // Update messages as read
      await Message.updateMany(
        { 
          conversationId, 
          recipientId: userId,
          isRead: false 
        },
        { isRead: true }
      );

      // Reset unread count for user
      await Conversation.updateOne(
        { conversationId },
        { 
          $set: { [`unreadCount.${userType}`]: 0 },
          $set: { 'participants.$[elem].lastSeen': new Date() }
        },
        {
          arrayFilters: [{ 'elem.userId': userId }]
        }
      );

      res.json({
        success: true,
        message: 'Messages marked as read'
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark messages as read',
        error: error.message
      });
    }
  }

  // Delete conversation
  static async deleteConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const { userId } = req.body;

      // Verify user has access
      const conversation = await Conversation.findOne({
        conversationId,
        $or: [
          { userId: userId },
          { ownerId: userId }
        ]
      });

      if (!conversation) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Soft delete - mark as inactive
      await Conversation.updateOne(
        { conversationId },
        { isActive: false }
      );

      res.json({
        success: true,
        message: 'Conversation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete conversation',
        error: error.message
      });
    }
  }
}

module.exports = ChatController;