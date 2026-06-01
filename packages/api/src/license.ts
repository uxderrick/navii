/**
 * License verification endpoint — Polar.sh backend.
 *
 * Architecture (stateless — Polar is source of truth):
 *
 *   buyer → Polar checkout → Polar emails a license key
 *     → buyer pastes key into plugin
 *     → plugin POSTs { key } to /license/verify
 *     → server proxies to Polar's customer-portal validate endpoint
 *     → returns { ok, plan, purchaseId } to plugin
 *     → plugin caches result in figma.clientStorage (re-verifies every 24h)
 *
 * No database. No signing keys. No webhook handling. Polar's license-key
 * benefit gives us free issuance, refund/revocation tracking, expiry, and
 * activation/usage limits if we want them later.
 *
 * Env vars:
 *   POLAR_ORGANIZATION_ID  — UUID of your Polar org (required)
 *   POLAR_BENEFIT_ID       — UUID of the license-key benefit (optional;
 *                            if set, we reject keys for any other benefit)
 *   POLAR_API_BASE         — override base URL for testing (optional)
 */

import { Hono } from 'hono';
import { log } from './log.js';

const DEFAULT_POLAR_BASE = 'https://api.polar.sh';

interface PolarValidateResponse {
  id?: string;
  organization_id?: string;
  user_id?: string;
  customer_id?: string;
  benefit_id?: string;
  key?: string;
  display_key?: string;
  /** `granted` = active, `revoked` / `disabled` = not active. */
  status?: 'granted' | 'revoked' | 'disabled';
  limit_activations?: number | null;
  usage?: number;
  limit_usage?: number | null;
  validations?: number;
  last_validated_at?: string | null;
  expires_at?: string | null;
  // Error response shape (Polar returns 4xx with detail string)
  detail?: string | { msg: string }[];
}

export interface LicenseVerifyResult {
  ok: boolean;
  plan?: 'pro';
  purchaseId?: string;
  email?: string;
  reason?: string;
}

export interface LicenseRouteOptions {
  /** Polar organization UUID — `POLAR_ORGANIZATION_ID`. */
  organizationId: string;
  /** Optional: only accept keys for this benefit (license-key product). */
  benefitId?: string;
  /** Override API base for tests. */
  apiBase?: string;
}

export type LicenseValidator = (key: string) => Promise<LicenseVerifyResult>;

export function createLicenseValidator(opts: LicenseRouteOptions): LicenseValidator {
  const apiBase = (opts.apiBase ?? DEFAULT_POLAR_BASE).replace(/\/+$/, '');
  const validateUrl = `${apiBase}/v1/customer-portal/license-keys/validate`;

  return async (key: string): Promise<LicenseVerifyResult> => {
    const cleanKey = key.trim();
    if (!cleanKey) return { ok: false, reason: 'missing_key' };

    let upstream: Response;
    try {
      upstream = await fetch(validateUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          organization_id: opts.organizationId,
          key: cleanKey,
        }),
      });
    } catch (err) {
      log.warn({ err: String(err) }, 'license: polar fetch failed');
      return { ok: false, reason: 'upstream_unreachable' };
    }

    let data: PolarValidateResponse;
    try {
      data = (await upstream.json()) as PolarValidateResponse;
    } catch {
      return { ok: false, reason: 'upstream_invalid' };
    }

    // Polar returns 4xx with { detail } on invalid keys / unknown org / etc.
    if (!upstream.ok) {
      const reason = typeof data.detail === 'string'
        ? data.detail
        : Array.isArray(data.detail) && data.detail[0]?.msg
        ? data.detail[0].msg
        : 'invalid_key';
      return { ok: false, reason };
    }

    // Defensive: even on 200, status may not be 'granted'.
    if (data.status !== 'granted') {
      return { ok: false, reason: data.status ?? 'invalid_status' };
    }

    // Expiry — Polar returns ISO string or null. Treat past dates as revoked.
    if (data.expires_at) {
      const expiry = new Date(data.expires_at).getTime();
      if (Number.isFinite(expiry) && expiry < Date.now()) {
        return { ok: false, reason: 'expired' };
      }
    }

    // Optional product gating — reject keys for a different benefit if set.
    if (opts.benefitId && data.benefit_id && data.benefit_id !== opts.benefitId) {
      log.info(
        { expected: opts.benefitId, actual: data.benefit_id },
        'license: benefit mismatch',
      );
      return { ok: false, reason: 'wrong_product' };
    }

    const result: LicenseVerifyResult = { ok: true, plan: 'pro' };
    // Polar key id is stable per-purchase; doubles as our purchaseId.
    if (data.id) result.purchaseId = data.id;
    return result;
  };
}

export function createLicenseRoutes(opts: LicenseRouteOptions) {
  const router = new Hono();
  const validateLicense = createLicenseValidator(opts);

  // CORS — Figma plugin iframe sends `Origin: null`, so allow all origins.
  // This route only accepts a license key (no cookies/auth/sensitive data),
  // so wide-open CORS is safe. Middleware adds headers to every response
  // (incl. CORS preflight on OPTIONS).
  router.use('/license/verify', async (c, next) => {
    if (c.req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'POST, OPTIONS',
          'access-control-allow-headers': 'content-type',
          'access-control-max-age': '86400',
        },
      });
    }
    await next();
    c.res.headers.set('access-control-allow-origin', '*');
  });

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

    const result = await validateLicense(key);
    if (!result.ok) {
      const status = result.reason === 'upstream_unreachable' || result.reason === 'upstream_invalid'
        ? 502
        : 401;
      return c.json<LicenseVerifyResult>(result, status);
    }
    return c.json<LicenseVerifyResult>(result);
  });

  return router;
}
