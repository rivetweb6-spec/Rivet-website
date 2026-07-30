'use client';

import * as React from 'react';
import { adminApi, type AdminService, type ServiceInput } from '@/lib/admin-api';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminPageHeader,
  AdminSelect,
  AdminTextarea,
  EmptyState,
  StatusBadge,
} from '@/components/admin/ui';

export default function AdminServicesPage() {
  const [services, setServices] = React.useState<AdminService[]>([]);
  const [form, setForm] = React.useState<ServiceInput>({
    title: '',
    narrative: '',
    icon: 'Wrench',
    order: 0,
    status: 'PUBLISHED',
  });
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = () => adminApi.services.list().then((r) => setServices(r.services));

  React.useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await adminApi.services.update(editingId, form);
      else await adminApi.services.create(form);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await adminApi.services.remove(id);
    await load();
  };

  return (
    <div>
      <AdminPageHeader
        title="Services"
        description="Import, installation, maintenance and consultation offerings."
        actions={
          <AdminButton
            onClick={() => {
              setEditingId(null);
              setForm({
                title: '',
                narrative: '',
                icon: 'Wrench',
                order: services.length + 1,
                status: 'PUBLISHED',
              });
              setOpen(true);
            }}
          >
            Add service
          </AdminButton>
        }
      />
      {error && <p className="mb-4 text-[0.875rem] text-error">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {services.length === 0 && <EmptyState message="No services yet." />}
        {services.map((s) => (
          <AdminCard key={s.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[1.0625rem] text-navy">{s.title}</h3>
                <p className="mt-2 text-[0.875rem] text-muted line-clamp-3">{s.narrative}</p>
                <div className="mt-3">
                  <StatusBadge status={s.status} />
                </div>
              </div>
              <div className="shrink-0 text-[0.8125rem]">
                <button
                  type="button"
                  className="mr-3 text-navy hover:text-gold"
                  onClick={() => {
                    setEditingId(s.id);
                    setForm({
                      title: s.title,
                      narrative: s.narrative,
                      icon: s.icon ?? 'Wrench',
                      order: s.order,
                      status: (s.status as 'DRAFT' | 'PUBLISHED') ?? 'PUBLISHED',
                    });
                    setOpen(true);
                  }}
                >
                  Edit
                </button>
                <button type="button" className="text-error" onClick={() => remove(s.id)}>
                  Delete
                </button>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setOpen(false)} />
          <form
            onSubmit={save}
            className="relative z-10 w-full max-w-lg space-y-4 rounded-[20px] bg-surface p-6 shadow-[var(--shadow-bloom)]"
          >
            <h2 className="text-[1.25rem] text-navy">
              {editingId ? 'Edit service' : 'New service'}
            </h2>
            <AdminInput
              label="Title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <AdminTextarea
              label="Narrative"
              required
              rows={4}
              value={form.narrative}
              onChange={(e) => setForm({ ...form, narrative: e.target.value })}
            />
            <AdminInput
              label="Lucide icon name"
              value={form.icon ?? ''}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <AdminInput
                label="Order"
                type="number"
                value={form.order ?? 0}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
              <AdminSelect
                label="Status"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as 'DRAFT' | 'PUBLISHED' })
                }
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </AdminSelect>
            </div>
            <div className="flex justify-end gap-3">
              <AdminButton type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </AdminButton>
              <AdminButton type="submit">Save</AdminButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
