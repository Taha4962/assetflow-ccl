const prisma = require('../utils/prismaClient');

const create = async (data) => {
  return await prisma.repairRequest.create({
    data,
    include: {
      asset: { select: { id: true, assetCode: true, name: true, departmentId: true } },
      raiser: { select: { id: true, fullName: true, email: true } },
      handler: { select: { id: true, fullName: true } },
    },
  });
};

const findById = async (id) => {
  return await prisma.repairRequest.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      asset: {
        include: {
          department: { select: { id: true, name: true, code: true } },
          category: { select: { id: true, name: true } },
        },
      },
      raiser: { select: { id: true, fullName: true, email: true } },
      handler: { select: { id: true, fullName: true, email: true } },
    },
  });
};

const findAll = async ({ where = {}, page = 1, limit = 10 }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [requests, total] = await Promise.all([
    prisma.repairRequest.findMany({
      where,
      skip,
      take,
      orderBy: { raisedAt: 'desc' },
      include: {
        asset: {
          include: {
            department: { select: { id: true, name: true, code: true } },
            category: { select: { id: true, name: true } },
          },
        },
        raiser: { select: { id: true, fullName: true } },
        handler: { select: { id: true, fullName: true } },
      },
    }),
    prisma.repairRequest.count({ where }),
  ]);

  return { requests, total, page: parseInt(page), limit: parseInt(limit) };
};

const updateStatus = async (id, data) => {
  return await prisma.repairRequest.update({
    where: { id: parseInt(id, 10) },
    data,
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      raiser: { select: { id: true, fullName: true } },
      handler: { select: { id: true, fullName: true } },
    },
  });
};

const getStats = async (where = {}) => {
  const [total, pending, in_progress, resolved] = await Promise.all([
    prisma.repairRequest.count({ where }),
    prisma.repairRequest.count({ where: { ...where, status: 'pending' } }),
    prisma.repairRequest.count({ where: { ...where, status: 'in_progress' } }),
    prisma.repairRequest.count({ where: { ...where, status: 'resolved' } }),
  ]);
  return { total, pending, in_progress, resolved };
};

module.exports = {
  create,
  findById,
  findAll,
  updateStatus,
  getStats,
};
