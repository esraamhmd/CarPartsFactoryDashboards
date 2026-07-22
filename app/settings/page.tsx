'use client';

import { useState } from 'react';
import { MdBusiness, MdNotifications, MdSecurity, MdPalette, MdLanguage, MdSave, MdDarkMode, MdLightMode, MdVisibility, MdVisibilityOff, MdCheckCircle } from 'react-icons/md';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { useTheme } from '@/lib/theme';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { lang, tNum, setLang, t } = useI18n();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [showPass, setShowPass] = useState(false);
  const [passwords, setPasswords] = useState({ current:'', newPass:'', confirm:'' });
  const [passError, setPassError] = useState('');
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
    { id:'general', labelKey:'settings.general', icon:MdBusiness },
    { id:'appearance', labelKey:'settings.appearance', icon:MdPalette },
    { id:'notifications', labelKey:'settings.notificationPrefs', icon:MdNotifications },
    { id:'security', labelKey:'settings.security', icon:MdSecurity },
    { id:'language', labelKey:'settings.language', icon:MdLanguage },
  ];

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    toast(t('toast.saved'), 'success');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (!passwords.current) { setPassError('Current password is required.'); return; }
    if (passwords.newPass.length < 6) { setPassError('New password must be at least 6 characters.'); return; }
    if (passwords.newPass !== passwords.confirm) { setPassError('Passwords do not match.'); return; }
    // Simulate password update
    toast('Password updated successfully!', 'success');
    setPasswords({ current:'', newPass:'', confirm:'' });
  };

  const toggleNotif = (key: keyof typeof notifToggles) => {
    setNotifToggles(p => ({ ...p, [key]: !p[key] }));
    toast(`${key} alerts ${!notifToggles[key] ? 'enabled' : 'disabled'}`, 'info');
  };

  const inputStyle = { width:'100%', padding:'10px 14px', background:'var(--bg-primary)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:8, fontSize:14, color:'var(--text-primary)', outline:'none', fontFamily:'inherit' };

  return (
    <div className="animate-in">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="settings-layout" style={{ display:'grid', gridTemplateColumns:'210px 1fr', gap:20, alignItems:'start' }}>
        <div className="card" style={{ padding:8, height:'fit-content' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          {tabs.map(tab=>{
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:8, border:'none', cursor:'pointer', textAlign:'start', fontSize:14, fontWeight:activeTab===tab.id?600:400, background:activeTab===tab.id?'rgba(204,0,0,0.08)':'transparent', color:activeTab===tab.id?'#CC0000':'var(--text-secondary)', transition:'all 0.15s', whiteSpace:'nowrap' }}>
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
              <form onSubmit={handleSaveGeneral}>
                {[
                  { key:'factoryName', label:t('settings.factoryName') },
                  { key:'factoryId', label:t('settings.factoryId') },
                  { key:'location', label:t('settings.location') },
                  { key:'managerEmail', label:t('settings.managerEmail') },
                  { key:'contactPhone', label:t('settings.contactPhone') },
                ].map(field=>(
                  <div key={field.key} style={{ marginBottom:18 }}>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:6 }}>{field.label}</label>
                    <input value={(generalForm as any)[field.key]} onChange={e=>setGeneralForm({...generalForm,[field.key]:e.target.value})} style={inputStyle} />
                  </div>
                ))}
                <Button variant="primary" type="submit"><MdSave size={16}/>{t('common.saveChanges')}</Button>
              </form>
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
                    { id:'dark', label:t('settings.darkMode'), Icon:MdDarkMode },
                  ].map(th=>(
                    <div key={th.id} onClick={()=>{ if(theme!==th.id) toggleTheme(); }}
                      style={{ padding:'18px 24px', borderRadius:12, cursor:'pointer', border:`2px solid ${theme===th.id?'#CC0000':'var(--border)'}`, background:th.id==='dark'?'#0A0C12':'#F8F9FC', color:th.id==='dark'?'#fff':'#0F1117', fontWeight:600, fontSize:14, transition:'all 0.2s', display:'flex', alignItems:'center', gap:10, flex:1, minWidth:140 }}>
                      <th.Icon size={20} style={{ color:theme===th.id?'#CC0000':'inherit' }} />
                      {th.label}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:12 }}>{t('settings.brandColors')}</div>
                <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, flexWrap:'wrap' }}>
                  {[
                    { label:'Primary Red', color:'#CC0000' },
                    { label:'Accent Yellow', color:'#FFD400' },
                    { label:'Accent Green', color:'#00C68D' },
                    { label:'Accent Blue', color:'#0055DA' },
                  ].map(c=>(
                    <div key={c.label} style={{ textAlign:'center' }}>
                      <div style={{ width:'100%', height:40, borderRadius:8, background:c.color, marginBottom:6, cursor:'pointer', boxShadow:`0 4px 12px ${c.color}40` }} />
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{c.label}</div>
                      <div style={{ fontSize:11, fontWeight:600, fontFamily:'monospace' }}>{c.color}</div>
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
                <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid var(--border)', gap:12, flexWrap:'nowrap' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>{t('settings.notifItems.'+key)}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{t('settings.notifItems.'+key+'Desc')}</div>
                  </div>
                  <div onClick={()=>toggleNotif(key)}
                    style={{ width:46, height:26, borderRadius:13, cursor:'pointer', background:notifToggles[key]?'#CC0000':'var(--border)', position:'relative', transition:'background 0.25s', flexShrink:0 }}>
                    <div style={{ position:'absolute', top:3, left:notifToggles[key]?23:3, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.25s', boxShadow:'0 2px 4px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECURITY */}
          {activeTab==='security' && (
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>{t('settings.security')}</h2>
              {passError && <div style={{ background:'rgba(204,0,0,0.08)', border:'1px solid rgba(204,0,0,0.2)', borderRadius:8, padding:'10px 14px', marginBottom:18, fontSize:13, color:'#CC0000' }}>{passError}</div>}
              <form onSubmit={handleUpdatePassword}>
                {[
                  { key:'current', label:t('settings.currentPassword') },
                  { key:'newPass', label:t('settings.newPassword') },
                  { key:'confirm', label:t('settings.confirmPassword') },
                ].map(field=>(
                  <div key={field.key} style={{ marginBottom:18 }}>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:6 }}>{field.label}</label>
                    <div style={{ position:'relative' }}>
                      <input type={showPass?'text':'password'} value={(passwords as any)[field.key]} onChange={e=>setPasswords({...passwords,[field.key]:e.target.value})}
                        placeholder="••••••••" style={{ ...inputStyle, paddingRight:42 }} />
                      {field.key==='current' && (
                        <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
                          {showPass?<MdVisibilityOff size={16}/>:<MdVisibility size={16}/>}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="primary" type="submit"><MdCheckCircle size={16}/>{t('common.updatePassword')}</Button>
              </form>
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
                    style={{ flex:1, minWidth:140, padding:'20px 28px', borderRadius:12, cursor:'pointer', border:`2px solid ${lang===l.code?'#CC0000':'var(--border)'}`, background:lang===l.code?'rgba(204,0,0,0.05)':'var(--bg-primary)', fontWeight:700, fontSize:15, transition:'all 0.2s', color:lang===l.code?'#CC0000':'var(--text-secondary)', textAlign:'center' }}>
                    <div style={{ marginBottom:4 }}>{l.label}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:400 }}>{l.dir}</div>
                    {lang===l.code && <MdCheckCircle size={16} style={{ color:'#CC0000', marginTop:6 }} />}
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