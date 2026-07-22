'use client';

import { useState } from 'react';
import { MdDownload, MdCheckCircle } from 'react-icons/md';
import dynamic from 'next/dynamic';
const BarChart = dynamic(()=>import('recharts').then(m=>m.BarChart),{ssr:false});
const Bar = dynamic(()=>import('recharts').then(m=>m.Bar),{ssr:false});
const XAxis = dynamic(()=>import('recharts').then(m=>m.XAxis),{ssr:false});
const YAxis = dynamic(()=>import('recharts').then(m=>m.YAxis),{ssr:false});
const Tooltip = dynamic(()=>import('recharts').then(m=>m.Tooltip),{ssr:false});
const ResponsiveContainer = dynamic(()=>import('recharts').then(m=>m.ResponsiveContainer),{ssr:false});
const CartesianGrid = dynamic(()=>import('recharts').then(m=>m.CartesianGrid),{ssr:false});
const PieChart = dynamic(()=>import('recharts').then(m=>m.PieChart),{ssr:false});
const Pie = dynamic(()=>import('recharts').then(m=>m.Pie),{ssr:false});
const Cell = dynamic(()=>import('recharts').then(m=>m.Cell),{ssr:false,loading:()=>null});
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';
import payrollData from '@/data/payroll.json';

const COLORS = ['#CC0000','#0055DA','#00C68D','#FFD400'];

export default function PayrollPage() {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [payroll, setPayroll] = useState([...payrollData]);
  const [exporting, setExporting] = useState(false);

  const totalNet = payroll.reduce((s,p)=>s+p.netPay,0);
  const totalBonus = payroll.reduce((s,p)=>s+p.bonus,0);
  const totalDeductions = payroll.reduce((s,p)=>s+p.deductions,0);

  const breakdownData = [
    { name:'Base Salary', value:payroll.reduce((s,p)=>s+p.baseSalary,0) },
    { name:'Overtime', value:payroll.reduce((s,p)=>s+p.overtime,0) },
    { name:'Bonuses', value:totalBonus },
    { name:'Deductions', value:totalDeductions },
  ];

  const handleMarkPaid = (id: number) => {
    setPayroll(payroll.map(p=>p.id===id?{...p,status:'paid'}:p));
    toast('Payslip marked as paid!','success');
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(()=>{
      const csv = ['Employee,Base Salary,Bonus,Overtime,Deductions,Net Pay,Status',
        ...payroll.map(p=>`${p.name},${p.baseSalary},${p.bonus},${p.overtime},${p.deductions},${p.netPay},${p.status}`)
      ].join('\n');
      const blob = new Blob([csv],{type:'text/csv'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'MotorSync_Payroll_January2025.csv';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      setExporting(false);
      toast('Payroll exported as CSV!','success');
    },1200);
  };

  return (
    <div className="animate-in">
      <PageHeader title={t('payroll.title')} subtitle={t('payroll.subtitle')}
        action={<Button variant="primary" onClick={handleExport} disabled={exporting}>
          <MdDownload size={16}/>{exporting?'Exporting...':t('common.exportPayroll')}
        </Button>}
      />

      <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        {[
          { label:t('payroll.totalNetPay'), value:'$'+totalNet.toLocaleString(), color:'#00C68D' },
          { label:t('payroll.totalBonuses'), value:'$'+totalBonus.toLocaleString(), color:'#FFD400' },
          { label:t('payroll.totalDeductions'), value:'$'+totalDeductions.toLocaleString(), color:'#CC0000' },
          { label:t('payroll.employees'), value:payroll.length, color:'#0055DA' },
        ].map(s=>(
          <div key={s.label} className="card card-hover" style={{ padding:18, textAlign:'center' }}>
            <div style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-cols-2" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:24 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>{t('payroll.netPayByEmployee')}</div>
          <div dir="ltr">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={payroll} barSize={10} barCategoryGap="30%" margin={{ top:10, right:10, bottom:25, left:50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v=>v.split(' ')[0]} />
              <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} width={45} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:12 }} formatter={(v:any,name:any)=>['$'+Number(v).toLocaleString(), name]} />
              <Bar dataKey="baseSalary" fill="rgba(0,85,218,0.4)" radius={[0,0,0,0]} name={lang==='ar'?'الراتب الأساسي':'Base Salary'} stackId="a" />
              <Bar dataKey="bonus" fill="#FFD400" radius={[0,0,0,0]} name={lang==='ar'?'المكافأة':'Bonus'} stackId="a" />
              <Bar dataKey="overtime" fill="#00C68D" radius={[4,4,0,0]} name={lang==='ar'?'العمل الإضافي':'Overtime'} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>{t('payroll.payBreakdown')}</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={breakdownData.filter(d=>d.value>0).map((item,i)=>({...item, fill:COLORS[i%COLORS.length]}))}
                cx="50%" cy="50%"
                innerRadius={35} outerRadius={70}
                dataKey="value" stroke="#fff" strokeWidth={2} paddingAngle={3}
              >
                {breakdownData.filter(d=>d.value>0).map((_,i)=>(
                  <Cell key={i} fill={COLORS[i%COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v:any)=>['$'+Number(v).toLocaleString(),'']} contentStyle={{ background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:12 }}/>
            </PieChart>
          </ResponsiveContainer>
          {breakdownData.filter(d=>d.value>0).map((item,i)=>(
            <div key={item.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:8,height:8,borderRadius:2,background:COLORS[i] }}/><span style={{ fontSize:12,color:'var(--text-secondary)' }}>{item.name}</span></div>
              <span style={{ fontSize:12,fontWeight:600 }}>${item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:15 }}>{t('payroll.payslips')}</div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>{t('common.name')}</th>
              <th className="hide-mobile">{t('payroll.baseSalary')}</th>
              <th className="hide-mobile">{t('payroll.bonus')}</th>
              <th className="hide-mobile">{t('payroll.overtime')}</th>
              <th className="hide-tablet">{t('payroll.deductions')}</th>
              <th>{t('payroll.netPay')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr></thead>
            <tbody>
              {(payroll).slice((page-1)*PER_PAGE, page*PER_PAGE).map(p=>(
                <tr key={p.id}>
                  <td style={{ fontWeight:600, fontSize:13 }}>{p.name}</td>
                  <td className="hide-mobile">${p.baseSalary.toLocaleString()}</td>
                  <td className="hide-mobile" style={{ color:'#00C68D', fontWeight:600 }}>{p.bonus>0?'+$'+p.bonus.toLocaleString():'—'}</td>
                  <td className="hide-mobile" style={{ color:'#0055DA', fontWeight:600 }}>{p.overtime>0?'+$'+p.overtime.toLocaleString():'—'}</td>
                  <td className="hide-tablet" style={{ color:'#CC0000', fontWeight:600 }}>-${p.deductions.toLocaleString()}</td>
                  <td style={{ fontWeight:800, fontSize:14 }}>${p.netPay.toLocaleString()}</td>
                  <td><Badge variant={statusToVariant(p.status)}>{p.status}</Badge></td>
                  <td>
                    {p.status==='pending' && (
                      <button onClick={()=>handleMarkPaid(p.id)} style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(0,198,141,0.1)', border:'none', borderRadius:7, padding:'5px 10px', cursor:'pointer', color:'#00C68D', fontSize:11, fontWeight:600 }}>
                        <MdCheckCircle size={13}/>Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} total={payroll.length} perPage={PER_PAGE} onChange={setPage} />
    </div>
  );
}