import api from './api';

export const getStockItems = (params = {}) => api.get('/stock', { params });
export const createStockItem = (data) => api.post('/stock', data);
export const updateStockItem = (id, data) => api.put(`/stock/${id}`, data);
export const updateStockQuantity = (id, data) => api.put(`/stock/${id}/quantity`, data);
