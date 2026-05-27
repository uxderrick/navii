#!/usr/bin/env node
/**
 * Release readiness audit.
 *
 * Catches the gaps that bit us in 0.23.0 / 0.23.3 — version mismatches,
 * missing CHANGELOG entries, new public API surface that never landed in
 * README + docs.ts.
 *
 * Usage:
 *   node scripts/release-audit.mjs            # full audit vs main branch
 *   node scripts/release-audit.mjs vX.Y.Z     # audit for a specific tag
 *
 * Exit codes:
 *   0  — clean
 *   1  — gaps found (printed to stderr)
 *
 * Env:
 *   SKIP_RELEASE_AUDIT=1   bypasses the audit (escape hatch for hooks)
 *   AUDIT_BASE=<ref>       diff base (default: origin/main, then main)
 */

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

if (process.env['SKIP_RELEASE_AUDIT'] === '1') {
  process.exit(0);
}

const targetTag = process.argv[2];
const targetVersion = targetTag?.startsWith('v') ? targetTag.slice(1) : targetTag;

const findings = [];

function note(severity, msg) {
  findings.push({ severity, msg });
}

function git(args) {
  try {
    return execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf-8' }).trim();
  } catch (err) {
    return '';
  }
}

function readFile(rel) {
  const p = resolve(REPO_ROOT, rel);
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf-8');
}

function readJson(rel) {
  const src = readFile(rel);
  return src ? JSON.parse(src) : null;
}

// ─── 1. Package version sync ────────────────────────────────────────────────
const corePkg = readJson('packages/core/package.json');
const reactPkg = readJson('packages/react/package.json');
if (corePkg && reactPkg) {
  if (corePkg.version !== reactPkg.version) {
    note(
      'error',
      `core (${corePkg.version}) and react (${reactPkg.version}) versions out of sync — they ship in lockstep.`,
    );
  }
  // 2. React workspace dep on core must match core's version range.
  const dep = reactPkg.dependencies?.['@usenavii/core'];
  if (dep && dep.startsWith('workspace:')) {
    const range = dep.replace(/^workspace:/, '');
    const want = `^${corePkg.version.replace(/-.*$/, '')}`;
    const wantMajor = `^${corePkg.version.split('.')[0]}.${corePkg.version.split('.')[1]}.0`;
    if (range !== want && range !== wantMajor && range !== corePkg.version) {
      note(
        'error',
        `packages/react/package.json: @usenavii/core dep is "${dep}" but core is at ${corePkg.version}. Bump to "workspace:${want}" or pnpm install will fail in CI.`,
      );
    }
  }
}

// ─── 3. CHANGELOG entry exists for the target version ───────────────────────
const changelog = readFile('CHANGELOG.md') ?? '';
if (targetVersion) {
  const header = new RegExp(`^## \\[${targetVersion.replace(/\./g, '\\.')}\\]`, 'm');
  if (!header.test(changelog)) {
    note(
      'error',
      `CHANGELOG.md has no entry for v${targetVersion}. Add a "## [${targetVersion}] - YYYY-MM-DD" section before tagging.`,
    );
  }
}

// ─── Diff vs base ───────────────────────────────────────────────────────────
const base = process.env['AUDIT_BASE']
  ?? (git(['rev-parse', '--verify', 'origin/main']) ? 'origin/main' : 'main');
const diff = git(['diff', `${base}...HEAD`, '--unified=0']);

function addedLines(filePattern) {
  // Extract added lines (prefixed with '+', not '+++') under hunks for files
  // matching the pattern.
  const lines = diff.split('\n');
  const out = [];
  let inFile = false;
  for (const line of lines) {
    if (line.startsWith('diff --git ')) {
      inFile = filePattern.test(line);
      continue;
    }
    if (!inFile) continue;
    if (line.startsWith('+') && !line.startsWith('+++')) {
      out.push(line.slice(1));
    }
  }
  return out;
}

// ─── 4. New core exports vs READMEs ─────────────────────────────────────────
const coreAdds = [
  ...addedLines(/packages\/core\/src\/types\.ts/),
  ...addedLines(/packages\/core\/src\/index\.ts/),
];
const exportTypeRe = /export\s+(?:type|interface)\s+([A-Z][A-Za-z0-9_]*)/g;
const newTypes = new Set();
for (const line of coreAdds) {
  for (const m of line.matchAll(exportTypeRe)) {
    newTypes.add(m[1]);
  }
}

const readmes = [
  ['README.md', readFile('README.md') ?? ''],
  ['packages/core/README.md', readFile('packages/core/README.md') ?? ''],
  ['packages/react/README.md', readFile('packages/react/README.md') ?? ''],
];
const docsTs = readFile('packages/api/src/docs.ts') ?? '';

for (const name of newTypes) {
  const inAnyReadme = readmes.some(([, src]) => src.includes(name));
  const inDocsTs = docsTs.includes(name);
  if (!inAnyReadme) {
    note(
      'warn',
      `new export "${name}" — not mentioned in any README. Add to relevant package README props/options table.`,
    );
  }
  if (!inDocsTs) {
    note(
      'warn',
      `new export "${name}" — not mentioned in packages/api/src/docs.ts. Add to /docs/sdk-core SDK reference.`,
    );
  }
}

// ─── 5. New API query params vs docs.ts ─────────────────────────────────────
const apiAdds = addedLines(/packages\/api\/src\/app\.ts/);
const queryParamRe = /c\.req\.query\(\s*['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]\s*\)/g;
const newQueryParams = new Set();
for (const line of apiAdds) {
  for (const m of line.matchAll(queryParamRe)) {
    newQueryParams.add(m[1]);
  }
}
// Filter out params we know are already documented (path-segment, raw bytes, etc).
for (const param of newQueryParams) {
  // Check docs.ts for `<code>param</code>` in a table cell.
  const present = docsTs.includes(`<code>${param}</code>`);
  if (!present) {
    note(
      'warn',
      `new /avatar query param "${param}" — not found as <code>${param}</code> in packages/api/src/docs.ts. Add a row to the /avatar/:seed param table.`,
    );
  }
}

// ─── 6. New API routes vs docs.ts ───────────────────────────────────────────
const routeRe = /app\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/g;
const newRoutes = new Set();
for (const line of apiAdds) {
  for (const m of line.matchAll(routeRe)) {
    const path = m[2];
    // Skip param-substituted routes (we expand `:` paths to a base check)
    const base = path.split('/').filter(Boolean)[0];
    if (base) newRoutes.add(base);
  }
}
const documentedRoutes = new Set();
for (const m of docsTs.matchAll(/GET\s+\/([a-zA-Z_][a-zA-Z0-9_-]*)/g)) {
  documentedRoutes.add(m[1]);
}
for (const route of newRoutes) {
  if (!documentedRoutes.has(route) && !['polar', 'license', 'healthz', 'sitemap.xml', 'robots.txt', 'og.png', 'og.svg'].includes(route)) {
    note(
      'warn',
      `new API route "/${route}" — no mention in packages/api/src/docs.ts HTTP API page.`,
    );
  }
}

// ─── Report ─────────────────────────────────────────────────────────────────
const errors = findings.filter((f) => f.severity === 'error');
const warns = findings.filter((f) => f.severity === 'warn');

if (errors.length || warns.length) {
  const stream = process.stderr;
  stream.write(`\n[release-audit] gaps detected${targetVersion ? ` for v${targetVersion}` : ''}:\n\n`);
  for (const f of errors) stream.write(`  [error] ${f.msg}\n`);
  for (const f of warns) stream.write(`  [warn]  ${f.msg}\n`);
  stream.write(`\nBypass: SKIP_RELEASE_AUDIT=1 git tag ...\n`);
  process.exit(errors.length ? 1 : 0);
}

process.stdout.write(`[release-audit] all clean${targetVersion ? ` for v${targetVersion}` : ''}.\n`);
process.exit(0);
