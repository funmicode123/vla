class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);

    this.statusCode = typeof statusCode === "number" ? statusCode : 500;

    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";

    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);

    this.metadata = null;
  }

  withMetadata(metadata) {
    this.metadata = metadata;
    return this;
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflict occurred") {
    super(message, 409);
  }
}

class InternalServerError extends AppError {
  constructor(message = "Something went wrong") {
    super(message, 500);
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed", errors = []) {
    super(message, 422);
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json({
        message: err.message,
        errors: err.errors,
      });
    }
  }
}

module.exports = {
  AppError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
  ValidationError,
};
