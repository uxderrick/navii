/**
 * /blog — release timeline rendered from CHANGELOG.md.
 *
 * Source of truth: CHANGELOG.md at repo root. Parsed at request time (page is
 * small + cheap; reverse proxy adds a fronting cache when desired). No DB.
 *
 * Filter: only `x.y.0` minor releases surface on the index. Patch releases
 * still live in CHANGELOG.md / GitHub releases / npm tarballs — they're just
 * not promoted to the timeline.
 *
 * Each entry routes to `/blog/v<x.y.z>` for deep linking + OG cards.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));

const API_BASE = process.env['NAVII_API_BASE'] ?? 'https://api.navii.dev';
const SITE_BASE = process.env['NAVII_SITE_BASE'] ?? 'https://navii.dev';

interface ReleaseGroup {
  /** Section heading, e.g. "Added (@usenavii/core 0.6.0)". */
  title: string;
  /** Bullet items as raw markdown source (inline markdown preserved). */
  bullets: string[];
}

interface Release {
  version: string;          // "0.23.0"
  date: string;             // "2026-05-26"
  yanked: boolean;
  yankedReason: string;     // trailing parenthetical after the date
  groups: ReleaseGroup[];
  /** First bold-prefixed bullet text — used as the release headline. */
  headline: string;
}

const RELEASE_HEADER_RE = /^##\s+\[(\d+\.\d+\.\d+)\]\s*-\s*(\d{4}-\d{2}-\d{2})(.*)$/;
const GROUP_HEADER_RE = /^###\s+(.+)$/;
const BULLET_RE = /^[-*]\s+(.+)$/;
const BOLD_LEAD_RE = /^\*\*([^*]+)\*\*\s*(?:—|–|-|:)?\s*(.*)$/;

/** Load CHANGELOG.md from disk. File is tiny — re-read per request. */
function readChangelog(): string {
  // dev: packages/api/src/blog.ts → repo root CHANGELOG.md
  // build: packages/api/dist/blog.js → same
  // docker: /app/dist/blog.js → /app/CHANGELOG.md (Dockerfile copies it)
  const candidates = [
    resolve(HERE, '../../../CHANGELOG.md'),
    resolve(HERE, '../CHANGELOG.md'),
  ];
  for (const path of candidates) {
    try {
      return readFileSync(path, 'utf-8');
    } catch {
      // try next
    }
  }
  return '';
}

function parseChangelog(source: string): Release[] {
  const lines = source.split('\n');
  const releases: Release[] = [];
  let current: Release | null = null;
  let currentGroup: ReleaseGroup | null = null;

  for (const line of lines) {
    const header = line.match(RELEASE_HEADER_RE);
    if (header) {
      if (current) releases.push(finalize(current));
      const version = header[1]!;
      const date = header[2]!;
      const trail = (header[3] ?? '').trim();
      const yankedMatch = trail.match(/^\((yanked[^)]*)\)$/i);
      current = {
        version,
        date,
        yanked: yankedMatch !== null,
        yankedReason: yankedMatch?.[1] ?? '',
        groups: [],
        headline: '',
      };
      currentGroup = null;
      continue;
    }
    if (!current) continue;

    const groupHeader = line.match(GROUP_HEADER_RE);
    if (groupHeader) {
      currentGroup = { title: groupHeader[1]!.trim(), bullets: [] };
      current.groups.push(currentGroup);
      continue;
    }

    const bullet = line.match(BULLET_RE);
    if (bullet && currentGroup) {
      currentGroup.bullets.push(bullet[1]!.trim());
    }
  }
  if (current) releases.push(finalize(current));
  return releases;
}

function finalize(r: Release): Release {
  // Extract a headline from the first bold-prefixed bullet across all groups.
  for (const g of r.groups) {
    for (const b of g.bullets) {
      const m = b.match(BOLD_LEAD_RE);
      if (m) {
        r.headline = m[1]!.trim();
        return r;
      }
    }
  }
  // Fallback — first bullet plain text (first 80 chars).
  const firstBullet = r.groups[0]?.bullets[0];
  if (firstBullet) {
    r.headline = firstBullet.length > 80 ? firstBullet.slice(0, 77) + '…' : firstBullet;
  } else {
    r.headline = `Release ${r.version}`;
  }
  return r;
}

/** Minor+ filter — patch === 0. */
function isMinor(version: string): boolean {
  const parts = version.split('.');
  return parts[2] === '0';
}

/** Inline markdown → safe HTML. Supports **bold**, `code`, [text](url). */
function renderInline(md: string): string {
  let s = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]*)\)/g, '<a href="$2">$1</a>');
  return s;
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function heroSeedFor(version: string): string {
  return `navii ${version}`;
}

function heroImgFor(version: string, size = 128): string {
  const seed = encodeURIComponent(heroSeedFor(version));
  return `${API_BASE}/avatar/${seed}?size=${size}&mood=happy&animated=1`;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map((n) => Number.parseInt(n, 10));
  if (!y || !m || !d) return iso;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[m - 1]} ${d}, ${y}`;
}

function renderGroup(g: ReleaseGroup): string {
  const items = g.bullets.map((b) => `<li>${renderInline(b)}</li>`).join('');
  return `<div class="bl-group">
    <h4 class="bl-group-title">${renderInline(g.title)}</h4>
    <ul class="bl-bullets">${items}</ul>
  </div>`;
}

function renderRelease(r: Release, opts: { permalink: boolean }): string {
  const groupsHtml = r.groups.map(renderGroup).join('');
  const versionHref = `/blog/v${r.version}`;
  const ghHref = `https://github.com/uxderrick/navii/releases/tag/v${r.version}`;
  const yankedBadge = r.yanked
    ? `<span class="bl-yanked" title="${escapeAttr(r.yankedReason)}">yanked</span>`
    : '';

  return `<article class="bl-entry" id="v${r.version}">
    <div class="bl-rail"><span class="bl-dot" aria-hidden="true"></span></div>
    <div class="bl-card">
      <header class="bl-head">
        <div class="bl-meta">
          <a class="bl-version" href="${versionHref}">v${r.version}</a>
          <span class="bl-date">${formatDate(r.date)}</span>
          ${yankedBadge}
        </div>
        ${opts.permalink ? '' : `<a class="bl-permalink" href="${versionHref}" aria-label="Permalink">#</a>`}
      </header>
      <h2 class="bl-headline">${renderInline(r.headline)}</h2>
      <div class="bl-body">
        ${groupsHtml}
      </div>
      <footer class="bl-foot">
        <a href="${ghHref}" rel="noopener" target="_blank">Full diff + release notes on GitHub →</a>
      </footer>
    </div>
    <aside class="bl-hero" aria-hidden="true">
      <img src="${heroImgFor(r.version)}" alt="" width="128" height="128" loading="lazy" />
    </aside>
  </article>`;
}

function shell(opts: {
  title: string;
  description: string;
  canonicalPath: string;
  content: string;
}): string {
  const pageTitle = `${opts.title} — Navii`;
  const desc = opts.description.replace(/"/g, '&quot;');
  const url = `${SITE_BASE}${opts.canonicalPath}`;
  const ogImage = `${API_BASE}/og.png`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${pageTitle}</title>
<meta name="description" content="${desc}" />
<meta name="theme-color" content="#0a0a0b" />
<meta name="color-scheme" content="dark" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${url}" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="preconnect" href="${API_BASE}" crossorigin />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet" />

<meta property="og:type" content="article" />
<meta property="og:site_name" content="Navii blog" />
<meta property="og:title" content="${pageTitle}" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${pageTitle}" />
<meta name="twitter:description" content="${desc}" />
<meta name="twitter:image" content="${ogImage}" />

<style>
:root {
  --bg: #0a0a0b;
  --bg-2: #131316;
  --bg-3: #18181b;
  --ink: #f5f5f5;
  --muted: #a1a1aa;
  --muted-2: #71717a;
  --line: #1f1f24;
  --accent: #c084fc;
  --accent-2: #a855f7;
  --warn: #fbbf24;
  --radius: 14px;
  color-scheme: dark;
}
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); color: var(--ink); }
body {
  font: 16px/1.65 'Inter', 'Inter Display', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-feature-settings: 'cv11', 'ss01', 'ss03';
  -webkit-font-smoothing: antialiased;
}
a { color: var(--ink); text-decoration: none; }
a:hover { color: var(--accent); }
code, .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; }
:not(pre) > code { background: var(--bg-2); border: 1px solid var(--line); padding: 1px 6px; border-radius: 4px; font-size: 12.5px; }

.layout { max-width: 920px; margin: 0 auto; padding: 0 24px 96px; }

nav.top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px;
  position: sticky; top: 0; z-index: 50;
  background: rgba(10, 10, 11, 0.72);
  backdrop-filter: saturate(140%) blur(10px);
  -webkit-backdrop-filter: saturate(140%) blur(10px);
  border-bottom: 1px solid var(--line);
}
nav.top .brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 600; }
nav.top .brand img { width: 26px; height: 26px; border-radius: 50%; background: var(--bg-2); }
nav.top .brand .sep { color: var(--muted-2); margin: 0 2px; }
nav.top .brand .sub { color: var(--muted); font-weight: 500; }
nav.top .links { display: flex; gap: 20px; font-size: 14px; color: var(--muted-2); }
nav.top .links a:hover { color: var(--ink); }

header.bl-header {
  padding: 56px 0 28px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 40px;
}
header.bl-header h1 {
  margin: 0 0 8px;
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
header.bl-header p {
  margin: 0;
  color: var(--muted);
  font-size: 16px;
  max-width: 56ch;
}

.bl-list { display: flex; flex-direction: column; gap: 8px; }

.bl-entry {
  display: grid;
  grid-template-columns: 28px 1fr 144px;
  gap: 20px;
  position: relative;
  scroll-margin-top: 96px;
}

.bl-rail {
  position: relative;
  width: 28px;
  display: flex;
  justify-content: center;
}
.bl-rail::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: -8px;
  width: 1px;
  background: var(--line);
  transform: translateX(-0.5px);
}
.bl-entry:last-child .bl-rail::before { bottom: 50%; }
.bl-entry:first-child .bl-rail::before { top: 24px; }
.bl-dot {
  position: absolute;
  top: 22px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--bg);
}

.bl-card {
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 22px 24px 18px;
  min-width: 0;
}

.bl-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}
.bl-meta { display: inline-flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.bl-version {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  font-size: 12px;
  padding: 3px 8px;
  background: var(--bg-3);
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--ink);
  letter-spacing: 0.01em;
}
.bl-version:hover { border-color: var(--accent); color: var(--accent); }
.bl-date { font-size: 13px; color: var(--muted); }
.bl-yanked {
  font-size: 10px;
  padding: 2px 7px;
  background: rgba(251, 191, 36, 0.12);
  color: var(--warn);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.bl-permalink {
  color: var(--muted-2);
  font-family: ui-monospace, monospace;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.12s, color 0.12s;
}
.bl-entry:hover .bl-permalink { opacity: 1; }
.bl-permalink:hover { color: var(--accent); }

.bl-headline {
  margin: 6px 0 18px;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.bl-body { display: flex; flex-direction: column; gap: 16px; }
.bl-group-title {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}
.bl-bullets {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--ink);
}
.bl-bullets li::marker { color: var(--muted-2); }
.bl-bullets li { font-size: 14.5px; line-height: 1.6; }
.bl-bullets strong { color: var(--ink); font-weight: 600; }

.bl-foot {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed var(--line);
  font-size: 13px;
}
.bl-foot a { color: var(--muted); }
.bl-foot a:hover { color: var(--accent); }

.bl-hero {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
}
.bl-hero img {
  border-radius: 24px;
  background: var(--bg-2);
  border: 1px solid var(--line);
  filter: drop-shadow(0 8px 24px rgba(192, 132, 252, 0.08));
}

.bl-empty {
  padding: 40px 24px;
  text-align: center;
  color: var(--muted);
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

@media (max-width: 720px) {
  .bl-entry { grid-template-columns: 20px 1fr; }
  .bl-hero { display: none; }
  .bl-rail { width: 20px; }
  header.bl-header h1 { font-size: 32px; }
}
</style>

<script defer src="https://analytics.uxderrick.com/script.js" data-website-id="9adc73e7-ce4c-454c-bd2c-663eca5c9abe"></script>
</head>
<body>
<div class="layout">
  <nav class="top">
    <a class="brand" href="${SITE_BASE}/">
      <img src="/favicon.svg" alt="navii" />
      <span>navii</span>
      <span class="sep">/</span>
      <span class="sub">blog</span>
    </a>
    <div class="links">
      <a href="${SITE_BASE}/">landing</a>
      <a href="/docs/quickstart">docs</a>
      <a href="https://github.com/uxderrick/navii">github</a>
    </div>
  </nav>

  ${opts.content}
</div>
</body>
</html>`;
}

/** Render the /blog index page (timeline of minor+ releases). */
export function blogIndexHtml(): string {
  const releases = parseChangelog(readChangelog()).filter((r) => isMinor(r.version));
  const items = releases.length
    ? releases.map((r) => renderRelease(r, { permalink: false })).join('')
    : '<div class="bl-empty">No releases yet. Check back soon.</div>';

  const content = `
  <header class="bl-header">
    <h1>Blog</h1>
    <p>Release notes, design decisions, and what's new in Navii. Minor and major versions only — patches live on <a href="https://github.com/uxderrick/navii/blob/main/CHANGELOG.md">CHANGELOG.md</a>.</p>
  </header>

  <section class="bl-list">
    ${items}
  </section>
  `;
  return shell({
    title: 'Blog',
    description: "Release notes and what's new in Navii — deterministic mascot avatars.",
    canonicalPath: '/blog',
    content,
  });
}

/** Render a single release page, e.g. /blog/v0.23.0. */
export function blogReleaseHtml(version: string): { ok: true; html: string } | { ok: false } {
  const releases = parseChangelog(readChangelog());
  const r = releases.find((rr) => rr.version === version);
  if (!r) return { ok: false };

  const content = `
  <header class="bl-header">
    <h1>v${r.version}</h1>
    <p>${formatDate(r.date)}${r.yanked ? ` · <span class="bl-yanked">${r.yankedReason}</span>` : ''}</p>
  </header>

  <section class="bl-list">
    ${renderRelease(r, { permalink: true })}
  </section>

  <p style="margin-top: 40px; color: var(--muted); font-size: 14px;">
    <a href="/blog">← All releases</a>
  </p>
  `;

  return {
    ok: true,
    html: shell({
      title: `v${r.version} — ${r.headline}`,
      description: r.headline.slice(0, 160),
      canonicalPath: `/blog/v${r.version}`,
      content,
    }),
  };
}

/** All minor+ release versions — used by /sitemap.xml. */
export function blogReleaseVersions(): string[] {
  return parseChangelog(readChangelog())
    .filter((r) => isMinor(r.version))
    .map((r) => r.version);
}
