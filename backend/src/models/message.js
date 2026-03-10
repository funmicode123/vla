const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    default:uuidv4,
    unique: true
  },

  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },

  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  content: {
    type: String,
    default: '',
    trim: true
  },

  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file'],
    default: 'text'
  },

  attachments: {
    type: [String], 
    default: []
  },

  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },

  readAt: {
    type: Date
  },

  deleted: {
    type: Boolean,
    default: false
  },

  timestamp: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true 
});

// module.exports = mongoose.model('Message', messageSchema);
module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
