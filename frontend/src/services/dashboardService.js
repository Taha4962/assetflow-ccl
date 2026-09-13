import api from './api';

export const getAdminDashboard = () => api.get('/dashboard/admin');
export const getManagerDashboard = () => api.get('/dashboard/manager');
export const getPurchaseDashboard = () => api.get('/dashboard/purchase');
export const getMaintenanceDashboard = () => api.get('/dashboard/maintenance');
export const getEmployeeDashboard = () => api.get('/dashboard/employee');
