import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Log error stack in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  }

  // Handle Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const val = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate value '${val}' for field '${field}'. Please use another value.`;
    errors = [{ field, message }];
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors || {}).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource ID: ${err.value}`;
    errors = [{ field: err.path, message }];
  }

  // Handle JSON parsing errors in body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body.';
  }

  // Ensure production never leaks unexpected internal stack traces
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'An unexpected server error occurred. Please try again later.';
  }

  return sendError(res, statusCode, message, errors);
};
