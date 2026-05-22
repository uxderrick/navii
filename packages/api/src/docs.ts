/**
 * Documentation site served under /docs/*.
 *
 * Multi-page reference w/ sticky sidebar nav. Shares aesthetic with the
 * landing page but stripped down — no playground, no marketing copy.
 *
 * Each "page" is just a function returning the inner HTML for the content
 * column. The shell (nav + sidebar + footer) is shared.
 */

import {
  selectAvatar,
  renderAvatar,
  type AvatarSpec,
  type BodyShapeId,
  type EyeStyleId,
  type MouthStyleId,
  type AntennaStyleId,
  type AccessoryId,
  type BackgroundId,
  type TopperId,
  type Palette,
} from '@usenavii/core';
import {
  BODY_IDS,
  EYE_IDS,
  MOUTH_IDS,
  ANTENNA_IDS,
  ACCESSORY_IDS,
  BACKGROUND_IDS,
  TOPPER_IDS,
  PALETTES,
} from '@usenavii/core/parts';

const API_BASE = process.env['NAVII_API_BASE'] ?? 'https://navii-api.uxderrick.com';
const SITE_BASE = process.env['NAVII_SITE_BASE'] ?? 'https://navii.uxderrick.com';

interface DocPage {
  slug: string;
  title: string;
  summary: string;
  section: string;
  body: () => string;
}

const PAGES: DocPage[] = [
  { slug: 'quickstart',  section: 'Start',     title: 'Quickstart',          summary: 'Install and render your first avatar in 60 seconds.', body: pageQuickstart },
  { slug: 'concepts',    section: 'Start',     title: 'Concepts',            summary: 'Determinism, seeds, and the rules that make Navii work.', body: pageConcepts },
  { slug: 'parts',       section: 'Reference', title: 'Parts catalog',       summary: 'Every variant value, rendered.', body: pageParts },
  { slug: 'http-api',    section: 'Reference', title: 'HTTP API',            summary: 'Full endpoint reference for the hosted service.', body: pageHttpApi },
  { slug: 'sdk-core',    section: 'SDK',       title: '@usenavii/core',         summary: 'Engine functions, types, and advanced composition.', body: pageSdkCore },
  { slug: 'sdk-react',   section: 'SDK',       title: '@usenavii/react',        summary: 'React component with memoized rendering.', body: pageSdkReact },
  { slug: 'deployment',  section: 'Operate',   title: 'Self-hosting',        summary: 'Docker, env vars, reverse proxy notes.', body: pageDeployment },
  { slug: 'changelog',   section: 'Operate',   title: 'Changelog',           summary: 'Version history and breaking changes.', body: pageChangelog },
];

export function isDocSlug(slug: string): boolean {
  return PAGES.some((p) => p.slug === slug);
}

export function defaultDocSlug(): string {
  return PAGES[0]!.slug;
}

export function docsHtml(slug: string): string {
  const page = PAGES.find((p) => p.slug === slug);
  if (!page) return shell('not found', notFound(), slug);
  return shell(page.title, page.body(), slug);
}

// ────────────────────────────────────────────────────────────────────────────
// shell

function shell(title: string, content: string, currentSlug: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(title)} — Navii docs</title>
<meta name="description" content="Navii documentation. ${escapeHtml(title)} — deterministic mascot avatars." />
<meta name="theme-color" content="#0a0a0b" />
<meta name="color-scheme" content="dark" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${SITE_BASE}/docs/${currentSlug}" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="preconnect" href="${API_BASE}" crossorigin />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet" />
${styleBlock()}
</head>
<body>
<div class="layout">

  <nav class="top">
    <a class="brand" href="${SITE_BASE}/">
      <img src="/favicon.svg" alt="navii" />
      <span>navii</span>
      <span class="sep">/</span>
      <span class="sub">docs</span>
    </a>
    <div class="links">
      <a href="${SITE_BASE}/">landing</a>
      <a href="${SITE_BASE}/#cast">cast</a>
      <a href="https://github.com/uxderrick/navii">github</a>
    </div>
  </nav>

  <div class="docs">
    <aside class="sidebar">
      ${renderSidebar(currentSlug)}
    </aside>

    <main class="content">
      ${content}

      <nav class="pager">
        ${renderPager(currentSlug)}
      </nav>
    </main>
  </div>

  <footer class="bottom">
    <div>navii · deterministic avatars · open source · MIT</div>
    <div><a href="https://github.com/uxderrick/navii">github</a> · <a href="/api">/api</a></div>
  </footer>

</div>

<script>
(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function svgIcon(kind) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    if (kind === 'check') {
      svg.setAttribute('stroke-width', '1.6');
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', 'M3 8.5l3.5 3.5L13 5');
      svg.appendChild(p);
    } else {
      svg.setAttribute('stroke-width', '1.4');
      const r = document.createElementNS(SVG_NS, 'rect');
      r.setAttribute('x', '4'); r.setAttribute('y', '4');
      r.setAttribute('width', '9'); r.setAttribute('height', '9');
      r.setAttribute('rx', '1.5');
      svg.appendChild(r);
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', 'M3 11V3.5A1.5 1.5 0 0 1 4.5 2H11');
      svg.appendChild(p);
    }
    return svg;
  }

  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function span(cls, text) { const s = document.createElement('span'); if (cls) s.className = cls; s.textContent = text; return s; }
  function setButtonContent(btn, kind, label) {
    clear(btn);
    btn.appendChild(svgIcon(kind));
    btn.appendChild(span('lbl', label));
  }

  function tokenize(src) {
    const N = src.length;
    const marks = new Array(N).fill(null);
    const stamp = function (start, end, cls) {
      for (let i = start; i < end; i++) if (marks[i] === null) marks[i] = cls;
    };
    const overwrite = function (start, end, cls) {
      for (let i = start; i < end; i++) marks[i] = cls;
    };

    for (const m of src.matchAll(/'[^'\\n]*'|"[^"\\n]*"|\`[^\`]*\`/g)) {
      stamp(m.index, m.index + m[0].length, 'tk-str');
    }
    for (const m of src.matchAll(/(\\/\\/[^\\n]*|#[^\\n]*)/g)) {
      stamp(m.index, m.index + m[0].length, 'tk-comment');
    }
    for (const m of src.matchAll(/<\\/?[a-zA-Z][\\w-]*|\\/>/g)) {
      stamp(m.index, m.index + m[0].length, 'tk-tag');
    }
    for (const m of src.matchAll(/\\b([a-zA-Z:][a-zA-Z\\d:_-]*)(?==)/g)) {
      const prev = src[m.index - 1];
      if (prev === '.' || prev === '\$') continue;
      stamp(m.index, m.index + m[1].length, 'tk-attr');
    }
    for (const m of src.matchAll(/\\b(import|from|const|let|var|return|await|async|new|function|interface|type|export|default|extends|implements|of|in|true|false|null|undefined|class)\\b/g)) {
      stamp(m.index, m.index + m[0].length, 'tk-keyword');
    }
    for (const m of src.matchAll(/(?:^|\\n)(GET|POST|PUT|PATCH|DELETE)\\b/g)) {
      const off = m[0].length - m[1].length;
      overwrite(m.index + off, m.index + off + m[1].length, 'tk-verb');
    }
    for (const m of src.matchAll(/\\b\\d+(?:\\.\\d+)?\\b/g)) {
      stamp(m.index, m.index + m[0].length, 'tk-num');
    }
    for (const m of src.matchAll(/https?:\\/\\/[^\\s'"<>)]+/g)) {
      const start = m.index;
      const end = start + m[0].length;
      const protoEnd = m[0].indexOf('//') + 2;
      const slashAfter = m[0].indexOf('/', protoEnd);
      const hostEnd = slashAfter < 0 ? end : start + slashAfter;
      overwrite(start, hostEnd, 'tk-host');
      const qIdx = m[0].indexOf('?');
      const pathEndAbs = qIdx < 0 ? end : start + qIdx;
      overwrite(hostEnd, pathEndAbs, 'tk-path');
      if (qIdx >= 0) {
        for (const q of m[0].slice(qIdx).matchAll(/([?&])([a-zA-Z][\\w-]*)(=)([^&\\s'"<>)]*)/g)) {
          let cur = start + qIdx + q.index;
          overwrite(cur, cur + q[1].length, 'tk-punct'); cur += q[1].length;
          overwrite(cur, cur + q[2].length, 'tk-key');   cur += q[2].length;
          overwrite(cur, cur + q[3].length, 'tk-punct'); cur += q[3].length;
          const isNum = /^-?\\d+(\\.\\d+)?\$/.test(q[4]);
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

  function paint(codeEl) {
    const src = codeEl.textContent;
    clear(codeEl);
    for (const tok of tokenize(src)) {
      if (tok.cls) codeEl.appendChild(span(tok.cls, tok.text));
      else codeEl.appendChild(document.createTextNode(tok.text));
    }
  }

  function makeButton(getText) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-icon';
    btn.setAttribute('aria-label', 'Copy code');
    setButtonContent(btn, 'copy', 'copy');
    btn.addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(getText());
        btn.classList.add('ok');
        setButtonContent(btn, 'check', 'copied');
        setTimeout(function () {
          btn.classList.remove('ok');
          setButtonContent(btn, 'copy', 'copy');
        }, 1400);
      } catch (e) {}
    });
    return btn;
  }

  function enhance() {
    document.querySelectorAll('pre.code').forEach(function (pre) {
      if (pre.parentElement && pre.parentElement.classList.contains('code-block')) return;
      const wrap = document.createElement('div');
      wrap.className = 'code-block';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      const codeEl = pre.querySelector('code') || pre;
      paint(codeEl);
      wrap.appendChild(makeButton(function () { return codeEl.textContent; }));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhance);
  } else {
    enhance();
  }
})();
</script>

</body>
</html>`;
}

function renderSidebar(currentSlug: string): string {
  const sections = new Map<string, DocPage[]>();
  for (const p of PAGES) {
    const arr = sections.get(p.section) ?? [];
    arr.push(p);
    sections.set(p.section, arr);
  }
  return Array.from(sections.entries())
    .map(([section, pages]) => {
      const items = pages
        .map(
          (p) =>
            `<a class="sb-item${p.slug === currentSlug ? ' active' : ''}" href="/docs/${p.slug}">${escapeHtml(p.title)}</a>`,
        )
        .join('');
      return `<div class="sb-section"><h5>${escapeHtml(section)}</h5>${items}</div>`;
    })
    .join('');
}

function renderPager(currentSlug: string): string {
  const idx = PAGES.findIndex((p) => p.slug === currentSlug);
  if (idx === -1) return '';
  const prev = idx > 0 ? PAGES[idx - 1]! : null;
  const next = idx < PAGES.length - 1 ? PAGES[idx + 1]! : null;
  const left = prev
    ? `<a class="pager-link prev" href="/docs/${prev.slug}"><span class="lbl">← Previous</span><span class="ttl">${escapeHtml(prev.title)}</span></a>`
    : '<span></span>';
  const right = next
    ? `<a class="pager-link next" href="/docs/${next.slug}"><span class="lbl">Next →</span><span class="ttl">${escapeHtml(next.title)}</span></a>`
    : '<span></span>';
  return left + right;
}

function notFound(): string {
  return `
    <header class="page-head">
      <h1>Not found</h1>
      <p class="lede">No doc page at that slug. Try <a href="/docs/quickstart">quickstart</a>.</p>
    </header>
  `;
}

// ────────────────────────────────────────────────────────────────────────────
// pages

function pageQuickstart(): string {
  return `
    <header class="page-head">
      <h1>Quickstart</h1>
      <p class="lede">Three ways to render a deterministic Navii avatar. Pick the one that fits your stack — they all use the same engine, all produce the same SVG for the same seed.</p>
    </header>

    <section>
      <h2 id="hosted">Hosted (zero install)</h2>
      <p>Drop an <code>&lt;img&gt;</code> tag. No build step, no SDK. Works in HTML, React, Vue, anywhere a URL fits.</p>
      <pre class="code"><code>&lt;img src="${API_BASE}/avatar/alice@example.com?size=96" /&gt;</code></pre>
      <p>Append <code>.png</code> to the seed if you need a raster image (emails, OG images, native apps):</p>
      <pre class="code"><code>&lt;img src="${API_BASE}/avatar/alice@example.com.png?size=256" /&gt;</code></pre>
    </section>

    <section>
      <h2 id="core">@usenavii/core (any JS runtime)</h2>
      <pre class="code"><code>npm i @usenavii/core</code></pre>
      <pre class="code"><code>import { createAvatar } from '@usenavii/core';

const svg = createAvatar(user.id, { size: 96 });
document.body.insertAdjacentHTML('beforeend', svg);</code></pre>
      <p>Pure TypeScript, no dependencies. Runs on Node, Bun, Deno, Cloudflare Workers, browsers — anywhere ES modules run.</p>
    </section>

    <section>
      <h2 id="react">@usenavii/react</h2>
      <pre class="code"><code>npm i @usenavii/react</code></pre>
      <pre class="code"><code>import { Navii } from '@usenavii/react';

&lt;Navii seed={user.id} size={64} title={user.name} animated /&gt;</code></pre>
      <p>Memoized <code>&lt;img src="data:image/svg+xml;..."&gt;</code> — the SVG renders client-side and is treated as opaque image by the browser (no inline scripting surface).</p>
    </section>

    <section>
      <h2 id="next">Where to go next</h2>
      <ul>
        <li><a href="/docs/concepts">Concepts</a> — what "seed" means and why determinism matters.</li>
        <li><a href="/docs/parts">Parts catalog</a> — every variant rendered, so you know what you're choosing from.</li>
        <li><a href="/docs/http-api">HTTP API</a> — full endpoint reference for the hosted service.</li>
      </ul>
    </section>
  `;
}

function pageConcepts(): string {
  return `
    <header class="page-head">
      <h1>Concepts</h1>
      <p class="lede">Navii makes one promise: same seed in → same avatar out, byte-for-byte, forever. Everything else flows from that.</p>
    </header>

    <section>
      <h2 id="determinism">Determinism</h2>
      <p><code>createAvatar(seed)</code> is a pure function. The PRNG is <code>sfc32</code> seeded from a <code>cyrb53</code> hash of the seed string. Part picks happen in a fixed order so future part additions go to the end of the stream — adding new variants in a release never shifts existing seeds' selections.</p>
      <p>This means: a backend can render the same avatar in Node that the browser renders in React, and a Cloudflare Worker rasters to PNG — all from the same seed, all byte-identical.</p>
      <p>Practical consequences:</p>
      <ul>
        <li>Safe to cache aggressively (1-year <code>immutable</code> headers on hosted endpoint).</li>
        <li>Safe to render on SSR + client — no hydration mismatch.</li>
        <li>Safe to mirror across regions.</li>
      </ul>
    </section>

    <section>
      <h2 id="seeds">Seeds: the rule</h2>
      <p>The seed determines the avatar. Same seed → same avatar, always. That's the whole contract. Two consequences:</p>
      <table class="rules">
        <thead><tr><th>Seed input</th><th>Recommendation</th></tr></thead>
        <tbody>
          <tr><td><code>user.id</code> / UUID</td><td><span class="ok">Best.</span> Stable, globally unique.</td></tr>
          <tr><td><code>user.email</code></td><td><span class="ok">Good.</span> Stable, unique per user.</td></tr>
          <tr><td><code>user.name</code> alone</td><td><span class="warn">Names collide.</span> Two "Alice"s get the same face.</td></tr>
          <tr><td><code>\${name}-\${createdAt}</code></td><td><span class="ok">Fine fallback.</span> Bake at signup, not at render.</td></tr>
          <tr><td><code>Date.now()</code> at render</td><td><span class="bad">Don't.</span> Avatar would change every reload.</td></tr>
        </tbody>
      </table>
      <p>If you only have a display name, compose a stable seed at signup (<code>\${name}-\${createdAt}</code>) and persist it. Never derive the seed from current time at render time.</p>
    </section>

    <section>
      <h2 id="parts">Parts taxonomy</h2>
      <p>Every avatar is the composition of eight discrete parts plus five continuous tweaks. The seed picks each.</p>
      <ul>
        <li><strong>Discrete parts</strong> — palette, body, eyes, mouth, antenna, accessory, background, topper. See <a href="/docs/parts">the parts catalog</a> for every variant value rendered.</li>
        <li><strong>Continuous tweaks</strong> — hue rotation (±30°), body scale (0.92×–1.08×), eye gap shift (±2), mouth curvature (0.85×–1.15×), antenna tilt (±8°). These keep neighboring seeds from reading identical.</li>
      </ul>
      <p>Discrete combos: 22 × 8 × 10 × 10 × 5 × 7 × 3 × 12 = <strong>22,176,000</strong>. Continuous tweaks make the effective output unbounded while staying fully deterministic.</p>
    </section>

    <section>
      <h2 id="overrides">Overrides</h2>
      <p>By default everything is seed-derived. You can override two things via the HTTP API:</p>
      <ul>
        <li><code>palette</code> — force a specific color family.</li>
        <li><code>background</code> — force <code>none</code>, <code>solid</code>, or <code>ring</code>.</li>
      </ul>
      <p>Programmatic callers via <code>@usenavii/core</code> can override anything by mutating the <code>AvatarSpec</code> directly. See <a href="/docs/sdk-core">@usenavii/core docs</a>.</p>
    </section>
  `;
}

function pageParts(): string {
  // Base spec — every catalog tile uses this as a foundation, only the
  // target part is mutated. Keeps "what changed" obvious to the reader.
  const baseSeed = 'navii-doc-base';
  const base: AvatarSpec = {
    ...selectAvatar(baseSeed),
    // pin neutral choices so we don't accidentally clash w/ a topper-suppressed body etc
    antenna: 'classic',
    accessory: 'none',
    background: 'ring',
    topper: 'none',
    hueShift: 0,
    bodyScale: 1,
    eyeGapShift: 0,
    mouthCurveScale: 1,
    antennaTilt: 0,
  };

  function tile(label: string, spec: AvatarSpec): string {
    const svg = renderAvatar(spec, { size: 120 });
    return `<div class="ptile"><div class="ptile-art">${svg}</div><div class="ptile-label">${escapeHtml(label)}</div></div>`;
  }

  function grid(items: string[]): string {
    return `<div class="pgrid">${items.join('')}</div>`;
  }

  const palettes = grid(
    (PALETTES as readonly Palette[]).map((p) =>
      tile(p.id, { ...base, palette: p }),
    ),
  );
  const bodies = grid((BODY_IDS as readonly BodyShapeId[]).map((b) => tile(b, { ...base, body: b })));
  const eyes = grid((EYE_IDS as readonly EyeStyleId[]).map((e) => tile(e, { ...base, eyes: e })));
  const mouths = grid((MOUTH_IDS as readonly MouthStyleId[]).map((m) => tile(m, { ...base, mouth: m })));
  const antennae = grid(
    (ANTENNA_IDS as readonly AntennaStyleId[]).map((a) => tile(a, { ...base, antenna: a })),
  );
  const accessories = grid(
    (ACCESSORY_IDS as readonly AccessoryId[]).map((a) => tile(a, { ...base, accessory: a })),
  );
  const backgrounds = grid(
    (BACKGROUND_IDS as readonly BackgroundId[]).map((b) => tile(b, { ...base, background: b })),
  );
  const uniqueToppers = Array.from(new Set(TOPPER_IDS as readonly TopperId[]));
  const toppers = grid(
    uniqueToppers.map((t) =>
      // antenna suppressed so the topper actually shows
      tile(t, { ...base, antenna: 'none', topper: t }),
    ),
  );

  return `
    <header class="page-head">
      <h1>Parts catalog</h1>
      <p class="lede">Every variant value, rendered against a neutral base so you can see exactly what each one looks like. Same base spec, only the named part varies.</p>
    </header>

    <section>
      <h2 id="palette">Palette <span class="count">22</span></h2>
      <p>Color families. Each palette defines five colors (body gradient, accent, ink, blush). Override via <code>?palette=mint</code> on the HTTP API.</p>
      ${palettes}
    </section>

    <section>
      <h2 id="body">Body <span class="count">8</span></h2>
      <p>Silhouette shape. Each has its own anchor table — eyes, mouth, antenna, and topper move to suit the silhouette.</p>
      ${bodies}
    </section>

    <section>
      <h2 id="eyes">Eyes <span class="count">10</span></h2>
      ${eyes}
    </section>

    <section>
      <h2 id="mouth">Mouth <span class="count">10</span></h2>
      ${mouths}
    </section>

    <section>
      <h2 id="antenna">Antenna <span class="count">5</span></h2>
      <p>Mounts at the body's apex. When an antenna is present, the seed-picked topper is suppressed to avoid visual collision (except <code>leaf</code>).</p>
      ${antennae}
    </section>

    <section>
      <h2 id="accessory">Accessory <span class="count">7</span></h2>
      ${accessories}
    </section>

    <section>
      <h2 id="background">Background <span class="count">3</span></h2>
      <p>Scene fill behind the figure. Override via <code>?background=ring</code>.</p>
      ${backgrounds}
    </section>

    <section>
      <h2 id="topper">Topper <span class="count">12</span></h2>
      <p>Sits on top of the body. Suppressed when an antenna is also present.</p>
      ${toppers}
    </section>
  `;
}

function pageHttpApi(): string {
  return `
    <header class="page-head">
      <h1>HTTP API</h1>
      <p class="lede">Hosted at <code>${API_BASE}</code>. No auth, public CORS, fully cacheable. Plain text errors, image responses for everything else.</p>
    </header>

    <section>
      <h2 id="avatar">GET /avatar/:seed[.svg|.png]</h2>
      <p>Returns a deterministic mascot avatar for the given seed. Same seed → same avatar, byte-for-byte. Append <code>.png</code> to the seed to receive a rasterized PNG instead of SVG.</p>

      <h4>Path</h4>
      <table>
        <thead><tr><th>Param</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>:seed</code></td><td>string</td><td>Any unique identifier. Use a stable user id, UUID, or email. Avoid display names — see <a href="/docs/concepts#seeds">the seed rule</a>.</td></tr>
        </tbody>
      </table>

      <h4>Query</h4>
      <table>
        <thead><tr><th>Param</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>size</code></td><td>int</td><td>96</td><td>Output size in px. Clamped to 16–1024.</td></tr>
          <tr><td><code>palette</code></td><td>enum</td><td>seeded</td><td>Force a color family. See <a href="/docs/parts#palette">palette catalog</a>.</td></tr>
          <tr><td><code>background</code></td><td>enum</td><td>seeded</td><td><code>none</code> · <code>solid</code> · <code>ring</code>.</td></tr>
          <tr><td><code>tileBg</code></td><td>color</td><td>none</td><td>Opaque circular fill behind avatar. Any CSS color (URL-encoded, e.g. <code>%23ffffff</code>) or <code>auto</code> to use the palette accent.</td></tr>
          <tr><td><code>title</code></td><td>string</td><td>none</td><td>Accessible label. Adds <code>role="img"</code> + <code>aria-label</code> to the SVG root.</td></tr>
          <tr><td><code>animated</code></td><td>0 / 1</td><td>0</td><td>Idle motion (float, blink, antenna sway, spark pulse, twinkle). SVG only — ignored for PNG. Honors <code>prefers-reduced-motion</code>.</td></tr>
        </tbody>
      </table>

      <h4>Examples</h4>
      <pre class="code"><code>${API_BASE}/avatar/alice
${API_BASE}/avatar/alice?palette=violet&amp;animated=1
${API_BASE}/avatar/alice?tileBg=%23ffffff
${API_BASE}/avatar/alice.png?size=512&amp;tileBg=auto</code></pre>
    </section>

    <section>
      <h2 id="group">GET /group</h2>
      <p>Renders multiple seeded avatars as a single horizontally-stacked SVG with optional overlap and a <code>+N</code> counter tile for overflow.</p>

      <h4>Query</h4>
      <table>
        <thead><tr><th>Param</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>seeds</code></td><td>csv</td><td>—</td><td>Comma-separated seeds (up to 50). Required.</td></tr>
          <tr><td><code>size</code></td><td>int</td><td>64</td><td>Per-tile size in px. Clamped to 16–256.</td></tr>
          <tr><td><code>overlap</code></td><td>float</td><td>0.3</td><td>Fraction each tile overlaps the previous. 0 = no overlap, 0.7 = heavy stack.</td></tr>
          <tr><td><code>max</code></td><td>int</td><td>all</td><td>Max tiles to render. Extra seeds collapse into a <code>+N</code> tile.</td></tr>
          <tr><td><code>ring</code></td><td>color</td><td><code>#ffffff</code></td><td>Border color around each tile.</td></tr>
          <tr><td><code>tileBg</code></td><td>color</td><td><code>#ffffff</code></td><td>Opaque fill behind each avatar (prevents overlap show-through).</td></tr>
          <tr><td><code>animated</code></td><td>0 / 1</td><td>0</td><td>Per-avatar animation.</td></tr>
        </tbody>
      </table>
      <p class="note"><strong>SDK-only:</strong> <code>counterFill</code> and <code>counterInk</code> (the <code>+N</code> tile's colors) are settable via <code>GroupOptions</code> in <code>@usenavii/core</code> but not yet wired to query params.</p>
    </section>

    <section>
      <h2 id="utility">Utility endpoints</h2>
      <table>
        <thead><tr><th>Path</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>GET /</code></td><td>Landing page with live playground.</td></tr>
          <tr><td><code>GET /api</code></td><td>Service metadata as JSON. Returns <code>{ "name": "navii", "version": "...", "endpoints": {...} }</code>.</td></tr>
          <tr><td><code>GET /healthz</code></td><td>Liveness probe. Returns <code>{ "ok": true, "pngCacheSize": N }</code>.</td></tr>
          <tr><td><code>GET /gallery</code></td><td>HTML grid of N seeded avatars (visual debug).</td></tr>
          <tr><td><code>GET /favicon.svg</code></td><td>Brand favicon. SVG.</td></tr>
          <tr><td><code>GET /apple-touch-icon.png</code></td><td>180×180 dark-tile icon for iOS home-screen.</td></tr>
          <tr><td><code>GET /og.png</code></td><td>1200×630 Open Graph image. No params.</td></tr>
          <tr><td><code>GET /robots.txt</code>, <code>/sitemap.xml</code></td><td>SEO essentials.</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2 id="headers">Response headers</h2>
      <p>All image responses set:</p>
      <ul>
        <li><code>cache-control: public, max-age=31536000, immutable</code> — safe to cache forever (seed + params fully determine bytes).</li>
        <li><code>access-control-allow-origin: *</code> — embed anywhere, no preflight for <code>GET</code>.</li>
        <li><code>content-type: image/svg+xml; charset=utf-8</code> for SVG, <code>image/png</code> for PNG, <code>application/json</code> for <code>/api</code> + <code>/healthz</code>.</li>
      </ul>
      <p>Rate-limited routes additionally emit:</p>
      <ul>
        <li><code>x-ratelimit-limit</code> — max requests in the current window.</li>
        <li><code>x-ratelimit-remaining</code> — remaining requests.</li>
        <li><code>x-ratelimit-reset</code> — Unix epoch seconds when the window resets.</li>
        <li><code>retry-after</code> — only on <code>429</code> responses.</li>
      </ul>
    </section>

    <section>
      <h2 id="errors">Errors</h2>
      <p>Plain-text bodies. Status codes:</p>
      <table>
        <thead><tr><th>Status</th><th>Meaning</th><th>Body</th></tr></thead>
        <tbody>
          <tr><td>400</td><td>Bad request</td><td><code>seed required</code> · <code>seeds required (comma-separated)</code></td></tr>
          <tr><td>429</td><td>Rate limited</td><td><code>Rate limit exceeded</code></td></tr>
          <tr><td>501</td><td>Not implemented</td><td><code>PNG rasterization unavailable: ...</code> — server missing <code>@resvg/resvg-js</code>. SVG endpoint still works.</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2 id="rate-limits">Rate limits</h2>
      <p>Per-IP sliding window on <code>/avatar/*</code>. Default <strong>120 req/minute</strong>; this deployment runs at 600/min. Configurable via <code>RATE_LIMIT_PER_MIN</code> env var when self-hosting. <code>/group</code>, <code>/gallery</code>, <code>/healthz</code> are unlimited.</p>
      <p>Exceeded → HTTP 429 + <code>retry-after</code> header.</p>
    </section>

    <section>
      <h2 id="encoding">Seeds and URL encoding</h2>
      <p>Anything you can put in a URL path can be a seed. Seeds with <code>@</code>, <code>.</code>, or other URL-special chars work — just URL-encode them on the client (most browsers do this automatically inside <code>&lt;img src&gt;</code>).</p>
      <pre class="code"><code>raw:     alice@example.com
encoded: alice%40example.com</code></pre>
      <p>The server decodes back to the raw seed before hashing, so both URLs produce the same SVG. Empty seeds → 400.</p>
    </section>
  `;
}

function pageSdkCore(): string {
  return `
    <header class="page-head">
      <h1>@usenavii/core</h1>
      <p class="lede">Framework-agnostic engine. Seed in, SVG string out. Pure TypeScript, zero runtime dependencies, ~8 KB gzipped target.</p>
    </header>

    <section>
      <h2 id="install">Install</h2>
      <pre class="code"><code>npm i @usenavii/core
# or pnpm / yarn / bun</code></pre>
    </section>

    <section>
      <h2 id="functions">Functions</h2>
      <pre class="code"><code>createAvatar(seed: string, options?: AvatarOptions): string
selectAvatar(seed: string, options?: AvatarOptions): AvatarSpec
renderAvatar(spec:  AvatarSpec, options?: AvatarOptions): string
renderAvatarInner(spec: AvatarSpec, options?: AvatarOptions): string
renderGroup(seeds:  string[], options?: GroupOptions): string</code></pre>
      <p><code>createAvatar</code> is the convenience composition of <code>selectAvatar</code> + <code>renderAvatar</code>. Use the split pair when you want to inspect or mutate the spec between picking and rendering.</p>
      <p><code>renderAvatarInner</code> emits the SVG body without an outer <code>&lt;svg&gt;</code> wrapper — useful when composing multiple avatars into one SVG document (this is how <code>renderGroup</code> works internally).</p>
    </section>

    <section>
      <h2 id="options">AvatarOptions</h2>
      <table>
        <thead><tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>size</code></td><td>number (px)</td><td>96</td><td>Output canvas size. SVG viewBox is fixed at 100×100; size scales it.</td></tr>
          <tr><td><code>paletteId</code></td><td>string</td><td>seeded</td><td>Force a specific palette. Pass any palette id.</td></tr>
          <tr><td><code>background</code></td><td>enum or <code>{ color: string }</code></td><td>seeded</td><td>Override scene fill. Enum form picks from <code>'none' | 'solid' | 'ring'</code>; object form supplies an exact color.</td></tr>
          <tr><td><code>title</code></td><td>string</td><td>—</td><td>Adds <code>role="img"</code> and <code>aria-label</code>.</td></tr>
          <tr><td><code>animated</code></td><td>boolean</td><td>false</td><td>Emits inline <code>&lt;style&gt;</code> with idle animations. Honors <code>prefers-reduced-motion</code>.</td></tr>
          <tr><td><code>tileBg</code></td><td>string</td><td>—</td><td>Opaque circular fill behind avatar. Any CSS color or <code>'auto'</code> to use palette accent.</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2 id="spec">AvatarSpec</h2>
      <p>The resolved description of an individual avatar — what <code>selectAvatar</code> returns and what <code>renderAvatar</code> consumes.</p>
      <pre class="code"><code>interface AvatarSpec {
  seed:       string;
  palette:    Palette;
  body:       BodyShapeId;
  eyes:       EyeStyleId;
  mouth:      MouthStyleId;
  antenna:    AntennaStyleId;
  accessory:  AccessoryId;
  background: BackgroundId;
  topper:     TopperId;

  // Continuous tweaks
  hueShift:        number;  // degrees, signed
  bodyScale:       number;  // 0.92–1.08
  eyeGapShift:     number;  // px (viewBox units), signed
  mouthCurveScale: number;  // 0.85–1.15
  antennaTilt:     number;  // degrees, signed
}</code></pre>
      <p>All <code>*Id</code> types are string unions. <code>Palette</code> is an object: <code>{ id, bodyFrom, bodyTo, accent, ink, blush }</code>.</p>
    </section>

    <section>
      <h2 id="compose">Advanced: composition</h2>
      <p>The split <code>selectAvatar</code> + <code>renderAvatar</code> lets you override any part programmatically — not just the two the HTTP API exposes.</p>
      <pre class="code"><code>import { selectAvatar, renderAvatar } from '@usenavii/core';

const base = selectAvatar('alice');
const svg = renderAvatar({ ...base, body: 'tall', eyes: 'star' }, { size: 128 });</code></pre>
    </section>

    <section>
      <h2 id="group-options">GroupOptions</h2>
      <p>Extends <code>AvatarOptions</code> with these additional fields:</p>
      <table>
        <thead><tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>size</code></td><td>number</td><td>64</td><td>Per-tile size.</td></tr>
          <tr><td><code>overlap</code></td><td>number</td><td>0.3</td><td>Tile overlap fraction (0–0.7).</td></tr>
          <tr><td><code>max</code></td><td>number</td><td>all</td><td>Cap tiles; remainder collapses into <code>+N</code>.</td></tr>
          <tr><td><code>ring</code></td><td>string</td><td><code>#ffffff</code></td><td>Border ring around each tile.</td></tr>
          <tr><td><code>tileBg</code></td><td>string</td><td><code>#ffffff</code></td><td>Solid fill behind each avatar.</td></tr>
          <tr><td><code>counterFill</code></td><td>string</td><td><code>#E5E7EB</code></td><td>Background of the <code>+N</code> tile.</td></tr>
          <tr><td><code>counterInk</code></td><td>string</td><td><code>#374151</code></td><td>Text color of the <code>+N</code> tile.</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2 id="exports">Other exports</h2>
      <ul>
        <li><code>createRng(seed)</code> — the PRNG used internally. Returns <code>{ next(), range(min, max), pick(arr) }</code>.</li>
        <li><code>cyrb53(string)</code> — fast 53-bit string hash. Used to seed the PRNG.</li>
        <li><code>@usenavii/core/parts</code> subpath — exports the part-id arrays (<code>BODY_IDS</code>, <code>EYE_IDS</code>, etc.) and <code>PALETTES</code>.</li>
      </ul>
    </section>
  `;
}

function pageSdkReact(): string {
  return `
    <header class="page-head">
      <h1>@usenavii/react</h1>
      <p class="lede">A thin React component on top of <code>@usenavii/core</code>. Memoized; renders the engine output as a data-URI <code>&lt;img&gt;</code> so the SVG is treated as opaque by the browser.</p>
    </header>

    <section>
      <h2 id="install">Install</h2>
      <pre class="code"><code>npm i @usenavii/react</code></pre>
      <p><code>@usenavii/core</code> is bundled in; you don't install it separately unless you also use the engine directly.</p>
    </section>

    <section>
      <h2 id="usage">Usage</h2>
      <pre class="code"><code>import { Navii } from '@usenavii/react';

export function UserChip({ user }) {
  return (
    &lt;Navii
      seed={user.id}
      size={48}
      title={user.name}
      animated
      className="rounded-full"
    /&gt;
  );
}</code></pre>
    </section>

    <section>
      <h2 id="props">Props</h2>
      <p>Extends <code>AvatarOptions</code> (see <a href="/docs/sdk-core#options">core docs</a>) plus:</p>
      <table>
        <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>seed</code></td><td>string</td><td><strong>Required.</strong> See <a href="/docs/concepts#seeds">the seed rule</a>.</td></tr>
          <tr><td><code>className</code></td><td>string</td><td>Class applied to the <code>&lt;img&gt;</code> element.</td></tr>
          <tr><td><code>style</code></td><td>CSSProperties</td><td>Inline style on the <code>&lt;img&gt;</code>.</td></tr>
          <tr><td><code>alt</code></td><td>string</td><td>Alt text. Falls back to <code>title</code> if omitted.</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2 id="memo">Memoization</h2>
      <p>The component memoizes the data-URI on <code>seed</code> + all option props. The SVG renders client-side on first mount; subsequent renders with the same props reuse the cached URI.</p>
      <p>If you're rendering a list, ensure your seeds are stable across renders (e.g. <code>user.id</code>, not <code>idx + Date.now()</code>) — otherwise every render rebuilds every avatar.</p>
    </section>

    <section>
      <h2 id="re-exports">Re-exports</h2>
      <p>All <code>@usenavii/core</code> top-level exports are re-exported for convenience: <code>createAvatar</code>, <code>selectAvatar</code>, <code>renderAvatar</code>, plus the types <code>AvatarSpec</code>, <code>AvatarOptions</code>, <code>Palette</code>.</p>
    </section>
  `;
}

function pageDeployment(): string {
  return `
    <header class="page-head">
      <h1>Self-hosting</h1>
      <p class="lede">Navii ships a production-ready Docker image. Single-process Hono app, no database, in-memory PNG cache. Tested on Hetzner; portable to any Node runtime, Bun, Deno, or Cloudflare Workers (with the wasm raster).</p>
    </header>

    <section>
      <h2 id="docker">Docker</h2>
      <pre class="code"><code>docker build -t navii-api packages/api
docker run -p 8787:8787 navii-api</code></pre>
      <p>The Dockerfile is multi-stage: pnpm install + build in stage 1, slim runtime in stage 2. Fonts (<code>fonts-dejavu-core</code>) are installed in the runtime image so <code>resvg-js</code> renders text properly in PNG/OG output.</p>
    </section>

    <section>
      <h2 id="env">Environment variables</h2>
      <table>
        <thead><tr><th>Var</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>PORT</code></td><td>8787</td><td>HTTP listen port.</td></tr>
          <tr><td><code>HOST</code></td><td>0.0.0.0</td><td>HTTP bind address.</td></tr>
          <tr><td><code>RATE_LIMIT_PER_MIN</code></td><td>120</td><td>Per-IP rate limit on <code>/avatar/*</code>.</td></tr>
          <tr><td><code>PNG_CACHE_SIZE</code></td><td>500</td><td>LRU capacity for rasterized PNG responses.</td></tr>
          <tr><td><code>TRUST_PROXY</code></td><td>0</td><td>Set to <code>1</code> behind a reverse proxy you control (Caddy/Nginx). Enables <code>X-Forwarded-For</code> reading for rate-limit IP attribution. <strong>Never enable behind raw CDN</strong> — clients could spoof IPs.</td></tr>
          <tr><td><code>NAVII_API_BASE</code></td><td><code>https://navii-api.uxderrick.com</code></td><td>Used in landing + docs HTML for absolute API URLs (e.g. cast images, OG image).</td></tr>
          <tr><td><code>NAVII_SITE_BASE</code></td><td><code>https://navii.uxderrick.com</code></td><td>Public site URL. Used in canonical + OpenGraph meta.</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2 id="proxy">Reverse proxy</h2>
      <p>A sample <code>Caddyfile</code> snippet lives at <code>deploy/Caddyfile.snippet</code>. It does the usual: TLS, gzip, forward to <code>:8787</code>, set <code>X-Forwarded-For</code>.</p>
      <p>Per-domain routing (landing on <code>navii.uxderrick.com</code>, API on <code>navii-api.uxderrick.com</code>) is purely DNS + proxy concern — the Hono app handles both transparently.</p>
    </section>

    <section>
      <h2 id="health">Health check</h2>
      <p><code>GET /healthz</code> returns <code>{ "ok": true, "pngCacheSize": N }</code>. The Docker image declares a built-in <code>HEALTHCHECK</code> that hits this endpoint every 30 s.</p>
    </section>

    <section>
      <h2 id="resource">Resource notes</h2>
      <ul>
        <li>SVG generation is essentially free (~microseconds per avatar).</li>
        <li>PNG raster is the expensive op — depends on size. ~10–40 ms for 256 px on a small VPS, dominated by resvg's text + filter pipeline.</li>
        <li>In-process PNG cache (LRU) absorbs repeated hits. Default 500 entries; tune via <code>PNG_CACHE_SIZE</code>.</li>
        <li>For multi-replica horizontal scale, swap the rate-limit Map for Redis (current implementation is single-process).</li>
      </ul>
    </section>
  `;
}

function pageChangelog(): string {
  return `
    <header class="page-head">
      <h1>Changelog</h1>
      <p class="lede">Pre-release scaffold. Version surface settles at <strong>v0.1</strong>. Below: dated highlights from current development.</p>
    </header>

    <section>
      <h2 id="unreleased">Unreleased</h2>
      <ul>
        <li>Multi-page docs site at <code>/docs/*</code> with sticky sidebar nav.</li>
        <li>Full Open Graph + Twitter card + JSON-LD on landing.</li>
        <li>Favicon, apple-touch-icon, OG image endpoints.</li>
        <li>Parts catalog visual page — every variant rendered.</li>
        <li>Continuous tweaks documented (hueShift / bodyScale / eyeGapShift / mouthCurveScale / antennaTilt).</li>
      </ul>
    </section>

    <section>
      <h2 id="recent">Recent</h2>
      <ul>
        <li>Livelier animations — float now bobs + tilts + squashes; double blink; antenna sway; stronger spark pulse; rotating sparkle twinkle.</li>
        <li>Cast expanded: 22 palettes, 8 bodies, 10 eyes, 10 mouths, 12 toppers, 7 accessories.</li>
        <li><code>renderGroup</code> + <code>GroupOptions</code> exported from <code>@usenavii/core</code>.</li>
        <li>Continuous params (<code>hueShift</code>, <code>bodyScale</code>, etc.) wired into <code>selectAvatar</code> + <code>renderAvatar</code>.</li>
        <li>Split-domain deploy — landing on <code>navii.uxderrick.com</code>, API on <code>navii-api.uxderrick.com</code>.</li>
        <li>Default rate limit bumped to 600/min.</li>
        <li>Single-avatar <code>tileBg</code> option.</li>
      </ul>
    </section>

    <section>
      <h2 id="next">What's next</h2>
      <ul>
        <li>npm publish of <code>@usenavii/core</code> + <code>@usenavii/react</code> via tsup.</li>
        <li><code>Navii.seed({ id, email, name, createdAt })</code> ergonomic seed composer.</li>
        <li>Cloudflare Worker deploy (wasm raster).</li>
        <li>React Native binding.</li>
        <li>CLI: <code>npx navii alice</code>.</li>
        <li>Snapshot tests + perf bench.</li>
      </ul>
    </section>
  `;
}

// ────────────────────────────────────────────────────────────────────────────
// style block — kept inline to keep the route self-contained

function styleBlock(): string {
  return `<style>
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
  --warn: #fbbf24;
  --bad: #f87171;
  --radius: 12px;
  color-scheme: dark;
}
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); color: var(--ink); }
body {
  font: 15px/1.65 'Inter', 'Inter Display', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-feature-settings: 'cv11', 'ss01', 'ss03';
  font-optical-sizing: auto;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
a { color: var(--ink); text-decoration: none; }
a:hover { color: var(--accent); }
code, pre, .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; }
:not(pre) > code { background: var(--bg-2); border: 1px solid var(--line); padding: 1px 6px; border-radius: 4px; font-size: 12.5px; }

.layout { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

/* top nav */
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
  margin: 0 -24px 36px;
}
nav.top .brand { display: flex; align-items: center; gap: 10px; font-weight: 600; letter-spacing: -0.01em; }
nav.top .brand img { width: 26px; height: 26px; border-radius: 50%; background: var(--bg-2); }
nav.top .brand .sep { color: var(--line); margin: 0 2px; }
nav.top .brand .sub { color: var(--muted-2); font-weight: 500; }
nav.top .links { display: flex; gap: 20px; font-size: 14px; color: var(--muted-2); }
nav.top .links a:hover { color: var(--ink); }

/* docs layout */
.docs { display: grid; grid-template-columns: 220px 1fr; gap: 56px; align-items: start; min-height: 60vh; }
@media (max-width: 900px) {
  .docs { grid-template-columns: 1fr; gap: 24px; }
  .sidebar { position: static !important; max-height: none !important; padding-bottom: 0 !important; border-bottom: 1px solid var(--line); padding-bottom: 16px !important; }
}

/* sidebar */
.sidebar {
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  padding-right: 8px;
  padding-bottom: 24px;
}
.sb-section { margin-bottom: 24px; }
.sb-section h5 {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-2);
}
.sb-item {
  display: block;
  padding: 6px 10px;
  margin-left: -10px;
  color: var(--muted);
  border-radius: 6px;
  font-size: 14px;
  border-left: 2px solid transparent;
  transition: color 0.12s, background 0.12s;
}
.sb-item:hover { color: var(--ink); background: var(--bg-2); }
.sb-item.active { color: var(--accent); border-left-color: var(--accent); background: rgba(192, 132, 252, 0.07); }

/* content */
.content { max-width: 760px; min-width: 0; }
.content .page-head { margin-bottom: 48px; }
.content .page-head h1 {
  font-size: clamp(32px, 4vw, 44px);
  letter-spacing: -0.02em;
  margin: 0 0 12px;
  font-weight: 600;
}
.content .page-head .lede { font-size: 17px; color: var(--muted); margin: 0; max-width: 60ch; }
.content section { margin-bottom: 48px; }
.content section h2 {
  font-size: 22px;
  letter-spacing: -0.01em;
  margin: 0 0 14px;
  padding-top: 8px;
  font-weight: 600;
}
.content section h2 .count {
  display: inline-block;
  font-size: 12px;
  color: var(--muted-2);
  background: var(--bg-2);
  border: 1px solid var(--line);
  padding: 2px 8px;
  border-radius: 999px;
  margin-left: 8px;
  font-weight: 400;
  vertical-align: middle;
}
.content section h4 {
  margin: 24px 0 10px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-2);
}
.content p { margin: 0 0 14px; color: var(--ink); }
.content p.note {
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-left: 3px solid var(--accent);
  padding: 12px 14px;
  border-radius: 6px;
  color: var(--muted);
  font-size: 14px;
}
.content ul { margin: 0 0 14px; padding-left: 22px; color: var(--ink); }
.content ul li { margin-bottom: 6px; }

/* code blocks */
.code-block { position: relative; margin: 0 0 16px; }
.code-block pre.code { margin: 0; }
pre.code {
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 14px 44px 14px 16px;
  overflow-x: auto;
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
pre.code code { background: transparent; border: 0; padding: 0; font-size: inherit; font-family: inherit; color: var(--ink); }

.copy-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--bg-3);
  border: 1px solid var(--line);
  color: var(--muted);
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  transition: opacity .15s, color .15s, border-color .15s, background .15s;
  font: 10.5px ui-monospace, SFMono-Regular, Menlo, monospace;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  z-index: 2;
}
.code-block:hover .copy-icon,
.code-block:focus-within .copy-icon { opacity: 1; }
.copy-icon:hover { color: var(--ink); border-color: var(--muted-2); background: var(--bg-2); }
.copy-icon.ok { color: var(--good); border-color: var(--good); opacity: 1; }
.copy-icon svg { width: 12px; height: 12px; flex-shrink: 0; }

/* syntax tokens */
pre.code .tk-tag     { color: #f472b6; }
pre.code .tk-attr    { color: #93c5fd; }
pre.code .tk-str     { color: #fbbf24; }
pre.code .tk-keyword { color: var(--accent); }
pre.code .tk-num     { color: var(--good); }
pre.code .tk-comment { color: var(--muted-2); font-style: italic; }
pre.code .tk-verb    { color: var(--accent); font-weight: 600; }
pre.code .tk-host    { color: var(--muted-2); }
pre.code .tk-path    { color: var(--ink); }
pre.code .tk-punct   { color: var(--muted-2); }
pre.code .tk-key     { color: #93c5fd; }
pre.code .tk-val     { color: #fbbf24; }
pre.code .tk-type    { color: #93c5fd; }

/* tables */
.content table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 16px;
  font-size: 14px;
}
.content table th, .content table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}
.content table th {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted-2);
  border-bottom: 1px solid var(--line);
  background: var(--bg-2);
}
.content table td code { font-size: 12.5px; }

/* rules table on concepts page */
.content table.rules td:first-child { width: 40%; }
.content table.rules .ok { color: var(--good); font-weight: 600; }
.content table.rules .warn { color: var(--warn); font-weight: 600; }
.content table.rules .bad { color: var(--bad); font-weight: 600; }

/* parts grid */
.pgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}
.ptile {
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 14px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: border-color 0.18s ease, transform 0.18s ease;
}
.ptile:hover { border-color: var(--accent); transform: translateY(-2px); }
.ptile-art { width: 100px; height: 100px; display: grid; place-items: center; }
.ptile-art svg { width: 100%; height: 100%; }
.ptile-label {
  font: 11.5px ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--muted);
  text-align: center;
  word-break: break-word;
}

/* pager */
nav.pager {
  margin-top: 64px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.pager-link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: 10px;
  transition: border-color 0.15s, color 0.15s;
  min-width: 180px;
}
.pager-link:hover { border-color: var(--accent); }
.pager-link .lbl { font-size: 11px; color: var(--muted-2); text-transform: uppercase; letter-spacing: 0.06em; }
.pager-link .ttl { color: var(--ink); font-weight: 500; }
.pager-link.next { align-items: flex-end; text-align: right; }

/* footer */
footer.bottom {
  margin-top: 80px;
  padding: 24px 0 48px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--muted-2);
  font-size: 13px;
}
footer.bottom a { color: var(--muted-2); }
footer.bottom a:hover { color: var(--ink); }
</style>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
