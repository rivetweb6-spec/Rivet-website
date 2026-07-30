import { AdminAuthProvider } from '@/components/admin/auth-provider';

export const metadata = {
  title: 'Admin | RIVET',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
