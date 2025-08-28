const Joi = require('joi');

// Validation schema using Joi
const conversationSchema = Joi.object({
  sessionId: Joi.string().required(),
  hostId: Joi.string().required(),
  participants: Joi.array().items(Joi.string()).required()
});

class CreateConversationDTO {
  constructor({sessionId, hostId, participants }) {
    // Validate input
    const { error, value } = conversationSchema.validate({sessionId, hostId, participants });
    if (error) {
      throw new Error(error.details[0].message);
    }

    this.sessionId = value.sessionId;
    this.hostId = value.hostId;
    this.participants = value.participants;
  }
}

module.exports = CreateConversationDTO;
