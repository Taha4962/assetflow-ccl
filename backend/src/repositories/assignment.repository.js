const prisma = require('../utils/prismaClient');

const create = async (data) => {
  return await prisma.assetAssignment.create({
    data,
    include: {
      employee: { select: { id: true, fullName: true, email: true } },
      assignedBy: { select: { id: true, fullName: true } },
      asset: { select: { id: true, assetCode: true, name: true } },
    },
  });
};

const findCurrentByAsset = async (assetId) => {
  return await prisma.assetAssignment.findFirst({
    where: { assetId: parseInt(assetId, 10), isCurrent: true },
    include: {
      employee: { select: { id: true, fullName: true, email: true } },
      assignedBy: { select: { id: true, fullName: true } },
    },
  });
};

const findAllByAsset = async (assetId) => {
  return await prisma.assetAssignment.findMany({
    where: { assetId: parseInt(assetId, 10) },
    orderBy: { createdAt: 'desc' },
    include: {
      employee: { select: { id: true, fullName: true, email: true } },
      assignedBy: { select: { id: true, fullName: true } },
    },
  });
};

const findAllByEmployee = async (employeeId) => {
  return await prisma.assetAssignment.findMany({
    where: { employeeId: parseInt(employeeId, 10), isCurrent: true },
    orderBy: { createdAt: 'desc' },
    include: {
      asset: {
        include: {
          department: { select: { id: true, name: true, code: true } },
          category: { select: { id: true, name: true } },
        },
      },
    },
  });
};

const returnCurrent = async (assetId, returnedDate) => {
  return await prisma.assetAssignment.updateMany({
    where: { assetId: parseInt(assetId, 10), isCurrent: true },
    data: { isCurrent: false, returnedDate },
  });
};

module.exports = {
  create,
  findCurrentByAsset,
  findAllByAsset,
  findAllByEmployee,
  returnCurrent,
};
