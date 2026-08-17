'use client';

import React, { useId } from 'react';

interface FormFieldProps { label: string; required?: boolean; children: React.ReactNode; error?: string; hint?: string; }

export function FormField({ label, required, children, error, hint }: FormFieldProps) {
  const id = useId();
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        htmlFor={id}
        style={{ display:'block', fontSize:12.5, fontWeight:600, color:'var(--text-secondary)', marginBottom:6, letterSpacing:'0.02em' }}
      >
        {label}{required && <span style={{ color:'var(--primary)', marginInlineStart:3 }}>*</span>}
      </label>
      {React.Children.map(children, child =>
        React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { id }) : child
      )}
      {error && <div style={{ fontSize:11.5, color:'var(--danger)', marginTop:4, display:'flex', alignItems:'center', gap:4 }}>⚠ {error}</div>}
      {hint && !error && <div style={{ fontSize:11.5, color:'var(--text-muted)', marginTop:4 }}>{hint}</div>}
    </div>
  );
}

const base: React.CSSProperties = {
  width:'100%', padding:'9px 12px',
  background:'var(--bg-input)',
  borderWidth:'1px', borderStyle:'solid', borderColor:'var(--border)',
  borderRadius:8, fontSize:13.5, color:'var(--text-primary)',
  outline:'none', transition:'border-color 150ms, box-shadow 150ms',
  fontFamily:'inherit', boxSizing:'border-box',
};

const onFocus = (e: React.FocusEvent<any>, err?: boolean) => {
  e.target.style.borderColor = err ? '#dc2626' : 'var(--primary)';
  e.target.style.boxShadow  = err ? '0 0 0 3px rgba(220,38,38,0.12)' : '0 0 0 3px rgba(200,30,30,0.1)';
};
const onBlur = (e: React.FocusEvent<any>, err?: boolean) => {
  e.target.style.borderColor = err ? '#dc2626' : 'var(--border)';
  e.target.style.boxShadow  = 'none';
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { error?: boolean; }
export function Input({ error, style: ps, ...props }: InputProps) {
  return (
    <input
      {...props}
      style={{ ...base, ...(error ? { borderColor:'#dc2626' } : {}), ...ps }}
      onFocus={e => { onFocus(e, error); props.onFocus?.(e); }}
      onBlur={e  => { onBlur(e,  error); props.onBlur?.(e);  }}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { error?: boolean; }
export function Select({ error, style: ps, ...props }: SelectProps) {
  return (
    <select
      {...props}
      style={{ ...base, cursor:'pointer', ...(error ? { borderColor:'#dc2626' } : {}), ...ps }}
      onFocus={e => { onFocus(e, error); props.onFocus?.(e); }}
      onBlur={e  => { onBlur(e,  error); props.onBlur?.(e);  }}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { error?: boolean; }
export function Textarea({ error, style: ps, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      style={{ ...base, minHeight:80, resize:'vertical', ...(error ? { borderColor:'#dc2626' } : {}), ...ps }}
      onFocus={e => { onFocus(e, error); props.onFocus?.(e); }}
      onBlur={e  => { onBlur(e,  error); props.onBlur?.(e);  }}
    />
  );
}

export function FormRow({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:14, marginBottom:0 }}>
      {children}
    </div>
  );
}

export function FormActions({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:22, paddingTop:18, borderTop:'1px solid var(--border)' }}>
      {children}
    </div>
  );
}