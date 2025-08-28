const Joi = require('joi');

const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
  }),

  password: Joi.string()
    .min(6)
    .max(30)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must be less than 30 characters',
    }),
    
});

module.exports = {
  signupSchema
};
