import sanitizeHtml from 'sanitize-html';

/**
 * Renders admin-authored rich text (TipTap output) as HTML.
 *
 * Everything that reaches this component was typed into the CMS, but an author
 * can paste arbitrary markup and the editor stores it verbatim, so the HTML is
 * run through an allowlist before it is injected. The allowlist covers what the
 * editor toolbar can actually produce; anything else — script tags, event
 * handlers, iframes, javascript: URLs — is dropped.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup', 'mark',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'span', 'div',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan', 'scope'],
    '*': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowProtocolRelative: false,
  // Outbound links from CMS copy should not leak the referrer or gain
  // window.opener access to this origin.
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: attribs.target === '_blank'
        ? { ...attribs, rel: 'noopener noreferrer' }
        : attribs,
    }),
  },
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}

export function RichText({
  html,
  className,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  if (!html) return null;
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }} />
  );
}
