'use client';

import * as React from 'react';
import { Upload, X } from 'lucide-react';
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

function parseUrls(value: string): string[] {
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

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
  const [dragOver, setDragOver] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const sessionUploads = React.useRef(new Set<string>());
  const pendingRef = React.useRef<string[]>([]);
  pendingRef.current = pending;

  React.useEffect(
    () => () => {
      pendingRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const handleFiles = async (list: FileList | File[] | null) => {
    if (!list || (Array.isArray(list) ? list.length === 0 : list.length === 0)) return;
    const files = Array.from(list).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      const msg = 'Please choose an image file (JPEG, PNG, WebP, GIF, or AVIF).';
      setLocalError(msg);
      onError?.(msg);
      return;
    }

    setLocalError(null);
    const blobs = files.map((f) => URL.createObjectURL(f));
    setPending(blobs);
    setUploading(true);
    try {
      const { images } = await adminApi.uploads.upload(multiple ? files : files.slice(0, 1));
      const urls = images.map((i) => i.url).filter(Boolean);
      urls.forEach((url) => sessionUploads.current.add(url));
      if (multiple) {
        onChange([...parseUrls(value), ...urls].join('\n'));
      } else {
        const next = urls[0] ?? '';
        const prev = value.trim();
        if (prev && prev !== next && sessionUploads.current.has(prev)) {
          sessionUploads.current.delete(prev);
          void adminApi.uploads.remove(prev).catch(() => undefined);
        }
        onChange(next);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setLocalError(msg);
      onError?.(msg);
    } finally {
      blobs.forEach((url) => URL.revokeObjectURL(url));
      setPending([]);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeUrl = (url: string) => {
    onChange(parseUrls(value).filter((item) => item !== url).join('\n'));
    if (sessionUploads.current.has(url)) {
      sessionUploads.current.delete(url);
      void adminApi.uploads.remove(url).catch(() => undefined);
    }
  };

  const stored = parseUrls(value);
  const previews = pending.length > 0 ? pending : stored;

  return (
    <div className={cn('space-y-3', className)}>
      <span className="block text-[0.8125rem] font-medium text-ink">{label}</span>

      {previews.length > 0 && (
        <div className={cn('flex flex-wrap gap-2', multiple && 'mb-1')}>
          {previews.map((url) => (
            <div
              key={url}
              className={cn(
                'relative overflow-hidden rounded-[8px] border border-border bg-bg',
                multiple ? 'h-20 w-20' : 'h-36 w-full max-w-xs',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              {!pending.includes(url) && (
                <button
                  type="button"
                  onClick={() => removeUrl(url)}
                  className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-navy/80 text-white hover:bg-error"
                  aria-label="Remove image"
                >
                  <X size={12} strokeWidth={2} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed px-4 py-6 transition-colors',
          dragOver ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50 hover:bg-bg/50',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        <Upload size={20} className="text-muted" strokeWidth={1.5} />
        <span className="text-[0.8125rem] text-muted">
          {uploading
            ? 'Uploading…'
            : stored.length > 0 && !multiple
              ? 'Replace image from computer'
              : 'Choose image from computer or drop here'}
        </span>
        <span className="text-[0.75rem] text-muted/80">JPEG, PNG, WebP, GIF, AVIF · max 8 MB</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          multiple={multiple}
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </label>

      {localError && <p className="text-[0.8125rem] text-error">{localError}</p>}

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
            type="text"
            inputMode="url"
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
