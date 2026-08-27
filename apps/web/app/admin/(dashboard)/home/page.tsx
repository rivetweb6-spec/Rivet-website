'use client';

import * as React from 'react';
import { adminApi, revalidatePublicCache } from '@/lib/admin-api';
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
  gmName: 'General Manager',
  gmPosition: 'General Manager',
  gmPhoto: '',
  gmMessage:
    'Every project we take on is a commitment — to specification, to craft, and to the people who will live and work in the spaces we help build.',
  engName: 'Engineering Manager',
  engPosition: 'Engineering Manager',
  engPhoto: '',
  engMessage:
    'Engineering is the quiet work behind a confident installation. We specify with care so that what arrives on site performs as promised.',
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
          gmName: home.gmName ?? defaults.gmName,
          gmPosition: home.gmPosition ?? defaults.gmPosition,
          gmPhoto: home.gmPhoto ?? '',
          gmMessage: home.gmMessage ?? defaults.gmMessage,
          engName: home.engName ?? defaults.engName,
          engPosition: home.engPosition ?? defaults.engPosition,
          engPhoto: home.engPhoto ?? '',
          engMessage: home.engMessage ?? defaults.engMessage,
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
        gmName: form.gmName || null,
        gmPosition: form.gmPosition || null,
        gmPhoto: form.gmPhoto || null,
        gmMessage: form.gmMessage || null,
        engName: form.engName || null,
        engPosition: form.engPosition || null,
        engPhoto: form.engPhoto || null,
        engMessage: form.engMessage || null,
      });
      try {
        await revalidatePublicCache('home');
      } catch {
        /* public cache will refresh on the next ISR window */
      }
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
          description="Edit the public home page hero, intro, and management messages."
        />
        <p className="text-[0.875rem] text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Homepage"
        description="Edit the public home page hero, intro, photos, and a word from management."
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

        <AdminCard>
          <h3 className="mb-1 text-[1rem] font-semibold text-ink">General Manager</h3>
          <p className="mb-4 text-[0.8125rem] text-muted">
            Appears on the public home page. Keep the message to two or three short sentences.
          </p>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminInput
                label="Name"
                value={form.gmName}
                onChange={(e) => setForm({ ...form, gmName: e.target.value })}
              />
              <AdminInput
                label="Position"
                value={form.gmPosition}
                onChange={(e) => setForm({ ...form, gmPosition: e.target.value })}
              />
            </div>
            <AdminTextarea
              label="Message"
              rows={4}
              value={form.gmMessage}
              onChange={(e) => setForm({ ...form, gmMessage: e.target.value })}
            />
            <ImageUploadField
              label="Photo"
              value={form.gmPhoto}
              onChange={(gmPhoto) => setForm({ ...form, gmPhoto })}
              onError={setError}
            />
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="mb-1 text-[1rem] font-semibold text-ink">Engineering Manager</h3>
          <p className="mb-4 text-[0.8125rem] text-muted">
            Appears on the public home page. Keep the message to two or three short sentences.
          </p>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminInput
                label="Name"
                value={form.engName}
                onChange={(e) => setForm({ ...form, engName: e.target.value })}
              />
              <AdminInput
                label="Position"
                value={form.engPosition}
                onChange={(e) => setForm({ ...form, engPosition: e.target.value })}
              />
            </div>
            <AdminTextarea
              label="Message"
              rows={4}
              value={form.engMessage}
              onChange={(e) => setForm({ ...form, engMessage: e.target.value })}
            />
            <ImageUploadField
              label="Photo"
              value={form.engPhoto}
              onChange={(engPhoto) => setForm({ ...form, engPhoto })}
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
