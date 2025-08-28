const Message = require('../models/message');

class MessageRepository {
  async create(messageData) {
    const message = new Message(messageData);
    return await message.save();
  }

  async findById(messageId) {
    return await Message.findById(messageId)
      .populate('senderId', 'email');
  }

  async findAllByConversation(conversationId) {
    return await Message.find({conversationId })
      .sort({ timeStamp: 1 })
      .populate('senderId', 'email');
  }

  async markAsRead(messageId) {
    return await Message.findByIdAndUpdate(
      messageId,
      { read_at: new Date() },
      { new: true }
    );
  }

  async delete(messageId) {
    return await Message.findByIdAndDelete(messageId);
  }
}

module.exports = new MessageRepository();
