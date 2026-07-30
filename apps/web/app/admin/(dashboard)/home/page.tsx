'use client';

import * as React from 'react';
import { adminApi } from '@/lib/admin-api';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminPageHeader,
  AdminTextarea,
} from '@/components/admin/ui';
import { ImageUploadField } from '@/components/admin/image-upload-field';

const defaults = {
  eyebrow: 'River Company · Premium Imports',
  headline: 'Engineering the architecture',
  headlineAccent: 'of ambition.',
  subheadline:
    'Elevators, granite, doors and fine building materials — imported with precision, installed with mastery.',
  heroImage: '',
  introEyebrow: 'The River Company Standard',
  introTitle: 'A flagship of imported precision.',
  introBody:
    "For nearly two decades, RIVET has brought the world's finest construction and architectural products to landmark projects — from machine-room-less elevators to full-slab granite and engineered building materials.",
  introBodySecondary:
    'We operate the way we build: with restraint, precision, and an obsession for the details that others overlook.',
  introImage: '',
};

export default function AdminHomePage() {
  const [form, setForm] = React.useState(defaults);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    adminApi.home
      .get()
      .then(({ home }) => {
        if (!home) return;
        setForm({
          eyebrow: home.eyebrow ?? defaults.eyebrow,
          headline: home.headline ?? defaults.headline,
          headlineAccent: home.headlineAccent ?? defaults.headlineAccent,
          subheadline: home.subheadline ?? defaults.subheadline,
          heroImage: home.heroImage ?? '',
          introEyebrow: home.introEyebrow ?? defaults.introEyebrow,
          introTitle: home.introTitle ?? defaults.introTitle,
          introBody: home.introBody ?? defaults.introBody,
          introBodySecondary: home.introBodySecondary ?? defaults.introBodySecondary,
          introImage: home.introImage ?? '',
        });
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await adminApi.home.update({
        eyebrow: form.eyebrow || null,
        headline: form.headline || null,
        headlineAccent: form.headlineAccent || null,
        subheadline: form.subheadline || null,
        heroImage: form.heroImage || null,
        introEyebrow: form.introEyebrow || null,
        introTitle: form.introTitle || null,
        introBody: form.introBody || null,
        introBodySecondary: form.introBodySecondary || null,
        introImage: form.introImage || null,
      });
      setMessage('Homepage content saved. Changes appear on the public site shortly.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader
          title="Homepage"
          description="Edit the public home page hero and intro."
        />
        <p className="text-[0.875rem] text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Homepage"
        description="Edit the public home page hero copy, intro text, and photos."
      />
      <form onSubmit={save} className="space-y-6">
        <AdminCard>
          <h3 className="mb-4 text-[1rem] font-semibold text-ink">Hero section</h3>
          <div className="space-y-4">
            <AdminInput
              label="Eyebrow"
              value={form.eyebrow}
              onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <AdminInput
                label="Headline"
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
              />
              <AdminInput
                label="Headline accent (gold italic)"
                value={form.headlineAccent}
                onChange={(e) => setForm({ ...form, headlineAccent: e.target.value })}
              />
            </div>
            <AdminTextarea
              label="Subheadline"
              rows={3}
              value={form.subheadline}
              onChange={(e) => setForm({ ...form, subheadline: e.target.value })}
            />
            <ImageUploadField
              label="Hero background image"
              value={form.heroImage}
              onChange={(heroImage) => setForm({ ...form, heroImage })}
              onError={setError}
            />
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="mb-4 text-[1rem] font-semibold text-ink">Intro section</h3>
          <div className="space-y-4">
            <AdminInput
              label="Eyebrow"
              value={form.introEyebrow}
              onChange={(e) => setForm({ ...form, introEyebrow: e.target.value })}
            />
            <AdminInput
              label="Title"
              value={form.introTitle}
              onChange={(e) => setForm({ ...form, introTitle: e.target.value })}
            />
            <AdminTextarea
              label="Body"
              rows={4}
              value={form.introBody}
              onChange={(e) => setForm({ ...form, introBody: e.target.value })}
            />
            <AdminTextarea
              label="Secondary body"
              rows={3}
              value={form.introBodySecondary}
              onChange={(e) => setForm({ ...form, introBodySecondary: e.target.value })}
            />
            <ImageUploadField
              label="Intro image"
              value={form.introImage}
              onChange={(introImage) => setForm({ ...form, introImage })}
              onError={setError}
            />
          </div>
        </AdminCard>

        {message && <p className="text-[0.875rem] text-success">{message}</p>}
        {error && <p className="text-[0.875rem] text-error">{error}</p>}
        <AdminButton type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save homepage'}
        </AdminButton>
      </form>
    </div>
  );
}
