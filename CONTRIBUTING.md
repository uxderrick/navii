# Contributing

Small project, mostly solo. The notes below exist so consumers of `@usenavii/core` and `@usenavii/react` know what to expect from a version bump.

## Versioning

Both packages follow [SemVer](https://semver.org) and ship in **lockstep** — they always have the same version, and `@usenavii/react` depends on the matching `@usenavii/core` via `workspace:^<version>`.

| Bump | When |
|------|------|
| `patch` (`0.4.x`) | Bug fix. No public API change. Safe upgrade. |
| `minor` (`0.x.0`) | New surface, backward compatible. Existing code keeps working. |
| `major` (`x.0.0`) | Breaking change. Documented in `CHANGELOG.md` under `Changed`. |

Because we are still on `0.x`, treat minor bumps as *potentially* breaking per the SemVer spec. Any breakage is called out explicitly in `CHANGELOG.md`.

## Never republish a version

A published version is final. Any change after publish requires a **new patch** (minimum). This is enforced by:

1. **npm registry immutability** — published tarballs cannot be overwritten.
2. **CI** — `.github/workflows/release.yml` checks `npm view` and skips the publish step if the version already exists.

If a published version has a critical bug, the fix path is:

1. Land the fix.
2. Bump patch and publish (e.g. `0.4.0` → `0.4.1`).
3. Run the **deprecate** workflow against the bad version with a message pointing to the fix.

## Deprecating a bad release

Manual GitHub Actions trigger — no local `npm login` needed.

1. Go to **Actions → deprecate → Run workflow**.
2. Inputs:
   - `package` — `@usenavii/core`, `@usenavii/react`, or `both`
   - `version` — e.g. `0.4.0`
   - `message` — e.g. `Critical bug in seed derivation, upgrade to 0.4.1`
3. Consumers see `npm warn deprecated @usenavii/react@0.4.0: …` on their next install.
4. Record the deprecation in the next release's `CHANGELOG.md` under `### Deprecated`.

To un-deprecate, re-run with an empty message.

## Release checklist

Before pushing a `vX.Y.Z` tag:

- [ ] `packages/core/package.json` and `packages/react/package.json` versions match and are bumped
- [ ] `packages/react/package.json` `dependencies."@usenavii/core"` is `workspace:^<new version>`
- [ ] `CHANGELOG.md` has a finalized section for the new version (move from `[Unreleased]`, add date, add compare link)
- [ ] `pnpm -r run build && pnpm -r run typecheck && pnpm -r run test` is clean
- [ ] Tag `vX.Y.Z` matches the version in `package.json`
- [ ] `git push --tags` — CI handles publish + GitHub release notes

## CHANGELOG entries

Format is [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Sections used:

- **Added** — new public API or behavior
- **Changed** — change to existing public behavior
- **Deprecated** — versions or APIs marked for removal
- **Removed** — APIs gone
- **Fixed** — bug fixes
- **Security** — anything with a security implication

Write entries from the consumer's point of view. Skip internal refactors, doc-only commits, and CI churn — they don't belong in a CHANGELOG that consumers read to decide whether to upgrade.
