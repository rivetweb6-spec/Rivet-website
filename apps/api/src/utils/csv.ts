function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  if (rows.length === 0) return columns ? columns.join(',') : '';
  const cols = columns ?? Object.keys(rows[0]!);
  const header = cols.join(',');
  const body = rows
    .map((row) => cols.map((c) => escapeCell(row[c])).join(','))
    .join('\n');
  return `${header}\n${body}`;
}
