import api from './api';

export const getAllBudgets = (monthYear) => api.get('/budgets', { params: { monthYear } });
export const createBudget = (data) => api.post('/budgets', data);
export const updateBudget = (id, data) => api.put(`/budgets/${id}`, data);
export const getDepartmentBudget = (departmentId) => api.get(`/budgets/department/${departmentId}`);
export const getDepartmentBudgetHistory = (departmentId) => api.get(`/budgets/department/${departmentId}/history`);
