import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import routes from './routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(
    helmet({
      // Uploaded images are loaded by the Next.js origin (Vercel / localhost:3000).
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const allowedOrigins = env.CORS_ORIGIN.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        // Non-browser / same-origin proxied requests often omit Origin.
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Allow Vercel preview deploys when a production *.vercel.app origin is listed.
        const vercelAllowed = allowedOrigins.some(
          (o) => o.endsWith('.vercel.app') && origin.endsWith('.vercel.app'),
        );
        if (vercelAllowed) return callback(null, true);
        callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(pinoHttp({ level: env.NODE_ENV === 'development' ? 'info' : 'warn' }));

  app.get('/', (_req, res) => {
    res.json({
      name: 'RIVET API',
      status: 'ok',
      health: '/api/health',
      docs: 'All routes are under /api/*',
      endpoints: [
        'GET  /api/health',
        'POST /api/auth/login',
        'GET  /api/categories',
        'GET  /api/products',
        'GET  /api/services',
        'GET  /api/news',
        'GET  /api/company',
        'GET  /api/certificates',
        'GET  /api/team',
        'GET  /api/gallery',
        'GET  /api/vacancies',
        'POST /api/vacancies/:slug/apply',
        'GET  /api/contact-info',
        'POST /api/quotation-requests',
        'POST /api/contact',
      ],
    });
  });

  app.use(
    '/api',
    rateLimit({
      windowMs: 60_000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.method === 'GET' && req.path.includes('/uploads/files/'),
    }),
  );

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
