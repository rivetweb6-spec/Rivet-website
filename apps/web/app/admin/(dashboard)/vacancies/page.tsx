'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import {
  adminApi,
  getStoredToken,
  revalidatePublicCache,
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  VACANCY_STATUS_LABELS,
  type AdminVacancy,
  type JobApplication,
  type VacancyInput,
  type VacancyStatus,
} from '@/lib/admin-api';
import { useQuotationNotifications } from '@/components/admin/notifications';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import {
  emptySeoFields,
  pickSeoFields,
  seoPayload,
  SeoFieldsPanel,
} from '@/components/admin/seo-fields-panel';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminModal,
  AdminPageHeader,
  AdminSelect,
  AdminTextarea,
  EmptyState,
  StatusBadge,
} from '@/components/admin/ui';
import { cn } from '@/lib/utils';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'];

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

const emptyVacancy = (): VacancyInput => ({
  title: '',
  department: '',
  location: 'Addis Ababa',
  employmentType: 'Full-time',
  description: '',
  requirements: '',
  deadline: '',
  status: 'DRAFT',
  ...emptySeoFields(),
});

export default function AdminVacanciesPage() {
  const [tab, setTab] = React.useState<'vacancies' | 'applications'>('vacancies');
  const [vacancies, setVacancies] = React.useState<AdminVacancy[]>([]);
  const [applications, setApplications] = React.useState<JobApplication[]>([]);
  const [vacancyFilter, setVacancyFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [form, setForm] = React.useState<VacancyInput>(emptyVacancy());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<JobApplication | null>(null);
  const [notes, setNotes] = React.useState('');
  const [appStatus, setAppStatus] = React.useState('NEW');
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const { applyApplicationUnread } = useQuotationNotifications();

  const loadVacancies = React.useCallback(
    () => adminApi.vacancies.list().then((r) => setVacancies(r.vacancies)),
    [],
  );

  const loadApplications = React.useCallback(async () => {
    const data = await adminApi.vacancies.applications({
      vacancyId: vacancyFilter || undefined,
      status: statusFilter || undefined,
    });
    setApplications(data.applications);
    applyApplicationUnread(data.unread);
  }, [vacancyFilter, statusFilter, applyApplicationUnread]);

  React.useEffect(() => {
    loadVacancies().catch((e: Error) => setError(e.message));
  }, [loadVacancies]);

  React.useEffect(() => {
    if (tab !== 'applications') return;
    loadApplications().catch((e: Error) => setError(e.message));
  }, [tab, loadApplications]);

  React.useEffect(() => {
    if (tab !== 'applications') return;
    applyApplicationUnread(0);
    let cancelled = false;
    adminApi.vacancies
      .markAllApplicationsRead()
      .then(({ unread }) => {
        if (cancelled) return;
        applyApplicationUnread(unread);
        setApplications((prev) =>
          prev.map((item) => (item.readAt ? item : { ...item, readAt: new Date().toISOString() })),
        );
      })
      .catch(() => {
        /* badge still hides locally while viewing */
      });
    return () => {
      cancelled = true;
    };
  }, [tab, applyApplicationUnread]);

  const saveVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: VacancyInput = {
        title: form.title,
        department: form.department || null,
        location: form.location || null,
        employmentType: form.employmentType || null,
        description: form.description,
        requirements: form.requirements,
        deadline: form.deadline,
        status: form.status,
        ...seoPayload(pickSeoFields(form)),
      };
      if (editingId) await adminApi.vacancies.update(editingId, payload);
      else await adminApi.vacancies.create(payload);
      try {
        await revalidatePublicCache('vacancies');
      } catch {
        /* public cache will refresh on the next ISR window */
      }
      setOpen(false);
      await loadVacancies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const closeVacancy = async (id: string) => {
    if (!confirm('Close this vacancy? It will stop accepting applications.')) return;
    await adminApi.vacancies.close(id);
    try {
      await revalidatePublicCache('vacancies');
    } catch {
      /* ignore */
    }
    await loadVacancies();
  };

  const removeVacancy = async (id: string) => {
    if (!confirm('Delete this vacancy and all submitted applications? This cannot be undone.')) {
      return;
    }
    await adminApi.vacancies.remove(id);
    try {
      await revalidatePublicCache('vacancies');
    } catch {
      /* ignore */
    }
    await loadVacancies();
  };

  const openApplication = async (r: JobApplication) => {
    setSelected(r);
    setNotes(r.adminNotes ?? '');
    setAppStatus(r.status);
    if (r.readAt) return;
    try {
      const { application, unread } = await adminApi.vacancies.markApplicationRead(r.id);
      applyApplicationUnread(unread);
      setSelected((current) =>
        current?.id === application.id ? { ...current, ...application } : current,
      );
      setApplications((prev) =>
        prev.map((item) => (item.id === application.id ? application : item)),
      );
    } catch {
      /* review still works */
    }
  };

  const saveApplication = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminApi.vacancies.updateApplication(selected.id, {
        status: appStatus,
        adminNotes: notes,
      });
      setSelected(null);
      await loadApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const downloadCv = async (app: JobApplication) => {
    const token = getStoredToken();
    const res = await fetch(adminApi.vacancies.applicationCvUrl(app.id), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      setError('Could not download CV');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = app.cvOriginalName || 'cv.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = async () => {
    const token = getStoredToken();
    const res = await fetch(adminApi.vacancies.applicationsExportUrl(), {
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
    a.download = 'job-applications.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <AdminPageHeader
        title="Vacancies"
        description="Publish open roles, set closing dates, and review submitted CVs."
        actions={
          tab === 'vacancies' ? (
            <AdminButton
              onClick={() => {
                setEditingId(null);
                setForm(emptyVacancy());
                setOpen(true);
              }}
            >
              New vacancy
            </AdminButton>
          ) : (
            <AdminButton variant="secondary" onClick={exportCsv}>
              <Download size={16} /> Export CSV
            </AdminButton>
          )
        }
      />
      {error && <p className="mb-4 text-[0.875rem] text-error">{error}</p>}

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('vacancies')}
          className={cn(
            'rounded-[12px] px-4 py-2 text-[0.875rem] font-medium',
            tab === 'vacancies' ? 'bg-navy text-white' : 'bg-surface text-ink hover:bg-bg',
          )}
        >
          Vacancies
        </button>
        <button
          type="button"
          onClick={() => setTab('applications')}
          className={cn(
            'rounded-[12px] px-4 py-2 text-[0.875rem] font-medium',
            tab === 'applications' ? 'bg-navy text-white' : 'bg-surface text-ink hover:bg-bg',
          )}
        >
          Applications
        </button>
      </div>

      {tab === 'vacancies' ? (
        <AdminCard className="overflow-x-auto p-0">
          <table className="w-full min-w-[800px] text-left text-[0.875rem]">
            <thead className="border-b border-divider bg-bg/80 text-[0.75rem] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Deadline</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Applications</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {vacancies.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="No vacancies yet." />
                  </td>
                </tr>
              )}
              {vacancies.map((v) => (
                <tr key={v.id} className="border-b border-divider last:border-0">
                  <td className="px-5 py-3 font-medium">{v.title}</td>
                  <td className="px-5 py-3 text-muted">{v.department ?? '—'}</td>
                  <td className="px-5 py-3 text-muted">
                    {new Date(v.deadline).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-5 py-3 text-muted">{v._count?.applications ?? 0}</td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      className="mr-3 text-navy hover:text-gold"
                      onClick={() => {
                        setVacancyFilter(v.id);
                        setTab('applications');
                      }}
                    >
                      Applications
                    </button>
                    <button
                      type="button"
                      className="mr-3 text-navy hover:text-gold"
                      onClick={() => {
                        setEditingId(v.id);
                        setForm({
                          title: v.title,
                          department: v.department ?? '',
                          location: v.location ?? '',
                          employmentType: v.employmentType ?? 'Full-time',
                          description: v.description,
                          requirements: v.requirements,
                          deadline: toDateInput(v.deadline),
                          status: v.status,
                          ...pickSeoFields(v),
                        });
                        setOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    {v.status !== 'CLOSED' && (
                      <button
                        type="button"
                        className="mr-3 text-navy hover:text-gold"
                        onClick={() => closeVacancy(v.id)}
                      >
                        Close
                      </button>
                    )}
                    <button type="button" className="text-error" onClick={() => removeVacancy(v.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
      ) : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-2 max-w-xl">
            <AdminSelect
              label="Filter by vacancy"
              value={vacancyFilter}
              onChange={(e) => setVacancyFilter(e.target.value)}
            >
              <option value="">All vacancies</option>
              {vacancies.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect
              label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {APPLICATION_STATUS_LABELS[s]}
                </option>
              ))}
            </AdminSelect>
          </div>
          <AdminCard className="overflow-x-auto p-0">
            <table className="w-full min-w-[900px] text-left text-[0.875rem]">
              <thead className="border-b border-divider bg-bg/80 text-[0.75rem] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Applicant</th>
                  <th className="px-5 py-3 font-medium">Vacancy</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState message="No applications yet." />
                    </td>
                  </tr>
                )}
                {applications.map((a) => (
                  <tr
                    key={a.id}
                    className={cn(
                      'border-b border-divider last:border-0',
                      !a.readAt && 'bg-gold/[0.06]',
                    )}
                  >
                    <td className="px-5 py-3">
                      <p className="flex items-center gap-2 font-medium">
                        {!a.readAt && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-gold" aria-label="Unread" />
                        )}
                        {a.fullName}
                      </p>
                      <p className="text-[0.75rem] text-muted">{a.cvOriginalName}</p>
                    </td>
                    <td className="px-5 py-3 text-muted">{a.vacancy?.title ?? '—'}</td>
                    <td className="px-5 py-3 text-muted">
                      <div>{a.email}</div>
                      <div>{a.phone}</div>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {a.hasCv && (
                        <button
                          type="button"
                          className="mr-3 text-navy hover:text-gold"
                          onClick={() => downloadCv(a)}
                        >
                          Download CV
                        </button>
                      )}
                      <button
                        type="button"
                        className="text-navy hover:text-gold"
                        onClick={() => openApplication(a)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminCard>
        </>
      )}

      <AdminModal open={open} onClose={() => setOpen(false)} className="max-w-2xl">
        <form onSubmit={saveVacancy} className="space-y-4">
          <h2 className="text-[1.25rem] text-navy">
            {editingId ? 'Edit vacancy' : 'New vacancy'}
          </h2>
          <AdminInput
            label="Job title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Department"
              value={form.department ?? ''}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
            <AdminInput
              label="Location"
              value={form.location ?? ''}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminSelect
              label="Employment type"
              value={form.employmentType ?? 'Full-time'}
              onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
            >
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </AdminSelect>
            <AdminInput
              label="Application deadline"
              type="date"
              required
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <AdminSelect
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as VacancyStatus })}
          >
            {(['DRAFT', 'OPEN', 'CLOSED'] as const).map((s) => (
              <option key={s} value={s}>
                {VACANCY_STATUS_LABELS[s]}
              </option>
            ))}
          </AdminSelect>
          <label className="block">
            <span className="mb-1.5 block text-[0.8125rem] font-medium text-ink">Description</span>
            <RichTextEditor
              key={`${editingId ?? 'new'}-desc`}
              value={form.description}
              onChange={(description) => setForm({ ...form, description })}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[0.8125rem] font-medium text-ink">
              Requirements / qualifications
            </span>
            <RichTextEditor
              key={`${editingId ?? 'new'}-req`}
              value={form.requirements}
              onChange={(requirements) => setForm({ ...form, requirements })}
            />
          </label>
          <SeoFieldsPanel
            value={form}
            onChange={(seo) => setForm({ ...form, ...seo })}
            fallbackTitle={form.title || 'Vacancy'}
            fallbackDescription="Open role at River Company (RIVET)."
            pathPreview={`/careers/${form.slug || 'role-slug'}`}
          />
          <div className="flex justify-end gap-3">
            <AdminButton type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>

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
                {selected.email} · {selected.phone}
              </p>
              <p className="mt-1 text-[0.8125rem] text-muted">
                Applied for {selected.vacancy?.title ?? 'this vacancy'}
              </p>
            </div>
            {selected.coverLetter && (
              <p className="rounded-[12px] bg-bg p-3 text-[0.875rem] text-muted whitespace-pre-wrap">
                {selected.coverLetter}
              </p>
            )}
            {selected.hasCv && (
              <AdminButton variant="secondary" onClick={() => downloadCv(selected)}>
                <Download size={16} /> Download {selected.cvOriginalName}
              </AdminButton>
            )}
            <AdminSelect
              label="Status"
              value={appStatus}
              onChange={(e) => setAppStatus(e.target.value)}
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {APPLICATION_STATUS_LABELS[s]}
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
              <AdminButton type="button" onClick={saveApplication} disabled={saving}>
                {saving ? 'Saving…' : 'Update'}
              </AdminButton>
            </div>
          </>
        )}
      </AdminModal>
    </div>
  );
}
