const dashboardRepo = require('../repositories/dashboard.repository');

const getAdminDashboard = async () => {
  return await dashboardRepo.getAdminStats();
};

const getManagerDashboard = async (user) => {
  return await dashboardRepo.getManagerStats(user.departmentId);
};

const getPurchaseDashboard = async (user) => {
  return await dashboardRepo.getPurchaseStats(user.id);
};

const getMaintenanceDashboard = async (user) => {
  return await dashboardRepo.getMaintenanceStats(user.id);
};

const getEmployeeDashboard = async (user) => {
  return await dashboardRepo.getEmployeeStats(user.id);
};

module.exports = {
  getAdminDashboard,
  getManagerDashboard,
  getPurchaseDashboard,
  getMaintenanceDashboard,
  getEmployeeDashboard,
};
