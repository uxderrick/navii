/**
 * License verification endpoint.
 *
 * Architecture (intentionally stateless — Gumroad is source of truth):
 *
 *   buyer → Gumroad checkout → Gumroad emails a license key
 *     → buyer pastes key into plugin
 *     → plugin POSTs { key, email } to /license/verify
 *     → server proxies to Gumroad's /v2/licenses/verify
 *     → returns { ok, plan, purchaseId } to plugin
 *     → plugin caches result in figma.clientStorage (re-verifies every 24h)
 *
 * No database. No signing keys. No webhook handling. Gumroad's license-key
 * feature gives us free issuance, refund tracking, and chargeback handling.
 *
 * Env vars:
 *   GUMROAD_PRODUCT_PERMALINK   — short product slug from Gumroad URL
 *   (none required for unit tests — mock the upstream fetch)
 */

import { Hono } from 'hono';
import { log } from './log.js';

const GUMROAD_VERIFY_URL = 'https://api.gumroad.com/v2/licenses/verify';

interface GumroadVerifyResponse {
  success: boolean;
  uses?: number;
  purchase?: {
    id: string;
    email: string;
    refunded?: boolean;
    chargebacked?: boolean;
    disputed?: boolean;
    license_key?: string;
    product_permalink?: string;
  };
  message?: string;
}

export interface LicenseVerifyResult {
  ok: boolean;
  plan?: 'pro';
  purchaseId?: string;
  email?: string;
  reason?: string;
}

export function createLicenseRoutes(opts: { productPermalink: string }) {
  const router = new Hono();

  router.post('/license/verify', async (c) => {
    let body: { key?: string; email?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json<LicenseVerifyResult>({ ok: false, reason: 'invalid_json' }, 400);
    }

    const key = (body.key ?? '').trim();
    if (!key) {
      return c.json<LicenseVerifyResult>({ ok: false, reason: 'missing_key' }, 400);
    }

    const upstreamBody = new URLSearchParams({
      product_permalink: opts.productPermalink,
      license_key: key,
      // Don't tick the use count on every re-verify — plugins re-check every 24h.
      increment_uses_count: 'false',
    });

    let upstream: Response;
    try {
      upstream = await fetch(GUMROAD_VERIFY_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: upstreamBody,
      });
    } catch (err) {
      log.warn({ err: String(err) }, 'license: upstream fetch failed');
      return c.json<LicenseVerifyResult>({ ok: false, reason: 'upstream_unreachable' }, 502);
    }

    let data: GumroadVerifyResponse;
    try {
      data = (await upstream.json()) as GumroadVerifyResponse;
    } catch {
      return c.json<LicenseVerifyResult>({ ok: false, reason: 'upstream_invalid' }, 502);
    }

    if (!data.success || !data.purchase) {
      return c.json<LicenseVerifyResult>(
        { ok: false, reason: data.message ?? 'invalid_key' },
        401,
      );
    }

    const purchase = data.purchase;
    if (purchase.refunded || purchase.chargebacked || purchase.disputed) {
      return c.json<LicenseVerifyResult>(
        { ok: false, reason: 'revoked' },
        401,
      );
    }

    if (body.email && body.email.toLowerCase().trim() !== purchase.email.toLowerCase()) {
      // Email mismatch — buyers occasionally paste the wrong email.
      // Not fatal; warn but accept (Gumroad already validated the key itself).
      log.info(
        { provided: body.email, actual: purchase.email },
        'license: email mismatch (accepted)',
      );
    }

    return c.json<LicenseVerifyResult>({
      ok: true,
      plan: 'pro',
      purchaseId: purchase.id,
      email: purchase.email,
    });
  });

  return router;
}
