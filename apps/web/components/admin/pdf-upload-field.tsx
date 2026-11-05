'use client';

import * as React from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { cn } from '@/lib/utils';

type PdfUploadFieldProps = {
  label: string;
  /** Stored PDF URL, or '' when none. */
  value: string;
  onChange: (value: string) => void;
  onError?: (message: string) => void;
  className?: string;
};

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function displayName(url: string): string {
  try {
    const path = new URL(url, 'http://local').pathname;
    return decodeURIComponent(path.split('/').pop() || url);
  } catch {
    return url;
  }
}

export function PdfUploadField({ label, value, onChange, onError, className }: PdfUploadFieldProps) {
  const [uploading, setUploading] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  /** PDFs uploaded in this session — safe to delete from storage if replaced/removed. */
  const sessionUploads = React.useRef(new Set<string>());

  const fail = (msg: string) => {
    setLocalError(msg);
    onError?.(msg);
  };

  const discardIfSessionUpload = (url: string) => {
    if (url && sessionUploads.current.has(url)) {
      sessionUploads.current.delete(url);
      void adminApi.uploads.remove(url).catch(() => undefined);
    }
  };

  const handleFiles = async (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    if (!isPdf(file)) {
      fail('Please choose a PDF file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      fail('PDF is too large. Maximum size is 8 MB.');
      return;
    }
    setLocalError(null);
    setUploading(true);
    try {
      const { document } = await adminApi.uploads.uploadDocument(file);
      sessionUploads.current.add(document.url);
      discardIfSessionUpload(value.trim());
      setFileName(document.name);
      onChange(document.url);
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = () => {
    discardIfSessionUpload(value.trim());
    setFileName(null);
    onChange('');
  };

  const current = value.trim();

  return (
    <fieldset className={cn('min-w-0 space-y-3', className)}>
      <legend className="mb-3 block text-[0.8125rem] font-medium text-ink">{label}</legend>

      {current && (
        <div className="flex items-center gap-3 rounded-[12px] border border-border bg-bg px-3 py-2.5">
          <FileText size={20} className="shrink-0 text-navy" strokeWidth={1.5} />
          <a
            href={current}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-[0.875rem] text-navy hover:text-gold"
          >
            {fileName ?? displayName(current)}
          </a>
          <button
            type="button"
            onClick={remove}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted hover:bg-error hover:text-white"
            aria-label="Remove PDF"
          >
            <X size={14} strokeWidth={2} />
          </button>
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
          'focus-within:ring-2 focus-within:ring-gold focus-within:ring-offset-2',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        <Upload size={20} className="text-muted" strokeWidth={1.5} />
        <span className="text-[0.8125rem] text-muted">
          {uploading
            ? 'Uploading…'
            : current
              ? 'Replace PDF from computer'
              : 'Choose PDF from computer or drop here'}
        </span>
        <span className="text-[0.75rem] text-muted/80">PDF only · max 8 MB</span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </label>

      {localError && (
        <p role="alert" className="text-[0.8125rem] text-error">
          {localError}
        </p>
      )}
    </fieldset>
  );
}
