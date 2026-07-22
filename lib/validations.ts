import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone too short').optional().or(z.literal('')),
  role: z.string().min(2, 'Role is required').max(50, 'Role too long'),
  department: z.string().min(1, 'Department is required'),
  shift: z.enum(['morning', 'evening', 'night']),
  salary: z.coerce.number().min(1000, 'Minimum salary is 1,000').max(100000, 'Salary too high'),
  status: z.enum(['active', 'on-leave', 'inactive']),
});

export const orderSchema = z.object({
  customer: z.string().min(2, 'Customer name required'),
  product: z.string().min(2, 'Product name required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1').max(10000),
  priority: z.enum(['high', 'medium', 'low']),
  deliveryDate: z.string().min(1, 'Delivery date required'),
  notes: z.string().max(500, 'Notes too long').optional().or(z.literal('')),
});

export const inventorySchema = z.object({
  name: z.string().min(2, 'Item name required').max(100),
  category: z.string().min(1, 'Category required'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  unit: z.string().min(1, 'Unit required'),
  minStock: z.coerce.number().min(0, 'Min stock cannot be negative'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  supplier: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
});

export const supplierSchema = z.object({
  name: z.string().min(2, 'Supplier name required').max(100),
  contact: z.string().min(2, 'Contact person required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(7, 'Phone too short').optional().or(z.literal('')),
  country: z.string().min(2, 'Country required'),
  category: z.string().min(1, 'Category required'),
  status: z.enum(['active', 'review', 'inactive']),
});

export const customerSchema = z.object({
  name: z.string().min(2, 'Company name required').max(100),
  contact: z.string().min(2, 'Contact person required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(7, 'Phone too short').optional().or(z.literal('')),
});

export const maintenanceSchema = z.object({
  machine: z.string().min(2, 'Machine name required'),
  type: z.enum(['Preventive', 'Corrective', 'Emergency']),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  technician: z.string().min(2, 'Technician name required'),
  scheduledDate: z.string().min(1, 'Date required'),
  estimatedHours: z.coerce.number().min(0.5, 'Min 0.5 hours').max(200, 'Too many hours'),
  description: z.string().max(500).optional().or(z.literal('')),
});

export const defectSchema = z.object({
  type: z.string().min(2, 'Defect type required'),
  part: z.string().min(2, 'Affected part required'),
  count: z.coerce.number().min(1, 'Count must be at least 1').max(10000),
  severity: z.enum(['minor', 'major', 'critical']),
  line: z.string().min(1, 'Production line required'),
  inspector: z.string().min(2, 'Inspector name required'),
  description: z.string().max(500).optional().or(z.literal('')),
});

export const machineSchema = z.object({
  name: z.string().min(2, 'Machine name required').max(100),
  type: z.string().min(1, 'Type required'),
  location: z.string().min(1, 'Location required'),
  status: z.enum(['running', 'maintenance', 'under-performing', 'idle']),
  assignedTo: z.string().optional().or(z.literal('')),
  nextMaintenance: z.string().optional().or(z.literal('')),
});

export const passwordSchema = z.object({
  current: z.string().min(1, 'Current password required'),
  newPass: z.string().min(6, 'Password must be at least 6 characters'),
  confirm: z.string().min(1, 'Please confirm password'),
}).refine(d => d.newPass === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
});

export type EmployeeForm = z.infer<typeof employeeSchema>;
export type OrderForm = z.infer<typeof orderSchema>;
export type InventoryForm = z.infer<typeof inventorySchema>;
export type SupplierForm = z.infer<typeof supplierSchema>;
export type CustomerForm = z.infer<typeof customerSchema>;
export type MaintenanceForm = z.infer<typeof maintenanceSchema>;
export type DefectForm = z.infer<typeof defectSchema>;
export type MachineForm = z.infer<typeof machineSchema>;