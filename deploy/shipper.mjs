/**
 * Tail Caddy's JSON access log and ship each request to Umami's /api/send
 * endpoint as a pageview event. Lets API traffic show up in the analytics
 * dashboard alongside landing/docs/builder page views.
 *
 * Operational notes
 * - Position is tracked in-memory and seeded to EOF on first start, so the
 *   shipper skips backlog and starts forward. No duplicates across restarts;
 *   we just miss what happened while the process was down.
 * - Log rotation is detected via inode change → position resets to 0.
 * - Errors are logged but never crash the process; the loop keeps going.
 */

import { stat, open } from 'node:fs/promises';

const FILE = process.env.LOG_FILE ?? '/logs/navii-api.log';
const ENDPOINT = process.env.UMAMI_URL ?? 'https://analytics.uxderrick.com/api/send';
const WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;
const HOSTNAME = process.env.HOSTNAME_OVERRIDE ?? 'navii-api.uxderrick.com';
const POLL_MS = Number(process.env.POLL_MS ?? 2000);

if (!WEBSITE_ID) {
  console.error('UMAMI_WEBSITE_ID is required');
  process.exit(1);
}

let inode = null;
let position = 0;
let booted = false;

async function tick() {
  let st;
  try {
    st = await stat(FILE);
  } catch {
    return;
  }

  if (st.ino !== inode) {
    inode = st.ino;
    position = booted ? 0 : st.size;
    booted = true;
    console.log(`[shipper] tracking ${FILE} inode=${inode} from=${position}`);
  }

  if (st.size <= position) return;

  const fh = await open(FILE, 'r');
  const len = st.size - position;
  const buf = Buffer.alloc(len);
  try {
    await fh.read(buf, 0, len, position);
  } finally {
    await fh.close();
  }
  position = st.size;

  const text = buf.toString('utf8');
  const lines = text.split('\n').filter((l) => l.trim().length > 0);

  for (const line of lines) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch (e) {
      console.error('[shipper] bad json:', e.message);
      continue;
    }
    await ship(entry).catch((e) => console.error('[shipper] post failed:', e.message));
  }
}

async function ship(e) {
  const req = e.request ?? {};
  const headers = req.headers ?? {};
  const ua = headers['User-Agent']?.[0] ?? '';
  const ref = headers['Referer']?.[0] ?? '';
  const accept = headers['Accept-Language']?.[0] ?? '';

  if (req.uri === '/healthz') return;

  const payload = {
    website: WEBSITE_ID,
    hostname: req.host ?? HOSTNAME,
    url: req.uri ?? '/',
    referrer: ref,
    language: accept,
    title: '',
    data: {
      status: e.status,
      duration_ms: Math.round((e.duration ?? 0) * 1000),
      method: req.method,
      bytes: e.size,
    },
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': ua || 'navii-shipper',
      'X-Forwarded-For': req.client_ip ?? req.remote_ip ?? '',
    },
    body: JSON.stringify({ type: 'event', payload }),
  });

  if (!res.ok) {
    console.error('[shipper] umami responded', res.status, await res.text().catch(() => ''));
  }
}

console.log(`[shipper] starting; file=${FILE} endpoint=${ENDPOINT} poll=${POLL_MS}ms`);

setInterval(() => {
  tick().catch((e) => console.error('[shipper] tick error:', e.message));
}, POLL_MS);
