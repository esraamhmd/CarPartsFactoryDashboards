import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple proxy — no forced auth redirect
// Auth is handled client-side in AppLayout
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|api).*)',
  ],
};