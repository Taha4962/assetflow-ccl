const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/responseHandler');

const adminDashboard = async (req, res) => {
  const data = await dashboardService.getAdminDashboard();
  return sendSuccess(res, data, 'Admin dashboard data fetched successfully');
};

const managerDashboard = async (req, res) => {
  const data = await dashboardService.getManagerDashboard(req.user);
  return sendSuccess(res, data, 'Manager dashboard data fetched successfully');
};

const purchaseDashboard = async (req, res) => {
  const data = await dashboardService.getPurchaseDashboard(req.user);
  return sendSuccess(res, data, 'Purchase dashboard data fetched successfully');
};

const maintenanceDashboard = async (req, res) => {
  const data = await dashboardService.getMaintenanceDashboard(req.user);
  return sendSuccess(res, data, 'Maintenance dashboard data fetched successfully');
};

const employeeDashboard = async (req, res) => {
  const data = await dashboardService.getEmployeeDashboard(req.user);
  return sendSuccess(res, data, 'Employee dashboard data fetched successfully');
};

module.exports = {
  adminDashboard,
  managerDashboard,
  purchaseDashboard,
  maintenanceDashboard,
  employeeDashboard,
};
