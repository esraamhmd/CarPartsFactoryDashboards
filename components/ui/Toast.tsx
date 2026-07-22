'use client';

import { useState, createContext, useContext, useCallback, ReactNode } from 'react';
import { MdCheckCircle, MdError, MdInfo, MdWarning, MdClose } from 'react-icons/md';

type TT = 'success' | 'error' | 'info' | 'warning';
interface TItem { id: number; type: TT; message: string; }
const Ctx = createContext<{ toast: (m: string, t?: TT) => void }>({ toast: () => {} });

const icons = { success: MdCheckCircle, error: MdError, info: MdInfo, warning: MdWarning };
const colors = { success: '#059669', error: '#dc2626', info: '#2563eb', warning: '#d97706' };
const bgs = {
  success: 'rgba(5,150,105,0.10)',
  error:   'rgba(220,38,38,0.10)',
  info:    'rgba(37,99,235,0.10)',
  warning: 'rgba(217,119,6,0.10)',
};
const borders = {
  success: 'rgba(5,150,105,0.30)',
  error:   'rgba(220,38,38,0.30)',
  info:    'rgba(37,99,235,0.30)',
  warning: 'rgba(217,119,6,0.30)',
};

let _id = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<TItem[]>([]);

  const toast = useCallback((message: string, type: TT = 'success') => {
    const id = ++_id;
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const remove = (id: number) => setToasts(p => p.filter(t => t.id !== id));

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {/* Toast container — top center */}
      <div style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        pointerEvents: 'none',
        width: 'min(420px, 90vw)',
      }}>
        {toasts.map(t => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'var(--bg-card)',
              border: `1px solid ${borders[t.type]}`,
              borderTop: `3px solid ${colors[t.type]}`,
              borderRadius: 12,
              padding: '12px 16px',
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              pointerEvents: 'all',
              animation: 'toastIn 0.28s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: bgs[t.type], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color: colors[t.type] }} />
              </div>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{t.message}</span>
              <button onClick={() => remove(t.id)} style={{ background: 'none', border:'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2, flexShrink: 0, pointerEvents: 'all' }}>
                <MdClose size={15} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);