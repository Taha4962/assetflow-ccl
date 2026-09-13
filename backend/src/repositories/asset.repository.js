const prisma = require('../utils/prismaClient');

// Get next sequence number for asset code generation
const getNextSequence = async (departmentId, year) => {
  const count = await prisma.asset.count({
    where: {
      departmentId,
      assetCode: { contains: `-${year}-` },
    },
  });
  return count + 1;
};

const create = async (data) => {
  return await prisma.asset.create({
    data,
    include: {
      department: { select: { id: true, name: true, code: true } },
      category: { select: { id: true, name: true } },
      creator: { select: { id: true, fullName: true } },
      purchaseDetail: true,
    },
  });
};

const findById = async (id) => {
  return await prisma.asset.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      department: true,
      category: true,
      creator: { select: { id: true, fullName: true, email: true } },
      purchaseDetail: {
        include: {
          purchaser: { select: { id: true, fullName: true } },
          request: true,
        },
      },
      assignments: {
        include: {
          employee: { select: { id: true, fullName: true, email: true } },
          assignedBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      repairRequests: {
        include: {
          raiser: { select: { id: true, fullName: true } },
          handler: { select: { id: true, fullName: true } },
        },
        orderBy: { raisedAt: 'desc' },
      },
      disposalRecord: {
        include: {
          disposer: { select: { id: true, fullName: true } },
        },
      },
      auditLogs: {
        include: { user: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });
};

const findByAssetCode = async (assetCode) => {
  return await prisma.asset.findUnique({
    where: { assetCode },
    include: {
      department: { select: { id: true, name: true, code: true } },
      category: { select: { id: true, name: true } },
      assignments: {
        where: { isCurrent: true },
        include: {
          employee: { select: { id: true, fullName: true, email: true } },
        },
      },
    },
  });
};

const findAll = async ({ where = {}, page = 1, limit = 10, search }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const baseWhere = { ...where };
  if (search) {
    baseWhere.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { assetCode: { contains: search, mode: 'insensitive' } },
      { serialNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where: baseWhere,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        department: { select: { id: true, name: true, code: true } },
        category: { select: { id: true, name: true } },
        assignments: {
          where: { isCurrent: true },
          include: {
            employee: { select: { id: true, fullName: true } },
          },
        },
      },
    }),
    prisma.asset.count({ where: baseWhere }),
  ]);

  return { assets, total, page: parseInt(page), limit: parseInt(limit) };
};

const update = async (id, data) => {
  return await prisma.asset.update({
    where: { id: parseInt(id, 10) },
    data,
    include: {
      department: { select: { id: true, name: true, code: true } },
      category: { select: { id: true, name: true } },
    },
  });
};

const findDisposed = async (where = {}) => {
  return await prisma.asset.findMany({
    where: { ...where, status: 'disposed' },
    orderBy: { updatedAt: 'desc' },
    include: {
      department: { select: { id: true, name: true, code: true } },
      category: { select: { id: true, name: true } },
      disposalRecord: {
        include: { disposer: { select: { id: true, fullName: true } } },
      },
    },
  });
};

module.exports = {
  getNextSequence,
  create,
  findById,
  findByAssetCode,
  findAll,
  update,
  findDisposed,
};
