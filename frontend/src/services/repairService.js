import api from './api';

export const getRepairRequests = (params = {}) => api.get('/repair-requests', { params });
export const getRepairRequestById = (id) => api.get(`/repair-requests/${id}`);
export const raiseRepairRequest = (data) => api.post('/repair-requests', data);
export const updateRepairStatus = (id, data) => api.put(`/repair-requests/${id}/status`, data);
export const getRepairStats = () => api.get('/repair-requests/stats');
