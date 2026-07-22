'use client';

import { useState } from 'react';
import { MdAdd, MdStar, MdEdit, MdDelete } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { FormField, Input, Select, FormRow, FormActions } from '@/components/ui/FormField';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';
import suppliersData from '@/data/suppliers.json';


type Supplier = typeof suppliersData[0];

export default function SuppliersPage() {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([...suppliersData]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ name:'', contact:'', email:'', phone:'', country:'Egypt', category:'Raw Materials', status:'active' });
  const SECRET_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [deletePw, setDeletePw] = useState('');
  const [deletePwError, setDeletePwError] = useState('');

  const sortedByRating = [...suppliers].sort((a, b) => b.rating - a.rating);
  const active = suppliers.filter(s => s.status === 'active').length;
  const avgRating = suppliers.length ? (suppliers.reduce((s, sup) => s + sup.rating, 0) / suppliers.length).toFixed(1) : '0';
  const totalOrders = suppliers.reduce((s, sup) => s + sup.totalOrders, 0);

  const openAdd = () => { setEditItem(null); setForm({ name:'',contact:'',email:'',phone:'',country:'Egypt',category:'Raw Materials',status:'active' }); setPassword(''); setPwError(''); setModalOpen(true); };
  const openEdit = (s: Supplier) => { setEditItem(s); setForm({ name:s.name,contact:s.contact,email:s.email,phone:s.phone,country:s.country,category:s.category,status:s.status }); setPassword(''); setPwError(''); setModalOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    if (!editItem) {

      if (!password) { setPwError(lang==='ar'?'كلمة المرور مطلوبة':'Password is required'); return; }

      if (password !== SECRET_PW) { setPwError(lang==='ar'?'كلمة المرور غير صحيحة':'Incorrect password'); return; }

    }
    if (!form.name || !form.contact) { toast(t('common.required')+'!','error'); return; }
    if (editItem) {
      setSuppliers(suppliers.map(s => s.id === editItem.id ? { ...s, ...form } : s));
      toast(t('toast.updated'), 'success');
    } else {
      const newS: Supplier = { id: Date.now(), ...form, categoryAr: form.category, rating: 4.0, onTimeDelivery: 90, totalOrders: 0, activeOrders: 0 };
      setSuppliers([...suppliers, newS]);
      toast(t('toast.added'), 'success');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: number) => {

    if (!deletePw) { setDeletePwError(lang==='ar'?'كلمة المرور مطلوبة':'Password is required'); return; }

    if (deletePw !== SECRET_PW) { setDeletePwError(lang==='ar'?'كلمة المرور غير صحيحة':'Incorrect password'); return; }

    setSuppliers(suppliers.filter(s => s.id !== id));

    setDeleteId(null);

    toast(t('toast.deleted'), 'success');

  };

  return (
    <div className="animate-in">
      <PageHeader title={t('suppliers.title')} subtitle={t('suppliers.subtitle')}
        action={<Button variant="primary" onClick={openAdd}><MdAdd aria-hidden="true" size={16}/>{t('common.addSupplier')}</Button>}
      />

      <div className="grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:t('suppliers.activeSuppliers'), value:active, color:'#00C68D' },
          { label:t('suppliers.avgRating'), value:avgRating+'/5', color:'#FFD400' },
          { label:t('suppliers.totalOrders'), value:totalOrders, color:'#0055DA' },
          { label:t('suppliers.underReview'), value:suppliers.filter(s=>s.status==='review').length, color:'#CC0000' },
        ].map(s=>(
          <div key={s.label} className="card card-hover" style={{ padding:18, textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-2col" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:24 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>{t('suppliers.onTimeDelivery')}</div>
          <div dir="ltr" style={{ flex:1, minHeight:0 }}>
          <ResponsiveContainer width="100%" height={Math.max(260, suppliers.slice(0,15).length * 28)}>
            <BarChart data={suppliers.slice(0,15)} layout="vertical" barSize={14} margin={{ top:4, right:50, bottom:4, left:50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:12, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[70,100]} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={130} tickFormatter={v=>v.length>18?v.slice(0,18)+'…':v} />
              <Tooltip contentStyle={{ background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:13 }} formatter={(v:any)=>[v+'%', t('suppliers.onTime')]} />
              <Bar dataKey="onTimeDelivery" fill="#00C68D" radius={[0,6,6,0]} name={t('suppliers.onTime')} label={{ position:'right', fontSize:11, fill:'var(--text-muted)', formatter:(v:any)=>v+'%' }} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>{t('suppliers.topByRating')}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {sortedByRating.slice(0,5).map(s=>(
              <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:130 }}>{s.name}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{lang==='ar'?({'Raw Materials':'مواد خام','Components':'مكونات','Consumables':'مستهلكات','Fasteners':'مثبتات','Sealing':'مواد إحكام','Fluids':'سوائل','Electrical':'كهربائيات','Lubricants':'مواد تشحيم','Tools':'أدوات','Bearings':'محامل','Brakes':'فرامل','Engine Parts':'قطع المحرك','Lighting':'إضاءة','Filters':'فلاتر','Gaskets':'حشيات','Chemicals':'كيماويات','Electronics':'إلكترونيات','Rubber Parts':'قطع مطاطية','Suspension':'تعليق','Exhaust':'عادم','Clutch':'كلتش','Transmission':'ناقل الحركة','Batteries':'بطاريات'}[s.category]||s.category):s.category}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4, color:'#FFD400', flexShrink:0 }}>
                  <MdStar size={14} /><span style={{ fontWeight:700, fontSize:13 }}>{s.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:15 }}>{t('suppliers.allSuppliers')}</div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>{t('common.name')}</th>
              <th className="hide-mobile">{t('suppliers.contact')}</th>
              <th className="hide-mobile">{t('suppliers.category')}</th>
              <th>{t('suppliers.rating')}</th>
              <th className="hide-tablet">{t('suppliers.onTime')}</th>
              <th className="hide-tablet">{t('suppliers.totalOrd')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr></thead>
            <tbody>
              {suppliers.slice((page-1)*PER_PAGE, page*PER_PAGE).map(s=>(
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight:600, fontSize:13 }}>{s.name}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{s.email}</div>
                  </td>
                  <td className="hide-mobile" style={{ fontSize:13, color:'var(--text-secondary)' }}>{s.contact}</td>
                  <td className="hide-mobile"><Badge variant="blue">{lang==='ar'?({'Raw Materials':'مواد خام','Components':'مكونات','Consumables':'مستهلكات','Fasteners':'مثبتات','Sealing':'مواد إحكام','Fluids':'سوائل','Electrical':'كهربائيات','Lubricants':'مواد تشحيم','Tools':'أدوات','Bearings':'محامل','Brakes':'فرامل','Engine Parts':'قطع المحرك','Lighting':'إضاءة','Filters':'فلاتر','Gaskets':'حشيات','Chemicals':'كيماويات','Electronics':'إلكترونيات','Rubber Parts':'قطع مطاطية','Suspension':'تعليق','Exhaust':'عادم','Clutch':'كلتش','Transmission':'ناقل الحركة','Batteries':'بطاريات'}[s.category]||s.category):s.category}</Badge></td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <MdStar size={13} style={{ color:'#FFD400' }} />
                      <span style={{ fontWeight:700 }}>{s.rating}</span>
                    </div>
                  </td>
                  <td className="hide-tablet"><span style={{ fontWeight:600, color:s.onTimeDelivery>=90?'#00C68D':'#FFD400' }}>{s.onTimeDelivery}%</span></td>
                  <td className="hide-tablet" style={{ fontWeight:600 }}>{s.totalOrders}</td>
                  <td><Badge variant={statusToVariant(s.status)}>{lang==='ar'?({'active':'نشط','inactive':'غير نشط','on-hold':'معلق','review':'قيد المراجعة'}[s.status]||s.status):s.status}</Badge></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>openEdit(s)} aria-label="Edit" style={{ background:'rgba(0,85,218,0.1)', border:'none', borderRadius:7, padding:6, cursor:'pointer', color:'#0055DA', display:'flex' }} onMouseDown={e=>e.preventDefault()}><MdEdit aria-hidden="true" size={14}/></button>
                      <button onClick={()=>{ setDeleteId(s.id); setDeletePw(''); setDeletePwError(''); }} aria-label="Delete" style={{ background:'rgba(204,0,0,0.1)', border:'none', borderRadius:7, padding:6, cursor:'pointer', color:'#CC0000', display:'flex' }}><MdDelete aria-hidden="true" size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editItem ? (lang==='ar'?'تعديل مورد':'Edit Supplier') : t('suppliers.form.title')} size="md">
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label={t('suppliers.form.name')} required>
              <Input value={form.name} onChange={e=>setForm(p=>({...p, name:e.target.value}))} placeholder="Cairo Metal Works" required />
            </FormField>
            <FormField label={t('suppliers.form.contact')} required>
              <Input value={form.contact} onChange={e=>setForm(p=>({...p, contact:e.target.value}))} placeholder="Mohamed Fathy" required />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('suppliers.form.email')}>
              <Input type="email" value={form.email} onChange={e=>setForm(p=>({...p, email:e.target.value}))} placeholder="contact@supplier.com" />
            </FormField>
            <FormField label={t('suppliers.form.phone')}>
              <Input value={form.phone} onChange={e=>setForm(p=>({...p, phone:e.target.value}))} placeholder="+20-2-1234-5678" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('suppliers.form.category')}>
              <Select value={form.category} onChange={e=>setForm(p=>({...p, category:e.target.value}))}>
                {[
              {v:'Raw Materials',ar:'مواد خام'},{v:'Components',ar:'مكونات'},
              {v:'Consumables',ar:'مستهلكات'},{v:'Fasteners',ar:'مثبتات'},
              {v:'Sealing',ar:'مواد إحكام'},{v:'Fluids',ar:'سوائل'},{v:'Electrical',ar:'كهربائيات'},{v:'Lubricants',ar:'مواد تشحيم'},{v:'Tools',ar:'أدوات'},
            ].map(opt=><option key={opt.v} value={opt.v}>{lang==='ar'?opt.ar:opt.v}</option>)}
              </Select>
            </FormField>
            <FormField label={t('common.status')}>
              <Select value={form.status} onChange={e=>setForm(p=>({...p, status:e.target.value}))}>
                <option value="active">{lang==='ar'?'نشط':'Active'}</option>
                <option value="review">{lang==='ar'?'قيد المراجعة':'Under Review'}</option>
                <option value="inactive">{lang==='ar'?'غير نشط':'Inactive'}</option>
              </Select>
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
            <Button variant="primary" type="submit">{editItem ? t('common.save') : t('common.addSupplier')}</Button>
          </FormActions>
        </form>
      </Modal>

      <Modal isOpen={deleteId!==null} onClose={()=>setDeleteId(null)} title={t('common.delete')} size="sm">
        <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
          <MdDelete aria-hidden="true" size={40} style={{ color:'#CC0000', marginBottom:12 }} />
          <p style={{ fontSize:14, fontWeight:600, marginBottom:12 }}>{lang==='ar'?'حذف هذا المورد؟':'Delete this supplier?'}</p>

          <div style={{ marginBottom:16, textAlign:'start' }}>

            <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>{lang==='ar'?'كلمة المرور':'Password'}*</label>

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
      <Pagination page={page} total={suppliers.length} perPage={PER_PAGE} onChange={setPage} />

    </div>
  );
}