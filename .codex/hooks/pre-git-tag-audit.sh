#!/usr/bin/env bash
#
# PreToolUse hook — fires when Claude is about to run a Bash command. If the
# command is a `git tag -a v<X.Y.Z>` (i.e. cutting a release), it invokes
# scripts/release-audit.mjs with the version. Any errors block the tag.
#
# Bypass:  SKIP_RELEASE_AUDIT=1 (passed through to the script)
#
# Claude Code calls the hook with a JSON event on stdin describing the
# pending tool call. We read it, decide, and exit:
#   exit 0  → allow the command
#   exit 2  → block + send our stderr back to Claude as feedback
#
set -euo pipefail

# Resolve repo root (this script lives in <repo>/.claude/hooks/).
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$HERE/../.." && pwd)"

# Read the event payload — we only care about Bash tool calls with a `command`.
EVENT_JSON="$(cat || true)"
if [[ -z "$EVENT_JSON" ]]; then
  exit 0
fi

# Extract command via node (no jq dependency). Falls back to empty if parse fails.
CMD="$(node -e "
try {
  const e = JSON.parse(process.argv[1] || '{}');
  // PreToolUse event shape: { tool_name: 'Bash', tool_input: { command: '...' } }
  const cmd = e.tool_input?.command ?? e.toolInput?.command ?? '';
  process.stdout.write(cmd);
} catch { /* noop */ }
" "$EVENT_JSON")"

# Only intercept release-cut commands: git tag -a v<X.Y.Z> ...
if ! [[ "$CMD" =~ git[[:space:]]+tag[[:space:]]+-a[[:space:]]+v?([0-9]+\.[0-9]+\.[0-9]+) ]]; then
  exit 0
fi

VERSION="${BASH_REMATCH[1]}"

cd "$REPO_ROOT"

# Run audit. Exit 0 → proceed silently. Non-zero → block with stderr captured.
AUDIT_OUTPUT="$(node scripts/release-audit.mjs "v$VERSION" 2>&1)" || AUDIT_EXIT=$?
AUDIT_EXIT="${AUDIT_EXIT:-0}"

if [[ "$AUDIT_EXIT" -eq 0 ]]; then
  # Clean — print the success line back to Claude as informational.
  printf '%s\n' "$AUDIT_OUTPUT" 1>&2
  exit 0
fi

# Block: write findings to stderr (Claude sees them).
{
  printf '\n[pre-git-tag-audit] release audit failed for v%s — tag blocked.\n' "$VERSION"
  printf '%s\n' "$AUDIT_OUTPUT"
  printf '\nFix the gaps above, or set SKIP_RELEASE_AUDIT=1 if you really need to bypass.\n'
} 1>&2

exit 2
