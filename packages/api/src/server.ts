import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { log } from './log.js';

const port = Number.parseInt(process.env['PORT'] ?? '8787', 10);
const host = process.env['HOST'] ?? '0.0.0.0';

const polarOrganizationId = process.env['POLAR_ORGANIZATION_ID'];
const polarBenefitId = process.env['POLAR_BENEFIT_ID'];
const polarApiBase = process.env['POLAR_API_BASE'];
const polarAccessToken = process.env['POLAR_ACCESS_TOKEN'];
const polarProductId = process.env['POLAR_PRODUCT_ID'];
const polarSuccessUrl = process.env['POLAR_SUCCESS_URL'];
const polarWebhookSecret = process.env['POLAR_WEBHOOK_SECRET'];
const polarServerEnv = process.env['POLAR_SERVER'];
const polarServer: 'production' | 'sandbox' | undefined =
  polarServerEnv === 'sandbox' || polarServerEnv === 'production' ? polarServerEnv : undefined;

const app = createApp({
  rateLimit: {
    windowMs: 60_000,
    max: Number.parseInt(process.env['RATE_LIMIT_PER_MIN'] ?? '120', 10),
  },
  cache: {
    max: Number.parseInt(process.env['PNG_CACHE_SIZE'] ?? '500', 10),
  },
  trustProxy: process.env['TRUST_PROXY'] === '1',
  ...(polarOrganizationId ? { polarOrganizationId } : {}),
  ...(polarBenefitId ? { polarBenefitId } : {}),
  ...(polarApiBase ? { polarApiBase } : {}),
  ...(polarAccessToken ? { polarAccessToken } : {}),
  ...(polarProductId ? { polarProductId } : {}),
  ...(polarSuccessUrl ? { polarSuccessUrl } : {}),
  ...(polarWebhookSecret ? { polarWebhookSecret } : {}),
  ...(polarServer ? { polarServer } : {}),
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
