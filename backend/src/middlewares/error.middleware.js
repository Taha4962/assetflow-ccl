const { sendError } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [err.stack || 'Unexpected error occurred'];

  return sendError(res, message, errors, statusCode);
};

module.exports = {
  errorHandler,
};
