const { sendError } = require('../utils/responseHandler');

const departmentMiddleware = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Unauthorized access', [], 401);
  }

  // Super admins have cross-department access
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Department managers and employees are restricted to their assigned department
  const reqDeptId = req.params.departmentId || req.query.departmentId || req.body.departmentId;

  if (reqDeptId && parseInt(reqDeptId, 10) !== req.user.departmentId) {
    return sendError(res, 'Forbidden. Access restricted to your own department data.', [], 403);
  }

  next();
};

module.exports = {
  departmentMiddleware,
};
