const Joi = require('joi');

const loginRequestDto = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
    'any.required': 'Email is required'
  }),

  password: Joi.string().min(6).max(30).required().messages({
    'string.empty': 'Password cannot be empty',
    'string.min': 'Password must be at least 6 characters',
    'string.max': 'Password must not exceed 30 characters',
    'any.required': 'Password is required'
  })
});

module.exports = loginRequestDto ;
