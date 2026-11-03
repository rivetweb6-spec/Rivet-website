import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { allowedOrigins, env } from './config/env.js';
import { isAllowedOrigin } from './config/origins.js';
import routes from './routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  // How many proxy hops to trust for req.ip (rate limiting). See TRUST_PROXY.
  app.set('trust proxy', env.TRUST_PROXY);
  app.use(
    helmet({
      // Uploaded images are loaded by the Next.js origin (Vercel / localhost:3000).
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(
    cors({
      origin(origin, callback) {
        // Non-browser / same-origin proxied requests often omit Origin.
        if (!origin) return callback(null, true);
        // Exact matches only — see config/origins.ts for why wildcards are refused.
        callback(null, isAllowedOrigin(allowedOrigins, origin));
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
