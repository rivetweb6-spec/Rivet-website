'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RivetImage } from '@/components/ui/rivet-image';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { QuotationOptions } from './quotation-modal-provider';
import {
  CategoryMultiSelect,
  joinProductInterests,
  parseProductInterests,
} from './category-multi-select';

type Fields = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  productInterest: string[];
  productName: string;
  quantity: string;
  message: string;
};

const empty: Fields = {
  fullName: '',
  company: '',
  email: '',
  phone: '',
  productInterest: [],
  productName: '',
  quantity: '',
  message: '',
};

type Errors = Partial<Record<keyof Fields, string>>;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.fullName.trim()) e.fullName = 'Please share your name.';
  if (!f.email.trim()) e.email = 'An email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'That email looks incomplete.';
  if (!f.phone.trim()) e.phone = 'A phone number is required.';
  if (f.productInterest.length === 0) e.productInterest = 'Select at least one product category.';
  if (!f.productName.trim()) e.productName = 'Tell us which product you need.';
  if (!f.quantity.trim()) e.quantity = 'Let us know the quantity you need.';
  return e;
}

export function QuotationModal({
  open,
  onClose,
  options = {},
}: {
  open: boolean;
  onClose: () => void;
  options?: QuotationOptions;
}) {
  const [fields, setFields] = React.useState<Fields>(empty);
  const [errors, setErrors] = React.useState<Errors>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success'>('idle');
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);

  const prefilledProduct = Boolean(options.productName);

  React.useEffect(() => {
    if (open) {
      setFields({
        ...empty,
        productInterest: parseProductInterests(options.productInterest),
        productName: options.productName ?? '',
        message: options.message ?? '',
      });
      setErrors({});
      setTouched({});
      setStatus('idle');
      setSubmitError(null);
      const prev = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => closeBtnRef.current?.focus());
      return () => prev?.focus?.();
    }
  }, [open, options.productInterest, options.productName, options.message]);

  React.useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const set = (key: keyof Fields, val: string | string[]) => {
    const next = { ...fields, [key]: val } as Fields;
    setFields(next);
    if (touched[key]) setErrors(validate(next));
  };

  const blur = (key: keyof Fields) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(fields));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      productInterest: true,
      productName: true,
      quantity: true,
    });
    if (Object.keys(found).length > 0) return;

    setStatus('submitting');
    setSubmitError(null);
    try {
      await api.quotationRequest({
        fullName: fields.fullName.trim(),
        company: fields.company.trim() || undefined,
        email: fields.email.trim(),
        phone: fields.phone.trim(),
        productInterest: joinProductInterests(fields.productInterest),
        productName: fields.productName.trim(),
        quantity: fields.quantity.trim(),
        productId: options.productId,
        productSlug: options.productSlug,
        productImage: options.productImage,
        message: fields.message.trim() || undefined,
      });
      setStatus('success');
    } catch (err) {
      setStatus('idle');
      setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-navy/50 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quotation-modal-title"
            className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto overflow-x-hidden rounded-[20px] bg-surface shadow-[var(--shadow-bloom)]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-bg hover:text-navy"
            >
              <X size={18} />
            </button>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  className="flex flex-col items-center px-8 py-16 text-center"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.div
                    className="grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                  >
                    <Check size={30} />
                  </motion.div>
                  <h3 id="quotation-modal-title" className="mt-6 text-[1.75rem]">
                    Request received
                  </h3>
                  <p className="mt-3 max-w-sm text-muted">
                    Thank you. A RIVET specialist will contact you shortly with your quotation.
                  </p>
                  <Button variant="secondary" className="mt-8" onClick={onClose}>
                    Close
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="form" className="px-8 py-8" exit={{ opacity: 0 }}>
                  <p className="eyebrow text-navy">Project pricing</p>
                  <h3 id="quotation-modal-title" className="mt-2 text-[1.75rem]">
                    Request a Quotation
                  </h3>
                  <p className="mt-2 text-[0.875rem] text-muted">
                    Tell us what you need. We will prepare a tailored quotation for your project.
                  </p>

                  {prefilledProduct && (
                    <div className="mt-5 flex items-center gap-4 rounded-[12px] border border-gold/30 bg-gold/5 p-3">
                      {options.productImage && (
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[8px]">
                          <RivetImage
                            src={options.productImage}
                            alt={options.productName ?? 'Selected product'}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[0.9375rem] font-medium text-ink">
                          {options.productName}
                        </p>
                        {options.productInterest && (
                          <p className="text-[0.75rem] text-muted">{options.productInterest}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                    <Field
                      label="Full Name"
                      required
                      value={fields.fullName}
                      error={touched.fullName ? errors.fullName : undefined}
                      onChange={(v) => set('fullName', v)}
                      onBlur={() => blur('fullName')}
                    />
                    <Field
                      label="Company Name"
                      value={fields.company}
                      onChange={(v) => set('company', v)}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Email Address"
                        type="email"
                        required
                        value={fields.email}
                        error={touched.email ? errors.email : undefined}
                        onChange={(v) => set('email', v)}
                        onBlur={() => blur('email')}
                      />
                      <Field
                        label="Phone Number"
                        required
                        value={fields.phone}
                        error={touched.phone ? errors.phone : undefined}
                        onChange={(v) => set('phone', v)}
                        onBlur={() => blur('phone')}
                      />
                    </div>

                    <div className={cn('grid gap-4', !prefilledProduct && 'sm:grid-cols-2')}>
                      {!prefilledProduct && (
                        <Field
                          label="Product Name"
                          required
                          value={fields.productName}
                          error={touched.productName ? errors.productName : undefined}
                          onChange={(v) => set('productName', v)}
                          onBlur={() => blur('productName')}
                          placeholder="e.g. Passenger elevator"
                        />
                      )}
                      <Field
                        label="Requested Quantity"
                        required
                        value={fields.quantity}
                        error={touched.quantity ? errors.quantity : undefined}
                        onChange={(v) => set('quantity', v)}
                        onBlur={() => blur('quantity')}
                        placeholder="e.g. 2 units / 150 m²"
                      />
                    </div>

                    <CategoryMultiSelect
                      id="quotation-category"
                      selected={fields.productInterest}
                      onChange={(next) => set('productInterest', next)}
                      onBlur={() => blur('productInterest')}
                      error={touched.productInterest ? errors.productInterest : undefined}
                    />

                    <div>
                      <label
                        htmlFor="quotation-message"
                        className="mb-1.5 block text-[0.875rem] font-medium text-ink"
                      >
                        Message / Additional Requirements
                      </label>
                      <textarea
                        id="quotation-message"
                        rows={3}
                        value={fields.message}
                        onChange={(e) => set('message', e.target.value)}
                        className="w-full rounded-[12px] border border-border bg-surface px-4 py-3 text-[1rem] outline-none transition-colors focus:border-navy"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      disabled={status === 'submitting'}
                    >
                      {status === 'submitting' ? 'Sending…' : 'Submit Quotation Request'}
                    </Button>
                    {submitError && (
                      <p className="text-center text-[0.8125rem] text-error">{submitError}</p>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn(
          'h-12 w-full rounded-[12px] border bg-surface px-4 text-[1rem] outline-none transition-colors placeholder:text-muted/60 focus:border-navy',
          error ? 'border-error/60' : 'border-border',
        )}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 text-[0.75rem] text-error"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
