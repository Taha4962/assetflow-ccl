import api from './api';

export const getAssetRequests = async (params = {}) => {
  const response = await api.get('/asset-requests', { params });
  return response.data;
};

export const getAssetRequestById = async (id) => {
  const response = await api.get(`/asset-requests/${id}`);
  return response.data;
};

export const createAssetRequest = async (requestData) => {
  const response = await api.post('/asset-requests', requestData);
  return response.data;
};

export const updateRequestStatus = async (id, status) => {
  const response = await api.put(`/asset-requests/${id}/status`, { status });
  return response.data;
};

// Phase 3: Purchase Workflow
export const addCosting = (id, data) => api.put(`/asset-requests/${id}/add-costing`, data);
export const approveRequest = (id) => api.put(`/asset-requests/${id}/approve`);
export const editAndResubmitRequest = (id, data) => api.put(`/asset-requests/${id}/edit-and-resubmit`, data);
export const rejectRequest = (id, data) => api.put(`/asset-requests/${id}/reject`, data);
export const fulfilFromStock = (id, data) => api.post(`/asset-requests/${id}/fulfil-from-stock`, data);
export const getDepartmentDetail = (id) => api.get(`/departments/${id}/detail`);

