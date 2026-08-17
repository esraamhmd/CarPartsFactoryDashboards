'use client';

import { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const V = {
  primary:   { background: 'linear-gradient(135deg,#c81e1e,#e63535)', color: '#fff', border:'none', boxShadow: '0 2px 8px rgba(200,30,30,0.35)' },
  secondary: { background: 'var(--bg-page)', color: 'var(--text-primary)', borderWidth:'1px', borderStyle:'solid', borderColor:'var(--border)', boxShadow: 'none' },
  danger:    { background: 'var(--primary-bg)', color: '#c81e1e', border: '1px solid var(--primary-border)', boxShadow: 'none' },
  ghost:     { background: 'transparent', color: 'var(--text-secondary)', border:'none', boxShadow: 'none' },
};
const S = {
  sm: { padding: '5px 13px', fontSize: '12px', borderRadius: '7px' },
  md: { padding: '8px 16px', fontSize: '13.5px', borderRadius: '9px' },
  lg: { padding: '11px 22px', fontSize: '14.5px', borderRadius: '10px' },
};

export default function Button({ variant = 'secondary', size = 'md', children, style: ps, disabled, ...props }: Props) {
  return (
    <button
      disabled={disabled}
      style={{ ...V[variant], ...S[size], fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 150ms', opacity: disabled ? 0.55 : 1, fontFamily: 'inherit', ...ps }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.filter = 'brightness(0.9)')}
      onMouseLeave={e => !disabled && (e.currentTarget.style.filter = 'none')}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.97)')}
      onMouseUp={e => !disabled && (e.currentTarget.style.transform = 'scale(1)')}
      {...props}
    >
      {children}
    </button>
  );
}