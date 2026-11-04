import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ApiError } from './http.js';
import {
  FORM_LIMITS,
  emailField,
  optionalText,
  parsePublicForm,
  requiredText,
} from './public-forms.js';

const schema = z.object({
  name: requiredText('Name', FORM_LIMITS.name),
  email: emailField(),
  message: optionalText('Message', FORM_LIMITS.message),
});

function errorFrom(body: unknown): ApiError {
  try {
    parsePublicForm(schema, body);
  } catch (err) {
    return err as ApiError;
  }
  throw new Error('expected parsePublicForm to throw');
}

describe('parsePublicForm', () => {
  it('trims values and turns blank optional fields into undefined', () => {
    expect(parsePublicForm(schema, { name: '  Abebe ', email: ' a@b.co ', message: '   ' })).toEqual({
      name: 'Abebe',
      email: 'a@b.co',
      message: undefined,
    });
  });

  it('reports a missing required field by name', () => {
    const err = errorFrom({ email: 'a@b.co' });
    expect(err.status).toBe(400);
    expect(err.message).toBe('Name is required.');
  });

  it('treats whitespace-only required fields as missing', () => {
    expect(errorFrom({ name: '   ', email: 'a@b.co' }).message).toBe('Name is required.');
  });

  it('rejects over-long fields with a readable message', () => {
    const err = errorFrom({ name: 'x', email: 'a@b.co', message: 'y'.repeat(FORM_LIMITS.message + 1) });
    expect(err.message).toBe('Message must be 5,000 characters or fewer.');
  });

  it('accepts a field exactly at the limit', () => {
    expect(() =>
      parsePublicForm(schema, { name: 'n'.repeat(FORM_LIMITS.name), email: 'a@b.co' }),
    ).not.toThrow();
  });

  it('rejects invalid emails', () => {
    expect(errorFrom({ name: 'x', email: 'nope' }).message).toBe('Enter a valid email address.');
  });

  it('rejects non-object bodies', () => {
    expect(errorFrom(undefined).status).toBe(400);
  });

  it('keeps the per-field breakdown in details', () => {
    const err = errorFrom({ email: 'nope' });
    expect(err.details).toEqual(
      expect.objectContaining({ fieldErrors: expect.objectContaining({ name: expect.any(Array), email: expect.any(Array) }) }),
    );
  });
});
