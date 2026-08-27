'use client';

import * as React from 'react';
import { Check, FileUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { isAllowedCvFilename } from '@/lib/vacancies';
import { cn } from '@/lib/utils';

const MAX_CV_BYTES = 8 * 1024 * 1024;
const ACCEPTED = '.pdf,.doc,.docx';

type Fields = {
  fullName: string;
  email: string;
  phone: string;
  coverLetter: string;
};

const empty: Fields = {
  fullName: '',
  email: '',
  phone: '',
  coverLetter: '',
};

type Errors = Partial<Record<keyof Fields | 'cv', string>>;

function validate(f: Fields, file: File | null): Errors {
  const e: Errors = {};
  if (!f.fullName.trim()) e.fullName = 'Please share your name.';
  if (!f.email.trim()) e.email = 'An email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'That email looks incomplete.';
  if (!f.phone.trim()) e.phone = 'A phone number is required.';
  if (!file) e.cv = 'Attach your CV as a PDF or Word document.';
  else if (!isAllowedCvFilename(file.name)) e.cv = 'Attach your CV as a PDF or Word document.';
  else if (file.size > MAX_CV_BYTES) e.cv = 'CV is too large. Maximum size is 8 MB.';
  return e;
}

export function ApplicationForm({ slug, title }: { slug: string; title: string }) {
  const [fields, setFields] = React.useState<Fields>(empty);
  const [cv, setCv] = React.useState<File | null>(null);
  const [errors, setErrors] = React.useState<Errors>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success'>('idle');
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setReady(true);
  }, []);

  const set = (key: keyof Fields, val: string) => {
    const next = { ...fields, [key]: val };
    setFields(next);
    if (touched[key]) setErrors(validate(next, cv));
  };

  const blur = (key: keyof Fields) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(fields, cv));
  };

  const pickFile = (file: File | null) => {
    setCv(file);
    setTouched((t) => ({ ...t, cv: true }));
    setErrors(validate(fields, file));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(fields, cv);
    setErrors(found);
    setTouched({ fullName: true, email: true, phone: true, cv: true });
    if (Object.keys(found).length > 0 || !cv) return;

    setStatus('submitting');
    setSubmitError(null);
    try {
      const form = new FormData();
      form.set('fullName', fields.fullName.trim());
      form.set('email', fields.email.trim());
      form.set('phone', fields.phone.trim());
      if (fields.coverLetter.trim()) form.set('coverLetter', fields.coverLetter.trim());
      form.set('cv', cv);
      await api.vacancies.apply(slug, form);
      setStatus('success');
    } catch (err) {
      setStatus('idle');
      setSubmitError(
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      );
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-[20px] border border-border bg-surface p-8 text-center md:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold">
          <Check size={30} />
        </div>
        <h2 className="mt-6 text-[1.75rem]">Application received</h2>
        <p className="mt-3 text-muted">
          Thank you. We have your CV for {title} and will contact you if there is a match.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      method="post"
      data-ready={ready ? 'true' : undefined}
      className="space-y-4 rounded-[20px] border border-border bg-surface p-6 md:p-8"
    >
      <div>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-gold">
          Apply
        </p>
        <h2 className="mt-2 text-[1.5rem]">Submit your CV</h2>
      </div>
      <Field
        label="Full name"
        required
        value={fields.fullName}
        error={touched.fullName ? errors.fullName : undefined}
        onChange={(v) => set('fullName', v)}
        onBlur={() => blur('fullName')}
      />
      <Field
        label="Email"
        type="email"
        required
        value={fields.email}
        error={touched.email ? errors.email : undefined}
        onChange={(v) => set('email', v)}
        onBlur={() => blur('email')}
      />
      <Field
        label="Phone"
        required
        value={fields.phone}
        error={touched.phone ? errors.phone : undefined}
        onChange={(v) => set('phone', v)}
        onBlur={() => blur('phone')}
      />
      <div>
        <label htmlFor="careers-cover-letter" className="mb-1.5 block text-[0.875rem] font-medium">
          Cover note
        </label>
        <textarea
          id="careers-cover-letter"
          rows={4}
          value={fields.coverLetter}
          onChange={(e) => set('coverLetter', e.target.value)}
          placeholder="Optional — a short note about why this role fits."
          className="w-full rounded-[12px] border border-border bg-surface px-4 py-3 text-[1rem] outline-none placeholder:text-muted/60 focus:border-navy"
        />
      </div>
      <div>
        <p className="mb-1.5 text-[0.875rem] font-medium text-ink">
          CV <span className="text-gold">*</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
        {cv ? (
          <div className="flex items-center justify-between gap-3 rounded-[12px] border border-border bg-bg px-4 py-3">
            <p className="min-w-0 truncate text-[0.875rem]">{cv.name}</p>
            <button
              type="button"
              aria-label="Remove CV"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:text-error"
              onClick={() => {
                pickFile(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex w-full flex-col items-center gap-2 rounded-[12px] border border-dashed px-4 py-8 text-center transition-colors hover:border-gold hover:bg-gold/5',
              touched.cv && errors.cv ? 'border-error/60' : 'border-border',
            )}
          >
            <FileUp size={22} className="text-gold" strokeWidth={1.5} />
            <span className="text-[0.875rem] font-medium">Upload PDF or Word CV</span>
            <span className="text-[0.75rem] text-muted">Maximum 8 MB · PDF, DOC, DOCX</span>
          </button>
        )}
        {touched.cv && errors.cv && <p className="mt-1.5 text-[0.75rem] text-error">{errors.cv}</p>}
      </div>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!ready || status === 'submitting'}
      >
        {status === 'submitting' ? 'Submitting…' : 'Submit application'}
      </Button>
      {submitError && <p className="text-center text-[0.8125rem] text-error">{submitError}</p>}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  type?: string;
}) {
  const id = React.useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.875rem] font-medium text-ink">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn(
          'h-12 w-full rounded-[12px] border bg-surface px-4 text-[1rem] outline-none placeholder:text-muted/60 focus:border-navy',
          error ? 'border-error/60' : 'border-border',
        )}
      />
      {error && <p className="mt-1.5 text-[0.75rem] text-error">{error}</p>}
    </div>
  );
}
