'use client';

import { useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdPrecisionManufacturing } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { FormField, Input, Select, FormRow, FormActions } from '@/components/ui/FormField';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';
import machinesData from '@/data/machines.json';

type Machine = typeof machinesData[0];

const statusColor: Record<string,string> = { running:'#00C68D', maintenance:'#CC0000', 'under-performing':'#FFD400', idle:'#9EA8BB' };

export default function MachinesPage() {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const { t, lang, tStatus } = useI18n();
  const { toast } = useToast();
  const [machines, setMachines] = useState<Machine[]>([...machinesData]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Machine|null>(null);
  const [deleteId, setDeleteId] = useState<number|null>(null);
  const SECRET_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [deletePw, setDeletePw] = useState('');
  const [deletePwError, setDeletePwError] = useState('');
  const [form, setForm] = useState({ name:'', type:'CNC', status:'running', assignedTo:'', location:'Line A', nextMaintenance:'' });

  const running = machines.filter(m=>m.status==='running').length;
  const maintenance = machines.filter(m=>m.status==='maintenance').length;
  const underPerforming = machines.filter(m=>m.status==='under-performing').length;
  const avgUtil = machines.length ? Math.round(machines.reduce((s,m)=>s+m.utilization,0)/machines.length) : 0;

  const openAdd = () => { setEditItem(null); setForm({ name:'',type:'CNC',status:'running',assignedTo:'',location:'Line A',nextMaintenance:'' }); setPassword(''); setPwError(''); setModalOpen(true); };
  const openEdit = (m: Machine) => { setEditItem(m); setForm({ name:m.name,type:m.type,status:m.status,assignedTo:m.assignedTo,location:m.location,nextMaintenance:m.nextMaintenance }); setPassword(''); setPwError(''); setModalOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    if (!password) { setPwError(lang==='ar'?'كلمة المرور مطلوبة':'Password is required'); return; }

    if (password !== SECRET_PW) { setPwError(lang==='ar'?'كلمة المرور غير صحيحة':'Incorrect password'); return; }

    if (!form.name) { toast(t('common.required')+'!','error'); return; }
    if (editItem) {
      setMachines(machines.map(m=>m.id===editItem.id?{...m,...form}:m));
      toast(t('toast.updated'),'success');
    } else {
      const newM = { id:Date.now(),...form, utilization:form.status==='running'?80:0, efficiency:form.status==='running'?85:0, downtime:0, lastMaintenance:new Date().toISOString().split('T')[0], nextMaintenance:'', assignedTo:form.assignedTo||'', hoursRun:0 } as Machine;
      setMachines([...machines,newM]);
      toast(t('toast.added'),'success');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: number) => { setMachines(machines.filter(m=>m.id!==id)); setDeleteId(null); toast(t('toast.deleted'),'success'); };

  return (
    <div className="animate-in">
      <PageHeader title={t('machines.title')} subtitle={`${machines.length} ${lang==='ar'?'مراقبة أداء الآلات وصيانتها':'Monitor machine performance'}`}
        action={<Button variant="primary" onClick={openAdd}><MdAdd aria-hidden="true" size={16}/>{t('common.addMachine')}</Button>}
      />

      <div className="grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:lang==='ar'?'تعمل':'Running', value:running, color:'#00C68D' },
          { label:t('machines.inMaintenance'), value:maintenance, color:'#CC0000' },
          { label:t('machines.underPerforming'), value:underPerforming, color:'#FFD400' },
          { label:t('machines.avgUtilization'), value:avgUtil+'%', color:'#0055DA' },
        ].map(s=>(
          <div key={s.label} className="card card-hover" style={{ padding:18, textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-2col" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:24 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>{t('machines.utilizationChart')}</div>
          <div dir="ltr" style={{ flex:1, minHeight:0 }}>
          <ResponsiveContainer width="100%" height={Math.max(300, machines.slice(0,12).length * 35)}>
            <BarChart data={machines.slice(0,12)} layout="vertical" barSize={14} margin={{ top:4, right:50, bottom:4, left:4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0,100]} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={140} tickFormatter={v=>v.length>16?v.slice(0,16)+'…':v} />
              <Tooltip contentStyle={{ background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:12 }} formatter={(v:any)=>[v+'%', lang==='ar'?'الاستخدام':'Utilization']} />
              <Bar dataKey="utilization" fill="#FF0052" radius={[0,6,6,0]} name={lang==='ar'?'الاستخدام':'Utilization'} label={{ position:'right', fontSize:11, fill:'var(--text-muted)', formatter:(v:any)=>v+'%' }} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>{t('machines.statusOverview')}</div>
          {[
            { label:lang==='ar'?'تعمل':'Running', count:running, total:machines.length, color:'#00C68D' },
            { label:t('machines.inMaintenance'), count:maintenance, total:machines.length, color:'#CC0000' },
            { label:t('machines.underPerforming'), count:underPerforming, total:machines.length, color:'#FFD400' },
          ].map(item=>(
            <div key={item.label} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize:12, fontWeight:600 }}>{item.count}/{item.total}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width:(item.count/item.total*100)+'%', background:item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Machine Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
        {machines.map(m=>(
          <div key={m.id} className="card card-hover" style={{ padding:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:statusColor[m.status]+'18', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <MdPrecisionManufacturing size={20} style={{ color:statusColor[m.status] }} />
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, lineHeight:1.3 }}>{m.name}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{m.type} · {m.location}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:4 }}>
                <button onClick={()=>openEdit(m)} aria-label="Edit" style={{ background:'rgba(0,85,218,0.1)', border:'none', borderRadius:7, padding:6, cursor:'pointer', color:'#0055DA', display:'flex' }}  onMouseDown={e=>e.preventDefault()}><MdEdit aria-hidden="true" size={13}/></button>
                <button onClick={()=>{ setDeleteId(m.id); setDeletePw(''); setDeletePwError(''); }} aria-label="Delete" style={{ background:'rgba(204,0,0,0.1)', border:'none', borderRadius:7, padding:6, cursor:'pointer', color:'#CC0000', display:'flex' }} ><MdDelete aria-hidden="true" size={13}/></button>
              </div>
            </div>
            <Badge variant={statusToVariant(m.status)}>{lang==='ar'?({'running':'تعمل','maintenance':'صيانة','under-performing':'أداء ضعيف','idle':'خاملة','offline':'غير متصل'}[m.status]||m.status):m.status.replace(/-/g,' ')}</Badge>
            <div style={{ marginTop:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:12, color:'var(--text-muted)' }}>{lang==='ar'?'الاستخدام':'Utilization'}</span>
                <span style={{ fontSize:12, fontWeight:700, color:statusColor[m.status] }}>{m.utilization}%</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width:m.utilization+'%', background:statusColor[m.status] }} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
              {[
                { label:lang==='ar'?'الكفاءة':'Efficiency', value:m.efficiency+'%' },
                { label:lang==='ar'?'وقت التوقف':'Downtime', value:m.downtime+'h' },
                { label:t('machines.assignedTo'), value:m.assignedTo.split(' ')[0] },
                { label:t('machines.nextMaintenance'), value:m.nextMaintenance },
              ].map(item=>(
                <div key={item.label} style={{ background:'var(--bg-primary)', borderRadius:8, padding:'7px 10px' }}>
                  <div style={{ fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:2 }}>{item.label}</div>
                  <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editItem?(lang==='ar'?'تعديل آلة':'Edit Machine'):t('machines.form.title')} size="md">
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label={t('machines.form.machineName')} required>
              <Input value={form.name} onChange={e=>setForm(p=>({...p, name:e.target.value}))} placeholder="CNC Milling Machine #7" required />
            </FormField>
            <FormField label={lang==='ar'?'نوع الآلة':'Machine Type'}>
              <Select value={form.type} onChange={e=>setForm(p=>({...p, type:e.target.value}))}>
                {['CNC','Press','Robot','Lathe','Molder','Assembly','Welding'].map(t=><option key={t}>{t}</option>)}
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={lang==='ar'?'الموقع':'Location'}>
              <Select value={form.location} onChange={e=>setForm(p=>({...p, location:e.target.value}))}>
                {['Line A','Line B','Line C','Line D'].map(l=><option key={l}>{l}</option>)}
              </Select>
            </FormField>
            <FormField label={t('common.status')}>
              <Select value={form.status} onChange={e=>setForm(p=>({...p, status:e.target.value}))}>
                <option value="running">{lang==='ar'?'تعمل':'Running'}</option>
                <option value="maintenance">{lang==='ar'?'صيانة':'Maintenance'}</option>
                <option value="under-performing">{lang==='ar'?'أداء ضعيف':'Under-Performing'}</option>
                <option value="idle">{lang==='ar'?'خاملة':'Idle'}</option>
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('machines.form.assignTo')}>
              <Input value={form.assignedTo} onChange={e=>setForm(p=>({...p, assignedTo:e.target.value}))} placeholder="Omar Khaled" />
            </FormField>
            <FormField label={t('machines.nextMaintenance')}>
              <Input type="date" value={form.nextMaintenance} onChange={e=>setForm(p=>({...p, nextMaintenance:e.target.value}))} />
            </FormField>
          </FormRow>
          <FormField label={lang==='ar'?'كلمة المرور':'Password'} required>

            <Input type="password" value={password}

              onChange={e=>{ setPassword(e.target.value); setPwError(''); }}

              placeholder={lang==='ar'?'أدخل كلمة المرور':'Enter password'}

              error={!!pwError} />

            {pwError && <div style={{ fontSize:11.5, color:'#dc2626', marginTop:4 }}>⚠ {pwError}</div>}

          </FormField>

          <FormActions>

            <Button variant="secondary" type="button" onClick={()=>setModalOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" type="submit">{editItem?t('common.save'):t('common.addMachine')}</Button>
          </FormActions>
        </form>
      </Modal>

      <Modal isOpen={deleteId!==null} onClose={()=>setDeleteId(null)} title={t('common.delete')} size="sm">
        <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
          <MdDelete aria-hidden="true" size={40} style={{ color:'#CC0000', marginBottom:12 }} />
          <p style={{ fontSize:14, fontWeight:600, marginBottom:20 }}>{lang==='ar'?'حذف هذه الآلة؟':'Delete this machine?'}</p>
          <div style={{ marginBottom:16, textAlign:'start' }}>

            <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>

              {lang==='ar'?'كلمة المرور':'Password'}*

            </label>

            <input type="password" value={deletePw}

              onChange={e=>{ setDeletePw(e.target.value); setDeletePwError(''); }}

              placeholder={lang==='ar'?'أدخل كلمة المرور':'Enter password'}

              style={{ width:'100%', padding:'9px 12px', borderWidth:'1px', borderStyle:'solid', borderColor:deletePwError?'#dc2626':'var(--border)', borderRadius:8, fontSize:13, background:'var(--bg-input)', color:'var(--text-primary)', outline:'none', boxSizing:'border-box' as any }} />

            {deletePwError && <div style={{ fontSize:11.5, color:'#dc2626', marginTop:4 }}>⚠ {deletePwError}</div>}

          </div>

          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <Button variant="secondary" onClick={()=>setDeleteId(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={()=>deleteId&&handleDelete(deleteId)}>{t('common.delete')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}