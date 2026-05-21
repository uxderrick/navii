import type { MiddlewareHandler } from 'hono';

/**
 * Sliding-window rate limit per IP. In-memory — fine for single-instance Hetzner.
 * For multi-replica scale, swap the Map for Redis.
 *
 * `trustProxy` reads X-Forwarded-For (first value). Only enable behind a
 * reverse proxy you control (Caddy/Nginx), never behind raw CDN.
 */
export interface RateLimitOptions {
  windowMs: number;
  max: number;
  trustProxy?: boolean;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export function rateLimit(opts: RateLimitOptions): MiddlewareHandler {
  const buckets = new Map<string, Bucket>();

  // Prune stale buckets every minute so memory doesn't grow unbounded under
  // sparse-traffic-many-IPs conditions.
  setInterval(() => {
    const now = Date.now();
    for (const [ip, b] of buckets) {
      if (b.resetAt < now) buckets.delete(ip);
    }
  }, 60_000).unref();

  return async (c, next) => {
    const ip = clientIp(c, opts.trustProxy === true);
    const now = Date.now();
    let b = buckets.get(ip);

    if (!b || b.resetAt < now) {
      b = { count: 0, resetAt: now + opts.windowMs };
      buckets.set(ip, b);
    }
    b.count++;

    const remaining = Math.max(0, opts.max - b.count);
    c.header('x-ratelimit-limit', String(opts.max));
    c.header('x-ratelimit-remaining', String(remaining));
    c.header('x-ratelimit-reset', String(Math.floor(b.resetAt / 1000)));

    if (b.count > opts.max) {
      const retryAfter = Math.max(1, Math.ceil((b.resetAt - now) / 1000));
      c.header('retry-after', String(retryAfter));
      return c.text('Rate limit exceeded', 429);
    }

    await next();
  };
}

function clientIp(c: { req: { header: (k: string) => string | undefined; raw: Request } }, trustProxy: boolean): string {
  if (trustProxy) {
    const xff = c.req.header('x-forwarded-for');
    if (xff) {
      const first = xff.split(',')[0]?.trim();
      if (first) return first;
    }
    const real = c.req.header('x-real-ip');
    if (real) return real.trim();
  }
  // Fallback: best-effort from raw request — node-server attaches the socket
  // info on req, but Hono normalizes away. Use a sentinel so all untrusted
  // requests bucket together rather than crash.
  return 'unknown';
}
