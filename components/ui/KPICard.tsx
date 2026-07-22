'use client';

import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { useI18n } from '@/i18n';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: React.ElementType;
  color: string;
}

export default function KPICard({ title, value, subtitle, change, icon: Icon, color }: Props) {
  const { lang } = useI18n();
  const pos = (change ?? 0) >= 0;

  return (
    <div className="card card-hover" style={{ padding:'15px 16px', cursor:'default' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:10.5, fontWeight:600, color:'var(--text-muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.07em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {title}
          </div>
          <div style={{ fontSize:24, fontWeight:800, color:'var(--text-primary)', lineHeight:1.1, marginBottom:4 }}>
            {value}
          </div>
          {subtitle && (
            <div style={{ fontSize:11.5, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{subtitle}</div>
          )}
          {change !== undefined && (
            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:7, color:pos?'var(--success)':'var(--danger)', fontSize:11.5, fontWeight:600 }}>
              {pos ? <MdTrendingUp size={13}/> : <MdTrendingDown size={13}/>}
              {Math.abs(change)}% {lang==='ar'?'مقارنة بالشهر الماضي':'vs last month'}
            </div>
          )}
        </div>
        <div style={{ width:40, height:40, borderRadius:10, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid ${color}22` }}>
          <Icon size={19} style={{ color }} />
        </div>
      </div>
    </div>
  );
}