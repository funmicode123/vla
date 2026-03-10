const { BadRequestError } = require('../utils/customErrors');

function validateRequest(schema) {
  return (req, res, next) => {
    console.log("🟡 Incoming req.body:", req.body);
    console.log("🟡 Incoming req.file:", req.file); 

    const parsedBody = {
      ...req.body,
      profilePic: req.file,
    };

    const { error, value } = schema.validate(parsedBody, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    });

    if (error) {
      console.log("❌ Joi Validation Error:", error.details);
      const errorMessage = error.details.map(detail => {
        const path = detail.path.join('.');
        return `${path}: ${detail.message.replace(/"/g, "'")}`;
      }).join('; ');

      return next(new BadRequestError(errorMessage));
    }

    req.body = value;
    next();
  };
}

module.exports = validateRequest;
