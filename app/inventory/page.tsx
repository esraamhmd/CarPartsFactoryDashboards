'use client';

import { useState } from 'react';
import { MdAdd, MdSearch, MdWarning, MdEdit, MdDelete } from 'react-icons/md';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { FormField, Input, Select, FormRow, FormActions } from '@/components/ui/FormField';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';
import inventoryData from '@/data/inventory.json';


type Item = typeof inventoryData[0];
const COLORS = ['#CC0000','#FFD400','#00C68D','#0055DA','#FF6B35'];

const SURL='https://vopgydykkzxcfnnqoize.supabase.co';
const SKEY='sb_publishable_aTFOgIF4IwUsj0c2ehHiLw_slfSIWxi';
const H={'apikey':SKEY,'Authorization':'Bearer '+SKEY,'Content-Type':'application/json','Prefer':'return=minimal'};

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<Item[]>([...inventoryData]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name:'', category:'Raw Material', quantity:'', unit:'pcs', minStock:'', price:'', supplier:'', location:'' });

  const totalValue = inventory.reduce((s,i)=>s+i.quantity*i.price,0);
  const categoryData = Object.entries(inventory.reduce((a,i)=>({...a,[i.category]:(a[i.category as keyof typeof a]||0)+1}),{} as Record<string,number>)).map(([name,value])=>({name,value}));
  const filtered = inventory.filter(i=>i.name.toLowerCase().includes(search.toLowerCase())||i.category.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.quantity) { toast(t('common.required')+'!','error'); return; }
    const qty = Number(form.quantity);
    const min = Number(form.minStock)||0;
    const newItem = {
      id: Date.now(), name:form.name, category:form.category,
      quantity:qty, unit:form.unit, minStock:min,
      reorderPoint:min*1.5, price:Number(form.price)||0,
      supplier:form.supplier, location:form.location,
      status: qty===0?'out-of-stock':qty<=min?'low-stock':'available',
    };
    setInventory([...inventory, newItem]);
    toast(t('toast.added'),'success');
    fetch(SURL+'/rest/v1/inventory',{method:'POST',headers:H,body:JSON.stringify({
      name:form.name,category:form.category,quantity:Number(form.quantity),
      unit:form.unit,min_stock:Number(form.minStock)||0,
      unit_price:Number(form.price)||0,supplier:form.supplier||'',
      location:form.location||'',status:'available',
    })}).catch(()=>{});
    setModalOpen(false);
    setForm({ name:'',category:'Raw Material',quantity:'',unit:'pcs',minStock:'',price:'',supplier:'',location:'' });
  };

  return (
    <div className="animate-in">
      <PageHeader title={t('inventory.title')} subtitle={t('inventory.subtitle')}
        action={<Button variant="primary" onClick={()=>setModalOpen(true)}><MdAdd aria-hidden="true" size={16}/>{t('common.addItem')}</Button>}
      />

      <div className="page-grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:t('inventory.totalItems'), value:inventory.length, color:'#0055DA' },
          { label:t('inventory.totalValue'), value:'$'+(totalValue/1000).toFixed(0)+'K', color:'#00C68D' },
          { label:t('inventory.lowStock'), value:inventory.filter(i=>i.status==='low-stock').length, color:'#FFD400' },
          { label:t('inventory.outOfStock'), value:inventory.filter(i=>i.status==='out-of-stock').length, color:'#CC0000' },
        ].map(s=>(
          <div key={s.label} className="card card-hover" style={{ padding:18, textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {inventory.filter(i=>i.status!=='available').length>0 && (
        <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
          {inventory.filter(i=>i.status!=='available').map(item=>(
            <div key={item.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background:item.status==='out-of-stock'?'rgba(204,0,0,0.07)':'rgba(255,212,0,0.1)', border:`1px solid ${item.status==='out-of-stock'?'rgba(204,0,0,0.2)':'rgba(255,212,0,0.3)'}` }}>
              <MdWarning size={16} style={{ color:item.status==='out-of-stock'?'#CC0000':'#B38900' }} />
              <span style={{ fontSize:12, fontWeight:600 }}>{lang==='ar'?(item as any).nameAr||item.name:item.name}</span>
              <Badge variant={statusToVariant(item.status)}>{lang==='ar'?({'available':'متاح','low-stock':'مخزون منخفض','low stock':'مخزون منخفض','out-of-stock':'نفد المخزون','out of stock':'نفد المخزون'}[item.status]||item.status):item.status.replace(/-/g,' ')}</Badge>
            </div>
          ))}
        </div>
      )}

      <div className="chart-2col" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:24 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>{t('inventory.stockLevels')}</div>
          <div dir="ltr" style={{ flex:1, minHeight:0 }}>
          <ResponsiveContainer width="100%" height={Math.max(420, inventory.slice(0,20).length * 28)}>
            <BarChart data={inventory.slice(0,20)} layout="vertical" barSize={14} margin={{ top:4, right:50, bottom:4, left:50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:12, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={130} tickFormatter={v=>v.length>18?v.slice(0,18)+'…':v} />
              <Tooltip contentStyle={{ background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:13 }} />
              <Bar dataKey="quantity" fill="#0055DA" radius={[0,6,6,0]} name={t('inventory.quantity')} label={{ position:'right', fontSize:11, fill:'var(--text-muted)' }} />
              <Bar dataKey="minStock" fill="#FF3483" radius={[0,6,6,0]} name={t('inventory.minStock')} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>{t('inventory.byCategory')}</div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart><Pie data={categoryData} cx="50%" cy="50%" outerRadius={60} dataKey="value" stroke="none">
              {categoryData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
            </Pie><Tooltip contentStyle={{ background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:12 }} /></PieChart>
          </ResponsiveContainer>
          {categoryData.map((c,i)=>(
            <div key={c.name} style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:8,height:8,borderRadius:2,background:COLORS[i%COLORS.length] }}/><span style={{ fontSize:11,color:'var(--text-secondary)' }}>{c.name}</span></div>
              <span style={{ fontSize:11,fontWeight:600 }}>{c.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg-primary)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, padding:'8px 12px', flex:1, maxWidth:320 }}>
            <MdSearch aria-hidden="true" size={16} style={{ color:'var(--text-muted)', flexShrink:0 }} />
            <input value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setSearch(e.target.value)} placeholder={t('inventory.searchPlaceholder')} style={{ background:'none',border:'none',outline:'none',fontSize:13,color:'var(--text-primary)',width:'100%' }} />
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>{t('inventory.itemName')}</th>
              <th className="hide-mobile">{t('inventory.category')}</th>
              <th>{t('inventory.quantity')}</th>
              <th className="hide-mobile">{t('inventory.unitPrice')}</th>
              <th className="hide-mobile">{t('inventory.totalVal')}</th>
              <th>{t('common.status')}</th>
            </tr></thead>
            <tbody>
              {(filtered).slice((page-1)*PER_PAGE, page*PER_PAGE).map(item=>(
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight:600, fontSize:13 }}>{lang==='ar'?(item as any).nameAr||item.name:item.name}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{item.location}</div>
                  </td>
                  <td className="hide-mobile"><Badge variant="blue">{lang==='ar'?(item as any).categoryAr||item.category:item.category}</Badge></td>
                  <td style={{ fontWeight:700 }}>{item.quantity.toLocaleString()} {lang==='ar'?({'pcs':'قطعة','liters':'لتر','sheets':'ورقة','sets':'طقم','kg':'كجم','meters':'متر','boxes':'صندوق','rolls':'لفة','units':'وحدة','pairs':'زوج'}[item.unit]||item.unit):item.unit}</td>
                  <td className="hide-mobile">${(item.unitPrice||item.price||0).toLocaleString()}</td>
                  <td className="hide-mobile" style={{ fontWeight:700, color:'#00C68D' }}>${((item.quantity||0)*(item.unitPrice||item.price||0)).toLocaleString()}</td>
                  <td><Badge variant={statusToVariant(item.status)}>{lang==='ar'?({'available':'متاح','low-stock':'مخزون منخفض','low stock':'مخزون منخفض','out-of-stock':'نفد المخزون','out of stock':'نفد المخزون'}[item.status]||item.status):item.status.replace(/-/g,' ')}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={t('inventory.form.title')} size="md">
        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}>
          <FormRow>
            <FormField label={t('inventory.form.itemName')} required>
              <Input value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,name:e.target.value})} placeholder='Engine Block Castings' required />
            </FormField>
            <FormField label={t('inventory.form.category')}>
              <Select value={form.category} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,category:e.target.value})}>
                {[
              {v:'Raw Material',ar:'مواد خام'},{v:'Components',ar:'مكونات'},
              {v:'Consumables',ar:'مستهلكات'},{v:'Fasteners',ar:'مثبتات'},
              {v:'Sealing',ar:'مواد إحكام'},{v:'Fluids',ar:'سوائل'},
              {v:'Electrical',ar:'كهربائيات'},{v:'Lubricants',ar:'مواد تشحيم'},
            ].map(opt=><option key={opt.v} value={opt.v}>{lang==='ar'?opt.ar:opt.v}</option>)}
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('inventory.form.quantity')} required>
              <Input type="number" value={form.quantity} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,quantity:e.target.value})} placeholder="100" min="0" required />
            </FormField>
            <FormField label={t('inventory.form.unit')}>
              <Select value={form.unit} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,unit:e.target.value})}>
                {[
              {v:'pcs',ar:'قطعة'},{v:'liters',ar:'لتر'},{v:'sheets',ar:'ورقة'},
              {v:'sets',ar:'طقم'},{v:'kg',ar:'كجم'},{v:'meters',ar:'متر'},
              {v:'boxes',ar:'صندوق'},
            ].map(opt=><option key={opt.v} value={opt.v}>{lang==='ar'?opt.ar:opt.v}</option>)}
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('inventory.form.minStock')}>
              <Input type="number" value={form.minStock} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,minStock:e.target.value})} placeholder="20" min="0" />
            </FormField>
            <FormField label={t('inventory.form.price')}>
              <Input type="number" value={form.price} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,price:e.target.value})} placeholder="450" min="0" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('inventory.form.supplier')}>
              <Input value={form.supplier} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,supplier:e.target.value})} placeholder="Cairo Metal Works" />
            </FormField>
            <FormField label={t('inventory.form.location')}>
              <Input value={form.location} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,location:e.target.value})} placeholder="Warehouse A-1" />
            </FormField>
          </FormRow>
          <FormActions>
            <Button variant="secondary" type="button" onClick={()=>setModalOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" type="submit">{t('common.addItem')}</Button>
          </FormActions>
        </form>
      </Modal>
      <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={p=>{setPage(p)}} />

    </div>
  );
}