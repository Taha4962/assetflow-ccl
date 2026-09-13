const prisma = require('../utils/prismaClient');

const findAllCurrentMonth = async (monthYear) => {
  return await prisma.departmentBudget.findMany({
    where: { monthYear },
    include: { department: { select: { name: true, code: true } } },
    orderBy: { department: { name: 'asc' } },
  });
};

const findByDepartmentAndMonth = async (departmentId, monthYear) => {
  return await prisma.departmentBudget.findUnique({
    where: {
      departmentId_monthYear: {
        departmentId: parseInt(departmentId, 10),
        monthYear,
      },
    },
    include: { department: { select: { name: true } } },
  });
};

const findHistoryByDepartment = async (departmentId) => {
  return await prisma.departmentBudget.findMany({
    where: { departmentId: parseInt(departmentId, 10) },
    orderBy: { monthYear: 'desc' },
    include: { department: { select: { name: true } } },
  });
};

const upsert = async (departmentId, monthYear, totalBudget) => {
  const existing = await prisma.departmentBudget.findUnique({
    where: {
      departmentId_monthYear: { departmentId: parseInt(departmentId, 10), monthYear },
    },
  });

  if (existing) {
    const newRemaining = totalBudget - Number(existing.usedBudget);
    return await prisma.departmentBudget.update({
      where: { id: existing.id },
      data: {
        totalBudget,
        remainingBudget: newRemaining,
      },
    });
  }

  return await prisma.departmentBudget.create({
    data: {
      departmentId: parseInt(departmentId, 10),
      monthYear,
      totalBudget,
      usedBudget: 0,
      remainingBudget: totalBudget,
    },
  });
};

const updateBudgetLimit = async (id, totalBudget) => {
  const existing = await prisma.departmentBudget.findUnique({ where: { id: parseInt(id, 10) } });
  if (!existing) return null;

  const newRemaining = totalBudget - Number(existing.usedBudget);
  return await prisma.departmentBudget.update({
    where: { id: existing.id },
    data: {
      totalBudget,
      remainingBudget: newRemaining,
    },
  });
};

const deductBudget = async (id, amount) => {
  const existing = await prisma.departmentBudget.findUnique({ where: { id: parseInt(id, 10) } });
  if (!existing) return null;

  const newUsed = Number(existing.usedBudget) + amount;
  const newRemaining = Number(existing.totalBudget) - newUsed;

  return await prisma.departmentBudget.update({
    where: { id: existing.id },
    data: {
      usedBudget: newUsed,
      remainingBudget: newRemaining,
    },
  });
};

module.exports = {
  findAllCurrentMonth,
  findByDepartmentAndMonth,
  findHistoryByDepartment,
  upsert,
  updateBudgetLimit,
  deductBudget,
};
