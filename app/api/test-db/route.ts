import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const h = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

  // user_sessions works without user_id (for local logins)
  const r1 = await fetch(`${url}/rest/v1/user_sessions`, {
    method: 'POST', headers: h,
    body: JSON.stringify({ email:'test@motorsync.com', full_name:'Test User', logged_in_at: new Date().toISOString() }),
  });
  const b1 = await r1.text();

  return NextResponse.json({
    user_sessions: r1.status < 300 ? '✓ SUCCESS' : `FAIL ${r1.status}: ${b1}`,
    profiles_note: 'profiles only gets rows when user signs up via Supabase Auth (needs real UUID from auth.users)',
  });
}