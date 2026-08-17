'use client';
import { useState } from 'react';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/ui/PageHeader';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { useI18n } from '@/i18n';
import attendanceData from '@/data/attendance.json';

const BarChart   = dynamic(() => import('recharts').then(m=>m.BarChart), {ssr:false});
const Bar        = dynamic(() => import('recharts').then(m=>m.Bar), {ssr:false});
const XAxis      = dynamic(() => import('recharts').then(m=>m.XAxis), {ssr:false});
const YAxis      = dynamic(() => import('recharts').then(m=>m.YAxis), {ssr:false});
const Tooltip    = dynamic(() => import('recharts').then(m=>m.Tooltip), {ssr:false});
const CartesianGrid = dynamic(() => import('recharts').then(m=>m.CartesianGrid), {ssr:false});
const Legend     = dynamic(() => import('recharts').then(m=>m.Legend), {ssr:false});
const ResponsiveContainer = dynamic(() => import('recharts').then(m=>m.ResponsiveContainer), {ssr:false});

export default function AttendancePage() {
  const [attPage, setAttPage] = useState(1);
  const ATT_PER_PAGE = 10;
  const { lang, tDay, tStatus } = useI18n();

  const today = attendanceData.today;
  const present  = today.filter(a=>a.status==='on-time').length;
  const late     = today.filter(a=>a.status==='late').length;
  const absent   = today.filter(a=>a.status==='absent').length;
  const rate     = Math.round(((present+late)/today.length)*100);

  const weeklyData = attendanceData.weekly_stats.map(d => ({
    ...d, day: tDay(d.day),
  }));

  const tt = { background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:12 };

  return (
    <div className="animate-in">
      <PageHeader
        title={lang==='ar'?'الحضور':'Attendance'}
        subtitle={lang==='ar'?'تتبع الحضور اليومي':'Daily attendance tracking'}
      />

      <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:lang==='ar'?'في الوقت':'On Time', value:present, color:'var(--success)' },
          { label:lang==='ar'?'متأخر':'Late',        value:late,    color:'var(--warning)' },
          { label:lang==='ar'?'غائب':'Absent',       value:absent,  color:'var(--primary)' },
          { label:lang==='ar'?'معدل الحضور':'Rate',  value:rate+'%',color:'var(--blue)' },
        ].map(k=>(
          <div key={k.label} className="card card-hover" style={{ padding:'16px 18px', textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:800, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:5 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts stacks on mobile */}
      <div className="grid-cols-2" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:18, marginBottom:20 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>
            {lang==='ar'?'إحصائيات الأسبوع':'Weekly Stats'}
          </div>
          <Suspense fallback={<div className="skeleton" style={{ height:220 }} />}>
            <div dir="ltr" style={{ flex:1, minHeight:0 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} barSize={14} margin={{ top:5, right:10, bottom:15, left:50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={tt} />
                <Legend wrapperStyle={{ fontSize:11 }} formatter={v=>
                  v==='present'?(lang==='ar'?'حاضر':'Present'):
                  v==='late'?(lang==='ar'?'متأخر':'Late'):
                  (lang==='ar'?'غائب':'Absent')
                } />
                <Bar dataKey="present" fill="#00C68D" radius={[4,4,0,0]} stackId="a" name={lang==='ar'?'حاضر':'Present'} />
                <Bar dataKey="late"    fill="#FFD400" radius={[0,0,0,0]} stackId="a" name={lang==='ar'?'متأخر':'Late'} />
                <Bar dataKey="absent"  fill="#FF3483" radius={[4,4,0,0]} stackId="a" name={lang==='ar'?'غائب':'Absent'} />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </Suspense>
        </div>

        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>
            {lang==='ar'?'ملخص اليوم':'Today Summary'}
          </div>
          {[
            { label:lang==='ar'?'في الوقت':'On Time', count:present, color:'var(--success)' },
            { label:lang==='ar'?'متأخر':'Late',       count:late,    color:'var(--warning)' },
            { label:lang==='ar'?'غائب':'Absent',      count:absent,  color:'var(--primary)' },
          ].map(item=>(
            <div key={item.label} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize:13, fontWeight:700, color:item.color }}>{item.count}/{today.length}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width:`${(item.count/today.length)*100}%`, background:item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ padding:'13px 18px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:14 }}>
          {lang==='ar'?'حضور اليوم':'Today\'s Attendance'}
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>{lang==='ar'?'الاسم':'Name'}</th>
              <th>{lang==='ar'?'وقت الدخول':'Check In'}</th>
              <th className="hide-tab">{lang==='ar'?'الوردية':'Shift'}</th>
              <th>{lang==='ar'?'الحالة':'Status'}</th>
            </tr></thead>
            <tbody>
              {today.slice((attPage-1)*ATT_PER_PAGE, attPage*ATT_PER_PAGE).map(a=>(
                <tr key={a.employeeId}>
                  <td style={{ fontWeight:600, fontSize:13 }}>{a.name}</td>
                  <td style={{ fontSize:13, color:'var(--text-secondary)', fontVariantNumeric:'tabular-nums' }}>{a.checkIn||'—'}</td>
                  <td className="hide-tab" style={{ fontSize:12, color:'var(--text-secondary)', textTransform:'capitalize' }}>
                    {lang==='ar'?(a.shift==='morning'?'صباحية':a.shift==='evening'?'مسائية':'ليلية'):a.shift}
                  </td>
                  <td><Badge variant={statusToVariant(a.status)}>{lang==='ar'?({'present':'حاضر','absent':'غائب','late':'متأخر','on-leave':'في إجازة','on time':'في الوقت','on-time':'في الوقت'}[a.status]||tStatus(a.status)):tStatus(a.status)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={attPage} total={today.length} perPage={ATT_PER_PAGE} onChange={setAttPage} />
    </div>
  );
}