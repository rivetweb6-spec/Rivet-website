/** Characters that make Excel / Sheets / LibreOffice treat a cell as a formula. */
const FORMULA_START = /^[=+\-@\t\r]/;

/** Numbers and phone numbers (+251 911 234 567, -12.5) cannot call functions. */
const PLAIN_NUMBER_OR_PHONE = /^[+-]?[\d\s().-]+$/;

/**
 * Exports contain text typed by anonymous visitors (quotation and contact
 * forms, job applications). A value such as `=HYPERLINK("http://evil",…)`
 * would run when an admin opens the file in a spreadsheet, so formula-like
 * cells are prefixed with an apostrophe to force them to plain text
 * (OWASP "CSV injection").
 */
export function neutralizeFormula(value: string): string {
  if (FORMULA_START.test(value) && !PLAIN_NUMBER_OR_PHONE.test(value)) return `'${value}`;
  return value;
}

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = neutralizeFormula(String(value));
  if (/[",\r\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
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
