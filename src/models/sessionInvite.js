const mongoose = require('mongoose');

const sessionInviteSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  sessionId: {
    type: String,
    required: true
  },
  email: {
    type: String, 
    default: null
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

const SessionInvite = mongoose.model('SessionInvite', sessionInviteSchema);

module.exports = SessionInvite;
