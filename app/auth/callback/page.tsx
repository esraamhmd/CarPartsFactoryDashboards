'use client';

import { useEffect } from 'react';
import { MdPrecisionManufacturing } from 'react-icons/md';
import { saveUserToStorage } from '@/lib/auth';
import { getSession, getUser } from '@/lib/supabase';

export default function AuthCallbackPage() {
  useEffect(() => {
    const handle = async () => {
      try {
        const session = await getSession();
        if (!session) { window.location.href = '/login'; return; }
        const u = await getUser();
        if (u) {
          const name = u.user_metadata?.full_name || u.email?.split('@')[0] || 'User';
          saveUserToStorage(name, u.email || '', false);
          window.location.href = '/';
        } else {
          window.location.href = '/login';
        }
      } catch {
        window.location.href = '/login';
      }
    };
    handle();
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#090d14,#141929)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <div style={{ width:64, height:64, borderRadius:18, background:'linear-gradient(135deg,#c81e1e,#e63535)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 32px rgba(200,30,30,0.45)' }}>
        <MdPrecisionManufacturing size={32} color="#fff" />
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:24, height:24, borderRadius:'50%', border:'3px solid rgba(200,30,30,0.3)', borderTopColor:'#c81e1e', animation:'spin 0.7s linear infinite' }}/>
        <span style={{ color:'rgba(255,255,255,0.7)', fontSize:16 }}>Completing sign in…</span>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}