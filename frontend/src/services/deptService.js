import api from './api';

export const getDepartments = async () => {
  const response = await api.get('/departments');
  return response.data;
};

export const getDepartmentById = async (id) => {
  const response = await api.get(`/departments/${id}`);
  return response.data;
};

export const createDepartment = async (deptData) => {
  const response = await api.post('/departments', deptData);
  return response.data;
};

export const updateDepartment = async (id, deptData) => {
  const response = await api.put(`/departments/${id}`, deptData);
  return response.data;
};
