const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const { generateToken } = require('../utils/jwt');

const login = async (email, password) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  if (!user.isActive) {
    throw { statusCode: 403, message: 'Account is deactivated. Please contact your Super Administrator.' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  const token = generateToken(user);

  // Exclude passwordHash from returned user object
  const { passwordHash, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword,
  };
};

const getMe = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }
  return user;
};

const getDeveloperLoginAccounts = () => {
  if (process.env.NODE_ENV === 'production' || process.env.DEV_LOGIN_ENABLED !== 'true') {
    throw { statusCode: 404, message: 'Not found' };
  }

  try {
    const accounts = JSON.parse(process.env.DEV_LOGIN_ACCOUNTS || '[]');
    if (!Array.isArray(accounts)) throw new Error('Developer accounts must be an array');
    return accounts.map(({ label, email, password }) => ({ label, email, pass: password }));
  } catch (error) {
    throw { statusCode: 500, message: 'Developer login configuration is invalid' };
  }
};

module.exports = {
  login,
  getMe,
  getDeveloperLoginAccounts,
};
