const Joi = require('joi');
const { BadRequestError } = require('../utils/customErrors');

function joinValidateRequest(schema) {
  return (req, res, next) => {
    const validationTarget = {};
    
    if (schema.body) validationTarget.body = req.body;
    if (schema.params) validationTarget.params = req.params;
    if (schema.query) validationTarget.query = req.query;

    const { error, value } = Joi.compile(schema).validate(validationTarget, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map(detail => {
        const path = detail.path.join('.');
        return `${path}: ${detail.message.replace(/"/g, "'")}`;
      }).join('; ');

      return next(new BadRequestError(errorMessage));
    }

    if (value.body) req.body = value.body;
    if (value.params) req.params = value.params;
    if (value.query) req.query = value.query;

    next();
  };
}

module.exports = joinValidateRequest;
