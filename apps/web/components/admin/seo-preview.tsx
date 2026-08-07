'use client';

const SITE_HOST = 'rivet.com';

export function SeoPreview({
  title,
  description,
  path,
  ogTitle,
  ogDescription,
  image,
}: {
  title: string;
  description: string;
  path: string;
  ogTitle: string;
  ogDescription: string;
  image?: string;
}) {
  const displayTitle = title.length > 60 ? `${title.slice(0, 57)}…` : title;
  const displayDesc = description.length > 160 ? `${description.slice(0, 157)}…` : description;
  const urlPath = path.startsWith('/') ? path : `/${path}`;

  return (
    <div className="space-y-4 border-t border-divider pt-4">
      <div>
        <p className="mb-2 text-[0.75rem] font-medium uppercase tracking-wider text-muted">
          Google preview
        </p>
        <div className="rounded-[8px] border border-border bg-white p-4">
          <p className="truncate text-[0.8125rem] text-[#202124]">
            {SITE_HOST}
            {urlPath}
          </p>
          <p className="mt-1 text-[1.125rem] leading-snug text-[#1a0dab]">{displayTitle || 'Page title'}</p>
          <p className="mt-1 text-[0.875rem] leading-snug text-[#4d5156]">
            {displayDesc || 'Meta description will appear here.'}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[0.75rem] font-medium uppercase tracking-wider text-muted">
          Social preview
        </p>
        <div className="overflow-hidden rounded-[8px] border border-border bg-white">
          <div
            className="aspect-[1.91/1] bg-bg bg-cover bg-center"
            style={image ? { backgroundImage: `url(${image})` } : undefined}
          >
            {!image && (
              <div className="grid h-full place-items-center text-[0.8125rem] text-muted">
                Social image
              </div>
            )}
          </div>
          <div className="border-t border-border p-3">
            <p className="text-[0.6875rem] uppercase tracking-wider text-muted">{SITE_HOST}</p>
            <p className="mt-1 line-clamp-2 text-[0.9375rem] font-semibold text-ink">
              {ogTitle || 'Share title'}
            </p>
            <p className="mt-1 line-clamp-2 text-[0.8125rem] text-muted">
              {ogDescription || 'Share description'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
