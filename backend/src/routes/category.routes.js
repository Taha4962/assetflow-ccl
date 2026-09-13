const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { categorySchema } = require('../utils/zodSchemas');

router.use(authMiddleware);

// Accessible by all logged in users
router.get('/', categoryController.getCategories);

// Super Admin only
router.post('/', roleMiddleware('super_admin'), validateBody(categorySchema), categoryController.createCategory);
router.put('/:id', roleMiddleware('super_admin'), validateBody(categorySchema), categoryController.updateCategory);

module.exports = router;
