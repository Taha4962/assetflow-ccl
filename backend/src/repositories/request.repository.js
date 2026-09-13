const prisma = require('../utils/prismaClient');

const create = async (data) => {
  return await prisma.assetRequest.create({
    data,
    include: {
      department: { select: { id: true, name: true, code: true } },
      requester: { select: { id: true, fullName: true, email: true } },
    },
  });
};

const findAll = async (where = {}) => {
  return await prisma.assetRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      department: { select: { id: true, name: true, code: true } },
      requester: { select: { id: true, fullName: true, email: true } },
    },
  });
};

const findById = async (id) => {
  return await prisma.assetRequest.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      department: { select: { id: true, name: true, code: true } },
      requester: { select: { id: true, fullName: true, email: true } },
      purchaseDetail: true,
    },
  });
};

const updateStatus = async (id, status) => {
  return await prisma.assetRequest.update({
    where: { id: parseInt(id, 10) },
    data: { status },
    include: {
      department: { select: { id: true, name: true, code: true } },
      requester: { select: { id: true, fullName: true, email: true } },
    },
  });
};

const update = async (id, data) => {
  return await prisma.assetRequest.update({
    where: { id: parseInt(id, 10) },
    data,
    include: {
      department: { select: { id: true, name: true, code: true } },
      requester: { select: { id: true, fullName: true, email: true } },
    },
  });
};

const fulfilFromStockTransaction = async (requestId, stockItemId, quantityToFulfil, assetCode, unitPrice, budgetId, newUsedBudget, newRemainingBudget, userId, vendorName) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Deduct stock quantity
    await tx.stockInventory.update({
      where: { id: stockItemId },
      data: { quantity: { decrement: quantityToFulfil } }
    });

    // 2. Update Request Status
    const request = await tx.assetRequest.update({
      where: { id: requestId },
      data: { status: 'fulfilled_from_stock' }
    });

    // 3. Create Asset
    const asset = await tx.asset.create({
      data: {
        departmentId: request.departmentId,
        categoryId: (await tx.stockInventory.findUnique({ where: { id: stockItemId } })).categoryId,
        createdBy: userId,
        assetCode: assetCode,
        name: request.assetName,
        status: 'unassigned',
        condition: 'New'
      }
    });

    // 4. Create Purchase Detail
    await tx.purchaseDetail.create({
      data: {
        assetId: asset.id,
        requestId: requestId,
        purchasedBy: userId,
        vendorName: vendorName,
        invoiceNumber: `STOCK-FULFIL-${Date.now()}`,
        unitPrice: unitPrice,
        totalAmount: unitPrice * quantityToFulfil,
        quantity: quantityToFulfil,
        purchaseDate: new Date(),
        deliveryDate: new Date(),
        deliveryCondition: 'New',
        notes: 'Fulfilled directly from warehouse stock'
      }
    });

    // 5. Update Budget (if exists)
    if (budgetId) {
      await tx.departmentBudget.update({
        where: { id: budgetId },
        data: {
          usedBudget: newUsedBudget,
          remainingBudget: newRemainingBudget
        }
      });
    }

    // 6. Audit Log
    await tx.auditLog.create({
      data: {
        userId,
        assetId: asset.id,
        action: 'REQUEST_FULFILLED_FROM_STOCK',
        description: `Fulfilled ${quantityToFulfil}x ${request.assetName} from stock for Request #${requestId}`
      }
    });

    return { request, asset };
  });
};

module.exports = {
  create,
  findAll,
  findById,
  updateStatus,
  update,
  fulfilFromStockTransaction,
};
