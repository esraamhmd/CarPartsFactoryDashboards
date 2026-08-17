'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/ui/PageHeader';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import { useI18n } from '@/i18n';
import productionData from '@/data/production.json';

const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false });
const ComposedChart = dynamic(() => import('recharts').then(m => m.ComposedChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false });
const ReferenceLine = dynamic(() => import('recharts').then(m => m.ReferenceLine), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });

// 2024–2026 forecast data
const forecastData = [
  { month:'Jan 25', actual:2870,  forecast:null,  label:'يناير 25' },
  { month:'Apr 25', actual:3050,  forecast:null,  label:'أبريل 25' },
  { month:'Jul 25', actual:3200,  forecast:null,  label:'يوليو 25' },
  { month:'Oct 25', actual:3380,  forecast:null,  label:'أكتوبر 25' },
  { month:'Jan 26', actual:3510,  forecast:3510,  label:'يناير 26' },
  { month:'Apr 26', actual:null,  forecast:3680,  label:'أبريل 26' },
  { month:'Jul 26', actual:null,  forecast:3820,  label:'يوليو 26' },
  { month:'Oct 26', actual:null,  forecast:3950,  label:'أكتوبر 26' },
];

export default function ProductionPage() {
  const { lang, tNum, tDay, tMonth } = useI18n();

  const p = productionData;
  const todayTotal  = p.daily.reduce((s, d) => s + d.actual, 0);
  const todayTarget = p.daily.reduce((s, d) => s + d.target, 0);
  const efficiency  = Math.round((todayTotal / todayTarget) * 100);
  const totalDefects = p.daily.reduce((s, d) => s + d.defects, 0);

  const ttStyle = { background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:12 };

  const dailyAr = p.daily.map(d => ({ ...d, displayDay: tDay(d.day) }));
  const monthlyAr = p.monthly.map(m => ({ ...m, displayMonth: tMonth(m.month) }));
  const forecastAr = forecastData.map(d => ({ ...d, displayMonth: lang==='ar' ? d.label : d.month }));

  const kpis = [
    { label: lang==='ar'?'إجمالي المخرجات هذا الأسبوع':'This Week Output', value: todayTotal, color:'var(--primary)', unit: lang==='ar'?'وحدة':'units' },
    { label: lang==='ar'?'الهدف الأسبوعي':'Weekly Target',                 value: todayTarget, color:'var(--accent-blue)', unit: lang==='ar'?'وحدة':'units' },
    { label: lang==='ar'?'الكفاءة':'Efficiency',                            value: efficiency+'%', color: efficiency>=95?'var(--success)':'var(--warning)', unit:'' },
    { label: lang==='ar'?'إجمالي العيوب':'Total Defects',                   value: totalDefects, color:'var(--warning)', unit:'' },
  ];

  return (
    <div className="animate-in">
      <PageHeader
        title={lang==='ar'?'الإنتاج':'Production'}
        subtitle={lang==='ar'?'خطوط الإنتاج، المخرجات، والكفاءة':'Lines, output, and efficiency tracking'}
      />

      {/* KPIs */}
      <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {kpis.map(k => (
          <div key={k.label} className="card card-hover" style={{ padding:'16px 18px', textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:800, color:k.color }}>{k.value}</div>
            {k.unit && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{k.unit}</div>}
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row — stacks on mobile */}
      <div className="grid-cols-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:22 }}>
        {/* Daily output */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>
            {lang==='ar'?'المخرجات اليومية':'Daily Output'}
          </div>
          <Suspense fallback={<div className="skeleton" style={{ height:220 }} />}>
            <div dir="ltr" style={{ flex:1, minHeight:0 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyAr} barSize={10} barCategoryGap="30%" margin={{ top:10, right:20, bottom:20, left:55 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="displayDay" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} width={50} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ttStyle} />
                <Legend wrapperStyle={{ fontSize:12 }} formatter={v => v==='actual'?(lang==='ar'?'الفعلي':'Actual'):(lang==='ar'?'المستهدف':'Target')} />
                <Bar dataKey="target" fill="#0055DA" radius={[4,4,0,0]} name={lang==='ar'?'المستهدف':'Target'} opacity={0.75} />
                <Bar dataKey="actual" fill="#FF3483" radius={[4,4,0,0]} name={lang==='ar'?'الفعلي':'Actual'} />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </Suspense>
        </div>

        {/* Production Forecast — BLUE tones instead of red */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>
            {lang==='ar'?'توقعات الإنتاج (فعلي + 3 أشهر مستقبلية)':'Production Forecast — Actual + 3‑month forecast'}
          </div>
          <Suspense fallback={<div className="skeleton" style={{ height:220 }} />}>
            <div dir="ltr" style={{ flex:1, minHeight:0 }}>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={forecastAr} margin={{ top:10, right:20, bottom:20, left:55 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="displayMonth" tick={{ fontSize:10, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} width={50} axisLine={false} tickLine={false} domain={[2500, 4200]} />
                <Tooltip contentStyle={ttStyle} />
                <Legend wrapperStyle={{ fontSize:12 }} formatter={v => v==='actual'?(lang==='ar'?'الفعلي':'Actual'):(lang==='ar'?'التوقع':'Forecast')} />
                <ReferenceLine x={lang==='ar'?'يناير 26':'Jan 26'} stroke="var(--border)" strokeDasharray="5 5" label={{ value: lang==='ar'?'اليوم':'Now', fill:'var(--text-muted)', fontSize:10 }} />
                {/* Actual — solid teal/blue */}
                <Area dataKey="actual"   type="monotone" stroke="#00E0BA" fill="rgba(14,165,233,0.15)" strokeWidth={2.5} name="actual"   connectNulls={false} dot={{ r:3, fill:'#0ea5e9' }} />
                {/* Forecast — dashed purple */}
                <Line dataKey="forecast" type="monotone" stroke="#36ADA3" strokeWidth={2} strokeDasharray="6 3" name="forecast" connectNulls={false} dot={{ r:3, fill:'#8b5cf6' }} />
              </ComposedChart>
            </ResponsiveContainer>
            </div>
          </Suspense>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="card" style={{ padding:20, marginBottom:22 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>
          {lang==='ar'?'الاتجاه الشهري للإيرادات والإنتاج':'Monthly Revenue & Production Trend'}
        </div>
        <Suspense fallback={<div className="skeleton" style={{ height:220 }} />}>
          <div dir="ltr" style={{ flex:1, minHeight:0 }}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyAr} margin={{ top:10, right:20, bottom:20, left:55 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="displayMonth" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} width={50} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ttStyle} formatter={(v:any) => ['$'+(Number(v)/1000).toFixed(0)+'K', '']} />
              <Legend wrapperStyle={{ fontSize:12 }} formatter={v => v==='revenue'?(lang==='ar'?'الإيرادات':'Revenue'):(lang==='ar'?'المخرجات':'Output')} />
              <Area dataKey="revenue" type="monotone" stroke="#00C68D"      fill="rgba(5,150,105,0.12)"  strokeWidth={2.5} name="revenue" />
              <Area dataKey="actual"  type="monotone" stroke="#0055DA"  fill="rgba(37,99,235,0.08)"  strokeWidth={2}   name="actual" />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </Suspense>
      </div>

      {/* Production Lines */}
      <div className="card">
        <div style={{ padding:'12px 18px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:15 }}>
          {lang==='ar'?'خطوط الإنتاج':'Production Lines'}
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>{lang==='ar'?'الخط':'Line'}</th>
              <th>{lang==='ar'?'الحالة':'Status'}</th>
              <th>{lang==='ar'?'الكفاءة':'Efficiency'}</th>
              <th>{lang==='ar'?'المخرجات اليوم':'Output Today'}</th>
            </tr></thead>
            <tbody>
              {p.lines.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight:600 }}>{l.name}</td>
                  <td><Badge variant={statusToVariant(l.status)}>{lang==='ar'?(l.status==='running'?'تعمل':'صيانة'):l.status}</Badge></td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="progress-bar" style={{ width:80, flex:'none' }}>
                        <div className="progress-fill" style={{ width:l.efficiency+'%', background: l.efficiency>=90?'var(--success)':l.efficiency>0?'var(--warning)':'var(--border)' }} />
                      </div>
                      <span style={{ fontSize:12, fontWeight:600 }}>{l.efficiency}%</span>
                    </div>
                  </td>
                  <td style={{ fontWeight:600 }}>{l.output} {lang==='ar'?'وحدة':'units'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}