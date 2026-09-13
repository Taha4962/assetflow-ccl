const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

router.use(authMiddleware);

// All stock routes are accessible to purchase_person and super_admin
router.use(roleMiddleware('purchase_person', 'super_admin'));

router.get('/', stockController.getStockItems);
router.post('/', stockController.createStockItem);
router.put('/:id', stockController.updateStockItem);
router.put('/:id/quantity', stockController.updateStockQuantity);

module.exports = router;
