'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  adminApi,
  clearSession,
  getStoredToken,
  getStoredUser,
  setSession,
  AUTH_EXPIRED_EVENT,
  type AdminUser,
  AdminApiError,
} from '@/lib/admin-api';

type AuthCtx = {
  user: AdminUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: AdminUser) => void;
};

const AuthContext = React.createContext<AuthCtx | null>(null);

export function useAdminAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<AdminUser | null>(null);
  const [ready, setReady] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const token = getStoredToken();
    const stored = getStoredUser();
    if (!token || !stored) {
      setReady(true);
      return;
    }
    setUserState(stored);
    adminApi
      .me()
      .then(({ user: u }) => {
        setUserState(u);
        const current = getStoredToken();
        if (current) setSession(current, u);
      })
      .catch(() => {
        clearSession();
        setUserState(null);
      })
      .finally(() => setReady(true));
  }, []);

  React.useEffect(() => {
    const onExpired = () => {
      clearSession();
      setUserState(null);
      router.replace('/admin/login');
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [router]);

  const login = async (email: string, password: string) => {
    const data = await adminApi.login(email, password);
    setUserState(data.user);
    router.replace('/admin');
  };

  const logout = async () => {
    await adminApi.logout();
    setUserState(null);
    router.replace('/admin/login');
  };

  const refreshUser = async () => {
    const { user: u } = await adminApi.me();
    const token = getStoredToken();
    if (token) setSession(token, u);
    setUserState(u);
  };

  const setUser = (u: AdminUser) => {
    const token = getStoredToken();
    if (token) setSession(token, u);
    setUserState(u);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAdminAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (ready && !user) router.replace('/admin/login');
  }, [ready, user, router]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg text-muted">Loading…</div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}

export { AdminApiError };
