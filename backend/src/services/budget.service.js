const budgetRepository = require('../repositories/budget.repository');

const getCurrentMonthYear = () => {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
};

const getAllCurrentMonthBudgets = async (monthYear = getCurrentMonthYear()) => {
  const budgets = await budgetRepository.findAllCurrentMonth(monthYear);
  return budgets.map(b => ({
    ...b,
    utilizationPercentage: b.totalBudget > 0 ? (Number(b.usedBudget) / Number(b.totalBudget)) * 100 : 0
  }));
};

const getDepartmentBudget = async (departmentId) => {
  const monthYear = getCurrentMonthYear();
  const budget = await budgetRepository.findByDepartmentAndMonth(departmentId, monthYear);
  if (!budget) {
    return null; // The controller handles returning a message if null
  }
  return {
    ...budget,
    utilizationPercentage: budget.totalBudget > 0 ? (Number(budget.usedBudget) / Number(budget.totalBudget)) * 100 : 0
  };
};

const getDepartmentBudgetHistory = async (departmentId) => {
  return await budgetRepository.findHistoryByDepartment(departmentId);
};

const createOrUpdateBudget = async (departmentId, totalBudget, monthYear) => {
  return await budgetRepository.upsert(departmentId, monthYear, totalBudget);
};

const updateBudget = async (id, totalBudget) => {
  const budget = await budgetRepository.updateBudgetLimit(id, totalBudget);
  if (!budget) throw { statusCode: 404, message: 'Budget record not found' };
  return budget;
};

module.exports = {
  getAllCurrentMonthBudgets,
  getDepartmentBudget,
  getDepartmentBudgetHistory,
  createOrUpdateBudget,
  updateBudget,
};
