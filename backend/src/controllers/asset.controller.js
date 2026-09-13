const assetService = require('../services/asset.service');
const assignmentService = require('../services/assignment.service');
const disposalService = require('../services/disposal.service');
const { sendSuccess } = require('../utils/responseHandler');

const registerAsset = async (req, res) => {
  const asset = await assetService.registerAsset(req.user, req.body);
  return sendSuccess(res, asset, 'Asset registered successfully (Step 1 complete)', 201);
};

const completeAssetDetails = async (req, res) => {
  const asset = await assetService.completeAssetDetails(req.user, req.params.id, req.body);
  return sendSuccess(res, asset, 'Asset details completed successfully. Asset is now unassigned.');
};

const getAssets = async (req, res) => {
  const result = await assetService.getAssets(req.user, req.query);
  return sendSuccess(res, result, 'Assets fetched successfully');
};

const getAssetById = async (req, res) => {
  const asset = await assetService.getAssetById(req.user, req.params.id);
  return sendSuccess(res, asset, 'Asset details fetched successfully');
};

const getAssetHistory = async (req, res) => {
  const history = await assetService.getAssetHistory(req.user, req.params.id);
  return sendSuccess(res, history, 'Asset history fetched successfully');
};

const getQRCode = async (req, res) => {
  const qr = await assetService.getQRCode(req.user, req.params.id);
  return sendSuccess(res, { qrCode: qr }, 'QR code fetched successfully');
};

const scanByCode = async (req, res) => {
  const asset = await assetService.getAssetByCode(req.params.assetCode);
  return sendSuccess(res, asset, 'Asset info fetched via QR scan');
};

const updateNotes = async (req, res) => {
  const asset = await assetService.updateNotes(req.user, req.params.id, req.body.notes);
  return sendSuccess(res, asset, 'Asset notes updated successfully');
};

const getDisposed = async (req, res) => {
  const assets = await assetService.getDisposedAssets(req.user, req.query);
  return sendSuccess(res, assets, 'Disposed assets fetched successfully');
};

const assignAsset = async (req, res) => {
  const assignment = await assignmentService.assignAsset(req.user, req.params.id, req.body);
  return sendSuccess(res, assignment, 'Asset assigned successfully', 201);
};

const unassignAsset = async (req, res) => {
  const result = await assignmentService.unassignAsset(req.user, req.params.id, req.body.notes);
  return sendSuccess(res, result, 'Asset unassigned successfully');
};

const getAssignmentHistory = async (req, res) => {
  const history = await assignmentService.getAssignmentHistory(req.user, req.params.id);
  return sendSuccess(res, history, 'Assignment history fetched successfully');
};

const disposeAsset = async (req, res) => {
  const disposal = await disposalService.disposeAsset(req.user, req.params.id, req.body);
  return sendSuccess(res, disposal, 'Asset disposed successfully');
};

module.exports = {
  registerAsset,
  completeAssetDetails,
  getAssets,
  getAssetById,
  getAssetHistory,
  getQRCode,
  scanByCode,
  updateNotes,
  getDisposed,
  assignAsset,
  unassignAsset,
  getAssignmentHistory,
  disposeAsset,
};
