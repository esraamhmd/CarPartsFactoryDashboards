'use client';

import { useState } from 'react';
import { MdError, MdWarning, MdCheckCircle, MdInfo, MdDelete, MdDoneAll } from 'react-icons/md';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';
import notificationsData from '@/data/notifications.json';

const typeIcon: Record<string, React.ElementType> = {
  error: MdError, warning: MdWarning, success: MdCheckCircle, info: MdInfo,
};
const typeColor: Record<string, string> = {
  error: '#dc2626', warning: '#d97706', success: '#059669', info: '#2563eb',
};
const arTitles: Record<string,string> = {
  'Low Stock Alert':'تنبيه مخزون منخفض','Machine Fault':'عطل في الآلة',
  'New Order Received':'تم استلام طلب جديد','Order Shipped':'تم شحن الطلب',
  'Maintenance Due':'موعد الصيانة','Attendance Alert':'تنبيه الحضور',
  'Quality Check Passed':'اجتياز فحص الجودة',
};
const arMessages: Record<string,string> = {
  'Brake Discs stock is critically low (18 units remaining)':'مخزون أقراص الفرامل منخفض جداً (18 وحدة)',
  'Hydraulic Press #2 requires immediate maintenance':'المكبس الهيدروليكي #2 يحتاج صيانة فورية',
  'Order ORD-2025-003 from Cairo Auto Group has been placed':'تم تسجيل الطلب من مجموعة القاهرة',
  'Order ORD-2025-006 has been successfully dispatched':'تم شحن الطلب بنجاح',
  'Lathe Machine #4 is due for scheduled maintenance':'ماكينة الخراطة #4 موعد صيانتها',
  '5 employees recorded late today':'سُجّل تأخر 5 موظفين اليوم',
  'Hydraulic Oil 15W-40 is completely out of stock':'زيت الهيدروليك نفد من المخزون',
  'Engine Block Batch #12 passed quality inspection with 96% score':'دفعة كتلة المحرك اجتازت فحص الجودة بنجاح',
  'Timing Belt Gates stock is critically low (8 units remaining)':'مخزون حزام التوقيت منخفض جداً (8 وحدات)',
  'Canal Zone Motors has been added as a new customer':'تمت إضافة موتورز قناة السويس كعميل جديد',
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const { lang, tNum } = useI18n();
  const { toast } = useToast();
  const [notifs, setNotifs] = useState(notificationsData);
  const [filter, setFilter] = useState<'all'|'unread'>('all');

  const displayed = filter==='unread' ? notifs.filter(n=>!n.read) : notifs;
  const unread = notifs.filter(n=>!n.read).length;

  const markAll = () => {
    setNotifs(notifs.map(n=>({...n,read:true})));
    toast(lang==='ar'?'تم تعيين الكل كمقروء':'All marked as read','success');
  };
  const markOne = (id: number) => setNotifs(notifs.map(n=>n.id===id?{...n,read:true}:n));
  const deleteOne = (id: number) => {
    setNotifs(notifs.filter(n=>n.id!==id));
    toast(lang==='ar'?'تم حذف الإشعار':'Notification deleted','success');
  };

  return (
    <div className="animate-in">
      <PageHeader
        title={lang==='ar'?'الإشعارات':'Notifications'}
        subtitle={lang==='ar'?`${unread} إشعار غير مقروء`:`${unread} unread`}
        action={
          <div style={{ display:'flex', gap:8 }}>
            <Button variant="secondary" onClick={()=>setFilter(filter==='all'?'unread':'all')}>
              {filter==='all'?(lang==='ar'?'غير المقروءة':'Unread only'):(lang==='ar'?'الكل':'Show all')}
            </Button>
            {unread>0 && <Button variant="primary" onClick={markAll}><MdDoneAll size={15}/>{lang==='ar'?'تعيين الكل كمقروء':'Mark all read'}</Button>}
          </div>
        }
      />

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {displayed.length===0 && (
          <div className="card" style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>
            {lang==='ar'?'لا توجد إشعارات':'No notifications'}
          </div>
        )}
        {displayed.map(n=>{
          const Icon = typeIcon[n.type] || MdInfo;
          const color = typeColor[n.type] || '#2563eb';
          const title = lang==='ar'?((n as any).titleAr||arTitles[n.title]||n.title):n.title;
          const msg   = lang==='ar'?((n as any).messageAr||arMessages[n.message]||n.message):n.message;
          return (
            <div key={n.id} className="card" style={{ padding:'14px 18px', background:n.read?'var(--bg-card)':color+'08', borderInlineStart:`3px solid ${n.read?'var(--border)':color}`, borderRadius:12 }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                <div style={{ width:38, height:38, borderRadius:10, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:14, marginBottom:3, display:'flex', alignItems:'center', gap:8 }}>
                        {title}
                        {!n.read && <span style={{ width:7, height:7, borderRadius:'50%', background:color, display:'inline-block', flexShrink:0 }} />}
                      </div>
                      <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>{msg}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:5 }}>{lang==='ar' ? (n as any).timeAr || n.time : n.time}</div>
                    </div>
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      {!n.read && (
                        <button onClick={()=>markOne(n.id)} title="Mark read"
                          style={{ background:'var(--bg-page)', borderWidth:'1px',borderStyle:'solid',borderColor:'var(--border)', borderRadius:7, padding:'5px 8px', cursor:'pointer', color:'var(--text-muted)', fontSize:11, display:'flex', alignItems:'center', gap:4 }}>
                          <MdDoneAll size={13}/>
                        </button>
                      )}
                      <button onClick={()=>deleteOne(n.id)} title="Delete"
                        style={{ background:'var(--primary-bg)', border:'none', borderRadius:7, padding:'5px 7px', cursor:'pointer', color:'var(--primary)', display:'flex', alignItems:'center' }} aria-label="Delete"><MdDelete aria-hidden="true" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}