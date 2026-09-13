const stockService = require('../services/stock.service');
const { sendSuccess } = require('../utils/responseHandler');

const getStockItems = async (req, res) => {
  const result = await stockService.getStockItems(req.query);
  return sendSuccess(res, result, 'Stock items fetched successfully');
};

const createStockItem = async (req, res) => {
  const item = await stockService.createStockItem(req.body, req.user.id);
  return sendSuccess(res, item, 'Stock item created successfully', 201);
};

const updateStockItem = async (req, res) => {
  const { id } = req.params;
  const item = await stockService.updateStockItem(id, req.body, req.user.id);
  return sendSuccess(res, item, 'Stock item updated successfully');
};

const updateStockQuantity = async (req, res) => {
  const { id } = req.params;
  const { delta, reason } = req.body;
  if (delta === undefined || !reason) {
    throw { statusCode: 400, message: 'Delta and reason are required' };
  }
  const item = await stockService.updateStockQuantity(id, parseInt(delta, 10), reason, req.user.id);
  return sendSuccess(res, item, 'Stock quantity updated successfully');
};

module.exports = {
  getStockItems,
  createStockItem,
  updateStockItem,
  updateStockQuantity,
};
