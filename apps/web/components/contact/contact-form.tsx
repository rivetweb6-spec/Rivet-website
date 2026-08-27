'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

type Fields = { name: string; email: string; phone: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Please share your name.';
  if (!f.email.trim()) e.email = 'An email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'That email looks incomplete.';
  if (!f.message.trim()) e.message = 'Please include a message.';
  return e;
}

export function ContactForm() {
  const [fields, setFields] = React.useState<Fields>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success'>('idle');
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const set = (key: keyof Fields, val: string) => {
    const next = { ...fields, [key]: val };
    setFields(next);
    if (touched[key]) setErrors(validate(next));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(found).length > 0) return;

    setStatus('submitting');
    setSubmitError(null);
    try {
      await api.contact({
        name: fields.name.trim(),
        email: fields.email.trim(),
        phone: fields.phone.trim() || undefined,
        message: fields.message.trim(),
      });
      setStatus('success');
    } catch (err) {
      setStatus('idle');
      setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        className="flex flex-col items-center rounded-[20px] border border-border bg-surface px-8 py-16 text-center shadow-[var(--shadow-sm)]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold">
          <Check size={26} />
        </div>
        <h3 className="mt-5 text-[1.5rem]">Message sent</h3>
        <p className="mt-2 max-w-sm text-muted">
          Thank you. A RIVET specialist will respond shortly.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="space-y-4 rounded-[20px] border border-border bg-surface p-8 shadow-[var(--shadow-sm)]"
    >
      <Field
        label="Full Name"
        required
        autoComplete="name"
        value={fields.name}
        error={touched.name ? errors.name : undefined}
        onChange={(v) => set('name', v)}
        onBlur={() => {
          setTouched((t) => ({ ...t, name: true }));
          setErrors(validate(fields));
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={fields.email}
          error={touched.email ? errors.email : undefined}
          onChange={(v) => set('email', v)}
          onBlur={() => {
            setTouched((t) => ({ ...t, email: true }));
            setErrors(validate(fields));
          }}
        />
        <Field
          label="Phone"
          type="tel"
          autoComplete="tel"
          value={fields.phone}
          onChange={(v) => set('phone', v)}
        />
      </div>
      <div>
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-[0.875rem] font-medium text-ink"
        >
          Message <span className="text-gold">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={fields.message}
          onChange={(e) => set('message', e.target.value)}
          onBlur={() => {
            setTouched((t) => ({ ...t, message: true }));
            setErrors(validate(fields));
          }}
          className={cn(
            'w-full rounded-[12px] border bg-surface px-4 py-3 text-[1rem] outline-none transition-colors focus:border-navy',
            touched.message && errors.message ? 'border-error/60' : 'border-border',
          )}
        />
        <AnimatePresence>
          {touched.message && errors.message && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1.5 text-[0.75rem] text-error"
            >
              {errors.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Send message'}
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
        {label} {required && <span className="text-gold">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn(
          'h-12 w-full rounded-[12px] border bg-surface px-4 text-[1rem] outline-none transition-colors focus:border-navy',
          error ? 'border-error/60' : 'border-border',
        )}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-[0.75rem] text-error">
          {error}
        </p>
      )}
    </div>
  );
}
