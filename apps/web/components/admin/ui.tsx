import { cn } from '@/lib/utils';

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
        <h1 className="text-[1.75rem] text-navy md:text-[2rem]">{title}</h1>
        {description && <p className="mt-1 text-[0.9375rem] text-muted">{description}</p>}
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
        'rounded-[16px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]',
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
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}) {
  return (
    <button
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-[12px] px-4 text-[0.875rem] font-medium transition-colors disabled:opacity-50',
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

export function AdminInput({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[0.8125rem] font-medium text-ink">{label}</span>}
      <input
        className={cn(
          'h-11 w-full rounded-[12px] border border-border bg-surface px-3 text-[0.9375rem] outline-none focus:border-navy',
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
      {label && <span className="mb-1.5 block text-[0.8125rem] font-medium text-ink">{label}</span>}
      <textarea
        className={cn(
          'w-full rounded-[12px] border border-border bg-surface px-3 py-2.5 text-[0.9375rem] outline-none focus:border-navy',
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
      {label && <span className="mb-1.5 block text-[0.8125rem] font-medium text-ink">{label}</span>}
      <select
        className={cn(
          'h-11 w-full rounded-[12px] border border-border bg-surface px-3 text-[0.9375rem] outline-none focus:border-navy',
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
    PUBLISHED: 'bg-success/10 text-success',
    DRAFT: 'bg-muted/15 text-muted',
    NEW: 'bg-gold/15 text-navy',
    CONTACTED: 'bg-navy/10 text-navy',
    SCHEDULED: 'bg-warning/15 text-warning',
    COMPLETED: 'bg-success/10 text-success',
    CLOSED: 'bg-muted/15 text-muted',
  };
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium',
        map[status] ?? 'bg-bg text-ink',
      )}
    >
      {status}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="py-12 text-center text-[0.9375rem] text-muted">{message}</p>;
}
