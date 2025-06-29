const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  conversationId: { 
    type: String, 
    unique: true, 
    required: true,
    index: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  // propertyId: { 
  //   type: mongoose.Schema.Types.ObjectId, 
  //   required: true,
  //   ref: 'Property'
  // },
  // propertyTitle: { 
  //   type: String, 
  //   required: true 
  // },
  lastMessage: { 
    type: String,
    default: ''
  },
  lastMessageTime: { 
    type: Date, 
    default: Date.now 
  },
  lastMessageSender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  unreadCount: {
    user: { type: Number, default: 0 },
    owner: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userType: {
      type: String,
      enum: ['user', 'owner']
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
conversationSchema.index({ userId: 1, lastMessageTime: -1 });
conversationSchema.index({ ownerId: 1, lastMessageTime: -1 });
conversationSchema.index({ propertyId: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
