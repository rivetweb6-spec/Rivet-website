'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  adminApi,
  revalidatePublicCache,
  type AdminTeamMember,
  type TeamMemberInput,
  type TeamSection,
} from '@/lib/admin-api';
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
import { ImageUploadField } from '@/components/admin/image-upload-field';

const SECTIONS: { id: TeamSection; label: string }[] = [
  { id: 'LEADERSHIP', label: 'Leadership' },
  { id: 'ENGINEERING', label: 'Engineering' },
  { id: 'TEAM', label: 'Team' },
];

const emptyForm = (order = 1): TeamMemberInput => ({
  fullName: '',
  position: '',
  bio: '',
  photo: '',
  email: '',
  phone: '',
  linkedin: '',
  section: 'TEAM',
  order,
  status: 'PUBLISHED',
});

export default function AdminTeamPage() {
  const [members, setMembers] = React.useState<AdminTeamMember[]>([]);
  const [form, setForm] = React.useState<TeamMemberInput>(emptyForm());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = () => adminApi.team.list().then((r) => setMembers(r.members));

  React.useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, []);

  const bustCache = async () => {
    try {
      await revalidatePublicCache('team');
    } catch {
      /* public cache will refresh on the next ISR window */
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: TeamMemberInput = {
        fullName: form.fullName.trim(),
        position: form.position.trim(),
        bio: form.bio?.trim() || null,
        photo: form.photo || null,
        email: form.email?.trim() || null,
        phone: form.phone?.trim() || null,
        linkedin: form.linkedin?.trim() || null,
        section: form.section,
        order: form.order,
        status: form.status,
      };
      if (editingId) await adminApi.team.update(editingId, payload);
      else await adminApi.team.create(payload);
      await bustCache();
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this team member?')) return;
    setError(null);
    try {
      await adminApi.team.remove(id);
      await bustCache();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const move = async (section: TeamSection, index: number, direction: -1 | 1) => {
    const group = members.filter((m) => m.section === section);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= group.length) return;
    const next = [...group];
    const item = next[index];
    const swapWith = next[nextIndex];
    if (!item || !swapWith) return;
    next[index] = swapWith;
    next[nextIndex] = item;
    try {
      const { members: updated } = await adminApi.team.reorder(next.map((m) => m.id));
      setMembers(updated);
      await bustCache();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reorder failed');
      await load();
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Meet Our Team"
        description="Profiles on the public Meet Our Team page. Place the General Manager in Leadership and the Engineering Manager in Engineering."
        actions={
          <AdminButton
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm(members.length + 1));
              setOpen(true);
            }}
          >
            Add team member
          </AdminButton>
        }
      />
      {error && <p className="mb-4 text-[0.875rem] text-error">{error}</p>}

      {members.length === 0 ? (
        <EmptyState message="No team members yet. Add a name, position, and portrait." />
      ) : (
        <div className="space-y-10">
          {SECTIONS.map((section) => {
            const group = members.filter((m) => m.section === section.id);
            if (group.length === 0) return null;
            return (
              <section key={section.id}>
                <h2 className="mb-4 text-[1.125rem] text-navy">{section.label}</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.map((m, index) => (
                    <AdminCard key={m.id} className="flex gap-4">
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[10px] bg-bg">
                        {m.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.photo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full place-items-center text-[0.75rem] text-muted">
                            No photo
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[1.0625rem] text-navy">{m.fullName}</h3>
                        <p className="text-[0.8125rem] text-muted">{m.position}</p>
                        <div className="mt-2">
                          <StatusBadge status={m.status} />
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-[0.8125rem]">
                          <button
                            type="button"
                            className="grid h-7 w-7 place-items-center rounded-[8px] text-navy hover:bg-bg disabled:opacity-30"
                            aria-label="Move up"
                            disabled={index === 0}
                            onClick={() => void move(section.id, index, -1)}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            className="grid h-7 w-7 place-items-center rounded-[8px] text-navy hover:bg-bg disabled:opacity-30"
                            aria-label="Move down"
                            disabled={index === group.length - 1}
                            onClick={() => void move(section.id, index, 1)}
                          >
                            <ChevronDown size={14} />
                          </button>
                          <button
                            type="button"
                            className="text-navy hover:text-gold"
                            onClick={() => {
                              setEditingId(m.id);
                              setForm({
                                fullName: m.fullName,
                                position: m.position,
                                bio: m.bio ?? '',
                                photo: m.photo ?? '',
                                email: m.email ?? '',
                                phone: m.phone ?? '',
                                linkedin: m.linkedin ?? '',
                                section: m.section,
                                order: m.order,
                                status: (m.status as 'DRAFT' | 'PUBLISHED') ?? 'PUBLISHED',
                              });
                              setOpen(true);
                            }}
                          >
                            Edit
                          </button>
                          <button type="button" className="text-error" onClick={() => void remove(m.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </AdminCard>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <AdminModal open={open} onClose={() => setOpen(false)} className="max-w-2xl">
        <form onSubmit={(e) => void save(e)} className="space-y-4">
          <h2 className="text-[1.25rem] text-navy">
            {editingId ? 'Edit team member' : 'New team member'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput
              label="Full name"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <AdminInput
              label="Position / title"
              required
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </div>
          <AdminTextarea
            label="Short biography"
            rows={4}
            value={form.bio ?? ''}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <ImageUploadField
            label="Profile picture"
            value={form.photo ?? ''}
            onChange={(photo) => setForm({ ...form, photo })}
            onError={setError}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <AdminInput
              label="Email (optional)"
              type="email"
              value={form.email ?? ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <AdminInput
              label="Phone (optional)"
              value={form.phone ?? ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <AdminInput
              label="LinkedIn URL (optional)"
              value={form.linkedin ?? ''}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <AdminSelect
              label="Section"
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value as TeamSection })}
            >
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </AdminSelect>
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
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
