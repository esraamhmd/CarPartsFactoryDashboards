'use client';

import { useState, useMemo, Suspense, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdClose } from 'react-icons/md';
import PageHeader from '@/components/ui/PageHeader';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { FormField, Input, Select, FormRow, FormActions } from '@/components/ui/FormField';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';
import Pagination from '@/components/ui/Pagination';
import { employeeSchema, type EmployeeForm } from '@/lib/validations';
import employeesData from '@/data/employees.json';

const SURL = 'https://vopgydykkzxcfnnqoize.supabase.co';
const SKEY = 'sb_publishable_aTFOgIF4IwUsj0c2ehHiLw_slfSIWxi';
const H = { 'apikey': SKEY, 'Authorization': `Bearer ${SKEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

async function dbInsert(data: Record<string,any>) {
  const res = await fetch(`${SURL}/rest/v1/employees`, { method:'POST', headers:H, body:JSON.stringify(data) });
  if (!res.ok) console.warn('Insert failed:', await res.text());
  return res.ok;
}
async function dbUpdate(id: number, data: Record<string,any>) {
  const res = await fetch(`${SURL}/rest/v1/employees?id=eq.${id}`, { method:'PATCH', headers:H, body:JSON.stringify(data) });
  if (!res.ok) console.warn('Update failed:', await res.text());
  return res.ok;
}
async function dbDelete(id: number) {
  const res = await fetch(`${SURL}/rest/v1/employees?id=eq.${id}`, { method:'DELETE', headers:H });
  if (!res.ok) console.warn('Delete failed:', await res.text());
  return res.ok;
}
async function dbFetch(): Promise<any[]> {
  const res = await fetch(`${SURL}/rest/v1/employees?select=*&order=id.asc&limit=500`, { headers:H });
  if (!res.ok) return [];
  return res.json();
}

type Employee = {
  id: number; name: string; email: string; phone: string; role: string;
  department: string; shift: string; salary: number; attendance: number;
  performance: number; status: string; joinDate: string;
};

const toEmployee = (d: any): Employee => ({
  id: d.id, name: d.name || '', email: d.email || '', phone: d.phone || '',
  role: d.role || '', department: d.department || 'Production',
  shift: d.shift || 'morning', salary: Number(d.salary) || 0,
  attendance: Number(d.attendance) || 0, performance: Number(d.performance) || 0,
  status: d.status || 'active', joinDate: d.join_date || d.joinDate || '',
});

const BLANK: EmployeeForm = { name:'', email:'', phone:'', role:'', department:'Production', shift:'morning', salary:5000, status:'active' };

const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });

export default function EmployeesPage() {
  const { t, lang, tStatus, tDept, tShift } = useI18n();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>(employeesData.map(toEmployee));
  const [loading, setLoading] = useState(true);
  const [allDepts, setAllDepts] = useState<string[]>(['Production','Quality Control','Maintenance','Inventory','HR','Finance','Sales']);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<EmployeeForm>({ ...BLANK });
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeForm, string>>>({});
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  // Load from DB on mount
  const loadFromDB = useCallback(async () => {
    const data = await dbFetch();
    if (data.length > 0) setEmployees(data.map(toEmployee));
    setLoading(false);
  }, []);

  useEffect(() => { loadFromDB(); }, [loadFromDB]);

  // Load extra departments from DB
  useEffect(() => {
    fetch(SURL + '/rest/v1/departments?select=name&order=id.asc', {
      headers: { 'apikey': SKEY, 'Authorization': 'Bearer ' + SKEY }
    }).then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const names = data.map((d: any) => d.name);
        setAllDepts(prev => {
          const merged = [...prev];
          names.forEach((n: string) => { if (!merged.includes(n)) merged.push(n); });
          return merged;
        });
      }
    }).catch(() => {});
  }, []);

  const departments = useMemo(() => ['all', ...Array.from(new Set(employees.map(e => e.department)))], [employees]);

  const filtered = useMemo(() => employees.filter(e => {
    const q = search.toLowerCase();
    return (e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.email.toLowerCase().includes(q))
      && (dept === 'all' || e.department === dept);
  }), [employees, search, dept]);

  const perfData = useMemo(() => employees.slice(0,8).map(e => ({
    name: e.name.split(' ')[0],
    [lang==='ar'?'الأداء':'performance']: e.performance,
    [lang==='ar'?'الحضور':'attendance']: e.attendance,
  })), [employees, lang]);

  const deptData = useMemo(() => Object.entries(
    employees.reduce((a,e) => ({ ...a, [e.department]: (a[e.department as keyof typeof a]||0)+1 }), {} as Record<string,number>)
  ).map(([d,count]) => ({
    dept: lang==='ar' ? ({'Production':'الإنتاج','Quality Control':'مراقبة الجودة','Maintenance':'الصيانة','Inventory':'المخزون','HR':'الموارد البشرية','Finance':'المالية','Sales':'المبيعات','Engineering':'الهندسة'}[d] || d) : d,
    count
  })), [employees, lang]);

  const openAdd = () => { setEditItem(null); setForm({...BLANK}); setErrors({}); setModalOpen(true); };
  const openEdit = (emp: Employee) => {
    setEditItem(emp);
    setForm({ name:emp.name, email:emp.email, phone:emp.phone||'', role:emp.role, department:emp.department, shift:emp.shift as any, salary:emp.salary, status:emp.status as any });
    setErrors({}); setModalOpen(true);
  };

  const set = (k: keyof EmployeeForm, v: string|number) => {
    setForm(p => ({...p, [k]:v}));
    if (errors[k]) setErrors(p => ({...p,[k]:undefined}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = employeeSchema.safeParse(form);
    if (!result.success) {
      const errs: typeof errors = {};
      result.error.issues.forEach(i => { errs[i.path[0] as keyof EmployeeForm] = i.message; });
      setErrors(errs); return;
    }

    if (editItem) {
      // Update UI immediately
      setEmployees(prev => prev.map(emp => emp.id===editItem.id ? {...emp,...result.data} : emp));
      setModalOpen(false);
      toast(t('toast.updated'), 'success');
      // Save to DB
      const ok = await dbUpdate(editItem.id, {
        name: result.data.name, email: result.data.email, phone: result.data.phone||'',
        role: result.data.role, department: result.data.department, shift: result.data.shift,
        salary: result.data.salary, status: result.data.status,
      });
      if (!ok) toast('DB update failed', 'error');
    } else {
      const joinDate = new Date().toISOString().split('T')[0];
      setModalOpen(false);
      toast(t('toast.added'), 'success');
      // Save to DB and reload to get real ID
      const ok = await dbInsert({
        name: result.data.name, email: result.data.email, phone: result.data.phone||'',
        role: result.data.role, department: result.data.department, shift: result.data.shift,
        salary: result.data.salary, status: result.data.status,
        attendance: 95, performance: 90, join_date: joinDate,
      });
      if (ok) {
        // Reload from DB to get correct ID and show in table
        const fresh = await dbFetch();
        if (fresh.length > 0) {
          setEmployees(fresh.map(toEmployee));
          // Go to last page to see new employee
          setPage(Math.ceil(fresh.length / PER_PAGE));
        }
      }
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteId(null);
    // Update UI immediately - stay on same page
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast(t('toast.deleted'), 'success');
    // Delete from DB
    await dbDelete(id);
  };

  const tt = { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 };
  const perfKey1 = lang==='ar'?'الأداء':'performance';
  const perfKey2 = lang==='ar'?'الحضور':'attendance';

  if (loading) return <div className="animate-in" style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Loading...</div>;

  return (
    <div className="animate-in">
      <PageHeader
        title={t('employees.title')}
        subtitle={`${employees.length} ${t('employees.title').toLowerCase()}`}
        action={<Button variant="primary" onClick={openAdd}><MdAdd aria-hidden="true" size={15}/>{t('common.addEmployee')}</Button>}
      />

      {/* KPIs */}
      <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:t('employees.active'),        value:employees.filter(e=>e.status==='active').length,     color:'#059669' },
          { label:t('employees.onLeave'),        value:employees.filter(e=>e.status==='on-leave').length,   color:'#d97706' },
          { label:t('employees.morningShift'),   value:employees.filter(e=>e.shift==='morning').length,     color:'#2563eb' },
          { label:t('employees.avgPerformance'), value:Math.round(employees.reduce((s,e)=>s+e.performance,0)/employees.length)+'%', color:'#c81e1e' },
        ].map(s => (
          <div key={s.label} className="card card-hover" style={{ padding:'16px 18px', textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:800, color:s.color, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-cols-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:22, alignItems:'start' }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{t('employees.performanceVsAttendance')}</div>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14 }}>{lang==='ar'?'٪ — أعلى 8 موظفين':'% — Top 8 employees'}</div>
          <Suspense fallback={<div className="skeleton" style={{ height:220 }} />}>
            <div dir="ltr">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={perfData} barSize={10} barCategoryGap="30%" margin={{ top:10, right:20, bottom:20, left:55 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis domain={[70,100]} width={50} tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} tickCount={4} dx={-5} />
                  <Tooltip contentStyle={tt} />
                  <Legend wrapperStyle={{ fontSize:11, paddingTop:8 }} />
                  <Bar dataKey={perfKey1} fill="#FF3483" radius={[4,4,0,0]} />
                  <Bar dataKey={perfKey2} fill="#0055DA" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Suspense>
        </div>

        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{t('employees.byDepartment')}</div>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14 }}>{lang==='ar'?'عدد الموظفين':'Headcount'}</div>
          <Suspense fallback={<div className="skeleton" style={{ height:deptData.length*50 }} />}>
            <div dir="ltr">
              <ResponsiveContainer width="100%" height={deptData.length * 50}>
                <BarChart data={deptData} layout="vertical" barSize={28} barCategoryGap="20%" margin={{ top:4, right:45, bottom:4, left:0 }}>
                  <XAxis type="number" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} tickCount={4} dy={4} />
                  <YAxis type="category" dataKey="dept" width={120} tick={{ fontSize:11, fill:'var(--text-primary)', fontWeight:500 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tt} />
                  <Bar dataKey="count" fill="#00C68D" radius={[0,6,6,0]} name={lang==='ar'?'عدد الموظفين':'Employees'} label={{ position:'right', fontSize:12, fill:'var(--text-secondary)', fontWeight:700 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Suspense>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="card" style={{ marginBottom:18 }}>
        <div style={{ padding:'12px 16px', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg-input)', borderWidth:'1px', borderStyle:'solid', borderColor:'var(--border)', borderRadius:8, padding:'7px 12px', flex:1, maxWidth:340 }}>
            <MdSearch aria-hidden="true" size={15} style={{ color:'var(--text-muted)', flexShrink:0 }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('employees.searchPlaceholder')}
              style={{ background:'none', border:'none', outline:'none', fontSize:13, color:'var(--text-primary)', width:'100%' }} />
            {search && <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:0 }}><MdClose aria-hidden="true" size={13}/></button>}
          </div>
          <select value={dept} onChange={e=>setDept(e.target.value)}
            style={{ background:'var(--bg-input)', borderWidth:'1px', borderStyle:'solid', borderColor:'var(--border)', borderRadius:8, padding:'7px 12px', fontSize:13, color:'var(--text-primary)', cursor:'pointer', outline:'none' }}>
            {departments.map(d => <option key={d} value={d}>{d==='all'?t('employees.allDepartments'):d}</option>)}
          </select>
          <span style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{filtered.length} {t('employees.results')}</span>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>{t('common.name')}</th>
              <th className="hide-mob">{t('employees.role')}</th>
              <th className="hide-tab">{t('employees.department')}</th>
              <th>{t('employees.attendance')}</th>
              <th>{t('employees.performance')}</th>
              <th className="hide-mob">{t('employees.salary')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr></thead>
            <tbody>
              {filtered.slice((page-1)*PER_PAGE, page*PER_PAGE).map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#FF3483,#FF0052)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14, flexShrink:0 }}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>{emp.name}</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hide-mob" style={{ fontSize:13 }}>{emp.role}</td>
                  <td className="hide-tab" style={{ fontSize:12, color:'var(--text-secondary)' }}>{emp.department}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:44, height:4, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                        <div style={{ width:emp.attendance+'%', height:'100%', background:'#2563eb', borderRadius:99 }} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, minWidth:30 }}>{emp.attendance}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:44, height:4, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                        <div style={{ width:emp.performance+'%', height:'100%', background:'#c81e1e', borderRadius:99 }} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, minWidth:30 }}>{emp.performance}%</span>
                    </div>
                  </td>
                  <td className="hide-mob" style={{ fontWeight:600, fontSize:13 }}>${emp.salary.toLocaleString()}</td>
                  <td><Badge variant={statusToVariant(emp.status)}>{tStatus(emp.status)}</Badge></td>
                  <td>
                    <div style={{ display:'flex', gap:5 }}>
                      <button onClick={()=>openEdit(emp)} aria-label="Edit" style={{ background:'rgba(37,99,235,0.10)', borderWidth:0, borderStyle:'solid', borderColor:'transparent', borderRadius:7, padding:6, cursor:'pointer', color:'#2563eb', display:'flex' }}>
                        <MdEdit aria-hidden="true" size={14} />
                      </button>
                      <button onClick={()=>setDeleteId(emp.id)} aria-label="Delete" style={{ background:'rgba(200,30,30,0.10)', borderWidth:0, borderStyle:'solid', borderColor:'transparent', borderRadius:7, padding:6, cursor:'pointer', color:'#c81e1e', display:'flex' }}>
                        <MdDelete aria-hidden="true" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)}
        title={editItem ? t('employees.form.editTitle') : t('employees.form.title')} size="md">
        <form onSubmit={handleSubmit} noValidate>
          <FormRow>
            <FormField label={t('employees.form.fullName')} required error={errors.name}>
              <Input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Ahmed Hassan" error={!!errors.name} />
            </FormField>
            <FormField label={t('employees.form.email')} required error={errors.email}>
              <Input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="ahmed@motorsync.com" error={!!errors.email} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('employees.form.phone')} error={errors.phone}>
              <Input value={form.phone||''} onChange={e=>set('phone',e.target.value)} placeholder="+20-100-000-0000" />
            </FormField>
            <FormField label={t('employees.form.role')} required error={errors.role}>
              <Input value={form.role} onChange={e=>set('role',e.target.value)} placeholder="Production Lead" error={!!errors.role} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('employees.form.department')}>
              <Select value={form.department} onChange={e=>set('department',e.target.value)}>
                {allDepts.map(d=><option key={d} value={d}>{tDept(d)}</option>)}
              </Select>
            </FormField>
            <FormField label={t('employees.form.shift')}>
              <Select value={form.shift} onChange={e=>set('shift',e.target.value)}>
                <option value="morning">{tShift('morning')}</option>
                <option value="evening">{tShift('evening')}</option>
                <option value="night">{tShift('night')}</option>
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('employees.form.salary')} required error={errors.salary}>
              <Input type="number" value={form.salary} onChange={e=>set('salary',Number(e.target.value))} placeholder="8000" min="0" error={!!errors.salary} />
            </FormField>
            <FormField label={t('employees.form.status')}>
              <Select value={form.status} onChange={e=>set('status',e.target.value)}>
                <option value="active">{lang==='ar'?'نشط':'Active'}</option>
                <option value="on-leave">{lang==='ar'?'في إجازة':'On Leave'}</option>
                <option value="inactive">{lang==='ar'?'غير نشط':'Inactive'}</option>
              </Select>
            </FormField>
          </FormRow>
          <FormActions>
            <Button variant="secondary" type="button" onClick={()=>setModalOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" type="submit">{editItem ? t('common.save') : t('common.addEmployee')}</Button>
          </FormActions>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={deleteId!==null} onClose={()=>setDeleteId(null)} title={t('common.delete')} size="sm">
        <div style={{ textAlign:'center', padding:'8px 0 12px' }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(200,30,30,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
            <MdDelete aria-hidden="true" size={24} style={{ color:'#c81e1e' }} />
          </div>
          <p style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>{lang==='ar'?'حذف هذا الموظف؟':'Delete this employee?'}</p>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:22 }}>{lang==='ar'?'لا يمكن التراجع عن هذا الإجراء.':'This cannot be undone.'}</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <Button variant="secondary" onClick={()=>setDeleteId(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={()=>deleteId&&handleDelete(deleteId)}>{t('common.delete')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}