'use client';

type Variant = 'green'|'red'|'yellow'|'blue'|'gray'|'purple';

interface Props { children: React.ReactNode; variant?: Variant; }

const styles: Record<Variant, {bg:string;color:string}> = {
  green:  { bg:'var(--success-bg)',      color:'#059669' },
  red:    { bg:'var(--primary-bg)',      color:'#c81e1e' },
  yellow: { bg:'var(--warning-bg)',      color:'#d97706' },
  blue:   { bg:'var(--accent-blue-bg)', color:'#2563eb' },
  gray:   { bg:'var(--bg-page)',         color:'var(--text-secondary)' },
  purple: { bg:'rgba(139,92,246,0.1)',   color:'#7c3aed' },
};

export function statusToVariant(status: string): Variant {
  const m: Record<string, Variant> = {
    active:'green', running:'green', available:'green', completed:'green',
    shipped:'green', paid:'green', 'on-time':'green', resolved:'green', pass:'green',
    maintenance:'red', 'out-of-stock':'red', cancelled:'red', critical:'red', open:'red', absent:'red', fail:'red',
    'low-stock':'yellow', pending:'yellow', warning:'yellow', late:'yellow',
    'under-performing':'yellow','on-leave':'yellow', scheduled:'yellow', overdue:'yellow',
    'in-production':'blue','quality-check':'blue','in-progress':'blue', investigating:'blue',
    idle:'gray', inactive:'gray', review:'yellow',
  };
  return m[status] || 'gray';
}

export default function Badge({ children, variant = 'gray' }: Props) {
  const s = styles[variant];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:99, fontSize:11.5, fontWeight:600, background:s.bg, color:s.color, whiteSpace:'nowrap' }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:s.color, flexShrink:0 }} />
      {children}
    </span>
  );
}