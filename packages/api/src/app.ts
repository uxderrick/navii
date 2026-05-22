import { Hono } from 'hono';
import { createAvatar, renderGroup, type AvatarOptions, type GroupOptions } from '@navii/core';
import { svgToPng } from './raster.js';
import { rateLimit, type RateLimitOptions } from './middleware/rateLimit.js';
import { LruCache } from './middleware/lruCache.js';
import { log } from './log.js';
import { landingHtml } from './landing.js';
import { ogPng, ogSvg } from './og.js';
import { docsHtml, isDocSlug, defaultDocSlug } from './docs.js';

export interface AppOptions {
  rateLimit?: RateLimitOptions;
  cache?: { max: number };
  trustProxy?: boolean;
}

/**
 * Hono app — portable to Node, Bun, Cloudflare Workers, Deno, Vercel.
 *
 * GET /avatar/:seed[.svg|.png]
 *   ?size=96
 *   &palette=mint
 *   &background=ring|solid|none
 *   &title=Alice
 *   &animated=1
 *
 * Seeds are URL-decoded. Output cached at the edge via Cache-Control.
 * PNG raster results are also cached in-process (expensive op).
 */
export function createApp(options: AppOptions = {}) {
  const app = new Hono();
  const pngCache = new LruCache<string, Uint8Array>(options.cache?.max ?? 500);

  if (options.rateLimit) {
    app.use(
      '/avatar/*',
      rateLimit({ ...options.rateLimit, trustProxy: options.trustProxy === true }),
    );
  }

  app.get('/', (c) => {
    return new Response(landingHtml(), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    });
  });

  app.get('/api', (c) =>
    c.json({
      name: 'navii',
      version: '0.5.0',
      endpoints: {
        avatar: '/avatar/:seed',
        group: '/group?seeds=a,b,c',
        gallery: '/gallery',
        health: '/healthz',
        docs: '/docs',
      },
    }),
  );

  app.get('/docs', (c) => c.redirect(`/docs/${defaultDocSlug()}`, 302));

  app.get('/docs/:slug', (c) => {
    const slug = c.req.param('slug');
    if (!isDocSlug(slug)) {
      return new Response(docsHtml(slug), {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
    return new Response(docsHtml(slug), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    });
  });

  app.get('/group', (c) => {
    const rawSeeds = c.req.query('seeds') ?? '';
    const seeds = rawSeeds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 50);
    if (seeds.length === 0) return c.text('seeds required (comma-separated)', 400);

    const size = clampInt(c.req.query('size'), 16, 256, 64);
    const overlap = clampFloat(c.req.query('overlap'), 0, 0.7, 0.3);
    const maxRaw = c.req.query('max');
    const ring = c.req.query('ring');
    const animated = c.req.query('animated') === '1' || c.req.query('animated') === 'true';

    const tileBg = c.req.query('tileBg');
    const opts: GroupOptions = { size, overlap };
    if (maxRaw) opts.max = clampInt(maxRaw, 1, 50, seeds.length);
    if (ring) opts.ring = ring;
    if (tileBg) opts.tileBg = tileBg;
    if (animated) opts.animated = true;

    const svg = renderGroup(seeds, opts);
    return new Response(svg, {
      status: 200,
      headers: {
        'content-type': 'image/svg+xml; charset=utf-8',
        'cache-control': 'public, max-age=31536000, immutable',
        'access-control-allow-origin': '*',
      },
    });
  });

  app.get('/healthz', (c) => c.json({ ok: true, pngCacheSize: pngCache.size }));

  // ── SEO / icons ──────────────────────────────────────────────────────────

  app.get('/favicon.svg', (c) => {
    const svg = createAvatar('navii', { size: 64 });
    return new Response(svg, {
      status: 200,
      headers: {
        'content-type': 'image/svg+xml; charset=utf-8',
        'cache-control': 'public, max-age=86400, immutable',
      },
    });
  });

  app.get('/favicon.ico', (c) => c.redirect('/favicon.svg', 301));

  app.get('/apple-touch-icon.png', async (c) => {
    const cacheKey = 'apple-touch-icon-180';
    let png = pngCache.get(cacheKey);
    if (!png) {
      try {
        const svg = createAvatar('navii', { size: 180, tileBg: '#0a0a0b' });
        png = await svgToPng(svg, 180);
        pngCache.set(cacheKey, png);
      } catch (err) {
        log.error({ err: (err as Error).message }, 'apple-touch-icon raster failed');
        return c.text('icon unavailable', 501);
      }
    }
    return new Response(png as BodyInit, {
      status: 200,
      headers: {
        'content-type': 'image/png',
        'cache-control': 'public, max-age=86400, immutable',
      },
    });
  });

  app.get('/og.svg', (c) =>
    new Response(ogSvg(), {
      status: 200,
      headers: {
        'content-type': 'image/svg+xml; charset=utf-8',
        'cache-control': 'no-store',
      },
    }),
  );

  app.get('/og.png', async (c) => {
    try {
      const png = await ogPng();
      return new Response(png as BodyInit, {
        status: 200,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=86400, immutable',
          'access-control-allow-origin': '*',
        },
      });
    } catch (err) {
      log.error({ err: (err as Error).message }, 'og.png raster failed');
      return c.text(`OG image unavailable: ${(err as Error).message}`, 501);
    }
  });

  app.get('/robots.txt', (c) => {
    const body = `User-agent: *\nAllow: /\nDisallow: /gallery\n\nSitemap: https://navii.uxderrick.com/sitemap.xml\n`;
    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=86400',
      },
    });
  });

  app.get('/sitemap.xml', (c) => {
    const urls = ['https://navii.uxderrick.com/', 'https://navii.uxderrick.com/#cast', 'https://navii.uxderrick.com/#reference'];
    const body =
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
      `\n</urlset>\n`;
    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=86400',
      },
    });
  });

  app.get('/avatar/:seed{.+}', async (c) => {
    const rawSeed = c.req.param('seed');
    const decoded = decodeURIComponent(rawSeed);
    const wantsPng = /\.png$/i.test(decoded);
    const seed = stripExt(decoded);
    if (!seed) return c.text('seed required', 400);

    const size = clampInt(c.req.query('size'), 16, 1024, 96);
    const paletteId = c.req.query('palette');
    const background = c.req.query('background');
    const title = c.req.query('title');
    const animated = c.req.query('animated') === '1' || c.req.query('animated') === 'true';
    const tileBg = c.req.query('tileBg');

    const avatarOpts: AvatarOptions = { size };
    if (paletteId) avatarOpts.paletteId = paletteId;
    if (background === 'ring' || background === 'solid' || background === 'none') {
      avatarOpts.background = background;
    }
    if (title) avatarOpts.title = title;
    if (animated && !wantsPng) avatarOpts.animated = true;
    if (tileBg) avatarOpts.tileBg = tileBg;

    const svg = createAvatar(seed, avatarOpts);

    if (wantsPng) {
      const cacheKey = canonicalKey(seed, size, paletteId, background, title, tileBg);
      let png = pngCache.get(cacheKey);
      if (!png) {
        try {
          png = await svgToPng(svg, size);
          pngCache.set(cacheKey, png);
        } catch (err) {
          log.error({ err: (err as Error).message }, 'png raster failed');
          return c.text(
            `PNG rasterization unavailable: ${(err as Error).message}. Install @resvg/resvg-js.`,
            501,
          );
        }
      }
      return new Response(png as BodyInit, {
        status: 200,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=31536000, immutable',
          'access-control-allow-origin': '*',
        },
      });
    }

    return new Response(svg, {
      status: 200,
      headers: {
        'content-type': 'image/svg+xml; charset=utf-8',
        'cache-control': 'public, max-age=31536000, immutable',
        'access-control-allow-origin': '*',
      },
    });
  });

  app.get('/gallery', (c) => {
    const count = clampInt(c.req.query('count'), 1, 500, 96);
    const size = clampInt(c.req.query('size'), 16, 512, 96);
    const prefix = c.req.query('prefix') ?? 'user';
    const animated = c.req.query('animated') === '1' || c.req.query('animated') === 'true';
    const seeds = Array.from({ length: count }, (_, i) => `${prefix}-${i}`);
    return c.html(renderGallery(seeds, size, animated));
  });

  return app;
}

function stripExt(s: string): string {
  return s.replace(/\.(svg|png)$/i, '');
}

function clampInt(raw: string | undefined, min: number, max: number, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function clampFloat(raw: string | undefined, min: number, max: number, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function canonicalKey(
  seed: string,
  size: number,
  palette: string | undefined,
  background: string | undefined,
  title: string | undefined,
  tileBg: string | undefined,
): string {
  return `${seed}|s=${size}|p=${palette ?? ''}|b=${background ?? ''}|t=${title ?? ''}|tb=${tileBg ?? ''}`;
}

function renderGallery(seeds: string[], size: number, animated: boolean): string {
  const animQuery = animated ? `&animated=1` : '';
  const tiles = seeds
    .map((s) => {
      const url = `/avatar/${encodeURIComponent(s)}?size=${size}${animQuery}`;
      const label = s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return `<figure><img src="${url}" width="${size}" height="${size}" loading="lazy" alt="${label}" /><figcaption>${label}</figcaption></figure>`;
    })
    .join('');

  const otherMode = animated
    ? `<a style="color:#7dd3fc" href="?count=${seeds.length}&size=${size}">static</a>`
    : `<a style="color:#7dd3fc" href="?count=${seeds.length}&size=${size}&animated=1">animated</a>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Navii gallery</title>
  <style>
    :root { color-scheme: light dark; }
    body { font: 14px/1.4 -apple-system, system-ui, sans-serif; margin: 24px; background: #0b0b0c; color: #e8e8e8; }
    h1 { margin: 0 0 4px; font-weight: 700; }
    p.meta { margin: 0 0 24px; opacity: 0.6; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(${size + 16}px, 1fr)); gap: 16px; }
    figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px; background: #18181b; border-radius: 12px; }
    figure img { display: block; border-radius: 50%; background: #222; }
    figcaption { font-size: 11px; opacity: 0.55; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; word-break: break-all; text-align: center; }
  </style>
</head>
<body>
  <h1>navii gallery${animated ? ' — animated' : ''}</h1>
  <p class="meta">${seeds.length} seeded avatars @ ${size}px. ${otherMode} · <a style="color:#7dd3fc" href="/gallery?count=200&size=64${animQuery}">200×64</a> · <a style="color:#7dd3fc" href="/gallery?count=24&size=192${animQuery}">24×192</a></p>
  <div class="grid">${tiles}</div>
</body>
</html>`;
}
