'use client';

import * as React from 'react';
import { Check, FileUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { isAllowedCvFilename } from '@/lib/vacancies';
import { cn } from '@/lib/utils';
import { focusFirstInvalid } from '@/lib/form-a11y';

const MAX_CV_BYTES = 8 * 1024 * 1024;
const ACCEPTED = '.pdf,application/pdf';

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
  if (!file) e.cv = 'Attach your CV as a PDF file.';
  else if (!isAllowedCvFilename(file.name)) {
    e.cv = /\.docx?$/i.test(file.name)
      ? 'Word files are not accepted. Please save your CV as a PDF and attach that.'
      : 'Please attach your CV as a PDF file.';
  }
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
  const cvId = React.useId();
  const cvError = touched.cv ? errors.cv : undefined;

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

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const found = validate(fields, cv);
    setErrors(found);
    setTouched({ fullName: true, email: true, phone: true, cv: true });
    if (Object.keys(found).length > 0 || !cv) {
      focusFirstInvalid(formEl);
      return;
    }

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
      <div className="rounded-[8px] border border-border bg-surface p-6 text-center sm:p-8 md:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[8px] bg-bg text-success-ink">
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
      className="space-y-4 rounded-[8px] border border-border bg-surface p-5 sm:p-6 md:p-8"
    >
      <div>
        <p className="eyebrow text-gold-ink">
          Apply
        </p>
        <h2 className="mt-2 text-[1.5rem]">Submit your CV</h2>
      </div>
      <Field
        label="Full name"
        required
        autoComplete="name"
        value={fields.fullName}
        error={touched.fullName ? errors.fullName : undefined}
        onChange={(v) => set('fullName', v)}
        onBlur={() => blur('fullName')}
      />
      <Field
        label="Email"
        type="email"
        required
        autoComplete="email"
        value={fields.email}
        error={touched.email ? errors.email : undefined}
        onChange={(v) => set('email', v)}
        onBlur={() => blur('email')}
      />
      <Field
        label="Phone"
        type="tel"
        required
        autoComplete="tel"
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
          maxLength={8000}
          value={fields.coverLetter}
          onChange={(e) => set('coverLetter', e.target.value)}
          placeholder="Optional — a short note about why this role fits."
          className="w-full rounded-[6px] border border-border bg-canvas px-4 text-ink hover:border-navy/40 dark:bg-bg py-3 text-[1rem] outline-none placeholder:text-muted focus:border-navy focus:ring-2 focus:ring-navy/15 dark:focus:border-gold dark:focus:ring-gold/25"
        />
      </div>
      <div>
        <p id={`${cvId}-label`} className="mb-1.5 text-[0.875rem] font-medium text-ink">
          CV <span className="text-gold-ink">*</span>
        </p>
        {/*
          The file input is the one focusable, labelled control. It is visually
          hidden; the box below is its <label>, so clicking the box opens the
          picker and keyboard focus on the input draws a ring around the box.
        */}
        <input
          ref={inputRef}
          id={cvId}
          type="file"
          accept={ACCEPTED}
          className="peer sr-only"
          aria-labelledby={`${cvId}-label`}
          aria-describedby={
            [cv ? `${cvId}-file` : `${cvId}-hint`, cvError ? `${cvId}-error` : '']
              .filter(Boolean)
              .join(' ')
          }
          aria-required
          aria-invalid={cvError ? true : undefined}
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
        {cv ? (
          <div className="flex items-center justify-between gap-3 rounded-[8px] border border-border bg-bg px-4 py-3 peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-focus-visible:ring-offset-2">
            <p id={`${cvId}-file`} className="min-w-0 truncate text-[0.875rem]">
              <span className="sr-only">Selected file: </span>
              {cv.name}
            </p>
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
          <label
            htmlFor={cvId}
            className={cn(
              'flex w-full cursor-pointer flex-col items-center gap-2 rounded-[8px] border border-dashed px-4 py-8 text-center transition-colors hover:border-navy hover:bg-bg dark:hover:border-gold',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-focus-visible:ring-offset-2',
              cvError ? 'border-error-ink' : 'border-border',
            )}
          >
            <FileUp size={22} className="text-navy dark:text-gold" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-[0.875rem] font-medium" aria-hidden="true">
              Upload your CV (PDF)
            </span>
            <span id={`${cvId}-hint`} className="text-[0.75rem] text-muted">
              PDF only · maximum 8 MB
            </span>
          </label>
        )}
        {cvError && (
          <p id={`${cvId}-error`} className="mt-1.5 text-[0.8125rem] text-error-ink">
            {cvError}
          </p>
        )}
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
      {submitError && (
        <p className="text-center text-[0.875rem] text-error-ink" role="alert">
          {submitError}
        </p>
      )}
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
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
}) {
  const id = React.useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.875rem] font-medium text-ink">
        {label} {required && <span className="text-gold-ink">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn(
          'h-12 w-full rounded-[6px] border bg-canvas px-4 text-ink hover:border-navy/40 dark:bg-bg text-[1rem] outline-none placeholder:text-muted focus:border-navy focus:ring-2 focus:ring-navy/15 dark:focus:border-gold dark:focus:ring-gold/25',
          error ? 'border-error-ink' : 'border-border',
        )}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-[0.8125rem] text-error-ink">
          {error}
        </p>
      )}
    </div>
  );
}
