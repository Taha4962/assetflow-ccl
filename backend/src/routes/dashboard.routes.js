const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

router.use(authMiddleware);

router.get('/admin', roleMiddleware('super_admin'), dashboardController.adminDashboard);
router.get('/manager', roleMiddleware('department_manager', 'super_admin'), dashboardController.managerDashboard);
router.get('/purchase', roleMiddleware('purchase_person', 'super_admin'), dashboardController.purchaseDashboard);
router.get('/maintenance', roleMiddleware('maintenance_person', 'super_admin'), dashboardController.maintenanceDashboard);
router.get('/employee', roleMiddleware('employee', 'super_admin'), dashboardController.employeeDashboard);

module.exports = router;
