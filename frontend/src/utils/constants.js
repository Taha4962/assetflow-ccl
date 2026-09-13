/**
 * constants.js — Shared UI/business constants for CCL AssetFlow
 */

// API base URL (for reference; actual instance is configured in api.js)
export const API_BASE = '/api';

// Role display labels
export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  department_manager: 'Department Manager',
  purchase_person: 'Purchase Officer',
  maintenance_person: 'Maintenance Specialist',
  employee: 'Employee',
};

// All role values as an array
export const ALL_ROLES = Object.keys(ROLE_LABELS);

// Asset request status values and display labels
export const REQUEST_STATUS = {
  pending: 'Pending',
  approved: 'Approved',
  purchased: 'Purchased',
  delivered: 'Delivered',
};

// Status badge colour classes (Tailwind)
export const REQUEST_STATUS_COLORS = {
  pending:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  purchased: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;

// CCL department codes
export const DEPT_CODES = ['SYS', 'HR', 'FIN', 'MECH', 'ELEC'];

// Dashboard paths by role (mirrors AuthContext.getRoleDashboardPath)
export const ROLE_DASHBOARD = {
  super_admin: '/admin/dashboard',
  department_manager: '/manager/dashboard',
  purchase_person: '/purchase/dashboard',
  maintenance_person: '/maintenance/dashboard',
  employee: '/employee/dashboard',
};
