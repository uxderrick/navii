# Release Hygiene — Design

**Date:** 2026-05-23
**Status:** Approved
**Driver:** Consumer feedback on `@usenavii/react@0.4.0` — wants deprecation signals, no in-place changes, and release notes.

## Problem

`@usenavii/core` and `@usenavii/react` ship to npm via tag-triggered CI. Today:

- No CHANGELOG. Consumers cannot tell what changed between versions.
- No GitHub release notes. Tag page is bare.
- No documented versioning policy. Consumers cannot trust "patch = safe upgrade".
- No deprecation flow for shipped-with-critical-bug versions.

A pinned consumer (`@usenavii/react@0.4.0`) has asked us to fix all three.

## Goals

1. Publish human-readable notes for every released version.
2. Make the versioning contract explicit and enforceable.
3. Provide a safe, audited mechanism to deprecate a bad release.
4. Add zero new dependencies (manual approach over Changesets / release-please).

## Non-goals

- Automated version bumping (manual `package.json` edit stays).
- Auto-generating CHANGELOG from commits (curation by hand).
- Decoupling `core` and `react` versions (still shipped in lockstep).
- Multi-maintainer workflows (solo dev for now).

## Design

### 1. Versioning policy — `CONTRIBUTING.md`

New file at repo root. Short. Covers:

- **SemVer strict**:
  - `patch` (`0.4.x`) — bug fix, no public API change.
  - `minor` (`0.x.0`) — additive, backward compatible.
  - `major` (`x.0.0`) — breaking. `0.x` line counts minor bumps as potentially breaking per SemVer spec; document any break in CHANGELOG `Changed` section.
- **Never republish a version.** Any change after publish requires a new patch minimum. Enforced by `release.yml` (already skips republish) and by registry immutability.
- **Lockstep versions.** `@usenavii/core` and `@usenavii/react` always ship the same version. React depends on core via `workspace:^x.y.z` and is rebuilt against the matching core.
- **Pre-publish checklist**:
  - [ ] Both `package.json` versions bumped and match
  - [ ] `react` dep on `core` updated to `workspace:^<new>`
  - [ ] `CHANGELOG.md` `[Unreleased]` section finalized under new version header
  - [ ] `pnpm -r build && pnpm -r typecheck && pnpm -r test` clean
  - [ ] Tag `vX.Y.Z` matches `package.json`
  - [ ] Push tag (CI handles publish + release notes)

### 2. CHANGELOG — root `CHANGELOG.md`

Single file at repo root. [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

```markdown
# Changelog

All notable changes to `@usenavii/core` and `@usenavii/react`.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org).

## [Unreleased]

## [0.4.1] - 2026-MM-DD
### Fixed
- Description of the bug, user-facing impact.

### Deprecated
- `0.4.0` — Critical bug in X, upgrade to `0.4.1`.

## [0.4.0] - YYYY-MM-DD
### Added
- ...

[Unreleased]: https://github.com/uxderrick/navii/compare/v0.4.1...HEAD
[0.4.1]: https://github.com/uxderrick/navii/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/uxderrick/navii/releases/tag/v0.4.0
```

Section vocabulary: **Added / Changed / Deprecated / Removed / Fixed / Security**. Only include sections that have entries.

Entries are user-visible. Internal refactors, doc-only commits, CI churn — omit. If in doubt, ask "would a consumer care?". If no — skip.

`README.md` (root) gets a one-line link to the changelog under a new `## Changelog` section.

### 3. GitHub release notes — extend `.github/workflows/release.yml`

Add a `release-notes` job:

- Depends on `publish-npm`.
- Runs only on `v*` tag push.
- Extracts the `## [<version>]` section from `CHANGELOG.md` into a temp file.
- Creates a GitHub release via `gh release create "$GITHUB_REF_NAME" --notes-file notes.md --title "$GITHUB_REF_NAME"`.

Extractor: small awk one-liner.

```bash
VERSION="${GITHUB_REF_NAME#v}"
awk -v ver="$VERSION" '
  $0 ~ "^## \\[" ver "\\]" { capture = 1; next }
  capture && /^## \[/ { exit }
  capture { print }
' CHANGELOG.md > notes.md
```

If `notes.md` is empty: fail the job loudly (forces CHANGELOG discipline before tag push).

Permissions: workflow needs `contents: write` to create releases. Add to job-level `permissions`.

### 4. Deprecate workflow — new `.github/workflows/deprecate.yml`

Separate from release. Manual trigger only.

```yaml
name: deprecate

on:
  workflow_dispatch:
    inputs:
      package:
        description: Package to deprecate
        type: choice
        required: true
        options:
          - '@usenavii/core'
          - '@usenavii/react'
          - both
      version:
        description: Version (e.g. 0.4.0)
        required: true
      message:
        description: Deprecation message shown by npm
        required: true

jobs:
  deprecate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'
      - name: deprecate
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          PKG: ${{ inputs.package }}
          VER: ${{ inputs.version }}
          MSG: ${{ inputs.message }}
        run: |
          run_one() { npm deprecate "$1@$VER" "$MSG"; }
          if [ "$PKG" = "both" ]; then
            run_one "@usenavii/core"
            run_one "@usenavii/react"
          else
            run_one "$PKG"
          fi
```

Behavior:

- Audit trail = Actions tab.
- Reuses existing `NPM_TOKEN` (must have `deprecate` permission, which the publish token already has).
- After deprecating, the next patch release MUST list it in CHANGELOG under `Deprecated`. Add this to the CONTRIBUTING checklist.
- To un-deprecate: re-run with empty message (`npm deprecate` with `""` clears).

### 5. Backfill

One-time:

- Reconstruct CHANGELOG entries back to `0.4.0` from git history. Scope to user-visible changes (API surface, behavior, public docs). Skip CI/docs/internal.
- Create missing GitHub releases for tagged versions using the new extractor against the backfilled CHANGELOG.
- Add `## Changelog` section to root `README.md` linking to `CHANGELOG.md`.

Tag inventory at time of writing: `v0.8.0` through `v0.9.7`. Confirm during execution which of these are npm-published (vs API/docker-only) — only npm-published versions need CHANGELOG entries scoped to the libraries. API/docker tags can get a short note or be skipped.

## File summary

New:
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- `.github/workflows/deprecate.yml`
- `docs/superpowers/specs/2026-05-23-release-hygiene-design.md` (this file)

Modified:
- `.github/workflows/release.yml` — add `release-notes` job
- `README.md` — add `## Changelog` section

## Open questions

None at design time. Backfill scope (which tags are npm vs api-only) resolved during execution by checking `npm view @usenavii/core versions`.

## Out of scope / future

- Auto-bumping via Changesets — revisit if a second maintainer joins or release cadence outpaces manual diligence.
- Per-package CHANGELOGs — revisit if `core` and `react` ever decouple versions.
- Provenance attestations (`npm publish --provenance`) — separate hardening pass.
