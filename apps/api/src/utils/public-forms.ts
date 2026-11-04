import rateLimit from 'express-rate-limit';
import { z, type ZodTypeAny } from 'zod';
import { badRequest } from './http.js';

/**
 * Shared rules for forms anyone on the internet can submit (quotation,
 * contact, job application). Every field is trimmed and length-capped so a bot
 * cannot store megabytes per row, and every rule carries a message a visitor
 * can act on — the first one is returned as the error shown in the form.
 */
export const FORM_LIMITS = {
  name: 120,
  company: 160,
  email: 254,
  phone: 40,
  productInterest: 500,
  productName: 200,
  quantity: 60,
  id: 64,
  message: 5000,
  coverLetter: 8000,
} as const;

const fmt = (n: number) => n.toLocaleString('en-US');

export function requiredText(label: string, max: number) {
  return z
    .string({ required_error: `${label} is required.`, invalid_type_error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${fmt(max)} characters or fewer.`);
}

/** Optional text: blank becomes `undefined`. */
export function optionalText(label: string, max: number) {
  return z
    .string({ invalid_type_error: `${label} must be text.` })
    .trim()
    .max(max, `${label} must be ${fmt(max)} characters or fewer.`)
    .optional()
    .transform((v) => (v ? v : undefined));
}

export function emailField() {
  return z
    .string({ required_error: 'Email is required.', invalid_type_error: 'Email is required.' })
    .trim()
    .min(1, 'Email is required.')
    .max(FORM_LIMITS.email, 'Email address is too long.')
    .email('Enter a valid email address.');
}

/**
 * Parse a public form body. Throws a 400 whose message is the first problem
 * found (already human-readable), with the full field breakdown in `details`.
 */
export function parsePublicForm<S extends ZodTypeAny>(schema: S, body: unknown): z.infer<S> {
  const result = schema.safeParse(body ?? {});
  if (!result.success) {
    const first = result.error.issues[0]?.message ?? 'Please check the form and try again.';
    throw badRequest(first, result.error.flatten());
  }
  return result.data;
}

/**
 * Per-IP limit for public submissions, on top of the global API limiter.
 * Accurate client IPs depend on TRUST_PROXY matching the hosting setup.
 */
export function publicFormLimiter(what: string, max: number, windowMinutes = 15) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: `Too many ${what} from this network. Please try again in ${windowMinutes} minutes.` },
  });
}
