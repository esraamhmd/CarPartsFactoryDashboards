export interface Employee {
  id: number;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'on-leave' | 'inactive';
  avatar?: string;
  email: string;
  phone: string;
  salary: number;
  attendance: number;
  performance: number;
  joinDate: string;
  shift: 'morning' | 'evening' | 'night';
}

export interface Machine {
  id: number;
  name: string;
  type: string;
  status: 'running' | 'maintenance' | 'under-performing' | 'idle';
  utilization: number;
  assignedTo: string;
  lastMaintenance: string;
  nextMaintenance: string;
  downtime: number;
  efficiency: number;
  location: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  reorderPoint: number;
  price: number;
  supplier: string;
  location: string;
  status: 'available' | 'low-stock' | 'out-of-stock';
}

export interface Order {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  total: number;
  status: 'pending' | 'in-production' | 'quality-check' | 'shipped' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  orderDate: string;
  deliveryDate: string;
  progress: number;
}

export interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  rating: number;
  onTimeDelivery: number;
  totalOrders: number;
  activeOrders: number;
  category: string;
  status: 'active' | 'review' | 'inactive';
}

export interface Customer {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  rating: number;
  lastOrder: string;
}

export interface Defect {
  id: number;
  type: string;
  part: string;
  count: number;
  severity: 'minor' | 'major' | 'critical';
  line: string;
  date: string;
  status: 'open' | 'investigating' | 'resolved';
  inspector: string;
}

export interface Maintenance {
  id: number;
  machine: string;
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  technician: string;
  scheduledDate: string;
  estimatedHours: number;
  status: 'in-progress' | 'scheduled' | 'completed' | 'overdue';
  description: string;
}

export interface PayrollEntry {
  id: number;
  employeeId: number;
  name: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  overtime: number;
  net: number;
  month: string;
  status: 'paid' | 'pending';
}

export interface Notification {
  id: number;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
  module: string;
}

export interface AttendanceRecord {
  employeeId: number;
  name: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'on-time' | 'late' | 'absent';
  shift: string;
}

export interface KPICard {
  title: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
}