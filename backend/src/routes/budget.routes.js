const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

router.use(authMiddleware);

// Super admin only routes
router.get('/', roleMiddleware('super_admin'), budgetController.getBudgets);
router.post('/', roleMiddleware('super_admin'), budgetController.createBudget);
router.put('/:id', roleMiddleware('super_admin'), budgetController.updateBudget);

// Department restricted routes
router.get('/department/:departmentId', roleMiddleware('super_admin', 'department_manager', 'purchase_person'), budgetController.getDepartmentBudget);
router.get('/department/:departmentId/history', roleMiddleware('super_admin', 'department_manager'), budgetController.getDepartmentBudgetHistory);

module.exports = router;
