'use client';
import { useI18n } from '@/i18n';

interface Props {
  page: number;
  total: number;
  perPage: number;
  onChange: (p: number) => void;
}

export default function Pagination({ page, total, perPage, onChange }: Props) {
  const { lang } = useI18n();
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(n => Math.abs(n - page) <= 2 || n === 1 || n === totalPages);

  let prev: number | null = null;
  const withEllipsis: (number | '...')[] = [];
  for (const n of pages) {
    if (prev !== null && n - prev > 1) withEllipsis.push('...');
    withEllipsis.push(n);
    prev = n;
  }

  const btn: React.CSSProperties = {
    padding: '6px 11px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    borderWidth:'1px', borderStyle:'solid', borderColor:'var(--border)', background: 'var(--bg-card)',
    color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 150ms',
    fontFamily: 'inherit',
  };
  const active: React.CSSProperties = {
    ...btn, background: '#c81e1e', color: '#fff', borderWidth:'1px',borderStyle:'solid',borderColor: '#c81e1e',
    fontWeight: 700, boxShadow: '0 4px 12px rgba(200,30,30,0.35)',
  };
  const disabled: React.CSSProperties = { ...btn, opacity: 0.35, cursor: 'not-allowed' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5, padding: '16px 0', flexWrap: 'wrap' }}>
      <button style={page === 1 ? disabled : btn} disabled={page === 1}
        onClick={() => onChange(page - 1)}>
        {lang === 'ar' ? '→' : '←'}
      </button>

      {withEllipsis.map((n, i) =>
        n === '...'
          ? <span key={`e${i}`} style={{ padding: '6px 4px', color: 'var(--text-muted)', fontSize: 13 }}>…</span>
          : <button key={n} style={n === page ? active : btn} onClick={() => onChange(n as number)}>{n}</button>
      )}

      <button style={page === totalPages ? disabled : btn} disabled={page === totalPages}
        onClick={() => onChange(page + 1)}>
        {lang === 'ar' ? '←' : '→'}
      </button>

      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginInlineStart: 6 }}>
        {lang === 'ar' ? `${page} من ${totalPages}` : `${page} of ${totalPages}`}
      </span>
    </div>
  );
}