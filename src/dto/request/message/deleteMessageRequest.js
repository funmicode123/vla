const Joi = require('joi');

// Joi schema for message deletion
const deleteMessageSchema = Joi.object({
  conversationId: Joi.string().required(),
  messageId: Joi.string().required(),
});

class DeleteMessageDTO {
  constructor({ conversationId, messageId }) {
    const { error, value } = deleteMessageSchema.validate({ conversationId, messageId });
    if (error) {
      throw new Error(error.details[0].message);
    }

    this.conversationId = value.conversationId;
    this.messageId = value.messageId;
  }
}

module.exports = DeleteMessageDTO;
