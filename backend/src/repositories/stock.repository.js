const prisma = require('../utils/prismaClient');

const findAll = async ({ page = 1, limit = 10, categoryId, search }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {};
  if (categoryId) {
    where.categoryId = parseInt(categoryId, 10);
  }
  if (search) {
    where.itemName = { contains: search, mode: 'insensitive' };
  }

  const [items, total] = await Promise.all([
    prisma.stockInventory.findMany({
      where,
      skip,
      take,
      orderBy: { itemName: 'asc' },
      include: {
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.stockInventory.count({ where }),
  ]);

  return {
    items: items.map(i => ({ ...i, isLowStock: i.quantity < 5 })),
    total,
    page: parseInt(page),
    limit: parseInt(limit),
  };
};

const findById = async (id) => {
  return await prisma.stockInventory.findUnique({
    where: { id: parseInt(id, 10) },
    include: { category: true },
  });
};

const create = async (data) => {
  return await prisma.stockInventory.create({
    data,
    include: { category: true },
  });
};

const update = async (id, data) => {
  return await prisma.stockInventory.update({
    where: { id: parseInt(id, 10) },
    data,
    include: { category: true },
  });
};

const updateQuantity = async (id, quantity) => {
  return await prisma.stockInventory.update({
    where: { id: parseInt(id, 10) },
    data: { quantity: parseInt(quantity, 10) },
    include: { category: true },
  });
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  updateQuantity,
};
