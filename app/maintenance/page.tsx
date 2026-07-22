'use client';

import { useState } from 'react';
import { MdAdd, MdBuild, MdCalendarMonth , MdCalendarToday } from 'react-icons/md';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { FormField, Input, Select, Textarea, FormRow, FormActions } from '@/components/ui/FormField';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';
import maintenanceData from '@/data/maintenance.json';

const BarChart         = dynamic(()=>import('recharts').then(m=>m.BarChart),        {ssr:false});
const Bar              = dynamic(()=>import('recharts').then(m=>m.Bar),             {ssr:false});
const XAxis            = dynamic(()=>import('recharts').then(m=>m.XAxis),           {ssr:false});
const YAxis            = dynamic(()=>import('recharts').then(m=>m.YAxis),           {ssr:false});
const Tooltip          = dynamic(()=>import('recharts').then(m=>m.Tooltip),         {ssr:false});
const CartesianGrid    = dynamic(()=>import('recharts').then(m=>m.CartesianGrid),   {ssr:false});
const ResponsiveContainer = dynamic(()=>import('recharts').then(m=>m.ResponsiveContainer),{ssr:false});

type Maint = typeof maintenanceData[0];

const SURL = 'https://vopgydykkzxcfnnqoize.supabase.co';
const SKEY = 'sb_publishable_aTFOgIF4IwUsj0c2ehHiLw_slfSIWxi';
const H = {'apikey':SKEY,'Authorization':'Bearer '+SKEY,'Content-Type':'application/json','Prefer':'return=minimal'};
const priorityColor: Record<string,string> = { critical:'#CC0000', high:'#FF6B35', medium:'#FFD400', low:'#00C68D' };

export default function MaintenancePage() {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const { t, lang, tStatus } = useI18n();
  const { toast } = useToast();
  const [items, setItems] = useState<Maint[]>([...maintenanceData]);
  const [modalOpen, setModalOpen] = useState(false);
  const SECRET_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [form, setForm] = useState({ machine:'', type:'Preventive', priority:'medium', technician:'', scheduledDate:'', estimatedHours:'', description:'' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.machine || !form.technician) { toast(t('common.required')+'!','error'); return; }
    const newItem: Maint = {
      id: `MNT-${Date.now()}`, machine:form.machine, type:form.type, actualHours:0, cost:0,
      priority:form.priority as Maint['priority'], technician:form.technician,
      scheduledDate:form.scheduledDate||'2025-02-01',
      estimatedHours:Number(form.estimatedHours)||4,
      status:'scheduled', description:form.description,
    };
    setItems([newItem,...items]);
    toast(t('toast.added'),'success');
    setModalOpen(false);
    fetch(SURL+'/rest/v1/maintenance',{
      method:'POST',headers:H,
      body:JSON.stringify({
        machine:form.machine,type:form.type,priority:form.priority,
        technician:form.technician,scheduled_date:form.scheduledDate||'2026-01-01',
        estimated_hours:Number(form.estimatedHours)||4,
        status:'scheduled',description:form.description,
      })
    }).catch(()=>{});
    setForm({ machine:'',type:'Preventive',priority:'medium',technician:'',scheduledDate:'',estimatedHours:'',description:'' });
  };

  return (
    <div className="animate-in">
      <PageHeader title={t('maintenance.title')} subtitle={t('maintenance.subtitle')}
        action={<Button variant="primary" onClick={()=>{ setPassword(''); setPwError(''); setModalOpen(true); }}><MdAdd aria-hidden="true" size={16}/>{t('common.scheduleMaintenance')}</Button>}
      />

      {/* KPI Cards - responsive */}
      <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:t('maintenance.inProgress'), value:items.filter(m=>m.status==='in-progress').length, color:'#CC0000' },
          { label:t('maintenance.scheduled'),  value:items.filter(m=>m.status==='scheduled').length,   color:'#FFD400' },
          { label:t('maintenance.totalJobs'),  value:items.length,                                     color:'#0055DA' },
          { label:t('maintenance.estHours'),   value:items.reduce((s,m)=>s+m.estimatedHours,0)+'h',    color:'#00C68D' },
        ].map(s=>(
          <div key={s.label} className="card card-hover" style={{ padding:18, textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Maintenance Cards - responsive grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16, marginBottom:24 }}>
        {items.map(m=>(
          <div key={m.id} className="card card-hover" style={{ padding:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:38,height:38,borderRadius:10,background:priorityColor[m.priority]+'18',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <MdBuild size={18} style={{ color:priorityColor[m.priority] }} />
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:13 }}>{m.machine}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{lang==='ar'?({'Preventive':'وقائية','Corrective':'تصحيحية','Emergency':'طارئة','Predictive':'تنبؤية','Routine':'روتينية'}[m.type]||m.type):m.type}</div>
                </div>
              </div>
              <Badge variant={statusToVariant(m.status)}>{lang==='ar'?({'completed':'مكتمل','scheduled':'مجدول','in-progress':'قيد التنفيذ','pending':'معلق','cancelled':'ملغي','overdue':'متأخر'}[m.status]||m.status):m.status.replace(/-/g,' ')}</Badge>
            </div>
            <p style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:12, lineHeight:1.5 }}>{m.description}</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { label:t('maintenance.priority'), value:lang==='ar'?({'critical':'حرج','high':'عالية','medium':'متوسطة','low':'منخفضة'}[m.priority]||m.priority):m.priority, color:priorityColor[m.priority] },
                { label:t('maintenance.technician'), value:m.technician.split(' ')[0] },
                { label:t('maintenance.hours'), value:m.estimatedHours+'h' },
              ].map(item=>(
                <div key={item.label} style={{ background:'var(--bg-page)', borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:9, color:'var(--text-muted)', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>{item.label}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:(item as any).color||'var(--text-primary)' }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:10, fontSize:11, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:4 }}><MdCalendarToday size={12}/>{m.scheduledDate}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{ padding:20, marginBottom:24 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>{t('maintenance.hoursByMachine')}</div>
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={items} margin={{ top:5, right:10, bottom:15, left:50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="machine" tick={{ fontSize:10, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v=>v.split(' ')[0]+' '+v.split(' ')[1]} />
              <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} width={45} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:12 }} />
              <Bar dataKey="estimatedHours" fill="#0055DA" radius={[6,6,0,0]} name={t('maintenance.hours')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={t('maintenance.form.title')} size="md">
        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}>
          <FormRow>
            <FormField label={t('maintenance.form.machine')} required>
              <Input value={form.machine} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,machine:e.target.value})} placeholder="CNC Milling Machine #1" required />
            </FormField>
            <FormField label={t('maintenance.form.type')}>
              <Select value={form.type} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,type:e.target.value})}>
                <option value="Preventive">{lang==='ar'?'وقائية':'Preventive'}</option>
                <option value="Corrective">{lang==='ar'?'تصحيحية':'Corrective'}</option>
                <option value="Emergency">{lang==='ar'?'طارئة':'Emergency'}</option>
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('maintenance.form.priority')}>
              <Select value={form.priority} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,priority:e.target.value})}>
                <option value="critical">{lang==='ar'?'حرج':'Critical'}</option>
                <option value="high">{lang==='ar'?'عالية':'High'}</option>
                <option value="medium">{lang==='ar'?'متوسطة':'Medium'}</option>
                <option value="low">{lang==='ar'?'منخفضة':'Low'}</option>
              </Select>
            </FormField>
            <FormField label={t('maintenance.form.technician')} required>
              <Input value={form.technician} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,technician:e.target.value})} placeholder="Omar Khaled" required />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('maintenance.form.date')}>
              <Input type="date" value={form.scheduledDate} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,scheduledDate:e.target.value})} />
            </FormField>
            <FormField label={t('maintenance.form.hours')}>
              <Input type="number" value={form.estimatedHours} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,estimatedHours:e.target.value})} placeholder="4" min="1" />
            </FormField>
          </FormRow>
          <FormField label={t('maintenance.form.description')}>
            <Textarea value={form.description} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,description:e.target.value})} placeholder={lang==='ar'?'اوصف عمل الصيانة...':'Describe the maintenance work...'} />
          </FormField>
          <FormField label={lang==='ar'?'كلمة المرور':'Password'} required>

            <Input type="password" value={password}

              onChange={e=>{ setPassword(e.target.value); setPwError(''); }}

              placeholder={lang==='ar'?'أدخل كلمة المرور':'Enter password'}

              error={!!pwError} />

            {pwError && <div style={{ fontSize:11.5, color:'#dc2626', marginTop:4 }}>⚠ {pwError}</div>}

          </FormField>

          <FormActions>

            <Button variant="secondary" type="button" onClick={()=>setModalOpen(false)}>{t('common.cancel')}</Button>

            <Button variant="primary" type="submit">{t('common.scheduleMaintenance')}</Button>

          </FormActions>
        </form>
      </Modal>
    </div>
  );
}