const prisma = require('../utils/prismaClient');

const create = async (data) => {
  return await prisma.disposalRecord.create({
    data,
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      disposer: { select: { id: true, fullName: true } },
    },
  });
};

const findAll = async (where = {}) => {
  return await prisma.disposalRecord.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      asset: {
        include: {
          department: { select: { id: true, name: true, code: true } },
          category: { select: { id: true, name: true } },
        },
      },
      disposer: { select: { id: true, fullName: true } },
    },
  });
};

const findById = async (id) => {
  return await prisma.disposalRecord.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      asset: true,
      disposer: { select: { id: true, fullName: true } },
    },
  });
};

module.exports = {
  create,
  findAll,
  findById,
};
