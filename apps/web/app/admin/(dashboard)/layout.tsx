'use client';

import { RequireAdmin } from '@/components/admin/auth-provider';
import { QuotationNotificationsProvider } from '@/components/admin/notifications';
import { AdminShell } from '@/components/admin/shell';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <QuotationNotificationsProvider>
        <AdminShell>{children}</AdminShell>
      </QuotationNotificationsProvider>
    </RequireAdmin>
  );
}
