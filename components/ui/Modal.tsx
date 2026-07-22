'use client';

import { ReactNode, useEffect } from 'react';
import { MdClose } from 'react-icons/md';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const WIDTHS = { sm: 'min(94vw,420px)', md: 'min(94vw,580px)', lg: 'min(94vw,760px)' };

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Scroll modal overlay to top
    const overlay = document.querySelector('[role="dialog"]')?.parentElement;
    if (overlay) overlay.scrollTop = 0;
    // Escape key
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.60)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',      /* from top */
        justifyContent: 'center',      /* centered horizontally */
        paddingTop: 'max(40px, 6vh)',  /* appropriate from top */
        paddingBottom: 24,
        paddingLeft: 16,
        paddingRight: 16,
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          borderRadius: 18,
          border: '1px solid var(--border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 8px 32px rgba(0,0,0,0.18)',
          width: WIDTHS[size],
          maxHeight: 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideIn 0.24s cubic-bezier(0.22,1,0.36,1)',
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          background: 'var(--bg-card)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}>
          <h2 id="modal-title" style={{
            fontWeight: 700, fontSize: 17, margin: 0,
            color: 'var(--text-primary)',
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex',
              padding: 8, borderRadius: 10, transition: 'all 150ms',
              minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--primary-bg)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <MdClose size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}