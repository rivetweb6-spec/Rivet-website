'use client';

import * as React from 'react';
import { adminApi, type ContactMessage } from '@/lib/admin-api';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminPageHeader,
  EmptyState,
} from '@/components/admin/ui';

export default function AdminContactPage() {
  const [form, setForm] = React.useState({
    address: '',
    phone: '',
    email: '',
    whatsapp: '',
    facebook: '',
    linkedin: '',
    telegram: '',
    mapLat: '',
    mapLng: '',
  });
  const [messages, setMessages] = React.useState<ContactMessage[]>([]);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    Promise.all([adminApi.contactInfo.get(), adminApi.contactMessages.list()])
      .then(([infoRes, msgRes]) => {
        const info = infoRes.info;
        if (info) {
          setForm({
            address: info.address ?? '',
            phone: info.phone ?? '',
            email: info.email ?? '',
            whatsapp: info.whatsapp ?? '',
            facebook: info.facebook ?? '',
            linkedin: info.linkedin ?? '',
            telegram: info.telegram ?? '',
            mapLat: info.mapLat != null ? String(info.mapLat) : '',
            mapLng: info.mapLng != null ? String(info.mapLng) : '',
          });
        }
        setMessages(msgRes.messages);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await adminApi.contactInfo.update({
        address: form.address || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        whatsapp: form.whatsapp || undefined,
        facebook: form.facebook || undefined,
        linkedin: form.linkedin || undefined,
        telegram: form.telegram || undefined,
        mapLat: form.mapLat ? Number(form.mapLat) : undefined,
        mapLng: form.mapLng ? Number(form.mapLng) : undefined,
      });
      setMessage('Contact information saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Contact"
        description="Office details, social channels, and inbound messages."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <h2 className="mb-4 text-[1.125rem] text-navy">Contact information</h2>
          <form onSubmit={save} className="space-y-4">
            <AdminInput
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <AdminInput
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <AdminInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <AdminInput
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
            <AdminInput
              label="Facebook URL"
              value={form.facebook}
              onChange={(e) => setForm({ ...form, facebook: e.target.value })}
            />
            <AdminInput
              label="LinkedIn URL"
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
            />
            <AdminInput
              label="Telegram URL"
              value={form.telegram}
              onChange={(e) => setForm({ ...form, telegram: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <AdminInput
                label="Map latitude"
                value={form.mapLat}
                onChange={(e) => setForm({ ...form, mapLat: e.target.value })}
              />
              <AdminInput
                label="Map longitude"
                value={form.mapLng}
                onChange={(e) => setForm({ ...form, mapLng: e.target.value })}
              />
            </div>
            {message && <p className="text-[0.875rem] text-success">{message}</p>}
            {error && <p className="text-[0.875rem] text-error">{error}</p>}
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </AdminButton>
          </form>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-[1.125rem] text-navy">Inbound messages</h2>
          {messages.length === 0 ? (
            <EmptyState message="No contact messages yet." />
          ) : (
            <ul className="max-h-[32rem] space-y-4 overflow-y-auto">
              {messages.map((m) => (
                <li key={m.id} className="rounded-[12px] border border-border p-4">
                  <div className="flex justify-between gap-2">
                    <p className="font-medium text-ink">{m.name}</p>
                    <time className="text-[0.75rem] text-muted">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="mt-1 text-[0.8125rem] text-muted">
                    {m.email}
                    {m.phone ? ` · ${m.phone}` : ''}
                  </p>
                  <p className="mt-2 text-[0.875rem]">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
