const Joi = require('joi');

const createSessionDto = Joi.object({
  topic: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'Topic must be a string',
      'string.min': 'Topic must be at least 3 characters',
      'string.max': 'Topic must not exceed 100 characters',  
      'any.required': 'Topic is required'
    }),

  startTime: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.base': 'Start time must be a valid date',  
      'date.min': 'Start time cannot be in the past',
      'any.required': 'Start time is required'
    }),

  endTime: Joi.date()
    .required()
    .greater(Joi.ref('startTime'))
    .messages({
      'date.base': 'End time must be a valid date',
      'date.greater': 'End time must be after start time',
      'any.required': 'End time is required'
    }),

  // attendeeList: Joi.array()
  //   .max(50)
  //   .items(Joi.string().uuid({ version: 'uuidv4' }))
  //   .optional()
  //   .default([])
  //   .messages({
  //     'array.base': 'Attendee list must be an array',
  //     'array.max': 'Maximum 50 attendees allowed',  
  //     'string.guid': 'Each attendee ID must be a valid UUID v4'  
  //   })

  attendeeList: Joi.array()
    .max(50)
    .items(Joi.string().email())
    .optional()
    .default([])
    .messages({
      'array.base': 'Attendee list must be an array',
      'array.max': 'Maximum 50 attendees allowed',  
      'string.email': 'Each attendee must be a valid email address'  
    })
});

module.exports = createSessionDto;