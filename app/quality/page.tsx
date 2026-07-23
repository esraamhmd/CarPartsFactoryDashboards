'use client';

const SURL = 'https://vopgydykkzxcfnnqoize.supabase.co';
const SKEY = 'sb_publishable_aTFOgIF4IwUsj0c2ehHiLw_slfSIWxi';
const H = {'apikey':SKEY,'Authorization':'Bearer '+SKEY,'Content-Type':'application/json','Prefer':'return=minimal'};

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MdAdd, MdCheckCircle, MdCancel, MdEdit, MdDelete } from 'react-icons/md';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { FormField, Input, Select, FormRow, FormActions } from '@/components/ui/FormField';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';

const RadarChart = dynamic(() => import('recharts').then(m => m.RadarChart), { ssr: false });
const Radar = dynamic(() => import('recharts').then(m => m.Radar), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then(m => m.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then(m => m.PolarAngleAxis), { ssr: false });
const PolarRadiusAxis = dynamic(() => import('recharts').then(m => m.PolarRadiusAxis), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });

const initInspections = [
  { id:'QC-001', item:'Engine Block Batch #14', itemAr:'دفعة كتلة المحرك #١٤', inspector:'Sara Mohamed',   date:'2026-01-13', result:'pass', score:96, checks:24, failed:1 },
  { id:'QC-002', item:'Brake Disc Set #48',     inspector:'Sara Mohamed',   date:'2026-01-12', result:'fail', score:72, checks:18, failed:5 },
  { id:'QC-003', item:'Hydraulic Pump #9',      inspector:'Ahmed Hassan',   date:'2026-01-11', result:'pass', score:98, checks:30, failed:0 },
  { id:'QC-004', item:'Gear Housing Lot #5',    inspector:'Sara Mohamed',   date:'2026-01-10', result:'pass', score:91, checks:22, failed:2 },
  { id:'QC-005', item:'Suspension Arms #70',    inspector:'Ahmed Hassan',   date:'2026-01-09', result:'pass', score:88, checks:16, failed:2 },
  { id:'QC-006', item:'Camshaft Assembly #22',  inspector:'Hana Fouad',     date:'2026-01-08', result:'pass', score:94, checks:20, failed:1 },
  { id:'QC-007', item:'Turbocharger GT35 #11',  inspector:'Hana Fouad',     date:'2026-01-07', result:'fail', score:68, checks:28, failed:8 },
  { id:'QC-008', item:'Valve Spring Set #33',   inspector:'Ahmed Hassan',   date:'2026-01-06', result:'pass', score:100, checks:16, failed:0 },
];

export default function QualityPage() {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const { t, lang, isRTL, tNum } = useI18n();
  const SECRET_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePwError, setDeletePwError] = useState('');
  const { toast } = useToast();
  const [inspections, setInspections] = useState(initInspections);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<typeof initInspections[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ item:'', inspector:'Sara Mohamed', checks:'20' });

  const passRate = Math.round((inspections.filter(i => i.result === 'pass').length / inspections.length) * 100);
  const avgScore = Math.round(inspections.reduce((s, i) => s + i.score, 0) / inspections.length);

  // Arabic metric labels
  // Load from DB on mount

  useEffect(() => {

    fetch(SURL+'/rest/v1/quality_inspections?select=*&order=id.desc&limit=500',{

      headers:{'apikey':SKEY,'Authorization':'Bearer '+SKEY}

    }).then(r=>r.json()).then(data=>{

      if(Array.isArray(data)&&data.length>0){

        setQuality(data.map((d:any)=>({

          id:d.id, item:d.item||'', itemAr:d.item||'',

          inspector:d.inspector||'', date:d.date||'',

          result:d.status||'pass', score:Number(d.score)||0,

          checks:20, failed:0,

        })));

      }

    }).catch(()=>{});

  },[]);

  const qualityMetrics = [
    { metric: lang === 'ar' ? 'الأبعاد' : 'Dimensional',  value: 94 },
    { metric: lang === 'ar' ? 'السطح' : 'Surface',         value: 88 },
    { metric: lang === 'ar' ? 'المادة' : 'Material',       value: 97 },
    { metric: lang === 'ar' ? 'التجميع' : 'Assembly',      value: 91 },
    { metric: lang === 'ar' ? 'الأداء' : 'Performance',    value: 95 },
    { metric: lang === 'ar' ? 'الأمان' : 'Safety',         value: 99 },
  ];

  const openAdd = () => { setEditItem(null); setForm({ item:'', inspector:'Sara Mohamed', checks:'20' }); setModalOpen(true); };
  const openEdit = (insp: typeof initInspections[0]) => { setEditItem(insp); setForm({ item: insp.item, inspector: insp.inspector, checks: String(insp.checks) }); setModalOpen(true); };

  useEffect(() => {
    fetch(SURL+'/rest/v1/quality_inspections?select=*&order=id.desc&limit=500',{
      headers:{'apikey':SKEY,'Authorization':'Bearer '+SKEY}
    }).then(r=>r.json()).then(data=>{
      if(Array.isArray(data)&&data.length>0){
        setInspections(data.map((d:any)=>({
          id:String(d.id), item:d.item||'', inspector:d.inspector||'',
          date:d.date||'', result:d.status||'pass', score:Number(d.score)||0,
          checks:20, failed:0,
        })));
      }
    }).catch(()=>{});
  },[]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (SECRET_PW && password !== SECRET_PW) { setPwError(lang==='ar'?'كلمة مرور خاطئة':'Wrong password'); return; }
    if (!form.item) { toast(lang === 'ar' ? 'اسم العنصر مطلوب!' : 'Item name required!', 'error'); return; }
    if (editItem) {
      setInspections(inspections.map(i => i.id === editItem.id ? { ...i, item: form.item, inspector: form.inspector, checks: Number(form.checks) } : i));
      toast(lang === 'ar' ? 'تم تحديث الفحص!' : 'Inspection updated!', 'success');
      fetch(SURL+'/rest/v1/quality_inspections?id=eq.'+editItem.id,{method:'PATCH',headers:H,body:JSON.stringify({
        item: form.item, inspector: form.inspector,
      })}).catch(()=>{});
    } else {
      const failed = Math.floor(Math.random() * 3);
      const score = Math.round(80 + Math.random() * 20);
      const newI = {
        id: 'QC-00' + String(inspections.length + 1).padStart(2, '0'),
        item: form.item, inspector: form.inspector,
        date: new Date().toISOString().split('T')[0],
        result: failed === 0 ? 'pass' : 'fail', score, checks: Number(form.checks), failed,
      };
      setInspections([newI, ...inspections]);
      toast(lang === 'ar' ? 'تمت إضافة الفحص!' : 'Inspection added!', 'success');
      fetch(SURL+'/rest/v1/quality_inspections',{method:'POST',headers:H,body:JSON.stringify({
        item: form.item, inspector: form.inspector, status: failed===0?'pass':'fail',
        score: score, date: new Date().toISOString().split('T')[0], notes:'',
      })}).catch(()=>{});
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setInspections(inspections.filter(i => i.id !== id));
    setDeleteId(null);
    toast(lang === 'ar' ? 'تم حذف الفحص!' : 'Inspection deleted!', 'success');
    fetch(SURL+'/rest/v1/quality_inspections?id=eq.'+id,{method:'DELETE',headers:H}).catch(()=>{});
  };

  const ttStyle = { background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:12 };

  return (
    <div className="animate-in">
      <PageHeader title={t('quality.title')} subtitle={t('quality.subtitle')}
        action={<Button variant="primary" onClick={openAdd}><MdAdd aria-hidden="true" size={16}/>{lang === 'ar' ? 'فحص جديد' : 'New Inspection'}</Button>}
      />

      {/* KPIs */}
      <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label: lang==='ar'?'نسبة النجاح':'Pass Rate',       value: passRate+'%', color:'var(--success)' },
          { label: lang==='ar'?'متوسط الدرجة':'Avg Score',      value: avgScore+'/100', color:'var(--accent-blue)' },
          { label: lang==='ar'?'إجمالي الفحوصات':'Inspections', value: inspections.length, color:'var(--primary)' },
          { label: lang==='ar'?'إجمالي الفاشل':'Failed Checks', value: inspections.reduce((s,i)=>s+i.failed,0), color:'var(--warning)' },
        ].map(s=>(
          <div key={s.label} className="card card-hover" style={{ padding:'16px 18px', textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts — responsive: stacks on small screens */}
      <div className="grid-cols-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:22 }}>
        {/* Radar — green tones instead of red */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>
            {lang==='ar'?'مقاييس الجودة (رادار)':'Quality Metrics Radar'}
          </div>
          <Suspense fallback={<div className="skeleton" style={{ height:280 }} />}>
            <div dir="ltr" style={{ flex:1, minHeight:0 }}>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={qualityMetrics} cx="50%" cy="50%" outerRadius="65%" margin={{ top:40, right:60, bottom:40, left:60 }}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize:11, fill:'var(--text-secondary)' }} />
                <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fontSize:9, fill:'var(--text-muted)' }} />
                <Radar name={lang==='ar'?'الجودة':'Quality'} dataKey="value"
                  stroke="#00C68D" fill="#00C68D" fillOpacity={0.2} strokeWidth={2.5} />
                <Tooltip contentStyle={ttStyle} />
              </RadarChart>
            </ResponsiveContainer>
            </div>
          </Suspense>
        </div>

        {/* Bar chart — scores */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>
            {lang==='ar'?'درجات الفحص':'Inspection Scores'}
          </div>
          <Suspense fallback={<div className="skeleton" style={{ height:240 }} />}>
            <div dir="ltr" style={{ flex:1, minHeight:0 }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={inspections} margin={{ top:5, right:10, bottom:15, left:50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="id" tick={{ fontSize:10, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} width={50} axisLine={false} tickLine={false} domain={[60,100]} />
                <Tooltip contentStyle={ttStyle} />
                <Bar dataKey="score" radius={[6,6,0,0]}
                  name={lang==='ar'?'الدرجة':'Score'}
                  fill="#0055DA" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </Suspense>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ padding:'12px 18px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:15 }}>
          {lang==='ar'?'سجل الفحوصات':'Inspection Log'}
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>{lang==='ar'?'رقم الفحص':'ID'}</th>
              <th>{lang==='ar'?'العنصر':'Item'}</th>
              <th className="hide-mob">{lang==='ar'?'المفتش':'Inspector'}</th>
              <th className="hide-tab">{lang==='ar'?'التاريخ':'Date'}</th>
              <th>{lang==='ar'?'الدرجة':'Score'}</th>
              <th className="hide-mob">{lang==='ar'?'فاشل':'Failed'}</th>
              <th>{lang==='ar'?'النتيجة':'Result'}</th>
              <th>{lang==='ar'?'إجراءات':'Actions'}</th>
            </tr></thead>
            <tbody>
              {inspections.map(i => (
                <tr key={i.id}>
                  <td style={{ fontWeight:600, color:'var(--accent-blue)', fontSize:12 }}>{i.id}</td>
                  <td style={{ fontSize:13, fontWeight:500 }}>{i.item}</td>
                  <td className="hide-mob" style={{ fontSize:12, color:'var(--text-secondary)' }}>{i.inspector}</td>
                  <td className="hide-tab" style={{ fontSize:11, color:'var(--text-muted)' }}>{i.date}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:40, height:4, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                        <div style={{ width:i.score+'%', height:'100%', background: i.score>=90?'var(--success)':i.score>=75?'var(--warning)':'var(--primary)', borderRadius:99 }} />
                      </div>
                      <span style={{ fontSize:12, fontWeight:600 }}>{i.score}</span>
                    </div>
                  </td>
                  <td className="hide-mob" style={{ fontWeight:600, color: i.failed>0?'var(--primary)':'var(--success)' }}>{i.failed}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      {i.result==='pass'?<MdCheckCircle size={15} style={{ color:'var(--success)' }}/>:<MdCancel size={15} style={{ color:'var(--primary)' }}/>}
                      <span style={{ fontSize:12, fontWeight:700, color:i.result==='pass'?'var(--success)':'var(--primary)', textTransform:'uppercase' }}>
                        {lang==='ar'?(i.result==='pass'?'ناجح':'راسب'):i.result}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:5 }}>
                      <button onClick={()=>openEdit(i)} aria-label="Edit" style={{ background:'var(--accent-blue-bg)', border:'none', borderRadius:7, padding:6, cursor:'pointer', color:'var(--accent-blue)', display:'flex' }}  onMouseDown={e=>e.preventDefault()}><MdEdit aria-hidden="true" size={13}/></button>
                      <button onClick={()=>setDeleteId(i.id)} aria-label="Delete" style={{ background:'var(--primary-bg)', border:'none', borderRadius:7, padding:6, cursor:'pointer', color:'var(--primary)', display:'flex' }} ><MdDelete aria-hidden="true" size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editItem?(lang==='ar'?'تعديل الفحص':'Edit Inspection'):(lang==='ar'?'فحص جديد':'New Inspection')} size="sm">
        <form onSubmit={handleSubmit}>
          <FormField label={lang==='ar'?'اسم العنصر':'Item Name'} required>
            <Input value={form.item} onChange={e=>setForm(p=>({...p, item:e.target.value}))} placeholder="Engine Block Batch #15" required />
          </FormField>
          <FormRow>
            <FormField label={lang==='ar'?'المفتش':'Inspector'}>
              <Select value={form.inspector} onChange={e=>setForm(p=>({...p, inspector:e.target.value}))}>
                {['Sara Mohamed','Ahmed Hassan','Hana Fouad','Omar Khaled'].map(n=><option key={n}>{n}</option>)}
              </Select>
            </FormField>
            <FormField label={lang==='ar'?'عدد الفحوصات':'Checks Count'}>
              <Input type="number" value={form.checks} onChange={e=>setForm(p=>({...p, checks:e.target.value}))} min="1" />
            </FormField>
          </FormRow>
          <div style={{marginBottom:12}}>
            <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text-secondary)',marginBottom:6}}>{lang==='ar'?'كلمة المرور':'Password'} *</label>
            <input type="password" value={password} onChange={e=>{setPassword(e.target.value);setPwError('');}}
              placeholder={lang==='ar'?'أدخل كلمة المرور':'Enter password'}
              style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-input)',fontSize:13,color:'var(--text-primary)',outline:'none'}} />
            {pwError && <div style={{color:'#dc2626',fontSize:12,marginTop:4}}>{pwError}</div>}
          </div>
          <FormActions>
            <Button variant="secondary" type="button" onClick={()=>{setModalOpen(false);setPassword('');setPwError('');}}>{lang==='ar'?'إلغاء':'Cancel'}</Button>
            <Button variant="primary" type="submit">{editItem?(lang==='ar'?'حفظ':'Save'):(lang==='ar'?'إضافة':'Add')}</Button>
          </FormActions>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={deleteId!==null} onClose={()=>setDeleteId(null)} title={lang==='ar'?'تأكيد الحذف':'Confirm Delete'} size="sm">
        <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--primary-bg)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
            <MdDelete aria-hidden="true" size={24} style={{ color:'var(--primary)' }} />
          </div>
          <p style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>{lang==='ar'?'حذف هذا الفحص؟':'Delete this inspection?'}</p>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:14 }}>{lang==='ar'?'لا يمكن التراجع عن هذا الإجراء.':'This action cannot be undone.'}</p>

          <div style={{marginBottom:14,textAlign:'start'}}>

            <input type="password" value={deletePassword} onChange={e=>{setDeletePassword(e.target.value);setDeletePwError('');}}

              placeholder={lang==='ar'?'أدخل كلمة المرور':'Enter password'}

              style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-input)',fontSize:13,color:'var(--text-primary)',outline:'none'}} />

            {deletePwError && <div style={{color:'#dc2626',fontSize:12,marginTop:4}}>{deletePwError}</div>}

          </div>

          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <Button variant="secondary" onClick={()=>{setDeleteId(null);setDeletePassword('');setDeletePwError('');}}>{lang==='ar'?'إلغاء':'Cancel'}</Button>
            <Button variant="danger" onClick={()=>deleteId&&handleDelete(deleteId)}>{lang==='ar'?'حذف':'Delete'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}