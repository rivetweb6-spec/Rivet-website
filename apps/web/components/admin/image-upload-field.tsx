'use client';

import * as React from 'react';
import { Upload } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { cn } from '@/lib/utils';

type ImageUploadFieldProps = {
  label: string;
  /** Single URL or newline-separated URLs when `multiple` is true. */
  value: string;
  onChange: (value: string) => void;
  multiple?: boolean;
  urlLabel?: string;
  urlPlaceholder?: string;
  rows?: number;
  onError?: (message: string) => void;
  className?: string;
};

export function ImageUploadField({
  label,
  value,
  onChange,
  multiple = false,
  urlLabel,
  urlPlaceholder,
  rows = multiple ? 3 : 1,
  onError,
  className,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const { images } = await adminApi.uploads.upload(Array.from(files));
      const urls = images.map((i) => i.url);
      if (multiple) {
        const existing = value
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
        onChange([...urls, ...existing].join('\n'));
      } else {
        onChange(urls[0] ?? '');
      }
    } catch (err) {
      onError?.(
        err instanceof Error
          ? `${err.message} — paste an image URL instead if Cloudinary is not configured.`
          : 'Upload failed',
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const previews = value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className={cn('space-y-3', className)}>
      <span className="block text-[0.8125rem] font-medium text-ink">{label}</span>

      {previews.length > 0 && (
        <div className={cn('flex flex-wrap gap-2', multiple && 'mb-1')}>
          {previews.map((url) => (
            <div
              key={url}
              className="relative h-16 w-16 overflow-hidden rounded-[8px] border border-border bg-bg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <label
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-border px-4 py-6 transition-colors',
          'hover:border-gold/50 hover:bg-bg/50',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        <Upload size={20} className="text-muted" strokeWidth={1.5} />
        <span className="text-[0.8125rem] text-muted">
          {uploading ? 'Uploading…' : 'Choose image from storage'}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="sr-only"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[0.75rem] text-muted">
          {urlLabel ?? (multiple ? 'Or paste image URLs (one per line)' : 'Or paste image URL')}
        </span>
        {multiple ? (
          <textarea
            rows={rows}
            value={value}
            placeholder={urlPlaceholder ?? 'https://…'}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-[12px] border border-border bg-surface px-3 py-2.5 text-[0.9375rem] outline-none focus:border-navy"
          />
        ) : (
          <input
            type="url"
            value={value}
            placeholder={urlPlaceholder ?? 'https://…'}
            onChange={(e) => onChange(e.target.value)}
            className="h-11 w-full rounded-[12px] border border-border bg-surface px-3 text-[0.9375rem] outline-none focus:border-navy"
          />
        )}
      </label>
    </div>
  );
}
