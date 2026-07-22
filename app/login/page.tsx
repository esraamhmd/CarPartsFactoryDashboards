'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [tab,      setTab]      = useState<'login'|'reset'>('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [toast,    setToast]    = useState('');
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const setUserAndGo = (name: string, email: string, isGuest = false) => {
    const initials = name.split(' ').filter(Boolean).map(p => p[0]).join('').toUpperCase().slice(0,2) || name.slice(0,2).toUpperCase();
    const u = { name, email, initials, isGuest };
    localStorage.setItem('ms_user', JSON.stringify(u));
    document.cookie = `ms_user=${encodeURIComponent(JSON.stringify(u))};path=/;max-age=604800;SameSite=Lax`;
    showToast('✓ Signed in!');
    setTimeout(() => { window.location.href = '/'; }, 700);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

    if (url.includes('.supabase.co') && key.length > 10) {
      try {
        const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (res.ok && data?.user) {
          const name = data.user.user_metadata?.full_name || email.split('@')[0];
          // Log to DB
          fetch(`${url}/rest/v1/user_sessions`, {
            method: 'POST',
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify({ user_id: data.user.id, email, full_name: name, logged_in_at: new Date().toISOString() }),
          });
          fetch(`${url}/rest/v1/profiles`, {
            method: 'POST',
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({ id: data.user.id, email, full_name: name, last_login: new Date().toISOString(), updated_at: new Date().toISOString() }),
          });
          setLoading(false);
          setUserAndGo(name, email, false);
          return;
        }
        if (!res.ok) {
          setError(data?.error_description || data?.message || 'Invalid email or password');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Auth error:', err);
      }
    }

    // Local fallback
    const name = email.split('@')[0].replace(/[._-]/g,' ').replace(/\b\w/g, c => c.toUpperCase());
    setLoading(false);
    setUserAndGo(name, email, false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Enter your email.'); return; }
    setLoading(true);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    if (url && key) {
      await fetch(`${url}/auth/v1/recover`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    }
    setLoading(false);
    showToast('✓ Reset email sent!');
    setTab('login');
  };

  const handleGuest = () => {
    setUserAndGo('Guest', 'guest@motorsync.com', true);
  };

  if (!mounted) return null;

  const bg = { minHeight:'100vh', background:'linear-gradient(135deg,#090d14 0%,#141929 50%,#0d1120 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' };
  const inp: React.CSSProperties = { width:'100%', padding:'11px 14px 11px 40px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:'10px', fontSize:'14px', color:'#fff', outline:'none', fontFamily:'inherit', boxSizing:'border-box' };

  return (
    <div style={bg}>
      {/* Background glows */}
      <div style={{ position:'fixed', top:'-10%', right:'-10%', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle,rgba(200,30,30,0.15),transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-10%', left:'-10%', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle,rgba(0,85,218,0.12),transparent 70%)', pointerEvents:'none' }} />

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:'24px', left:'50%', transform:'translateX(-50%)', background:'#059669', color:'#fff', padding:'12px 22px', borderRadius:'12px', fontSize:'14px', fontWeight:600, zIndex:9999, display:'flex', alignItems:'center', gap:'8px', whiteSpace:'nowrap', boxShadow:'0 8px 24px rgba(0,0,0,0.3)' }}>
          ✓ {toast}
        </div>
      )}

      <div style={{ width:'100%', maxWidth:'420px', position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:'72px', height:'72px', borderRadius:'20px', background:'linear-gradient(135deg,#c81e1e,#e63535)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 8px 32px rgba(200,30,30,0.45)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 8.4L19.5 6.9C19.8 6.3 20 5.7 20 5c0-2.2-1.8-4-4-4S12 2.8 12 5c0 2.1 1.6 3.8 3.7 4L14 11.3 11.4 9.7 10 8l-8 4.4 1 1.7 6.3-3.5 7.3 4.3-1 6-1.2.2-.4-2.8-7 1.2.4 2.8L6.1 23 7 24.8l6.8-1.7.4 2.5C14.8 26.5 15.9 27 17 27c1.9 0 3.5-1.4 3.7-3.3l.3-2c1.2-.5 2-1.7 2-3v-7c0-.9-.4-1.7-1-2.3zM16 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
            </svg>
          </div>
          <h1 style={{ fontSize:'26px', fontWeight:800, color:'#fff', margin:'0 0 6px' }}>MotorSync</h1>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', margin:'6px 0 0' }}>Car Parts Factory ERP Dashboard</p>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:'18px', padding:'28px', backdropFilter:'blur(20px)' }}>
              {/* Guest */}
        <div style={{ marginBottom:'12px' }}>
          <button onClick={handleGuest}
            style={{ width:'100%', padding:'13px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:'10px', color:'rgba(255,255,255,0.55)', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.09)';e.currentTarget.style.color='#fff';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='rgba(255,255,255,0.55)';}}>
            Try without signing in
          </button>
        </div>
          {tab === 'login' ? (
            <>
              <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', margin:'0 0 4px' }}>Welcome back</h2>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.42)', margin:'0 0 22px' }}>Sign in to access your dashboard</p>

              {error && <div style={{ background:'rgba(220,38,38,0.13)', border:'1px solid rgba(220,38,38,0.35)', borderRadius:'9px', padding:'10px 14px', marginBottom:'18px', fontSize:'13px', color:'#f87171' }}>{error}</div>}

              <form onSubmit={handleLogin} noValidate>
                <div style={{ marginBottom:'14px' }}>
                  <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.65)', marginBottom:'7px' }}>Email Address</label>
                  <div style={{ position:'relative' }}>
                    <svg style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@motorsync.com" style={inp} autoComplete="email" required />
                  </div>
                </div>

                <div style={{ marginBottom:'6px' }}>
                  <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.65)', marginBottom:'7px' }}>Password</label>
                  <div style={{ position:'relative' }}>
                    <svg style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={{ ...inp, paddingRight:'44px' }} autoComplete="current-password" required />
                    <button type="button" onClick={()=>setShowPass(!showPass)} aria-label={showPass?'Hide password':'Show password'}
                      style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', padding:'10px', minWidth:'44px', minHeight:'44px' }}>
                      {showPass
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                </div>

                <div style={{ textAlign:'right', marginBottom:'20px' }}>
                  <button type="button" onClick={()=>{setTab('reset');setError('');}}
                    style={{ background:'none', border:'none', cursor:'pointer', fontSize:'13px', color:'rgba(255,255,255,0.5)', fontFamily:'inherit', padding:'8px 0' }}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  style={{ width:'100%', padding:'13px', background: loading ? 'rgba(200,30,30,0.5)' : 'linear-gradient(135deg,#c81e1e,#e63535)', color:'#fff', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow:'0 4px 20px rgba(200,30,30,0.35)', fontFamily:'inherit' }}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <div style={{ textAlign:'center', marginTop:'16px', fontSize:'13px' }}>
                <span style={{ color:'rgba(255,255,255,0.4)' }}>Don&apos;t have an account? </span>
                <Link href="/signup" style={{ color:'#c81e1e', fontWeight:600, textDecoration:'none' }}>Sign Up</Link>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', margin:'0 0 4px' }}>Reset Password</h2>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.42)', margin:'0 0 22px' }}>Enter your email to receive a reset link</p>
              {error && <div style={{ background:'rgba(220,38,38,0.13)', border:'1px solid rgba(220,38,38,0.35)', borderRadius:'9px', padding:'10px 14px', marginBottom:'18px', fontSize:'13px', color:'#f87171' }}>{error}</div>}
              <form onSubmit={handleReset} noValidate>
                <div style={{ marginBottom:'22px' }}>
                  <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.65)', marginBottom:'7px' }}>Email Address</label>
                  <div style={{ position:'relative' }}>
                    <svg style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@motorsync.com" style={inp} required />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  style={{ width:'100%', padding:'13px', background: loading ? 'rgba(200,30,30,0.5)' : 'linear-gradient(135deg,#c81e1e,#e63535)', color:'#fff', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
                  {loading ? 'Sending…' : 'Send Reset Email'}
                </button>
              </form>
              <div style={{ textAlign:'center', marginTop:'16px' }}>
                <button onClick={()=>{setTab('login');setError('');}}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', fontSize:'13px', fontFamily:'inherit', padding:'8px' }}>
                  ← Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>

        
      </div>
    </div>
  );
}