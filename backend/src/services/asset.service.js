const assetRepo = require('../repositories/asset.repository');
const departmentRepo = require('../repositories/department.repository');
const auditRepo = require('../repositories/audit.repository');
const qrService = require('./qr.service');

const generateAssetCode = async (departmentId, year) => {
  const dept = await departmentRepo.findById(departmentId);
  if (!dept) throw { statusCode: 404, message: 'Department not found' };
  const seq = await assetRepo.getNextSequence(departmentId, year);
  const seqStr = String(seq).padStart(4, '0');
  return `CCL-${dept.code}-${year}-${seqStr}`;
};

const registerAsset = async (user, body) => {
  const {
    requestId, departmentId, categoryId,
    vendorName, vendorContact, invoiceNumber,
    unitPrice, totalAmount, quantity,
    purchaseDate, deliveryDate, deliveryCondition, notes,
  } = body;

  const year = new Date().getFullYear();
  const assetCode = await generateAssetCode(parseInt(departmentId), year);

  const asset = await assetRepo.create({
    assetCode,
    departmentId: parseInt(departmentId),
    categoryId: parseInt(categoryId),
    createdBy: user.id,
    name: `Asset ${assetCode}`, // Placeholder; manager completes in step 2
    status: 'delivered',
    purchaseDetail: {
      create: {
        purchasedBy: user.id,
        requestId: requestId ? parseInt(requestId) : null,
        vendorName,
        vendorContact,
        invoiceNumber,
        unitPrice: parseFloat(unitPrice),
        totalAmount: parseFloat(totalAmount),
        quantity: parseInt(quantity),
        purchaseDate: new Date(purchaseDate),
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        deliveryCondition,
        notes,
      },
    },
  });

  await auditRepo.logAction({
    userId: user.id,
    assetId: asset.id,
    action: 'ASSET_REGISTERED',
    description: `Asset ${assetCode} registered by ${user.fullName} (Step 1 - Financial Details)`,
  });

  return asset;
};

const completeAssetDetails = async (user, assetId, body) => {
  const asset = await assetRepo.findById(assetId);
  if (!asset) throw { statusCode: 404, message: 'Asset not found' };

  if (asset.status !== 'delivered') {
    throw { statusCode: 400, message: 'Asset details can only be completed when status is "delivered"' };
  }

  // Department manager can only update own department assets
  if (user.role === 'department_manager' && asset.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden: Asset belongs to another department' };
  }

  const { name, serialNumber, modelNumber, description, warrantyExpiry, condition, notes, categoryId } = body;

  const updated = await assetRepo.update(assetId, {
    name,
    serialNumber,
    modelNumber,
    description,
    warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
    condition,
    notes,
    categoryId: categoryId ? parseInt(categoryId) : asset.categoryId,
    status: 'unassigned',
  });

  await auditRepo.logAction({
    userId: user.id,
    assetId: asset.id,
    action: 'ASSET_DETAILS_COMPLETED',
    description: `Asset ${asset.assetCode} technical details completed by ${user.fullName} (Step 2 - Now Unassigned)`,
  });

  return updated;
};

const getAssets = async (user, query) => {
  const { status, categoryId, departmentId, page = 1, limit = 10, search } = query;

  const where = {};
  if (status) where.status = status;
  if (categoryId) where.categoryId = parseInt(categoryId);

  // Role-based filtering
  if (['department_manager', 'maintenance_person'].includes(user.role)) {
    where.departmentId = user.departmentId;
  } else if (user.role === 'purchase_person') {
    where.createdBy = user.id;
  } else if (user.role === 'employee') {
    // Employee sees assets assigned to them
    where.assignments = { some: { employeeId: user.id, isCurrent: true } };
  } else if (user.role === 'super_admin' && departmentId) {
    where.departmentId = parseInt(departmentId);
  }

  return await assetRepo.findAll({ where, page, limit, search });
};

const getAssetById = async (user, assetId) => {
  const asset = await assetRepo.findById(assetId);
  if (!asset) throw { statusCode: 404, message: 'Asset not found' };

  if (['department_manager', 'maintenance_person'].includes(user.role) && asset.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden: Asset belongs to another department' };
  }

  if (user.role === 'employee' && !asset.assignments.some((assignment) => (
    assignment.employeeId === user.id && assignment.isCurrent
  ))) {
    throw { statusCode: 403, message: 'Forbidden: Asset is not currently assigned to you' };
  }

  if (['super_admin', 'department_manager', 'purchase_person'].includes(user.role)) {
    return asset;
  }

  if (user.role === 'maintenance_person') {
    return {
      ...asset,
      purchaseDetail: asset.purchaseDetail && {
        ...asset.purchaseDetail,
        unitPrice: undefined,
        totalAmount: undefined,
        quantity: undefined,
      },
    };
  }

  return {
    ...asset,
    creator: undefined,
    purchaseDetail: undefined,
    auditLogs: undefined,
    disposalRecord: undefined,
    assignments: asset.assignments.filter((assignment) => (
      assignment.employeeId === user.id && assignment.isCurrent
    )),
    repairRequests: asset.repairRequests.filter((request) => request.raisedBy === user.id),
  };
};

const getAssetHistory = async (user, assetId) => {
  const asset = await assetRepo.findById(assetId);
  if (!asset) throw { statusCode: 404, message: 'Asset not found' };

  if (user.role === 'department_manager' && asset.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden' };
  }

  // Build a unified timeline from audit logs
  return asset.auditLogs;
};

const getAssetByCode = async (assetCode) => {
  const asset = await assetRepo.findByAssetCode(assetCode);
  if (!asset) throw { statusCode: 404, message: 'Asset not found for this QR code' };
  return asset;
};

const getQRCode = async (user, assetId) => {
  const asset = await assetRepo.findById(assetId);
  if (!asset) throw { statusCode: 404, message: 'Asset not found' };

  if (user.role === 'department_manager' && asset.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden' };
  }

  if (!asset.qrCode) {
    const qrBase64 = await qrService.generateQR(asset.assetCode);
    await assetRepo.update(assetId, { qrCode: qrBase64 });
    return qrBase64;
  }

  return asset.qrCode;
};

const updateNotes = async (user, assetId, notes) => {
  const asset = await assetRepo.findById(assetId);
  if (!asset) throw { statusCode: 404, message: 'Asset not found' };

  if (user.role === 'department_manager' && asset.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden' };
  }

  const updated = await assetRepo.update(assetId, { notes });

  await auditRepo.logAction({
    userId: user.id,
    assetId: asset.id,
    action: 'ASSET_NOTES_UPDATED',
    description: `Notes updated on asset ${asset.assetCode} by ${user.fullName}`,
  });

  return updated;
};

const getDisposedAssets = async (user, query) => {
  const where = {};
  if (user.role === 'department_manager') where.departmentId = user.departmentId;
  if (query.departmentId && user.role === 'super_admin') where.departmentId = parseInt(query.departmentId);
  return await assetRepo.findDisposed(where);
};

module.exports = {
  registerAsset,
  completeAssetDetails,
  getAssets,
  getAssetById,
  getAssetHistory,
  getAssetByCode,
  getQRCode,
  updateNotes,
  getDisposedAssets,
};
