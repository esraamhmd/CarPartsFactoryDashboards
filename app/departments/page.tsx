'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MdPeople, MdAdd, MdDelete } from 'react-icons/md';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { FormField, Input, Textarea, FormActions } from '@/components/ui/FormField';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';
import employeesData from '@/data/employees.json';

const BarChart        = dynamic(() => import('recharts').then(m=>m.BarChart),         {ssr:false});
const Bar             = dynamic(() => import('recharts').then(m=>m.Bar),              {ssr:false});
const XAxis           = dynamic(() => import('recharts').then(m=>m.XAxis),            {ssr:false});
const YAxis           = dynamic(() => import('recharts').then(m=>m.YAxis),            {ssr:false});
const Tooltip         = dynamic(() => import('recharts').then(m=>m.Tooltip),          {ssr:false});
const CartesianGrid   = dynamic(() => import('recharts').then(m=>m.CartesianGrid),    {ssr:false});
const ResponsiveContainer = dynamic(() => import('recharts').then(m=>m.ResponsiveContainer), {ssr:false});

const SURL = 'https://vopgydykkzxcfnnqoize.supabase.co';
const SKEY = 'sb_publishable_aTFOgIF4IwUsj0c2ehHiLw_slfSIWxi';
const H = {
  'apikey': SKEY,
  'Authorization': 'Bearer ' + SKEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
};

const COLORS: Record<string,string> = {
  Production:'#00E0BA','Quality Control':'#FF3483',Maintenance:'#FFD400',
  Inventory:'#0055DA',HR:'#91008D',Finance:'#00C68D',Sales:'#36ADA3',Engineering:'#FF0052',
};

const DEPT_AR: Record<string,string> = {
  Production:'الإنتاج','Quality Control':'مراقبة الجودة',Maintenance:'الصيانة',
  Inventory:'المخزون',HR:'الموارد البشرية',Finance:'المالية',Sales:'المبيعات',Engineering:'الهندسة',
};

const BASE_DEPTS = ['Production','Quality Control','Maintenance','Inventory','HR','Finance','Sales','Engineering'];

interface Dept { id?: number; name: string; description?: string; manager?: string; isBase?: boolean; }

export default function DepartmentsPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [extraDepts, setExtraDepts] = useState<Dept[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [form, setForm] = useState({ name:'', manager:'', description:'' });
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const SECRET_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';

  // Load extra departments from DB on mount
  useEffect(() => {
    fetch(SURL + '/rest/v1/departments?select=*&order=id.asc', {
      headers: { 'apikey': SKEY, 'Authorization': 'Bearer ' + SKEY }
    })
    .then(r => r.json())
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        // Only load departments NOT in base list (user-added ones)
        const extra = data.filter((d:any) => !BASE_DEPTS.includes(d.name));
        setExtraDepts(extra.map((d:any) => ({
          id: d.id, name: d.name, manager: d.manager || '', description: d.description || '', isBase: false,
        })));
      }
    })
    .catch(() => {});
  }, []);

  // Base departments from JSON (always has correct employee counts)
  const baseDepts: Dept[] = BASE_DEPTS.map(n => ({ name: n, isBase: true }));
  const allDepts = [...baseDepts, ...extraDepts];

  const deptStats = useMemo(() => allDepts.map(d => {
    const emps = employeesData.filter(e => e.department === d.name);
    return {
      ...d,
      count: emps.length,
      avgPerf: emps.length ? Math.round(emps.reduce((s,e)=>s+e.performance,0)/emps.length) : 0,
      avgSalary: emps.length ? Math.round(emps.reduce((s,e)=>s+e.salary,0)/emps.length) : 0,
      color: COLORS[d.name] || '#2563eb',
      employees: emps,
    };
  }), [allDepts]);

  const chartData = useMemo(() => deptStats.map(d => ({
    dept: lang === 'ar' ? (DEPT_AR[d.name] || d.name) : d.name.split(' ')[0],
    count: d.count,
  })), [deptStats, lang]);

  const tooltipStyle = { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 };

  const handleAdd = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!form.name.trim()) { toast(t('common.required') + '!', 'error'); return; }

    if (!password) { setPwError(lang==='ar'?'كلمة المرور مطلوبة':'Password is required'); return; }

    if (password !== SECRET_PW) { setPwError(lang==='ar'?'كلمة المرور غير صحيحة':'Incorrect password'); return; }
    if (BASE_DEPTS.includes(form.name)) { toast(lang==='ar'?'هذا القسم موجود بالفعل':'Department already exists', 'error'); return; }

    // Add to UI immediately
    const newDept: Dept = { name: form.name, manager: form.manager, description: form.description, isBase: false };
    setExtraDepts(p => [...p, newDept]);
    toast(t('toast.added'), 'success');
    setModalOpen(false);
    setForm({ name:'', manager:'', description:'' });

    // Save to DB
    fetch(SURL + '/rest/v1/departments', {
      method: 'POST',
      headers: H,
      body: JSON.stringify({
        name: form.name,
        manager: form.manager || null,
        description: form.description || null,
      }),
    }).then(r => {
      if (!r.ok) r.text().then(t => console.warn('Dept save failed:', t));
      else {
        // Reload to get the DB id
        fetch(SURL + '/rest/v1/departments?select=*&order=id.asc', {
          headers: { 'apikey': SKEY, 'Authorization': 'Bearer ' + SKEY }
        }).then(r2 => r2.json()).then((data: any[]) => {
          const extra = data.filter((d:any) => !BASE_DEPTS.includes(d.name));
          setExtraDepts(extra.map((d:any) => ({ id:d.id, name:d.name, manager:d.manager||'', description:d.description||'', isBase:false })));
        });
      }
    });
  };

  const handleDelete = async (dept: Dept) => {
    if (dept.isBase) {
      toast(lang==='ar' ? 'لا يمكن حذف الأقسام الأساسية' : 'Cannot delete base departments', 'error');
      return;
    }
    setExtraDepts(p => p.filter(d => d.name !== dept.name));
    toast(t('toast.deleted'), 'success');
    if (dept.id) {
      fetch(SURL + '/rest/v1/departments?id=eq.' + dept.id, { method:'DELETE', headers:H });
    }
  };

  return (
    <div className="animate-in">
      <PageHeader
        title={t('departments.title')}
        subtitle={deptStats.length + ' ' + t('departments.subtitle')}
        action={
          <Button variant="primary" onClick={() => { setForm({name:'',manager:'',description:''}); setPassword(''); setPwError(''); setModalOpen(true); }}>
            <MdAdd aria-hidden="true" size={16}/>{t('common.addDepartment')}
          </Button>
        }
      />

      {/* KPIs */}
      <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:t('employees.title'),         value:employeesData.length,   color:'var(--primary)' },
          { label:t('departments.title'),        value:deptStats.length,       color:'var(--accent-blue)' },
          { label:t('employees.avgPerformance'), value:Math.round(deptStats.filter(d=>d.avgPerf>0).reduce((s,d)=>s+d.avgPerf,0)/Math.max(1,deptStats.filter(d=>d.avgPerf>0).length))+'%', color:'var(--success)' },
          { label:t('payroll.baseSalary'),       value:'$'+Math.round(deptStats.filter(d=>d.avgSalary>0).reduce((s,d)=>s+d.avgSalary,0)/Math.max(1,deptStats.filter(d=>d.avgSalary>0).length)/100)/10+'K', color:'var(--warning)' },
        ].map(s => (
          <div key={s.label} className="card card-hover" style={{ padding:'16px 18px', textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Department Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:14, marginBottom:22 }}>
        {deptStats.map(dept => {
          const isActive = activeDept === dept.name;
          return (
            <div key={dept.name}
              onClick={() => setActiveDept(isActive ? null : dept.name)}
              className="card"
              style={{
                padding:18, cursor:'pointer',
                borderWidth: isActive ? '2px' : '1px', borderStyle:'solid',
                borderColor: isActive ? dept.color : 'var(--border)',
                background: isActive ? dept.color+'0c' : 'var(--bg-card)',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isActive ? '0 8px 24px '+dept.color+'25' : 'var(--shadow-sm)',
                transition:'all 200ms',
              }}>

              {/* Header */}
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
                  <div style={{ width:40, height:40, borderRadius:11, background:dept.color+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <MdPeople size={20} style={{ color:dept.color }} />
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, lineHeight:1.3 }}>
                      {lang==='ar' ? (DEPT_AR[dept.name] || dept.name) : dept.name}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>
                      {dept.count} {t('employees.title').toLowerCase()}
                    </div>
                    {dept.manager && (
                      <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>
                        {lang==='ar'?'المدير: ':'Mgr: '}{dept.manager}
                      </div>
                    )}
                  </div>
                </div>
                {!dept.isBase && (
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(dept); }}
                    style={{ background:'rgba(200,30,30,0.1)', borderWidth:0, borderStyle:'solid', borderColor:'transparent', borderRadius:7, padding:5, cursor:'pointer', color:'#c81e1e', display:'flex', flexShrink:0, marginInlineStart:6 }}>
                    <MdDelete aria-hidden="true" size={14}/>
                  </button>
                )}
              </div>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <div style={{ background:'var(--bg-page)', borderRadius:9, padding:'9px 12px', textAlign:'center' }}>
                  <div style={{ fontSize:18, fontWeight:800, color:dept.color }}>{dept.avgPerf}%</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:2 }}>{t('departments.avgPerf')}</div>
                </div>
                <div style={{ background:'var(--bg-page)', borderRadius:9, padding:'9px 12px', textAlign:'center' }}>
                  <div style={{ fontSize:16, fontWeight:800 }}>${(dept.avgSalary/1000).toFixed(1)}K</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:2 }}>{t('departments.avgSalary')}</div>
                </div>
              </div>

              {/* Team on click */}
              {isActive && dept.employees.length > 0 && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                    {lang==='ar' ? 'الفريق' : 'Team'}
                  </div>
                  {dept.employees.slice(0,4).map(emp => (
                    <div key={emp.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <div style={{ width:24, height:24, borderRadius:7, background:'linear-gradient(135deg,'+dept.color+','+dept.color+'99)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:700, flexShrink:0 }}>
                        {emp.name.charAt(0)}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{emp.name}</div>
                        <div style={{ fontSize:10, color:'var(--text-muted)' }}>{emp.role}</div>
                      </div>
                    </div>
                  ))}
                  {dept.employees.length > 4 && (
                    <div style={{ fontSize:11, color:'var(--text-muted)', textAlign:'center', marginTop:4 }}>
                      +{dept.employees.length-4} {lang==='ar'?'آخرين':'more'}
                    </div>
                  )}
                </div>
              )}
              {isActive && dept.employees.length === 0 && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)', textAlign:'center', color:'var(--text-muted)', fontSize:12 }}>
                  {lang==='ar'?'لا يوجد موظفون بعد':'No employees yet'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="card" style={{ padding:20 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>{t('departments.headcount')}</div>
        <Suspense fallback={<div className="skeleton" style={{ height:220 }} />}>
          <div dir="ltr">
            <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 38)}>
              <BarChart data={chartData} layout="vertical" barSize={18} margin={{ top:4, right:40, bottom:4, left:4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="dept" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={120} tickFormatter={v=>v.length>16?v.slice(0,16)+'…':v} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[0,6,6,0]} fill="#00C68D" name={t('employees.title')} label={{ position:'right', fontSize:11, fill:'var(--text-muted)' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Suspense>
      </div>

      {/* Add Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('common.addDepartment')} size="sm">
        <form onSubmit={handleAdd}>
          <FormField label={t('common.name')} required>
            <Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
              placeholder={lang==='ar'?'مثال: البحث والتطوير':'e.g. R&D'} required />
          </FormField>
          <FormField label={lang==='ar'?'المدير':'Manager'}>
            <Input value={form.manager} onChange={e=>setForm({...form,manager:e.target.value})}
              placeholder={lang==='ar'?'اسم المدير':'Ahmed Hassan'} />
          </FormField>
          <FormField label={lang==='ar'?'الوصف':'Description'}>
            <Textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
              placeholder={lang==='ar'?'وصف القسم...':'Department description...'} />
          </FormField>
          <FormField label={lang==='ar'?'كلمة المرور':'Password'} required>

            <Input

              type="password"

              value={password}

              onChange={e=>{ setPassword(e.target.value); setPwError(''); }}

              placeholder={lang==='ar'?'أدخل كلمة المرور':'Enter password'}

              error={!!pwError}

            />

            {pwError && <div style={{ fontSize:11.5, color:'#dc2626', marginTop:4 }}>⚠ {pwError}</div>}

          </FormField>

          <FormActions>

            <Button variant="secondary" type="button" onClick={()=>setModalOpen(false)}>{t('common.cancel')}</Button>

            <Button variant="primary" type="submit">{t('common.addDepartment')}</Button>

          </FormActions>
        </form>
      </Modal>
    </div>
  );
}