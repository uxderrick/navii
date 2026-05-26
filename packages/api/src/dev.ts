import { serve } from '@hono/node-server';
import { createApp } from './app.js';

const port = Number.parseInt(process.env['PORT'] ?? '8787', 10);
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
  cache: { max: 200 },
  ...(polarOrganizationId ? { polarOrganizationId } : {}),
  ...(polarBenefitId ? { polarBenefitId } : {}),
  ...(polarApiBase ? { polarApiBase } : {}),
  ...(polarAccessToken ? { polarAccessToken } : {}),
  ...(polarProductId ? { polarProductId } : {}),
  ...(polarSuccessUrl ? { polarSuccessUrl } : {}),
  ...(polarWebhookSecret ? { polarWebhookSecret } : {}),
  ...(polarServer ? { polarServer } : {}),
});

serve({ fetch: app.fetch, port }, ({ port: p }) => {
  console.log(`navii api listening on http://localhost:${p}`);
  console.log(`try: http://localhost:${p}/avatar/alice?size=128`);
});
