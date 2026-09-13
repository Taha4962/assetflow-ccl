const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { departmentSchema, updateDepartmentSchema } = require('../utils/zodSchemas');

router.use(authMiddleware);

// Accessible by Super Admin and Department Manager
router.get('/', roleMiddleware('super_admin', 'department_manager', 'purchase_person'), departmentController.getDepartments);
router.get('/:id', roleMiddleware('super_admin', 'department_manager'), departmentController.getDepartmentById);
router.get('/:id/detail', roleMiddleware('super_admin'), departmentController.getDepartmentDetail);

// Super Admin only
router.post('/', roleMiddleware('super_admin'), validateBody(departmentSchema), departmentController.createDepartment);
router.put('/:id', roleMiddleware('super_admin'), validateBody(updateDepartmentSchema), departmentController.updateDepartment);

module.exports = router;
