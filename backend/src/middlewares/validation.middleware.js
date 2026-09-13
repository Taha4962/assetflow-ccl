const { sendError } = require('../utils/responseHandler');

const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err.errors) {
      const formattedErrors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return sendError(res, 'Validation error', formattedErrors, 400);
    }
    return sendError(res, err.message || 'Validation error', [], 400);
  }
};

module.exports = {
  validateBody,
};
