# Claude Code project config

## Hooks

### `PreToolUse: pre-git-tag-audit`

Fires before any `Bash` tool call. Greps the command for `git tag -a v<X.Y.Z>`. When matched, runs `scripts/release-audit.mjs` with the version and blocks the tag (exit 2) if the audit reports errors.

**What the audit checks** (see `scripts/release-audit.mjs`):

1. `@usenavii/core` and `@usenavii/react` package versions match (they ship in lockstep).
2. `packages/react/package.json` deps `@usenavii/core` at the matching workspace range — the bug that killed `v0.23.0`'s release pipeline.
3. `CHANGELOG.md` has a `## [X.Y.Z]` heading for the target tag.
4. New `export type` / `export interface` symbols in `packages/core/src/types.ts` + `index.ts` appear in at least one README and in `packages/api/src/docs.ts` (SDK reference page).
5. New `c.req.query('foo')` calls in `packages/api/src/app.ts` have a matching `<code>foo</code>` row in the docs.ts API reference.
6. New `app.get('/route', ...)` declarations have a matching `GET /route` section in docs.ts.

Errors block the tag. Warnings print but don't block.

**Bypass:** `SKIP_RELEASE_AUDIT=1 git tag -a vX.Y.Z` — escape hatch only.

## Commands

### `/release-check [vX.Y.Z]`

Runs the same audit on demand. Useful before staging a release commit.

## Permissions

`settings.local.json` carries developer-machine permission grants and is gitignored. `settings.json` ships with the repo and only registers the hook above.
