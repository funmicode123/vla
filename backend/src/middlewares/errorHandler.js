const { AppError } = require('../utils/customErrors');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err); 

  const status = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  return res.status(status).json({message});
}

module.exports = errorHandler;
