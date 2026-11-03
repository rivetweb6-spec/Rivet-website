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
  it('accepts PDF files (any case)', () => {
    expect(isAllowedCvFilename('Abel-CV.pdf')).toBe(true);
    expect(isAllowedCvFilename('Abel-CV.PDF')).toBe(true);
  });

  it('rejects Word documents — CVs are PDF only', () => {
    expect(isAllowedCvFilename('Abel-CV.DOCX')).toBe(false);
    expect(isAllowedCvFilename('Abel-CV.doc')).toBe(false);
  });

  it('rejects other file types', () => {
    expect(isAllowedCvFilename('photo.png')).toBe(false);
    expect(isAllowedCvFilename('notes.txt')).toBe(false);
    expect(isAllowedCvFilename('cv.pdf.exe')).toBe(false);
  });
});
