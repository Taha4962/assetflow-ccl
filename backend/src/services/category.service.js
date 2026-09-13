const categoryRepository = require('../repositories/category.repository');

const getAllCategories = async () => {
  return await categoryRepository.findAll();
};

const createCategory = async (data) => {
  const existing = await categoryRepository.findByName(data.name);
  if (existing) {
    throw { statusCode: 400, message: 'Asset category with this name already exists' };
  }
  return await categoryRepository.create(data);
};

const updateCategory = async (id, data) => {
  return await categoryRepository.update(id, data);
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
};
