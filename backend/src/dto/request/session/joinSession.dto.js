const Joi = require('joi');


const joinSessionDto = {
  params: Joi.object({
    token: Joi.string()
      .uuid({ version: 'uuidv4' }) 
      .required()
      .messages({
        'string.guid': 'Invite token must be a valid UUID',
        'any.required': 'Invite token is required',
      }),
  }),
  // body: Joi.object({
  //   email: Joi.string()
  //     .email()
  //     .max(100)
  //     .required()
  //     .messages({
  //       'string.email': 'Email must be a valid email address',
  //       'string.max': 'Email must not exceed 100 characters',
  //       'any.required': 'Email is required',
  //     }),
  // }),

};

module.exports = joinSessionDto;

