const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const sessionSchema = new mongoose.Schema({
  id: {
    type: String,
    default: ()=> uuidv4(),
    unique: true
  },
  topic: {
    type: String,
    required: true
  },
  host: {
    type: String,
    ref: 'User',
    required: true
  },
  attendeeList: {
    type: [String],
    lowercase: true,
    trim: true,
    validate: {
      validator: emails => emails.every(email => /^\S+@\S+\.\S+$/.test(email)),
      message: props => `Invalid emails found: ${props.value}`
    },
    default: []
  },

  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  conversationId: {
    type: String,
    ref: 'Conversation',
    unique: true,
    default: uuidv4,
    index: true
  },
  channelId: {
    type: String,
    unique: true,
    required: true,
    index: true,
    default: function () {
    return `session-${this.id}`;
  }
}

}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
