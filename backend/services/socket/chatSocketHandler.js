const Message = require('../../models/message');
const Conversation = require('../../models/conversation');

class ChatSocketHandler {
  constructor(io) {
    this.io = io;
    this.activeUsers = new Map();
    this.userSockets = new Map(); // userId -> Set of socket IDs
    this.connectionTimeout = 30000; // 30 seconds
  }

  handleConnection(socket) {
    console.log('User connected:', socket.id);
    
    // Set connection timeout
    const timeout = setTimeout(() => {
      if (!this.activeUsers.has(socket.id)) {
        console.log('Connection timeout for socket:', socket.id);
        socket.disconnect(true);
      }
    }, this.connectionTimeout);

    // User joins their personal room
    socket.on('join', (userData) => {
      try {
        clearTimeout(timeout);
        this.handleUserJoin(socket, userData);
      } catch (error) {
        console.error('Error in join event:', error);
        socket.emit('join_error', { error: 'Failed to join' });
      }
    });

    // Join specific conversation
    socket.on('join_conversation', (conversationId) => {
      try {
        if (!conversationId || typeof conversationId !== 'string') {
          throw new Error('Invalid conversation ID');
        }
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
        socket.emit('joined_conversation', { conversationId });
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('join_conversation_error', { error: 'Failed to join conversation' });
      }
    });

    // Leave conversation
    socket.on('leave_conversation', (conversationId) => {
      try {
        if (!conversationId || typeof conversationId !== 'string') {
          throw new Error('Invalid conversation ID');
        }
        socket.leave(conversationId);
        console.log(`Socket ${socket.id} left conversation: ${conversationId}`);
        socket.emit('left_conversation', { conversationId });
      } catch (error) {
        console.error('Error leaving conversation:', error);
      }
    });

    // Handle sending messages
    socket.on('send_message', async (messageData) => {
      try {
        await this.handleSendMessage(socket, messageData);
      } catch (error) {
        console.error('Error handling send_message:', error);
        socket.emit('message_error', { 
          error: 'Failed to send message',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      try {
        this.handleTyping(socket, data);
      } catch (error) {
        console.error('Error handling typing:', error);
      }
    });

    // Handle marking messages as read
    socket.on('mark_read', async (data) => {
      try {
        await this.handleMarkRead(socket, data);
      } catch (error) {
        console.error('Error handling mark_read:', error);
        socket.emit('mark_read_error', { error: 'Failed to mark messages as read' });
      }
    });

    // Handle user status updates
    socket.on('update_status', (data) => {
      try {
        this.handleStatusUpdate(socket, data);
      } catch (error) {
        console.error('Error handling status update:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      clearTimeout(timeout);
      this.handleDisconnect(socket, reason);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.handleDisconnect(socket, 'error');
    });
  }

  handleUserJoin(socket, userData) {
    const { userId, userType, name } = userData;
    
    // Validate input
    if (!userId || !userType || !name) {
      console.error('Invalid user data:', userData);
      throw new Error('Missing required user data');
    }

    // Store user info
    this.activeUsers.set(socket.id, { 
      userId: String(userId), 
      userType, 
      name,
      joinedAt: new Date()
    });
    
    // Track user sockets with thread safety
    const userIdStr = String(userId);
    if (!this.userSockets.has(userIdStr)) {
      this.userSockets.set(userIdStr, new Set());
    }
    this.userSockets.get(userIdStr).add(socket.id);
    
    // Join user's personal room
    socket.join(`user_${userIdStr}`);
    
    console.log(`${userType} ${name} (${userIdStr}) joined`);
    
    // Notify user is online (only if first connection)
    if (this.userSockets.get(userIdStr).size === 1) {
      socket.broadcast.emit('user_online', { 
        userId: userIdStr, 
        userType, 
        name,
        timestamp: new Date()
      });
    }

    // Send confirmation to user
    socket.emit('join_success', { 
      userId: userIdStr,
      message: 'Successfully connected to chat'
    });
  }

  async handleSendMessage(socket, messageData) {
    const {
      senderId,
      senderType,
      recipientId,
      message,
      propertyTitle,
      messageType = 'text'
    } = messageData;

    // Enhanced validation
    if (!senderId || !recipientId) {
      throw new Error('Missing required message data: senderId, recipientId');
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('Message content is required and must be a non-empty string');
    }

    if (!['text', 'image', 'file'].includes(messageType)) {
      throw new Error('Invalid message type');
    }

    // Ensure IDs are strings for consistency
    const senderIdStr = String(senderId);
    const recipientIdStr = String(recipientId);

    // Generate conversation ID
    const conversationId = senderId.toString() < recipientId.toString() 
        ? `${senderId}_${recipientId}` 
        : `${recipientId}_${senderId}`;

    try {
      // AUTO-JOIN CONVERSATION ROOM - This is the fix!
      socket.join(conversationId);
      
      // Also make sure recipient joins if they're online
      if (this.isUserOnline(recipientIdStr)) {
        // Get recipient's sockets and make them join the conversation
        const recipientSockets = this.userSockets.get(recipientIdStr);
        if (recipientSockets) {
          recipientSockets.forEach(socketId => {
            const recipientSocket = this.io.sockets.sockets.get(socketId);
            if (recipientSocket) {
              recipientSocket.join(conversationId);
            }
          });
        }
      }

      // Create new message with error handling
      const newMessage = new Message({
        conversationId,
        senderId: senderIdStr,
        senderType,
        recipientId: recipientIdStr,
        message: message.trim(),
        messageType,
        timestamp: new Date(),
        isRead: false
      });

      const savedMessage = await newMessage.save();
      
      // Populate sender info with error handling
      await savedMessage.populate('senderId', 'name profilePicture').catch(err => {
        console.warn('Failed to populate sender info:', err);
      });

      // Update conversation
      const recipientType = senderType === 'user' ? 'owner' : 'user';
      
      await Conversation.findOneAndUpdate(
        { conversationId },
        {
          $set: {
            userId: senderType === 'user' ? senderIdStr : recipientIdStr,
            ownerId: senderType === 'owner' ? senderIdStr : recipientIdStr,
            propertyTitle: propertyTitle || 'Property',
            lastMessage: message.trim(),
            lastMessageTime: new Date(),
            lastMessageSender: senderIdStr,
            isActive: true
          },
          $inc: {
            [`unreadCount.${recipientType}`]: 1
          }
        },
        { upsert: true, new: true }
      );

      // Prepare message data for emission
      const messageResponse = {
        _id: savedMessage._id,
        conversationId,
        senderId: senderIdStr,
        senderType,
        recipientId: recipientIdStr,
        message: message.trim(),
        messageType,
        timestamp: savedMessage.timestamp,
        isRead: false,
        sender: savedMessage.senderId || { name: 'Unknown User' }
      };

      // Emit message to conversation room (now both users are in the room!)
      this.io.to(conversationId).emit('new_message', messageResponse);

      // ALSO emit directly to recipient's personal room as backup
      if (this.isUserOnline(recipientIdStr)) {
        this.io.to(`user_${recipientIdStr}`).emit('new_message', messageResponse);
        
        // Send notification too
        this.io.to(`user_${recipientIdStr}`).emit('message_notification', {
          conversationId,
          senderId: senderIdStr,
          senderType,
          senderName: savedMessage.senderId?.name || 'Unknown User',
          propertyTitle: propertyTitle || 'Property',
          message: message.trim(),
          timestamp: savedMessage.timestamp
        });
      }

      // Send delivery confirmation to sender
      socket.emit('message_sent', {
        messageId: savedMessage._id,
        conversationId,
        timestamp: savedMessage.timestamp,
        tempId: messageData.tempId
      });

      console.log(`Message sent in conversation ${conversationId}`);
      console.log(`Conversation room members:`, this.io.sockets.adapter.rooms.get(conversationId));

    } catch (dbError) {
      console.error('Database error in handleSendMessage:', dbError);
      throw new Error('Failed to save message to database');
    }
  }

  handleTyping(socket, data) {
    const { conversationId, userId, isTyping } = data;
    
    if (!conversationId || !userId) {
      return;
    }

    const userInfo = this.activeUsers.get(socket.id);
    
    if (userInfo) {
      socket.to(conversationId).emit('user_typing', {
        userId: String(userId),
        userName: userInfo.name,
        isTyping: Boolean(isTyping),
        timestamp: new Date()
      });
    }
  }

  async handleMarkRead(socket, data) {
    const { conversationId, userId, userType } = data;

    if (!conversationId || !userId || !userType) {
      throw new Error('Missing required data for mark_read');
    }

    const userIdStr = String(userId);

    try {
      // Update messages as read
      const updateResult = await Message.updateMany(
        { 
          conversationId, 
          recipientId: userIdStr,
          isRead: false 
        },
        { 
          isRead: true,
          readAt: new Date()
        }
      );

      // Reset unread count
      await Conversation.updateOne(
        { conversationId },
        { 
          $set: { [`unreadCount.${userType}`]: 0 }
        }
      );

      // Notify conversation participants
      this.io.to(conversationId).emit('messages_read', { 
        conversationId, 
        userId: userIdStr,
        readAt: new Date(),
        messagesCount: updateResult.modifiedCount
      });

      console.log(`Marked ${updateResult.modifiedCount} messages as read for user ${userIdStr}`);

    } catch (dbError) {
      console.error('Database error in handleMarkRead:', dbError);
      throw new Error('Failed to mark messages as read');
    }
  }

  handleStatusUpdate(socket, data) {
    const { status } = data;
    const validStatuses = ['online', 'away', 'busy', 'offline'];
    
    if (!validStatuses.includes(status)) {
      return;
    }

    const userInfo = this.activeUsers.get(socket.id);
    
    if (userInfo) {
      userInfo.status = status;
      userInfo.lastStatusUpdate = new Date();
      
      // Broadcast status to user's contacts
      socket.broadcast.emit('user_status_update', {
        userId: userInfo.userId,
        status,
        timestamp: new Date()
      });
    }
  }

  handleDisconnect(socket, reason) {
    const userInfo = this.activeUsers.get(socket.id);
    
    if (userInfo) {
      const { userId, name } = userInfo;
      
      // Remove socket from user's socket set
      if (this.userSockets.has(userId)) {
        this.userSockets.get(userId).delete(socket.id);
        
        // If no more sockets for this user, they're offline
        if (this.userSockets.get(userId).size === 0) {
          this.userSockets.delete(userId);
          socket.broadcast.emit('user_offline', { 
            userId, 
            name,
            timestamp: new Date()
          });
        }
      }
      
      this.activeUsers.delete(socket.id);
      console.log(`User disconnected: ${name} (${userId}), reason: ${reason}`);
    }
  }

  // Get online users
  getOnlineUsers() {
    const onlineUsers = new Map();
    this.activeUsers.forEach((userInfo) => {
      if (!onlineUsers.has(userInfo.userId)) {
        onlineUsers.set(userInfo.userId, {
          userId: userInfo.userId,
          userType: userInfo.userType,
          name: userInfo.name,
          status: userInfo.status || 'online',
          joinedAt: userInfo.joinedAt
        });
      }
    });
    return Array.from(onlineUsers.values());
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.userSockets.has(String(userId));
  }

  // Get user connection count
  getUserConnectionCount(userId) {
    const sockets = this.userSockets.get(String(userId));
    return sockets ? sockets.size : 0;
  }

  // Cleanup method for testing
  cleanup() {
    this.activeUsers.clear();
    this.userSockets.clear();
  }
}

module.exports = ChatSocketHandler;