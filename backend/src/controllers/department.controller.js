const departmentService = require('../services/department.service');
const { sendSuccess } = require('../utils/responseHandler');

const getDepartments = async (req, res) => {
  const departments = await departmentService.getAllDepartments();
  return sendSuccess(res, departments, 'Departments fetched successfully');
};

const getDepartmentById = async (req, res) => {
  const { id } = req.params;
  const department = await departmentService.getDepartmentById(id);
  return sendSuccess(res, department, 'Department details fetched successfully');
};

const getDepartmentDetail = async (req, res) => {
  const { id } = req.params;
  const currentMonthYear = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
  const department = await departmentService.getDepartmentDetail(id, currentMonthYear);
  return sendSuccess(res, department, 'Department detailed view fetched successfully');
};

const createDepartment = async (req, res) => {
  const department = await departmentService.createDepartment(req.body);
  return sendSuccess(res, department, 'Department created successfully', 201);
};

const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const department = await departmentService.updateDepartment(id, req.body);
  return sendSuccess(res, department, 'Department updated successfully');
};

module.exports = {
  getDepartments,
  getDepartmentById,
  getDepartmentDetail,
  createDepartment,
  updateDepartment,
};
