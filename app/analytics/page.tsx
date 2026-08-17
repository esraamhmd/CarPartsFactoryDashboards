'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/ui/PageHeader';
import { useI18n } from '@/i18n';
import production from '@/data/production.json';
import finance from '@/data/finance.json';
import employeesData from '@/data/employees.json';

const RadarChart  = dynamic(() => import('recharts').then(m=>m.RadarChart), {ssr:false});
const Radar       = dynamic(() => import('recharts').then(m=>m.Radar), {ssr:false});
const PolarGrid   = dynamic(() => import('recharts').then(m=>m.PolarGrid), {ssr:false});
const PolarAngleAxis = dynamic(() => import('recharts').then(m=>m.PolarAngleAxis), {ssr:false});
const PolarRadiusAxis = dynamic(() => import('recharts').then(m=>m.PolarRadiusAxis), {ssr:false});
const LineChart   = dynamic(() => import('recharts').then(m=>m.LineChart), {ssr:false});
const Line        = dynamic(() => import('recharts').then(m=>m.Line), {ssr:false});
const BarChart    = dynamic(() => import('recharts').then(m=>m.BarChart), {ssr:false});
const Bar         = dynamic(() => import('recharts').then(m=>m.Bar), {ssr:false});
const XAxis       = dynamic(() => import('recharts').then(m=>m.XAxis), {ssr:false});
const YAxis       = dynamic(() => import('recharts').then(m=>m.YAxis), {ssr:false});
const Tooltip     = dynamic(() => import('recharts').then(m=>m.Tooltip), {ssr:false});
const CartesianGrid = dynamic(() => import('recharts').then(m=>m.CartesianGrid), {ssr:false});
const Legend      = dynamic(() => import('recharts').then(m=>m.Legend), {ssr:false});
const ResponsiveContainer = dynamic(() => import('recharts').then(m=>m.ResponsiveContainer), {ssr:false});

export default function AnalyticsPage() {
  const { lang, tNum, tMonth, tDay } = useI18n();

  const tt = { background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:12 };

  const performanceData = employeesData.slice(0,8).map(e => ({
    name: e.name.split(' ')[0],
    performance: e.performance,
    attendance: e.attendance,
  }));

  const radarData = [
    { metric: lang==='ar'?'الإنتاج':'Production',  value: 87 },
    { metric: lang==='ar'?'الجودة':'Quality',       value: 92 },
    { metric: lang==='ar'?'الكفاءة':'Efficiency',   value: 79 },
    { metric: lang==='ar'?'الأمان':'Safety',        value: 96 },
    { metric: lang==='ar'?'التوصيل':'Delivery',     value: 83 },
    { metric: lang==='ar'?'التكلفة':'Cost',         value: 74 },
  ];

  const monthlyData = finance.monthly.map(m => ({
    month: tMonth(m.month),
    revenue: Math.round(m.revenue/1000),
    profit: Math.round(m.profit/1000),
  }));

  const weeklyData = production.daily.map(d => ({
    day: tDay(d.day),
    actual: d.actual,
    target: d.target,
    defects: d.defects,
  }));

  return (
    <div className="animate-in">
      <PageHeader
        title={lang==='ar'?'التحليلات':'Analytics'}
        subtitle={lang==='ar'?'رؤى الأداء والاتجاهات':'Performance insights and trends'}
      />

      {/* KPI summary */}
      <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:lang==='ar'?'كفاءة الإنتاج':'Prod. Efficiency', value:'87%', color:'var(--success)' },
          { label:lang==='ar'?'معدل الجودة':'Quality Rate',        value:'94%', color:'var(--blue)' },
          { label:lang==='ar'?'معدل التسليم':'On-Time Delivery',   value:'91%', color:'var(--primary)' },
          { label:lang==='ar'?'رضا العملاء':'Customer Satisfaction', value:'4.6/5', color:'var(--warning)' },
        ].map(k=>(
          <div key={k.label} className="card card-hover" style={{ padding:'16px 18px', textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:800, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:5 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Row 1 */}
      <div className="grid-cols-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>
            {lang==='ar'?'الإيرادات والأرباح الشهرية ($K)':'Monthly Revenue & Profit ($K)'}
          </div>
          <Suspense fallback={<div className="skeleton" style={{ height:220 }} />}>
            <div dir="ltr" style={{ flex:1, minHeight:0 }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData} margin={{ top:5, right:10, bottom:15, left:55 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={tt} formatter={(v:any)=>['$'+v+'K','']} />
                <Legend wrapperStyle={{ fontSize:11 }} formatter={v=>v==='revenue'?(lang==='ar'?'إيرادات':'Revenue'):(lang==='ar'?'أرباح':'Profit')} />
                <Line type="monotone" dataKey="revenue" stroke="#00C68D" strokeWidth={2.5} dot={{ r:3 }} name="revenue" />
                <Line type="monotone" dataKey="profit"  stroke="#0055DA" strokeWidth={2}   dot={{ r:3 }} name="profit" />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </Suspense>
        </div>

        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>
            {lang==='ar'?'مؤشرات الأداء (رادار)':'Performance KPIs (Radar)'}
          </div>
          <Suspense fallback={<div className="skeleton" style={{ height:220 }} />}>
            <div dir="ltr" style={{ flex:1, minHeight:0 }}>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="60%" margin={{ top:30, right:50, bottom:30, left:50 }}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize:11, fill:'var(--text-secondary)', fontWeight:500 }} />
                <PolarRadiusAxis angle={30} domain={[0,100]} tick={false} axisLine={false} />
                <Radar name={lang==='ar'?'الأداء':'Performance'} dataKey="value" stroke="#0055DA" fill="#0055DA" fillOpacity={0.18} strokeWidth={2} />
                <Tooltip contentStyle={tt} />
              </RadarChart>
            </ResponsiveContainer>
            </div>
          </Suspense>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid-cols-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>
            {lang==='ar'?'المخرجات اليومية':'Daily Production Output'}
          </div>
          <Suspense fallback={<div className="skeleton" style={{ height:200 }} />}>
            <div dir="ltr" style={{ flex:1, minHeight:0 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barSize={16} margin={{ top:5, right:10, bottom:15, left:55 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={tt} />
                <Legend wrapperStyle={{ fontSize:11 }} formatter={v=>v==='actual'?(lang==='ar'?'الفعلي':'Actual'):(lang==='ar'?'المستهدف':'Target')} />
                <Bar dataKey="actual" fill="#FF3483" radius={[5,5,0,0]} name="actual" />
                <Bar dataKey="target" fill="#0055DA" radius={[5,5,0,0]} name={lang==='ar'?'المستهدف':'Target'} opacity={0.75} />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </Suspense>
        </div>

        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>
            {lang==='ar'?'أداء الموظفين':'Employee Performance vs Attendance'}
          </div>
          <Suspense fallback={<div className="skeleton" style={{ height:200 }} />}>
            <div dir="ltr" style={{ flex:1, minHeight:0 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={performanceData} barSize={12} margin={{ top:5, right:10, bottom:15, left:50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[70,100]} width={50} />
                <Tooltip contentStyle={tt} />
                <Legend wrapperStyle={{ fontSize:11 }} formatter={v=>v==='performance'?(lang==='ar'?'الأداء':'Perf.'):(lang==='ar'?'الحضور':'Attend.')} />
                <Bar dataKey="performance" fill="#FF3483" radius={[5,5,0,0]} name="performance" />
                <Bar dataKey="attendance"  fill="#0055DA" radius={[5,5,0,0]} name="attendance" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}