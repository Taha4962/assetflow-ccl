const assetRepo = require('../repositories/asset.repository');
const assignmentRepo = require('../repositories/assignment.repository');
const userRepo = require('../repositories/user.repository');
const auditRepo = require('../repositories/audit.repository');
const qrService = require('./qr.service');

const assignAsset = async (user, assetId, body) => {
  const { employeeId, assignedDate, notes } = body;

  const asset = await assetRepo.findById(assetId);
  if (!asset) throw { statusCode: 404, message: 'Asset not found' };

  if (!['unassigned', 'active'].includes(asset.status)) {
    throw { statusCode: 400, message: `Cannot assign asset with status "${asset.status}"` };
  }

  if (user.role === 'department_manager' && asset.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden: Asset belongs to another department' };
  }

  // Validate employee belongs to same department
  const employee = await userRepo.findById(employeeId);
  if (!employee) throw { statusCode: 404, message: 'Employee not found' };
  if (employee.departmentId !== asset.departmentId) {
    throw { statusCode: 400, message: 'Employee does not belong to this asset\'s department' };
  }
  if (employee.role !== 'employee') {
    throw { statusCode: 400, message: 'Can only assign assets to employees' };
  }

  // Close existing assignment if any
  if (asset.status === 'active') {
    await assignmentRepo.returnCurrent(assetId, new Date());
  }

  // Create new assignment
  const assignment = await assignmentRepo.create({
    assetId: parseInt(assetId),
    employeeId: parseInt(employeeId),
    assignedById: user.id,
    assignedDate: new Date(assignedDate),
    notes,
    isCurrent: true,
  });

  // Generate / regenerate QR code
  const qrBase64 = await qrService.generateQR(asset.assetCode);
  await assetRepo.update(assetId, { status: 'active', qrCode: qrBase64 });

  await auditRepo.logAction({
    userId: user.id,
    assetId: asset.id,
    action: 'ASSET_ASSIGNED',
    description: `Asset ${asset.assetCode} assigned to ${employee.fullName} by ${user.fullName}`,
  });

  return assignment;
};

const unassignAsset = async (user, assetId, notes) => {
  const asset = await assetRepo.findById(assetId);
  if (!asset) throw { statusCode: 404, message: 'Asset not found' };

  if (asset.status !== 'active') {
    throw { statusCode: 400, message: 'Asset is not currently assigned (status is not active)' };
  }

  if (user.role === 'department_manager' && asset.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden: Asset belongs to another department' };
  }

  await assignmentRepo.returnCurrent(assetId, new Date());
  await assetRepo.update(assetId, { status: 'unassigned' });

  await auditRepo.logAction({
    userId: user.id,
    assetId: asset.id,
    action: 'ASSET_UNASSIGNED',
    description: `Asset ${asset.assetCode} unassigned by ${user.fullName}. Reason: ${notes || 'N/A'}`,
  });

  return { message: 'Asset unassigned successfully' };
};

const getAssignmentHistory = async (user, assetId) => {
  const asset = await assetRepo.findById(assetId);
  if (!asset) throw { statusCode: 404, message: 'Asset not found' };

  if (user.role === 'department_manager' && asset.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden' };
  }

  return await assignmentRepo.findAllByAsset(assetId);
};

const getEmployeeAssets = async (user, employeeId) => {
  // Employee can only see their own assets
  if (user.role === 'employee' && user.id !== parseInt(employeeId)) {
    throw { statusCode: 403, message: 'Forbidden: You can only view your own assigned assets' };
  }

  const employee = await userRepo.findById(employeeId);
  if (!employee) throw { statusCode: 404, message: 'Employee not found' };

  // Dept manager can only see assets in their own dept
  if (user.role === 'department_manager' && employee.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden: Employee not in your department' };
  }

  return await assignmentRepo.findAllByEmployee(employeeId);
};

module.exports = {
  assignAsset,
  unassignAsset,
  getAssignmentHistory,
  getEmployeeAssets,
};
