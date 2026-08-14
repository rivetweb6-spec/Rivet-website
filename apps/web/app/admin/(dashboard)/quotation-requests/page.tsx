'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import {
  adminApi,
  getStoredToken,
  QUOTATION_STATUSES,
  QUOTATION_STATUS_LABELS,
  type QuotationRequest,
} from '@/lib/admin-api';
import { useQuotationNotifications } from '@/components/admin/notifications';
import {
  AdminButton,
  AdminCard,
  AdminModal,
  AdminPageHeader,
  AdminSelect,
  AdminTextarea,
  EmptyState,
  StatusBadge,
} from '@/components/admin/ui';
import { cn } from '@/lib/utils';

export default function AdminQuotationRequestsPage() {
  const [requests, setRequests] = React.useState<QuotationRequest[]>([]);
  const [filter, setFilter] = React.useState('');
  const [selected, setSelected] = React.useState<QuotationRequest | null>(null);
  const [notes, setNotes] = React.useState('');
  const [status, setStatus] = React.useState('NEW');
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const { applyUnreadCount } = useQuotationNotifications();

  const load = React.useCallback(async () => {
    const data = await adminApi.quotations.list(filter || undefined);
    setRequests(data.requests);
  }, [filter]);

  React.useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, [load]);

  React.useEffect(() => {
    applyUnreadCount(0);
    let cancelled = false;
    adminApi.quotations
      .markAllRead()
      .then(({ unread }) => {
        if (cancelled) return;
        applyUnreadCount(unread);
        setRequests((prev) =>
          prev.map((item) => (item.readAt ? item : { ...item, readAt: new Date().toISOString() })),
        );
      })
      .catch(() => {
        /* Badge still hides locally while viewing this page */
      });
    return () => {
      cancelled = true;
    };
  }, [applyUnreadCount]);

  const open = async (r: QuotationRequest) => {
    setSelected(r);
    setNotes(r.adminNotes ?? '');
    setStatus(r.status);
    if (r.readAt) return;
    try {
      const { quotation, unread } = await adminApi.quotations.markRead(r.id);
      applyUnreadCount(unread);
      setSelected((current) => (current?.id === quotation.id ? { ...current, ...quotation } : current));
      setRequests((prev) => prev.map((item) => (item.id === quotation.id ? quotation : item)));
    } catch {
      /* Review still works if mark-read fails */
    }
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminApi.quotations.update(selected.id, { status, adminNotes: notes });
      setSelected(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = async () => {
    const token = getStoredToken();
    const res = await fetch(adminApi.quotations.exportUrl(), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      setError('Export failed');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotation-requests.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <AdminPageHeader
        title="Quotation requests"
        description="Inbound quotation leads — review customer details, requested products and status."
        actions={
          <AdminButton variant="secondary" onClick={exportCsv}>
            <Download size={16} /> Export CSV
          </AdminButton>
        }
      />
      {error && <p className="mb-4 text-[0.875rem] text-error">{error}</p>}

      <div className="mb-4 max-w-xs">
        <AdminSelect
          label="Filter by status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All</option>
          {QUOTATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {QUOTATION_STATUS_LABELS[s]}
            </option>
          ))}
        </AdminSelect>
      </div>

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-left text-[0.875rem]">
          <thead className="border-b border-divider bg-bg/80 text-[0.75rem] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Qty</th>
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <EmptyState message="No quotation requests yet." />
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr
                key={r.id}
                className={cn(
                  'border-b border-divider last:border-0',
                  !r.readAt && 'bg-gold/[0.06]',
                )}
              >
                <td className="px-5 py-3">
                  <p className="flex items-center gap-2 font-medium">
                    {!r.readAt && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-gold"
                        aria-label="Unread"
                      />
                    )}
                    {r.fullName}
                  </p>
                  {r.company && <p className="text-[0.75rem] text-muted">{r.company}</p>}
                </td>
                <td className="px-5 py-3">
                  <p className="text-ink">{r.productName ?? '—'}</p>
                  <p className="text-[0.75rem] text-muted">{r.productInterest}</p>
                </td>
                <td className="px-5 py-3 text-muted">{r.quantity ?? '—'}</td>
                <td className="px-5 py-3 text-muted">
                  <div>{r.email}</div>
                  <div>{r.phone}</div>
                </td>
                <td className="px-5 py-3 text-muted">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    className="text-navy hover:text-gold"
                    onClick={() => open(r)}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>

      <AdminModal
        open={!!selected}
        onClose={() => setSelected(null)}
        className="max-w-lg space-y-4"
      >
        {selected && (
          <>
            <div>
              <h2 className="text-[1.25rem] text-navy">{selected.fullName}</h2>
              <p className="text-[0.8125rem] text-muted">
                {selected.company ? `${selected.company} · ` : ''}
                {selected.email} · {selected.phone}
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-[12px] border border-border bg-bg p-3">
              {selected.productImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.productImage}
                  alt={selected.productName ?? 'Requested product'}
                  className="h-14 w-14 shrink-0 rounded-[8px] object-cover"
                />
              )}
              <div className="min-w-0 text-[0.875rem]">
                <p className="font-medium text-ink">{selected.productName ?? selected.productInterest}</p>
                <p className="text-muted">
                  {selected.productInterest}
                  {selected.quantity ? ` · Qty: ${selected.quantity}` : ''}
                </p>
              </div>
            </div>

            {selected.message && (
              <p className="rounded-[12px] bg-bg p-3 text-[0.875rem] text-muted">
                {selected.message}
              </p>
            )}

            <AdminSelect
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {QUOTATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {QUOTATION_STATUS_LABELS[s]}
                </option>
              ))}
            </AdminSelect>
            <AdminTextarea
              label="Admin notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <AdminButton type="button" variant="ghost" onClick={() => setSelected(null)}>
                Cancel
              </AdminButton>
              <AdminButton type="button" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Update'}
              </AdminButton>
            </div>
          </>
        )}
      </AdminModal>
    </div>
  );
}
