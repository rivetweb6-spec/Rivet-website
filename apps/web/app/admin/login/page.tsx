'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AdminApiError, useAdminAuth } from '@/components/admin/auth-provider';
import { AdminBackdrop } from '@/components/admin/backdrop';
import { AdminButton, AdminCard, AdminInput } from '@/components/admin/ui';
import { Logo } from '@/components/site/logo';

export default function AdminLoginPage() {
  const { login, user, ready } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState('admin@rivet.com');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (ready && user) router.replace('/admin');
  }, [ready, user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <AdminBackdrop />
      <div className="absolute inset-x-0 bottom-0 gold-rule opacity-25" aria-hidden="true" />
      <AdminCard className="relative z-10 w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <Logo className="text-[1.75rem]" />
          <p className="mt-2 text-[0.875rem] text-muted">Sign in to the control room</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <AdminInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
          <AdminInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p className="text-[0.8125rem] text-error">{error}</p>}
          <AdminButton type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </AdminButton>
        </form>
      </AdminCard>
    </div>
  );
}
