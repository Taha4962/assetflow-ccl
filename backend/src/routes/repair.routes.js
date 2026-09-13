const express = require('express');
const router = express.Router();
const repairController = require('../controllers/repair.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { raiseRepairSchema, updateRepairStatusSchema } = require('../utils/zodSchemas');

router.use(authMiddleware);

router.get('/stats', roleMiddleware('department_manager', 'super_admin'), repairController.getRepairStats);
router.get('/', repairController.getRepairRequests);
router.get('/:id', repairController.getRepairRequestById);

router.post(
  '/',
  roleMiddleware('employee', 'department_manager', 'super_admin'),
  validateBody(raiseRepairSchema),
  repairController.raiseRepairRequest
);

router.put(
  '/:id/status',
  roleMiddleware('maintenance_person', 'super_admin'),
  validateBody(updateRepairStatusSchema),
  repairController.updateRepairStatus
);

module.exports = router;
