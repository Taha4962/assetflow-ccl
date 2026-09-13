const departmentRepository = require('../repositories/department.repository');

const getAllDepartments = async () => {
  return await departmentRepository.findAllWithAssetCount();
};

const getDepartmentById = async (id) => {
  const department = await departmentRepository.findByIdWithDetails(id);
  if (!department) {
    throw { statusCode: 404, message: 'Department not found' };
  }
  return department;
};

const getDepartmentDetail = async (id, currentMonthYear) => {
  const department = await departmentRepository.getDepartmentDetailedView(id, currentMonthYear);
  if (!department) {
    throw { statusCode: 404, message: 'Department not found' };
  }
  return department;
};

const createDepartment = async (data) => {
  const existing = await departmentRepository.findByNameOrCode(data.name, data.code);
  if (existing) {
    throw { statusCode: 400, message: 'Department with this name or code already exists' };
  }
  return await departmentRepository.create(data);
};

const updateDepartment = async (id, data) => {
  const existing = await departmentRepository.findByIdWithDetails(id);
  if (!existing) {
    throw { statusCode: 404, message: 'Department not found' };
  }
  return await departmentRepository.update(id, data);
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  getDepartmentDetail,
  createDepartment,
  updateDepartment,
};
