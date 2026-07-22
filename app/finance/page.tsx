'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MdTrendingUp, MdTrendingDown, MdAccountBalance, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import PageHeader from '@/components/ui/PageHeader';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import { useI18n } from '@/i18n';
import finance from '@/data/finance.json';

const AreaChart  = dynamic(() => import('recharts').then(m=>m.AreaChart), {ssr:false});
const Area       = dynamic(() => import('recharts').then(m=>m.Area), {ssr:false});
const BarChart   = dynamic(() => import('recharts').then(m=>m.BarChart), {ssr:false});
const Bar        = dynamic(() => import('recharts').then(m=>m.Bar), {ssr:false});
const PieChart   = dynamic(() => import('recharts').then(m=>m.PieChart), {ssr:false});
const Pie        = dynamic(() => import('recharts').then(m=>m.Pie), {ssr:false});
const Cell       = dynamic(() => import('recharts').then(m=>m.Cell), {ssr:false, loading: () => null});
const XAxis      = dynamic(() => import('recharts').then(m=>m.XAxis), {ssr:false});
const YAxis      = dynamic(() => import('recharts').then(m=>m.YAxis), {ssr:false});
const Tooltip    = dynamic(() => import('recharts').then(m=>m.Tooltip), {ssr:false});
const CartesianGrid = dynamic(() => import('recharts').then(m=>m.CartesianGrid), {ssr:false});
const Legend     = dynamic(() => import('recharts').then(m=>m.Legend), {ssr:false});
const ResponsiveContainer = dynamic(() => import('recharts').then(m=>m.ResponsiveContainer), {ssr:false});

const PIE_COLORS = ['#00E0BA','#FF3483','#FFD400','#0055DA','#91008D','#00C68D','#36ADA3','#FF0052'];

export default function FinancePage() {
  const { lang, tNum, tMonth } = useI18n();

  const monthlyData = finance.monthly.map(m => ({ ...m, month: tMonth(m.month) }));
  const tt = { background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:12 };

  const kpis = [
    { label: lang==='ar'?'الإيرادات':'Revenue',      value:`$${(finance.summary.revenue/1000000).toFixed(2)}M`,    color:'var(--success)', icon:MdArrowUpward },
    { label: lang==='ar'?'المصروفات':'Expenses',      value:`$${(finance.summary.expenses/1000000).toFixed(2)}M`,   color:'var(--primary)', icon:MdArrowDownward },
    { label: lang==='ar'?'صافي الربح':'Net Profit',   value:`$${(finance.summary.profit/1000000).toFixed(2)}M`,     color:'var(--blue)', icon:MdTrendingUp },
    { label: lang==='ar'?'هامش الربح':'Profit Margin',value:`${finance.summary.profitMargin}%`,                    color:'var(--warning)', icon:MdAccountBalance },
  ];

  return (
    <div className="animate-in">
      <PageHeader
        title={lang==='ar'?'المالية':'Finance'}
        subtitle={lang==='ar'?'الإيرادات والمصروفات والأرباح':'Revenue, expenses and profit'}
      />

      {/* KPIs */}
      <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {kpis.map(k => (
          <div key={k.label} className="card card-hover" style={{ padding:'16px 18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>{k.label}</div>
                <div style={{ fontSize:26, fontWeight:800, color:k.color }}>{k.value}</div>
              </div>
              <div style={{ width:38, height:38, borderRadius:10, background:k.color+'18', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <k.icon size={18} style={{ color:k.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-cols-2" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:18, marginBottom:20 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>
            {lang==='ar'?'الإيرادات والأرباح الشهرية':'Monthly Revenue & Profit'}
          </div>
          <Suspense fallback={<div className="skeleton" style={{ height:220 }} />}>
            <div dir="ltr" style={{ flex:1, minHeight:0 }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top:10, right:20, bottom:20, left:55 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#059669" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.20}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize:10, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} dy={8} interval={0} />
                <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={55} tickFormatter={v=>'$'+(v/1000)+'K'} />
                <Tooltip contentStyle={tt} formatter={(v:any)=>['$'+Number(v).toLocaleString(),'']} />
                <Legend wrapperStyle={{ fontSize:11 }} formatter={v=>v==='revenue'?(lang==='ar'?'الإيرادات':'Revenue'):(lang==='ar'?'الأرباح':'Profit')} />
                <Area type="monotone" dataKey="revenue" stroke="#00E0BA" fill="url(#gRev)"    strokeWidth={2.5} name="revenue" />
                <Area type="monotone" dataKey="profit"  stroke="#0055DA" fill="url(#gProfit)" strokeWidth={2}   name="profit" />
              </AreaChart>
            </ResponsiveContainer>
            </div>
          </Suspense>
        </div>

        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>
            {lang==='ar'?'توزيع المصروفات':'Expense Breakdown'}
          </div>
          <Suspense fallback={<div className="skeleton" style={{ height:160, borderRadius:'50%', width:160, margin:'0 auto' }} />}>
            <div dir="ltr" style={{ flex:1, minHeight:0 }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={finance.expenses_breakdown.map((item,i)=>({
                    ...item,
                    fill: PIE_COLORS[i % PIE_COLORS.length],
                  }))}
                  cx="50%" cy="50%"
                  innerRadius={35} outerRadius={75}
                  dataKey="value"
                  nameKey={lang==='ar'?'nameAr':'name'}
                  stroke="#fff"
                  strokeWidth={2}
                  paddingAngle={3}
                >
                  {finance.expenses_breakdown.map((_,i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tt} formatter={(v:any)=>['$'+Number(v).toLocaleString(),'']} />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </Suspense>
          {finance.expenses_breakdown.map((item,i)=>(
            <div key={lang==='ar' ? (item.nameAr || item.name) : item.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:12, height:12, borderRadius:3, background:PIE_COLORS[i%PIE_COLORS.length], flexShrink:0 }}/>
                <span style={{ fontSize:11.5, color:'var(--text-secondary)' }}>
                  {lang==='ar'?(item as any).nameAr||item.name:item.name}
                </span>
              </div>
              <span style={{ fontSize:11.5, fontWeight:600 }}>${(item.value/1000).toFixed(0)}K</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions table */}
      <div className="card">
        <div style={{ padding:'13px 18px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:14 }}>
          {lang==='ar'?'أحدث المعاملات':'Recent Transactions'}
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>{lang==='ar'?'رقم المعاملة':'ID'}</th>
              <th>{lang==='ar'?'الوصف':'Description'}</th>
              <th className="hide-mob">{lang==='ar'?'التاريخ':'Date'}</th>
              <th>{lang==='ar'?'المبلغ':'Amount'}</th>
              <th>{lang==='ar'?'الحالة':'Status'}</th>
            </tr></thead>
            <tbody>
              {finance.transactions.map(tx=>(
                <tr key={tx.id}>
                  <td style={{ fontSize:12, fontWeight:600, color:'var(--blue)' }}>{tx.id}</td>
                  <td style={{ fontSize:12 }}>{lang==='ar'?(tx as any).descriptionAr||tx.description:tx.description}</td>
                  <td className="hide-mob" style={{ fontSize:11, color:'var(--text-muted)' }}>{tx.date}</td>
                  <td style={{ fontWeight:700, fontSize:13, color:tx.type==='income'?'var(--success)':'var(--primary)' }}>
                    {tx.type==='income'?'+':''}{tx.amount<0?'-$'+Math.abs(tx.amount).toLocaleString():'$'+tx.amount.toLocaleString()}
                  </td>
                  <td><Badge variant={statusToVariant(tx.status)}>{lang==='ar'?(tx as any).statusAr||tx.status:tx.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}