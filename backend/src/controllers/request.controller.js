const requestService = require('../services/request.service');
const { sendSuccess } = require('../utils/responseHandler');

const createRequest = async (req, res) => {
  const request = await requestService.createRequest(req.user, req.body);
  return sendSuccess(res, request, 'Asset purchase request submitted successfully', 201);
};

const getRequests = async (req, res) => {
  const { status } = req.query;
  const requests = await requestService.getRequests(req.user, status);
  return sendSuccess(res, requests, 'Asset requests fetched successfully');
};

const getRequestById = async (req, res) => {
  const { id } = req.params;
  const request = await requestService.getRequestById(id, req.user);
  return sendSuccess(res, request, 'Asset request details fetched successfully');
};

const updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedRequest = await requestService.updateRequestStatus(id, status, req.user);
  return sendSuccess(res, updatedRequest, `Asset request status updated to ${status}`);
};

const addCosting = async (req, res) => {
  const { id } = req.params;
  const { estimatedCost, costNote } = req.body;
  if (!estimatedCost) throw { statusCode: 400, message: 'estimatedCost is required' };
  
  const updatedRequest = await requestService.addCosting(id, estimatedCost, costNote, req.user);
  return sendSuccess(res, updatedRequest, 'Costing added and request sent for approval');
};

const approveRequest = async (req, res) => {
  const { id } = req.params;
  const result = await requestService.approveRequest(id, req.user);
  
  // Custom response if there's a budget warning
  if (result.warning) {
    return res.status(200).json({
      success: true,
      data: result.request,
      message: 'Request approved successfully',
      warning: result.warning
    });
  }
  return sendSuccess(res, result.request, 'Request approved successfully');
};

const editAndResubmitRequest = async (req, res) => {
  const { id } = req.params;
  const updatedRequest = await requestService.editAndResubmitRequest(id, req.body, req.user);
  return sendSuccess(res, updatedRequest, 'Request edited and sent back for costing');
};

const rejectRequest = async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  if (!rejectionReason) throw { statusCode: 400, message: 'rejectionReason is required' };
  
  const updatedRequest = await requestService.rejectRequest(id, rejectionReason, req.user);
  return sendSuccess(res, updatedRequest, 'Request rejected');
};

const fulfilFromStock = async (req, res) => {
  const { id } = req.params;
  const { stockItemId, quantityToFulfil } = req.body;
  
  if (!Number.isInteger(Number(stockItemId)) || Number(stockItemId) <= 0 ||
      !Number.isInteger(Number(quantityToFulfil)) || Number(quantityToFulfil) <= 0) {
    throw { statusCode: 400, message: 'stockItemId and quantityToFulfil are required' };
  }
  
  const result = await requestService.fulfilFromStock(id, Number(stockItemId), Number(quantityToFulfil), req.user);
  return sendSuccess(res, result, 'Request fulfilled from stock successfully');
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
