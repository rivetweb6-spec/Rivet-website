import './instrument.js';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { ensureAdminUser } from './bootstrap/ensure-admin.js';
import { ensureUploadsDir } from './config/storage.js';

const app = createApp();
void ensureUploadsDir().catch((err) => {
  console.error('Failed to create uploads directory:', err);
});

const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`RIVET API listening on http://0.0.0.0:${env.PORT} (${env.NODE_ENV})`);
  console.log(`  Local:   http://localhost:${env.PORT}`);
  console.log(`  Network: use your LAN IP, e.g. http://192.168.x.x:${env.PORT}`);
  void ensureAdminUser().catch((err) => {
    console.error('Failed to ensure admin user exists:', err);
  });
});

const shutdown = () => {
  server.close(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
