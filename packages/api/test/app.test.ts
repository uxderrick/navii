import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';

const app = createApp();

async function get(path: string): Promise<Response> {
  return app.fetch(new Request(`http://test${path}`));
}

describe('api', () => {
  it('GET / returns metadata', async () => {
    const res = await get('/');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ name: 'navii' });
  });

  it('GET /avatar/:seed returns SVG', async () => {
    const res = await get('/avatar/alice');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('image/svg+xml');
    const body = await res.text();
    expect(body.startsWith('<svg')).toBe(true);
  });

  it('strips .svg extension from seed', async () => {
    const a = await (await get('/avatar/alice')).text();
    const b = await (await get('/avatar/alice.svg')).text();
    expect(a).toBe(b);
  });

  it('respects size param within bounds', async () => {
    const res = await get('/avatar/alice?size=256');
    const body = await res.text();
    expect(body).toContain('width="256"');
  });

  it('clamps oversized size', async () => {
    const res = await get('/avatar/alice?size=99999');
    const body = await res.text();
    expect(body).toContain('width="1024"');
  });

  it('honors palette query', async () => {
    const a = await (await get('/avatar/x?palette=mint')).text();
    const b = await (await get('/avatar/x?palette=rose')).text();
    expect(a).not.toBe(b);
  });

  it('is byte-identical for same seed + params', async () => {
    const a = await (await get('/avatar/alice?size=64')).text();
    const b = await (await get('/avatar/alice?size=64')).text();
    expect(a).toBe(b);
  });

  it('GET /avatar/:seed.png returns PNG bytes', async () => {
    const res = await get('/avatar/alice.png?size=64');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
    const buf = new Uint8Array(await res.arrayBuffer());
    // PNG magic: 89 50 4E 47 0D 0A 1A 0A
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50);
    expect(buf[2]).toBe(0x4e);
    expect(buf[3]).toBe(0x47);
  });

  it('PNG ignores animated flag', async () => {
    // animated would only affect SVG; PNG must still raster successfully
    const res = await get('/avatar/alice.png?animated=1');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
  });

  it('GET /healthz returns ok', async () => {
    const res = await get('/healthz');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true });
  });
});

import { createApp } from '../src/app.js';

describe('rate limit', () => {
  it('emits 429 after max requests in window', async () => {
    const limited = createApp({
      rateLimit: { windowMs: 60_000, max: 3 },
      trustProxy: true,
    });
    const send = () =>
      limited.fetch(
        new Request('http://test/avatar/alice', { headers: { 'x-forwarded-for': '1.2.3.4' } }),
      );
    expect((await send()).status).toBe(200);
    expect((await send()).status).toBe(200);
    expect((await send()).status).toBe(200);
    const blocked = await send();
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('retry-after')).toBeTruthy();
    expect(blocked.headers.get('x-ratelimit-limit')).toBe('3');
  });

  it('isolates buckets per IP', async () => {
    const limited = createApp({
      rateLimit: { windowMs: 60_000, max: 1 },
      trustProxy: true,
    });
    const a = await limited.fetch(
      new Request('http://test/avatar/a', { headers: { 'x-forwarded-for': '1.1.1.1' } }),
    );
    const b = await limited.fetch(
      new Request('http://test/avatar/b', { headers: { 'x-forwarded-for': '2.2.2.2' } }),
    );
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
  });
});

describe('png cache', () => {
  it('serves repeat PNG requests from cache (smoke)', async () => {
    const cached = createApp({ cache: { max: 16 } });
    const url = 'http://test/avatar/zzz.png?size=64';
    const a = await (await cached.fetch(new Request(url))).arrayBuffer();
    const b = await (await cached.fetch(new Request(url))).arrayBuffer();
    expect(a.byteLength).toBe(b.byteLength);
  });
});
