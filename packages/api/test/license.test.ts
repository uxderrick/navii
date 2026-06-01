import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { createLicenseValidator } from '../src/license.js';

const POLAR_ORG = '00000000-0000-0000-0000-000000000001';
const POLAR_BENEFIT = '00000000-0000-0000-0000-000000000002';

function mockPolar(payload: unknown, init: ResponseInit = {}) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(payload), {
      status: init.status ?? 200,
      headers: { 'content-type': 'application/json' },
      ...init,
    }),
  );
}

function makeApp() {
  return createApp({ polarOrganizationId: POLAR_ORG, polarBenefitId: POLAR_BENEFIT });
}

async function postVerify(app: ReturnType<typeof createApp>, body: unknown) {
  return app.fetch(new Request('http://test/license/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

describe('license/verify — Polar backend', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns ok=true when Polar responds granted', async () => {
    mockPolar({
      id: 'license-1',
      organization_id: POLAR_ORG,
      benefit_id: POLAR_BENEFIT,
      key: 'KEY-ABC',
      status: 'granted',
      expires_at: null,
    });
    const app = makeApp();
    const res = await postVerify(app, { key: 'KEY-ABC' });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({ ok: true, plan: 'pro', purchaseId: 'license-1' });
  });

  it('shared validator returns ok=true when Polar responds granted', async () => {
    mockPolar({
      id: 'license-2',
      organization_id: POLAR_ORG,
      benefit_id: POLAR_BENEFIT,
      key: 'KEY-VALIDATOR',
      status: 'granted',
      expires_at: null,
    });
    const validate = createLicenseValidator({
      organizationId: POLAR_ORG,
      benefitId: POLAR_BENEFIT,
    });

    const result = await validate('KEY-VALIDATOR');

    expect(result).toMatchObject({ ok: true, plan: 'pro', purchaseId: 'license-2' });
  });

  it('shared validator rejects invalid Polar keys', async () => {
    mockPolar({ detail: 'License key not found' }, { status: 404 });
    const validate = createLicenseValidator({
      organizationId: POLAR_ORG,
      benefitId: POLAR_BENEFIT,
    });

    const result = await validate('KEY-NOPE');

    expect(result).toMatchObject({ ok: false, reason: 'License key not found' });
  });

  it('rejects when status is revoked', async () => {
    mockPolar({ id: 'license-1', status: 'revoked' });
    const app = makeApp();
    const res = await postVerify(app, { key: 'KEY-XYZ' });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.reason).toBe('revoked');
  });

  it('rejects when expires_at is in the past', async () => {
    mockPolar({
      id: 'license-1',
      benefit_id: POLAR_BENEFIT,
      status: 'granted',
      expires_at: '2020-01-01T00:00:00Z',
    });
    const app = makeApp();
    const res = await postVerify(app, { key: 'KEY-OLD' });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.reason).toBe('expired');
  });

  it('rejects when benefit_id does not match configured product', async () => {
    mockPolar({
      id: 'license-1',
      benefit_id: '00000000-0000-0000-0000-000000000999',
      status: 'granted',
    });
    const app = makeApp();
    const res = await postVerify(app, { key: 'KEY-OTHER' });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.reason).toBe('wrong_product');
  });

  it('returns 400 on missing key', async () => {
    const app = makeApp();
    const res = await postVerify(app, {});
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.reason).toBe('missing_key');
  });

  it('proxies Polar 4xx detail as reason', async () => {
    mockPolar({ detail: 'License key not found' }, { status: 404 });
    const app = makeApp();
    const res = await postVerify(app, { key: 'KEY-NOPE' });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.reason).toBe('License key not found');
  });

  it('returns 502 when upstream is unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('network'));
    const app = makeApp();
    const res = await postVerify(app, { key: 'KEY-NET' });
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.reason).toBe('upstream_unreachable');
  });

  it('route is not mounted when polarOrganizationId is omitted', async () => {
    const app = createApp(); // no Polar org configured
    const res = await postVerify(app, { key: 'whatever' });
    // Unmounted routes fall through to the catch-all 302 redirect to '/'.
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/');
  });
});
