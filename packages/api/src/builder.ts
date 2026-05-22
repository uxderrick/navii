/**
 * Interactive builder UI served at GET /build.
 *
 * Lets a user mix-and-match parts manually (no seed) via dropdowns +
 * sliders. The preview is a live image whose `src` is /build/render?... —
 * so the URL itself is the shareable artifact. Copy-URL + copy-code
 * actions sit beneath the preview.
 *
 * The runtime endpoint /build/render is defined in app.ts; this file owns
 * only the HTML.
 */

import { build, type BuildSpec, type AvatarOptions } from '@usenavii/core';

const API_BASE = process.env['NAVII_API_BASE'] ?? 'https://navii-api.uxderrick.com';
const SITE_BASE = process.env['NAVII_SITE_BASE'] ?? 'https://navii.uxderrick.com';

// ── enums duplicated here so we don't import the IDS arrays (avoids the
//    weighted-with-duplicates TOPPER_IDS quirk and keeps the page self-contained).
const BODY = ['orb', 'tall', 'squat', 'pear', 'pebble', 'dumpling', 'taro', 'wisp'] as const;
const EYES = ['round', 'wide', 'squint', 'wink', 'sleepy', 'star', 'heart', 'oval', 'dot', 'cross'] as const;
const MOUTH = ['smile', 'grin', 'open', 'flat', 'smirk', 'awe', 'tongue', 'tooth', 'wave', 'dot'] as const;
const ANTENNA = ['none', 'classic', 'curl', 'double', 'spike'] as const;
const ACCESSORY = ['none', 'blush', 'freckles', 'sparkle', 'glasses', 'eyepatch', 'mole'] as const;
const BACKGROUND = ['none', 'solid', 'ring'] as const;
const TOPPER = ['none', 'ears', 'roundEars', 'horn', 'horns', 'tuft', 'cap', 'leaf', 'headband', 'halo', 'crown', 'antlers'] as const;
const PALETTE = [
  'indigo', 'mint', 'amber', 'sky', 'violet', 'cyan', 'rose', 'lime', 'peach', 'teal',
  'sand', 'plum', 'coral', 'forest', 'slate', 'fuchsia', 'terracotta', 'navy',
  'lavender', 'charcoal', 'butter', 'aqua',
] as const;

/**
 * Validate + normalize a query map into a BuildSpec usable by `Navii.build`.
 * Unknown enum values fall back to undefined (which Navii.build defaults).
 */
export function parseBuildQuery(q: Record<string, string | undefined>): BuildSpec {
  const inEnum = <T extends readonly string[]>(v: string | undefined, allowed: T): T[number] | undefined =>
    v && (allowed as readonly string[]).includes(v) ? (v as T[number]) : undefined;

  const num = (v: string | undefined, min: number, max: number): number | undefined => {
    if (!v) return undefined;
    const n = Number(v);
    if (!Number.isFinite(n)) return undefined;
    return Math.max(min, Math.min(max, n));
  };

  const spec: BuildSpec = {};
  const palette = inEnum(q['palette'], PALETTE);
  const body = inEnum(q['body'], BODY);
  const eyes = inEnum(q['eyes'], EYES);
  const mouth = inEnum(q['mouth'], MOUTH);
  const antenna = inEnum(q['antenna'], ANTENNA);
  const accessory = inEnum(q['accessory'], ACCESSORY);
  const background = inEnum(q['background'], BACKGROUND);
  const topper = inEnum(q['topper'], TOPPER);
  if (palette) spec.palette = palette;
  if (body) spec.body = body;
  if (eyes) spec.eyes = eyes;
  if (mouth) spec.mouth = mouth;
  if (antenna) spec.antenna = antenna;
  if (accessory) spec.accessory = accessory;
  if (background) spec.background = background;
  if (topper) spec.topper = topper;

  const h = num(q['hueShift'], -30, 30);
  const bs = num(q['bodyScale'], 0.92, 1.08);
  const eg = num(q['eyeGapShift'], -2, 2);
  const mc = num(q['mouthCurveScale'], 0.85, 1.15);
  const at = num(q['antennaTilt'], -8, 8);
  if (h !== undefined) spec.hueShift = h;
  if (bs !== undefined) spec.bodyScale = bs;
  if (eg !== undefined) spec.eyeGapShift = eg;
  if (mc !== undefined) spec.mouthCurveScale = mc;
  if (at !== undefined) spec.antennaTilt = at;

  return spec;
}

/** Render a builder-spec avatar via the core engine — shared helper for app.ts. */
export function buildSpecToSvg(spec: BuildSpec, options: AvatarOptions = {}): string {
  return build(spec, options);
}

export function builderHtml(): string {
  const opts = (vals: readonly string[]) =>
    vals.map((v) => `<option value="${v}">${v}</option>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Navii Builder — design any mascot</title>
<meta name="description" content="Interactive Navii avatar builder. Mix bodies, eyes, mouths, antennae, palettes, and continuous tweaks — copy the URL or code snippet." />
<meta name="theme-color" content="#0a0a0b" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="preconnect" href="${API_BASE}" crossorigin />
<style>
  :root {
    --bg: #0a0a0b; --bg-2: #131316; --bg-3: #18181b;
    --ink: #f5f5f5; --muted: #a1a1aa; --muted-2: #71717a;
    --line: #1f1f24; --line-2: #27272a;
    --accent: #c084fc; --good: #86efac;
    --radius: 14px;
    color-scheme: dark;
  }
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; background: var(--bg); color: var(--ink); }
  body {
    font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  a { color: var(--ink); text-decoration: none; }
  a:hover { color: var(--accent); }
  code, .mono { font: 12.5px ui-monospace, SFMono-Regular, Menlo, monospace; }

  .container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }

  /* nav */
  nav.top {
    display: flex; align-items: center; justify-content: space-between;
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
  nav.top .brand { display: flex; align-items: center; gap: 10px; font-weight: 600; }
  nav.top .brand img { width: 28px; height: 28px; border-radius: 50%; }
  nav.top .links { display: flex; gap: 20px; font-size: 13px; color: var(--muted-2); }
  nav.top .links a:hover { color: var(--ink); }

  header.hero { padding: 24px 0 16px; }
  header.hero h1 {
    font-size: clamp(28px, 4vw, 40px);
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0 0 10px;
    font-weight: 600;
  }
  header.hero h1 em { font-style: normal; color: var(--accent); }
  header.hero p { color: var(--muted); margin: 0; max-width: 64ch; font-size: 15px; }
  header.hero a.back {
    display: inline-flex; align-items: center;
    color: var(--muted-2);
    font-size: 13px;
    margin-bottom: 14px;
    transition: color .15s;
  }
  header.hero a.back:hover { color: var(--ink); }

  /* layout */
  .builder {
    display: grid;
    grid-template-columns: minmax(280px, 320px) 1fr;
    gap: 24px;
    margin: 28px 0 64px;
    align-items: start;
  }
  @media (max-width: 820px) {
    .builder { grid-template-columns: 1fr; }
  }

  /* control panel */
  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 18px;
    display: flex; flex-direction: column; gap: 18px;
  }
  .panel-group h2 {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted-2);
    margin: 0 0 10px;
  }
  .field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 8px; }
  .field:last-child { margin-bottom: 0; }
  .field-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .field-row label { font-size: 12.5px; color: var(--ink); font-weight: 500; min-width: 90px; }
  .field-row .val { font: 11.5px ui-monospace, monospace; color: var(--muted-2); min-width: 42px; text-align: right; }

  select {
    appearance: none;
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    color: var(--ink);
    border-radius: 8px;
    padding: 6px 26px 6px 10px;
    font: 12.5px ui-monospace, monospace;
    cursor: pointer;
    flex: 1; min-width: 0;
    background-image: linear-gradient(45deg, transparent 50%, var(--muted) 50%), linear-gradient(135deg, var(--muted) 50%, transparent 50%);
    background-position: calc(100% - 14px) 50%, calc(100% - 10px) 50%;
    background-size: 4px 4px;
    background-repeat: no-repeat;
  }
  select:hover { border-color: var(--muted-2); }
  select:focus { outline: none; border-color: var(--accent); }

  input[type=range] {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 4px;
    background: var(--line-2);
    border-radius: 2px;
    outline: none;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 14px; height: 14px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid var(--bg);
    box-shadow: 0 0 0 1px var(--accent);
  }
  input[type=range]::-moz-range-thumb {
    width: 14px; height: 14px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid var(--bg);
    box-shadow: 0 0 0 1px var(--accent);
  }

  .panel-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .panel-actions button {
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    color: var(--ink);
    border-radius: 8px;
    padding: 7px 12px;
    font: 12px ui-sans-serif, system-ui, sans-serif;
    cursor: pointer;
    flex: 1;
  }
  .panel-actions button:hover { border-color: var(--accent); color: var(--accent); }

  /* preview column */
  .preview-wrap {
    display: flex; flex-direction: column; gap: 16px;
  }
  .preview {
    background: linear-gradient(135deg, #1c1c22, var(--bg));
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 36px;
    display: flex; align-items: center; justify-content: center;
    min-height: 420px;
  }
  .preview img { width: 100%; max-width: 360px; height: auto; display: block; }

  /* output box */
  .out {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .out-tabs {
    display: flex;
    background: var(--bg-3);
    border-bottom: 1px solid var(--line);
  }
  .out-tabs button {
    background: transparent;
    border: 0;
    color: var(--muted-2);
    padding: 10px 14px;
    font: 11.5px ui-monospace, monospace;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
    border-right: 1px solid var(--line);
  }
  .out-tabs button:hover { color: var(--ink); }
  .out-tabs button.active { color: var(--accent); background: var(--bg-2); }
  .out-tabs .spacer { flex: 1; }
  .out-tabs .copy {
    background: transparent;
    border: 0;
    color: var(--muted);
    padding: 10px 14px;
    font: 11.5px ui-monospace, monospace;
    text-transform: uppercase;
    cursor: pointer;
    border-left: 1px solid var(--line);
  }
  .out-tabs .copy:hover { color: var(--ink); }
  .out-tabs .copy.ok { color: var(--good); }
  .out-body {
    padding: 14px 16px;
    font: 12.5px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace;
    color: var(--ink);
    white-space: pre-wrap;
    word-break: break-all;
    min-height: 80px;
  }
  .out-body .verb { color: var(--accent); }
  .out-body .tag  { color: #f472b6; }
  .out-body .attr { color: #93c5fd; }
  .out-body .str  { color: #fbbf24; }
</style>
</head>
<body>
<div class="container">

  <nav class="top">
    <div class="brand">
      <a href="/" style="display:flex; align-items:center; gap:10px; color:inherit;">
        <img src="${API_BASE}/avatar/navii?size=56" alt="navii" />
        <span>navii</span>
      </a>
    </div>
    <div class="links">
      <a href="/docs/quickstart">docs</a>
      <a href="https://github.com/uxderrick/navii">github</a>
    </div>
  </nav>

  <header class="hero">
    <a class="back" href="/">← back</a>
    <h1>Builder — <em>mix any mascot.</em></h1>
    <p>Pick parts directly. No seed needed. Copy the URL or the React snippet to ship a specific mascot — brand logo, fixed avatar, hero illustration.</p>
  </header>

  <div class="builder">

    <aside class="panel" id="panel">

      <div class="panel-group">
        <h2>Body & Color</h2>
        <div class="field"><div class="field-row"><label for="f-body">Body</label>
          <select id="f-body"><option value="">— random —</option>${opts(BODY)}</select></div></div>
        <div class="field"><div class="field-row"><label for="f-palette">Palette</label>
          <select id="f-palette"><option value="">— first —</option>${opts(PALETTE)}</select></div></div>
        <div class="field"><div class="field-row"><label for="f-background">Background</label>
          <select id="f-background"><option value="">— none —</option>${opts(BACKGROUND)}</select></div></div>
      </div>

      <div class="panel-group">
        <h2>Face</h2>
        <div class="field"><div class="field-row"><label for="f-eyes">Eyes</label>
          <select id="f-eyes"><option value="">— round —</option>${opts(EYES)}</select></div></div>
        <div class="field"><div class="field-row"><label for="f-mouth">Mouth</label>
          <select id="f-mouth"><option value="">— smile —</option>${opts(MOUTH)}</select></div></div>
        <div class="field"><div class="field-row"><label for="f-accessory">Accessory</label>
          <select id="f-accessory"><option value="">— none —</option>${opts(ACCESSORY)}</select></div></div>
      </div>

      <div class="panel-group">
        <h2>Toppers</h2>
        <div class="field"><div class="field-row"><label for="f-topper">Topper</label>
          <select id="f-topper"><option value="">— none —</option>${opts(TOPPER)}</select></div></div>
        <div class="field"><div class="field-row"><label for="f-antenna">Antenna</label>
          <select id="f-antenna"><option value="">— none —</option>${opts(ANTENNA)}</select></div></div>
      </div>

      <div class="panel-group">
        <h2>Continuous</h2>
        <div class="field"><div class="field-row"><label for="f-hueShift">Hue shift</label>
          <span class="val" id="v-hueShift">0°</span></div>
          <input type="range" id="f-hueShift" min="-30" max="30" step="1" value="0" /></div>
        <div class="field"><div class="field-row"><label for="f-bodyScale">Body scale</label>
          <span class="val" id="v-bodyScale">1.00×</span></div>
          <input type="range" id="f-bodyScale" min="0.92" max="1.08" step="0.01" value="1" /></div>
        <div class="field"><div class="field-row"><label for="f-eyeGapShift">Eye gap</label>
          <span class="val" id="v-eyeGapShift">0</span></div>
          <input type="range" id="f-eyeGapShift" min="-2" max="2" step="0.1" value="0" /></div>
        <div class="field"><div class="field-row"><label for="f-mouthCurveScale">Mouth curve</label>
          <span class="val" id="v-mouthCurveScale">1.00×</span></div>
          <input type="range" id="f-mouthCurveScale" min="0.85" max="1.15" step="0.01" value="1" /></div>
        <div class="field"><div class="field-row"><label for="f-antennaTilt">Antenna tilt</label>
          <span class="val" id="v-antennaTilt">0°</span></div>
          <input type="range" id="f-antennaTilt" min="-8" max="8" step="1" value="0" /></div>
      </div>

      <div class="panel-actions">
        <button id="btn-random" type="button">Randomize</button>
        <button id="btn-reset" type="button">Reset</button>
      </div>

    </aside>

    <div class="preview-wrap">
      <div class="preview">
        <img id="live" src="/build/render?size=480" alt="" />
      </div>

      <div class="out">
        <div class="out-tabs">
          <button class="active" data-tab="url">URL</button>
          <button data-tab="html">HTML</button>
          <button data-tab="react">React</button>
          <button data-tab="ts">TS</button>
          <span class="spacer"></span>
          <button class="copy" id="copy-btn" type="button">Copy</button>
        </div>
        <div class="out-body" id="out-body"></div>
      </div>
    </div>

  </div>

</div>

<script>
(function () {
  const API_BASE = ${JSON.stringify(API_BASE)};
  const SITE_BASE = ${JSON.stringify(SITE_BASE)};

  const FIELDS = {
    select: ['body','palette','background','eyes','mouth','accessory','topper','antenna'],
    range:  ['hueShift','bodyScale','eyeGapShift','mouthCurveScale','antennaTilt'],
  };

  const live = document.getElementById('live');
  const outBody = document.getElementById('out-body');
  const copyBtn = document.getElementById('copy-btn');
  let activeTab = 'url';

  function getState() {
    const state = {};
    for (const k of FIELDS.select) {
      const v = (document.getElementById('f-' + k)).value;
      if (v) state[k] = v;
    }
    for (const k of FIELDS.range) {
      const raw = parseFloat((document.getElementById('f-' + k)).value);
      const dflt = (k === 'bodyScale' || k === 'mouthCurveScale') ? 1 : 0;
      if (raw !== dflt) state[k] = raw;
    }
    return state;
  }

  function urlFor(state) {
    const u = new URL(API_BASE);
    u.pathname = '/build/render';
    u.searchParams.set('size', '480');
    for (const [k, v] of Object.entries(state)) u.searchParams.set(k, String(v));
    return u.toString();
  }
  function imgSrcFor(state) {
    // Same as urlFor but relative — so the page works on any host the API serves.
    const params = new URLSearchParams({ size: '480' });
    for (const [k, v] of Object.entries(state)) params.set(k, String(v));
    return '/build/render?' + params.toString();
  }

  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function span(cls, text) { const s = document.createElement('span'); if (cls) s.className = cls; s.textContent = text; return s; }

  function paintUrl(url) {
    clear(outBody);
    outBody.appendChild(span('verb', 'GET '));
    outBody.appendChild(span('', url));
  }
  function paintHtml(url) {
    clear(outBody);
    outBody.appendChild(span('tag', '<img '));
    outBody.appendChild(span('attr', 'src'));
    outBody.appendChild(span('', '='));
    outBody.appendChild(span('str', '"' + url + '"'));
    outBody.appendChild(span('', ' '));
    outBody.appendChild(span('attr', 'alt'));
    outBody.appendChild(span('', '='));
    outBody.appendChild(span('str', '"navii"'));
    outBody.appendChild(span('tag', ' />'));
  }
  function paintReact(state) {
    clear(outBody);
    const lines = [];
    lines.push("import { Navii } from '@usenavii/react';");
    lines.push('');
    const keys = Object.keys(state);
    if (keys.length === 0) {
      lines.push('<Navii build size={64} />');
    } else {
      lines.push('<Navii');
      lines.push('  build={{');
      for (const k of keys) {
        const v = state[k];
        const val = typeof v === 'number' ? v : '\\'' + v + '\\'';
        lines.push('    ' + k + ': ' + val + ',');
      }
      lines.push('  }}');
      lines.push('  size={64}');
      lines.push('/>');
    }
    outBody.appendChild(span('', lines.join('\\n')));
  }
  function paintTs(state) {
    clear(outBody);
    const lines = [];
    lines.push("import { Navii } from '@usenavii/core';");
    lines.push('');
    const keys = Object.keys(state);
    if (keys.length === 0) {
      lines.push('const svg = Navii.build({}, { size: 480 });');
    } else {
      lines.push('const svg = Navii.build({');
      for (const k of keys) {
        const v = state[k];
        const val = typeof v === 'number' ? v : '\\'' + v + '\\'';
        lines.push('  ' + k + ': ' + val + ',');
      }
      lines.push('}, { size: 480 });');
    }
    outBody.appendChild(span('', lines.join('\\n')));
  }

  function refresh() {
    const state = getState();
    const url = urlFor(state);
    live.src = imgSrcFor(state);
    if (activeTab === 'url')       paintUrl(url);
    else if (activeTab === 'html') paintHtml(url);
    else if (activeTab === 'react') paintReact(state);
    else if (activeTab === 'ts')   paintTs(state);
  }

  function refreshRangeLabel(k) {
    const v = parseFloat(document.getElementById('f-' + k).value);
    const el = document.getElementById('v-' + k);
    if (k === 'hueShift') el.textContent = (v > 0 ? '+' : '') + v + '°';
    else if (k === 'antennaTilt') el.textContent = (v > 0 ? '+' : '') + v + '°';
    else if (k === 'bodyScale' || k === 'mouthCurveScale') el.textContent = v.toFixed(2) + '×';
    else el.textContent = v.toFixed(1);
  }

  // wire selects
  for (const k of FIELDS.select) {
    document.getElementById('f-' + k).addEventListener('change', refresh);
  }
  // wire ranges
  for (const k of FIELDS.range) {
    const el = document.getElementById('f-' + k);
    el.addEventListener('input', () => { refreshRangeLabel(k); refresh(); });
    refreshRangeLabel(k);
  }
  // wire tabs
  document.querySelectorAll('.out-tabs button[data-tab]').forEach(b => {
    b.addEventListener('click', () => {
      activeTab = b.getAttribute('data-tab');
      document.querySelectorAll('.out-tabs button[data-tab]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      refresh();
    });
  });

  // randomize
  function pickRandom(sel) {
    const opts = Array.from(sel.options).slice(1);
    if (opts.length === 0) return;
    sel.value = opts[Math.floor(Math.random() * opts.length)].value;
  }
  document.getElementById('btn-random').addEventListener('click', () => {
    for (const k of FIELDS.select) pickRandom(document.getElementById('f-' + k));
    for (const k of FIELDS.range) {
      const el = document.getElementById('f-' + k);
      const min = parseFloat(el.min), max = parseFloat(el.max), step = parseFloat(el.step);
      const range = Math.round((max - min) / step);
      el.value = String(min + Math.floor(Math.random() * (range + 1)) * step);
      refreshRangeLabel(k);
    }
    refresh();
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    for (const k of FIELDS.select) document.getElementById('f-' + k).value = '';
    for (const k of FIELDS.range) {
      const el = document.getElementById('f-' + k);
      el.value = (k === 'bodyScale' || k === 'mouthCurveScale') ? '1' : '0';
      refreshRangeLabel(k);
    }
    refresh();
  });

  // copy
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outBody.textContent || '');
      copyBtn.textContent = 'Copied';
      copyBtn.classList.add('ok');
      setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('ok'); }, 1200);
    } catch {}
  });

  refresh();
})();
</script>

</body>
</html>`;
}
