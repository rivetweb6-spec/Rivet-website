import { describe, it, expect } from 'vitest';
import { parseDeadline } from './deadline.js';

describe('parseDeadline', () => {
  it('treats a calendar date as end of day in Ethiopia', () => {
    const d = parseDeadline('2026-08-20');
    expect(d.toISOString()).toBe('2026-08-20T20:59:59.999Z');
  });

  it('accepts a full ISO timestamp', () => {
    const d = parseDeadline('2026-09-01T12:00:00.000Z');
    expect(d.toISOString()).toBe('2026-09-01T12:00:00.000Z');
  });
});
