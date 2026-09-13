const prisma = require('../utils/prismaClient');

const getAdminStats = async () => {
  const [
    totalAssets,
    assetsByStatus,
    deptAssetCounts,
    usersByRole,
    pendingRepairs,
    recentAuditLogs,
    monthlyRegistrations,
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.asset.groupBy({
      by: ['departmentId'],
      _count: { departmentId: true },
    }),
    prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
    prisma.repairRequest.count({ where: { status: 'pending' } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, fullName: true } },
        asset: { select: { id: true, assetCode: true, name: true } },
      },
    }),
    // Last 6 months registration trend
    prisma.$queryRaw`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as month,
        DATE_TRUNC('month', "createdAt") as month_date,
        COUNT(*) as count
      FROM "Asset"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month_date ASC
    `,
  ]);

  // Enrich department asset counts with dept names
  const departments = await prisma.department.findMany({
    select: { id: true, name: true, code: true },
  });
  const deptMap = Object.fromEntries(departments.map((d) => [d.id, d]));

  return {
    totalAssets,
    assetsByStatus: assetsByStatus.map((s) => ({ status: s.status, count: s._count.status })),
    deptAssetCounts: deptAssetCounts.map((d) => ({
      department: deptMap[d.departmentId] || { name: 'Unknown' },
      count: d._count.departmentId,
    })),
    usersByRole: usersByRole.map((u) => ({ role: u.role, count: u._count.role })),
    pendingRepairs,
    recentAuditLogs,
    monthlyRegistrations: monthlyRegistrations.map((m) => ({
      month: m.month,
      count: Number(m.count),
    })),
  };
};

const getManagerStats = async (departmentId) => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const [
    totalAssets,
    assetsByStatus,
    assetsByCategory,
    unassignedAssets,
    pendingRepairs,
    warrantyExpiring,
  ] = await Promise.all([
    prisma.asset.count({ where: { departmentId } }),
    prisma.asset.groupBy({
      by: ['status'],
      where: { departmentId },
      _count: { status: true },
    }),
    prisma.asset.groupBy({
      by: ['categoryId'],
      where: { departmentId },
      _count: { categoryId: true },
    }),
    prisma.asset.findMany({
      where: { departmentId, status: 'unassigned' },
      include: { category: { select: { name: true } } },
      take: 10,
    }),
    prisma.repairRequest.count({
      where: {
        status: 'pending',
        asset: { departmentId },
      },
    }),
    prisma.asset.findMany({
      where: {
        departmentId,
        warrantyExpiry: { lte: thirtyDaysFromNow, gte: new Date() },
      },
      include: { category: { select: { name: true } } },
      orderBy: { warrantyExpiry: 'asc' },
    }),
  ]);

  const categories = await prisma.assetCategory.findMany({ select: { id: true, name: true } });
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  return {
    totalAssets,
    assetsByStatus: assetsByStatus.map((s) => ({ status: s.status, count: s._count.status })),
    assetsByCategory: assetsByCategory.map((c) => ({
      category: catMap[c.categoryId] || { name: 'Unknown' },
      count: c._count.categoryId,
    })),
    unassignedAssets,
    pendingRepairs,
    warrantyExpiring,
  };
};

const getPurchaseStats = async (purchasedBy) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [pendingRequests, monthlyAssets, monthlyValue, recentPurchases] = await Promise.all([
    prisma.assetRequest.count({ where: { status: 'pending' } }),
    prisma.asset.count({
      where: {
        createdBy: purchasedBy,
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.purchaseDetail.aggregate({
      where: {
        purchasedBy,
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
    }),
    prisma.asset.findMany({
      where: { createdBy: purchasedBy },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        department: { select: { name: true, code: true } },
        category: { select: { name: true } },
        purchaseDetail: true,
      },
    }),
  ]);

  return {
    pendingRequests,
    monthlyAssets,
    monthlyValue: monthlyValue._sum.totalAmount || 0,
    recentPurchases,
  };
};

const getMaintenanceStats = async (handledBy) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalHandled, pendingRequests, inProgressRequests, resolvedThisMonth, requestsByStatus, requestsByUrgency, recentRequests] =
    await Promise.all([
      prisma.repairRequest.count({ where: { handledBy } }),
      prisma.repairRequest.count({ where: { handledBy, status: 'pending' } }),
      prisma.repairRequest.count({ where: { handledBy, status: 'in_progress' } }),
      prisma.repairRequest.count({
        where: {
          handledBy,
          status: 'resolved',
          resolvedAt: { gte: startOfMonth },
        },
      }),
      prisma.repairRequest.groupBy({
        by: ['status'],
        where: { handledBy },
        _count: { status: true },
      }),
      prisma.repairRequest.groupBy({
        by: ['urgency'],
        where: { handledBy },
        _count: { urgency: true },
      }),
      prisma.repairRequest.findMany({
        where: { handledBy },
        orderBy: { raisedAt: 'desc' },
        take: 10,
        include: {
          asset: {
            include: {
              department: { select: { name: true, code: true } },
              category: { select: { name: true } },
            },
          },
          raiser: { select: { fullName: true } },
        },
      }),
    ]);

  return {
    totalHandled,
    pendingRequests,
    inProgressRequests,
    resolvedRequests: resolvedThisMonth,
    resolvedThisMonth,
    requestsByStatus: requestsByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
    })),
    requestsByUrgency: requestsByUrgency.map((item) => ({
      urgency: item.urgency,
      count: item._count.urgency,
    })),
    recentRequests,
  };
};

const getEmployeeStats = async (employeeId) => {
  const [assignedAssets, pendingRepairs, resolvedRepairs] = await Promise.all([
    prisma.assetAssignment.findMany({
      where: { employeeId, isCurrent: true },
      include: {
        asset: {
          include: {
            department: { select: { name: true, code: true } },
            category: { select: { name: true } },
          },
        },
      },
    }),
    prisma.repairRequest.findMany({
      where: { raisedBy: employeeId, status: { in: ['pending', 'in_progress'] } },
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        handler: { select: { fullName: true } },
      },
      orderBy: { raisedAt: 'desc' },
    }),
    prisma.repairRequest.findMany({
      where: { raisedBy: employeeId, status: 'resolved' },
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
      },
      orderBy: { resolvedAt: 'desc' },
      take: 5,
    }),
  ]);

  return { assignedAssets, pendingRepairs, resolvedRepairs };
};

module.exports = {
  getAdminStats,
  getManagerStats,
  getPurchaseStats,
  getMaintenanceStats,
  getEmployeeStats,
};
