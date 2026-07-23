'use client';

import { useState } from 'react';
import { MdAdd, MdStar, MdEdit, MdDelete } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { FormField, Input, FormRow, FormActions } from '@/components/ui/FormField';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';
import customersData from '@/data/customers.json';

type Customer = typeof customersData[0];

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const { t, lang, tStatus } = useI18n();
  const SECRET_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePwError, setDeletePwError] = useState('');
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([...customersData]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Customer|null>(null);
  const [deleteId, setDeleteId] = useState<number|null>(null);
  const [form, setForm] = useState({ name:'', contact:'', email:'', phone:'' });

  const sortedBySpent = [...customers].sort((a,b)=>b.totalSpent-a.totalSpent);
  const totalSpent = customers.reduce((s,c)=>s+c.totalSpent,0);
  const totalOrders = customers.reduce((s,c)=>s+c.totalOrders,0);
  const avgRating = customers.length?(customers.reduce((s,c)=>s+c.rating,0)/customers.length).toFixed(1):'0';

  const openAdd = () => { setEditItem(null); setForm({ name:'',contact:'',email:'',phone:'' }); setModalOpen(true); };
  const openEdit = (c: Customer) => { setEditItem(c); setForm({ name:c.name,contact:c.contact,email:c.email,phone:c.phone }); setModalOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.contact) { toast(t('common.required')+'!','error'); return; }
    if (editItem) {
      setCustomers(customers.map(c=>c.id===editItem.id?{...c,...form}:c));
      toast(t('toast.updated'),'success');
    } else {
      const newC = { id:Date.now(),...form, totalOrders:0, totalSpent:0, satisfaction:5.0, status:'active', rating:5.0, lastOrder:new Date().toISOString().split('T')[0] } as Customer;
      setCustomers([...customers,newC]);
      toast(t('toast.added'),'success');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (SECRET_PW && deletePassword !== SECRET_PW) { setDeletePwError(lang==='ar'?'كلمة مرور خاطئة':'Wrong password'); return; }
    setCustomers(customers.filter(c=>c.id!==id));
    setDeleteId(null); setDeletePassword('');
    toast(t('toast.deleted'),'success');
  };

  return (
    <div className="animate-in">
      <PageHeader title={t('customers.title')} subtitle={t('customers.subtitle')}
        action={<Button variant="primary" onClick={openAdd}><MdAdd aria-hidden="true" size={16}/>{t('common.addCustomer')}</Button>}
      />

      <div className="grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:t('customers.totalCustomers'), value:customers.length, color:'#0055DA' },
          { label:t('customers.totalRevenue'), value:'$'+(totalSpent/1000000).toFixed(2)+'M', color:'#00C68D' },
          { label:t('customers.totalOrders'), value:totalOrders, color:'#CC0000' },
          { label:t('customers.avgSatisfaction'), value:avgRating+'/5', color:'#FFD400' },
        ].map(s=>(
          <div key={s.label} className="card card-hover" style={{ padding:18, textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-2col" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:24 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>{t('customers.revenueByCustomer')}</div>
          <div dir="ltr">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={(customers).slice((page-1)*PER_PAGE, page*PER_PAGE).map(c => ({ name:c.name.split(' ')[0], revenue:Math.round(c.totalSpent/1000) }))}
              barSize={10} barCategoryGap="30%"
              margin={{ top:10, right:20, bottom:20, left:55 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} dy={8} />
              <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} width={50} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:12 }} formatter={(v)=>['$'+Number(v)+'K',t('customers.totalRevenue')]} />
              <Bar dataKey="revenue" fill="#0055DA" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>{t('customers.topCustomers')}</div>
          {sortedBySpent.slice(0,5).map((c,i)=>(
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ width:26,height:26,borderRadius:8,flexShrink:0,background:i===0?'linear-gradient(135deg,#FFD400,#FF8C00)':i===1?'rgba(158,168,187,0.3)':'rgba(204,0,0,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:i===0?'#fff':'var(--text-secondary)' }}>#{i+1}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{c.totalOrders} {t('customers.orders')}</div>
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:'#00C68D', flexShrink:0 }}>${(c.totalSpent/1000).toFixed(0)}K</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:15 }}>{t('customers.allCustomers')}</div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>{t('common.name')}</th>
              <th className="hide-mobile">{t('customers.contact')}</th>
              <th className="hide-tablet">{t('customers.totalOrders')}</th>
              <th>{t('customers.totalSpent')}</th>
              <th className="hide-mobile">{t('customers.avgSatisfaction')}</th>
              <th className="hide-tablet">{t('customers.lastOrder')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr></thead>
            <tbody>
              {(customers).slice((page-1)*PER_PAGE, page*PER_PAGE).map(c=>(
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight:600, fontSize:13 }}>{c.name}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{c.email}</div>
                  </td>
                  <td className="hide-mobile" style={{ fontSize:13, color:'var(--text-secondary)' }}>{c.contact}</td>
                  <td className="hide-tablet" style={{ fontWeight:600 }}>{c.totalOrders}</td>
                  <td style={{ fontWeight:700, color:'#00C68D' }}>${c.totalSpent.toLocaleString()}</td>
                  <td className="hide-mobile">
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <MdStar size={13} style={{ color:'#FFD400' }}/><span style={{ fontWeight:700 }}>{c.rating}</span>
                    </div>
                  </td>
                  <td className="hide-tablet" style={{ fontSize:12, color:'var(--text-secondary)' }}>{c.lastOrder}</td>
                  <td><Badge variant={statusToVariant(c.status)}>{lang==='ar'?({'active':'نشط','inactive':'غير نشط','on-hold':'معلق','vip':'مميز'}[c.status]||c.status):tStatus(c.status)}</Badge></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>openEdit(c)} aria-label="Edit" style={{ background:'rgba(0,85,218,0.1)', border:'none', borderRadius:7, padding:6, cursor:'pointer', color:'#0055DA', display:'flex' }} onMouseDown={e=>e.preventDefault()}><MdEdit aria-hidden="true" size={14}/></button>
                      <button onClick={()=>setDeleteId(c.id)} aria-label="Delete" style={{ background:'rgba(204,0,0,0.1)', border:'none', borderRadius:7, padding:6, cursor:'pointer', color:'#CC0000', display:'flex' }}><MdDelete aria-hidden="true" size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editItem?'Edit Customer':t('customers.form.title')} size="md">
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label={t('customers.form.name')} required>
              <Input value={form.name} onChange={e=>setForm(p=>({...p, name:e.target.value}))} placeholder="AutoZone Egypt" required />
            </FormField>
            <FormField label={t('customers.form.contact')} required>
              <Input value={form.contact} onChange={e=>setForm(p=>({...p, contact:e.target.value}))} placeholder="Ahmed Fathy" required />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('customers.form.email')}>
              <Input type="email" value={form.email} onChange={e=>setForm(p=>({...p, email:e.target.value}))} placeholder="contact@company.com" />
            </FormField>
            <FormField label={t('customers.form.phone')}>
              <Input value={form.phone} onChange={e=>setForm(p=>({...p, phone:e.target.value}))} placeholder="+20-2-1234-5678" />
            </FormField>
          </FormRow>
          <FormField label={lang==='ar'?'كلمة المرور':'Password'} required>

            <Input type="password" value={password} onChange={e=>{setPassword(e.target.value);setPwError('');}}

              placeholder={lang==='ar'?'أدخل كلمة المرور':'Enter password'} />

            {pwError && <div style={{color:'#dc2626',fontSize:12,marginTop:4}}>{pwError}</div>}

          </FormField>

          <FormActions>

            <Button variant="secondary" type="button" onClick={()=>{setModalOpen(false);setPassword('');setPwError('');}}>{t('common.cancel')}</Button>
            <Button variant="primary" type="submit">{editItem?t('common.save'):t('common.addCustomer')}</Button>
          </FormActions>
        </form>
      </Modal>

      <Modal isOpen={deleteId!==null} onClose={()=>setDeleteId(null)} title={t('common.delete')} size="sm">
        <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
          <MdDelete aria-hidden="true" size={40} style={{ color:'#CC0000', marginBottom:12 }} />
          <p style={{ fontSize:14, fontWeight:600, marginBottom:20 }}>{lang==='ar'?'حذف هذا العميل؟':'Delete this customer?'}</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <div style={{marginBottom:12,textAlign:'start'}}>

            <input type="password" value={deletePassword} onChange={e=>{setDeletePassword(e.target.value);setDeletePwError('');}}

              placeholder={lang==='ar'?'أدخل كلمة المرور':'Enter password'}

              style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-input)',fontSize:13,color:'var(--text-primary)',outline:'none'}} />

            {deletePwError && <div style={{color:'#dc2626',fontSize:12,marginTop:4}}>{deletePwError}</div>}

          </div>

          <Button variant="secondary" onClick={()=>{setDeleteId(null);setDeletePassword('');setDeletePwError('');}}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={()=>deleteId&&handleDelete(deleteId)}>{t('common.delete')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}