const prisma = require('../utils/prismaClient');

const logAction = async ({ userId, assetId = null, action, description, ipAddress = null }) => {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        assetId,
        action,
        description,
        ipAddress,
      },
    });
  } catch (err) {
    console.error('AuditLog creation error:', err);
  }
};

module.exports = {
  logAction,
};
