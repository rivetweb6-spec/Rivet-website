import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgres@localhost:5432/rivet?schema=public'),
  JWT_ACCESS_SECRET: z.string().default('dev-access-secret'),
  JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret'),
  JWT_ACCESS_TTL: z.coerce.number().default(900),
  JWT_REFRESH_TTL: z.coerce.number().default(60 * 60 * 24 * 7),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
});

const parsed = schema.parse(process.env);

if (parsed.NODE_ENV === 'production') {
  z.object({
    DATABASE_URL: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    CORS_ORIGIN: z.string().min(1),
  }).parse(parsed);
}

export const env = parsed;
export const isProd = env.NODE_ENV === 'production';
