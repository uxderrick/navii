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

const GROUP_SEEDS = ['aria', 'milo', 'nova', 'kai', 'sage'];

const API_BASE = process.env['NAVII_API_BASE'] ?? 'https://navii-api.uxderrick.com';

export function landingHtml(): string {
  const tiles = CAST_SEEDS.map(
    (s) =>
      `<a class="tile" href="${API_BASE}/avatar/${s}?size=192&animated=1" title="${s}"><img src="${API_BASE}/avatar/${s}?size=160&animated=1" alt="${s}" loading="lazy" width="160" height="160" /><span>${s}</span></a>`,
  ).join('');

  const groupPath = `/group?seeds=${GROUP_SEEDS.join(',')}&size=72&overlap=0.32`;
  const groupUrl = `${API_BASE}${groupPath}`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Navii — every user, a face</title>
<meta name="description" content="Drop-in deterministic mascot avatars. Same seed in, same face out — every time." />
<meta name="theme-color" content="#0a0a0b" />
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
  html, body { margin: 0; background: var(--bg); color: var(--ink); }
  body {
    font: 16px/1.6 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  a { color: var(--ink); text-decoration: none; }
  a:hover { color: var(--accent); }
  code, pre, .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13.5px; }
  .container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
  hr.rule { border: 0; border-top: 1px solid var(--line); margin: 88px 0; }

  /* ── nav ── */
  nav.top { display: flex; align-items: center; justify-content: space-between; padding: 22px 0; }
  nav.top .brand { display: flex; align-items: center; gap: 10px; font-weight: 600; letter-spacing: -0.01em; }
  nav.top .brand img { width: 28px; height: 28px; border-radius: 50%; }
  nav.top .links { display: flex; gap: 20px; font-size: 14px; color: var(--muted-2); }
  nav.top .links a:hover { color: var(--ink); }

  /* ── hero ── */
  header.hero {
    padding: 48px 0 72px;
    display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: center;
  }
  @media (max-width: 980px) { header.hero { grid-template-columns: 1fr; gap: 40px; } }

  header.hero h1 {
    font-size: clamp(40px, 6vw, 64px);
    line-height: 1.0;
    letter-spacing: -0.035em;
    margin: 0 0 16px;
    font-weight: 600;
  }
  header.hero h1 em { font-style: normal; color: var(--accent); }
  header.hero p.lede {
    color: var(--muted);
    font-size: clamp(15px, 1.4vw, 17px);
    max-width: 50ch;
    margin: 0 0 28px;
  }

  /* ── editable URL playground ── */
  .editor {
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--bg-2);
    overflow: hidden;
    margin: 0 0 14px;
    position: relative;
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
  .editor-head .copy {
    background: transparent;
    border: 1px solid var(--line);
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
  .editor textarea {
    width: 100%;
    min-height: 142px;
    border: 0;
    background: transparent;
    color: var(--ink);
    padding: 14px 16px 16px;
    font: 13.5px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace;
    resize: vertical;
    outline: none;
    tab-size: 2;
  }
  .editor textarea::selection { background: rgba(192, 132, 252, 0.25); }
  .preset-row {
    display: flex; gap: 8px; flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .preset {
    background: var(--bg-2);
    border: 1px solid var(--line);
    color: var(--muted);
    padding: 6px 12px;
    border-radius: 999px;
    font: 12.5px ui-sans-serif, system-ui, sans-serif;
    cursor: pointer;
    transition: color .15s, border-color .15s;
  }
  .preset:hover { color: var(--ink); border-color: var(--muted-2); }
  .preset.active { color: var(--accent); border-color: var(--accent); }

  /* ── hero avatar ── */
  .live-avatar {
    aspect-ratio: 1;
    max-width: 360px;
    margin: 0 auto;
    background: radial-gradient(circle at 35% 30%, #1c1c22, var(--bg) 70%);
    border: 1px solid var(--line);
    border-radius: 28px;
    display: grid; place-items: center;
    overflow: hidden;
    position: relative;
  }
  .live-avatar img { width: 78%; height: 78%; display: block; }
  .live-avatar.error::after {
    content: 'invalid URL';
    position: absolute; inset: auto 14px 14px auto;
    color: #f87171;
    font: 11px ui-monospace, monospace;
  }

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

  /* ── cast grid ── */
  .cast-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 14px;
  }
  @media (max-width: 880px) { .cast-grid { grid-template-columns: repeat(3, 1fr); } }
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

  /* ── api reference ── */
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
</head>
<body>
<div class="container">

  <nav class="top">
    <div class="brand">
      <img src="${API_BASE}/avatar/navii?size=56" alt="navii" />
      <span>navii</span>
    </div>
    <div class="links">
      <a href="#cast">cast</a>
      <a href="#group">groups</a>
      <a href="#reference">api</a>
      <a href="https://github.com/uxderrick/navii">github</a>
    </div>
  </nav>

  <header class="hero">
    <div>
      <h1>Every user, <em>a face.</em></h1>
      <p class="lede">Drop-in deterministic mascot avatars. Pass any string — user id, email, UUID — get back a clean SVG or PNG. Same seed in, same face out, every time.</p>

      <div class="editor" aria-label="Editable avatar URL">
        <div class="editor-head">
          <span>request</span>
          <button class="copy" id="copy-btn" type="button">copy</button>
        </div>
        <textarea id="editor" spellcheck="false" autocomplete="off" wrap="soft">GET ${API_BASE}/avatar/alice@example.com
  ?size=320
  &animated=1</textarea>
      </div>

      <div class="preset-row" id="presets">
        <button class="preset" data-preset="basic">basic</button>
        <button class="preset" data-preset="animated">animated</button>
        <button class="preset" data-preset="palette">palette</button>
        <button class="preset" data-preset="tile">filled tile</button>
        <button class="preset" data-preset="dark">dark tile</button>
        <button class="preset" data-preset="png">PNG raster</button>
        <button class="preset" data-preset="group">group</button>
      </div>
    </div>

    <div class="live-avatar" id="live-wrap">
      <img id="live" src="${API_BASE}/avatar/alice@example.com?size=320&amp;animated=1" alt="" />
    </div>
  </header>

  <hr class="rule" />

  <section id="cast">
    <h2>the cast</h2>
    <p class="blurb">22 palettes, 8 bodies, 10 eyes, 10 mouths, 5 antennas, 12 toppers, 7 accessories. <span>Plus continuous tweaks — every seed reads as an individual.</span></p>
    <div class="cast-grid">${tiles}</div>
  </section>

  <hr class="rule" />

  <section id="group">
    <h2>groups</h2>
    <p class="blurb">For teams, threads, comments — anywhere people gather. <span>Opaque tiles so overlap stays clean.</span></p>
    <div class="group-demo">
      <img src="${groupUrl}" alt="avatar group" />
      <code><span class="verb">GET</span> ${API_BASE}${groupPath}</code>
    </div>
  </section>

  <hr class="rule" />

  <section id="reference">
    <h2>api reference</h2>
    <p class="blurb">No SDK, no auth, public CORS. <span>All endpoints return cacheable image content with 1-year <code>immutable</code> headers (HTML pages cache 5 min).</span></p>

    <!-- /avatar/:seed -->
    <article class="ref-endpoint">
      <h3><span class="verb">GET</span> <span class="path">/avatar/:seed[.svg|.png]</span></h3>
      <p class="desc">Returns a deterministic mascot avatar for the given seed. Same seed → same avatar, byte-for-byte. Append <code>.png</code> to the seed to receive a rasterized PNG instead of SVG.</p>

      <div class="params-list">
        <h4>path</h4>
        <dl>
          <dt>:seed</dt><dd class="type">string</dd><dd class="desc">Any unique identifier. Use a stable user id, UUID, or email. Avoid display names — collisions cause duplicate avatars.</dd>
        </dl>

        <h4>query</h4>
        <dl>
          <dt>size</dt>      <dd class="type">number</dd>  <dd class="desc">Output size in px. Default 96. Range 16–1024.</dd>
          <dt>palette</dt>   <dd class="type">enum</dd>    <dd class="desc">Force a color family. indigo · mint · amber · sky · violet · cyan · rose · lime · peach · teal · sand · plum · coral · forest · slate · fuchsia · terracotta · navy · lavender · charcoal · butter · aqua</dd>
          <dt>background</dt><dd class="type">enum</dd>    <dd class="desc">Scene fill. <code>none</code> · <code>solid</code> · <code>ring</code>. Default = seed-derived.</dd>
          <dt>tileBg</dt>    <dd class="type">color</dd>   <dd class="desc">Opaque circular tile behind avatar. Any CSS color, e.g. <code>%23ffffff</code> (URL-encoded <code>#fff</code>), or <code>auto</code> to use the palette accent.</dd>
          <dt>title</dt>     <dd class="type">string</dd>  <dd class="desc">Accessible label. Adds <code>role="img"</code> + <code>aria-label</code>.</dd>
          <dt>animated</dt>  <dd class="type">0 | 1</dd>   <dd class="desc">Opt-in idle motion (float, blink, sway, twinkle). SVG only; PNG ignores. Respects <code>prefers-reduced-motion</code>.</dd>
        </dl>
      </div>

      <div class="examples">
        <h4>examples</h4>
        ${avatarExample('basic',          `${API_BASE}/avatar/alice`,                                       'alice', 'size=64')}
        ${avatarExample('animated',       `${API_BASE}/avatar/alice?animated=1`,                            'alice', 'size=64&animated=1')}
        ${avatarExample('palette: violet', `${API_BASE}/avatar/alice?palette=violet`,                       'alice', 'size=64&palette=violet')}
        ${avatarExample('filled tile (white)', `${API_BASE}/avatar/alice?tileBg=%23ffffff`,                  'alice', 'size=64&tileBg=%23ffffff')}
        ${avatarExample('dark tile',       `${API_BASE}/avatar/alice?tileBg=%230b0b0c`,                      'alice', 'size=64&tileBg=%230b0b0c')}
        ${avatarExample('with ring bg',    `${API_BASE}/avatar/alice?background=ring`,                       'alice', 'size=64&background=ring')}
        ${avatarExample('PNG raster',      `${API_BASE}/avatar/alice.png?size=256`,                          'alice.png', 'size=64')}
        ${avatarExample('big PNG',         `${API_BASE}/avatar/alice.png?size=512&tileBg=auto`,              'alice.png', 'size=64&tileBg=auto')}
      </div>
    </article>

    <!-- /group -->
    <article class="ref-endpoint">
      <h3><span class="verb">GET</span> <span class="path">/group</span></h3>
      <p class="desc">Renders multiple seeded avatars as a single horizontally-stacked SVG with optional overlap and a <code>+N</code> counter tile for overflow.</p>

      <div class="params-list">
        <h4>query</h4>
        <dl>
          <dt>seeds</dt>   <dd class="type">csv</dd>    <dd class="desc">Comma-separated list of seeds. Up to 50.</dd>
          <dt>size</dt>    <dd class="type">number</dd> <dd class="desc">Per-tile size in px. Default 64. Range 16–256.</dd>
          <dt>overlap</dt> <dd class="type">number</dd> <dd class="desc">Fraction each tile overlaps the previous. 0 = no overlap, 0.7 = heavy stack. Default 0.3.</dd>
          <dt>max</dt>     <dd class="type">number</dd> <dd class="desc">Max tiles to render. Extra seeds collapse into a <code>+N</code> tile. Default = all.</dd>
          <dt>ring</dt>    <dd class="type">color</dd>  <dd class="desc">Border color around each tile. Default white.</dd>
          <dt>tileBg</dt>  <dd class="type">color</dd>  <dd class="desc">Opaque fill behind each avatar (prevents overlap show-through). Default white.</dd>
          <dt>animated</dt><dd class="type">0 | 1</dd>  <dd class="desc">Per-avatar animation in the group.</dd>
        </dl>
      </div>

      <div class="examples">
        <h4>examples</h4>
        ${groupExample('basic',    `${API_BASE}/group?seeds=alice,bob,carol`)}
        ${groupExample('overlap',  `${API_BASE}/group?seeds=alice,bob,carol,dave,eve&size=64&overlap=0.45`)}
        ${groupExample('with +N',  `${API_BASE}/group?seeds=alice,bob,carol,dave,eve,frank,grace&size=56&max=4`)}
        ${groupExample('animated', `${API_BASE}/group?seeds=alice,bob,carol,dave&size=72&animated=1`)}
      </div>
    </article>

    <!-- /gallery, /healthz, /api -->
    <article class="ref-endpoint">
      <h3><span class="verb">GET</span> <span class="path">/gallery</span></h3>
      <p class="desc">Visual debug page — N seeded avatars in a grid. For browsing the cast, not for production embedding.</p>
      <div class="params-list">
        <h4>query</h4>
        <dl>
          <dt>count</dt>    <dd class="type">number</dd> <dd class="desc">How many tiles (1–500). Default 96.</dd>
          <dt>size</dt>     <dd class="type">number</dd> <dd class="desc">Per-tile size. Default 96.</dd>
          <dt>prefix</dt>   <dd class="type">string</dd> <dd class="desc">Seed prefix. Default <code>user</code>, so seeds become <code>user-0</code>, <code>user-1</code>, …</dd>
          <dt>animated</dt> <dd class="type">0 | 1</dd>  <dd class="desc">Animate each tile.</dd>
        </dl>
      </div>
    </article>

    <article class="ref-endpoint">
      <h3><span class="verb">GET</span> <span class="path">/healthz</span></h3>
      <p class="desc">Liveness probe. Returns <code>{"ok":true,"pngCacheSize":N}</code>.</p>
    </article>

    <article class="ref-endpoint">
      <h3><span class="verb">GET</span> <span class="path">/api</span></h3>
      <p class="desc">Service metadata as JSON. Useful for clients that want to discover the endpoint surface programmatically.</p>
    </article>

    <article class="ref-endpoint">
      <h3>headers</h3>
      <p class="desc">All image responses set:</p>
      <div class="params-list">
        <dl>
          <dt>cache-control</dt>          <dd class="type"></dd> <dd class="desc"><code>public, max-age=31536000, immutable</code> — safe to cache forever (seed + params fully determine the bytes).</dd>
          <dt>access-control-allow-origin</dt><dd class="type"></dd><dd class="desc"><code>*</code> — embed anywhere.</dd>
          <dt>content-type</dt>           <dd class="type"></dd> <dd class="desc"><code>image/svg+xml; charset=utf-8</code> for SVG, <code>image/png</code> for PNG.</dd>
        </dl>
      </div>
    </article>

    <article class="ref-endpoint">
      <h3>rate limits</h3>
      <p class="desc">Per-IP sliding window: 600 requests / minute on <code>/avatar/*</code>. Exceeds → HTTP 429 + <code>Retry-After</code> header. <code>/group</code>, <code>/gallery</code>, <code>/healthz</code> are unlimited.</p>
    </article>

    <article class="ref-endpoint">
      <h3>determinism guarantee</h3>
      <p class="desc">Same seed + same query params → byte-identical response. Forever. Safe to cache, safe to mirror, safe to depend on.</p>
    </article>

  </section>

  <hr class="rule" />

  <footer class="bottom">
    <div>navii · deterministic avatars · open source · MIT</div>
    <div><a href="https://github.com/uxderrick/navii">github</a> · <a href="/api">/api</a></div>
  </footer>

</div>

<script>
  (function () {
    const API_BASE = ${JSON.stringify(API_BASE)};
    const editor = document.getElementById('editor');
    const live = document.getElementById('live');
    const liveWrap = document.getElementById('live-wrap');
    const copyBtn = document.getElementById('copy-btn');
    const presets = document.getElementById('presets');
    let t = null;

    const PRESETS = {
      basic:    'GET ' + API_BASE + '/avatar/alice@example.com',
      animated: 'GET ' + API_BASE + '/avatar/alice@example.com\\n  ?size=320\\n  &animated=1',
      palette:  'GET ' + API_BASE + '/avatar/alice@example.com\\n  ?size=320\\n  &palette=violet\\n  &animated=1',
      tile:     'GET ' + API_BASE + '/avatar/alice@example.com\\n  ?size=320\\n  &tileBg=%23ffffff',
      dark:     'GET ' + API_BASE + '/avatar/alice@example.com\\n  ?size=320\\n  &tileBg=%230b0b0c',
      png:      'GET ' + API_BASE + '/avatar/alice@example.com.png\\n  ?size=320\\n  &tileBg=auto',
      group:    'GET ' + API_BASE + '/group\\n  ?seeds=alice,bob,carol,dave,eve\\n  &size=80\\n  &overlap=0.32'
    };

    function extractUrl(text) {
      // strip "GET " verb, join multi-line params back into a single URL
      const cleaned = text.replace(/^\\s*GET\\s+/i, '').replace(/\\s+/g, '');
      try { new URL(cleaned); return cleaned; } catch { return null; }
    }

    function update() {
      const url = extractUrl(editor.value);
      if (!url) { liveWrap.classList.add('error'); return; }
      liveWrap.classList.remove('error');
      // tweak the URL size param down for hero preview if absent
      try {
        const u = new URL(url);
        // Only render avatar endpoints here; group renders too but width differs
        const isGroup = u.pathname === '/group';
        if (!isGroup && !u.searchParams.has('size')) u.searchParams.set('size', '320');
        if (!isGroup && !u.searchParams.has('animated')) u.searchParams.set('animated', '1');
        live.src = u.toString();
      } catch { live.src = url; }
    }

    editor.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(update, 140);
    });

    presets.addEventListener('click', function (ev) {
      const btn = ev.target.closest('button.preset');
      if (!btn) return;
      const key = btn.getAttribute('data-preset');
      if (!PRESETS[key]) return;
      editor.value = PRESETS[key];
      document.querySelectorAll('.preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      update();
    });

    copyBtn.addEventListener('click', async function () {
      const url = extractUrl(editor.value);
      if (!url) return;
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = 'copied';
        copyBtn.classList.add('ok');
        setTimeout(function () {
          copyBtn.textContent = 'copy';
          copyBtn.classList.remove('ok');
        }, 1400);
      } catch {}
    });
  })();
</script>

</body>
</html>`;
}

function avatarExample(label: string, urlForCode: string, exampleSeed: string, previewQuery: string): string {
  const previewUrl = `${API_BASE}/avatar/${exampleSeed}?${previewQuery}`;
  return `<div class="ex">
    <span class="label">${label}</span>
    <code><span style="color:var(--accent)">GET</span> ${urlForCode}</code>
    <span class="preview"><img src="${previewUrl}" alt="" loading="lazy" width="56" height="56" /></span>
  </div>`;
}

function groupExample(label: string, urlForCode: string): string {
  const previewUrl = urlForCode.includes('size=')
    ? urlForCode.replace(/size=\d+/, 'size=40')
    : `${urlForCode}&size=40`;
  return `<div class="ex">
    <span class="label">${label}</span>
    <code><span style="color:var(--accent)">GET</span> ${urlForCode}</code>
    <span class="preview" style="width: 120px; height: 56px;"><img src="${previewUrl}" alt="" loading="lazy" /></span>
  </div>`;
}
