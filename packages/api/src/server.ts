import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { log } from './log.js';

const port = Number.parseInt(process.env['PORT'] ?? '8787', 10);
const host = process.env['HOST'] ?? '0.0.0.0';

const app = createApp({
  rateLimit: {
    windowMs: 60_000,
    max: Number.parseInt(process.env['RATE_LIMIT_PER_MIN'] ?? '120', 10),
  },
  cache: {
    max: Number.parseInt(process.env['PNG_CACHE_SIZE'] ?? '500', 10),
  },
  trustProxy: process.env['TRUST_PROXY'] === '1',
});

const server = serve({ fetch: app.fetch, port, hostname: host }, ({ port: p }) => {
  log.info({ port: p, host, pid: process.pid }, 'navii api listening');
});

function shutdown(signal: string) {
  log.info({ signal }, 'shutting down');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  log.error({ err: err.message, stack: err.stack }, 'uncaught exception');
});
process.on('unhandledRejection', (reason) => {
  log.error({ reason: String(reason) }, 'unhandled rejection');
});
