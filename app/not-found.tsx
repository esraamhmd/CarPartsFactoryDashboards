import Link from 'next/link';
import { MdHome, MdSearchOff } from 'react-icons/md';

export const metadata = { title: '404 — Page Not Found | MotorSync' };

export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-app)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:420 }}>
        <div style={{ fontSize:96, fontWeight:900, color:'rgba(200,30,30,0.15)', lineHeight:1, marginBottom:8 }}>404</div>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(200,30,30,0.1)', border:'2px solid rgba(200,30,30,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <MdSearchOff size={36} style={{ color:'#c81e1e' }} />
        </div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)', marginBottom:10 }}>Page Not Found</h2>
        <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:28, lineHeight:1.6 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/"
          style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 28px', background:'linear-gradient(135deg,#c81e1e,#e63535)', color:'#fff', borderRadius:10, fontSize:14, fontWeight:700, textDecoration:'none', boxShadow:'0 4px 16px rgba(200,30,30,0.35)' }}>
          <MdHome size={17}/> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}