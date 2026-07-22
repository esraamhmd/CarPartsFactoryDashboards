'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdMenu, MdSearch, MdNotifications, MdDarkMode, MdLightMode, MdLanguage,
  MdError, MdWarning, MdCheckCircle, MdInfo, MdPerson, MdSettings, MdLogout,
  MdClose, MdDirectionsCar, MdPeople, MdInventory, MdShoppingCart,
  MdPrecisionManufacturing, MdAccountBalance, MdBuild, MdAnalytics
} from 'react-icons/md';
import { useTheme } from '@/lib/theme';
import { useI18n } from '@/i18n';

import notificationsRaw from '@/data/notifications.json';

const ROUTES = [
  { path:'/',             keywords:['dashboard','لوحة'],      label:'Dashboard',   labelAr:'لوحة التحكم',  icon:MdAnalytics },
  { path:'/employees',   keywords:['employee','موظف'],        label:'Employees',   labelAr:'الموظفون',      icon:MdPeople },
  { path:'/machines',    keywords:['machine','آلة'],          label:'Machines',    labelAr:'الآلات',        icon:MdPrecisionManufacturing },
  { path:'/inventory',   keywords:['inventory','مخزون'],      label:'Inventory',   labelAr:'المخزون',       icon:MdInventory },
  { path:'/orders',      keywords:['order','طلب'],            label:'Orders',      labelAr:'الطلبات',       icon:MdShoppingCart },
  { path:'/suppliers',   keywords:['supplier','مورد'],        label:'Suppliers',   labelAr:'الموردون',      icon:MdShoppingCart },
  { path:'/customers',   keywords:['customer','عميل'],        label:'Customers',   labelAr:'العملاء',       icon:MdPeople },
  { path:'/maintenance', keywords:['maintenance','صيانة'],    label:'Maintenance', labelAr:'الصيانة',       icon:MdBuild },
  { path:'/finance',     keywords:['finance','مالية'],        label:'Finance',     labelAr:'المالية',       icon:MdAccountBalance },
  { path:'/cars',        keywords:['car','سيارة','vehicle'],  label:'Vehicles',    labelAr:'المركبات',      icon:MdDirectionsCar },
  { path:'/settings',    keywords:['setting','إعداد'],        label:'Settings',    labelAr:'الإعدادات',     icon:MdSettings },
];

const TICON: Record<string,React.ElementType> = { error:MdError,warning:MdWarning,success:MdCheckCircle,info:MdInfo };
const TCOLOR: Record<string,string> = { error:'#dc2626',warning:'#d97706',success:'#059669',info:'#2563eb' };


const arTitles: Record<string,string> = {
  'Low Stock Alert':'تنبيه مخزون منخفض',
  'Machine Fault':'عطل في الآلة',
  'New Order Received':'تم استلام طلب جديد',
  'Order Shipped':'تم شحن الطلب',
  'Maintenance Due':'موعد الصيانة',
  'Attendance Alert':'تنبيه الحضور',
  'Quality Check Passed':'اجتاز فحص الجودة',
  'Production Target':'هدف الإنتاج',
  'New Customer':'عميل جديد',
  'System Update':'تحديث النظام',
};

const arMessages: Record<string,string> = {
  'Brake Discs stock is critically low (18 units)':'مخزون أقراص الفرامل منخفض جداً (١٨ وحدة)',
  'Line A exceeded daily target by 15%':'تجاوز الخط A الهدف اليومي بنسبة ١٥٪',
};

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, isRTL } = useI18n();
  // Read user directly from localStorage — always shows correct user
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const readUser = () => {
      try {
        const s = localStorage.getItem('ms_user');
        setUser(s ? JSON.parse(s) : null);
      } catch { setUser(null); }
    };
    readUser();
    window.addEventListener('focus', readUser);
    return () => window.removeEventListener('focus', readUser);
  }, []);

  const logout = () => {
    try { localStorage.removeItem('ms_user'); } catch {}
    setUser(null);
    window.location.href = '/login';
  };
  const router = useRouter();

  const [showNotifs,  setShowNotifs]  = useState(false);
  const [showUser,    setShowUser]    = useState(false);
  const [notifs,      setNotifs]      = useState(notificationsRaw);
  const [search,      setSearch]      = useState('');
  const [showSearch,  setShowSearch]  = useState(false);

  const nRef = useRef<HTMLDivElement>(null);
  const uRef = useRef<HTMLDivElement>(null);
  const sRef = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n=>!n.read).length;

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (nRef.current && !nRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (uRef.current && !uRef.current.contains(e.target as Node)) setShowUser(false);
      if (sRef.current && !sRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return ROUTES.filter(r => r.keywords.some(k=>k.includes(q))).slice(0,6);
  },[search]);

  const goTo = (path: string) => { router.push(path); setSearch(''); setShowSearch(false); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key==='Enter' && search.trim()) {
      const q = search.toLowerCase();
      const m = ROUTES.find(r=>r.keywords.some(k=>k.includes(q)));
      if (m) router.push(m.path);
      setShowSearch(false);
    }
  };

  // ── Avatar ──────────────────────────────────
  const isGuest    = !user || user.isGuest;
  const avatarText = user?.initials || 'G';
  const avatarBg   = isGuest
    ? 'linear-gradient(135deg,#475569,#64748b)'
    : 'linear-gradient(135deg,#FF3483,#FF0052)';
  const userName   = user?.name  || 'Guest';
  const userEmail  = user?.email || 'guest@motorsync.com';

  const btnStyle: React.CSSProperties = {
    background:'transparent', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8,
    padding:'6px 9px', cursor:'pointer', color:'var(--text-secondary)',
    display:'flex', alignItems:'center', gap:5, fontSize:12.5, fontWeight:600, whiteSpace:'nowrap',
  };

  return (
    <div className="topbar">
      {/* Hamburger */}
      <button onClick={onMenuClick} className="menu-btn" style={{ ...btnStyle, display:'none', flexShrink:0 }}>
        <MdMenu size={20} aria-hidden="true"/>
      </button>

      {/* Search */}
      <div ref={sRef} style={{ flex:1, maxWidth:480, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg-input)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:10, padding:'8px 13px' }}
          onFocusCapture={e=>{e.currentTarget.style.borderColor='#c81e1e';e.currentTarget.style.boxShadow='0 0 0 3px rgba(200,30,30,0.08)';}}
          onBlurCapture={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none';}}>
          <MdSearch size={16} style={{ color:'var(--text-muted)', flexShrink:0 }}/>
          <input value={search}
            onChange={e=>{setSearch(e.target.value);setShowSearch(true);}}
            onKeyDown={onKey} onFocus={()=>setShowSearch(true)}
            placeholder={lang==='ar'?'بحث في كل شيء...':'Search anything...'}
            style={{ background:'none', border:'none', outline:'none', color:'var(--text-primary)', fontSize:13.5, width:'100%', direction:isRTL?'rtl':'ltr' }}/>
          {search && <button onClick={()=>{setSearch('');setShowSearch(false);}} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:0 }}><MdClose size={14}/></button>}
        </div>

        {showSearch && suggestions.length > 0 && (
          <div style={{ position:'absolute', top:46, insetInlineStart:0, background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:12, width:'100%', boxShadow:'0 12px 40px rgba(0,0,0,0.18)', zIndex:500, overflow:'hidden' }}>
            {suggestions.map(r=>{
              const Icon=r.icon;
              return (
                <div key={r.path} onClick={()=>goTo(r.path)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px', cursor:'pointer' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--primary-bg)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                  <Icon size={15} style={{ color:'#c81e1e', flexShrink:0 }}/>
                  <span style={{ fontSize:13, fontWeight:600 }}>{lang==='ar'?r.labelAr:r.label}</span>
                  <span style={{ fontSize:11, color:'var(--text-muted)', marginInlineStart:'auto' }}>{r.path}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right */}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginInlineStart:'auto' }}>
        <button onClick={()=>setLang(lang==='en'?'ar':'en')} style={btnStyle}>
          <MdLanguage size={15}/><span style={{ fontFamily: isRTL ? "Tahoma,Arial,sans-serif" : "inherit" }}>{lang==='en'?'عربي':'EN'}</span>
        </button>
        <button onClick={toggleTheme} style={btnStyle}>
          {theme==='light'?<MdDarkMode size={17}/>:<MdLightMode size={17}/>}
        </button>

        {/* Notifications */}
        <div ref={nRef} style={{ position:'relative' }}>
          <button onClick={()=>{setShowNotifs(p=>!p);setShowUser(false);}} style={{ ...btnStyle, position:'relative' }}>
            <MdNotifications size={19}/>
            {unread>0 && <span style={{ position:'absolute', top:4, insetInlineEnd:4, width:8, height:8, borderRadius:'50%', background:'#dc2626', border:'2px solid var(--bg-card)' }}/>}
          </button>
          {showNotifs && (
            <div style={{ position:'absolute', top:46, insetInlineEnd:0, background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:14, width:340, maxHeight:420, boxShadow:'0 20px 60px rgba(0,0,0,0.20)', zIndex:400, overflow:'hidden', display:'flex', flexDirection:'column' }}>
              <div style={{ padding:'11px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
                <span style={{ fontWeight:700, fontSize:14 }}>{lang==='ar'?'الإشعارات':'Notifications'} {unread>0 && <span style={{ background:'#dc2626', color:'#fff', borderRadius:99, padding:'0 7px', fontSize:11, marginInlineStart:6 }}>{unread}</span>}</span>
                {unread>0 && <button onClick={()=>setNotifs(notifs.map(n=>({...n,read:true})))} style={{ background:'none', border:'none', fontSize:11, color:'#2563eb', cursor:'pointer', fontWeight:600 }}>{lang==='ar'?'تعيين الكل كمقروء':'Mark all read'}</button>}
              </div>
              <div style={{ overflowY:'auto', flex:1 }}>
                {notifs.map(n=>{
                  const Icon=TICON[n.type]||MdInfo;
                  const color=TCOLOR[n.type]||'#2563eb';
                  return (
                    <div key={n.id} onClick={()=>setNotifs(notifs.map(x=>x.id===n.id?{...x,read:true}:x))}
                      style={{ padding:'10px 14px', borderBottom:'1px solid var(--divider)', background:n.read?'transparent':'var(--primary-bg)', cursor:'pointer' }}>
                      <div style={{ display:'flex', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Icon size={15} style={{ color }}/>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:600, fontSize:12.5, display:'flex', alignItems:'center', gap:6 }}>
                            {lang==='ar' ? (arTitles[n.title] || n.title) : n.title}
                            {!n.read && <span style={{ width:6, height:6, borderRadius:'50%', background:'#dc2626', display:'inline-block', flexShrink:0 }}/>}
                          </div>
                          <div style={{ fontSize:11.5, color:'var(--text-secondary)', marginTop:2, lineHeight:1.4 }}>{lang==='ar' ? (n as any).messageAr || n.message : n.message}</div>
                          <div style={{ fontSize:10.5, color:'var(--text-muted)', marginTop:3 }}>{lang==='ar' ? (n as any).timeAr || n.time : n.time}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User avatar — shows REAL initials */}
        <div ref={uRef} style={{ position:'relative' }}>
          <button onClick={()=>{setShowUser(p=>!p);setShowNotifs(false);}}
            style={{ width:34, height:34, borderRadius:9, background:avatarBg, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:13, cursor:'pointer', border:'none', flexShrink:0 }}
            title={userName}>
            {avatarText}
          </button>

          {showUser && (
            <div style={{ position:'absolute', top:44, insetInlineEnd:0, background:'var(--bg-card)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:14, width:240, boxShadow:'0 20px 60px rgba(0,0,0,0.18)', zIndex:400, overflow:'hidden' }}>
              {/* User info */}
              <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', background:isGuest?'linear-gradient(135deg,rgba(71,85,105,0.15),rgba(100,116,139,0.10))':'linear-gradient(135deg,rgba(200,30,30,0.08),rgba(37,99,235,0.06))' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:avatarBg, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:16, flexShrink:0 }}>
                    {avatarText}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{userName}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{userEmail}</div>
                    <div style={{ fontSize:10.5, marginTop:3, color:isGuest?'#d97706':'#059669', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:isGuest?'#d97706':'#059669', display:'inline-block' }}/>
                      {isGuest?'Guest Mode':'Online'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding:'6px' }}>
                <button onClick={()=>{router.push('/settings');setShowUser(false);}}
                  style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'8px 10px', borderRadius:8, border:'none', background:'none', cursor:'pointer', color:'var(--text-secondary)', fontSize:13, fontFamily:'inherit' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-page)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                  <MdSettings size={14}/>{lang==='ar'?'الإعدادات':'Settings'}
                </button>

                {isGuest ? (
                  <button onClick={()=>{router.push('/login');setShowUser(false);}}
                    style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'8px 10px', borderRadius:8, border:'none', background:'none', cursor:'pointer', color:'#c81e1e', fontSize:13, fontWeight:600, fontFamily:'inherit' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='var(--primary-bg)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                    <MdPerson size={14}/>{lang==='ar'?'تسجيل الدخول':'Sign In for full access'}
                  </button>
                ) : (
                  <button onClick={()=>{logout();setShowUser(false);router.replace('/login');}}
                    style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'8px 10px', borderRadius:8, border:'none', background:'none', cursor:'pointer', color:'#dc2626', fontSize:13, fontFamily:'inherit' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='var(--primary-bg)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                    <MdLogout size={14}/>{lang==='ar'?'تسجيل الخروج':'Sign Out'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}