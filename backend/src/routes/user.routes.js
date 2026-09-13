const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { createUserSchema, updateUserSchema, resetPasswordSchema } = require('../utils/zodSchemas');

// Super Admin only for all user management routes
router.use(authMiddleware, roleMiddleware('super_admin', 'department_manager'));

router.get('/', userController.getUsers);
router.post('/', validateBody(createUserSchema), userController.createUser);
router.put('/:id', validateBody(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/reset-password', validateBody(resetPasswordSchema), userController.resetPassword);

module.exports = router;
