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

const API_BASE = process.env['NAVII_API_BASE'] ?? 'https://api.navii.dev';
const SITE_BASE = process.env['NAVII_SITE_BASE'] ?? 'https://navii.dev';

interface DocPage {
  slug: string;
  title: string;
  summary: string;
  section: string;
  body: () => string;
}

const PAGES: DocPage[] = [
  { slug: 'overview',    section: 'Start',     title: 'Overview',            summary: 'What Navii is, what it solves, when to reach for it.', body: pageOverview },
  { slug: 'quickstart',  section: 'Start',     title: 'Quickstart',          summary: 'Install and render your first avatar in 60 seconds.', body: pageQuickstart },
  { slug: 'concepts',    section: 'Start',     title: 'Concepts',            summary: 'Determinism, seeds, and the rules that make Navii work.', body: pageConcepts },
  { slug: 'recipes',     section: 'Start',     title: 'Recipes',             summary: 'Battle-tested patterns: SSR, fallbacks, galleries, React Native.', body: pageRecipes },
  { slug: 'parts',       section: 'Reference', title: 'Parts catalog',       summary: 'Every variant value, rendered.', body: pageParts },
  { slug: 'http-api',    section: 'Reference', title: 'HTTP API',            summary: 'Full endpoint reference for the hosted service.', body: pageHttpApi },
  { slug: 'rate-limits', section: 'Reference', title: 'Rate limits',         summary: 'Per-route quotas, why immutable caching makes Navii cheap to host.', body: pageRateLimits },
  { slug: 'sdk-core',    section: 'SDK',       title: '@usenavii/core',         summary: 'Engine functions, types, and advanced composition.', body: pageSdkCore },
  { slug: 'sdk-react',   section: 'SDK',       title: '@usenavii/react',        summary: 'React component with memoized rendering.', body: pageSdkReact },
  { slug: 'deployment',  section: 'Operate',   title: 'Self-hosting',        summary: 'Docker, env vars, reverse proxy notes.', body: pageDeployment },
  { slug: 'changelog',   section: 'Operate',   title: 'Changelog',           summary: 'Version history and breaking changes.', body: pageChangelog },
];

export function isDocSlug(slug: string): boolean {
  return PAGES.some((p) => p.slug === slug);
}

export function defaultDocSlug(): string {
  return 'quickstart';
}

export function docsHtml(slug: string): string {
  const page = PAGES.find((p) => p.slug === slug);
  if (!page) return shell('not found', notFound(), slug, 'Documentation page not found.');
  return shell(page.title, page.body(), slug, page.summary);
}

/** All doc slugs — used by /sitemap.xml to advertise pages to crawlers. */
export function docSlugs(): readonly string[] {
  return PAGES.map((p) => p.slug);
}

// ────────────────────────────────────────────────────────────────────────────
// shell

function shell(title: string, content: string, currentSlug: string, summary: string): string {
  const pageTitle = `${escapeHtml(title)} — Navii docs`;
  const desc = escapeHtml(summary);
  const url = `${SITE_BASE}/docs/${currentSlug}`;
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

<!-- Open Graph -->
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Navii docs" />
<meta property="og:title" content="${pageTitle}" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${pageTitle}" />
<meta name="twitter:description" content="${desc}" />
<meta name="twitter:image" content="${ogImage}" />

${styleBlock()}

<!-- analytics (umami, self-hosted) -->
<script defer src="https://analytics.uxderrick.com/script.js" data-website-id="9adc73e7-ce4c-454c-bd2c-663eca5c9abe"></script>
</head>
<body>
<a class="skip-link" href="#main-content">Skip to content</a>
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
      <a href="/blog">blog</a>
      <a href="https://github.com/uxderrick/navii">github</a>
    </div>
  </nav>

  <div class="docs">
    <aside class="sidebar">
      ${renderSidebar(currentSlug)}
    </aside>

    <main class="content" id="main-content" tabindex="-1">
      ${content}

      <nav class="pager">
        ${renderPager(currentSlug)}
      </nav>
    </main>
  </div>

  <footer class="bottom">
    <div>navii · deterministic avatars · open source · MIT</div>
    <div><a href="/privacy">privacy</a> · <a href="/support">support</a> · <a href="https://github.com/uxderrick/navii">github</a> · <a href="/api">/api</a></div>
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
            `<a class="sb-item${p.slug === currentSlug ? ' active' : ''}" href="/docs/${p.slug}"${p.slug === currentSlug ? ' aria-current="page"' : ''}>${escapeHtml(p.title)}</a>`,
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

function pageOverview(): string {
  return `
    <header class="page-head">
      <h1>Overview</h1>
      <p class="lede">Navii is a deterministic mascot avatar service. Pass any string — a user id, an email, a UUID — and get back a designed SVG of a unique character. Same seed always returns the same face.</p>
    </header>

    <section>
      <h2 id="what-it-solves">What it solves</h2>
      <p>Every app has the same gap: between signup and the moment a user uploads a profile photo, you've got a gray circle with their initial. That's not a brand moment. It's not a profile. It's not anything.</p>
      <p>Navii fills that gap. One function call (or one <code>&lt;img src&gt;</code>) gives every user a face the moment they exist.</p>
      <ul>
        <li><strong>Deterministic</strong> — same seed → same SVG, byte-identical within a release. Safe to cache, safe to mirror.</li>
        <li><strong>Stateless</strong> — no accounts, no database, no avatar table. The seed is the avatar.</li>
        <li><strong>Designed</strong> — 22 palettes × 8 bodies × 10 eyes × 10 mouths × 12 toppers × continuous tweaks. 22M+ combinations.</li>
        <li><strong>Optional motion</strong> — opt-in idle animation. Honors <code>prefers-reduced-motion</code>.</li>
      </ul>
    </section>

    <section>
      <h2 id="when-to-use">When to reach for it</h2>
      <ul>
        <li>Signup placeholder before users upload a photo</li>
        <li>Comment threads, activity feeds, team rosters</li>
        <li>Empty states for any "person" in your UI</li>
        <li>Brand mascots / logo marks (use <a href="/docs/sdk-core">Navii.build</a> for direct construction)</li>
        <li>"Spin again" / random pickers (<a href="/docs/recipes#random-onboarding"><code>/random</code></a> or <a href="/docs/sdk-core#random"><code>Navii.random()</code></a>)</li>
        <li>Email + OG images (PNG endpoint)</li>
      </ul>
      <p>Not for: app icons, illustrations, anything where a specific designer-drawn character is required.</p>
    </section>

    <section>
      <h2 id="three-shapes">Three ways to consume it</h2>
      <table class="ref-table">
        <thead><tr><th>Shape</th><th>For</th><th>Cost</th></tr></thead>
        <tbody>
          <tr><td><code>&lt;img src&gt;</code> URL</td><td>any framework, even plain HTML</td><td>1 HTTP round-trip per device per seed (then immutable-cached forever)</td></tr>
          <tr><td><code>@usenavii/core</code></td><td>node + browser bundles, no network</td><td>~9 KB gz dependency</td></tr>
          <tr><td><code>@usenavii/react</code></td><td>React apps; <code>&lt;Navii seed=… /&gt;</code></td><td>~10 KB gz, memoized</td></tr>
        </tbody>
      </table>
      <p>Pick whatever's smallest for you. All three render the same byte-identical SVG for a given seed.</p>
    </section>

    <section>
      <h2 id="next">Next</h2>
      <ul>
        <li><a href="/docs/quickstart">Quickstart</a> — first avatar in 60 seconds.</li>
        <li><a href="/docs/concepts">Concepts</a> — the seed rule + determinism contract you need to understand.</li>
        <li><a href="/docs/recipes">Recipes</a> — copy-paste patterns for SSR, fallbacks, galleries, RN.</li>
      </ul>
    </section>
  `;
}

function pageRecipes(): string {
  return `
    <header class="page-head">
      <h1>Recipes</h1>
      <p class="lede">Battle-tested patterns. Copy-paste, adjust seeds, ship.</p>
    </header>

    <section>
      <h2 id="seed-from-user">Compose a stable seed from a user object</h2>
      <p>The single biggest mistake is passing a display name as the seed. Names collide. Use the helper:</p>
      <pre class="code"><code>import { Navii } from '@usenavii/core';

const s = Navii.seed({
  id: user.id,            // wins if present
  email: user.email,      // fallback
  name: user.name,        // last resort
  createdAt: user.createdAt, // composed with name if id+email missing
});

createAvatar(s);</code></pre>
      <p>Why it matters: <a href="/docs/concepts#seeds">the seed rule</a> says same seed = same avatar. If two users share a seed they share an avatar. <code>Navii.seed</code> picks the most-unique field automatically.</p>
    </section>

    <section>
      <h2 id="email-seeds">Using emails as seeds</h2>
      <p>Raw emails in URLs are PII on the wire — they end up in server access logs, <code>Referer</code> headers sent to third parties, browser history, CDN cache keys, and analytics pixels. Hash the email first with <code>sha256</code> of the trimmed + lowercased address:</p>
      <pre class="code"><code>import { seedFromEmail, createAvatar } from '@usenavii/core';

const s = seedFromEmail(user.email);  // "973dfe46…b4e813b" — sha256 hex
createAvatar(s);
// or hit the API: \`${API_BASE}/avatar/\${s}.svg\`</code></pre>
      <p>Two services that hash with <code>seedFromEmail()</code> produce the same seed for the same person, so avatars stay consistent across products.</p>
      <p><code>Navii.seed({ email })</code> hashes by default since v0.7. Pass <code>{ hashEmail: false }</code> only when you need existing raw-email seeds to stay stable during a migration.</p>
      <p>The hosted API echoes <code>X-Navii-Warning: plaintext-email-seed</code> when it sees an email-shaped seed. Treat it as a nudge to hash on the client.</p>
    </section>

    <section>
      <h2 id="random-onboarding">Random avatar on every refresh / onboarding</h2>
      <p>For "spin again" UX, demo seeding, or auto-assigning an avatar before the user picks one — use <code>/random</code>. Same URL, different avatar every request. No redirect, no URL rewrite.</p>
      <pre class="code"><code>&lt;img src="${API_BASE}/random?size=128" alt="" /&gt;</code></pre>
      <p>Refresh the page → browser refetches <code>/random</code> → new avatar. The response is <code>Cache-Control: no-store</code> so nothing caches it.</p>
      <p><strong>Onboarding flow — assign &amp; persist:</strong> grab the seed from the <code>X-Navii-Seed</code> header so the avatar is stable on next visit:</p>
      <pre class="code"><code>const res = await fetch('${API_BASE}/random');
const seed = res.headers.get('x-navii-seed');
const svg = await res.text();

await db.users.update(user.id, { naviiSeed: seed });
// next time: render with /avatar/&lt;seed&gt; (immutable cache)</code></pre>
      <p>Offline / non-HTTP? Use the SDK helper — <a href="/docs/sdk-core#random"><code>Navii.random()</code></a> returns the same <code>{ svg, seed }</code> shape.</p>
    </section>

    <section>
      <h2 id="photo-fallback">Photo fallback (Navii when no photoUrl)</h2>
      <p>Easiest pattern: <code>??</code> to fall back to a Navii URL when the user hasn't uploaded:</p>
      <pre class="code"><code>function Avatar({ user }) {
  const navii = \`${API_BASE}/avatar/\${encodeURIComponent(user.id)}?size=64&amp;tileBg=auto\`;
  return (
    &lt;img
      src={user.photoUrl ?? navii}
      alt={user.name}
      width={64}
      height={64}
    /&gt;
  );
}</code></pre>
      <p>If you want the upload to load first and Navii as <code>onError</code> recovery:</p>
      <pre class="code"><code>&lt;img
  src={user.photoUrl}
  onError={(e) =&gt; { e.currentTarget.src = naviiUrl; }}
  alt={user.name}
/&gt;</code></pre>
    </section>

    <section>
      <h2 id="ssr">Server-side rendering (Next.js, Remix, Astro)</h2>
      <p>The simplest SSR path is the hosted endpoint — zero engine in your bundle, works in every renderer:</p>
      <pre class="code"><code>// server or client component — no difference
&lt;img src={\`${API_BASE}/avatar/\${user.id}?size=64\`} /&gt;</code></pre>
      <p>If you want zero extra HTTP requests (inlining the SVG in your HTML stream), use <code>@usenavii/core</code> on the server and pipe the SVG string into your template. Since the engine is deterministic and pure, server output matches client output — no hydration mismatch.</p>
    </section>

    <section>
      <h2 id="gallery">Loading lots of avatars at once (team list, feed)</h2>
      <p>Don't fire 100 <code>/avatar/*</code> requests. Use <code>/group</code> — one SVG, one request, no rate limit:</p>
      <pre class="code"><code>const ids = team.map(u =&gt; u.id).join(',');
&lt;img src={\`${API_BASE}/group?seeds=\${ids}&amp;size=48&amp;overlap=0.3\`} alt="team" /&gt;</code></pre>
      <p>For a multi-row grid use <a href="/docs/http-api#utility"><code>/cast.svg</code></a>:</p>
      <pre class="code"><code>&lt;img src={\`${API_BASE}/cast.svg?seeds=\${ids}&amp;cols=6&amp;size=80\`} /&gt;</code></pre>
    </section>

    <section>
      <h2 id="react-native">React Native</h2>
      <p>No dedicated package needed. Use core + <code>react-native-svg</code>:</p>
      <pre class="code"><code>import { createAvatar } from '@usenavii/core';
import { SvgXml } from 'react-native-svg';

export function Navii({ seed, size = 64 }) {
  const svg = createAvatar(seed, { size });
  return &lt;SvgXml xml={svg} width={size} height={size} /&gt;;
}</code></pre>
      <p>Determinism still holds — same SVG in RN as in the browser, byte-identical to the hosted API.</p>
    </section>

    <section>
      <h2 id="brand-mascot">Fixed brand mascot (no seed)</h2>
      <p>When you want a specific look — logo, empty-state, 404 page — skip the seed and build directly:</p>
      <pre class="code"><code>import { Navii } from '@usenavii/core';

const heroSvg = Navii.build({
  body: 'tall',
  eyes: 'star',
  mouth: 'grin',
  palette: 'violet',
  topper: 'crown',
}, { size: 256, animated: true });</code></pre>
      <p>Or via URL: <code>/build/render?body=tall&amp;eyes=star&amp;palette=violet&amp;topper=crown</code>. Use the <a href="${SITE_BASE}/builder">builder UI</a> to design visually + copy the params.</p>
    </section>

    <section>
      <h2 id="caching">Caching your own copies</h2>
      <p>Responses ship <code>Cache-Control: public, max-age=31536000, immutable</code>. Any layer between you and the API (CDN, browser, service worker) respects that. No extra config needed.</p>
      <p>If you do want offline copies:</p>
      <pre class="code"><code>const svg = await fetch(\`${API_BASE}/avatar/\${userId}\`).then(r =&gt; r.text());
await fs.writeFile(\`avatars/\${userId}.svg\`, svg);</code></pre>
      <p>Bytes are deterministic — re-fetching the same seed produces the same content.</p>
    </section>

    <section>
      <h2 id="anti-patterns">Anti-patterns</h2>
      <ul>
        <li><strong>Passing <code>Date.now()</code> as the seed.</strong> Avatar changes every render. Determinism is the contract.</li>
        <li><strong>Passing a display name.</strong> Two "Alice"s look identical. Use a stable id.</li>
        <li><strong>Fetching <code>/avatar/*</code> in a loop without caching.</strong> Hit <code>/group</code> or <code>/cast.svg</code> instead.</li>
        <li><strong>Stripping <code>Cache-Control</code> in your proxy.</strong> You'd hammer the origin for no reason.</li>
        <li><strong>Rasterizing client-side.</strong> Use <code>.png</code> URLs if you need PNG; resvg on the server is faster than canvas in the browser.</li>
      </ul>
    </section>
  `;
}

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
      <p>Don't have a seed yet? <a href="/docs/recipes#random-onboarding"><code>/random</code></a> returns a fresh avatar each request — same URL, different avatar every refresh:</p>
      <pre class="code"><code>&lt;img src="${API_BASE}/random?size=96" /&gt;</code></pre>
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
      <p>Memoized <code>&lt;img src="data:image/svg+xml;..."&gt;</code>. The data URI is computed during both server and client render via <code>useMemo</code>, so SSR (Next.js, Remix) emits the same markup the client hydrates — no mismatch. The browser treats the data URI as an opaque image (no inline scripting surface).</p>
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
      <p class="lede">Navii makes one promise: same seed in → same avatar out, byte-identical within a release. Everything else flows from that.</p>
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
  // target part is mutated. Each tile is rendered as a separate <img>
  // pointing at /build/render so the browser caches each variant
  // independently (immutable) and lazy-loads below-the-fold rows.
  const baseSeed = 'navii-doc-base';
  const baseSelected = selectAvatar(baseSeed);

  interface PartChoice {
    palette: string;
    body: BodyShapeId;
    eyes: EyeStyleId;
    mouth: MouthStyleId;
    antenna: AntennaStyleId;
    accessory: AccessoryId;
    background: BackgroundId;
    topper: TopperId;
  }
  const base: PartChoice = {
    palette: baseSelected.palette.id,
    body: baseSelected.body,
    eyes: baseSelected.eyes,
    mouth: baseSelected.mouth,
    antenna: 'classic',
    accessory: 'none',
    background: 'ring',
    topper: 'none',
  };

  function tileUrl(override: Partial<PartChoice>): string {
    const spec = { ...base, ...override };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(spec)) p.set(k, String(v));
    p.set('size', '240');
    return `${API_BASE}/build/render?${p.toString()}`;
  }

  function tile(label: string, url: string): string {
    return `<div class="ptile"><div class="ptile-art"><img src="${url}" alt="${escapeHtml(label)}" loading="lazy" decoding="async" width="120" height="120" /></div><div class="ptile-label">${escapeHtml(label)}</div></div>`;
  }

  function grid(items: string[]): string {
    return `<div class="pgrid">${items.join('')}</div>`;
  }

  const palettes = grid(
    (PALETTES as readonly Palette[]).map((p) => tile(p.id, tileUrl({ palette: p.id }))),
  );
  const bodies = grid(
    (BODY_IDS as readonly BodyShapeId[]).map((b) => tile(b, tileUrl({ body: b }))),
  );
  const eyes = grid(
    (EYE_IDS as readonly EyeStyleId[]).map((e) => tile(e, tileUrl({ eyes: e }))),
  );
  const mouths = grid(
    (MOUTH_IDS as readonly MouthStyleId[]).map((m) => tile(m, tileUrl({ mouth: m }))),
  );
  const antennae = grid(
    (ANTENNA_IDS as readonly AntennaStyleId[]).map((a) => tile(a, tileUrl({ antenna: a }))),
  );
  const accessories = grid(
    (ACCESSORY_IDS as readonly AccessoryId[]).map((a) => tile(a, tileUrl({ accessory: a }))),
  );
  const backgrounds = grid(
    (BACKGROUND_IDS as readonly BackgroundId[]).map((b) => tile(b, tileUrl({ background: b }))),
  );
  const uniqueToppers = Array.from(new Set(TOPPER_IDS as readonly TopperId[]));
  const toppers = grid(
    // antenna suppressed so the topper actually shows
    uniqueToppers.map((t) => tile(t, tileUrl({ antenna: 'none', topper: t }))),
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

      <h4 id="avatar-path">Path</h4>
      <table>
        <thead><tr><th>Param</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>:seed</code></td><td>string</td><td>Any unique identifier. Use a stable user id, UUID, or email. Avoid display names — see <a href="/docs/concepts#seeds">the seed rule</a>.</td></tr>
        </tbody>
      </table>

      <h4 id="avatar-query">Query</h4>
      <table>
        <thead><tr><th>Param</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>size</code></td><td>int</td><td>96</td><td>Output size in px. Clamped to 16–1024.</td></tr>
          <tr><td><code>palette</code></td><td>enum</td><td>seeded</td><td>Force a color family. See <a href="/docs/parts#palette">palette catalog</a>.</td></tr>
          <tr><td><code>background</code></td><td>enum</td><td>seeded</td><td><code>none</code> · <code>solid</code> · <code>ring</code>.</td></tr>
          <tr><td><code>tileBg</code></td><td>color</td><td>none</td><td>Opaque circular fill behind avatar. Any CSS color (URL-encoded, e.g. <code>%23ffffff</code>) or <code>auto</code> to use the palette accent.</td></tr>
          <tr><td><code>mood</code></td><td>enum</td><td>seeded</td><td><code>neutral</code> · <code>happy</code> · <code>serious</code> · <code>sleepy</code> · <code>wink</code>. Overrides seed-derived eyes + mouth with a curated pair. Same seed + mood = byte-identical render.</td></tr>
          <tr><td><code>packs</code></td><td>csv</td><td>none</td><td>Comma-separated pack ids — e.g. <code>halloween</code>, <code>office,mono</code>. Themed bodies, palettes, accessories. Unknown ids are silently skipped. Order doesn't affect cached output.</td></tr>
          <tr><td><code>style</code></td><td>enum</td><td>seeded</td><td><code>masc</code> · <code>femme</code> · <code>neutral</code>. Style-hint bias on seeded picks. Only meaningful alongside <code>packs</code>; harmless otherwise.</td></tr>
          <tr><td><code>title</code></td><td>string</td><td>none</td><td>Accessible label. Adds <code>role="img"</code> + <code>aria-label</code> to the SVG root.</td></tr>
          <tr><td><code>animated</code></td><td>0 / 1</td><td>0</td><td>Idle motion (float, blink, antenna sway, spark pulse, twinkle). SVG only — ignored for PNG. Honors <code>prefers-reduced-motion</code>.</td></tr>
        </tbody>
      </table>

      <h4 id="avatar-examples">Examples</h4>
      <pre class="code"><code>${API_BASE}/avatar/alice
${API_BASE}/avatar/alice?palette=violet&amp;animated=1
${API_BASE}/avatar/alice?tileBg=%23ffffff
${API_BASE}/avatar/alice?mood=happy
${API_BASE}/avatar/alice?packs=halloween
${API_BASE}/avatar/alice?packs=office,mono&amp;style=neutral
${API_BASE}/avatar/alice.png?size=512&amp;tileBg=auto</code></pre>
    </section>

    <section>
      <h2 id="random">GET /random[.png]</h2>
      <p>Returns a fresh avatar inline — same URL, different avatar every refresh. Internally picks a new UUID seed per request and renders directly. <strong>No redirect.</strong> Point an <code>&lt;img src="/random"&gt;</code> at it and every page refresh swaps the avatar.</p>

      <h4 id="random-query">Query</h4>
      <p>All <code>/avatar/:seed</code> params apply (<code>size</code>, <code>palette</code>, <code>background</code>, <code>tileBg</code>, <code>mood</code>, <code>packs</code>, <code>style</code>, <code>title</code>, <code>animated</code>) — same semantics, same clamps, same enums.</p>

      <h4 id="random-headers">Response headers</h4>
      <ul>
        <li><code>x-navii-seed</code> — the seed that was chosen. Read it from a <code>fetch()</code> response if you want to persist the avatar (e.g. save to user profile so it's stable on next visit).</li>
        <li><code>cache-control: no-store</code> — never cached by the browser or CDN. Refresh = new avatar.</li>
        <li><code>access-control-allow-origin: *</code> + <code>access-control-expose-headers: x-navii-seed</code> — embed anywhere; cross-origin JS can read the seed header.</li>
      </ul>

      <h4 id="random-examples">Examples</h4>
      <pre class="code"><code>${API_BASE}/random
${API_BASE}/random?palette=mint&amp;size=128
${API_BASE}/random.png?size=256</code></pre>

      <p class="note"><strong>Persisting the chosen seed</strong> — useful for onboarding flows where the user gets an avatar without picking one, then keeps it forever:</p>
      <pre class="code"><code>const res = await fetch('${API_BASE}/random');
const seed = res.headers.get('x-navii-seed');
const svg = await res.text();
await db.users.update(user.id, { naviiSeed: seed });</code></pre>
    </section>

    <section>
      <h2 id="group">GET /group</h2>
      <p>Renders multiple seeded avatars as a single horizontally-stacked SVG with optional overlap and a <code>+N</code> counter tile for overflow.</p>

      <h4 id="group-query">Query</h4>
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
      <p>The avatar route emits a warning when the seed shape suggests PII:</p>
      <ul>
        <li><code>x-navii-warning: plaintext-email-seed; hash with seedFromEmail()</code> — set when the seed matches an email pattern. Avatar still renders; hash the email client-side with <a href="/docs/sdk-core#seed"><code>seedFromEmail()</code></a> to drop the warning.</li>
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
      <p><code>/avatar/*</code> is limited to <strong>600 req/min/IP</strong>. Other routes are unlimited. Exceeded → HTTP <code>429</code> + <code>Retry-After</code>.</p>
      <p>Full table, cache rationale, and self-hosting tuning live on the dedicated <a href="/docs/rate-limits">Rate limits</a> page.</p>
    </section>

    <section>
      <h2 id="encoding">Seeds and URL encoding</h2>
      <p>Anything you can put in a URL path can be a seed. Seeds with <code>@</code>, <code>.</code>, or other URL-special chars work — just URL-encode them on the client (most browsers do this automatically inside <code>&lt;img src&gt;</code>).</p>
      <pre class="code"><code>raw:     alice@example.com
encoded: alice%40example.com</code></pre>
      <p>The server decodes back to the raw seed before hashing, so both URLs produce the same SVG. Empty seeds → 400.</p>
    </section>

    <section>
      <h2 id="versioning">Versioning and stability</h2>
      <p>The deterministic contract is scoped to <strong>a single release of the engine</strong>. A given seed + a given engine version → byte-identical SVG, forever. We won't silently change that.</p>
      <p>What we promise to keep stable in patch + minor releases:</p>
      <ul>
        <li>Existing seeds' part selections don't shift when new variants are added (new parts append to the PRNG stream, never insert).</li>
        <li>Endpoint URLs, query params, and response headers stay backwards-compatible.</li>
        <li>SVG markup may change in tiny non-visible ways (formatting, attribute order) — treat as text-content stable, not byte-stable across upgrades.</li>
      </ul>
      <p>What can change in a major release:</p>
      <ul>
        <li>Cast rebases (existing seeds get new combinations). Documented in the changelog.</li>
        <li>Default option values.</li>
      </ul>
      <p>If you need absolute byte-stability across engine upgrades, mirror the SVG bytes locally — see the <a href="/docs/recipes#caching">caching recipe</a>.</p>
    </section>

    <section>
      <h2 id="auth">Authentication</h2>
      <p>None. Every endpoint is anonymous. CORS is wide open (<code>access-control-allow-origin: *</code>) — embed from anywhere, no token, no signup. If you need to lock down a self-hosted deployment, put it behind your own auth layer (Cloudflare Access, BasicAuth via Caddy, etc.).</p>
    </section>
  `;
}

function pageRateLimits(): string {
  return `
    <header class="page-head">
      <h1>Rate limits</h1>
      <p class="lede">Per-IP quotas on the hosted API, why they're set the way they are, and how to tune them when self-hosting.</p>
    </header>

    <section>
      <h2 id="hosted">Hosted (<code>api.navii.dev</code>)</h2>
      <table class="ref-table">
        <thead><tr><th>Route</th><th>Limit (per IP)</th><th>Window</th></tr></thead>
        <tbody>
          <tr><td><code>/avatar/:seed</code> (SVG)</td><td><strong>600 req/min</strong></td><td>60s sliding</td></tr>
          <tr><td><code>/avatar/:seed.png</code></td><td><strong>600 req/min</strong> (shared bucket)</td><td>60s sliding</td></tr>
          <tr><td><code>/group</code></td><td>unlimited</td><td>—</td></tr>
          <tr><td><code>/cast.svg</code></td><td>unlimited</td><td>—</td></tr>
          <tr><td><code>/build/render</code> (SVG + PNG)</td><td>unlimited</td><td>—</td></tr>
          <tr><td><code>/builder</code>, <code>/docs</code>, <code>/</code>, <code>/api</code></td><td>unlimited</td><td>—</td></tr>
          <tr><td><code>/healthz</code>, <code>/gallery</code>, icons, <code>/og.png</code></td><td>unlimited</td><td>—</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2 id="why-this-is-enough">Why this is more than enough</h2>
      <p>Avatar responses ship the strongest cache header a CDN respects:</p>
      <pre class="code"><code>Cache-Control: public, max-age=31536000, immutable</code></pre>
      <p>That means every browser, every proxy, every CDN caches the exact <code>(seed, params)</code> bytes <strong>for a year</strong>. Same user, same device → one request, then zero forever. A given seed's response is byte-identical (it's deterministic), so the cache is always valid.</p>
      <p>Realistic monthly traffic for 1 000 active users:</p>
      <pre class="code"><code>1 000 users × ~3 devices avg × ~5 cache-miss loads/mo ≈ 15 000 req/mo</code></pre>
      <p>That's ~21 requests/hour. The 600/min/IP ceiling exists only to swat abusers — normal apps won't notice it.</p>
    </section>

    <section>
      <h2 id="when-you-hit-it">When you hit it</h2>
      <pre class="code"><code>HTTP/1.1 429 Too Many Requests
Retry-After: 23
Content-Type: text/plain

Rate limit exceeded</code></pre>
      <p><code>Retry-After</code> is seconds until your IP's window resets. Back off, retry. No exponential backoff math needed — the server already tells you when to come back.</p>
      <p>Common triggers:</p>
      <ul>
        <li>Loading an avatar gallery with hundreds of unique seeds in one go (use <code>/group</code> or <code>/cast.svg</code> instead — both unlimited)</li>
        <li>Server-side rendering that fetches per request instead of caching</li>
        <li>Crawlers / scrapers</li>
      </ul>
    </section>

    <section>
      <h2 id="how-to-stay-under">How to stay under it</h2>
      <ul>
        <li><strong>Respect the cache headers.</strong> Don't strip them in your reverse proxy.</li>
        <li><strong>Bundle calls.</strong> If you need 5 teammates, hit <code>/group?seeds=a,b,c,d,e</code> (one request, unlimited route) instead of five <code>/avatar/*</code> calls.</li>
        <li><strong>Self-host</strong> the API container if you ever expect <em>uncached</em> bursts above 600/min from a single IP — the docker image is the same one we run.</li>
      </ul>
    </section>

    <section>
      <h2 id="self-host">Self-hosting? Tune it</h2>
      <p>The limit is just an env var on the API container:</p>
      <pre class="code"><code># /opt/navii/.env or docker-compose env block
RATE_LIMIT_PER_MIN=600        # bump as needed
TRUST_PROXY=1                 # enable X-Forwarded-For reading (Caddy/Nginx)</code></pre>
      <p>Set to <code>0</code> to disable rate-limiting entirely. See <a href="/docs/deployment">Deployment</a> for the full env reference.</p>
      <p><strong>Don't enable <code>TRUST_PROXY</code> behind a raw CDN</strong> — clients can spoof <code>X-Forwarded-For</code>. Use it only behind a proxy you control.</p>
    </section>

    <section>
      <h2 id="storage">Implementation notes</h2>
      <ul>
        <li>Sliding window, in-memory <code>Map&lt;ip, { count, resetAt }&gt;</code>, pruned every 60s.</li>
        <li>Stateless across container restarts — a deploy resets the limiter.</li>
        <li>Per-process. If you scale to N replicas, each replica has its own bucket — effective limit becomes <code>N × RATE_LIMIT_PER_MIN</code>. Swap for Redis when this matters.</li>
        <li>IP attribution comes from <code>X-Forwarded-For</code> first when <code>TRUST_PROXY=1</code>, else falls back to "unknown" (single bucket for all — fail-open behind a misconfigured proxy, fail-safe otherwise).</li>
      </ul>
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
random(options?: AvatarOptions): { svg: string; seed: string }
selectAvatar(seed: string, options?: AvatarOptions): AvatarSpec
renderAvatar(spec:  AvatarSpec, options?: AvatarOptions): string
renderAvatarInner(spec: AvatarSpec, options?: AvatarOptions): string
renderGroup(seeds:  string[], options?: GroupOptions): string</code></pre>
      <p><code>createAvatar</code> is the convenience composition of <code>selectAvatar</code> + <code>renderAvatar</code>. Use the split pair when you want to inspect or mutate the spec between picking and rendering.</p>
      <p><code>renderAvatarInner</code> emits the SVG body without an outer <code>&lt;svg&gt;</code> wrapper — useful when composing multiple avatars into one SVG document (this is how <code>renderGroup</code> works internally).</p>
    </section>

    <section>
      <h2 id="random">Random avatars</h2>
      <p><code>Navii.random()</code> picks a fresh seed for you and renders the avatar. Returns both the SVG and the chosen seed so you can <strong>persist it</strong> — saving the seed to the user's profile makes future renders stable.</p>

      <pre class="code"><code>import { Navii } from '@usenavii/core';

const { svg, seed } = Navii.random({ size: 96 });
// persist the seed so the user's avatar is stable on next visit
await db.users.update(user.id, { naviiSeed: seed });</code></pre>

      <p>Use for "spin again" UX, lazy onboarding (assign an avatar before the user picks one), dev/demo seeding. Seed source: <code>crypto.randomUUID()</code> with a <code>Math.random()</code> fallback.</p>

      <p class="note"><strong>React:</strong> stabilize the seed across re-renders with <code>useState</code>:</p>
      <pre class="code"><code>const [{ seed }] = useState(() => Navii.random());
return &lt;Navii seed={seed} /&gt;;</code></pre>

      <p>Calling <code>Navii.random()</code> directly inside a render function (without <code>useState</code>/<code>useMemo</code>) gives you a new avatar on every re-render.</p>
    </section>

    <section>
      <h2 id="seed">Seed helpers</h2>
      <pre class="code"><code>seed(fields: SeedFields, options?: SeedOptions): string
seedFromEmail(email: string): string
normalizeEmail(email: string): string</code></pre>

      <p><code>Navii.seed({ id, email, name, createdAt })</code> picks the most unique field available: <code>id</code> → <code>email</code> → <code>name + createdAt</code> → <code>name</code>. The email branch is <strong>hashed by default</strong> with <code>seedFromEmail()</code> so PII never reaches the wire.</p>

      <pre class="code"><code>import { seed, seedFromEmail } from '@usenavii/core';

const s = seed({ id: user.id, email: user.email, name: user.name });
// id wins if present; otherwise sha256-of-email; otherwise name.

const hashed = seedFromEmail('alice@example.com');
// → "973dfe46…b4e813b" — sha256 hex of normalized email.</code></pre>

      <p><strong>Privacy — why hash emails?</strong> Raw emails in URLs leak into server access logs, <code>Referer</code> headers, browser history, CDN cache keys, and analytics pixels. <code>seedFromEmail()</code> applies <code>sha256(email.trim().toLowerCase())</code>, so the seed stays stable and two services hashing the same way get the same avatar for the same person.</p>

      <p><strong>Migrating off raw-email seeds.</strong> If existing avatars are keyed on the plaintext email and changing them would surprise users, pass <code>{ hashEmail: false }</code> to keep the old behavior:</p>
      <pre class="code"><code>seed({ email: user.email }, { hashEmail: false }); // legacy — avoid in new code</code></pre>
    </section>

    <section>
      <h2 id="options">AvatarOptions</h2>
      <table>
        <thead><tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>size</code></td><td>number (px)</td><td>96</td><td>Output canvas size. SVG viewBox is fixed at 100×100; size scales it.</td></tr>
          <tr><td><code>paletteId</code></td><td>string</td><td>seeded</td><td>Force a specific palette. Pass any palette id.</td></tr>
          <tr><td><code>palette</code></td><td><code>Palette</code> object</td><td>—</td><td>Runtime/brand palette object (e.g. pulled from Figma variables). Wins over <code>paletteId</code>. No registration in <code>PALETTES</code> required.</td></tr>
          <tr><td><code>packs</code></td><td><code>readonly string[]</code></td><td>—</td><td>Enable themed packs (premium content). Pack ids resolve against the built-in registry; unknown ids are silently skipped. Their palettes + parts merge into the selection pool, so the same seed renders differently from the base pool. Empty/undefined → base pool only.</td></tr>
          <tr><td><code>style</code></td><td><code>StyleHint</code></td><td>—</td><td><code>'masc' | 'femme' | 'neutral'</code>. Biases seeded picks toward a gender expression. Only takes effect when an enabled pack defines <code>styleHints</code>. Determinism preserved: same seed + same style = same output.</td></tr>
          <tr><td><code>background</code></td><td>enum or <code>{ color: string }</code></td><td>seeded</td><td>Override scene fill. Enum form picks from <code>'none' | 'solid' | 'ring'</code>; object form supplies an exact color (SDK-only — URL form accepts enum only).</td></tr>
          <tr><td><code>mood</code></td><td>enum</td><td>seeded</td><td><code>'neutral' | 'happy' | 'serious' | 'sleepy' | 'wink'</code>. Overrides seed-derived eyes + mouth with a curated pair. Same seed + mood = byte-identical. Bypasses pack eye/mouth constraints by design.</td></tr>
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
          <tr><td><code>style</code></td><td>CSSProperties</td><td>Standard React inline style on the <code>&lt;img&gt;</code>. <strong>Note:</strong> this is the React DOM <code>style</code>, not the engine's <code>StyleHint</code> — use <code>styleHint</code> below for engine-level bias.</td></tr>
          <tr><td><code>styleHint</code></td><td><code>'masc' | 'femme' | 'neutral'</code></td><td>Engine-level style hint (biases seeded picks). Forwarded to <code>AvatarOptions.style</code>. Renamed in React to avoid collision with React's <code>style</code> prop.</td></tr>
          <tr><td><code>alt</code></td><td>string</td><td>Alt text. Falls back to <code>title</code> if omitted.</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2 id="group">&lt;NaviiGroup&gt; — overlapping stack</h2>
      <p>Wraps core's <code>renderGroup()</code>. Common for team rows, contributor lists, attendee piles. Width is computed from <code>size</code>, <code>overlap</code>, and <code>max</code> so the rendered <code>&lt;img&gt;</code> has correct intrinsic dimensions and doesn't shift on load.</p>
      <pre class="code"><code>import { NaviiGroup } from '@usenavii/react';

&lt;NaviiGroup
  seeds={team.map((u) =&gt; u.id)}
  size={48}
  overlap={0.3}        // 0 = no overlap, 0.7 = heavy stack
  max={5}              // overflow collapses into a "+N" counter tile
  ring="#0a0a0b"       // border around each tile
/&gt;</code></pre>
      <h3 id="group-props">NaviiGroupProps</h3>
      <table>
        <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>seeds</code></td><td>string[]</td><td>—</td><td><strong>Required.</strong> Empty array renders nothing.</td></tr>
          <tr><td><code>size</code></td><td>number</td><td>64</td><td>Per-tile size in px.</td></tr>
          <tr><td><code>overlap</code></td><td>number 0–0.7</td><td>0.3</td><td>Fraction of tile that overlaps previous.</td></tr>
          <tr><td><code>max</code></td><td>number</td><td>all</td><td>Cap before showing a <code>+N</code> counter tile.</td></tr>
          <tr><td><code>ring</code></td><td>string</td><td><code>#ffffff</code></td><td>Border color around each tile.</td></tr>
          <tr><td><code>tileBg</code></td><td>string</td><td><code>#ffffff</code></td><td>Fill behind each tile (use <code>'transparent'</code> to skip).</td></tr>
          <tr><td><code>counterFill</code></td><td>string</td><td><code>#E5E7EB</code></td><td>Background of the <code>+N</code> tile.</td></tr>
          <tr><td><code>counterInk</code></td><td>string</td><td><code>#374151</code></td><td>Text color of the <code>+N</code> tile.</td></tr>
          <tr><td><code>paletteId</code> / <code>palette</code> / <code>mood</code> / <code>background</code> / <code>animated</code> / <code>styleHint</code></td><td colspan="2">—</td><td>Forwarded to every tile. Same semantics as <code>&lt;Navii&gt;</code>.</td></tr>
          <tr><td><code>packs</code> / <code>title</code></td><td colspan="2">—</td><td><strong>Typed but not forwarded</strong> — inherited from <code>GroupOptions</code> but the React wrapper does not currently pass them to per-tile renders. Use <code>renderGroup</code> from <code>@usenavii/core</code> directly if you need them per tile.</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2 id="memo">Memoization</h2>
      <p>The component memoizes the data-URI on <code>seed</code> + all option props via <code>useMemo</code>. This runs on both the server (SSR) and client (hydration), so output is byte-identical between the two renders. Subsequent renders with unchanged props reuse the cached URI without re-running the engine.</p>
      <p>If you're rendering a list, ensure your seeds are stable across renders (e.g. <code>user.id</code>, not <code>idx + Date.now()</code>) — otherwise every render rebuilds every avatar.</p>
    </section>

    <section>
      <h2 id="re-exports">Re-exports</h2>
      <p>Top-level <code>@usenavii/core</code> exports re-exported for convenience: <code>createAvatar</code>, <code>selectAvatar</code>, <code>renderAvatar</code>, <code>renderGroup</code>, plus the types <code>AvatarSpec</code>, <code>AvatarOptions</code>, <code>GroupOptions</code>, <code>MoodId</code>, <code>Palette</code>.</p>
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
          <tr><td><code>RATE_LIMIT_PER_MIN</code></td><td>120 <span style="color:var(--muted-2)">(engine) · 600 (hosted)</span></td><td>Per-IP rate limit on <code>/avatar/*</code>. Engine default is 120 if unset; the hosted deployment at <code>api.navii.dev</code> runs 600. See <a href="/docs/rate-limits">Rate limits</a> for full details.</td></tr>
          <tr><td><code>PNG_CACHE_SIZE</code></td><td>500</td><td>LRU capacity for rasterized PNG responses.</td></tr>
          <tr><td><code>TRUST_PROXY</code></td><td>0</td><td>Set to <code>1</code> behind a reverse proxy you control (Caddy/Nginx). Enables <code>X-Forwarded-For</code> reading for rate-limit IP attribution. <strong>Never enable behind raw CDN</strong> — clients could spoof IPs.</td></tr>
          <tr><td><code>NAVII_API_BASE</code></td><td><code>https://api.navii.dev</code></td><td>Used in landing + docs HTML for absolute API URLs (e.g. cast images, OG image).</td></tr>
          <tr><td><code>NAVII_SITE_BASE</code></td><td><code>https://navii.dev</code></td><td>Public site URL. Used in canonical + OpenGraph meta.</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2 id="proxy">Reverse proxy</h2>
      <p>A sample <code>Caddyfile</code> snippet lives at <code>deploy/Caddyfile.snippet</code>. It does the usual: TLS, gzip, forward to <code>:8787</code>, set <code>X-Forwarded-For</code>.</p>
      <p>Per-domain routing (landing on <code>navii.dev</code>, API on <code>api.navii.dev</code>) is purely DNS + proxy concern — the Hono app handles both transparently.</p>
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
      <p class="lede">Notable user-facing changes. For ops-relevant work (deploy, env vars, rate-limit defaults) see <a href="/docs/deployment">Self-hosting</a> + <a href="/docs/rate-limits">Rate limits</a>. For new endpoints see <a href="/docs/http-api">HTTP API</a>.</p>
    </header>

    <section>
      <h2 id="unreleased">Unreleased</h2>
      <ul>
        <li>Dedicated <a href="/docs/rate-limits">/docs/rate-limits</a> page covering hosted quotas, cache rationale, and self-host tunables.</li>
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
  --muted-2: #a1a1aa;
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
.sb-item:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* universal focus ring */
a:focus-visible, button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}

/* skip to content link — hidden until focused */
.skip-link {
  position: absolute; top: 8px; left: 8px;
  background: var(--bg-2); color: var(--ink);
  border: 1px solid var(--accent);
  padding: 8px 14px; border-radius: 6px;
  font-size: 13px; font-weight: 500;
  transform: translateY(-200%);
  transition: transform 0.15s;
  z-index: 100;
}
.skip-link:focus { transform: translateY(0); outline: none; }

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
  opacity: 0.5;
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
.code-block:focus-within .copy-icon,
.copy-icon:focus-visible { opacity: 1; }
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
