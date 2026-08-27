import { badRequest } from './http.js';

/** Interpret YYYY-MM-DD as end of that day in Ethiopia (UTC+3). */
export function parseDeadline(raw: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
  if (dateOnly) {
    return new Date(`${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}T23:59:59.999+03:00`);
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) throw badRequest('Invalid application deadline');
  return parsed;
}
