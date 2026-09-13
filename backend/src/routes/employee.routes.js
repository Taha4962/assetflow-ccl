const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

router.use(authMiddleware);

router.get('/:id/assets', roleMiddleware('department_manager', 'employee', 'super_admin'), employeeController.getEmployeeAssets);

module.exports = router;
