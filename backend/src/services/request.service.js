const requestRepository = require('../repositories/request.repository');
const budgetRepository = require('../repositories/budget.repository');
const stockRepository = require('../repositories/stock.repository');
const assetRepository = require('../repositories/asset.repository');
const prisma = require('../utils/prismaClient');

const createRequest = async (user, { assetName, quantity, reason }) => {
  return await requestRepository.create({
    departmentId: user.departmentId,
    requestedBy: user.id,
    assetName,
    quantity: parseInt(quantity, 10),
    reason,
    status: 'pending',
  });
};

const getRequests = async (user, statusFilter) => {
  const where = {};

  if (statusFilter) {
    where.status = statusFilter;
  }

  if (user.role === 'department_manager') {
    where.departmentId = user.departmentId;
  } else if (user.role === 'purchase_person') {
    // Purchase person sees all requests (or filtered by pending/approved/purchased/delivered)
    if (!statusFilter) {
      // Return all requests or pending/approved by default
    }
  } else if (user.role === 'employee') {
    where.requestedBy = user.id;
  }

  return await requestRepository.findAll(where);
};

const getRequestById = async (id, user) => {
  const request = await requestRepository.findById(id);
  if (!request) {
    throw { statusCode: 404, message: 'Asset request not found' };
  }

  if (user.role === 'department_manager' && request.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden. Cannot access request from another department.' };
  }

  return request;
};

const updateRequestStatus = async (id, status, user) => {
  const request = await requestRepository.findById(id);
  if (!request) {
    throw { statusCode: 404, message: 'Asset request not found' };
  }

  const validStatuses = ['pending', 'approved', 'purchased', 'delivered'];
  if (!validStatuses.includes(status)) {
    throw { statusCode: 400, message: 'Invalid status value' };
  }

  return await requestRepository.updateStatus(id, status);
};

const addCosting = async (id, estimatedCost, costNote, user) => {
  const request = await requestRepository.findById(id);
  if (!request) throw { statusCode: 404, message: 'Request not found' };
  if (request.status !== 'pending') throw { statusCode: 400, message: 'Only pending requests can have costing added' };

  const updated = await requestRepository.update(id, {
    estimatedCost: parseFloat(estimatedCost),
    costNote,
    status: 'awaiting_approval'
  });

  await prisma.auditLog.create({
    data: { userId: user.id, action: 'COST_SUBMITTED', description: `Costing added for Request #${id}` }
  });

  return updated;
};

const approveRequest = async (id, user) => {
  const request = await requestRepository.findById(id);
  if (!request) throw { statusCode: 404, message: 'Request not found' };
  
  if (user.role === 'department_manager' && request.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden' };
  }
  
  if (request.status !== 'awaiting_approval') throw { statusCode: 400, message: 'Request must be in awaiting_approval status to approve' };

  // Budget Check
  const monthYear = new Date().toISOString().slice(0, 7);
  const budget = await budgetRepository.findByDepartmentAndMonth(request.departmentId, monthYear);
  
  let warning = null;
  if (budget && request.estimatedCost > Number(budget.remainingBudget)) {
    warning = "This request exceeds remaining budget";
  }

  const updated = await requestRepository.updateStatus(id, 'approved');

  await prisma.auditLog.create({
    data: { userId: user.id, action: 'REQUEST_APPROVED', description: `Approved Request #${id}` }
  });

  return { request: updated, warning };
};

const editAndResubmitRequest = async (id, data, user) => {
  const request = await requestRepository.findById(id);
  if (!request) throw { statusCode: 404, message: 'Request not found' };
  
  if (user.role === 'department_manager' && request.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden' };
  }
  
  if (request.status !== 'awaiting_approval') throw { statusCode: 400, message: 'Request must be awaiting approval to edit and resubmit' };

  const updateData = {
    ...data,
    estimatedCost: null,
    costNote: null,
    status: 'pending'
  };

  const updated = await requestRepository.update(id, updateData);

  await prisma.auditLog.create({
    data: { userId: user.id, action: 'REQUEST_EDITED_RESUBMITTED', description: `Edited and resubmitted Request #${id}` }
  });

  return updated;
};

const rejectRequest = async (id, rejectionReason, user) => {
  const request = await requestRepository.findById(id);
  if (!request) throw { statusCode: 404, message: 'Request not found' };
  
  if (user.role === 'department_manager' && request.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden' };
  }

  if (request.status !== 'awaiting_approval') throw { statusCode: 400, message: 'Request must be awaiting approval to reject' };

  const updated = await requestRepository.update(id, {
    status: 'rejected',
    costNote: rejectionReason
  });

  await prisma.auditLog.create({
    data: { userId: user.id, action: 'REQUEST_REJECTED', description: `Rejected Request #${id}. Reason: ${rejectionReason}` }
  });

  return updated;
};

const fulfilFromStock = async (id, stockItemId, quantityToFulfil, user) => {
  const request = await requestRepository.findById(id);
  if (!request) throw { statusCode: 404, message: 'Request not found' };
  if (request.status !== 'approved') throw { statusCode: 400, message: 'Only approved requests can be fulfilled' };

  const stockItem = await stockRepository.findById(stockItemId);
  if (!stockItem) throw { statusCode: 404, message: 'Stock item not found' };
  if (stockItem.quantity < quantityToFulfil) throw { statusCode: 400, message: 'Insufficient stock quantity' };

  // Calculate new budget
  const actualCost = Number(stockItem.unitPrice) * quantityToFulfil;
  const monthYear = new Date().toISOString().slice(0, 7);
  const budget = await budgetRepository.findByDepartmentAndMonth(request.departmentId, monthYear);
  
  let newUsedBudget = budget ? Number(budget.usedBudget) + actualCost : null;
  let newRemainingBudget = budget ? Number(budget.totalBudget) - newUsedBudget : null;

  // Generate asset code
  const currentYear = new Date().getFullYear();
  const sequence = await assetRepository.getNextSequence(request.departmentId, currentYear);
  const sequenceStr = String(sequence).padStart(4, '0');
  const assetCode = `CCL-${request.department.code}-${currentYear}-${sequenceStr}`;

  const result = await requestRepository.fulfilFromStockTransaction(
    id, stockItemId, quantityToFulfil, assetCode, stockItem.unitPrice, 
    budget ? budget.id : null, newUsedBudget, newRemainingBudget, user.id, 'Internal Warehouse Stock'
  );

  return result.request;
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  addCosting,
  approveRequest,
  editAndResubmitRequest,
  rejectRequest,
  fulfilFromStock,
};
