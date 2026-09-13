const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/responseHandler');

const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return sendSuccess(res, result, 'Login successful');
};

const logout = async (req, res) => {
  return sendSuccess(res, null, 'Logout successful. Client token cleared.');
};

const getMe = async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return sendSuccess(res, user, 'Current user profile fetched successfully');
};

const getDeveloperLoginAccounts = async (req, res) => {
  const accounts = authService.getDeveloperLoginAccounts();
  return sendSuccess(res, accounts, 'Developer login configuration fetched successfully');
};

module.exports = {
  login,
  logout,
  getMe,
  getDeveloperLoginAccounts,
};
