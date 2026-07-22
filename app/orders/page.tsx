'use client';

import { useState, useMemo } from 'react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { FormField, Input, Select, Textarea, FormRow, FormActions } from '@/components/ui/FormField';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';
import ordersData from '@/data/orders.json';

type Order = typeof ordersData[0];

const priorityColor: Record<string,string> = { high:'#CC0000', medium:'#FFD400', low:'#00C68D' };

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const { t, lang } = useI18n();
  const toAr = (n: any) => lang==='ar' ? String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]) : String(n);
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([...ordersData]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [form, setForm] = useState({ customer:'', product:'', quantity:'', priority:'medium', deliveryDate:'', notes:'' });

  const statusSummary = useMemo(() => {
    const allStatuses = ['pending','in-production','quality-check','shipped','completed','cancelled'];
    return allStatuses
      .map(s => ({
        status: lang==='ar' ? ({
          'pending':'معلق','in-production':'قيد الإنتاج','quality-check':'فحص جودة',
          'shipped':'مشحون','completed':'مكتمل','cancelled':'ملغي',
        }[s] || s) : s.replace(/-/g,' '),
        key: s,
        count: orders.filter(o=>o.status===s).length,
      }))
      .filter(s => s.count > 0); // only show statuses with orders
  }, [orders, lang]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer || !form.product) { toast(t('common.required')+'!','error'); return; }
    const newOrder: Order = {
      id: 'ORD-2025-00'+Math.floor(Math.random()*900+100),
      customer: form.customer, product: form.product, productAr: form.product, notes: form.notes||'',
      quantity: Number(form.quantity)||1, total: Math.floor(Math.random()*90000+10000),
      status: 'pending', priority: form.priority as Order['priority'],
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: form.deliveryDate || '2025-02-01', progress: 0,
    };
    setOrders([newOrder, ...orders]);
    toast(t('toast.added'),'success');
    setModalOpen(false);
    setForm({ customer:'',product:'',quantity:'',priority:'medium',deliveryDate:'',notes:'' });
  };

  const handleDelete = (id: string) => {
    setOrders(orders.filter(o=>o.id!==id));
    setDeleteId(null);
    toast(t('toast.deleted'),'success');
  };

  return (
    <div className="animate-in">
      <PageHeader title={t('orders.title')} subtitle={t('orders.subtitle')}
        action={<Button variant="primary" onClick={()=>setModalOpen(true)}><MdAdd aria-hidden="true" size={16}/>{t('common.createOrder')}</Button>}
      />

      <div className="page-grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:t('orders.totalOrders'), value:orders.length, color:'#0055DA' },
          { label:t('orders.pending'), value:orders.filter(o=>o.status==='pending').length, color:'#FFD400' },
          { label:t('orders.inProduction'), value:orders.filter(o=>o.status==='in-production').length, color:'#CC0000' },
          { label:t('orders.completedShipped'), value:orders.filter(o=>['completed','shipped'].includes(o.status)).length, color:'#00C68D' },
          { label:t('orders.totalValue'), value:'$'+Math.round(orders.reduce((s,o)=>s+o.total,0)/1000)+'K', color:'#CC0000' },
        ].map(s=>(
          <div key={s.label} className="card card-hover" style={{ padding:16, textAlign:'center' }}>
            <div style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>{t('orders.ordersByStatus')}</div>
          <div dir="ltr">
          <ResponsiveContainer width="100%" height={Math.max(260, statusSummary.length * 50)}>
            <BarChart
              data={statusSummary}
              layout="vertical"
              barSize={28} barCategoryGap="20%"
              margin={{ top:4, right:45, bottom:4, left:50 }}
            >
              <XAxis type="number" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} tickCount={4} dy={4} />
              <YAxis type="category" dataKey="status" width={lang==='ar' ? 130 : 110}
                tick={{ fontSize:11, fill:'var(--text-primary)', fontWeight:500 }}
                axisLine={false} tickLine={false}
                tickFormatter={v=>lang==='ar'?({'pending':'معلق','in-production':'قيد الإنتاج','quality-check':'فحص جودة','shipped':'مشحون','completed':'مكتمل','cancelled':'ملغي'}[v]||v):v.replace(/-/g,' ')} />
              <Tooltip contentStyle={{ background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:13 }} />
              <Bar dataKey="count" fill="#0055DA" radius={[0,6,6,0]}
                label={{ position:'right', fontSize:12, fill:'var(--text-secondary)', fontWeight:700 }} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>{t('orders.activeProgress')}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12, maxHeight:320, overflowY:'auto' }}>
            {orders.filter(o=>['in-production','quality-check'].includes(o.status)).map(o=>(
              <div key={o.id}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                  <div style={{ minWidth:0, flex:1, display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#0055DA', flexShrink:0 }}>{o.id}</span>
                    <span style={{ fontSize:11, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.customer}</span>
                    <span style={{ display:'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.customer}</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:800, color:'#c81e1e', marginInlineStart:8, flexShrink:0 }}>{o.progress}%</span>
                </div>
                <div className="progress-bar" style={{ height:7 }}>
                  <div className="progress-fill" style={{ width:o.progress+'%', background:'linear-gradient(90deg,#c81e1e,#FF6B35)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:15 }}>{t('orders.allOrders')}</div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>{t('orders.orderId')}</th>
              <th>{t('orders.customer')}</th>
              <th className="hide-mobile">{t('orders.product')}</th>
              <th>{t('orders.priority')}</th>
              <th>{t('orders.progress')}</th>
              <th className="hide-mobile">{t('common.total')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr></thead>
            <tbody>
              {(orders).slice((page-1)*PER_PAGE, page*PER_PAGE).map(o=>(
                <tr key={o.id}>
                  <td style={{ fontWeight:700, fontSize:12, color:'#0055DA', paddingInlineEnd:16 }}>{o.id}</td>
                  <td style={{ fontSize:13 }}>{o.customer}</td>
                  <td className="hide-mobile" style={{ fontSize:12, color:'var(--text-secondary)' }}>{lang==='ar'?(o as any).productAr||o.product:o.product}</td>
                  <td><span style={{ fontSize:12, fontWeight:700, color:priorityColor[o.priority] }}>● {lang==='ar'?({'high':'عالية','medium':'متوسطة','low':'منخفضة','critical':'حرج','urgent':'عاجل'}[o.priority]||o.priority):o.priority}</span></td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:50, height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                        <div style={{ width:o.progress+'%', height:'100%', background:'#CC0000', borderRadius:2 }} />
                      </div>
                      <span style={{ fontSize:11 }}>{o.progress}%</span>
                    </div>
                  </td>
                  <td className="hide-mobile" style={{ fontWeight:700 }}>${o.total.toLocaleString()}</td>
                  <td><Badge variant={statusToVariant(o.status)}>{lang==='ar'?({'pending':'معلق','in-production':'قيد الإنتاج','quality-check':'فحص الجودة','shipped':'مشحون','completed':'مكتمل','cancelled':'ملغي'}[o.status]||o.status):o.status.replace(/-/g,' ')}</Badge></td>
                  <td>
                    <button onClick={()=>setDeleteId(o.id)} aria-label="Delete" style={{ background:'rgba(204,0,0,0.1)', border:'none', borderRadius:7, padding:7, cursor:'pointer', color:'#CC0000', display:'flex' }}><MdDelete aria-hidden="true" size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={t('orders.form.title')} size="md">
        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}>
          <FormRow>
            <FormField label={t('orders.form.customer')} required>
              <Input value={form.customer} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,customer:e.target.value})} placeholder="AutoZone Egypt" required />
            </FormField>
            <FormField label={t('orders.form.product')} required>
              <Input value={form.product} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,product:e.target.value})} placeholder="Engine Block Assembly" required />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('orders.form.quantity')}>
              <Input type="number" value={form.quantity} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,quantity:e.target.value})} placeholder="50" min="1" />
            </FormField>
            <FormField label={t('orders.form.priority')}>
              <Select value={form.priority} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,priority:e.target.value})}>
                <option value="high">{lang==='ar'?'عالية':'High'}</option><option value="medium">{lang==='ar'?'متوسطة':'Medium'}</option><option value="low">{lang==='ar'?'منخفضة':'Low'}</option>
              </Select>
            </FormField>
          </FormRow>
          <FormField label={t('orders.form.deliveryDate')}>
            <Input type="date" value={form.deliveryDate} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,deliveryDate:e.target.value})} />
          </FormField>
          <FormField label={t('orders.form.notes')}>
            <Textarea value={form.notes} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>setForm({...form,notes:e.target.value})} placeholder={lang==='ar'?'ملاحظات اختيارية...':'Optional notes...'} />
          </FormField>
          <FormActions>
            <Button variant="secondary" type="button" onClick={()=>setModalOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" type="submit">{t('common.createOrder')}</Button>
          </FormActions>
        </form>
      </Modal>

      <Modal isOpen={deleteId!==null} onClose={()=>setDeleteId(null)} title={t('common.delete')} size="sm">
        <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
          <MdDelete aria-hidden="true" size={40} style={{ color:'#CC0000', marginBottom:12 }} />
          <p style={{ fontSize:14, fontWeight:600, marginBottom:20 }}>{lang==='ar'?`حذف الطلب ${deleteId}؟`:`Delete order ${deleteId}?`}</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <Button variant="secondary" onClick={()=>setDeleteId(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={()=>deleteId && handleDelete(deleteId)}>{t('common.delete')}</Button>
          </div>
        </div>
      </Modal>
      <Pagination page={page} total={orders.length} perPage={PER_PAGE} onChange={setPage} />

    </div>
  );
}