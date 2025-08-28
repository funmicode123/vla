const Joi = require('joi');

// Joi schema for message creation
const messageSchema = Joi.object({
  conversationId: Joi.string().required(),
  senderId: Joi.string().required(),
  content: Joi.string().required(),
  messageType: Joi.string().valid('text', 'image', 'video', 'file').default('text'),
  attachments: Joi.array().items(Joi.string()).default([]),
});

class CreateMessageDTO {
  constructor({ conversationId, senderId, content, messageType = 'text', attachments = [] }) {
    const { error, value } = messageSchema.validate({ conversationId, senderId, content, messageType, attachments });
    if (error) {
      throw new Error(error.details[0].message);
    }

    this.conversationId = value.conversationId;
    this.senderId = value.senderId;
    this.content = value.content;
    this.messageType = value.messageType;
    this.attachments = value.attachments;
  }
}

module.exports = CreateMessageDTO;
