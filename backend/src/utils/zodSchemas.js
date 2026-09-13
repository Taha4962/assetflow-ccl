const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['super_admin', 'department_manager', 'purchase_person', 'maintenance_person', 'employee']),
  departmentId: z.number().int().positive('Department is required'),
});

const updateUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  role: z.enum(['super_admin', 'department_manager', 'purchase_person', 'maintenance_person', 'employee']).optional(),
  departmentId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

const departmentSchema = z.object({
  name: z.string().min(2, 'Department name is required'),
  code: z.string().min(2, 'Department code is required'),
  description: z.string().optional(),
});

const updateDepartmentSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  description: z.string().optional(),
});

const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
});

const assetRequestSchema = z.object({
  assetName: z.string().min(2, 'Asset name is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  reason: z.string().min(3, 'Reason for request is required'),
});

const updateRequestStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'purchased', 'delivered']),
});

// ─── Phase 2 Schemas ───────────────────────────────────────────────────────

const registerAssetSchema = z.object({
  requestId: z.coerce.number().int().positive().optional().nullable(),
  departmentId: z.coerce.number().int().positive('Department is required'),
  categoryId: z.coerce.number().int().positive('Category is required'),
  vendorName: z.string().trim().min(2, 'Vendor name is required'),
  vendorContact: z.string().trim().optional().or(z.literal('')),
  invoiceNumber: z.string().trim().min(1, 'Invoice number is required'),
  unitPrice: z.coerce.number().positive('Unit price must be positive'),
  totalAmount: z.coerce.number().positive('Total amount must be positive'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
  purchaseDate: z.string().trim().min(1, 'Purchase date is required'),
  deliveryDate: z.string().trim().optional().or(z.literal('')),
  deliveryCondition: z.string().trim().optional().or(z.literal('')),
  notes: z.string().trim().optional().or(z.literal('')),
});

const completeAssetDetailsSchema = z.object({
  name: z.string().min(2, 'Asset name is required'),
  serialNumber: z.string().optional(),
  modelNumber: z.string().optional(),
  description: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  condition: z.string().optional(),
  notes: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
});

const assignAssetSchema = z.object({
  employeeId: z.number().int().positive('Employee is required'),
  assignedDate: z.string().min(1, 'Assignment date is required'),
  notes: z.string().optional(),
});

const unassignAssetSchema = z.object({
  notes: z.string().optional(),
});

const raiseRepairSchema = z.object({
  assetId: z.number().int().positive('Asset is required'),
  issueDescription: z.string().min(5, 'Issue description is required'),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
});

const updateRepairStatusSchema = z.object({
  status: z.enum(['in_progress', 'resolved']),
  resolutionNotes: z.string().optional(),
});

const disposeAssetSchema = z.object({
  reason: z.string().min(3, 'Disposal reason is required'),
  condition: z.string().min(2, 'Condition is required'),
  disposalDate: z.string().min(1, 'Disposal date is required'),
  notes: z.string().optional(),
});

const updateNotesSchema = z.object({
  notes: z.string().min(1, 'Notes cannot be empty'),
});

module.exports = {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  departmentSchema,
  updateDepartmentSchema,
  categorySchema,
  assetRequestSchema,
  updateRequestStatusSchema,
  // Phase 2
  registerAssetSchema,
  completeAssetDetailsSchema,
  assignAssetSchema,
  unassignAssetSchema,
  raiseRepairSchema,
  updateRepairStatusSchema,
  disposeAssetSchema,
  updateNotesSchema,
};
