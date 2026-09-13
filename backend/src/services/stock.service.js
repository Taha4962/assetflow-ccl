const stockRepository = require('../repositories/stock.repository');
const prisma = require('../utils/prismaClient');

const getStockItems = async (query) => {
  return await stockRepository.findAll(query);
};

const createStockItem = async (data, userId) => {
  const item = await stockRepository.create(data);
  
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'STOCK_CREATED',
      description: `Added new stock item: ${item.itemName} (Qty: ${item.quantity})`,
    },
  });

  return item;
};

const updateStockItem = async (id, data, userId) => {
  const item = await stockRepository.findById(id);
  if (!item) throw { statusCode: 404, message: 'Stock item not found' };

  // Remove quantity from update data to ensure it's not updated here
  const { quantity, ...updateData } = data;
  
  const updated = await stockRepository.update(id, updateData);

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'STOCK_UPDATED',
      description: `Updated stock item details: ${updated.itemName}`,
    },
  });

  return updated;
};

const updateStockQuantity = async (id, delta, reason, userId) => {
  const item = await stockRepository.findById(id);
  if (!item) throw { statusCode: 404, message: 'Stock item not found' };

  const newQuantity = item.quantity + delta;
  if (newQuantity < 0) {
    throw { statusCode: 400, message: 'Quantity cannot be less than zero' };
  }

  const updated = await stockRepository.updateQuantity(id, newQuantity);

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'STOCK_QUANTITY_UPDATED',
      description: `Stock quantity for ${updated.itemName} updated from ${item.quantity} to ${newQuantity}. Reason: ${reason}`,
    },
  });

  return updated;
};

module.exports = {
  getStockItems,
  createStockItem,
  updateStockItem,
  updateStockQuantity,
};
