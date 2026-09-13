const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { assetRequestSchema, updateRequestStatusSchema } = require('../utils/zodSchemas');

router.use(authMiddleware);

// Department Manager or Super Admin creates request
router.post('/', roleMiddleware('department_manager', 'super_admin'), validateBody(assetRequestSchema), requestController.createRequest);

// List requests based on role
router.get('/', requestController.getRequests);

// Get single request
router.get('/:id', requestController.getRequestById);

// Purchase Person or Super Admin updates status
router.put('/:id/status', roleMiddleware('purchase_person', 'super_admin'), validateBody(updateRequestStatusSchema), requestController.updateRequestStatus);

// Phase 3: Updated Purchase Workflow
router.put('/:id/add-costing', roleMiddleware('purchase_person', 'super_admin'), requestController.addCosting);
router.put('/:id/approve', roleMiddleware('department_manager', 'super_admin'), requestController.approveRequest);
router.put('/:id/edit-and-resubmit', roleMiddleware('department_manager', 'super_admin'), requestController.editAndResubmitRequest);
router.put('/:id/reject', roleMiddleware('department_manager', 'super_admin'), requestController.rejectRequest);

// Phase 3: Fulfil from Stock
router.post('/:id/fulfil-from-stock', roleMiddleware('purchase_person', 'super_admin'), requestController.fulfilFromStock);

module.exports = router;
