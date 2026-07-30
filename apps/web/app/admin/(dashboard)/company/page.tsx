'use client';

import * as React from 'react';
import { adminApi, type CompanyInfo } from '@/lib/admin-api';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminPageHeader,
  AdminTextarea,
} from '@/components/admin/ui';

export default function AdminCompanyPage() {
  const [form, setForm] = React.useState({
    history: '',
    vision: '',
    mission: '',
    coreValues: '',
    achievements: '',
    certifications: '',
    timelineJson: '[]',
  });
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    adminApi.company
      .get()
      .then(({ company }) => {
        if (!company) return;
        setForm({
          history: company.history ?? '',
          vision: company.vision ?? '',
          mission: company.mission ?? '',
          coreValues: (company.coreValues ?? []).join(', '),
          achievements: (company.achievements ?? []).join('\n'),
          certifications: (company.certifications ?? []).join('\n'),
          timelineJson: JSON.stringify(company.timeline ?? [], null, 2),
        });
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      let timeline: CompanyInfo['timeline'] = [];
      try {
        timeline = JSON.parse(form.timelineJson) as CompanyInfo['timeline'];
      } catch {
        throw new Error('Timeline must be valid JSON');
      }
      await adminApi.company.update({
        history: form.history || undefined,
        vision: form.vision || undefined,
        mission: form.mission || undefined,
        coreValues: form.coreValues
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        achievements: form.achievements
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        certifications: form.certifications
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        timeline: timeline ?? [],
      });
      setMessage('Company information saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Company information"
        description="History, vision, mission, values and timeline."
      />
      <AdminCard>
        <form onSubmit={save} className="space-y-4">
          <AdminTextarea
            label="History"
            rows={4}
            value={form.history}
            onChange={(e) => setForm({ ...form, history: e.target.value })}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <AdminTextarea
              label="Vision"
              rows={3}
              value={form.vision}
              onChange={(e) => setForm({ ...form, vision: e.target.value })}
            />
            <AdminTextarea
              label="Mission"
              rows={3}
              value={form.mission}
              onChange={(e) => setForm({ ...form, mission: e.target.value })}
            />
          </div>
          <AdminInput
            label="Core values (comma-separated)"
            value={form.coreValues}
            onChange={(e) => setForm({ ...form, coreValues: e.target.value })}
          />
          <AdminTextarea
            label="Achievements (one per line)"
            rows={3}
            value={form.achievements}
            onChange={(e) => setForm({ ...form, achievements: e.target.value })}
          />
          <AdminTextarea
            label="Certifications (one per line)"
            rows={3}
            value={form.certifications}
            onChange={(e) => setForm({ ...form, certifications: e.target.value })}
          />
          <AdminTextarea
            label='Timeline JSON — [{ "year", "title", "description" }]'
            rows={8}
            value={form.timelineJson}
            onChange={(e) => setForm({ ...form, timelineJson: e.target.value })}
            className="font-mono text-[0.8125rem]"
          />
          {message && <p className="text-[0.875rem] text-success">{message}</p>}
          {error && <p className="text-[0.875rem] text-error">{error}</p>}
          <AdminButton type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save company info'}
          </AdminButton>
        </form>
      </AdminCard>
    </div>
  );
}
