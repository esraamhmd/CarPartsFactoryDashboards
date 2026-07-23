'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
const PieChart   = dynamic(() => import('recharts').then(m=>m.PieChart),   {ssr:false});
const Pie        = dynamic(() => import('recharts').then(m=>m.Pie),        {ssr:false});
const Cell       = dynamic(() => import('recharts').then(m=>m.Cell),       {ssr:false, loading:()=>null});
const BarChart   = dynamic(() => import('recharts').then(m=>m.BarChart),   {ssr:false});
const Bar        = dynamic(() => import('recharts').then(m=>m.Bar),        {ssr:false});
const XAxis      = dynamic(() => import('recharts').then(m=>m.XAxis),      {ssr:false});
const YAxis      = dynamic(() => import('recharts').then(m=>m.YAxis),      {ssr:false});
const Tooltip    = dynamic(() => import('recharts').then(m=>m.Tooltip),    {ssr:false});
const CartesianGrid = dynamic(() => import('recharts').then(m=>m.CartesianGrid), {ssr:false});
const ResponsiveContainer = dynamic(() => import('recharts').then(m=>m.ResponsiveContainer), {ssr:false});
import { MdAdd, MdBugReport } from 'react-icons/md';

import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { FormField, Input, Select, Textarea, FormRow, FormActions } from '@/components/ui/FormField';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';
import defectsData from '@/data/defects.json';

type Defect = typeof defectsData[0];
const SEVERITY_COLORS: Record<string,string> = { minor:'#FFD400', major:'#FF6B35', critical:'#CC0000' };
const PIE_COLORS = ['#00E0BA','#FF3483','#FFD400','#0055DA','#91008D','#00C68D','#36ADA3','#FF0052'];

export default function DefectsPage() {
  const { t, lang, tStatus, tSeverity, tNum } = useI18n();
  const SECRET_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePwError, setDeletePwError] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const { toast } = useToast();
  const [defects, setDefects] = useState<Defect[]>([...defectsData]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ type:'Surface Defect', part:'', count:'1', severity:'minor', line:'A', description:'', inspector:'Sara Mohamed' });

  const total = defects.reduce((s,d)=>s+d.count,0);
  const byType = useMemo(()=>{
    const m: Record<string,{count:number,ar:string}> = {};
    defects.forEach(d=>{ 
      const key = d.type;
      if(!m[key]) m[key]={count:0,ar:(d as any).typeAr||d.type};
      m[key].count+=d.count;
    });
    return Object.entries(m).map(([name,val])=>({ name:lang==='ar'?val.ar:name.split(' ')[0], count:val.count }));
  }, [defects]);
  const bySeverity = ['minor','major','critical'].map(sev=>({ name:sev, count:defects.filter(d=>d.severity===sev).reduce((s,d)=>s+d.count,0) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (SECRET_PW && password !== SECRET_PW) { setPwError(lang==='ar'?'كلمة مرور خاطئة':'Wrong password'); return; }
    if (!form.part) { toast(t('common.required')+'!','error'); return; }
    const newD: Defect = {
      id: Date.now(), type:form.type, typeAr:form.type, part:form.part, partAr:form.part,
      description:form.description||'', count:Number(form.count)||1,
      severity:form.severity as Defect['severity'], severityAr:form.severity, inspectorAr:form.inspector||'',
      line:form.line, lineAr:form.line, date:new Date().toISOString().split('T')[0],
      status:'open', statusAr:'open', inspector:form.inspector,
    };
    setDefects([newD,...defects]);
    toast(t('toast.added'),'success');
    setModalOpen(false);
    setForm({ type:'Surface Defect',part:'',count:'1',severity:'minor',line:'A',description:'',inspector:'Sara Mohamed' });
  };

  return (
    <div className="animate-in">
      <PageHeader title={t('defects.title')} subtitle={t('defects.subtitle')}
        action={<Button variant="primary" onClick={()=>setModalOpen(true)}><MdAdd aria-hidden="true" size={16}/>{t('common.reportDefect')}</Button>}
      />

      <div className="grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:t('defects.totalDefects'), value:total, color:'#CC0000' },
          { label:t('defects.criticalIssues'), value:defects.filter(d=>d.severity==='critical').length, color:'#CC0000' },
          { label:lang==='ar'?'محلول':'Resolved', value:defects.filter(d=>d.status==='resolved').length, color:'#00C68D' },
          { label:lang==='ar'?'مفتوح':'Open', value:defects.filter(d=>d.status==='open').length, color:'#FFD400' },
        ].map(s=>(
          <div key={s.label} className="card card-hover" style={{ padding:18, textAlign:'center' }}>
            <div style={{ fontSize:30, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20, marginBottom:24 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>{t('defects.byType')}</div>
          <div dir="ltr" style={{ flex:1, minHeight:0 }}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={byType.map((item,i)=>({...item, fill:PIE_COLORS[i%PIE_COLORS.length]}))}
                cx="50%" cy="50%"
                innerRadius={40} outerRadius={80}
                dataKey="count" nameKey="name"
                stroke="#fff" strokeWidth={2} paddingAngle={3}
              >
                {byType.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:12 }} />
            </PieChart>
          </ResponsiveContainer>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 12px', marginTop:10 }}>
            {byType.map((item,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:6, overflow:'hidden' }}>
                <div style={{ width:8, height:8, borderRadius:2, background:PIE_COLORS[i%PIE_COLORS.length], flexShrink:0 }}/>
                <span style={{ fontSize:11, color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</span>
                <span style={{ fontSize:11, fontWeight:700, marginInlineStart:'auto', flexShrink:0 }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>{t('defects.bySeverity')}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:16, paddingTop:8 }}>
            {bySeverity.map(s=>{
              const color = s.name==='critical'?'#FF0052':s.name==='major'?'#FFD400':'#00C68D';
              const max = Math.max(...bySeverity.map(x=>x.count), 1);
              const label = lang==='ar' ? (s.name==='minor'?'بسيط':s.name==='major'?'كبير':'حرج') : s.name;
              return (
                <div key={s.name}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                    <span style={{ fontSize:13, fontWeight:600, color, textTransform:'capitalize' }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:800, color }}>{s.count}</span>
                  </div>
                  <div style={{ height:12, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:(s.count/max*100)+'%', background:color, borderRadius:99, transition:'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>{t('defects.statusBreakdown')}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:16, paddingTop:8 }}>
            {['open','investigating','resolved'].map(status=>{
              const count = defects.filter(d=>d.status===status).length;
              const color = status==='resolved'?'#00C68D':status==='investigating'?'#0055DA':'#FF0052';
              const label = lang==='ar'
                ? (status==='resolved'?'محلول':status==='investigating'?'قيد التحقيق':'مفتوح')
                : status.charAt(0).toUpperCase()+status.slice(1);
              const pct = defects.length ? Math.round(count/defects.length*100) : 0;
              return (
                <div key={status}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                    <span style={{ fontSize:13, fontWeight:600, color }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:800, color }}>{count} <span style={{ fontWeight:400, color:'var(--text-muted)', fontSize:11 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height:12, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:pct+'%', background:color, borderRadius:99, transition:'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:15 }}>{t('defects.defectLog')}</div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>{t('defects.type')}</th>
              <th>{t('defects.part')}</th>
              <th>{t('defects.count')}</th>
              <th>{t('defects.severity')}</th>
              <th className="hide-mobile">{t('defects.line')}</th>
              <th className="hide-mobile">{t('defects.inspector')}</th>
              <th className="hide-tablet">{t('common.date')}</th>
              <th>{t('common.status')}</th>
            </tr></thead>
            <tbody>
              {defects.slice((page-1)*PER_PAGE, page*PER_PAGE).map(d=>(
                <tr key={d.id}>
                  <td style={{ fontWeight:600, fontSize:13 }}>{lang==='ar'?(d as any).typeAr||d.type:d.type}</td>
                  <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{lang==='ar'?(d as any).partAr||d.part:d.part}</td>
                  <td style={{ fontWeight:700, color:'#CC0000' }}>{d.count}</td>
                  <td><span style={{ fontSize:12, fontWeight:700, color:SEVERITY_COLORS[d.severity], textTransform:'capitalize' }}>● {lang==='ar'?(d as any).severityAr||d.severity:d.severity}</span></td>
                  <td className="hide-mobile"><Badge variant="blue">{lang==='ar'?(d as any).lineAr||d.line:d.line}</Badge></td>
                  <td className="hide-mobile" style={{ fontSize:12, color:'var(--text-secondary)' }}>{lang==='ar'?(d as any).inspectorAr||d.inspector:d.inspector}</td>
                  <td className="hide-tablet" style={{ fontSize:11, color:'var(--text-muted)' }}>{d.date}</td>
                  <td><Badge variant={statusToVariant(d.status)}>{lang==='ar'?(d as any).statusAr||d.status:d.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={t('common.reportDefect')} size="md">
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label={t('defects.form.type')}>
              <Select value={form.type} onChange={e=>setForm(p=>({...p, type:e.target.value}))}>
                {[
                {v:'Surface Defect',ar:'عيب سطحي'},{v:'Dimensional Error',ar:'خطأ في الأبعاد'},
                {v:'Material Crack',ar:'تشقق المواد'},{v:'Assembly Error',ar:'خطأ في التجميع'},
                {v:'Coating Defect',ar:'عيب في الطلاء'},{v:'Welding Defect',ar:'عيب في اللحام'},
              ].map(opt=><option key={opt.v} value={opt.v}>{lang==='ar'?opt.ar:opt.v}</option>)}
              </Select>
            </FormField>
            <FormField label={t('defects.form.part')} required>
              <Input value={form.part} onChange={e=>setForm(p=>({...p, part:e.target.value}))} placeholder={lang==='ar'?'مثال: كتلة المحرك':'Engine Block'} required />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('defects.form.count')}>
              <Input type="number" value={form.count} onChange={e=>setForm(p=>({...p, count:e.target.value}))} placeholder={lang==='ar'?'١':'1'} min="1" />
            </FormField>
            <FormField label={t('defects.form.severity')}>
              <Select value={form.severity} onChange={e=>setForm(p=>({...p, severity:e.target.value}))}>
                <option value="minor">{lang==='ar'?'بسيط':'Minor'}</option>
                <option value="major">{lang==='ar'?'كبير':'Major'}</option>
                <option value="critical">{lang==='ar'?'حرج':'Critical'}</option>
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label={t('defects.form.line')}>
              <Select value={form.line} onChange={e=>setForm(p=>({...p, line:e.target.value}))}>
                {['A','B','C','D'].map(l=><option key={l} value={l}>Line {l}</option>)}
              </Select>
            </FormField>
            <FormField label={t('defects.inspector')}>
              <Input value={form.inspector} onChange={e=>setForm(p=>({...p, inspector:e.target.value}))} placeholder="Sara Mohamed" />
            </FormField>
          </FormRow>
          <FormField label={t('defects.form.description')}>
            <Textarea value={form.description} onChange={e=>setForm(p=>({...p, description:e.target.value}))} placeholder={lang==='ar'?'اوصف العيب...':'Describe the defect...'} />
          </FormField>
          <FormField label={lang==='ar'?'كلمة المرور':'Password'} required>

            <Input type="password" value={password} onChange={e=>{setPassword(e.target.value);setPwError('');}}

              placeholder={lang==='ar'?'أدخل كلمة المرور':'Enter password'} />

            {pwError && <div style={{color:'#dc2626',fontSize:12,marginTop:4}}>{pwError}</div>}

          </FormField>

          <FormActions>

            <Button variant="secondary" type="button" onClick={()=>{setModalOpen(false);setPassword('');setPwError('');}}>{t('common.cancel')}</Button>
            <Button variant="primary" type="submit">{t('common.reportDefect')}</Button>
          </FormActions>
        </form>
      </Modal>
      <Pagination page={page} total={defects.length} perPage={PER_PAGE} onChange={setPage} />
    </div>
  );
}