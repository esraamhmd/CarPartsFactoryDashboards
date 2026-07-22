// MotorSync Supabase Client
// Uses direct fetch for DB operations (compatible with new sb_publishable_ key format)

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const SUPABASE_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.includes('.supabase.co') && SUPABASE_KEY.length > 10;
}

// ── REST API fetch helper ────────────────────────────────────
async function sbFetch(path: string, options?: RequestInit) {
  if (!isSupabaseConfigured()) return { ok: false, data: null, error: 'Not configured' };
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
      ...(options?.headers ?? {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return { ok: res.ok, status: res.status, data, error: res.ok ? null : data?.message };
}

// ── Auth (uses Supabase JS client for auth only) ─────────────
function getAuthClient() {
  if (typeof window === 'undefined') return null;
  if (!isSupabaseConfigured()) return null;
  // Dynamic import to avoid SSR issues
  return null; // will be lazy loaded
}

// ── Log session to DB via REST API ───────────────────────────
export async function logSessionToDB(userId: string | null, email: string, name: string) {
  if (!isSupabaseConfigured()) return;
  try {
    const now = new Date().toISOString();

    // Always log session (user_id optional - null for local/guest logins)
    await sbFetch('/rest/v1/user_sessions', {
      method: 'POST',
      body: JSON.stringify({
        ...(userId ? { user_id: userId } : {}),
        email,
        full_name: name,
        logged_in_at: now,
      }),
    });

    // Only upsert profile when we have a REAL Supabase auth userId
    // profiles.id is a foreign key to auth.users - must be a real UUID from Supabase Auth
    if (userId) {
      await sbFetch('/rest/v1/profiles', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          id: userId,          // MUST match auth.users.id
          email,
          full_name: name,
          last_login: now,
          updated_at: now,
        }),
      });
    }
    console.log('✓ Session stored in Supabase DB');
  } catch (e) {
    console.warn('DB log failed:', e);
  }
}

// ── SIGN UP ──────────────────────────────────────────────────
export async function signUp(email: string, password: string, fullName: string) {
  if (!isSupabaseConfigured()) return { data: null, error: { message: 'Not configured' } };
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const res = await sbFetch('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({
      email, password,
      data: { full_name: fullName },
      gotrue_meta_security: {},
    }),
    headers: { 'Prefer': '' },
  });
  if (res.data?.id) {
    await logSessionToDB(res.data.id, email, fullName);
    return { data: { user: res.data, session: res.data.session }, error: null };
  }
  return { data: null, error: { message: res.data?.msg || res.data?.error_description || 'Sign up failed' } };
}

// ── SIGN IN ──────────────────────────────────────────────────
export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured()) return { data: null, error: { message: 'Not configured' } };
  const res = await sbFetch('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: { 'Prefer': '' },
  });
  if (res.data?.user) {
    const name = res.data.user.user_metadata?.full_name || email.split('@')[0];
    await logSessionToDB(res.data.user.id, email, name);
    // Store session token
    if (typeof window !== 'undefined' && res.data.access_token) {
      localStorage.setItem('sb_access_token', res.data.access_token);
    }
    return { data: { user: res.data.user, session: res.data }, error: null };
  }
  return { data: null, error: { message: res.data?.error_description || res.data?.msg || 'Invalid credentials' } };
}

// ── SIGN OUT ─────────────────────────────────────────────────
export async function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sb_access_token');
  }
  const token = typeof window !== 'undefined' ? localStorage.getItem('sb_access_token') : null;
  await sbFetch('/auth/v1/logout', {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}`, 'Prefer': '' } : { 'Prefer': '' },
  });
}

// ── RESET PASSWORD ───────────────────────────────────────────
export async function resetPassword(email: string) {
  if (!isSupabaseConfigured()) return { data: null, error: { message: 'Not configured' } };
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const res = await sbFetch('/auth/v1/recover', {
    method: 'POST',
    body: JSON.stringify({ email, gotrue_meta_security: {} }),
    headers: { 'Prefer': '' },
  });
  return { data: res.data, error: res.ok ? null : { message: 'Reset failed' } };
}

// ── GET SESSION ──────────────────────────────────────────────
export async function getSession() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sb_access_token') : null;
  return token ? { access_token: token } : null;
}

// ── GET USER ─────────────────────────────────────────────────
export async function getUser() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sb_access_token') : null;
  if (!token) return null;
  const res = await sbFetch('/auth/v1/user', {
    headers: { 'Authorization': `Bearer ${token}`, 'Prefer': '' },
  });
  return res.ok ? res.data : null;
}

// ── DB HELPERS ───────────────────────────────────────────────
type Table = 'employees'|'inventory'|'orders'|'customers'|'suppliers'|
             'machines'|'defects'|'maintenance'|'payroll'|'notifications'|
             'profiles'|'production_daily'|'user_sessions';

export async function dbSelect(table: Table, options?: { eq?: Record<string,any>; order?: string; limit?: number }) {
  let path = `/rest/v1/${table}?select=*`;
  if (options?.eq)    for (const [k,v] of Object.entries(options.eq)) path += `&${k}=eq.${v}`;
  if (options?.order) path += `&order=${options.order}`;
  if (options?.limit) path += `&limit=${options.limit}`;
  const res = await sbFetch(path, { headers: { 'Prefer': '' } });
  return { data: res.data, error: res.error };
}

export async function dbInsert(table: Table, data: Record<string,any>|Record<string,any>[]) {
  const res = await sbFetch(`/rest/v1/${table}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return { data: res.data, error: res.error };
}

export async function dbUpdate(table: Table, id: number|string, data: Record<string,any>) {
  const res = await sbFetch(`/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return { data: res.data, error: res.error };
}

export async function dbDelete(table: Table, id: number|string) {
  const res = await sbFetch(`/rest/v1/${table}?id=eq.${id}`, { method: 'DELETE' });
  return { data: res.data, error: res.error };
}

export function subscribeToTable(table: Table, callback: (payload: any) => void) {
  return () => {}; // Realtime requires JS client - skip for now
}

export async function getProfile(userId: string) {
  const res = await sbFetch(`/rest/v1/profiles?id=eq.${userId}&select=*`, { headers: { 'Prefer': '' } });
  return res.data?.[0] ?? null;
}

export async function onAuthChange(cb: (event: string, session: any) => void) {
  return () => {};
}