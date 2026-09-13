const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { loginSchema } = require('../utils/zodSchemas');

const developerLoginConfigPath = process.env.DEV_LOGIN_CONFIG_PATH || '/developer-login-config';

router.post('/login', validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.getMe);
router.get(developerLoginConfigPath, authController.getDeveloperLoginAccounts);

module.exports = router;
