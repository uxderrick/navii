---
description: Audit working tree for release-readiness — version sync, CHANGELOG entry, doc parity for new exports + API params.
---

Run the release audit script and report findings.

```bash
node scripts/release-audit.mjs $ARGUMENTS
```

If the audit reports gaps, list them concisely with the relevant file paths. If clean, just confirm.

Notes:
- Pass a target version (e.g. `/release-check v0.24.0`) to also verify the CHANGELOG has the matching `## [0.24.0]` header. Without an argument, the version-specific check is skipped.
- The same script runs automatically via the `PreToolUse` hook on `git tag -a v*`, so the audit always gates a real tag cut.
- Bypass: `SKIP_RELEASE_AUDIT=1` env var, only when intentional.
