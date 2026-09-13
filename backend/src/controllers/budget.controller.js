const budgetService = require('../services/budget.service');
const { sendSuccess } = require('../utils/responseHandler');

const getBudgets = async (req, res) => {
  const budgets = await budgetService.getAllCurrentMonthBudgets(req.query.monthYear);
  return sendSuccess(res, budgets, 'Budgets fetched successfully');
};

const createBudget = async (req, res) => {
  const { departmentId, totalBudget, monthYear } = req.body;
  const parsedDepartmentId = Number(departmentId);
  const parsedTotalBudget = Number(totalBudget);
  if (!Number.isInteger(parsedDepartmentId) || parsedDepartmentId <= 0 ||
      !Number.isFinite(parsedTotalBudget) || parsedTotalBudget <= 0 ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthYear)) {
    throw { statusCode: 400, message: 'Missing required fields: departmentId, totalBudget, monthYear' };
  }
  const budget = await budgetService.createOrUpdateBudget(parsedDepartmentId, parsedTotalBudget, monthYear);
  return sendSuccess(res, budget, 'Budget record created/updated successfully', 201);
};

const updateBudget = async (req, res) => {
  const { id } = req.params;
  const { totalBudget } = req.body;
  const parsedTotalBudget = Number(totalBudget);
  if (!Number.isFinite(parsedTotalBudget) || parsedTotalBudget <= 0) {
    throw { statusCode: 400, message: 'totalBudget must be a positive number' };
  }
  
  const budget = await budgetService.updateBudget(id, parsedTotalBudget);
  return sendSuccess(res, budget, 'Budget total updated successfully');
};

const getDepartmentBudget = async (req, res) => {
  const { departmentId } = req.params;
  
  // Department manager can only view their own department's budget
  if (req.user.role === 'department_manager' && req.user.departmentId !== parseInt(departmentId, 10)) {
    throw { statusCode: 403, message: 'Forbidden: Cannot access other department budgets' };
  }

  const budget = await budgetService.getDepartmentBudget(departmentId);
  if (!budget) {
    return sendSuccess(res, null, 'No budget set for this department this month');
  }
  return sendSuccess(res, budget, 'Department budget fetched successfully');
};

const getDepartmentBudgetHistory = async (req, res) => {
  const { departmentId } = req.params;
  
  // Department manager can only view their own department's budget history
  if (req.user.role === 'department_manager' && req.user.departmentId !== parseInt(departmentId, 10)) {
    throw { statusCode: 403, message: 'Forbidden: Cannot access other department budgets' };
  }

  const history = await budgetService.getDepartmentBudgetHistory(departmentId);
  return sendSuccess(res, history, 'Department budget history fetched successfully');
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  getDepartmentBudget,
  getDepartmentBudgetHistory,
};
