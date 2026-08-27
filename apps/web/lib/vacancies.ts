const CV_FILENAME = /\.(pdf|docx?)$/i;

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isAllowedCvFilename(name: string): boolean {
  return CV_FILENAME.test(name.trim());
}

export function formatDeadline(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function daysUntilDeadline(iso: string) {
  const end = new Date(iso).getTime();
  return Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
}
