const repairService = require('../services/repair.service');
const { sendSuccess } = require('../utils/responseHandler');

const raiseRepairRequest = async (req, res) => {
  const request = await repairService.raiseRepairRequest(req.user, req.body);
  return sendSuccess(res, request, 'Repair request raised successfully', 201);
};

const getRepairRequests = async (req, res) => {
  const result = await repairService.getRepairRequests(req.user, req.query);
  return sendSuccess(res, result, 'Repair requests fetched successfully');
};

const getRepairRequestById = async (req, res) => {
  const request = await repairService.getRepairRequestById(req.user, req.params.id);
  return sendSuccess(res, request, 'Repair request fetched successfully');
};

const updateRepairStatus = async (req, res) => {
  const updated = await repairService.updateRepairStatus(req.user, req.params.id, req.body);
  return sendSuccess(res, updated, 'Repair request status updated successfully');
};

const getRepairStats = async (req, res) => {
  const stats = await repairService.getRepairStats(req.user);
  return sendSuccess(res, stats, 'Repair statistics fetched successfully');
};

module.exports = {
  raiseRepairRequest,
  getRepairRequests,
  getRepairRequestById,
  updateRepairStatus,
  getRepairStats,
};
