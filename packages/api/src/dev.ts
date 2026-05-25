import { serve } from '@hono/node-server';
import { createApp } from './app.js';

const port = Number.parseInt(process.env['PORT'] ?? '8787', 10);
const gumroadProductPermalink = process.env['GUMROAD_PRODUCT_PERMALINK'];
const app = createApp({
  cache: { max: 200 },
  ...(gumroadProductPermalink ? { gumroadProductPermalink } : {}),
});

serve({ fetch: app.fetch, port }, ({ port: p }) => {
  console.log(`navii api listening on http://localhost:${p}`);
  console.log(`try: http://localhost:${p}/avatar/alice?size=128`);
});
