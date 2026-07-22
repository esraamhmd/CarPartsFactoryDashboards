'use client';

import { useState, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MdDirectionsCar, MdSearch, MdClose, MdElectricCar, MdSpeed } from 'react-icons/md';
import Badge, { statusToVariant } from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import { useI18n } from '@/i18n';
import carsData from '@/data/cars.json';

const PieChart = dynamic(() => import('recharts').then(m=>m.PieChart), {ssr:false});
const Pie = dynamic(() => import('recharts').then(m=>m.Pie), {ssr:false});
const Cell = dynamic(() => import('recharts').then(m=>m.Cell), {ssr:false, loading:()=>null});
const BarChart = dynamic(() => import('recharts').then(m=>m.BarChart), {ssr:false});
const Bar = dynamic(() => import('recharts').then(m=>m.Bar), {ssr:false});
const XAxis = dynamic(() => import('recharts').then(m=>m.XAxis), {ssr:false});
const YAxis = dynamic(() => import('recharts').then(m=>m.YAxis), {ssr:false});
const Tooltip = dynamic(() => import('recharts').then(m=>m.Tooltip), {ssr:false});
const CartesianGrid = dynamic(() => import('recharts').then(m=>m.CartesianGrid), {ssr:false});
const ResponsiveContainer = dynamic(() => import('recharts').then(m=>m.ResponsiveContainer), {ssr:false});

const STATUS_COLOR: Record<string,string> = {
  in_production:'#c81e1e', quality_check:'#7c3aed', completed:'#059669', shipped:'#059669', pending:'#d97706',
};
const FUEL_COLOR: Record<string,string> = {
  Gasoline:'#c81e1e', Electric:'#2563eb', Hybrid:'#059669', 'Plug-in Hybrid':'#7c3aed', 'Mild Hybrid':'#d97706',
};
const PIE = ['#00E0BA','#FF3483','#FFD400','#0055DA','#91008D','#00C68D','#36ADA3','#FF0052'];

export default function CarsPage() {
  const { lang, tNum, tCarStatus, tFuel } = useI18n();
  const [search, setSearch] = useState('');
  const [fuelFilter, setFuelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<typeof carsData[0]|null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 24;

  const fuels    = useMemo(() => ['all', ...Array.from(new Set(carsData.map(c=>c.fuel_type)))], []);
  const statuses = useMemo(() => ['all', ...Array.from(new Set(carsData.map(c=>c.status)))], []);

  const filtered = useMemo(() => carsData.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.make.toLowerCase().includes(q) || c.model.toLowerCase().includes(q) || c.trim.toLowerCase().includes(q) || c.client.toLowerCase().includes(q))
      && (fuelFilter==='all' || c.fuel_type===fuelFilter)
      && (statusFilter==='all' || c.status===statusFilter);
  }), [search, fuelFilter, statusFilter]);

  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const totalPages = Math.ceil(filtered.length/PER_PAGE);

  const fuelDist = useMemo(() => {
    const m: Record<string,number> = {};
    carsData.forEach(c => { m[c.fuel_type]=(m[c.fuel_type]||0)+1; });
    return Object.entries(m).map(([name,value])=>({name,value}));
  },[]);

  const makeDist = useMemo(() => {
    const m: Record<string,number> = {};
    carsData.forEach(c => { m[c.make]=(m[c.make]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,count])=>({name:name.split('-')[0],count}));
  },[]);

  const totalValue = carsData.reduce((s,c)=>s+c.price_usd,0);
  const inProd = carsData.filter(c=>c.status==='in_production').length;
  const elec = carsData.filter(c=>c.fuel_type==='Electric').length;
  const tt = { background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:12 };

  return (
    <div className="animate-in">
      <PageHeader
        title={lang==='ar'?'كتالوج المركبات':'Vehicle Catalog'}
        subtitle={`${carsData.length} ${lang==='ar'?'مركبة مُتتبَّعة':'vehicles tracked'} · $${(totalValue/1000000).toFixed(1)}M`}
      />

      {/* KPIs */}
      <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:lang==='ar'?'إجمالي المركبات':'Total Vehicles',  value:carsData.length, color:'#2563eb' },
          { label:lang==='ar'?'قيد الإنتاج':'In Production',       value:inProd,          color:'#c81e1e' },
          { label:lang==='ar'?'كهربائية':'Electric Vehicles',       value:elec,            color:'#059669' },
          { label:lang==='ar'?'متوسط السعر':'Avg Price',            value:'$'+Math.round(totalValue/carsData.length/1000)+'K', color:'#d97706' },
        ].map(s=>(
          <div key={s.label} className="card card-hover" style={{ padding:'16px 18px', textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-cols-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:20 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>{lang==='ar'?'توزيع نوع الوقود':'Fuel Type Distribution'}</div>
          <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
            <Suspense fallback={<div className="skeleton" style={{ width:130, height:130, borderRadius:'50%' }} />}>
              <div dir="ltr" style={{ flex:1, minHeight:0 }}>
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie
                    data={fuelDist.map((item,i)=>({...item, fill:PIE[i%PIE.length]}))}
                    cx="50%" cy="50%"
                    innerRadius={30} outerRadius={58}
                    dataKey="value" stroke="#fff" strokeWidth={2} paddingAngle={3}
                  >
                    {fuelDist.map((_,i)=>(
                      <Cell key={`fuel-${i}`} fill={PIE[i%PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tt} />
                </PieChart>
              </ResponsiveContainer>
              </div>
            </Suspense>
            <div style={{ flex:1, minWidth:110 }}>
              {fuelDist.map((item,i)=>(
                <div key={item.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:8,height:8,borderRadius:2,background:PIE[i%PIE.length],flexShrink:0 }}/>
                    <span style={{ fontSize:11.5, color:'var(--text-secondary)' }}>{lang==='ar'?tFuel(item.name):item.name}</span>
                  </div>
                  <span style={{ fontSize:11.5,fontWeight:600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>{lang==='ar'?'أكثر الماركات':'Top Makes'}</div>
          <Suspense fallback={<div className="skeleton" style={{ height:200 }} />}>
            <div dir="ltr" style={{ flex:1, minHeight:0 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={makeDist} layout="vertical"
                barSize={28} barCategoryGap="20%"
                margin={{ top:4, right:45, bottom:4, left:50 }}>
                <XAxis type="number" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} tickCount={4} dy={4} />
                <YAxis type="category" dataKey="name"
                  width={70}
                  tick={{ fontSize:11, fill:'var(--text-primary)', fontWeight:500 }}
                  axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tt} />
                <Bar dataKey="count" fill="#0055DA" radius={[0,6,6,0]} name={lang==='ar'?'عدد المركبات':'Vehicles'}
                  label={{ position:'right', fontSize:12, fill:'var(--text-secondary)', fontWeight:700 }} />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </Suspense>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom:18 }}>
        <div style={{ padding:'12px 16px', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg-input)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, padding:'7px 12px', flex:1, maxWidth:360 }}>
            <MdSearch aria-hidden="true" size={15} style={{ color:'var(--text-muted)', flexShrink:0 }} />
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
              placeholder={lang==='ar'?'بحث عن ماركة، موديل، عميل...':'Search make, model, client...'}
              style={{ background:'none', border:'none', outline:'none', fontSize:13, color:'var(--text-primary)', width:'100%' }} />
            {search && <button onClick={()=>{setSearch('');setPage(1);}} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:0 }}><MdClose aria-hidden="true" size={13} aria-hidden="true"/></button>}
          </div>
          <select value={fuelFilter} onChange={e=>{setFuelFilter(e.target.value);setPage(1);}}
            style={{ background:'var(--bg-input)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, padding:'7px 12px', fontSize:13, color:'var(--text-primary)', cursor:'pointer', outline:'none' }}>
            <option value="all">{lang==='ar'?'كل أنواع الوقود':'All Fuel Types'}</option>
            {fuels.filter(f=>f!=='all').map(f=><option key={f} value={f}>{lang==='ar'?tFuel(f):f}</option>)}
          </select>
          <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}
            style={{ background:'var(--bg-input)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, padding:'7px 12px', fontSize:13, color:'var(--text-primary)', cursor:'pointer', outline:'none' }}>
            <option value="all">{lang==='ar'?'كل الحالات':'All Statuses'}</option>
            {statuses.filter(s=>s!=='all').map(s=><option key={s} value={s}>{lang==='ar'?tCarStatus(s):s.replace(/_/g,' ')}</option>)}
          </select>
          <span style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{filtered.length} {lang==='ar'?'مركبة':'vehicles'}</span>
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14, marginBottom:20 }}>
        {paginated.map(car=>{
          const fc = FUEL_COLOR[car.fuel_type]||'#2563eb';
          const sc = STATUS_COLOR[car.status]||'#64748b';
          return (
            <div key={car.id} className="card card-hover" style={{ padding:16, cursor:'pointer' }} onClick={()=>setSelected(car)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                  <div style={{ width:38, height:38, borderRadius:9, background:fc+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {car.fuel_type==='Electric'?<MdElectricCar size={18} style={{ color:fc }}/>:<MdDirectionsCar size={18} style={{ color:fc }}/>}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, lineHeight:1.2 }}>{car.year} {car.make}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{car.model} — {car.trim}</div>
                  </div>
                </div>
                <span style={{ fontSize:10.5, fontWeight:600, padding:'3px 8px', borderRadius:99, background:sc+'18', color:sc, whiteSpace:'nowrap' }}>
                  {lang==='ar'?tCarStatus(car.status):car.status.replace(/_/g,' ')}
                </span>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:10 }}>
                {[
                  { label:lang==='ar'?'المحرك':'Engine', value:car.engine.split(' ').slice(0,2).join(' ') },
                  { label:'HP', value:car.horsepower },
                  { label:lang==='ar'?'نوع الوقود':'Fuel',  value:lang==='ar'?tFuel(car.fuel_type):car.fuel_type.split(' ')[0] },
                ].map(s=>(
                  <div key={s.label} style={{ background:'var(--bg-page)', borderRadius:7, padding:'6px 8px' }}>
                    <div style={{ fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:2 }}>{s.label}</div>
                    <div style={{ fontSize:11.5, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10, borderTop:'1px solid var(--border)' }}>
                <div style={{ fontSize:11, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'60%' }}>{car.client}</div>
                <div style={{ fontSize:16, fontWeight:800, color:'#c81e1e', flexShrink:0 }}>${car.price_usd.toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:20, flexWrap:'wrap' }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
            style={{ padding:'6px 14px', borderRadius:8, borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', background:'var(--bg-card)', cursor:page===1?'not-allowed':'pointer', fontSize:13, opacity:page===1?0.4:1 }}>
            {lang==='ar'?'السابق':'Prev'}
          </button>
          {Array.from({length:totalPages},(_,i)=>i+1).filter(n=>Math.abs(n-page)<=2).map(n=>(
            <button key={n} onClick={()=>setPage(n)}
              style={{ padding:'6px 12px', borderRadius:8, border:'1px solid '+(n===page?'#c81e1e':'var(--border)'), background:n===page?'#c81e1e':'var(--bg-card)', color:n===page?'#fff':'var(--text-primary)', cursor:'pointer', fontSize:13, fontWeight:n===page?700:400 }}>
              {n}
            </button>
          ))}
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
            style={{ padding:'6px 14px', borderRadius:8, borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', background:'var(--bg-card)', cursor:page===totalPages?'not-allowed':'pointer', fontSize:13, opacity:page===totalPages?0.4:1 }}>
            {lang==='ar'?'التالي':'Next'}
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.52)', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'60px 16px 16px', backdropFilter:'blur(5px)', overflowY:'auto' }}
          onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}}>
          <div style={{ background:'var(--bg-card)', borderRadius:18, width:'min(94vw,700px)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', boxShadow:'0 24px 64px rgba(0,0,0,0.28)', overflow:'hidden', flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid var(--border)', background:'linear-gradient(135deg,var(--primary-bg),var(--blue-bg))' }}>
              <div>
                <h2 style={{ fontSize:17, fontWeight:800, marginBottom:2 }}>{selected.year} {selected.make} {selected.model}</h2>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>{selected.trim} · {selected.body_type}</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{ background:'var(--bg-page)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, padding:'6px 8px', cursor:'pointer', fontSize:20, lineHeight:1, color:'var(--text-secondary)' }}>×</button>
            </div>
            <div style={{ padding:20 }}>
              <div style={{ fontSize:24, fontWeight:900, color:'#c81e1e', marginBottom:14 }}>${selected.price_usd.toLocaleString()}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:9 }}>
                {[
                  [lang==='ar'?'المحرك':'Engine', selected.engine],
                  [lang==='ar'?'الاسطوانات':'Cylinders', selected.cylinders||lang==='ar'?'كهربائي':'Electric'],
                  ['HP', selected.horsepower+' hp'],
                  [lang==='ar'?'عزم الدوران':'Torque', selected.torque_nm+' Nm'],
                  [lang==='ar'?'ناقل الحركة':'Transmission', selected.transmission],
                  [lang==='ar'?'نظام الدفع':'Drivetrain', selected.drivetrain],
                  [lang==='ar'?'نوع الوقود':'Fuel', lang==='ar'?tFuel(selected.fuel_type):selected.fuel_type],
                  [lang==='ar'?'المدينة':'City MPG', selected.fuel_economy_city],
                  [lang==='ar'?'الطريق':'Hwy MPG', selected.fuel_economy_highway],
                  [lang==='ar'?'الأبواب':'Doors', selected.doors],
                  [lang==='ar'?'المقاعد':'Seats', selected.seats],
                  [lang==='ar'?'اللون الخارجي':'Color Ext.', selected.color_exterior],
                  [lang==='ar'?'العميل':'Client', selected.client],
                  [lang==='ar'?'رقم الطلب':'Order', selected.order_id],
                  [lang==='ar'?'الاكتمال':'Completion', selected.estimated_completion],
                ].map(([l,v])=>(
                  <div key={String(l)} style={{ background:'var(--bg-page)', borderRadius:8, padding:'8px 10px' }}>
                    <div style={{ fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:12.5, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>
                  {lang==='ar'?'القطع المطلوبة':'Parts Required'} ({selected.parts_needed.length})
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {selected.parts_needed.map(p=>(
                    <span key={p} style={{ fontSize:12, padding:'4px 10px', borderRadius:99, background:'rgba(200,30,30,0.08)', color:'#c81e1e', border:'1px solid rgba(200,30,30,0.20)', fontWeight:500 }}>{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}