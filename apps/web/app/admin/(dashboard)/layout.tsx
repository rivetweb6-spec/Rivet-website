'use client';

import { RequireAdmin } from '@/components/admin/auth-provider';
import { AdminShell } from '@/components/admin/shell';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <AdminShell>{children}</AdminShell>
    </RequireAdmin>
  );
}
