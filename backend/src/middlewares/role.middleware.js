const { sendError } = require('../utils/responseHandler');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized access', [], 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`, [], 403);
    }

    next();
  };
};

module.exports = {
  roleMiddleware,
};
