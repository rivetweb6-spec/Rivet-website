import { describe, expect, it } from 'vitest';
import { formatDeadline, isAllowedCvFilename, stripHtml } from './vacancies';

describe('stripHtml', () => {
  it('removes tags and decodes common entities', () => {
    expect(stripHtml('<p>Elevators &amp; granite</p>')).toBe('Elevators & granite');
  });

  it('collapses leftover whitespace', () => {
    expect(stripHtml('<ul><li>Site work</li><li>Drawings</li></ul>')).toBe('Site work Drawings');
  });
});

describe('formatDeadline', () => {
  it('formats an ISO timestamp as a long calendar date', () => {
    const formatted = formatDeadline('2026-12-25T12:00:00.000Z');
    expect(formatted).toContain('December');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('25');
  });
});

describe('isAllowedCvFilename', () => {
  it('accepts PDF and Word documents', () => {
    expect(isAllowedCvFilename('Abel-CV.pdf')).toBe(true);
    expect(isAllowedCvFilename('Abel-CV.DOCX')).toBe(true);
    expect(isAllowedCvFilename('Abel-CV.doc')).toBe(true);
  });

  it('rejects other file types', () => {
    expect(isAllowedCvFilename('photo.png')).toBe(false);
    expect(isAllowedCvFilename('notes.txt')).toBe(false);
    expect(isAllowedCvFilename('cv.pdf.exe')).toBe(false);
  });
});
