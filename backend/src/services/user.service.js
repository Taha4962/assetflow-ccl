const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');

const getAllUsers = async ({ departmentId, role, isActive, page = 1, limit = 10 }) => {
  const where = {};
  if (departmentId) where.departmentId = parseInt(departmentId, 10);
  if (role) where.role = role;
  if (isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true' || isActive === true;
  }

  return await userRepository.findAll({
    where,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });
};

const createUser = async ({ fullName, email, password, role, departmentId }) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw { statusCode: 400, message: 'Email address is already registered' };
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await userRepository.create({
    fullName,
    email,
    passwordHash,
    role,
    departmentId: parseInt(departmentId, 10),
    isActive: true,
  });

  return newUser;
};

const updateUser = async (id, data) => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw { statusCode: 404, message: 'User not found' };
  }

  const updatePayload = {};
  if (data.fullName !== undefined) updatePayload.fullName = data.fullName;
  if (data.role !== undefined) updatePayload.role = data.role;
  if (data.departmentId !== undefined) updatePayload.departmentId = parseInt(data.departmentId, 10);
  if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

  return await userRepository.update(id, updatePayload);
};

const softDeleteUser = async (id) => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw { statusCode: 404, message: 'User not found' };
  }
  return await userRepository.softDelete(id);
};

const resetPassword = async (id, newPassword) => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw { statusCode: 404, message: 'User not found' };
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  return await userRepository.updatePassword(id, passwordHash);
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  softDeleteUser,
  resetPassword,
};
