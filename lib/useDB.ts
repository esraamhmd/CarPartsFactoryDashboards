'use client';

const SURL = 'https://vopgydykkzxcfnnqoize.supabase.co';
const SKEY = 'sb_publishable_aTFOgIF4IwUsj0c2ehHiLw_slfSIWxi';

export async function saveToSupabase(
  table: string,
  data: Record<string,any>,
  method: 'POST'|'PATCH' = 'POST',
  id?: string|number
) {
  const endpoint = method === 'PATCH' && id
    ? `${SURL}/rest/v1/${table}?id=eq.${id}`
    : `${SURL}/rest/v1/${table}`;
  try {
    const res = await fetch(endpoint, {
      method,
      headers: {
        'apikey': SKEY,
        'Authorization': `Bearer ${SKEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(data),
    });
    console.log(`✓ Supabase ${table} ${method}: ${res.status}`);
    if (!res.ok) console.warn(await res.text());
    return { ok: res.ok };
  } catch(e: any) {
    console.warn('DB error:', e.message);
    return { ok: false };
  }
}

export async function deleteFromSupabase(table: string, id: string|number) {
  try {
    const res = await fetch(`${SURL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': SKEY, 'Authorization': `Bearer ${SKEY}`, 'Content-Type': 'application/json' },
    });
    return { ok: res.ok };
  } catch { return { ok: false }; }
}
