const repairRepo = require('../repositories/repair.repository');
const assetRepo = require('../repositories/asset.repository');
const assignmentRepo = require('../repositories/assignment.repository');
const userRepo = require('../repositories/user.repository');
const auditRepo = require('../repositories/audit.repository');
const prisma = require('../utils/prismaClient');

const raiseRepairRequest = async (user, body) => {
  const { assetId, issueDescription, urgency } = body;

  const asset = await assetRepo.findById(assetId);
  if (!asset) throw { statusCode: 404, message: 'Asset not found' };

  // Employee can only raise for assets assigned to them
  if (user.role === 'employee') {
    const currentAssignment = await assignmentRepo.findCurrentByAsset(assetId);
    if (!currentAssignment || currentAssignment.employeeId !== user.id) {
      throw { statusCode: 403, message: 'You can only raise repair requests for assets assigned to you' };
    }
  }

  if (asset.status === 'disposed') {
    throw { statusCode: 400, message: 'Cannot raise repair request for a disposed asset' };
  }

  // Auto-assign to the maintenance person in the system
  const maintenancePerson = await prisma.user.findFirst({
    where: { role: 'maintenance_person', isActive: true },
  });

  const repairRequest = await repairRepo.create({
    assetId: parseInt(assetId),
    raisedBy: user.id,
    handledBy: maintenancePerson ? maintenancePerson.id : null,
    issueDescription,
    urgency: urgency || 'medium',
    status: 'pending',
  });

  // Update asset status to under_maintenance
  await assetRepo.update(assetId, { status: 'under_maintenance' });

  await auditRepo.logAction({
    userId: user.id,
    assetId: parseInt(assetId),
    action: 'REPAIR_RAISED',
    description: `Repair request raised for asset ${asset.assetCode} by ${user.fullName}. Issue: ${issueDescription}`,
  });

  return repairRequest;
};

const getRepairRequests = async (user, query) => {
  const { status, urgency, assetId, page = 1, limit = 10 } = query;
  const where = {};

  if (status) where.status = status;
  if (urgency) where.urgency = urgency;
  if (assetId) where.assetId = parseInt(assetId);

  if (user.role === 'employee') {
    where.raisedBy = user.id;
  } else if (user.role === 'maintenance_person') {
    where.handledBy = user.id;
  } else if (user.role === 'department_manager') {
    where.asset = { departmentId: user.departmentId };
  }
  // super_admin sees all

  return await repairRepo.findAll({ where, page, limit });
};

const getRepairRequestById = async (user, id) => {
  const request = await repairRepo.findById(id);
  if (!request) throw { statusCode: 404, message: 'Repair request not found' };

  if (user.role === 'employee' && request.raisedBy !== user.id) {
    throw { statusCode: 403, message: 'Forbidden' };
  }
  if (user.role === 'department_manager' && request.asset.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden' };
  }

  return request;
};

const updateRepairStatus = async (user, id, body) => {
  const { status, resolutionNotes } = body;

  const request = await repairRepo.findById(id);
  if (!request) throw { statusCode: 404, message: 'Repair request not found' };

  const updateData = {
    status,
    resolutionNotes,
    handledBy: user.id,
  };

  if (status === 'resolved') {
    updateData.resolvedAt = new Date();
    // Restore asset to active
    await assetRepo.update(request.assetId, { status: 'active' });
  }

  const updated = await repairRepo.updateStatus(id, updateData);

  await auditRepo.logAction({
    userId: user.id,
    assetId: request.assetId,
    action: 'REPAIR_STATUS_UPDATED',
    description: `Repair request #${id} updated to "${status}" by ${user.fullName}`,
  });

  return updated;
};

const getRepairStats = async (user) => {
  const where = {};
  if (user.role === 'department_manager') {
    where.asset = { departmentId: user.departmentId };
  }
  return await repairRepo.getStats(where);
};

module.exports = {
  raiseRepairRequest,
  getRepairRequests,
  getRepairRequestById,
  updateRepairStatus,
  getRepairStats,
};
