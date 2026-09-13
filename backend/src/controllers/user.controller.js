const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/responseHandler');

const getUsers = async (req, res) => {
  const { departmentId, role, isActive, page, limit } = req.query;
  const effectiveDepartmentId = req.user.role === 'department_manager' ? req.user.departmentId : departmentId;

  const result = await userService.getAllUsers({
    departmentId: effectiveDepartmentId,
    role,
    isActive,
    page,
    limit,
  });

  return sendSuccess(res, result, 'Users fetched successfully');
};

const createUser = async (req, res) => {
  const user = await userService.createUser(req.body);
  return sendSuccess(res, user, 'User created successfully', 201);
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const updatedUser = await userService.updateUser(id, req.body);
  return sendSuccess(res, updatedUser, 'User updated successfully');
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const deactivatedUser = await userService.softDeleteUser(id);
  return sendSuccess(res, deactivatedUser, 'User deactivated successfully (soft delete)');
};

const resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const result = await userService.resetPassword(id, newPassword);
  return sendSuccess(res, result, 'User password reset successfully');
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
};
