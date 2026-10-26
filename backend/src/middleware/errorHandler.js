export default function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let status = Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
    ? error.status
    : 500;

  let message = error.message || 'Internal server error.';

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    status = 400;
    message = Object.values(error.errors).map((val) => val.message).join(', ');
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (error.code === 11000) {
    status = 400;
    const field = Object.keys(error.keyValue || {})[0] || 'Field';
    message = `${field} already exists.`;
  }

  // Handle invalid Mongoose ObjectId
  if (error.name === 'CastError') {
    status = 404;
    message = `Resource not found with id of ${error.value}`;
  }

  if (status >= 500) {
    console.error('Request failed:', error.name);
    message = 'Something went wrong. Please try again.';
  }

  res.status(status).json({ message });
}
