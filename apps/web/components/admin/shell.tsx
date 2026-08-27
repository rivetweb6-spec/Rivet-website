'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Building2,
  FileText,
  Home,
  Images,
  LayoutDashboard,
  LogOut,
  Package,
  Phone,
  Search,
  Tags,
  User,
  Users,
  Wrench,
  Award,
  Briefcase,
  Inbox,
  Menu,
  X,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AdminLogo } from './admin-logo';
import { useAdminAuth } from './auth-provider';
import { useQuotationNotifications } from './notifications';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/home', label: 'Homepage', icon: Home },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/certificates', label: 'Certificate & Portfolio', icon: Award },
  { href: '/admin/news', label: 'News', icon: FileText },
  { href: '/admin/site-seo', label: 'Site SEO', icon: Search },
  { href: '/admin/quotation-requests', label: 'Quotation Requests', icon: Inbox },
  { href: '/admin/vacancies', label: 'Vacancies', icon: Briefcase },
  { href: '/admin/company', label: 'Company', icon: Building2 },
  { href: '/admin/team', label: 'Team', icon: Users },
  { href: '/admin/gallery', label: 'Gallery', icon: Images },
  { href: '/admin/contact', label: 'Contact', icon: Phone },
  { href: '/admin/profile', label: 'Profile', icon: User },
];

function AdminSidebar({
  unreadCount,
  applicationUnread,
  onNavigate,
}: {
  unreadCount: number;
  applicationUnread: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  return (
    <aside className="flex h-full w-64 flex-col bg-navy text-white">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <AdminLogo light className="h-7" />
        <span className="text-[0.6875rem] uppercase tracking-[0.18em] text-white/50">Admin</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const isQuotations = item.href === '/admin/quotation-requests';
          const isVacancies = item.href === '/admin/vacancies';
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'relative flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[0.875rem] transition-colors',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/65 hover:bg-white/5 hover:text-white',
              )}
            >
              {active && (
                <span className="absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r bg-gold" />
              )}
              <Icon size={18} strokeWidth={1.75} />
              <span className="flex-1">{item.label}</span>
              {isQuotations && unreadCount > 0 && !active && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-[0.6875rem] font-semibold text-navy">
                  {unreadCount}
                </span>
              )}
              {isVacancies && applicationUnread > 0 && !active && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-[0.6875rem] font-semibold text-navy">
                  {applicationUnread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-[0.8125rem] text-white/80">{user?.name}</p>
        <p className="truncate text-[0.75rem] text-white/45">{user?.email}</p>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-3 inline-flex items-center gap-2 text-[0.8125rem] text-white/60 transition-colors hover:text-gold"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { unreadCount, applicationUnread } = useQuotationNotifications();
  const pathname = usePathname();
  const viewingQuotations = pathname === '/admin/quotation-requests';
  const [open, setOpen] = React.useState(false);

  const closeDrawer = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="flex min-h-screen bg-bg">
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-[60] lg:flex lg:w-64">
        <AdminSidebar unreadCount={unreadCount} applicationUnread={applicationUnread} />
      </div>

      {open && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-navy/50"
            aria-label="Close menu"
            onClick={closeDrawer}
          />
          <div className="absolute inset-y-0 left-0 z-10 shadow-xl">
            <AdminSidebar
              unreadCount={unreadCount}
              applicationUnread={applicationUnread}
              onNavigate={closeDrawer}
            />
          </div>
        </div>
      )}

      <div className="relative z-0 flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur md:px-8">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-[12px] text-navy lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="hidden text-[0.875rem] text-muted lg:block">Control room</div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/admin/quotation-requests"
              className="relative grid h-10 w-10 place-items-center rounded-full text-navy transition-colors hover:bg-bg"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && !viewingQuotations && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-surface" />
              )}
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
