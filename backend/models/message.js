const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { 
    type: String, 
    required: true,
    index: true 
  },
  senderId: { 
    // type: mongoose.Schema.Types.ObjectId, 
    type: String,
    required: true,
    ref: 'User'
  },
  senderType: { 
    type: String, 
    enum: ['user', 'owner'], 
    required: true 
  },
  recipientId: { 
    // type: mongoose.Schema.Types.ObjectId, 
    type: String,
    required: true,
    ref: 'User'
  },
  // propertyId: { 
  //   type: mongoose.Schema.Types.ObjectId, 
  //   required: true,
  //   ref: 'Property'
  // },
  message: { 
    type: String, 
    required: true,
    trim: true 
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ conversationId: 1, timestamp: -1 });
messageSchema.index({ recipientId: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
