const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const {
  registerAssetSchema,
  completeAssetDetailsSchema,
  assignAssetSchema,
  unassignAssetSchema,
  disposeAssetSchema,
  updateNotesSchema,
} = require('../utils/zodSchemas');

// Public endpoint — QR scan (no auth)
router.get('/scan/:assetCode', assetController.scanByCode);

// All routes below require authentication
router.use(authMiddleware);

// Asset list and create
router.get('/', assetController.getAssets);
router.get('/disposed', roleMiddleware('department_manager', 'super_admin'), assetController.getDisposed);

// Asset-specific routes
router.post(
  '/',
  roleMiddleware('purchase_person', 'super_admin'),
  validateBody(registerAssetSchema),
  assetController.registerAsset
);

router.get('/:id', assetController.getAssetById);
router.get('/:id/detail', assetController.getAssetById);
router.get('/:id/history', assetController.getAssetHistory);
router.get(
  '/:id/qr',
  roleMiddleware('department_manager', 'super_admin'),
  assetController.getQRCode
);

router.put(
  '/:id/details',
  roleMiddleware('department_manager', 'super_admin'),
  validateBody(completeAssetDetailsSchema),
  assetController.completeAssetDetails
);

router.put(
  '/:id/notes',
  roleMiddleware('department_manager', 'super_admin'),
  validateBody(updateNotesSchema),
  assetController.updateNotes
);

// Assignment routes
router.post(
  '/:id/assign',
  roleMiddleware('department_manager', 'super_admin'),
  validateBody(assignAssetSchema),
  assetController.assignAsset
);

router.post(
  '/:id/unassign',
  roleMiddleware('department_manager', 'super_admin'),
  validateBody(unassignAssetSchema),
  assetController.unassignAsset
);

router.get('/:id/assignments', assetController.getAssignmentHistory);

// Disposal
router.post(
  '/:id/dispose',
  roleMiddleware('department_manager', 'super_admin'),
  validateBody(disposeAssetSchema),
  assetController.disposeAsset
);

module.exports = router;
