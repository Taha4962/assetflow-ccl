import api from './api';

export const getAssets = (params = {}) => api.get('/assets', { params });
export const getAssetById = (id) => api.get(`/assets/${id}`);
export const registerAsset = (data) => api.post('/assets', data);
export const completeAssetDetails = (id, data) => api.put(`/assets/${id}/details`, data);
export const assignAsset = (id, data) => api.post(`/assets/${id}/assign`, data);
export const unassignAsset = (id, data) => api.post(`/assets/${id}/unassign`, data);
export const getAssignmentHistory = (id) => api.get(`/assets/${id}/assignments`);
export const getAssetQR = (id) => api.get(`/assets/${id}/qr`);
export const scanAssetByCode = (assetCode) => api.get(`/assets/scan/${assetCode}`);
export const updateAssetNotes = (id, notes) => api.put(`/assets/${id}/notes`, { notes });
export const disposeAsset = (id, data) => api.post(`/assets/${id}/dispose`, data);
export const getDisposedAssets = (params = {}) => api.get('/assets/disposed', { params });
export const getAssetHistory = (id) => api.get(`/assets/${id}/history`);
export const getEmployeeAssets = (employeeId) => api.get(`/employees/${employeeId}/assets`);
