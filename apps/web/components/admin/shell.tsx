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
import { useFocusTrap } from '@/lib/use-focus-trap';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/home', label: 'Homepage', icon: Home },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/certificates', label: 'Certificates & Portfolio', icon: Award },
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

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function CountBadge({ count, what }: { count: number; what: string }) {
  return (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-3xs font-semibold text-navy">
      {count}
      <span className="sr-only"> {what}</span>
    </span>
  );
}

function AdminSidebar({
  unreadCount,
  applicationUnread,
  onNavigate,
  onClose,
}: {
  unreadCount: number;
  applicationUnread: number;
  onNavigate?: () => void;
  /** Present in the mobile drawer: renders a Close button. */
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  return (
    <aside className="on-dark flex h-full w-64 flex-col bg-navy text-white">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <AdminLogo light className="h-7" />
        <span className="text-3xs uppercase tracking-[0.18em] text-white/70">Admin</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="ml-auto grid h-10 w-10 place-items-center rounded-xl text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X size={20} aria-hidden="true" />
          </button>
        )}
      </div>
      <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
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
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition-colors',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/75 hover:bg-white/5 hover:text-white',
              )}
            >
              {active && (
                <span
                  className="absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r bg-gold"
                  aria-hidden="true"
                />
              )}
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {isQuotations && unreadCount > 0 && !active && (
                <CountBadge count={unreadCount} what="unread" />
              )}
              {isVacancies && applicationUnread > 0 && !active && (
                <CountBadge count={applicationUnread} what="new applications" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-2xs text-white/85">{user?.name}</p>
        <p className="truncate text-3xs text-white/70">{user?.email}</p>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-3 inline-flex items-center gap-2 text-2xs text-white/75 transition-colors hover:text-gold"
        >
          <LogOut size={15} aria-hidden="true" /> Sign out
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
  const drawerRef = React.useRef<HTMLDivElement>(null);

  const closeDrawer = React.useCallback(() => setOpen(false), []);

  // Mobile drawer behaves as a modal dialog: focus moves in (first nav link),
  // stays inside, and returns to the menu button when it closes.
  useFocusTrap(drawerRef, open, {
    initialFocus: () => drawerRef.current?.querySelector<HTMLElement>('nav a'),
  });

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const bellLabel =
    unreadCount > 0 ? `Notifications: ${plural(unreadCount, 'unread quotation request', 'unread quotation requests')}` : 'Notifications';

  return (
    <div className="flex min-h-screen bg-bg">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Announce new activity to screen reader users without stealing focus. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {unreadCount > 0 ? plural(unreadCount, 'unread quotation request', 'unread quotation requests') : ''}
        {applicationUnread > 0 ? `, ${plural(applicationUnread, 'new job application', 'new job applications')}` : ''}
      </p>

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-[60] lg:flex lg:w-64">
        <AdminSidebar unreadCount={unreadCount} applicationUnread={applicationUnread} />
      </div>

      {open && (
        <div
          id="admin-drawer"
          className="fixed inset-0 z-[200] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Admin menu"
        >
          {/* Click-outside-to-close for mouse/touch; keyboard users have Escape and Close. */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="absolute inset-0 bg-navy/50"
            onClick={closeDrawer}
          />
          <div ref={drawerRef} className="absolute inset-y-0 left-0 z-10 shadow-xl">
            <AdminSidebar
              unreadCount={unreadCount}
              applicationUnread={applicationUnread}
              onNavigate={closeDrawer}
              onClose={closeDrawer}
            />
          </div>
        </div>
      )}

      <div className="relative z-0 flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur md:px-8">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl text-navy lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="admin-drawer"
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
          <div className="hidden text-xs text-muted lg:block">Control room</div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/admin/quotation-requests"
              className="relative grid h-10 w-10 place-items-center rounded-full text-navy transition-colors hover:bg-bg"
              aria-label={bellLabel}
            >
              <Bell size={18} aria-hidden="true" />
              {unreadCount > 0 && !viewingQuotations && (
                <span
                  className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-surface"
                  aria-hidden="true"
                />
              )}
            </Link>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
