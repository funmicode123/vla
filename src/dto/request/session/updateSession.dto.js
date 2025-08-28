const Joi = require('joi');

const UpdateSessionDTO = Joi.object({
  topic: Joi.string().min(3).max(100).optional(),
  startTime: Joi.date().iso().optional(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).optional()
}).min(1).messages({
  'object.min': 'At least one field (topic, startTime, or endTime) must be provided'
});

module.exports = UpdateSessionDTO;
