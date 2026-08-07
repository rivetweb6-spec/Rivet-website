'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
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

export function QuotationForm({
  defaultInterest,
  defaultProductName,
}: {
  defaultInterest?: string;
  defaultProductName?: string;
}) {
  const [fields, setFields] = React.useState<Fields>({
    ...empty,
    productInterest: parseProductInterests(defaultInterest),
    productName: defaultProductName ?? '',
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success'>('idle');
  const [submitError, setSubmitError] = React.useState<string | null>(null);

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
        message: fields.message.trim() || undefined,
      });
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
        <h2 className="mt-6 text-[1.75rem]">Request received</h2>
        <p className="mt-3 text-muted">
          Thank you. A RIVET specialist will contact you shortly with your quotation.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="space-y-4 rounded-[20px] border border-border bg-surface p-6 md:p-8"
    >
      <Field
        label="Full Name"
        required
        value={fields.fullName}
        error={touched.fullName ? errors.fullName : undefined}
        onChange={(v) => set('fullName', v)}
        onBlur={() => blur('fullName')}
      />
      <Field label="Company Name" value={fields.company} onChange={(v) => set('company', v)} />
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Product Name"
          required
          value={fields.productName}
          error={touched.productName ? errors.productName : undefined}
          onChange={(v) => set('productName', v)}
          onBlur={() => blur('productName')}
          placeholder="e.g. Passenger elevator"
        />
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
        id="page-quotation-category"
        selected={fields.productInterest}
        onChange={(next) => set('productInterest', next)}
        onBlur={() => blur('productInterest')}
        error={touched.productInterest ? errors.productInterest : undefined}
      />
      <div>
        <label htmlFor="page-quotation-message" className="mb-1.5 block text-[0.875rem] font-medium">
          Message / Additional Requirements
        </label>
        <textarea
          id="page-quotation-message"
          rows={4}
          value={fields.message}
          onChange={(e) => set('message', e.target.value)}
          className="w-full rounded-[12px] border border-border bg-surface px-4 py-3 text-[1rem] outline-none focus:border-navy"
        />
      </div>
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Submit Quotation Request'}
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
          'h-12 w-full rounded-[12px] border bg-surface px-4 text-[1rem] outline-none placeholder:text-muted/60 focus:border-navy',
          error ? 'border-error/60' : 'border-border',
        )}
      />
      {error && <p className="mt-1.5 text-[0.75rem] text-error">{error}</p>}
    </div>
  );
}
