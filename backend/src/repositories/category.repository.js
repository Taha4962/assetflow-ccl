const prisma = require('../utils/prismaClient');

const findAll = async () => {
  return await prisma.assetCategory.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          assets: true,
        },
      },
    },
  });
};

const findByName = async (name) => {
  return await prisma.assetCategory.findUnique({
    where: { name },
  });
};

const create = async (data) => {
  return await prisma.assetCategory.create({
    data,
  });
};

const update = async (id, data) => {
  return await prisma.assetCategory.update({
    where: { id: parseInt(id, 10) },
    data,
  });
};

module.exports = {
  findAll,
  findByName,
  create,
  update,
};
