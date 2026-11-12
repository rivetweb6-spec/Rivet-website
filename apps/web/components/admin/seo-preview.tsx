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
        <p className="mb-2 text-3xs font-medium uppercase tracking-wider text-muted">
          Google preview
        </p>
        <div className="rounded-lg border border-border bg-white p-4">
          <p className="truncate text-2xs text-[#202124]">
            {SITE_HOST}
            {urlPath}
          </p>
          <p className="mt-1 text-lg leading-snug text-[#1a0dab]">{displayTitle || 'Page title'}</p>
          <p className="mt-1 text-xs leading-snug text-[#4d5156]">
            {displayDesc || 'Meta description will appear here.'}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-3xs font-medium uppercase tracking-wider text-muted">
          Social preview
        </p>
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <div
            className="aspect-[1.91/1] bg-bg bg-cover bg-center"
            style={image ? { backgroundImage: `url(${image})` } : undefined}
          >
            {!image && (
              <div className="grid h-full place-items-center text-2xs text-muted">
                Social image
              </div>
            )}
          </div>
          <div className="border-t border-border p-3">
            <p className="text-3xs uppercase tracking-wider text-muted">{SITE_HOST}</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-ink">
              {ogTitle || 'Share title'}
            </p>
            <p className="mt-1 line-clamp-2 text-2xs text-muted">
              {ogDescription || 'Share description'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
