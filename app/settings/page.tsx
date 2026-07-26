'use client';

import { useState } from 'react';
import { MdBusiness, MdNotifications, MdPalette, MdLanguage, MdSave, MdDarkMode, MdLightMode, MdCheckCircle } from 'react-icons/md';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { useTheme } from '@/lib/theme';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';

const SURL = 'https://vopgydykkzxcfnnqoize.supabase.co';
const SKEY = 'sb_publishable_aTFOgIF4IwUsj0c2ehHiLw_slfSIWxi';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const { toast } = useToast();
  const SECRET_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
  const [activeTab, setActiveTab] = useState('general');
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [notifToggles, setNotifToggles] = useState({
    lowStock: true, machineFailure: true, attendance: false,
    maintenance: true, orderUpdates: true, qualityAlerts: false,
  });
  const [generalForm, setGeneralForm] = useState({
    factoryName: 'MotorSync Car Parts Factory',
    factoryId: 'MSF-EG-001',
    location: 'Cairo, Egypt',
    managerEmail: 'admin@motorsync.com',
    contactPhone: '+20-2-1234-5678',
  });

  const tabs = [
    { id:'general',       labelKey:'settings.general',           icon:MdBusiness },
    { id:'appearance',    labelKey:'settings.appearance',        icon:MdPalette },
    { id:'notifications', labelKey:'settings.notificationPrefs', icon:MdNotifications },
    { id:'language',      labelKey:'settings.language',          icon:MdLanguage },
  ];

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (SECRET_PW && password !== SECRET_PW) { setPwError(lang==='ar'?'كلمة مرور خاطئة':'Wrong password'); return; }
    // Save to Supabase
    try {
      await fetch(`${SURL}/rest/v1/settings?key=eq.general`, {
        method: 'DELETE',
        headers: { 'apikey': SKEY, 'Authorization': `Bearer ${SKEY}` },
      });
      await fetch(`${SURL}/rest/v1/settings`, {
        method: 'POST',
        headers: { 'apikey': SKEY, 'Authorization': `Bearer ${SKEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ key: 'general', value: JSON.stringify(generalForm) }),
      });
    } catch {}
    localStorage.setItem('motorsync_factory_name', generalForm.factoryName);
    localStorage.setItem('motorsync_settings', JSON.stringify(generalForm));
    setPassword(''); setPwError('');
    toast(t('toast.saved'), 'success');
    setTimeout(() => window.location.reload(), 800);
  };

  const toggleNotif = (key: keyof typeof notifToggles) => {
    setNotifToggles(p => ({ ...p, [key]: !p[key] }));
    toast(`${String(key)} alerts ${!notifToggles[key] ? 'enabled' : 'disabled'}`, 'info');
  };

  const inputStyle = { width:'100%', padding:'10px 14px', background:'var(--bg-input)', borderWidth:'1px', borderStyle:'solid', borderColor:'var(--border)', borderRadius:8, fontSize:14, color:'var(--text-primary)', outline:'none', fontFamily:'inherit' };

  return (
    <div className="animate-in">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="settings-layout" style={{ display:'grid', gridTemplateColumns:'210px 1fr', gap:20, alignItems:'start' }}>
        {/* Tab sidebar */}
        <div className="card" style={{ padding:8, height:'fit-content' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                  style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:8, borderWidth:0, borderStyle:'solid', borderColor:'transparent', cursor:'pointer', textAlign:'start', fontSize:14, fontWeight:activeTab===tab.id?600:400, background:activeTab===tab.id?'rgba(200,30,30,0.08)':'transparent', color:activeTab===tab.id?'var(--primary)':'var(--text-secondary)', transition:'all 0.15s', whiteSpace:'nowrap' }}>
                  <Icon size={17}/>{t(tab.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding:28 }}>
          {/* GENERAL */}
          {activeTab==='general' && (
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>{t('settings.generalSettings')}</h2>
              <div>
                {[
                  { key:'factoryName', label:t('settings.factoryName') },
                  { key:'factoryId',   label:t('settings.factoryId') },
                  { key:'location',    label:t('settings.location') },
                  { key:'managerEmail',label:t('settings.managerEmail') },
                  { key:'contactPhone',label:t('settings.contactPhone') },
                ].map(field=>(
                  <div key={field.key} style={{ marginBottom:16, padding:'12px 16px', background:'var(--bg-page)', borderRadius:8, borderWidth:'1px', borderStyle:'solid', borderColor:'var(--border)' }}>
                    <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>{field.label}</div>
                    <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{(generalForm as any)[field.key]}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab==='appearance' && (
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>{t('settings.appearance')}</h2>
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:12 }}>{t('settings.themeMode')}</div>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  {[
                    { id:'light', label:t('settings.lightMode'), Icon:MdLightMode },
                    { id:'dark',  label:t('settings.darkMode'),  Icon:MdDarkMode },
                  ].map(th=>(
                    <div key={th.id} onClick={()=>{ if(theme!==th.id) toggleTheme(); }}
                      style={{ padding:'18px 24px', borderRadius:12, cursor:'pointer', borderWidth:'2px', borderStyle:'solid', borderColor:theme===th.id?'var(--primary)':'var(--border)', background:th.id==='dark'?'#0A0C12':'#F8F9FC', color:th.id==='dark'?'#fff':'#0F1117', fontWeight:600, fontSize:14, transition:'all 0.2s', display:'flex', alignItems:'center', gap:10, flex:1, minWidth:140 }}>
                      <th.Icon size={20} style={{ color:theme===th.id?'var(--primary)':'inherit' }} />
                      {th.label}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:12 }}>{t('settings.brandColors')}</div>
                <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                  {[
                    { label:'Primary Red',    color:'#c81e1e' },
                    { label:'Accent Yellow',  color:'#FFD400' },
                    { label:'Accent Green',   color:'#00C68D' },
                    { label:'Accent Blue',    color:'#0055DA' },
                  ].map(cl=>(
                    <div key={cl.label} style={{ textAlign:'center' }}>
                      <div style={{ width:'100%', height:40, borderRadius:8, background:cl.color, marginBottom:6, boxShadow:`0 4px 12px ${cl.color}40` }} />
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{cl.label}</div>
                      <div style={{ fontSize:11, fontWeight:600, fontFamily:'monospace' }}>{cl.color}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab==='notifications' && (
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>{t('settings.notificationPrefs')}</h2>
              {(Object.keys(notifToggles) as (keyof typeof notifToggles)[]).map(key=>(
                <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid var(--border)', gap:12 }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>{t('settings.notifItems.'+key)}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{t('settings.notifItems.'+key+'Desc')}</div>
                  </div>
                  <div onClick={()=>toggleNotif(key)}
                    style={{ width:46, height:26, borderRadius:13, cursor:'pointer', background:notifToggles[key]?'var(--primary)':'var(--border)', position:'relative', transition:'background 0.25s', flexShrink:0 }}>
                    <div style={{ position:'absolute', top:3, left:notifToggles[key]?23:3, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.25s', boxShadow:'0 2px 4px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LANGUAGE */}
          {activeTab==='language' && (
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>{t('settings.language')}</h2>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:12 }}>{t('settings.interfaceLang')}</div>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                {[{ code:'en', label:'🇬🇧 English', dir:'LTR' },{ code:'ar', label:'🇪🇬 العربية', dir:'RTL' }].map(l=>(
                  <div key={l.code} onClick={()=>{ setLang(l.code as 'en'|'ar'); toast(t('toast.saved'),'success'); }}
                    style={{ flex:1, minWidth:140, padding:'20px 28px', borderRadius:12, cursor:'pointer', borderWidth:'2px', borderStyle:'solid', borderColor:lang===l.code?'var(--primary)':'var(--border)', background:lang===l.code?'var(--primary-bg)':'var(--bg-input)', fontWeight:700, fontSize:15, transition:'all 0.2s', color:lang===l.code?'var(--primary)':'var(--text-secondary)', textAlign:'center' }}>
                    <div style={{ marginBottom:4 }}>{l.label}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:400 }}>{l.dir}</div>
                    {lang===l.code && <MdCheckCircle size={16} style={{ color:'var(--primary)', marginTop:6 }} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}