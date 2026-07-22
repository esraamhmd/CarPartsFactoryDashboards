'use client';

import { useState } from 'react';
import Link from 'next/link';
import { saveUserToStorage } from '@/lib/auth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const IconEmail  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>;
const IconLock   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IconPerson = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconEye    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEyeOff = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IconCheckSm= () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>;
const IconCheck  = () => <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>;
const IconGear   = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M21 8.4L19.5 6.9C19.8 6.3 20 5.7 20 5c0-2.2-1.8-4-4-4S12 2.8 12 5c0 2.1 1.6 3.8 3.7 4L14 11.3 11.4 9.7 10 8l-8 4.4 1 1.7 6.3-3.5 7.3 4.3-1 6-1.2.2-.4-2.8-7 1.2.4 2.8L6.1 23 7 24.8l6.8-1.7.4 2.5C14.8 26.5 15.9 27 17 27c1.9 0 3.5-1.4 3.7-3.3l.3-2c1.2-.5 2-1.7 2-3v-7c0-.9-.4-1.7-1-2.3zM16 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>;

async function sbPost(path: string, body: object, extraHeaders?: Record<string,string>) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  return { ok: res.ok, status: res.status, data };
}

export default function SignupPage() {
  const [form,       setForm]       = useState({ fullName:'', email:'', password:'', confirm:'' });
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [toast,      setToast]      = useState('');
  const [success,    setSuccess]    = useState(false);
  const [needVerify, setNeedVerify] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(''), 3500); };
  const go = () => { window.location.href = '/'; };

  const validate = () => {
    if (!form.fullName.trim())          return 'Full name is required.';
    if (!form.email.includes('@'))      return 'Enter a valid email address.';
    if (form.password.length < 6)       return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return '';
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setLoading(true);

    try {
      // Step 1: Register with Supabase Auth
      const { ok, data } = await sbPost('/auth/v1/signup', {
        email: form.email,
        password: form.password,
        data: { full_name: form.fullName },
      });

      if (!ok) {
        setError(data?.error_description || data?.msg || data?.message || 'Sign up failed');
        setLoading(false);
        return;
      }

      const userId = data?.id || data?.user?.id;
      const now = new Date().toISOString();

      // Step 2: Store profile in profiles table
      if (userId) {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates,return=minimal',
          },
          body: JSON.stringify({
            id: userId,
            email: form.email,
            full_name: form.fullName,
            last_login: now,
            updated_at: now,
          }),
        });
      }

      // Step 3: Log session
      await fetch(`${SUPABASE_URL}/rest/v1/user_sessions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          ...(userId ? { user_id: userId } : {}),
          email: form.email,
          full_name: form.fullName,
          logged_in_at: now,
        }),
      });

      // Step 4: Save to localStorage
      saveUserToStorage(form.fullName, form.email, false);

      // Check if email verification needed
      if (!data?.access_token && !data?.session) {
        setLoading(false);
        setNeedVerify(true);
        return;
      }

      setLoading(false);
      showToast('✓ Account created!');
      setSuccess(true);

    } catch (e: any) {
      setError(e.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const handleGuest = () => {
    saveUserToStorage('Guest','guest@motorsync.com',true);
    fetch(`${SUPABASE_URL}/rest/v1/user_sessions`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ email:'guest@motorsync.com', full_name:'Guest', logged_in_at: new Date().toISOString() }),
    });
    showToast('✓ Entering as guest…');
    setTimeout(go, 600);
  };

  const inp: React.CSSProperties = {
    width:'100%', padding:'11px 14px 11px 42px',
    background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)',
    borderRadius:10, fontSize:14, color:'#fff', outline:'none', fontFamily:'inherit',
  };
  const fo = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor='#c81e1e'; e.target.style.boxShadow='0 0 0 3px rgba(200,30,30,0.18)'; };
  const bl = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor='rgba(255,255,255,0.14)'; e.target.style.boxShadow='none'; };
  const bg = 'linear-gradient(135deg,#090d14,#141929,#0d1120)';

  if (needVerify) return (
    <div style={{ minHeight:'100vh', background:bg, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ textAlign:'center', maxWidth:380 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(0,85,218,0.15)', border:'2px solid #0055DA', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0055DA" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
        </div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:10 }}>Check Your Email</h2>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', marginBottom:30, lineHeight:1.7 }}>
          We sent a verification link to<br/><strong style={{ color:'#fff' }}>{form.email}</strong>
        </p>
        <Link href="/login" style={{ display:'inline-block', padding:'12px 36px', background:'linear-gradient(135deg,#c81e1e,#e63535)', color:'#fff', borderRadius:10, fontSize:14, fontWeight:700, textDecoration:'none' }}>
          Go to Sign In
        </Link>
      </div>
    </div>
  );

  if (success) return (
    <div style={{ minHeight:'100vh', background:bg, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      {toast && <div style={{ position:'fixed', top:24, left:'50%', transform:'translateX(-50%)', background:'#059669', color:'#fff', padding:'12px 22px', borderRadius:12, fontSize:14, fontWeight:600, zIndex:9999, display:'flex', alignItems:'center', gap:8 }}><IconCheckSm/>{toast}</div>}
      <div style={{ textAlign:'center', maxWidth:380 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(5,150,105,0.15)', border:'2px solid #059669', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}><IconCheck /></div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:10 }}>Account Created!</h2>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', marginBottom:30 }}>Welcome, <strong style={{ color:'#fff' }}>{form.fullName}</strong>!</p>
        <button onClick={go} style={{ padding:'13px 44px', background:'linear-gradient(135deg,#c81e1e,#e63535)', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:bg, display:'flex', alignItems:'center', justifyContent:'center', padding:16, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-100, left:-100, width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 70%)', pointerEvents:'none' }} />
      {toast && <div style={{ position:'fixed', top:24, left:'50%', transform:'translateX(-50%)', background:'#059669', color:'#fff', padding:'12px 22px', borderRadius:12, fontSize:14, fontWeight:600, zIndex:9999, display:'flex', alignItems:'center', gap:8 }}><IconCheckSm/>{toast}</div>}
      
      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:72, height:72, borderRadius:20, background:'linear-gradient(135deg,#c81e1e,#e63535)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 8px 32px rgba(200,30,30,0.45)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M21 8.4L19.5 6.9C19.8 6.3 20 5.7 20 5c0-2.2-1.8-4-4-4S12 2.8 12 5c0 2.1 1.6 3.8 3.7 4L14 11.3 11.4 9.7 10 8l-8 4.4 1 1.7 6.3-3.5 7.3 4.3-1 6-1.2.2-.4-2.8-7 1.2.4 2.8L6.1 23 7 24.8l6.8-1.7.4 2.5C14.8 26.5 15.9 27 17 27c1.9 0 3.5-1.4 3.7-3.3l.3-2c1.2-.5 2-1.7 2-3v-7c0-.9-.4-1.7-1-2.3zM16 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>
          </div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#fff', marginBottom:4 }}>MotorSync</h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.42)' }}>Car Parts Factory ERP Dashboard</p>
        </div>
        


        <div style={{ marginBottom:12 }}>
          <button onClick={handleGuest}
            style={{ width:'100%', padding:'13px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:10, color:'rgba(255,255,255,0.55)', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.09)';e.currentTarget.style.color='#fff';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='rgba(255,255,255,0.55)';}}>
            Try without signing in
          </button>
        </div>  

        <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:18, padding:'28px 28px 22px', backdropFilter:'blur(24px)' }}>
          <h2 style={{ fontSize:19, fontWeight:700, color:'#fff', marginBottom:5 }}>Create Account</h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.42)', marginBottom:22 }}>Fill in your details to get started</p>
          {error && <div style={{ background:'rgba(220,38,38,0.13)', border:'1px solid rgba(220,38,38,0.35)', borderRadius:9, padding:'10px 14px', marginBottom:18, fontSize:13, color:'#f87171' }}>{error}</div>}
        
          <form onSubmit={handleSignup} noValidate>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.65)', marginBottom:7 }}>Full Name</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex' }}><IconPerson /></span>
                <input type="text" value={form.fullName} onChange={e=>setForm(p=>({...p, fullName:e.target.value}))} placeholder="Ahmed Hassan" style={inp} onFocus={fo} onBlur={bl} autoComplete="name" required />
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.65)', marginBottom:7 }}>Email Address</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex' }}><IconEmail /></span>
                <input type="email" value={form.email} onChange={e=>setForm(p=>({...p, email:e.target.value}))} placeholder="ahmed@company.com" style={inp} onFocus={fo} onBlur={bl} autoComplete="email" required />
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.65)', marginBottom:7 }}>Password</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex' }}><IconLock /></span>
                <input type={showPass?'text':'password'} value={form.password} onChange={e=>setForm(p=>({...p, password:e.target.value}))} placeholder="Min. 6 characters" style={{ ...inp, paddingRight:42 }} onFocus={fo} onBlur={bl} autoComplete="new-password" required />
                <button type="button" onClick={()=>setShowPass(!showPass)} aria-label={showPass?'Hide':'Show'}
                  style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', display:'flex', padding:10, minWidth:44, minHeight:44, alignItems:'center', justifyContent:'center' }}>
                  {showPass?<IconEyeOff/>:<IconEye/>}
                </button>
              </div>
            </div>
            <div style={{ marginBottom:22 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.65)', marginBottom:7 }}>Confirm Password</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex' }}><IconLock /></span>
                <input type="password" value={form.confirm} onChange={e=>setForm(p=>({...p, confirm:e.target.value}))} placeholder="Repeat your password" style={inp} onFocus={fo} onBlur={bl} autoComplete="new-password" required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'13px', background:loading?'rgba(200,30,30,0.5)':'linear-gradient(135deg,#c81e1e,#e63535)', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', boxShadow:'0 4px 20px rgba(200,30,30,0.35)', fontFamily:'inherit' }}>
              {loading?'Creating account…':'Create Account'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:16, fontSize:13 }}>
            <span style={{ color:'rgba(255,255,255,0.4)' }}>Already have an account? </span>
            <Link href="/login" style={{ color:'#c81e1e', fontWeight:600, textDecoration:'none' }}>Sign In</Link>
          </div>
        </div>

     
      </div>
    </div>
  );
}