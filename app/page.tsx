'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import {
  MdPeople, MdPrecisionManufacturing, MdFactory,
  MdInventory, MdBugReport, MdAttachMoney, MdShoppingCart, MdVerifiedUser
} from 'react-icons/md';
import KPICard from '@/components/ui/KPICard';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import { useI18n } from '@/i18n';
import employeesData from '@/data/employees.json';
import machinesData   from '@/data/machines.json';
import production     from '@/data/production.json';
import inventoryData  from '@/data/inventory.json';
import ordersData     from '@/data/orders.json';
import attendanceData from '@/data/attendance.json';
import finance        from '@/data/finance.json';

const AreaChart        = dynamic(() => import('recharts').then(m => m.AreaChart),        { ssr: false });
const Area             = dynamic(() => import('recharts').then(m => m.Area),             { ssr: false });
const BarChart         = dynamic(() => import('recharts').then(m => m.BarChart),         { ssr: false });
const Bar              = dynamic(() => import('recharts').then(m => m.Bar),              { ssr: false });
const PieChart         = dynamic(() => import('recharts').then(m => m.PieChart),         { ssr: false });
const Pie              = dynamic(() => import('recharts').then(m => m.Pie),              { ssr: false });
const Cell             = dynamic(() => import('recharts').then(m => m.Cell),             { ssr: false, loading: () => null });
const XAxis            = dynamic(() => import('recharts').then(m => m.XAxis),            { ssr: false });
const YAxis            = dynamic(() => import('recharts').then(m => m.YAxis),            { ssr: false });
const Tooltip          = dynamic(() => import('recharts').then(m => m.Tooltip),          { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const CartesianGrid    = dynamic(() => import('recharts').then(m => m.CartesianGrid),    { ssr: false });
const Legend           = dynamic(() => import('recharts').then(m => m.Legend),           { ssr: false });

const PIE_COLORS = ['#00E0BA','#FF3483','#FFD400','#0055DA','#91008D','#00C68D','#36ADA3','#FF0052'];

export default function Dashboard() {
  const { t, lang, tDay, tMonth, tStatus, isRTL } = useI18n();
  const tNum = (n: number | string) => lang === 'ar' ? String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]) : String(n);

  const employees  = [...employeesData];
  const machines   = [...machinesData];
  const orders     = [...ordersData];
  const inventory  = [...inventoryData];

  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const activeMachines  = machines.filter(m => m.status === 'running').length;
  const todayProduction = production.daily.reduce((s,d) => s + d.actual, 0);
  const lowStock        = inventory.filter(i => i.status !== 'available').length;
  const pendingOrders   = orders.filter(o => o.status === 'pending' || o.status === 'in-production').length;
  const defectRate      = ((production.daily.reduce((s,d)=>s+d.defects,0)/todayProduction)*100).toFixed(1);
  const attendanceRate  = Math.round((attendanceData.today.filter(a=>a.status!=='absent').length/attendanceData.today.length)*100);

  // Localised chart data
  const dailyData   = production.daily.map(d => ({ ...d, day: tDay(d.day) }));
  const monthlyData = production.monthly.map(m => ({ ...m, month: tMonth(m.month) }));

  const tt = { background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:12 };

  const kpis = [
    { key:'totalEmployees',  value:employees.length, sub:`${activeEmployees} ${t('dashboard.active')}`, change:5,    icon:MdPeople,               color:'var(--blue)' },
    { key:'activeMachines',  value:`${activeMachines}/${machines.length}`, sub:t('dashboard.runningNow'), change:-2,  icon:MdPrecisionManufacturing, color:'var(--success)' },
    { key:'productionToday', value:todayProduction,  sub:t('dashboard.unitsProduced'), change:8,   icon:MdFactory,            color:'var(--primary)' },
    { key:'inventoryAlerts', value:lowStock,         sub:t('dashboard.itemsNeedAttention'), change:-1, icon:MdInventory,      color:'var(--warning)' },
    { key:'defectRate',      value:defectRate+'%',   sub:t('dashboard.thisWeek'), change:-0.3, icon:MdBugReport,         color:'#f97316' },
    { key:'revenue',         value:`$${(finance.summary.revenue/1000000).toFixed(2)}M`, sub:t('dashboard.thisMonth'), change:12, icon:MdAttachMoney, color:'var(--success)' },
    { key:'pendingOrders',   value:pendingOrders,    sub:t('dashboard.inProgress'), change:3,   icon:MdShoppingCart,       color:'var(--blue)' },
    { key:'attendanceRate',  value:attendanceRate+'%', sub:t('common.today'), change:2,         icon:MdVerifiedUser,       color:'var(--primary)' },
  ];

  return (
    <div className="animate-in">
      <PageHeader title={t('dashboard.title')} />

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {kpis.map(k => (
          <KPICard key={k.key}
            title={t(`dashboard.${k.key}`)}
            value={k.value}
            subtitle={k.sub}
            change={k.change}
            icon={k.icon}
            color={k.color}
          />
        ))}
      </div>

      {/* Charts row 1 — stacks on tablet */}
      <div className="grid-cols-2" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:18, marginBottom:18 }}>
        {/* Monthly production */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{t('dashboard.monthlyProduction')}</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:14 }}>{t('dashboard.targetVsActual')}</div>
          <Suspense fallback={<div className="skeleton" style={{ height:220 }} />}>
            <div dir="ltr">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top:10, right:10, bottom:25, left:55 }}>
                <defs>
                  <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FF3483" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FF3483" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00E0BA" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00E0BA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize:11, fill:'var(--text-muted)' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v=>tMonth(v)}
                  interval={0} dy={10}
                />
                <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={tt} />
                <Legend
                  wrapperStyle={{ fontSize:11, paddingTop:12 }}
                  formatter={v => v==='target'?t('dashboard.target'):t('dashboard.actual')}
                />
                <Area type="monotone" dataKey="target" stroke="#00E0BA" fill="url(#gTarget)" strokeWidth={2.5} name="target" />
                <Area type="monotone" dataKey="actual" stroke="#FF3483" fill="url(#gActual)" strokeWidth={2.5} name="actual" />
              </AreaChart>
            </ResponsiveContainer>
            </div>
          </Suspense>
        </div>

        {/* Daily output bar */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{t('dashboard.dailyOutput')}</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:14 }}>{lang==='ar'?'هذا الأسبوع':'This week'}</div>
          <Suspense fallback={<div className="skeleton" style={{ height:220 }} />}>
            <div dir="ltr">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData} barSize={10} barCategoryGap="30%" margin={{ top:10, right:10, bottom:25, left:50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize:11, fill:'var(--text-muted)' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v=>tDay(v)}
                  interval={0} dy={10}
                />
                <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={tt} />
                <Legend wrapperStyle={{ fontSize:11, paddingTop:12 }} />
                <Bar dataKey="actual" fill="#0055DA" radius={[4,4,0,0]} name={lang==='ar'?'الفعلي':'Actual'} />
                <Bar dataKey="target" fill="#00E0BA" radius={[4,4,0,0]} name={lang==='ar'?'المستهدف':'Target'} />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </Suspense>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid-cols-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
        {/* Revenue pie */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>{lang==='ar'?'توزيع المصروفات':'Expense Breakdown'}</div>
          <div style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
            <Suspense fallback={<div className="skeleton" style={{ width:150, height:150, borderRadius:'50%' }} />}>
              <PieChart width={150} height={150}>
                <Pie
                  data={finance.expenses_breakdown.map((item,i)=>({...item, fill:PIE_COLORS[i%PIE_COLORS.length]}))}
                  cx={75} cy={75} innerRadius={42} outerRadius={68}
                  dataKey="value" stroke="#fff" strokeWidth={1} paddingAngle={3}
                >
                  {finance.expenses_breakdown.map((_,i)=>(
                    <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tt} formatter={(v:any) => [`$${Number(v).toLocaleString()}`, '']} />
              </PieChart>
            </Suspense>
            <div style={{ flex:1, minWidth:120 }}>
              {finance.expenses_breakdown.map((item,i) => (
                <div key={lang==='ar' ? (item.nameAr || item.name) : item.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:PIE_COLORS[i%PIE_COLORS.length], flexShrink:0 }} />
                    <span style={{ fontSize:11.5, color:'var(--text-secondary)' }}>
                      {lang==='ar' ? (item as any).nameAr || item.name : item.name}
                    </span>
                  </div>
                  <span style={{ fontSize:11.5, fontWeight:600 }}>${(item.value/1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Machine status */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>{lang==='ar'?'حالة الآلات':'Machine Status'}</div>
          {[
            { label:lang==='ar'?'تعمل':'Running',          count:machines.filter(m=>m.status==='running').length,            color:'var(--success)' },
            { label:lang==='ar'?'صيانة':'Maintenance',      count:machines.filter(m=>m.status==='maintenance').length,        color:'var(--primary)' },
            { label:lang==='ar'?'أداء ضعيف':'Under-perf.', count:machines.filter(m=>m.status==='under-performing').length,    color:'var(--warning)' },
            { label:lang==='ar'?'متوقفة':'Idle',            count:machines.filter(m=>m.status==='idle').length,               color:'var(--text-muted)' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize:12, fontWeight:700, color:item.color }}>{item.count}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width:`${(item.count/machines.length)*100}%`, background:item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tables row — stacks on tablet */}
      <div className="grid-cols-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        {/* Recent orders */}
        <div className="card">
          <div style={{ padding:'13px 18px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:14 }}>
            {t('dashboard.recentOrders')}
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>{lang==='ar'?'رقم الطلب':'Order'}</th>
                <th className="hide-mob">{lang==='ar'?'العميل':'Customer'}</th>
                <th>{lang==='ar'?'الإجمالي':'Total'}</th>
                <th>{lang==='ar'?'الحالة':'Status'}</th>
              </tr></thead>
              <tbody>
                {orders.slice(0,6).map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight:600, color:'var(--blue)', fontSize:12 }}>{o.id}</td>
                    <td className="hide-mob" style={{ fontSize:12 }}>{o.customer}</td>
                    <td style={{ fontWeight:600, fontSize:12 }}>${o.total.toLocaleString()}</td>
                    <td><Badge variant={statusToVariant(o.status)}>{tStatus(o.status)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today attendance */}
        <div className="card">
          <div style={{ padding:'13px 18px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:14 }}>
            {t('dashboard.todayAtt')}
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>{lang==='ar'?'الاسم':'Name'}</th>
                <th className="hide-mob">{lang==='ar'?'وقت الدخول':'Check In'}</th>
                <th>{lang==='ar'?'الحالة':'Status'}</th>
              </tr></thead>
              <tbody>
                {attendanceData.today.slice(0,6).map(a => (
                  <tr key={a.employeeId}>
                    <td style={{ fontSize:13, fontWeight:500 }}>{a.name}</td>
                    <td className="hide-mob" style={{ fontSize:12, color:'var(--text-muted)' }}>{a.checkIn || '—'}</td>
                    <td><Badge variant={statusToVariant(a.status)}>{tStatus(a.status)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}