'use client';

import { useState } from 'react';
import { MdDownload, MdDescription, MdTableChart, MdPictureAsPdf, MdAdd, MdCheckCircle } from 'react-icons/md';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { FormField, Select, FormActions } from '@/components/ui/FormField';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';

const reports = [
  { id:1, name:'Monthly Production Report',     nameAr:'تقرير الإنتاج الشهري',           description:'Complete output, efficiency and defect analysis',                  descAr:'تحليل الإنتاج والكفاءة والعيوب',              type:'CSV',   lastGenerated:new Date().toISOString().split('T')[0], size:'2.4 MB', icon:MdDescription, color:'#CC0000', module:'production' },
  { id:2, name:'Employee Performance Summary',   nameAr:'ملخص أداء الموظفين',              description:'Attendance, KPIs and payroll overview',                            descAr:'الحضور ومؤشرات الأداء ونظرة عامة على الرواتب', type:'CSV', lastGenerated:new Date().toISOString().split('T')[0], size:'1.1 MB', icon:MdDescription,   color:'#00C68D', module:'employees' },
  { id:3, name:'Inventory Status Report',        nameAr:'تقرير حالة المخزون',              description:'Stock levels, alerts and reorder recommendations',                 descAr:'مستويات المخزون والتنبيهات وتوصيات إعادة الطلب',type:'CSV',   lastGenerated:new Date().toISOString().split('T')[0], size:'0.8 MB', icon:MdDescription, color:'#CC0000', module:'inventory' },
  { id:4, name:'Financial Summary Q4',           nameAr:'الملخص المالي الربع الرابع',      description:'Revenue, expenses, profit and transactions',                       descAr:'الإيرادات والمصروفات والأرباح والمعاملات',    type:'CSV', lastGenerated:new Date().toISOString().split('T')[0], size:'3.2 MB', icon:MdDescription,   color:'#00C68D', module:'finance' },
  { id:5, name:'Quality Control Report',         nameAr:'تقرير مراقبة الجودة',             description:'Inspection results and defect rate analysis',                     descAr:'نتائج الفحص وتحليل معدل العيوب',              type:'CSV',   lastGenerated:new Date().toISOString().split('T')[0], size:'1.5 MB', icon:MdDescription, color:'#CC0000', module:'quality' },
  { id:6, name:'Machine Maintenance Log',        nameAr:'سجل صيانة الآلات',                description:'Scheduled and completed maintenance records',                     descAr:'سجلات الصيانة المجدولة والمنجزة',             type:'CSV',   lastGenerated:new Date().toISOString().split('T')[0], size:'0.6 MB', icon:MdDescription,  color:'#0055DA', module:'maintenance' },
  { id:7, name:'Supplier Performance Analysis',  nameAr:'تحليل أداء الموردين',             description:'On-time delivery rates and order volumes',                        descAr:'معدلات التسليم في الوقت وأحجام الطلبات',     type:'CSV', lastGenerated:new Date().toISOString().split('T')[0], size:'0.9 MB', icon:MdDescription,   color:'#00C68D', module:'suppliers' },
  { id:8, name:'Order Fulfillment Report',       nameAr:'تقرير تنفيذ الطلبات',             description:'Order status, delivery timelines and customer satisfaction',       descAr:'حالة الطلبات والجداول الزمنية ورضا العملاء',  type:'CSV',   lastGenerated:new Date().toISOString().split('T')[0], size:'1.3 MB', icon:MdDescription, color:'#CC0000', module:'orders' },
];

export default function ReportsPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [genForm, setGenForm] = useState({ module:'production', format:'PDF', period:'monthly' });
  const [downloading, setDownloading] = useState<number|null>(null);

  const handleDownload = async (report: typeof reports[0]) => {
    setDownloading(report.id);
    const SURL = 'https://vopgydykkzxcfnnqoize.supabase.co';
    const SKEY = 'sb_publishable_aTFOgIF4IwUsj0c2ehHiLw_slfSIWxi';
    const H = {'apikey':SKEY,'Authorization':'Bearer '+SKEY};
    const tableMap: Record<string,{table:string,cols:string[]}> = {
      employees: {table:'employees',cols:['id','name','email','role','department','shift','salary','attendance','performance','status','join_date']},
      inventory:  {table:'inventory',cols:['id','name','category','quantity','unit','min_stock','unit_price','status','location']},
      orders:     {table:'orders',cols:['id','customer','product','quantity','total','status','priority','order_date','delivery_date']},
      suppliers:  {table:'suppliers',cols:['id','name','contact','email','category','rating','total_orders','on_time_delivery','status']},
      maintenance:{table:'maintenance',cols:['id','machine','type','priority','technician','scheduled_date','estimated_hours','status']},
      quality:    {table:'quality_inspections',cols:['id','item','inspector','status','score','date','notes']},

      production: {table:'production_daily',cols:['id','day','actual','target','defects','date']},

      finance:    {table:'orders',cols:['id','customer','product','quantity','total','status','order_date']},
    };
    const cfg = tableMap[report.module];
    let rows: any[] = [];
    let cols: string[] = [];
    if (cfg) {
      try {
        const res = await fetch(`${SURL}/rest/v1/${cfg.table}?select=*&limit=500`,{headers:H});
        rows = await res.json();
        cols = cfg.cols;
      } catch {}
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      rows = [{info:'No data available',report:report.name,date:new Date().toISOString()}];
      cols = ['info','report','date'];
    }
    const csv = [cols.join(','), ...rows.map((r:any)=>cols.map((col:string)=>{const v=String(r[col]??'');return v.includes(',')? '"'+v+'"' :v;}).join(','))].join('\n');
    const blob = new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = report.name.replace(/\s+/g,'-')+'-'+new Date().toISOString().split('T')[0]+'.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloading(null);
    toast(`${report.name} downloaded!`,'success');
  };

  return (
    <div className="animate-in">
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')}
        
      />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, marginBottom:28 }}>
        {[
          { label:t('reports.totalReports'), value:reports.length, color:'#0055DA' },
          { label:lang==='ar'?'تقارير CSV':'CSV Reports', value:reports.length, color:'#00C68D' },
          { label:t('reports.generatedMonth'), value:reports.length, color:'#FFD400' },
        ].map(s=>(
          <div key={s.label} className="card card-hover" style={{ padding:'28px 24px', textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
        {reports.map(r=>{
          const Icon = r.icon;
          const isDownloading = downloading === r.id;
          return (
            <div key={r.id} className="card card-hover" style={{ padding:20 }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:16 }}>
                <div style={{ width:46, height:46, borderRadius:12, flexShrink:0, background:r.color+'15', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${r.color}20` }}>
                  <Icon size={22} style={{ color:r.color }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{lang==='ar'?(r as any).nameAr||r.name:r.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>{lang==='ar'?(r as any).descAr||r.description:r.description}</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:14, borderTop:'1px solid var(--border)' }}>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>
                  <span style={{ fontWeight:600, color:r.type==='PDF'?'#CC0000':'#00C68D', marginInlineEnd:8, background:r.type==='PDF'?'rgba(204,0,0,0.08)':'rgba(0,198,141,0.08)', padding:'2px 8px', borderRadius:5 }}>{r.type}</span>
                  <span style={{ marginInlineStart:4 }}>{r.size}</span> <span style={{ color:'var(--text-muted)', margin:'0 4px' }}>·</span> {r.lastGenerated}
                </div>
                <button onClick={()=>handleDownload(r)} disabled={isDownloading}
                  style={{ display:'flex', alignItems:'center', gap:6, background:isDownloading?'rgba(0,198,141,0.2)':'linear-gradient(135deg,#CC0000,#FF3300)', color:isDownloading?'#00C68D':'#fff', border:'none', borderRadius:8, padding:'7px 14px', cursor:isDownloading?'not-allowed':'pointer', fontSize:12, fontWeight:600, transition:'all 0.2s' }}>
                  {isDownloading ? <><MdCheckCircle size={14}/>Downloading...</> : <><MdDownload size={14}/>{t('reports.download')}</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}