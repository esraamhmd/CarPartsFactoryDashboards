// Parallel Data Fetching + React.cache for MotorSync
// Uses Promise.allSettled so one failed fetch never blocks others

import { cache } from 'react';

// ── JSON fallbacks (local data) ──────────────────────────────
async function loadJson(path: string) {
  try {
    const mod = await import(`@/data/${path}.json`);
    return mod.default ?? mod;
  } catch { return null; }
}

// ── React.cache — deduplicates identical requests in same render ──
export const getEmployees = cache(async () => {
  return loadJson('employees');
});

export const getInventory = cache(async () => {
  return loadJson('inventory');
});

export const getOrders = cache(async () => {
  return loadJson('orders');
});

export const getMachines = cache(async () => {
  return loadJson('machines');
});

export const getProduction = cache(async () => {
  return loadJson('production');
});

export const getFinance = cache(async () => {
  return loadJson('finance');
});

// ── Parallel fetch for dashboard ─────────────────────────────
export const getDashboardData = cache(async () => {
  const [employees, machines, orders, inventory, production, finance, attendance] =
    await Promise.allSettled([
      getEmployees(),
      getMachines(),
      getOrders(),
      getInventory(),
      getProduction(),
      getFinance(),
      loadJson('attendance'),
    ]);

  return {
    employees:  employees.status  === 'fulfilled' ? employees.value  : [],
    machines:   machines.status   === 'fulfilled' ? machines.value   : [],
    orders:     orders.status     === 'fulfilled' ? orders.value     : [],
    inventory:  inventory.status  === 'fulfilled' ? inventory.value  : [],
    production: production.status === 'fulfilled' ? production.value : {},
    finance:    finance.status    === 'fulfilled' ? finance.value    : {},
    attendance: attendance.status === 'fulfilled' ? attendance.value : { today: [] },
  };
});