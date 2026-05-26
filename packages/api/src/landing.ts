import { TEMPLATES_JSON } from './landingTemplates.js';

/**
 * Landing page served at GET /.
 *
 * Single HTML file, no external dependencies. The page itself is the docs —
 * an editable URL playground that previews live, a curated cast strip, a
 * group demo, and a Redoc-style API reference covering every endpoint and
 * parameter.
 */

const CAST_SEEDS: readonly string[] = [
  'aria', 'milo', 'nova', 'kai', 'sage', 'eden',
  'luna', 'rio', 'pip', 'wren', 'zane', 'iris',
  'fox', 'jin', 'leo', 'pax', 'roo', 'tava',
  'yumi', 'cass', 'odi', 'hex', 'fae', 'rune',
];

const API_BASE = process.env['NAVII_API_BASE'] ?? 'https://api.navii.dev';
const SITE_BASE = process.env['NAVII_SITE_BASE'] ?? 'https://navii.dev';
const OG_IMAGE = `${API_BASE}/og.png`;

export function landingHtml(): string {
  const tiles = CAST_SEEDS.map(
    (s) =>
      `<a class="tile" href="${API_BASE}/avatar/${s}?size=192&animated=1" title="${s}"><img src="${API_BASE}/avatar/${s}?size=160&animated=1" alt="${s}" loading="lazy" width="160" height="160" /><span>${s}</span></a>`,
  ).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Navii. A face for every user.</title>
<meta name="description" content="Drop-in deterministic mascot avatars. Pass any string (user id, email, UUID) and get back a clean SVG or PNG. Same seed in, same face out, every time." />
<meta name="theme-color" content="#0a0a0b" />
<meta name="color-scheme" content="dark" />
<meta name="author" content="uxderrick" />
<meta name="keywords" content="avatar, avatars, mascot, deterministic avatar, identicon, placeholder avatar, user avatar, svg avatar, png avatar, dicebear alternative, generated avatar" />
<meta name="robots" content="index, follow, max-image-preview:large" />

<link rel="canonical" href="${SITE_BASE}/" />

<!-- icons (relative so they work on both landing + api origins, and in local dev) -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="alternate icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="mask-icon" href="/favicon.svg" color="#c084fc" />

<!-- preconnect to API origin (icons + cast images) -->
<link rel="preconnect" href="${API_BASE}" crossorigin />
<link rel="dns-prefetch" href="${API_BASE}" />

<!-- Inter from Google Fonts (variable, optical sizing) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Navii" />
<meta property="og:title" content="Navii. A face for every user." />
<meta property="og:description" content="Drop-in deterministic mascot avatars. Same seed in, same face out, every time." />
<meta property="og:url" content="${SITE_BASE}/" />
<meta property="og:image" content="${OG_IMAGE}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Five Navii mascot avatars over the line 'A face for every user.'" />
<meta property="og:locale" content="en_US" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Navii. A face for every user." />
<meta name="twitter:description" content="Drop-in deterministic mascot avatars. Same seed in, same face out, every time." />
<meta name="twitter:image" content="${OG_IMAGE}" />
<meta name="twitter:image:alt" content="Five Navii mascot avatars over the line 'A face for every user.'" />

<!-- Structured data: software application -->
<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Navii',
  description: 'Deterministic mascot avatar service. Seed in, SVG/PNG out, every time.',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  url: SITE_BASE,
  image: OG_IMAGE,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: { '@type': 'Person', name: 'uxderrick', url: 'https://github.com/uxderrick' },
  license: 'https://opensource.org/licenses/MIT',
})}</script>

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
    --good: #86efac;
    --radius: 14px;
    color-scheme: dark;
  }
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  html, body { margin: 0; background: var(--bg); color: var(--ink); }
  section { scroll-margin-top: 80px; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
  }
  body {
    font: 16px/1.6 'Inter', 'Inter Display', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-feature-settings: 'cv11', 'ss01', 'ss03';
    font-optical-sizing: auto;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  a { color: var(--ink); text-decoration: none; }
  a:hover { color: var(--accent); }
  code, pre, .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13.5px; }
  .container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
  hr.rule { border: 0; border-top: 1px solid var(--line); margin: 88px 0; }

  /* ── nav ── */
  nav.top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(10, 10, 11, 0.72);
    backdrop-filter: saturate(140%) blur(10px);
    -webkit-backdrop-filter: saturate(140%) blur(10px);
    border-bottom: 1px solid var(--line);
    margin: 0 -24px;
  }
  nav.top .brand { display: flex; align-items: center; gap: 10px; font-weight: 600; letter-spacing: -0.01em; }
  nav.top .brand img { width: 28px; height: 28px; border-radius: 50%; }
  nav.top .links { display: flex; gap: 20px; font-size: 14px; color: var(--muted-2); }
  nav.top .links a:hover { color: var(--ink); }

  /* ── hero (left-aligned) ── */
  header.hero { padding: 48px 0 28px; text-align: left; }
  header.hero h1 {
    font-size: clamp(40px, 6.4vw, 72px);
    line-height: 1.0;
    letter-spacing: -0.035em;
    margin: 0 0 18px;
    font-weight: 600;
  }
  header.hero h1 em { font-style: normal; color: var(--accent); }
  header.hero p.lede {
    color: var(--muted);
    font-size: clamp(15px, 1.4vw, 18px);
    max-width: 60ch;
    margin: 0;
  }
  .hero-ctas { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 22px; }
  .hero-ctas a {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 16px;
    border-radius: 999px;
    font-size: 13.5px;
    font-weight: 500;
    transition: border-color .15s, color .15s, background .15s;
  }
  .hero-ctas a.primary {
    background: var(--accent);
    color: #0a0a0b;
    border: 1px solid var(--accent);
  }
  .hero-ctas a.primary:hover { background: #d4a8ff; border-color: #d4a8ff; color: #0a0a0b; }
  .hero-ctas a.secondary {
    background: var(--bg-2);
    color: var(--ink);
    border: 1px solid #27272a;
  }
  .hero-ctas a.secondary:hover { background: var(--bg-3); border-color: var(--muted-2); }
  .hero-ctas a.tertiary {
    background: transparent;
    color: var(--muted);
    border: 0;
    padding: 9px 6px;
  }
  .hero-ctas a.tertiary:hover { color: var(--ink); }
  .hero-ctas a.secondary:hover { color: var(--accent); border-color: var(--accent); }
  .hero-ctas a svg { width: 14px; height: 14px; }

  /* ── playground (full-width 2-col) ── */
  .playground {
    margin: 0 0 28px;
    display: grid;
    grid-template-columns: 1.45fr 1fr;
    gap: 24px;
    align-items: stretch;
  }
  @media (max-width: 980px) { .playground { grid-template-columns: 1fr; } }

  .editor-card {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .editor-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px;
    background: var(--bg-3);
    border-bottom: 1px solid var(--line);
    color: var(--muted-2);
    font: 11.5px ui-monospace, SFMono-Regular, Menlo, monospace;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .editor-head .dots { display: flex; gap: 6px; }
  .editor-head .dots i { display: block; width: 10px; height: 10px; border-radius: 50%; background: #27272a; }
  .editor-head .right { display: flex; gap: 10px; align-items: center; }
  .framework-select {
    appearance: none;
    background: var(--bg-2);
    border: 1px solid #27272a;
    color: var(--ink);
    border-radius: 6px;
    padding: 3px 26px 3px 10px;
    cursor: pointer;
    font: 11px ui-monospace, monospace;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background-image: linear-gradient(45deg, transparent 50%, var(--muted) 50%), linear-gradient(135deg, var(--muted) 50%, transparent 50%);
    background-position: calc(100% - 12px) 50%, calc(100% - 8px) 50%;
    background-size: 4px 4px;
    background-repeat: no-repeat;
  }
  .framework-select:hover { border-color: var(--muted-2); }
  .framework-select:focus { outline: none; border-color: var(--accent); }
  .editor-head .copy {
    background: transparent;
    border: 1px solid #27272a;
    color: var(--muted);
    border-radius: 6px;
    padding: 3px 10px;
    cursor: pointer;
    font: 11px ui-monospace, monospace;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .editor-head .copy:hover { color: var(--ink); border-color: var(--muted-2); }
  .editor-head .copy.ok { color: var(--good); border-color: var(--good); }

  .seed-bar { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--bg-2); border-bottom: 1px solid var(--line); }
  .seed-bar label { color: var(--muted-2); font: 11.5px ui-monospace, SFMono-Regular, Menlo, monospace; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
  .seed-field { position: relative; flex: 1; min-width: 0; display: flex; align-items: center; }
  .seed-bar input { flex: 1; min-width: 0; background: transparent; border: 0; outline: none; color: var(--accent); font: 13.5px ui-monospace, SFMono-Regular, Menlo, monospace; padding: 4px 0; }
  .seed-bar input::placeholder { color: #52525b; }
  #seed-measure {
    position: absolute;
    visibility: hidden;
    white-space: pre;
    pointer-events: none;
    font: 13.5px ui-monospace, SFMono-Regular, Menlo, monospace;
    padding: 4px 0;
  }
  .seed-caret {
    position: absolute;
    top: 50%;
    left: 0;
    width: 2px;
    height: 16px;
    background: var(--accent);
    transform: translate(0, -50%);
    pointer-events: none;
    animation: seed-blink 1s steps(1) infinite;
    box-shadow: 0 0 6px rgba(192, 132, 252, 0.45);
    border-radius: 1px;
  }
  .seed-field.focused .seed-caret { display: none; }
  @keyframes seed-blink {
    0%, 49%   { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  .seed-bar .toggle {
    background: transparent;
    border: 1px solid #27272a;
    color: var(--muted);
    border-radius: 999px;
    padding: 3px 10px 3px 8px;
    cursor: pointer;
    font: 11px ui-monospace, SFMono-Regular, Menlo, monospace;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    transition: color .15s, border-color .15s, background .15s;
  }
  .seed-bar .toggle::before {
    content: '';
    width: 6px; height: 6px; border-radius: 50%;
    background: #27272a;
    transition: background .15s, box-shadow .15s;
  }
  .seed-bar .toggle:hover { color: var(--ink); border-color: var(--muted-2); }
  .seed-bar .toggle.on { color: var(--accent); border-color: var(--accent); background: rgba(192,132,252,0.08); }
  .seed-bar .toggle.on::before { background: var(--accent); box-shadow: 0 0 6px var(--accent); }

  .editor-body { position: relative; display: grid; grid-template-columns: 48px 1fr; height: 360px; overflow: hidden; }
  .gutter {
    background: var(--bg-3);
    border-right: 1px solid var(--line);
    color: var(--muted-2);
    font: 13.5px/1.65 ui-monospace, SFMono-Regular, Menlo, monospace;
    padding: 16px 0;
    text-align: right;
    user-select: none;
    overflow: hidden;
  }
  .gutter b { display: block; padding-right: 12px; font-weight: 400; }

  .code-area { position: relative; padding: 0; height: 100%; overflow: hidden; }
  .code-area pre, .code-area textarea {
    margin: 0;
    padding: 16px 18px;
    font: 13.5px/1.65 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
    tab-size: 2;
  }
  .code-area pre { color: var(--ink); background: transparent; pointer-events: none; height: 100%; overflow-y: auto; }
  .gutter { overflow-y: hidden; }
  .code-area textarea {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    background: transparent;
    border: 0;
    outline: none;
    resize: none;
    color: transparent;
    caret-color: var(--ink);
    -webkit-text-fill-color: transparent;
  }
  .code-area textarea::selection { background: rgba(192, 132, 252, 0.28); -webkit-text-fill-color: transparent; }

  .tk-verb     { color: var(--accent); font-weight: 600; }
  .tk-host     { color: var(--muted-2); }
  .tk-path     { color: var(--ink); }
  .tk-punct    { color: var(--muted-2); }
  .tk-key      { color: #93c5fd; }
  .tk-val      { color: #fbbf24; }
  .tk-num      { color: var(--good); }
  .tk-tag      { color: #f472b6; }
  .tk-attr     { color: #93c5fd; }
  .tk-str      { color: #fbbf24; }
  .tk-keyword  { color: var(--accent); }
  .tk-comment  { color: var(--muted-2); font-style: italic; }

  .editor-foot {
    border-top: 1px solid var(--line);
    background: var(--bg-3);
    padding: 12px 14px;
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  .preset {
    background: var(--bg-2);
    border: 1px solid var(--line);
    color: var(--muted);
    padding: 5px 12px;
    border-radius: 999px;
    font: 12.5px ui-sans-serif, system-ui, sans-serif;
    cursor: pointer;
    transition: color .15s, border-color .15s;
  }
  .preset:hover { color: var(--ink); border-color: var(--muted-2); }
  .preset.active { color: var(--accent); border-color: var(--accent); background: rgba(192,132,252,0.08); }

  /* preview column */
  .preview-card {
    background: linear-gradient(135deg, #1c1c22, var(--bg));
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    min-height: 320px;
  }
  .pv { display: none; flex-direction: column; align-items: center; justify-content: center; width: 100%; }
  .pv.active { display: flex; }

  /* profile card variant — fills available width */
  .pv-profile { background: var(--bg-2); border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; gap: 14px; flex-direction: row; align-items: center; width: 100%; }
  .pv-profile img { width: 56px; height: 56px; border-radius: 50%; flex-shrink: 0; }
  .pv-profile .info { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
  .pv-profile .info strong { font-size: 14px; color: var(--ink); word-break: break-all; line-height: 1.2; }
  .pv-profile .info span { font-size: 12px; color: var(--muted-2); }

  /* team variant */
  .pv-team { gap: 10px; }
  .pv-team ul { list-style: none; padding: 0; margin: 0; display: flex; gap: 10px; align-items: center; }
  .pv-team li { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .pv-team li img { width: 44px; height: 44px; border-radius: 50%; }
  .pv-team li span { font: 10px ui-monospace, monospace; color: var(--muted-2); }

  /* comment variant — fills available width */
  .pv-comment { background: var(--bg-2); border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; gap: 12px; flex-direction: row; align-items: flex-start; width: 100%; }
  .pv-comment img { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
  .pv-comment .body { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
  .pv-comment .body strong { font-size: 13px; color: var(--ink); word-break: break-all; }
  .pv-comment .body p { margin: 0; font-size: 13px; color: var(--muted); line-height: 1.45; }

  /* fallback variant */
  .pv-fallback { gap: 12px; }
  .pv-fallback img { width: 96px; height: 96px; border-radius: 50%; }
  .pv-fallback .note { font: 11px ui-monospace, monospace; color: var(--muted-2); }
  .pv-fallback .note strong { color: var(--good); font-weight: 600; }

  /* group + url variants — keep image-centric */
  .pv-img { gap: 8px; }
  .pv-img img { max-width: 92%; max-height: 240px; display: block; }
  .pv-img .note { font: 11px ui-monospace, monospace; color: var(--muted-2); }

  .preview-card.error::after {
    content: 'invalid URL';
    position: absolute; bottom: 14px; right: 16px;
    color: #f87171;
    font: 11px ui-monospace, monospace;
  }
  .preview-card.error .pv.active { opacity: 0.25; }

  /* ── section headings ── */
  section h2 {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted-2);
    margin: 0 0 8px;
  }
  section .blurb {
    font-size: clamp(22px, 2.4vw, 30px);
    line-height: 1.25;
    letter-spacing: -0.015em;
    margin: 0 0 32px;
    max-width: 56ch;
  }
  section .blurb span { color: var(--muted); }

  /* ── cast ── */
  .cast-section { margin: 56px 0 0; }
  @media (max-width: 540px) {
    header.hero { padding: 32px 0 12px; }
    .cast-section { margin: 16px 0 0; }
  }

  /* full-bleed wrapper escapes container padding */
  .cast-grid-bleed {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    padding: 0 24px;
  }

  /* ── cast grid ── */
  .cast-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 14px;
  }
  @media (max-width: 880px) { .cast-grid { gap: 8px; } }
  @media (max-width: 540px) {
    .cast-grid { grid-template-columns: repeat(5, 1fr); gap: 8px; }
  }

  /* ── logos (built with) — minimal row ── */
  .logos-section { margin: 0; padding: 8px 0; text-align: center; }
  .logos-section .eyebrow {
    font: 11px ui-monospace, SFMono-Regular, Menlo, monospace;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--muted-2);
    margin: 0 0 20px;
  }
  .logos-rows { display: flex; flex-direction: column; gap: 32px; }
  .logos-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 40px 56px;
  }
  @media (max-width: 540px) {
    .logos-rows { gap: 24px; }
    .logos-row { gap: 28px 36px; }
  }
  .logo {
    display: inline-flex;
    align-items: center;
    color: var(--muted-2);
    opacity: 0.7;
    transition: opacity .18s ease, color .18s ease;
  }
  .logo:hover { opacity: 1; color: var(--ink); }
  .logo svg { height: 22px; width: auto; display: block; fill: currentColor; }
  .logo img { height: 28px; width: auto; display: block; object-fit: contain; }
  .logo img.lg { height: 44px; }

  /* ── install (playground) section ── */
  .install-section { margin: 56px 0 0; }
  .install-cta { display: flex; justify-content: flex-start; margin-top: 20px; }
  .install-cta a.secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    border-radius: 999px;
    font-size: 13.5px;
    font-weight: 500;
    background: var(--bg-2);
    color: var(--ink);
    border: 1px solid #27272a;
    transition: background .15s, color .15s, border-color .15s;
  }
  .install-cta a.secondary:hover { background: var(--bg-3); border-color: var(--muted-2); }
  .tile {
    position: relative;
    display: block;
    aspect-ratio: 1;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    overflow: hidden;
    transition: transform .18s ease, border-color .18s ease;
  }
  .tile:hover { transform: translateY(-2px); border-color: var(--accent); }
  .tile img { width: 100%; height: 100%; display: block; }
  .tile span {
    position: absolute; left: 10px; bottom: 8px;
    font: 11px ui-monospace, SFMono-Regular, Menlo, monospace;
    color: var(--muted);
    background: rgba(10, 10, 11, 0.7);
    backdrop-filter: blur(8px);
    padding: 3px 7px;
    border-radius: 5px;
    opacity: 0;
    transition: opacity .18s ease;
  }
  .tile:hover span { opacity: 1; }

  /* ── group ── */
  .group-demo {
    display: flex; flex-direction: column; gap: 16px;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 28px;
    align-items: flex-start;
  }
  .group-demo img { display: block; max-width: 100%; height: auto; }
  .group-demo code {
    background: var(--bg);
    border: 1px solid var(--line);
    padding: 8px 12px;
    border-radius: 8px;
    color: var(--muted);
    word-break: break-all;
  }
  .group-demo code .verb { color: var(--accent); }

  /* ── docs cards (landing pointer) ── */
  .docs-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  @media (max-width: 880px) { .docs-cards { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 540px) { .docs-cards { grid-template-columns: 1fr; } }
  .doc-card {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 20px 22px;
    transition: border-color 0.18s ease, transform 0.18s ease;
    display: block;
    color: var(--ink);
  }
  .doc-card:hover { border-color: var(--accent); transform: translateY(-2px); color: var(--ink); }
  .doc-card h3 { margin: 0 0 6px; font-size: 16px; font-weight: 600; color: var(--ink); letter-spacing: -0.005em; }
  .doc-card p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.5; }

  /* ── api reference (legacy, unused; retained for safety) ── */
  .ref-endpoint {
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--bg-2);
    padding: 28px;
    margin-bottom: 20px;
  }
  .ref-endpoint h3 {
    margin: 0 0 6px;
    display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.005em;
  }
  .ref-endpoint h3 .verb {
    color: var(--accent);
    font: 11.5px ui-monospace, monospace;
    background: rgba(192, 132, 252, 0.12);
    border: 1px solid rgba(192, 132, 252, 0.3);
    padding: 2px 8px;
    border-radius: 5px;
    letter-spacing: 0.05em;
  }
  .ref-endpoint h3 .path {
    font: 16px ui-monospace, monospace;
    color: var(--ink);
  }
  .ref-endpoint > p.desc {
    margin: 0 0 18px;
    color: var(--muted);
    font-size: 14.5px;
  }

  .params-list { margin: 0 0 18px; }
  .params-list h4 {
    margin: 14px 0 8px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted-2);
  }
  .params-list dl {
    display: grid;
    grid-template-columns: max-content max-content 1fr;
    gap: 0;
    margin: 0;
    border-top: 1px solid var(--line);
  }
  .params-list dt, .params-list dd {
    padding: 8px 12px 8px 0;
    border-bottom: 1px solid var(--line);
    font-size: 13px;
  }
  .params-list dt { font-family: ui-monospace, monospace; color: var(--ink); font-weight: 500; }
  .params-list dd.type { font-family: ui-monospace, monospace; color: var(--accent); font-size: 12px; }
  .params-list dd.desc { color: var(--muted); }

  .examples h4 {
    margin: 18px 0 10px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted-2);
  }
  .examples .ex {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 14px;
    align-items: center;
    padding: 10px 0;
    border-top: 1px solid var(--line);
  }
  .examples .ex:first-of-type { border-top: 1px solid var(--line); }
  .examples .ex .label {
    color: var(--muted);
    font-size: 12px;
    grid-column: 1 / -1;
    margin: 0 0 -2px;
  }
  .examples .ex code {
    color: var(--ink);
    word-break: break-all;
    line-height: 1.55;
    grid-column: 1;
  }
  .examples .ex .preview {
    width: 56px; height: 56px;
    border-radius: 12px;
    background: var(--bg-3);
    border: 1px solid var(--line);
    grid-column: 2;
    overflow: hidden;
    display: grid; place-items: center;
  }
  .examples .ex .preview img { width: 100%; height: 100%; display: block; }

  /* ── footer ── */
  footer.bottom {
    display: flex; justify-content: space-between; align-items: center;
    padding: 32px 0 56px;
    color: var(--muted-2);
    font-size: 13px;
  }
  footer.bottom a { color: var(--muted-2); }
  footer.bottom a:hover { color: var(--ink); }
</style>

<!-- analytics (umami, self-hosted) -->
<script defer src="https://analytics.uxderrick.com/script.js" data-website-id="9adc73e7-ce4c-454c-bd2c-663eca5c9abe"></script>
</head>
<body>
<div class="container">

  <nav class="top">
    <div class="brand">
      <img src="${API_BASE}/avatar/navii?size=56" alt="navii" />
      <span>navii</span>
    </div>
    <div class="links">
      <a href="/docs/quickstart">docs</a>
      <a href="https://github.com/uxderrick/navii">github</a>
    </div>
  </nav>

  <header class="hero">
    <h1>A face for <em>every user.</em></h1>
    <p class="lede">Drop-in 22M+ deterministic mascot avatars. Pass any string (user id, email, UUID) and get back a clean SVG or PNG. Same seed in, same face out, every time.</p>
    <div class="hero-ctas">
      <a class="primary" href="#install">Try it →</a>
      <a class="secondary" href="/builder">Customize a face</a>
    </div>
  </header>

  <section id="cast" class="cast-section">
    <div class="cast-grid-bleed"><div class="cast-grid">${tiles}</div></div>
  </section>

  <hr class="rule" />

  <section id="trusted" class="logos-section">
    <p class="eyebrow">built with navii</p>
    <div class="logos-rows">
    <div class="logos-row">
      <a class="logo" href="https://visitzelos.com/" target="_blank" rel="noopener" aria-label="Zelos">
        <svg viewBox="0 0 128.7 43.7" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M0,39.93v-.87l16.24-22.79H1.48v-4.96h23.56v.9l-16.22,22.76h15.42v4.96H0Z"/><path fill="currentColor" d="M51.67,26.91h2.76c.21-3.43-.19-6.39-1.21-8.88-1.02-2.49-2.55-4.41-4.6-5.76-2.05-1.35-4.53-2.03-7.45-2.03s-5.24.63-7.34,1.88c-2.1,1.25-3.74,3.03-4.92,5.33-1.18,2.3-1.76,5.01-1.76,8.14,0,2.95.6,5.54,1.79,7.78,1.19,2.24,2.86,3.97,5.01,5.22,2.15,1.25,4.64,1.87,7.49,1.87s5.29-.7,7.55-2.11c2.26-1.4,3.95-3.39,5.06-5.95l-5.43-1.72c-.71,1.47-1.69,2.59-2.95,3.38-1.26.79-2.76,1.18-4.49,1.18-2.63,0-4.65-.86-6.04-2.58-1.15-1.42-1.82-3.34-2.02-5.74h18.56ZM35.14,17.77c1.4-1.75,3.48-2.62,6.25-2.62,2.51,0,4.38.79,5.6,2.38.92,1.2,1.51,2.88,1.76,5.06h-15.51c.29-1.99.92-3.6,1.9-4.82Z"/><path fill="currentColor" d="M60.89,39.66V.71h5.54v38.95h-5.54Z"/><path fill="currentColor" d="M117.1,40.19c-3.48,0-6.32-.77-8.51-2.31-2.19-1.54-3.53-3.7-4.03-6.49l5.67-.88c.35,1.48,1.17,2.65,2.45,3.51,1.28.86,2.87,1.28,4.78,1.28,1.73,0,3.09-.35,4.07-1.06.98-.71,1.47-1.68,1.47-2.91,0-.72-.17-1.31-.52-1.76-.34-.45-1.06-.88-2.16-1.28-1.1-.41-2.76-.91-5.01-1.51-2.46-.64-4.4-1.32-5.84-2.05-1.44-.73-2.46-1.59-3.07-2.57-.61-.98-.91-2.17-.91-3.56,0-1.73.46-3.24,1.38-4.53.92-1.29,2.21-2.29,3.88-2.99s3.63-1.06,5.87-1.06,4.14.34,5.86,1.03c1.71.69,3.1,1.67,4.16,2.93,1.06,1.26,1.7,2.74,1.91,4.44l-5.67,1.03c-.19-1.38-.84-2.46-1.93-3.26-1.1-.79-2.52-1.23-4.27-1.3-1.68-.07-3.04.21-4.08.83-1.04.63-1.56,1.49-1.56,2.58,0,.64.2,1.18.6,1.62.4.44,1.17.87,2.32,1.27,1.15.41,2.84.89,5.09,1.46,2.4.62,4.31,1.3,5.72,2.05,1.41.75,2.42,1.64,3.03,2.68.61,1.03.91,2.28.91,3.75,0,2.83-1.03,5.04-3.09,6.65-2.06,1.61-4.9,2.41-8.52,2.41Z"/><path fill="currentColor" d="M102.27,30.69v-.07s-6.48-19.38-6.48-19.38l-.03-.07c-.44-1-1.44-2.14-3.6-1.85h0c-.36.05-1.71.31-8.15,1.6-1.16.23-2.01.4-2.09.42l-.24.04c-1.16.18-2.92.46-3.89.78-1.32.43-1.78,1.56-2.16,2.47-1.09,2.64-2.04,5.43-2.96,8.12-.78,2.28-1.59,4.65-2.47,6.89l-.04.1v.1c-.09.75-.1,1.87.8,2.85l13.16,10.23.09.06c.59.34,1.14.47,1.64.47.78,0,1.45-.31,1.99-.63,2.35-1.39,4.66-3.06,6.9-4.68,2.07-1.5,4.21-3.05,6.36-4.35l.14-.11c.83-.83,1.16-1.8,1-2.98ZM74.14,30.12c.08-.59,1.39-2.04,2.25-3,.75-.84,1.46-1.63,1.84-2.25,0,0,0,0,0,0,.07-.01.11,0,.14,0l4.56,13.38s-.09-.06-.14-.09c-1.42-.93-2.84-2.13-4.22-3.3-1.29-1.09-2.63-2.23-4-3.16-.17-.15-.57-.55-.43-1.57ZM86.13,38.59l-4.62-13.96s.05-.04.07-.05c.03.01.09.03.13.05.04.02.09.04.13.05l15.58,7.2c.12.08.17.19.19.27.03.11.02.23-.02.34l-9.51,6.6c-.36.24-.77.31-1.13.2-.34-.1-.63-.35-.81-.71ZM98.28,28.81c-.16.11-.37.1-.59-.02-2.47-1.24-5.06-2.37-7.56-3.46-2.45-1.07-4.99-2.18-7.39-3.38-.08-.04-.17-.08-.26-.12-.19-.09-.54-.26-.62-.34.79-.64,4.56-3.33,7.36-5.32,2.02-1.44,3.33-2.37,4.18-2.99l5.08,15.23c0,.23-.12.34-.2.39ZM80.08,19.13c-.08.03-.14-.05-.15-.05h0c-.16-.37-.58-2.7-.61-3.2-.05-.64.09-.88.77-1.27l9.09-1.89-9.1,6.4ZM77.01,19.18l.03.17c.14.7.28,1.37.28,2l-1.91,2.38,1.59-4.54Z"/></svg>
      </a>
      <a class="logo" href="https://play.salifuandmaster.com/" target="_blank" rel="noopener" aria-label="Unwrapped">
        <img src="https://play.salifuandmaster.com/ui/brand/unwrapped-logo.png" alt="Unwrapped" loading="lazy" />
      </a>
      <a class="logo" href="https://sortagame.netlify.app/" target="_blank" rel="noopener" aria-label="Sorta">
        <img class="lg" src="/logos/sorta.png" alt="Sorta" loading="lazy" />
      </a>
      <a class="logo" href="https://piply.ai/" target="_blank" rel="noopener" aria-label="Piply">
        <img class="lg" src="/logos/piply.png" alt="Piply" loading="lazy" />
      </a>
      <a class="logo" href="https://stacx-creator.netlify.app/" target="_blank" rel="noopener" aria-label="Stacx">
        <img class="lg" src="/logos/stacx.png" alt="Stacx" loading="lazy" />
      </a>
    </div>
    <div class="logos-row">
      <a class="logo" href="https://geniusbudget.app/" target="_blank" rel="noopener" aria-label="Genius Budget">
        <img class="lg" src="/logos/genius.png" alt="Genius Budget" loading="lazy" />
      </a>
      <a class="logo" href="https://clerra.app/" aria-label="Clerra">
        <img src="/logos/clerra.svg" alt="Clerra" loading="lazy" />
      </a>
      <a class="logo" href="https://fleetlinq.online/" aria-label="Brand">
        <img class="lg" src="/logos/brand.webp" alt="Brand" loading="lazy" />
      </a>
      <a class="logo" href="https://soma-me-zeta.vercel.app/" aria-label="Brand">
        <img class="lg" src="/logos/van.svg" alt="Brand" loading="lazy" />
      </a>
      <a class="logo" href="https://jedevent.com/" aria-label="JED Events">
        <img class="lg" src="/logos/jed.webp" alt="JED Events" loading="lazy" />
      </a>
      <a class="logo" href="https://app.golly.live/login?redirect=/" target="_blank" rel="noopener" aria-label="Golly">
        <img class="lg" src="/logos/golly.png" alt="Golly" loading="lazy" />
      </a>
    </div>
    </div>
  </section>

  <hr class="rule" />

  <section id="install" class="install-section">
    <p class="blurb">Try it. <span>Change the user id, switch frameworks, copy the snippet.</span></p>

  <div class="playground">
    <div class="editor-card">
      <div class="editor-head">
        <span class="dots"><i></i><i></i><i></i></span>
        <div class="right">
          <select id="framework-select" class="framework-select" aria-label="framework">
            <option value="html">HTML</option>
            <option value="react">React</option>
            <option value="next">Next.js</option>
            <option value="vue">Vue</option>
            <option value="svelte">Svelte</option>
            <option value="curl">curl</option>
            <option value="fetch">fetch</option>
            <option value="url">URL</option>
          </select>
          <button class="copy" id="copy-btn" type="button">copy</button>
        </div>
      </div>
      <div class="seed-bar">
        <label for="seed-input">user id</label>
        <div class="seed-field">
          <input id="seed-input" type="text" value="alice@example.com" autocomplete="off" spellcheck="false" placeholder="user.id, email, uuid…" />
          <span id="seed-measure" aria-hidden="true"></span>
          <span id="seed-caret" class="seed-caret" aria-hidden="true"></span>
        </div>
        <button id="animated-toggle" class="toggle" type="button" aria-pressed="false" title="toggle animated preview">animated</button>
      </div>
      <div class="editor-body">
        <div class="gutter" id="gutter"></div>
        <div class="code-area">
          <pre id="code-display"><code></code></pre>
          <textarea id="code-input" spellcheck="false" autocomplete="off" autocapitalize="off" wrap="soft"></textarea>
        </div>
      </div>
      <div class="editor-foot" id="usecases">
        <button class="preset active" data-usecase="profile">profile card</button>
        <button class="preset" data-usecase="team">team list</button>
        <button class="preset" data-usecase="comment">comment row</button>
        <button class="preset" data-usecase="fallback">photo fallback</button>
        <button class="preset" data-usecase="group">group</button>
        <button class="preset" data-usecase="url">just the URL</button>
      </div>
    </div>

    <div class="preview-card" id="preview-wrap">
      <div class="pv pv-profile active" data-pv="profile">
        <img data-role="avatar" src="${API_BASE}/avatar/alice@example.com?size=128&amp;tileBg=auto" alt="" width="56" height="56" />
        <div class="info">
          <strong data-role="name">alice@example.com</strong>
          <span>Member</span>
        </div>
      </div>

      <div class="pv pv-team" data-pv="team">
        <ul>
          <li><img data-role="avatar" src="${API_BASE}/avatar/alice@example.com?size=96" alt="" /><span data-role="name-short">alice</span></li>
          <li><img src="${API_BASE}/avatar/bob?size=96" alt="" /><span>bob</span></li>
          <li><img src="${API_BASE}/avatar/carol?size=96" alt="" /><span>carol</span></li>
          <li><img src="${API_BASE}/avatar/dave?size=96" alt="" /><span>dave</span></li>
        </ul>
      </div>

      <div class="pv pv-comment" data-pv="comment">
        <img data-role="avatar" src="${API_BASE}/avatar/alice@example.com?size=72" alt="" width="36" height="36" />
        <div class="body">
          <strong data-role="name">alice@example.com</strong>
          <p>Anyone seen the v0.8 deploy?</p>
        </div>
      </div>

      <div class="pv pv-fallback" data-pv="fallback">
        <img data-role="avatar" src="${API_BASE}/avatar/alice@example.com?size=192&amp;tileBg=auto" alt="" width="96" height="96" />
        <p class="note">user has no photoUrl — <strong>Navii rendered</strong></p>
      </div>

      <div class="pv pv-img" data-pv="group">
        <img data-role="group" src="${API_BASE}/group?seeds=alice@example.com,bob,carol,dave,eve&amp;size=64&amp;overlap=0.32" alt="team" />
        <p class="note">/group · 5 members</p>
      </div>

      <div class="pv pv-img" data-pv="url">
        <img data-role="avatar" src="${API_BASE}/avatar/alice@example.com?size=256&amp;animated=1" alt="" width="240" height="240" />
        <p class="note">raw /avatar endpoint</p>
      </div>
    </div>
  </div>

  <div class="install-cta">
    <a class="secondary" href="/docs/quickstart">Read docs</a>
  </div>
  </section>

  <hr class="rule" />

  <section id="reference">
    <h2>docs</h2>
    <p class="blurb">Full reference at <a href="/docs/quickstart" style="color:var(--accent)">/docs</a>. <span>Quickstart, concepts, parts catalog, HTTP API, SDK, deployment.</span></p>

    <div class="docs-cards">
      <a class="doc-card" href="/docs/quickstart"><h3>Quickstart</h3><p>Install + first avatar in 60 seconds.</p></a>
      <a class="doc-card" href="/docs/concepts"><h3>Concepts</h3><p>Seeds, determinism, parts overview.</p></a>
      <a class="doc-card" href="/docs/parts"><h3>Parts catalog</h3><p>Every variant value, rendered.</p></a>
      <a class="doc-card" href="/docs/http-api"><h3>HTTP API</h3><p>Endpoints, params, errors, headers.</p></a>
      <a class="doc-card" href="/docs/sdk-core"><h3>@usenavii/core</h3><p>Functions, types, composition.</p></a>
      <a class="doc-card" href="/docs/sdk-react"><h3>@usenavii/react</h3><p>Component props + memoization.</p></a>
    </div>
  </section>

  <hr class="rule" />

  <footer class="bottom">
    <div>navii · deterministic avatars · open source · MIT</div>
    <div><a href="/privacy">privacy</a> · <a href="/support">support</a> · <a href="https://github.com/uxderrick/navii">github</a> · <a href="/api">/api</a></div>
  </footer>

</div>

<script>
(function () {
  const API_BASE = ${JSON.stringify(API_BASE)};

  const input   = document.getElementById('code-input');
  const display = document.querySelector('#code-display code');
  const gutter  = document.getElementById('gutter');
  const wrap    = document.getElementById('preview-wrap');
  const copyBtn = document.getElementById('copy-btn');
  const usecases = document.getElementById('usecases');
  let t = null;

  const frameworkSel = document.getElementById('framework-select');
  const seedInput = document.getElementById('seed-input');
  const animBtn = document.getElementById('animated-toggle');
  const state = { framework: 'html', usecase: 'profile', seed: 'alice@example.com', animated: false };

  const TEMPLATES = ${TEMPLATES_JSON};
  const PRIMARY_URL_RE = /https?:\\/\\/[^\\s'"<>)]+/;

  function applyParams(src) {
    return src.replace(/(\\/(?:avatar\\/[^?\\s'"<>)]+|group))(\\?[^\\s'"<>)]*)?/g, function (_m, path, query) {
      query = (query || '').replace(/[?&]animated=1/g, '');
      if (query.charAt(0) === '&') query = '?' + query.slice(1);
      if (state.animated) query += (query ? '&' : '?') + 'animated=1';
      return path + query;
    });
  }

  function renderSnippet() {
    const uc = TEMPLATES[state.usecase] || TEMPLATES.profile;
    const tmpl = uc[state.framework] || uc.html || uc.url || '';
    const seeded = tmpl.split('__SEED__').join(state.seed || 'alice@example.com');
    return applyParams(seeded);
  }

  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function span(cls, text) { const s = document.createElement('span'); if (cls) s.className = cls; s.textContent = text; return s; }

  /**
   * Position-based tokenizer. Each pattern stamps a class on character
   * positions; later passes only fill in unmarked positions. URLs override
   * string marks so query params get colored inside string literals.
   */
  function tokenize(src) {
    const N = src.length;
    const marks = new Array(N).fill(null);
    const stamp = function (start, end, cls) {
      for (let i = start; i < end; i++) if (marks[i] === null) marks[i] = cls;
    };
    const overwrite = function (start, end, cls) {
      for (let i = start; i < end; i++) marks[i] = cls;
    };

    // Strings (incl. quotes)
    for (const m of src.matchAll(/'[^'\\n]*'|"[^"\\n]*"|\`[^\`]*\`/g)) {
      stamp(m.index, m.index + m[0].length, 'tk-str');
    }
    // Comments (// or #)
    for (const m of src.matchAll(/(\\/\\/[^\\n]*|#[^\\n]*)/g)) {
      stamp(m.index, m.index + m[0].length, 'tk-comment');
    }
    // HTML/JSX tags
    for (const m of src.matchAll(/<\\/?[a-zA-Z][\\w-]*|\\/>/g)) {
      stamp(m.index, m.index + m[0].length, 'tk-tag');
    }
    // Attribute names (word followed by =, when not preceded by .)
    for (const m of src.matchAll(/\\b([a-zA-Z:][a-zA-Z\\d:_-]*)(?==)/g)) {
      const prev = src[m.index - 1];
      if (prev === '.' || prev === '$') continue;
      stamp(m.index, m.index + m[1].length, 'tk-attr');
    }
    // JS keywords
    for (const m of src.matchAll(/\\b(import|from|const|let|var|return|await|async|new|function|of|in|true|false|null)\\b/g)) {
      stamp(m.index, m.index + m[0].length, 'tk-keyword');
    }
    // HTTP verbs at start of line
    for (const m of src.matchAll(/(?:^|\\n)(GET|POST|PUT|PATCH|DELETE)\\b/g)) {
      const off = m[0].length - m[1].length;
      overwrite(m.index + off, m.index + off + m[1].length, 'tk-verb');
    }
    // URLs. Overwrite to give structure to URL inside strings
    for (const m of src.matchAll(/https?:\\/\\/[^\\s'"<>)]+/g)) {
      const start = m.index;
      const end = start + m[0].length;
      // host portion: protocol + // + domain (until next /)
      const protoEnd = m[0].indexOf('//') + 2;
      const slashAfter = m[0].indexOf('/', protoEnd);
      const hostEnd = slashAfter < 0 ? end : start + slashAfter;
      overwrite(start, hostEnd, 'tk-host');
      // path until ? or end
      const qIdx = m[0].indexOf('?');
      const pathEndAbs = qIdx < 0 ? end : start + qIdx;
      overwrite(hostEnd, pathEndAbs, 'tk-path');
      // query params
      if (qIdx >= 0) {
        for (const q of m[0].slice(qIdx).matchAll(/([?&])([a-zA-Z][\\w-]*)(=)([^&\\s'"<>)]*)/g)) {
          let cur = start + qIdx + q.index;
          overwrite(cur, cur + q[1].length, 'tk-punct'); cur += q[1].length;
          overwrite(cur, cur + q[2].length, 'tk-key');   cur += q[2].length;
          overwrite(cur, cur + q[3].length, 'tk-punct'); cur += q[3].length;
          const isNum = /^-?\\d+(\\.\\d+)?$/.test(q[4]);
          overwrite(cur, cur + q[4].length, isNum ? 'tk-num' : 'tk-val');
        }
      }
    }

    const out = [];
    let i = 0;
    while (i < N) {
      const cls = marks[i];
      let j = i + 1;
      while (j < N && marks[j] === cls) j++;
      out.push({ cls: cls, text: src.slice(i, j) });
      i = j;
    }
    return out;
  }

  function paintCode() {
    const src = input.value;
    clear(display);
    for (const tok of tokenize(src)) {
      if (tok.cls) display.appendChild(span(tok.cls, tok.text));
      else display.appendChild(document.createTextNode(tok.text));
    }
    clear(gutter);
    const lines = src.split('\\n').length;
    for (let i = 1; i <= lines; i++) {
      const b = document.createElement('b'); b.textContent = String(i); gutter.appendChild(b);
    }
  }

  function findFirstUrl(text) {
    const m = text.match(/https?:\\/\\/[^\\s'"<>)]+/);
    return m ? m[0] : null;
  }

  function refreshPreview() {
    const seed = state.seed || 'alice@example.com';
    const enc = encodeURIComponent(seed);
    const anim = state.animated ? '&animated=1' : '';

    // Toggle which use-case preview is visible.
    document.querySelectorAll('.pv').forEach(function (el) { el.classList.remove('active'); });
    const active = document.querySelector('.pv[data-pv="' + state.usecase + '"]');
    if (active) active.classList.add('active');
    else {
      const fallback = document.querySelector('.pv[data-pv="profile"]');
      if (fallback) fallback.classList.add('active');
    }

    // Update seed-dependent text + image src inside each variant.
    const setText = function (sel, val) {
      document.querySelectorAll(sel).forEach(function (el) { el.textContent = val; });
    };
    const setSrc = function (sel, src) {
      document.querySelectorAll(sel).forEach(function (el) { el.setAttribute('src', src); });
    };

    setText('.pv-profile [data-role="name"]', seed);
    setSrc('.pv-profile [data-role="avatar"]', API_BASE + '/avatar/' + enc + '?size=128&tileBg=auto' + anim);

    setSrc('.pv-team [data-role="avatar"]', API_BASE + '/avatar/' + enc + '?size=96' + anim);
    setText('.pv-team [data-role="name-short"]', seed.split('@')[0].slice(0, 8));

    setText('.pv-comment [data-role="name"]', seed);
    setSrc('.pv-comment [data-role="avatar"]', API_BASE + '/avatar/' + enc + '?size=72' + anim);

    setSrc('.pv-fallback [data-role="avatar"]', API_BASE + '/avatar/' + enc + '?size=192&tileBg=auto' + anim);

    setSrc('.pv[data-pv="group"] [data-role="group"]', API_BASE + '/group?seeds=' + enc + ',bob,carol,dave,eve&size=64&overlap=0.32' + anim);

    setSrc('.pv[data-pv="url"] [data-role="avatar"]', API_BASE + '/avatar/' + enc + '?size=256' + (state.animated ? '&animated=1' : ''));

    wrap.classList.remove('error');
  }

  function rebuild() {
    input.value = renderSnippet();
    paintCode();
    refreshPreview();
  }

  function syncSeedFromCode() {
    const m = input.value.match(/\\/avatar\\/([^?\\s'"<>)\${}]+)/);
    if (!m) return;
    const next = decodeURIComponent(m[1]);
    if (!next || next === state.seed) return;
    state.seed = next;
    if (seedInput.value !== next) seedInput.value = next;
  }

  function onInput() {
    paintCode();
    syncSeedFromCode();
    clearTimeout(t);
    t = setTimeout(refreshPreview, 140);
  }

  input.addEventListener('input', onInput);
  input.addEventListener('scroll', function () {
    display.parentElement.scrollTop = input.scrollTop;
    gutter.scrollTop = input.scrollTop;
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = input.selectionStart, e2 = input.selectionEnd;
      input.value = input.value.slice(0, s) + '  ' + input.value.slice(e2);
      input.selectionStart = input.selectionEnd = s + 2;
      onInput();
    }
  });

  usecases.addEventListener('click', function (ev) {
    const btn = ev.target.closest('button.preset');
    if (!btn) return;
    const key = btn.getAttribute('data-usecase');
    if (!key || !TEMPLATES[key]) return;
    state.usecase = key;
    document.querySelectorAll('.preset').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    rebuild();
  });

  frameworkSel.addEventListener('change', function () {
    state.framework = frameworkSel.value;
    rebuild();
  });

  animBtn.addEventListener('click', function () {
    state.animated = !state.animated;
    animBtn.classList.toggle('on', state.animated);
    animBtn.setAttribute('aria-pressed', state.animated ? 'true' : 'false');
    rebuild();
  });

  const seedField = seedInput.parentElement;
  const seedMeasure = document.getElementById('seed-measure');
  const seedCaret = document.getElementById('seed-caret');
  function positionCaret() {
    if (!seedMeasure || !seedCaret) return;
    seedMeasure.textContent = seedInput.value || seedInput.placeholder || '';
    const w = seedMeasure.getBoundingClientRect().width;
    const max = seedInput.getBoundingClientRect().width;
    const x = Math.min(w, Math.max(0, max - 2));
    seedCaret.style.left = x + 'px';
  }
  seedInput.addEventListener('focus', function () { if (seedField) seedField.classList.add('focused'); });
  seedInput.addEventListener('blur',  function () { if (seedField) seedField.classList.remove('focused'); positionCaret(); });
  window.addEventListener('resize', positionCaret);
  setTimeout(positionCaret, 0);

  let seedT = null;
  seedInput.addEventListener('input', function () {
    state.seed = seedInput.value.trim() || 'alice@example.com';
    positionCaret();
    clearTimeout(seedT);
    seedT = setTimeout(rebuild, 140);
  });

  copyBtn.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(input.value);
      copyBtn.textContent = 'copied';
      copyBtn.classList.add('ok');
      setTimeout(function () {
        copyBtn.textContent = 'copy';
        copyBtn.classList.remove('ok');
      }, 1400);
    } catch {}
  });

  rebuild();
})();
</script>

</body>
</html>`;
}

