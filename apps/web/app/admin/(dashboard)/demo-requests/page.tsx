'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import { adminApi, getStoredToken, type DemoRequest } from '@/lib/admin-api';
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  AdminSelect,
  AdminTextarea,
  EmptyState,
  StatusBadge,
} from '@/components/admin/ui';

const STATUSES = ['NEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CLOSED'] as const;

export default function AdminDemoRequestsPage() {
  const [requests, setRequests] = React.useState<DemoRequest[]>([]);
  const [filter, setFilter] = React.useState('');
  const [selected, setSelected] = React.useState<DemoRequest | null>(null);
  const [notes, setNotes] = React.useState('');
  const [status, setStatus] = React.useState('NEW');
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const data = await adminApi.demos.list(filter || undefined);
    setRequests(data.requests);
  }, [filter]);

  React.useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, [load]);

  const open = (r: DemoRequest) => {
    setSelected(r);
    setNotes(r.adminNotes ?? '');
    setStatus(r.status);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminApi.demos.update(selected.id, { status, adminNotes: notes });
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
    const res = await fetch(adminApi.demos.exportUrl(), {
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
    a.download = 'demo-requests.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <AdminPageHeader
        title="Demo requests"
        description="Inbound private-demo leads — update status and notes."
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
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </AdminSelect>
      </div>

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full min-w-[800px] text-left text-[0.875rem]">
          <thead className="border-b border-divider bg-bg/80 text-[0.75rem] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Interest</th>
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState message="No demo requests yet." />
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-divider last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium">{r.fullName}</p>
                  {r.company && <p className="text-[0.75rem] text-muted">{r.company}</p>}
                </td>
                <td className="px-5 py-3 text-muted">{r.productInterest}</td>
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-lg space-y-4 rounded-[20px] bg-surface p-6 shadow-[var(--shadow-bloom)]">
            <h2 className="text-[1.25rem] text-navy">{selected.fullName}</h2>
            <p className="text-[0.875rem] text-muted">
              {selected.productInterest}
              {selected.message ? ` — ${selected.message}` : ''}
            </p>
            <AdminSelect
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
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
          </div>
        </div>
      )}
    </div>
  );
}
