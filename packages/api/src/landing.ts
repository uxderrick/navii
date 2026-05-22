/**
 * Landing page served at GET /.
 *
 * Single HTML file, no external dependencies. The page itself is the demo —
 * a live seed input above an animated cast strip, a tiny group demo, and the
 * full endpoint reference.
 */

const CAST_SEEDS: readonly string[] = [
  'aria', 'milo', 'nova', 'kai', 'sage', 'eden',
  'luna', 'rio', 'pip', 'wren', 'zane', 'iris',
  'fox', 'jin', 'leo', 'pax', 'roo', 'tava',
  'yumi', 'cass', 'odi', 'hex', 'fae', 'rune',
];

const GROUP_SEEDS = ['aria', 'milo', 'nova', 'kai', 'sage'];

/**
 * API base URL — landing is served from navii.uxderrick.com, the avatar
 * endpoints live on navii-api.uxderrick.com. Override at deploy time via
 * NAVII_API_BASE env var if hosting changes.
 */
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
    --ink: #f5f5f5;
    --muted: #71717a;
    --line: #1f1f24;
    --accent: #c084fc;
    --accent-2: #a855f7;
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
  nav.top {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 0;
  }
  nav.top .brand {
    display: flex; align-items: center; gap: 10px; font-weight: 600; letter-spacing: -0.01em;
  }
  nav.top .brand img { width: 28px; height: 28px; border-radius: 50%; }
  nav.top .links { display: flex; gap: 20px; font-size: 14px; color: var(--muted); }
  nav.top .links a:hover { color: var(--ink); }

  /* ── hero ── */
  header.hero {
    padding: 56px 0 72px;
    display: grid; grid-template-columns: 1.2fr 1fr; gap: 64px; align-items: center;
  }
  @media (max-width: 880px) { header.hero { grid-template-columns: 1fr; gap: 40px; } }

  header.hero h1 {
    font-size: clamp(40px, 6.2vw, 72px);
    line-height: 0.98;
    letter-spacing: -0.035em;
    margin: 0 0 18px;
    font-weight: 600;
  }
  header.hero h1 em {
    font-style: normal;
    color: var(--accent);
  }
  header.hero p.lede {
    color: var(--muted);
    font-size: clamp(16px, 1.6vw, 19px);
    max-width: 44ch;
    margin: 0 0 28px;
  }

  .seed-input {
    display: flex; gap: 0; align-items: stretch;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--bg-2);
    overflow: hidden;
    max-width: 460px;
  }
  .seed-input span.prefix {
    padding: 14px 12px 14px 16px;
    color: var(--muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13.5px;
    border-right: 1px solid var(--line);
    background: #18181b;
    user-select: none;
  }
  .seed-input input {
    flex: 1; min-width: 0;
    background: transparent;
    border: 0;
    color: var(--ink);
    font: 16px ui-monospace, SFMono-Regular, Menlo, monospace;
    padding: 14px 16px;
    outline: none;
  }
  .seed-input input::placeholder { color: #52525b; }

  .url-line {
    margin-top: 14px;
    color: var(--muted);
    font-size: 12.5px;
  }
  .url-line code {
    color: var(--ink);
    background: var(--bg-2);
    border: 1px solid var(--line);
    padding: 4px 8px;
    border-radius: 6px;
    word-break: break-all;
  }

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
  }
  .live-avatar img { width: 78%; height: 78%; display: block; }

  /* ── cast ── */
  section.cast h2,
  section.group h2,
  section.docs h2 {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin: 0 0 8px;
  }
  section.cast .blurb,
  section.group .blurb,
  section.docs .blurb {
    font-size: clamp(22px, 2.4vw, 30px);
    line-height: 1.25;
    letter-spacing: -0.015em;
    margin: 0 0 32px;
    max-width: 56ch;
    color: var(--ink);
  }
  section.cast .blurb span,
  section.group .blurb span { color: var(--muted); }

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
  .group-demo code .pink { color: var(--accent); }

  /* ── docs / endpoint table ── */
  table.endpoints {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  table.endpoints th, table.endpoints td {
    text-align: left;
    padding: 14px 0;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
  }
  table.endpoints th {
    font-weight: 600;
    color: var(--muted);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  table.endpoints td.path { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--ink); white-space: nowrap; }
  table.endpoints td.params { color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  table.endpoints td.desc { color: var(--ink); }

  /* ── footer ── */
  footer.bottom {
    display: flex; justify-content: space-between; align-items: center;
    padding: 32px 0 56px;
    color: var(--muted);
    font-size: 13px;
  }
  footer.bottom a { color: var(--muted); }
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
      <a href="#docs">api</a>
      <a href="https://github.com/uxderrick/navii">github</a>
    </div>
  </nav>

  <header class="hero">
    <div>
      <h1>Every user, <em>a face.</em></h1>
      <p class="lede">Drop-in deterministic mascot avatars. Pass any string — a user id, email, name — get a clean SVG. Same seed in, same face out, every time.</p>
      <div class="seed-input">
        <span class="prefix">${API_BASE.replace(/^https?:\/\//, '')}/avatar/</span>
        <input id="seed-input" type="text" value="alice@example.com" autocomplete="off" spellcheck="false" />
      </div>
      <p class="url-line"><code id="seed-url">${API_BASE}/avatar/alice@example.com?size=320&amp;animated=1</code></p>
    </div>
    <div class="live-avatar">
      <img id="live" src="${API_BASE}/avatar/alice@example.com?size=320&amp;animated=1" alt="" />
    </div>
  </header>

  <hr class="rule" />

  <section id="cast" class="cast">
    <h2>the cast</h2>
    <p class="blurb">22 palettes, 8 bodies, 10 eyes, 10 mouths, 5 antennas, 12 toppers, 7 accessories. <span>Plus continuous tweaks — every seed reads as an individual.</span></p>
    <div class="cast-grid">${tiles}</div>
  </section>

  <hr class="rule" />

  <section id="group" class="group">
    <h2>groups</h2>
    <p class="blurb">For teams, threads, comments — anywhere people gather. <span>Opaque tiles so overlap stays clean.</span></p>
    <div class="group-demo">
      <img src="${groupUrl}" alt="avatar group" />
      <code><span class="pink">GET</span> ${API_BASE}${groupPath}</code>
    </div>
  </section>

  <hr class="rule" />

  <section id="docs" class="docs">
    <h2>endpoints</h2>
    <p class="blurb">Plain URLs. <span>No SDK required, no auth, public CORS.</span></p>
    <table class="endpoints">
      <thead><tr><th style="width:30%">path</th><th style="width:40%">params</th><th>notes</th></tr></thead>
      <tbody>
        <tr>
          <td class="path">/avatar/:seed</td>
          <td class="params">size palette background tileBg title animated</td>
          <td class="desc">SVG avatar. Add <code>.png</code> for raster (e.g. <code>/avatar/alice.png</code>).</td>
        </tr>
        <tr>
          <td class="path">/group</td>
          <td class="params">seeds=a,b,c size overlap max ring tileBg animated</td>
          <td class="desc">Horizontal overlapping stack. <code>+N</code> tile when seeds exceed <code>max</code>.</td>
        </tr>
        <tr>
          <td class="path">/gallery</td>
          <td class="params">count size prefix animated</td>
          <td class="desc">Visual debug gallery.</td>
        </tr>
        <tr>
          <td class="path">/healthz</td>
          <td class="params">—</td>
          <td class="desc">Liveness probe.</td>
        </tr>
        <tr>
          <td class="path">/api</td>
          <td class="params">—</td>
          <td class="desc">JSON service metadata.</td>
        </tr>
      </tbody>
    </table>
  </section>

  <footer class="bottom">
    <div>navii · deterministic avatars · open source</div>
    <div><a href="https://github.com/uxderrick/navii">github</a> · <a href="/api">/api</a></div>
  </footer>

</div>

<script>
  (function () {
    const API_BASE = ${JSON.stringify(API_BASE)};
    const input = document.getElementById('seed-input');
    const live = document.getElementById('live');
    const url = document.getElementById('seed-url');
    let t = null;

    function update() {
      const raw = input.value.trim() || 'alice@example.com';
      const enc = encodeURIComponent(raw);
      live.src = API_BASE + '/avatar/' + enc + '?size=320&animated=1';
      url.textContent = API_BASE + '/avatar/' + raw + '?size=320&animated=1';
    }

    input.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(update, 120);
    });
  })();
</script>

</body>
</html>`;
}
