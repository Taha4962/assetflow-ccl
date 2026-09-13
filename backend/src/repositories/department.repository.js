const prisma = require('../utils/prismaClient');

const findAllWithAssetCount = async () => {
  return await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          assets: true,
          users: true,
          requests: true,
        },
      },
    },
  });
};

const findById = async (id) => {
  return await prisma.department.findUnique({
    where: { id: parseInt(id, 10) },
  });
};

const findByIdWithDetails = async (id) => {
  const deptId = parseInt(id, 10);
  const department = await prisma.department.findUnique({
    where: { id: deptId },
    include: {
      users: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          assets: true,
          requests: true,
        },
      },
    },
  });

  if (!department) return null;

  // Group asset summary counts by status
  const assetStatusGroup = await prisma.asset.groupBy({
    by: ['status'],
    where: { departmentId: deptId },
    _count: {
      status: true,
    },
  });

  const assetSummary = assetStatusGroup.reduce((acc, curr) => {
    acc[curr.status] = curr._count.status;
    return acc;
  }, {});

  return {
    ...department,
    assetSummary,
  };
};

const getDepartmentDetailedView = async (id, currentMonthYear) => {
  const deptId = parseInt(id, 10);
  const department = await prisma.department.findUnique({
    where: { id: deptId },
    include: {
      users: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
      assets: {
        include: {
          category: { select: { name: true } },
          assignments: {
            where: { isCurrent: true },
            include: { employee: { select: { fullName: true } } }
          }
        }
      },
      budgets: {
        where: { monthYear: currentMonthYear },
      },
    },
  });

  if (!department) return null;

  // Asset Count by Status
  const assetStatusGroup = await prisma.asset.groupBy({
    by: ['status'],
    where: { departmentId: deptId },
    _count: { status: true },
  });
  const assetSummary = assetStatusGroup.reduce((acc, curr) => {
    acc[curr.status] = curr._count.status;
    return acc;
  }, {});

  // Asset Count by Category
  const assetCategoryGroup = await prisma.asset.groupBy({
    by: ['categoryId'],
    where: { departmentId: deptId },
    _count: { categoryId: true },
  });
  
  // Pending repairs count
  const pendingRepairs = await prisma.repairRequest.count({
    where: {
      asset: { departmentId: deptId },
      status: 'pending'
    }
  });

  // Recent Audit Logs
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      user: { departmentId: deptId }
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: { select: { fullName: true } },
      asset: { select: { name: true, assetCode: true } }
    }
  });

  return {
    ...department,
    assetSummary,
    assetCategoryGroup,
    pendingRepairs,
    auditLogs
  };
};

const findByNameOrCode = async (name, code) => {
  return await prisma.department.findFirst({
    where: {
      OR: [{ name }, { code }],
    },
  });
};

const create = async (data) => {
  return await prisma.department.create({
    data,
  });
};

const update = async (id, data) => {
  return await prisma.department.update({
    where: { id: parseInt(id, 10) },
    data,
  });
};

module.exports = {
  findAllWithAssetCount,
  findById,
  findByIdWithDetails,
  getDepartmentDetailedView,
  findByNameOrCode,
  create,
  update,
};
