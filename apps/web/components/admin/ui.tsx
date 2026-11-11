'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useFocusTrap } from '@/lib/use-focus-trap';

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl text-navy md:text-4xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function AdminCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative rounded-lg border border-border bg-surface p-5 shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminButton({
  children,
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-xs font-medium transition-colors disabled:opacity-50',
        variant === 'primary' && 'bg-gold text-navy hover:brightness-105',
        variant === 'secondary' && 'bg-navy text-white hover:bg-navy-600',
        variant === 'danger' && 'bg-error text-white hover:brightness-110',
        variant === 'ghost' && 'border border-border text-ink hover:border-gold hover:text-gold',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Portal-based modal so drawers sit above the sticky admin header/sidebar
 * and remain interactive (not trapped in a stacking context).
 */
export function AdminModal({
  open,
  onClose,
  children,
  className,
  labelledBy,
  error,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
  /**
   * Save/upload error to show inside the dialog. Page-level errors sit under
   * the modal backdrop and are invisible while it is open.
   */
  error?: string | null;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <ModalFrame onClose={onClose} className={className} labelledBy={labelledBy} error={error}>
      {children}
    </ModalFrame>,
    document.body,
  );
}

/**
 * The rendered dialog. Split out so its focus trap and auto-labelling run
 * only while it is actually on screen.
 */
function ModalFrame({
  onClose,
  children,
  className,
  labelledBy,
  error,
}: {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
  error?: string | null;
}) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const autoTitleId = React.useId();

  // Move focus into the dialog, keep Tab inside it, restore focus on close.
  useFocusTrap(panelRef, true);

  // Name the dialog after its heading when the caller did not pass labelledBy.
  React.useEffect(() => {
    if (labelledBy) return;
    const heading = panelRef.current?.querySelector<HTMLElement>('h1, h2, h3');
    if (!heading || !dialogRef.current) return;
    if (!heading.id) heading.id = autoTitleId;
    dialogRef.current.setAttribute('aria-labelledby', heading.id);
  });

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      {/* Click-outside-to-close for mouse users; keyboard users have Escape and the dialog's buttons. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={cn(
          'relative z-10 max-h-[90dvh] w-full overflow-y-auto rounded-xl bg-surface p-6 shadow-[var(--shadow-bloom)]',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-error/25 bg-error/10 px-3.5 py-3 text-xs text-error"
          >
            {error}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function AdminInput({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-2xs font-medium text-ink">{label}</span>}
      <input
        className={cn(
          'h-11 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-navy ',
          className,
        )}
        {...props}
      />
    </label>
  );
}

export function AdminTextarea({
  label,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-2xs font-medium text-ink">{label}</span>}
      <textarea
        className={cn(
          'w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm focus:border-navy ',
          className,
        )}
        {...props}
      />
    </label>
  );
}

export function AdminSelect({
  label,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-2xs font-medium text-ink">{label}</span>}
      <select
        className={cn(
          'h-11 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-navy ',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: 'bg-success/10 text-success-ink',
    DRAFT: 'bg-muted/15 text-ink',
    NEW: 'bg-gold/15 text-navy',
    OPEN: 'bg-success/10 text-success-ink',
    CLOSED: 'bg-muted/15 text-ink',
    UNDER_REVIEW: 'bg-warning/15 text-warning-ink',
    SHORTLISTED: 'bg-navy/10 text-navy',
    INTERVIEW: 'bg-navy/10 text-navy',
    OFFERED: 'bg-success/10 text-success-ink',
    HIRED: 'bg-success/10 text-success-ink',
    CONTACTED: 'bg-navy/10 text-navy',
    QUOTATION_SENT: 'bg-navy/10 text-navy',
    APPROVED: 'bg-success/10 text-success-ink',
    REJECTED: 'bg-error/10 text-error-ink',
    COMPLETED: 'bg-success/10 text-success-ink',
  };
  const labels: Record<string, string> = {
    UNDER_REVIEW: 'Under Review',
    QUOTATION_SENT: 'Quotation Sent',
    SHORTLISTED: 'Shortlisted',
    INTERVIEW: 'Interview',
    OFFERED: 'Offered',
    HIRED: 'Hired',
  };
  return (
    <span
      className={cn(
        'inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-3xs font-medium',
        map[status] ?? 'bg-bg text-ink',
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

/**
 * Empty list message. Pass `loading` until the first fetch settles so the
 * page shows an announced "Loading…" instead of flashing "No … yet".
 */
export function EmptyState({ message, loading = false }: { message: string; loading?: boolean }) {
  if (loading) {
    return (
      <p role="status" className="py-12 text-center text-sm text-muted">
        Loading…
      </p>
    );
  }
  return <p className="py-12 text-center text-sm text-muted">{message}</p>;
}
