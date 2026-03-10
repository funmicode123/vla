const { required } = require('joi');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const conversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    unique: true,
    default: uuidv4,
    index: true
  },
  sessionId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    unique: true 
  },

  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }]
}, {timestamps: true });

conversationSchema.index({ conversationId: 1, participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
