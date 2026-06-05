import { Hono } from 'hono';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { createAvatar, renderGroup, type AvatarOptions, type GroupOptions } from '@usenavii/core';
import { svgToPng } from './raster.js';
import { rateLimit, type RateLimitOptions } from './middleware/rateLimit.js';
import { LruCache } from './middleware/lruCache.js';
import { log } from './log.js';
import { landingHtml } from './landing.js';
import { builderHtml, parseBuildQuery, buildSpecToSvg } from './builder.js';
import { renderCast, DEFAULT_CAST_SEEDS } from './cast.js';
import { docSlugs } from './docs.js';
import { ogPng, ogSvg } from './og.js';
import { docsHtml, isDocSlug, defaultDocSlug } from './docs.js';
import { blogIndexHtml, blogReleaseHtml, blogReleaseVersions, blogReleaseOgPng } from './blog.js';
import { privacyHtml, supportHtml } from './legal.js';
import { createLicenseRoutes, createLicenseValidator, type LicenseValidator } from './license.js';
import { Checkout, CustomerPortal, Webhooks } from '@polar-sh/hono';

const FIGMA_PLUGIN_URL = 'https://www.figma.com/community/plugin/1640037999835658823';
const PRO_UPGRADE_URL = 'https://navii.dev/pro';

export interface AppOptions {
  rateLimit?: RateLimitOptions;
  cache?: { max: number };
  trustProxy?: boolean;
  /**
   * Polar.sh organization UUID. Required for /license/verify to validate keys
   * against Polar's license-key benefit. If omitted, the license route is
   * not mounted.
   */
  polarOrganizationId?: string;
  /**
   * Optional: Polar benefit UUID for the license-key benefit. When set,
   * keys for any other benefit are rejected (defense-in-depth so a key
   * issued for a different product can't unlock Navii).
   */
  polarBenefitId?: string;
  /**
   * Optional: override Polar API base URL. Defaults to https://api.polar.sh.
   * Useful for tests or self-hosted Polar instances.
   */
  polarApiBase?: string;
  /**
   * Polar API access token (Organization Access Token from Polar dashboard).
   * Required for /checkout and /portal routes which proxy to Polar's API.
   * License-key validation does NOT need this token (public endpoint).
   */
  polarAccessToken?: string;
  /**
   * Polar product UUID — used as default product for /checkout when no
   * `products` query param is supplied. Maps to the Navii Pro product.
   */
  polarProductId?: string;
  /**
   * Where Polar redirects after successful checkout. Should include
   * `{CHECKOUT_ID}` placeholder if you want to capture the checkout id.
   * Example: https://navii.dev/thanks?checkout_id={CHECKOUT_ID}
   */
  polarSuccessUrl?: string;
  /**
   * Polar webhook signing secret — verifies inbound webhook payloads.
   * Required to mount /polar/webhooks route.
   */
  polarWebhookSecret?: string;
  /**
   * Polar server environment — 'production' (default) or 'sandbox' for tests.
   */
  polarServer?: 'production' | 'sandbox';
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
  const validateLicense: LicenseValidator | undefined = options.polarOrganizationId
    ? createLicenseValidator({
      organizationId: options.polarOrganizationId,
      ...(options.polarBenefitId ? { benefitId: options.polarBenefitId } : {}),
      ...(options.polarApiBase ? { apiBase: options.polarApiBase } : {}),
      cacheTtlMs: 86_400_000,
    })
    : undefined;

  if (options.rateLimit) {
    app.use(
      '/avatar/*',
      rateLimit({ ...options.rateLimit, trustProxy: options.trustProxy === true }),
    );
  }

  // License verification (proxy to Polar.sh). Only mounted when configured.
  if (options.polarOrganizationId && validateLicense) {
    app.route('/', createLicenseRoutes({
      organizationId: options.polarOrganizationId,
      ...(options.polarBenefitId ? { benefitId: options.polarBenefitId } : {}),
      ...(options.polarApiBase ? { apiBase: options.polarApiBase } : {}),
      validator: validateLicense,
    }));
  }

  // Polar-hosted checkout — redirects to Polar's checkout page with the
  // configured product preselected. Mounted only when an access token is set.
  if (options.polarAccessToken) {
    const checkoutOpts: Parameters<typeof Checkout>[0] = {
      accessToken: options.polarAccessToken,
      ...(options.polarSuccessUrl ? { successUrl: options.polarSuccessUrl } : {}),
      ...(options.polarServer ? { server: options.polarServer } : {}),
    };
    app.get('/checkout', (c) => {
      // If caller didn't specify ?products=, fall back to configured productId.
      const hasProduct = c.req.query('products') || c.req.query('productId');
      if (!hasProduct && options.polarProductId) {
        const url = new URL(c.req.url);
        url.searchParams.set('products', options.polarProductId);
        return c.redirect(url.pathname + url.search, 302);
      }
      return Checkout(checkoutOpts)(c);
    });

    // Customer Portal — buyers manage orders, re-fetch their license key,
    // request refunds. Customer ID must be supplied via signed token /
    // header / cookie. For Navii we keep it simple: redirect with
    // ?customer_id=... that callers pass in.
    app.get('/portal', (c) => {
      const customerId = c.req.query('customer_id') ?? '';
      return CustomerPortal({
        accessToken: options.polarAccessToken!,
        getCustomerId: async () => customerId,
        ...(options.polarServer ? { server: options.polarServer } : {}),
      })(c);
    });
  }

  // Webhooks — license-key grant/revoke events from Polar. Useful for logging
  // sales, future analytics. Signature-verified by @polar-sh/hono.
  if (options.polarWebhookSecret) {
    app.post('/polar/webhooks', Webhooks({
      webhookSecret: options.polarWebhookSecret,
      onPayload: async (payload: unknown) => {
        log.info({ event: (payload as { type?: string }).type }, 'polar webhook');
      },
    }));
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
      version: '0.2.0',
      site: 'https://navii.dev',
      packages: {
        core: '@usenavii/core',
        react: '@usenavii/react',
      },
      endpoints: {
        avatar: '/avatar/:seed',
        random: '/random',
        group: '/group?seeds=a,b,c',
        gallery: '/gallery',
        health: '/healthz',
        docs: '/docs',
      },
      seed: {
        rule: 'Same seed in → same avatar out. Pass a stable unique identifier per user.',
        recommended: ['user.id', 'UUID', 'user.email'],
        avoid: ['display name (collides — two "Alice"s get the same avatar)', 'Date.now() at render time (breaks reproducibility)'],
        helper: 'use @usenavii/core seed({ id, email, name, createdAt }) to pick the most-unique field automatically',
      },
      determinism: 'Same seed + same query → byte-identical response, forever. Safe to cache, safe to mirror.',
      compatibility: {
        freeApi: 'All documented endpoints and query params as of v0.24.x stay available, unauthenticated, with the same response formats.',
        proFeatures: 'Future Pro features are additive and use Authorization: Bearer <polar_license_key> only when a Pro-only capability is requested.',
        rateLimits: 'Free-tier rate limits will not tighten beyond the currently published hosted limits.',
        immutableUrls: 'Existing avatar URLs keep working; immutable cache headers mean old URLs remain valid for cached clients.',
      },
    }),
  );

  app.get('/figma', (c) => c.redirect(FIGMA_PLUGIN_URL, 302));
  app.get('/pro', (c) => c.redirect('/checkout', 302));

  app.get('/thanks', (c) => {
    const checkoutId = c.req.query('checkout_id') ?? c.req.query('checkoutId') ?? '';
    const customerToken = c.req.query('customer_session_token') ?? '';
    return new Response(thanksHtml(checkoutId, customerToken), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  });

  app.get('/privacy', (c) => {
    return new Response(privacyHtml(), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    });
  });

  app.get('/support', (c) => {
    return new Response(supportHtml(), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    });
  });

  app.get('/docs', (c) => c.redirect(`/docs/${defaultDocSlug()}`, 302));

  app.get('/docs/:slug', async (c) => {
    const slug = c.req.param('slug');
    if (!isDocSlug(slug)) {
      return new Response(await docsHtml(slug), {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
    return new Response(await docsHtml(slug), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    });
  });

  // /blog — release timeline parsed from CHANGELOG.md.
  // Index lists minor+ releases only; per-release pages accept any version.
  app.get('/blog', (c) => {
    return new Response(blogIndexHtml(), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    });
  });

  app.get('/blog/:version', (c) => {
    const raw = c.req.param('version');
    // Accept both `v0.23.0` and `0.23.0` forms.
    const version = raw.startsWith('v') ? raw.slice(1) : raw;
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      return new Response('Not found', {
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
    const result = blogReleaseHtml(version);
    if (!result.ok) {
      return new Response(blogIndexHtml(), {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
    return new Response(result.html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    });
  });

  app.get('/cast.svg', (c) => {
    const rawSeeds = c.req.query('seeds');
    const seeds = rawSeeds
      ? rawSeeds.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 144)
      : DEFAULT_CAST_SEEDS;
    if (seeds.length === 0) return c.text('seeds required', 400);

    const cols = clampInt(c.req.query('cols'), 1, 12, 6);
    const size = clampInt(c.req.query('size'), 16, 256, 100);
    const gap = clampInt(c.req.query('gap'), 0, 48, 12);
    const animated = c.req.query('animated') === '1' || c.req.query('animated') === 'true';
    const bg = c.req.query('bg');

    const svg = renderCast(seeds, {
      cols,
      size,
      gap,
      animated,
      ...(bg ? { bg } : {}),
    });

    return new Response(svg, {
      status: 200,
      headers: {
        'content-type': 'image/svg+xml; charset=utf-8',
        'cache-control': 'public, max-age=31536000, immutable',
        'access-control-allow-origin': '*',
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

  app.get('/logos/:file', async (c) => {
    const file = c.req.param('file');
    if (!/^[a-z0-9][a-z0-9_-]*\.(png|svg|jpg|jpeg|webp)$/i.test(file)) {
      return c.text('not found', 404);
    }
    const here = dirname(fileURLToPath(import.meta.url));
    const root = resolve(here, '..', 'public', 'logos');
    const full = join(root, file);
    if (!full.startsWith(root + '/')) return c.text('not found', 404);
    try {
      const buf = await readFile(full);
      const ext = file.split('.').pop()!.toLowerCase();
      const ct =
        ext === 'svg' ? 'image/svg+xml; charset=utf-8' :
        ext === 'png' ? 'image/png' :
        ext === 'webp' ? 'image/webp' :
        'image/jpeg';
      return new Response(new Uint8Array(buf) as BodyInit, {
        status: 200,
        headers: {
          'content-type': ct,
          'cache-control': 'public, max-age=86400, immutable',
          'access-control-allow-origin': '*',
        },
      });
    } catch {
      return c.text('not found', 404);
    }
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

  // Per-release OG cards — composed from the version's CHANGELOG entry.
  app.get('/og/blog/:filename', async (c) => {
    const raw = c.req.param('filename');
    // Strip .png suffix; accept v-prefixed or bare version.
    const stem = raw.replace(/\.png$/i, '');
    const version = stem.startsWith('v') ? stem.slice(1) : stem;
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      return c.text('Not found', 404);
    }
    try {
      const png = await blogReleaseOgPng(version);
      if (!png) return c.text('Not found', 404);
      return new Response(png as BodyInit, {
        status: 200,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=86400, immutable',
          'access-control-allow-origin': '*',
        },
      });
    } catch (err) {
      log.error({ err: (err as Error).message, version }, 'blog og raster failed');
      return c.text(`OG image unavailable: ${(err as Error).message}`, 501);
    }
  });

  app.get('/robots.txt', (c) => {
    const body = `User-agent: *\nAllow: /\nDisallow: /gallery\n\nSitemap: https://navii.dev/sitemap.xml\n`;
    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=86400',
      },
    });
  });

  app.get('/sitemap.xml', (c) => {
    const SITE = 'https://navii.dev';
    const urls = [
      `${SITE}/`,
      `${SITE}/builder`,
      `${SITE}/privacy`,
      `${SITE}/support`,
      `${SITE}/blog`,
      ...docSlugs().map((s) => `${SITE}/docs/${s}`),
      ...blogReleaseVersions().map((v) => `${SITE}/blog/v${v}`),
    ];
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

  app.get('/build', (c) => c.redirect('/builder', 301));

  app.get('/builder', (c) => {
    return new Response(builderHtml(), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    });
  });

  app.get('/build/render', async (c) => {
    const q: Record<string, string | undefined> = {};
    for (const k of ['body','palette','background','eyes','mouth','accessory','topper','antenna','outfit','hueShift','bodyScale','eyeGapShift','mouthCurveScale','antennaTilt']) {
      const v = c.req.query(k);
      if (v !== undefined) q[k] = v;
    }
    const spec = parseBuildQuery(q);
    const size = clampInt(c.req.query('size'), 16, 1024, 96);
    const animated = c.req.query('animated') === '1' || c.req.query('animated') === 'true';
    const tileBg = c.req.query('tileBg');
    const wantsPng = /\.png$/i.test(c.req.path);

    const opts: AvatarOptions = { size };
    if (animated && !wantsPng) opts.animated = true;
    if (tileBg) opts.tileBg = tileBg;

    const svg = buildSpecToSvg(spec, opts);

    if (wantsPng) {
      try {
        const png = await svgToPng(svg, size);
        return new Response(png as BodyInit, {
          status: 200,
          headers: {
            'content-type': 'image/png',
            'cache-control': 'public, max-age=31536000, immutable',
            'access-control-allow-origin': '*',
          },
        });
      } catch (err) {
        log.error({ err: (err as Error).message }, 'build png raster failed');
        return c.text(`PNG rasterization unavailable: ${(err as Error).message}`, 501);
      }
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

  app.get('/build/render.png', async (c) => {
    // Convenience alias — same as /build/render with `.png` semantics.
    const q: Record<string, string | undefined> = {};
    for (const k of ['body','palette','background','eyes','mouth','accessory','topper','antenna','outfit','hueShift','bodyScale','eyeGapShift','mouthCurveScale','antennaTilt']) {
      const v = c.req.query(k);
      if (v !== undefined) q[k] = v;
    }
    const spec = parseBuildQuery(q);
    const size = clampInt(c.req.query('size'), 16, 1024, 96);
    const tileBg = c.req.query('tileBg');
    const opts: AvatarOptions = { size };
    if (tileBg) opts.tileBg = tileBg;
    const svg = buildSpecToSvg(spec, opts);
    try {
      const png = await svgToPng(svg, size);
      return new Response(png as BodyInit, {
        status: 200,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=31536000, immutable',
          'access-control-allow-origin': '*',
        },
      });
    } catch (err) {
      log.error({ err: (err as Error).message }, 'build png raster failed');
      return c.text(`PNG rasterization unavailable: ${(err as Error).message}`, 501);
    }
  });

  /**
   * GET /random, GET /random.png — render a fresh avatar inline (no redirect).
   *
   * The URL stays `/random` across refreshes; each request picks a new seed
   * internally and returns the SVG/PNG directly. The chosen seed is surfaced
   * via the `X-Navii-Seed` response header so callers can persist it.
   *
   * Caching: `cache-control: no-store` so browsers + CDNs never reuse the
   * response. Refresh = new avatar.
   *
   * All `/avatar/:seed` query params are honored (size, palette, background,
   * tileBg, title, animated). PNG path is NOT in-process cached — random
   * seeds blow the cache.
   */
  async function renderRandom(c: { req: { query(k: string): string | undefined } }, wantsPng: boolean): Promise<Response> {
    const seed = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

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

    const commonHeaders = {
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-expose-headers': 'x-navii-seed',
      'x-navii-seed': seed,
    };

    if (wantsPng) {
      try {
        const png = await svgToPng(svg, size);
        return new Response(png as BodyInit, {
          status: 200,
          headers: { ...commonHeaders, 'content-type': 'image/png' },
        });
      } catch (err) {
        log.error({ err: (err as Error).message }, 'random png raster failed');
        return new Response(`PNG rasterization unavailable: ${(err as Error).message}`, { status: 501 });
      }
    }

    return new Response(svg, {
      status: 200,
      headers: { ...commonHeaders, 'content-type': 'image/svg+xml; charset=utf-8' },
    });
  }

  app.get('/random', (c) => renderRandom(c, false));
  app.get('/random.png', (c) => renderRandom(c, true));

  app.get('/avatar/:seed{.+}', async (c) => {
    const rawSeed = c.req.param('seed');
    const decoded = decodeURIComponent(rawSeed);
    const wantsPng = /\.png$/i.test(decoded);
    const seed = stripExt(decoded);
    if (!seed) return c.text('seed required', 400);

    // packs= comma-separated list. Unknown ids are silently skipped by the
    // engine (resolvePacks ignores them), so no enum validation needed here.
    const packsRaw = c.req.query('packs');
    const packs = packsRaw
      ? packsRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    const wantsPro =
      c.req.query('pro') === '1' ||
      c.req.query('pro') === 'true' ||
      (packs !== undefined && packs.length > 0);
    if (wantsPro) {
      const authFailure = await requireProAuth(c.req.header('authorization'), validateLicense);
      if (authFailure) return authFailure;
    }

    // Email-shaped seed = plaintext PII on the wire (URL, logs, Referer,
    // CDN cache keys). Honor the request but flag it. Clients should hash
    // with `seedFromEmail()` from @usenavii/core instead.
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(seed);
    if (looksLikeEmail) {
      log.warn({ seedShape: 'email' }, 'plaintext email seed');
    }

    const size = clampInt(c.req.query('size'), 16, 1024, 96);
    const paletteId = c.req.query('palette');
    const background = c.req.query('background');
    const title = c.req.query('title');
    const animated = c.req.query('animated') === '1' || c.req.query('animated') === 'true';
    const tileBg = c.req.query('tileBg');
    const moodRaw = c.req.query('mood');
    const mood =
      moodRaw === 'happy' || moodRaw === 'serious' || moodRaw === 'sleepy' ||
      moodRaw === 'wink' || moodRaw === 'neutral'
        ? moodRaw
        : undefined;
    // style= biases seeded picks via masc/femme/neutral. Only meaningful
    // alongside packs but harmless otherwise — engine treats undefined style
    // as "no bias".
    const styleRaw = c.req.query('style');
    const style =
      styleRaw === 'masc' || styleRaw === 'femme' || styleRaw === 'neutral'
        ? styleRaw
        : undefined;

    const avatarOpts: AvatarOptions = { size };
    if (paletteId) avatarOpts.paletteId = paletteId;
    if (background === 'ring' || background === 'solid' || background === 'none') {
      avatarOpts.background = background;
    }
    if (title) avatarOpts.title = title;
    if (animated && !wantsPng) avatarOpts.animated = true;
    if (tileBg) avatarOpts.tileBg = tileBg;
    if (mood) avatarOpts.mood = mood;
    if (packs && packs.length > 0) avatarOpts.packs = packs;
    if (style) avatarOpts.style = style;

    const svg = createAvatar(seed, avatarOpts);

    if (wantsPng) {
      const cacheKey = canonicalKey(seed, size, paletteId, background, title, tileBg, mood, packs, style);
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
      const headers: Record<string, string> = {
        'content-type': 'image/png',
        'cache-control': 'public, max-age=31536000, immutable',
        'access-control-allow-origin': '*',
      };
      if (looksLikeEmail) headers['x-navii-warning'] = 'plaintext-email-seed; hash with seedFromEmail()';
      return new Response(png as BodyInit, { status: 200, headers });
    }

    const svgHeaders: Record<string, string> = {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=31536000, immutable',
      'access-control-allow-origin': '*',
    };
    if (looksLikeEmail) svgHeaders['x-navii-warning'] = 'plaintext-email-seed; hash with seedFromEmail()';
    return new Response(svg, { status: 200, headers: svgHeaders });
  });

  app.get('/gallery', (c) => {
    const count = clampInt(c.req.query('count'), 1, 500, 96);
    const size = clampInt(c.req.query('size'), 16, 512, 96);
    const prefix = c.req.query('prefix') ?? 'user';
    const animated = c.req.query('animated') === '1' || c.req.query('animated') === 'true';
    const seeds = Array.from({ length: count }, (_, i) => `${prefix}-${i}`);
    return c.html(renderGallery(seeds, size, animated));
  });

  app.get('/accra-packs', (c) => {
    const count = clampInt(c.req.query('count'), 12, 240, 72);
    const size = clampInt(c.req.query('size'), 48, 180, 96);
    const animated = c.req.query('animated') === '1' || c.req.query('animated') === 'true';
    return c.html(renderAccraPacksDemo(count, size, animated));
  });

  app.get('/lagos-packs', (c) => {
    const count = clampInt(c.req.query('count'), 12, 240, 72);
    const size = clampInt(c.req.query('size'), 48, 180, 96);
    const animated = c.req.query('animated') === '1' || c.req.query('animated') === 'true';
    return c.html(renderLagosPacksDemo(count, size, animated));
  });

  app.get('/nairobi-packs', (c) => {
    const count = clampInt(c.req.query('count'), 12, 240, 72);
    const size = clampInt(c.req.query('size'), 48, 180, 96);
    const animated = c.req.query('animated') === '1' || c.req.query('animated') === 'true';
    return c.html(renderNairobiPacksDemo(count, size, animated));
  });

  // Catch-all — any URL that didn't match a route redirects to the landing
  // page. Avoids needing a styled 404 surface and keeps every dead link
  // pointing somewhere useful.
  app.notFound((c) => c.redirect('/', 302));

  return app;
}

/**
 * Post-purchase confirmation page. Polar redirects buyers here after
 * successful checkout with `checkout_id` and `customer_session_token` query
 * params. The session token is one-time-use and authenticates the buyer for
 * the customer portal — we hand it back via a deep link.
 *
 * License key arrives separately via email; we don't have it on this redirect.
 */
function thanksHtml(checkoutId: string, customerSessionToken: string): string {
  const cid = checkoutId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64);
  const portalUrl = customerSessionToken
    ? `https://polar.sh/customer-portal?customer_session_token=${encodeURIComponent(customerSessionToken)}`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Thanks — Navii Pro</title>
<meta name="robots" content="noindex" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta name="theme-color" content="#0a0a0b" />
<style>
  :root { color-scheme: dark; }
  body { margin: 0; padding: 0; min-height: 100vh; background: #0a0a0b; color: #f5f5f4;
    font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
    display: grid; place-items: center; padding: 24px; }
  .card { max-width: 560px; width: 100%; background: #161618; border: 1px solid #2a2a2d;
    border-radius: 16px; padding: 36px 32px; }
  h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.02em; }
  .sub { color: #a1a1aa; margin: 0 0 28px; }
  h2 { font-size: 14px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
    color: #a1a1aa; margin: 24px 0 10px; }
  ol { margin: 0; padding-left: 22px; color: #e4e4e7; }
  ol li { margin: 6px 0; }
  code { background: #27272a; padding: 2px 6px; border-radius: 4px; font-size: 13px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 28px; }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px;
    border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none;
    border: 1px solid transparent; }
  .btn.primary { background: #f5f5f4; color: #09090b; }
  .btn.primary:hover { background: #fafafa; }
  .btn.ghost { background: transparent; color: #d4d4d8; border-color: #2a2a2d; }
  .btn.ghost:hover { background: #1f1f23; }
  .checkout-id { color: #71717a; font-size: 12px; margin-top: 24px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; word-break: break-all; }
  .check { color: #34d399; font-size: 40px; line-height: 1; margin-bottom: 12px; }
</style>
</head>
<body>
  <div class="card">
    <div class="check">✓</div>
    <h1>Payment received.</h1>
    <p class="sub">Welcome to Navii Pro — lifetime access, all packs, all SDKs as they ship.</p>

    <h2>Next steps</h2>
    <ol>
      <li>Check your email — Polar just sent a message with your <strong>license key</strong> (subject: "Your Navii Pro license").</li>
      <li>Open Figma → run the <strong>Navii</strong> plugin.</li>
      <li>Click <strong>Upgrade</strong> → paste the license key into the modal.</li>
      <li>All premium packs unlock instantly.</li>
    </ol>

    <div class="row">
      <a class="btn primary" href="https://www.figma.com/community/plugin/1640037999835658823">Open plugin in Figma</a>
      ${portalUrl ? `<a class="btn ghost" href="${portalUrl}" rel="noopener">Manage purchase</a>` : ''}
    </div>

    ${cid ? `<p class="checkout-id">Checkout ID: ${cid}</p>` : ''}
  </div>
</body>
</html>`;
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

function proAuthRequired(): Response {
  return Response.json(
    {
      error: 'pro_auth_required',
      message: `This option requires Navii Pro. Get a license at ${PRO_UPGRADE_URL}.`,
      upgradeUrl: PRO_UPGRADE_URL,
    },
    {
      status: 401,
      headers: { 'access-control-allow-origin': '*' },
    },
  );
}

function invalidLicense(): Response {
  return Response.json(
    {
      error: 'invalid_license',
      message: `The Navii Pro license key is invalid or inactive. Get a license at ${PRO_UPGRADE_URL}.`,
      upgradeUrl: PRO_UPGRADE_URL,
    },
    {
      status: 401,
      headers: { 'access-control-allow-origin': '*' },
    },
  );
}

function bearerToken(header: string | undefined): string | undefined {
  const match = /^Bearer\s+(.+)$/i.exec(header ?? '');
  return match?.[1]?.trim() || undefined;
}

async function requireProAuth(
  authorization: string | undefined,
  validateLicense: LicenseValidator | undefined,
): Promise<Response | undefined> {
  const token = bearerToken(authorization);
  if (!token || !validateLicense) return proAuthRequired();

  const result = await validateLicense(token);
  if (!result.ok) {
    if (result.reason === 'upstream_unreachable' || result.reason === 'upstream_invalid') {
      return Response.json(
        {
          error: 'license_check_unavailable',
          message: 'License verification is temporarily unavailable.',
        },
        {
          status: 502,
          headers: { 'access-control-allow-origin': '*' },
        },
      );
    }
    return invalidLicense();
  }

  return undefined;
}

function canonicalKey(
  seed: string,
  size: number,
  palette: string | undefined,
  background: string | undefined,
  title: string | undefined,
  tileBg: string | undefined,
  mood?: string | undefined,
  packs?: readonly string[] | undefined,
  style?: string | undefined,
): string {
  // Packs are normalized (sorted) so `?packs=halloween,office` and
  // `?packs=office,halloween` hash to the same cache entry — engine output is
  // order-insensitive across pack ids.
  const packKey = packs && packs.length > 0 ? [...packs].sort().join(',') : '';
  return `${seed}|s=${size}|p=${palette ?? ''}|b=${background ?? ''}|t=${title ?? ''}|tb=${tileBg ?? ''}|m=${mood ?? ''}|pk=${packKey}|st=${style ?? ''}`;
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

function renderAccraPacksDemo(count: number, size: number, animated: boolean): string {
  const seeds = [
    'ama', 'kwame', 'akosua', 'kofi', 'esi', 'yaw', 'abena', 'kojo', 'afia', 'kwesi', 'adjoa', 'akua',
    'accra-founder', 'oscar', 'nana', 'efua', 'kweku', 'yaa', 'selasi', 'adwoa', 'navii-accra', 'gallery-01',
    'founder-page', 'team-card', 'pitch-deck', 'product-lead', 'design-lead', 'growth-lead', 'ops-lead', 'community',
    'labadi', 'osu', 'ridge', 'cantonments', 'east-legon', 'jamestown', 'airport', 'spintex', 'madina', 'tema',
  ];
  const palettes = [
    'accra-gallery:gallery-gold',
    'accra-gallery:green-red',
    'accra-gallery:red-black',
    'accra-gallery:black-red',
    'accra-gallery:red-gold',
  ];
  const styles: Array<'masc' | 'femme' | 'neutral' | undefined> = [undefined, 'masc', 'femme', 'neutral'];
  const moods: Array<'neutral' | 'happy' | 'serious' | 'sleepy' | 'wink'> = ['neutral', 'happy', 'serious', 'sleepy', 'wink'];
  const items = Array.from({ length: count }, (_, i) => {
    const seed = seeds[i % seeds.length] + '-' + Math.floor(i / seeds.length);
    const paletteId = palettes[i % palettes.length]!;
    const style = styles[Math.floor(i / palettes.length) % styles.length];
    const mood = moods[Math.floor(i / (palettes.length * styles.length)) % moods.length];
    const svg = createAvatar(seed, {
      size,
      packs: ['accra-gallery'],
      paletteId,
      ...(style ? { style } : {}),
      ...(mood !== 'neutral' ? { mood } : {}),
      animated,
    });
    const label = [seed, paletteId.replace('accra-gallery:', ''), style ?? 'auto', mood].join(' / ');
    return `
      <figure>
        <div class="avatar">${svg}</div>
        <figcaption>${escapeHtml(label)}</figcaption>
      </figure>`;
  }).join('');
  const animQuery = animated ? '&animated=1' : '';
  const oppositeMode = animated ? '' : '&animated=1';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Accra Gallery demo</title>
  <style>
    :root {
      color-scheme: light;
      --canvas: #f6eedc;
      --ink: #111827;
      --gold: #f3cf4e;
      --red: #b12f28;
      --green: #2f6a3e;
      --line: rgba(17, 24, 39, 0.16);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--canvas);
      color: var(--ink);
      font: 14px/1.45 ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .shell {
      width: min(1480px, calc(100vw - 48px));
      margin: 0 auto;
      padding: 34px 0 48px;
    }
    header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 24px;
      align-items: end;
      border-bottom: 1px solid var(--line);
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    h1 {
      margin: 0;
      font-size: clamp(34px, 5vw, 82px);
      line-height: 0.92;
      letter-spacing: 0;
      max-width: 760px;
    }
    .meta {
      margin: 14px 0 0;
      max-width: 620px;
      color: rgba(17, 24, 39, 0.68);
      font-size: 16px;
    }
    .controls {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .controls a {
      color: var(--ink);
      text-decoration: none;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 9px 13px;
      background: rgba(255,255,255,0.28);
      font-weight: 650;
    }
    .swatches {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 28px;
    }
    .swatches span {
      width: 42px;
      height: 42px;
      border: 1px solid rgba(17,24,39,0.08);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(${Math.max(size + 34, 116)}px, 1fr));
      gap: 14px;
    }
    figure {
      margin: 0;
      min-width: 0;
      background: rgba(255, 255, 255, 0.34);
      border: 1px solid rgba(17, 24, 39, 0.08);
      border-radius: 8px;
      padding: 12px;
      display: grid;
      place-items: center;
      gap: 9px;
      box-shadow: 0 1px 0 rgba(17, 24, 39, 0.04);
    }
    .avatar {
      width: ${size}px;
      height: ${size}px;
      display: grid;
      place-items: center;
    }
    .avatar svg {
      display: block;
      width: ${size}px;
      height: ${size}px;
    }
    figcaption {
      width: 100%;
      color: rgba(17, 24, 39, 0.56);
      font: 10px/1.25 ui-monospace, SFMono-Regular, Menlo, monospace;
      text-align: center;
      overflow-wrap: anywhere;
      min-height: 26px;
    }
    @media (max-width: 760px) {
      .shell { width: min(100vw - 24px, 1480px); padding-top: 22px; }
      header { grid-template-columns: 1fr; align-items: start; }
      .controls { justify-content: flex-start; }
      .swatches span { width: 34px; height: 34px; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div>
        <h1>Accra Gallery</h1>
        <p class="meta">${count} generated avatars using the Accra Gallery pack. Demo page only, rendered directly from core so you can scan the pack without Pro API auth.</p>
      </div>
      <nav class="controls" aria-label="Demo controls">
        <a href="/accra-packs?count=72&size=96${animated ? '&animated=1' : ''}">72</a>
        <a href="/accra-packs?count=144&size=80${animated ? '&animated=1' : ''}">144</a>
        <a href="/accra-packs?count=${count}&size=${size}${oppositeMode}">${animated ? 'Static' : 'Animated'}</a>
      </nav>
    </header>
    <div class="swatches" aria-label="Accra Gallery palette">
      <span style="background:#111827"></span>
      <span style="background:#F3CF4E"></span>
      <span style="background:#B12F28"></span>
      <span style="background:#2F6A3E"></span>
      <span style="background:#F8D04A"></span>
    </div>
    <section class="grid">${items}</section>
  </main>
</body>
</html>`;
}

function renderLagosPacksDemo(count: number, size: number, animated: boolean): string {
  const seeds = [
    'eko', 'lagos', 'danfo', 'naija', 'yemi', 'tunde', 'ada', 'wale', 'sade', 'seun', 'ife', 'zainab',
    'lagos-founder', 'eko-night', 'mainland', 'island', 'ikeja', 'yaba', 'lekki', 'surulere', 'oshodi', 'vi',
    'team-card', 'pitch-deck', 'product-lead', 'design-lead', 'growth-lead', 'ops-lead', 'community', 'studio',
    'route-01', 'route-02', 'bus-stop', 'city-energy', 'flag-first', 'danfo-line', 'green-white', 'street-black',
  ];
  const palettes = [
    'lagos-danfo:green-white',
    'lagos-danfo:white-green',
    'lagos-danfo:danfo-green',
    'lagos-danfo:deep-green',
    'lagos-danfo:street-black',
  ];
  const styles: Array<'masc' | 'femme' | 'neutral' | undefined> = [undefined, 'masc', 'femme', 'neutral'];
  const moods: Array<'neutral' | 'happy' | 'serious' | 'sleepy' | 'wink'> = ['neutral', 'happy', 'serious', 'sleepy', 'wink'];
  const items = Array.from({ length: count }, (_, i) => {
    const seed = seeds[i % seeds.length] + '-' + Math.floor(i / seeds.length);
    const paletteId = palettes[i % palettes.length]!;
    const style = styles[Math.floor(i / palettes.length) % styles.length];
    const mood = moods[Math.floor(i / (palettes.length * styles.length)) % moods.length];
    const svg = createAvatar(seed, {
      size,
      packs: ['lagos-danfo'],
      paletteId,
      ...(style ? { style } : {}),
      ...(mood !== 'neutral' ? { mood } : {}),
      animated,
    });
    const label = [seed, paletteId.replace('lagos-danfo:', ''), style ?? 'auto', mood].join(' / ');
    return `
      <figure>
        <div class="avatar">${svg}</div>
        <figcaption>${escapeHtml(label)}</figcaption>
      </figure>`;
  }).join('');
  const oppositeMode = animated ? '' : '&animated=1';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Lagos Danfo demo</title>
  <style>
    :root {
      color-scheme: light;
      --canvas: #f8f7ef;
      --ink: #111827;
      --green: #008753;
      --deep-green: #075f3a;
      --yellow: #f5c51b;
      --line: rgba(17, 24, 39, 0.16);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--canvas);
      color: var(--ink);
      font: 14px/1.45 ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .shell {
      width: min(1480px, calc(100vw - 48px));
      margin: 0 auto;
      padding: 34px 0 48px;
    }
    header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 24px;
      align-items: end;
      border-bottom: 1px solid var(--line);
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    h1 {
      margin: 0;
      font-size: clamp(34px, 5vw, 82px);
      line-height: 0.92;
      letter-spacing: 0;
      max-width: 760px;
    }
    .meta {
      margin: 14px 0 0;
      max-width: 650px;
      color: rgba(17, 24, 39, 0.68);
      font-size: 16px;
    }
    .controls {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .controls a {
      color: var(--ink);
      text-decoration: none;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 9px 13px;
      background: rgba(255,255,255,0.34);
      font-weight: 650;
    }
    .swatches {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 28px;
    }
    .swatches span {
      width: 42px;
      height: 42px;
      border: 1px solid rgba(17,24,39,0.08);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(${Math.max(size + 34, 116)}px, 1fr));
      gap: 14px;
    }
    figure {
      margin: 0;
      min-width: 0;
      background: rgba(255, 255, 255, 0.44);
      border: 1px solid rgba(17, 24, 39, 0.08);
      border-radius: 8px;
      padding: 12px;
      display: grid;
      place-items: center;
      gap: 9px;
      box-shadow: 0 1px 0 rgba(17, 24, 39, 0.04);
    }
    .avatar {
      width: ${size}px;
      height: ${size}px;
      display: grid;
      place-items: center;
    }
    .avatar svg {
      display: block;
      width: ${size}px;
      height: ${size}px;
    }
    figcaption {
      width: 100%;
      color: rgba(17, 24, 39, 0.56);
      font: 10px/1.25 ui-monospace, SFMono-Regular, Menlo, monospace;
      text-align: center;
      overflow-wrap: anywhere;
      min-height: 26px;
    }
    @media (max-width: 760px) {
      .shell { width: min(100vw - 24px, 1480px); padding-top: 22px; }
      header { grid-template-columns: 1fr; align-items: start; }
      .controls { justify-content: flex-start; }
      .swatches span { width: 34px; height: 34px; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div>
        <h1>Lagos Danfo</h1>
        <p class="meta">${count} generated avatars using the Lagos Danfo pack. Local review page only, rendered directly from core so you can scan the pack before we treat the Figma plugin visuals as approved.</p>
      </div>
      <nav class="controls" aria-label="Demo controls">
        <a href="/lagos-packs?count=72&size=96${animated ? '&animated=1' : ''}">72</a>
        <a href="/lagos-packs?count=144&size=80${animated ? '&animated=1' : ''}">144</a>
        <a href="/lagos-packs?count=${count}&size=${size}${oppositeMode}">${animated ? 'Static' : 'Animated'}</a>
      </nav>
    </header>
    <div class="swatches" aria-label="Lagos Danfo palette">
      <span style="background:#111827"></span>
      <span style="background:#008753"></span>
      <span style="background:#F8F7EF"></span>
      <span style="background:#008753"></span>
      <span style="background:#F5C51B"></span>
    </div>
    <section class="grid">${items}</section>
  </main>
</body>
</html>`;
}

function renderNairobiPacksDemo(count: number, size: number, animated: boolean): string {
  const seeds = [
    'nairobi', 'matatu', 'ngong', 'westlands', 'karen', 'kilimani', 'langata', 'kariobangi', 'eastleigh', 'parklands', 'ruaraka', 'kibera',
    'nairobi-founder', 'matatu-night', 'route-46', 'route-11', 'route-23', 'city-hop', 'stage-left', 'stage-right', 'neon-line', 'shuka-grid',
    'team-card', 'pitch-deck', 'product-lead', 'design-lead', 'growth-lead', 'ops-lead', 'community', 'studio',
    'uhuru', 'tom-mboya', 'archives', 'river-road', 'electric-stage', 'safari-neon', 'route-poster', 'green-light',
  ];
  const palettes = [
    'nairobi-matatu:route-black',
    'nairobi-matatu:kanu-red',
    'nairobi-matatu:city-green',
    'nairobi-matatu:yellow-stripe',
    'nairobi-matatu:shuka-blue',
  ];
  const styles: Array<'masc' | 'femme' | 'neutral' | undefined> = [undefined, 'masc', 'femme', 'neutral'];
  const moods: Array<'neutral' | 'happy' | 'serious' | 'sleepy' | 'wink'> = ['neutral', 'happy', 'serious', 'sleepy', 'wink'];
  const items = Array.from({ length: count }, (_, i) => {
    const seed = seeds[i % seeds.length] + '-' + Math.floor(i / seeds.length);
    const paletteId = palettes[i % palettes.length]!;
    const style = styles[Math.floor(i / palettes.length) % styles.length];
    const mood = moods[Math.floor(i / (palettes.length * styles.length)) % moods.length];
    const svg = createAvatar(seed, {
      size,
      packs: ['nairobi-matatu'],
      paletteId,
      ...(style ? { style } : {}),
      ...(mood !== 'neutral' ? { mood } : {}),
      animated,
    });
    const label = [seed, paletteId.replace('nairobi-matatu:', ''), style ?? 'auto', mood].join(' / ');
    return `
      <figure>
        <div class="avatar">${svg}</div>
        <figcaption>${escapeHtml(label)}</figcaption>
      </figure>`;
  }).join('');
  const oppositeMode = animated ? '' : '&animated=1';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Nairobi Matatu demo</title>
  <style>
    :root {
      color-scheme: light;
      --canvas: #f7f1e3;
      --ink: #101820;
      --green: #12d977;
      --red: #ff2d55;
      --blue: #2f80ed;
      --yellow: #ffd23f;
      --line: rgba(16, 24, 32, 0.16);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--canvas);
      color: var(--ink);
      font: 14px/1.45 ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .shell {
      width: min(1480px, calc(100vw - 48px));
      margin: 0 auto;
      padding: 34px 0 48px;
    }
    header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 24px;
      align-items: end;
      border-bottom: 1px solid var(--line);
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    h1 {
      margin: 0;
      font-size: clamp(34px, 5vw, 82px);
      line-height: 0.92;
      letter-spacing: 0;
      max-width: 780px;
    }
    .meta {
      margin: 14px 0 0;
      max-width: 690px;
      color: rgba(16, 24, 32, 0.66);
      font-size: 16px;
    }
    .controls {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .controls a {
      color: var(--ink);
      text-decoration: none;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 9px 13px;
      background: rgba(255,255,255,0.48);
      font-weight: 650;
    }
    .swatches {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 28px;
    }
    .swatches span {
      width: 42px;
      height: 42px;
      border: 1px solid rgba(16,24,32,0.12);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(${Math.max(size + 34, 116)}px, 1fr));
      gap: 14px;
    }
    figure {
      margin: 0;
      min-width: 0;
      background: rgba(255, 255, 255, 0.44);
      border: 1px solid rgba(16, 24, 32, 0.08);
      border-radius: 8px;
      padding: 12px;
      display: grid;
      place-items: center;
      gap: 9px;
      box-shadow: 0 1px 0 rgba(16, 24, 32, 0.04);
    }
    .avatar {
      width: ${size}px;
      height: ${size}px;
      display: grid;
      place-items: center;
    }
    .avatar svg {
      display: block;
      width: ${size}px;
      height: ${size}px;
    }
    figcaption {
      width: 100%;
      color: rgba(16, 24, 32, 0.56);
      font: 10px/1.25 ui-monospace, SFMono-Regular, Menlo, monospace;
      text-align: center;
      overflow-wrap: anywhere;
      min-height: 26px;
    }
    @media (max-width: 760px) {
      .shell { width: min(100vw - 24px, 1480px); padding-top: 22px; }
      header { grid-template-columns: 1fr; align-items: start; }
      .controls { justify-content: flex-start; }
      .swatches span { width: 34px; height: 34px; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div>
        <h1>Nairobi Matatu</h1>
        <p class="meta">${count} generated avatars using the Nairobi Matatu pack. Local review page only, focused on route stickers, yellow matatu stripes, Kenya flag color, and restrained shuka details.</p>
      </div>
      <nav class="controls" aria-label="Demo controls">
        <a href="/nairobi-packs?count=72&size=96${animated ? '&animated=1' : ''}">72</a>
        <a href="/nairobi-packs?count=144&size=80${animated ? '&animated=1' : ''}">144</a>
        <a href="/nairobi-packs?count=${count}&size=${size}${oppositeMode}">${animated ? 'Static' : 'Animated'}</a>
      </nav>
    </header>
    <div class="swatches" aria-label="Nairobi Matatu palette">
      <span style="background:#101820"></span>
      <span style="background:#C8102E"></span>
      <span style="background:#00843D"></span>
      <span style="background:#F5C51B"></span>
      <span style="background:#1E4EA8"></span>
      <span style="background:#F8F7EF"></span>
    </div>
    <section class="grid">${items}</section>
  </main>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
