'use client';

import { useEffect } from 'react';
import { MdErrorOutline, MdRefresh } from 'react-icons/md';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Global error:', error); }, [error]);

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-app)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(200,30,30,0.1)', border:'2px solid rgba(200,30,30,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <MdErrorOutline size={36} style={{ color:'#c81e1e' }} />
        </div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)', marginBottom:10 }}>Something went wrong</h2>
        <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:28, lineHeight:1.6 }}>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button onClick={reset}
          style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 28px', background:'linear-gradient(135deg,#c81e1e,#e63535)', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(200,30,30,0.35)', fontFamily:'inherit' }}>
          <MdRefresh size={17}/> Try Again
        </button>
      </div>
    </div>
  );
}