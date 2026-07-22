'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MdDashboard, MdPeople, MdFactory, MdPrecisionManufacturing,
  MdInventory, MdLocalShipping, MdShoppingCart, MdGroups,
  MdBugReport, MdVerifiedUser, MdBuild, MdAccessTime,
  MdAttachMoney, MdAnalytics, MdDescription, MdNotifications,
  MdSettings, MdAccountBalance, MdCorporateFare, MdDirectionsCar
} from 'react-icons/md';
import { useI18n } from '@/i18n';

const NAV = [
  { href:'/',              icon:MdDashboard,              key:'nav.dashboard',    group:'main' },
  { href:'/employees',     icon:MdPeople,                 key:'nav.employees',    group:'people' },
  { href:'/departments',   icon:MdCorporateFare,          key:'nav.departments',  group:'people' },
  { href:'/attendance',    icon:MdAccessTime,             key:'nav.attendance',   group:'people' },
  { href:'/payroll',       icon:MdAttachMoney,            key:'nav.payroll',      group:'people' },
  { href:'/production',    icon:MdFactory,                key:'nav.production',   group:'factory' },
  { href:'/machines',      icon:MdPrecisionManufacturing, key:'nav.machines',     group:'factory' },
  { href:'/maintenance',   icon:MdBuild,                  key:'nav.maintenance',  group:'factory' },
  { href:'/inventory',     icon:MdInventory,              key:'nav.inventory',    group:'supply' },
  { href:'/suppliers',     icon:MdLocalShipping,          key:'nav.suppliers',    group:'supply' },
  { href:'/orders',        icon:MdShoppingCart,           key:'nav.orders',       group:'supply' },
  { href:'/customers',     icon:MdGroups,                 key:'nav.customers',    group:'supply' },
  { href:'/cars',          icon:MdDirectionsCar,          key:'nav.cars',         group:'supply' },
  { href:'/defects',       icon:MdBugReport,              key:'nav.defects',      group:'quality' },
  { href:'/quality',       icon:MdVerifiedUser,           key:'nav.quality',      group:'quality' },
  { href:'/finance',       icon:MdAccountBalance,         key:'nav.finance',      group:'insights' },
  { href:'/analytics',     icon:MdAnalytics,              key:'nav.analytics',    group:'insights' },
  { href:'/reports',       icon:MdDescription,            key:'nav.reports',      group:'insights' },
  { href:'/notifications', icon:MdNotifications,          key:'nav.notifications',group:'system' },
  { href:'/settings',      icon:MdSettings,               key:'nav.settings',     group:'system' },
];

const GROUPS: Record<string,string> = {
  main:'', people:'groups.people', factory:'groups.factory',
  supply:'groups.supply', quality:'groups.quality',
  insights:'groups.insights', system:'groups.system',
};

interface Props { isOpen?: boolean; onClose?: () => void; }

export default function Sidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const { t, isRTL } = useI18n();

  const grouped = NAV.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof NAV>);

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay open" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`sidebar${isOpen ? ' open' : ''}`}
        aria-label={isRTL ? 'القائمة الرئيسية' : 'Main navigation'}
        role="navigation"
      >
        {/* Logo */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: 'linear-gradient(135deg,#c81e1e,#e63535)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(200,30,30,0.4)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M21 8.4L19.5 6.9C19.8 6.3 20 5.7 20 5c0-2.2-1.8-4-4-4S12 2.8 12 5c0 2.1 1.6 3.8 3.7 4L14 11.3 11.4 9.7 10 8l-8 4.4 1 1.7 6.3-3.5 7.3 4.3-1 6-1.2.2-.4-2.8-7 1.2.4 2.8L6.1 23 7 24.8l6.8-1.7.4 2.5C14.8 26.5 15.9 27 17 27c1.9 0 3.5-1.4 3.7-3.3l.3-2c1.2-.5 2-1.7 2-3v-7c0-.9-.4-1.7-1-2.3zM16 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:15, color:'var(--text-primary)', lineHeight:1.2 }}>
              MotorSync
            </div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
              {isRTL ? 'نظام ERP للمصنع' : 'Factory ERP v2.0'}
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="sidebar-body">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              {GROUPS[group] && (
                <div style={{
                  padding: '12px 16px 4px',
                  fontSize: 10, fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: isRTL ? 'none' : 'uppercase',
                  letterSpacing: isRTL ? 0 : '0.08em',
                }}>
                  {t(GROUPS[group])}
                </div>
              )}
              {items.map(item => {
                const active = item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} onClick={onClose} style={{ display:'block' }}>
                    <div
                      className={`sidebar-item${active ? ' active' : ''}`}
                      role="menuitem"
                      aria-current={active ? 'page' : undefined}
                    >
                      <item.icon size={16} aria-hidden="true" style={{ flexShrink:0 }} />
                      <span style={{ flex:1 }}>{t(item.key)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding:'10px 12px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ background:'var(--bg-page)', borderRadius:9, padding:'8px 12px' }}>
            <div style={{ fontSize:11.5, fontWeight:700, color:'var(--text-primary)' }}>MotorSync v2.0</div>
            <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>
              {isRTL ? '© ٢٠٢٦ نظام قطع السيارات' : '© 2026 Car Parts Factory ERP'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}