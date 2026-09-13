const assignmentService = require('../services/assignment.service');
const { sendSuccess } = require('../utils/responseHandler');

const getEmployeeAssets = async (req, res) => {
  const assets = await assignmentService.getEmployeeAssets(req.user, req.params.id);
  return sendSuccess(res, assets, 'Employee assets fetched successfully');
};

module.exports = { getEmployeeAssets };
