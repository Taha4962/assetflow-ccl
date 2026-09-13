const categoryService = require('../services/category.service');
const { sendSuccess } = require('../utils/responseHandler');

const getCategories = async (req, res) => {
  const categories = await categoryService.getAllCategories();
  return sendSuccess(res, categories, 'Categories fetched successfully');
};

const createCategory = async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return sendSuccess(res, category, 'Asset category created successfully', 201);
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.updateCategory(id, req.body);
  return sendSuccess(res, category, 'Asset category updated successfully');
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
};
