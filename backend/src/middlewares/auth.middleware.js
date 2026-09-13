const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/responseHandler');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access denied. No token provided.', [], 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired token.', [], 401);
  }
};

module.exports = {
  authMiddleware,
};
