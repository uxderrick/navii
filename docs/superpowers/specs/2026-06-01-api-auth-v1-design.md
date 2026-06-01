# API Auth V1 Design

## Goal

Make Navii Pro usable from the hosted API without adding accounts or a database.
The same Polar license key that unlocks the Figma plugin should work as an API
bearer token.

## Product Contract

The free API stays anonymous and backwards-compatible. Existing URLs like
`/avatar/alice` keep working with no auth and the same response shape.

Auth is required only when the caller requests a Pro-only capability. For v1,
the first gated capability is `?pro=1`, an auth probe that renders the same
avatar after proving the caller has a valid Pro license. Future Pro features
such as `?pack=...` will reuse the same gate. Missing or invalid auth returns
JSON with a clear upgrade path.

`https://navii.dev/pro` is the stable upgrade URL. For now it redirects to the
existing Polar checkout route. Later it can become a pricing page without
changing API clients, docs, plugin copy, or SDKs.

## API Behavior

Clients pass the Polar license key directly:

```http
Authorization: Bearer <polar_license_key>
```

Missing Pro auth response:

```json
{
  "error": "pro_auth_required",
  "message": "This option requires Navii Pro. Get a license at https://navii.dev/pro.",
  "upgradeUrl": "https://navii.dev/pro"
}
```

Invalid or inactive license response:

```json
{
  "error": "invalid_license",
  "message": "The Navii Pro license key is invalid or inactive. Get a license at https://navii.dev/pro.",
  "upgradeUrl": "https://navii.dev/pro"
}
```

Both errors should use `401`. The response should include
`content-type: application/json`.

## Architecture

Extract the existing Polar license validation logic into a reusable helper that
can serve both `POST /license/verify` and API bearer-token checks.

Add a small in-memory license cache around that helper:

- Cache key: the raw license key string.
- Cache value: validation result, including positive or negative status.
- TTL: 24 hours.
- Scope: per API process only.

This preserves the current stateless deployment model. Polar remains the source
of truth. A revoked key may remain accepted until the local cache expires, which
matches the current Figma plugin revalidation window and is acceptable for v1.

## Routes

Add:

```txt
GET /pro -> 302 /checkout
```

Keep `/checkout` as the Polar integration point. `/pro` is the public, stable
product URL used in API errors and user-facing copy.

## Data Flow

1. Request arrives for a free option.
2. API renders as it does today, with no auth check.
3. Request arrives for a Pro-only option.
4. API reads `Authorization`.
5. If missing or malformed, return `pro_auth_required`.
6. If present, validate via cache first, then Polar on cache miss.
7. If invalid, return `invalid_license`.
8. If valid, continue to the existing renderer.

## Error Handling

Malformed `Authorization` headers are treated as missing auth. Upstream Polar
network failures should return a temporary auth failure rather than silently
allowing access. Use `502` only when the server cannot determine license status;
otherwise use `401` for missing or invalid credentials.

## Testing

Add API tests for:

- `/pro` redirects to `/checkout`.
- Free `/avatar/:seed` remains anonymous.
- Pro-only query without auth returns `401 pro_auth_required`.
- Pro-only query with invalid auth returns `401 invalid_license`.
- Pro-only query with valid auth reaches the normal rendering path.
- License validation uses the cache so repeated requests do not repeatedly call
  Polar within the TTL.

## Non-Goals

- No generated `navii_pk_...` keys yet.
- No account dashboard.
- No database.
- No per-key management, rotation, or revocation UI.
- No team entitlements.
- No server-side brand palette storage in this slice.
