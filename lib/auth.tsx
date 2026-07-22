'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
  isGuest: boolean;
}

interface AuthCtx {
  user: AuthUser | null;
  login: (name: string, email: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({
  user: null, login: () => {}, loginAsGuest: () => {}, logout: () => {},
});

function mkInitials(name: string) {
  const p = name.trim().split(' ').filter(Boolean);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

export function saveUserToStorage(name: string, email: string, isGuest = false): AuthUser {
  const u: AuthUser = { name, email, initials: mkInitials(name), isGuest };
  try {
    localStorage.setItem('ms_user', JSON.stringify(u));
    // Also set cookie so middleware can check auth server-side (no flash)
    document.cookie = `ms_user=${encodeURIComponent(JSON.stringify(u))};path=/;max-age=604800;SameSite=Lax`;
  } catch {}
  return u;
}

export function clearUserFromStorage() {
  try {
    localStorage.removeItem('ms_user');
    // Clear cookie too
    document.cookie = 'ms_user=;path=/;max-age=0';
  } catch {}
}

export function getUserFromStorage(): AuthUser | null {
  try {
    if (typeof window === 'undefined') return null;
    const s = localStorage.getItem('ms_user');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const u = getUserFromStorage();
    if (u) setUser(u);
  }, []);

  const login = (name: string, email: string) => {
    const u = saveUserToStorage(name, email, false);
    setUser(u);
  };

  const loginAsGuest = () => {
    const u = saveUserToStorage('Guest', 'guest@motorsync.com', true);
    setUser(u);
  };

  const logout = async () => {
    clearUserFromStorage();
    setUser(null);
    // Also sign out from Supabase if configured
    try {
      const { signOut: supaSignOut } = await import('./supabase');
      await supaSignOut();
    } catch {}
  };

  return (
    <Ctx.Provider value={{ user, login, loginAsGuest, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);