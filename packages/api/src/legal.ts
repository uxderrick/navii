/**
 * Legal + support pages served under /privacy and /support.
 *
 * Standalone shell — kept independent from docs.ts so changes to the docs
 * layout don't accidentally reflow legal copy that Figma's review process
 * links to. Theme tokens mirror docs.ts intentionally.
 */

const SITE_BASE = process.env['NAVII_SITE_BASE'] ?? 'https://navii.dev';
const SUPPORT_EMAIL = process.env['NAVII_SUPPORT_EMAIL'] ?? 'tsormed@gmail.com';
const GITHUB_URL = 'https://github.com/uxderrick/navii';
const GITHUB_ISSUES_URL = 'https://github.com/uxderrick/navii/issues';
const LAST_UPDATED = '2026-05-25';

interface PageMeta {
  title: string;
  description: string;
  path: string;
}

export function privacyHtml(): string {
  return shell(
    {
      title: 'Privacy policy',
      description: 'How Navii handles data when you use the avatar API, Figma plugin, or website.',
      path: '/privacy',
    },
    privacyBody(),
  );
}

export function supportHtml(): string {
  return shell(
    {
      title: 'Support',
      description: 'How to get help with Navii — bug reports, feature requests, and contact.',
      path: '/support',
    },
    supportBody(),
  );
}

function privacyBody(): string {
  return `
<header class="page-head">
  <h1>Privacy policy</h1>
  <p class="lede">What Navii sees, what it stores, and what it never sends anywhere. Last updated ${LAST_UPDATED}.</p>
</header>

<section>
  <h2>Short version</h2>
  <ul>
    <li>Navii does not require an account. No sign-up, no tracking cookie, no analytics inside the Figma plugin.</li>
    <li>Seeds you type (names, emails, IDs) are sent to <code>api.navii.dev</code> only when you click <strong>Insert</strong> or <strong>Fill</strong>. They are used to render the avatar and are never stored, logged with PII, or shared with third parties.</li>
    <li>If you buy Navii Pro, your purchase is handled by Gumroad. Navii only receives a license key, used for verification.</li>
  </ul>
</section>

<section>
  <h2>What we process</h2>
  <h3>Avatar requests</h3>
  <p>When the Figma plugin or any caller hits <code>GET /avatar/:seed</code>, our server receives:</p>
  <ul>
    <li>The seed string in the URL path (whatever you typed — often a username or test email).</li>
    <li>Standard HTTP request data: IP address, User-Agent, timestamp, requested size and palette.</li>
  </ul>
  <p>Seeds are processed in-memory to generate the SVG/PNG response. The rendered image is cached at the CDN edge by URL hash. We do not log seeds together with IP addresses or any other identifier that would let us recover who requested what. Access logs are kept for up to 30 days for abuse detection and aggregate traffic counts, then rotated out.</p>

  <h3>Pro licenses</h3>
  <p>If you upgrade, payment is processed by Polar.sh — see <a href="https://polar.sh/legal/privacy" rel="noopener">Polar's privacy policy</a>. Navii receives:</p>
  <ul>
    <li>The license key (returned by Polar).</li>
    <li>The email you optionally enter when verifying inside the plugin.</li>
  </ul>
  <p>These are sent to <code>POST /license/verify</code>, forwarded to Polar's license-key validation API, and the result is cached for 24 hours in your local Figma <code>clientStorage</code>. We do not maintain a separate user database. To remove the cached license, click <em>Sign out</em> in the plugin's Pro modal.</p>

  <h3>Website analytics</h3>
  <p>The public marketing site at <code>navii.dev</code> uses self-hosted Umami for aggregate page-view counts. No cross-site tracking, no fingerprinting, no third-party ad networks. The Figma plugin itself does not load any analytics.</p>
</section>

<section>
  <h2>What we do not do</h2>
  <ul>
    <li>We do not read your Figma file beyond what you have selected when you click a button.</li>
    <li>We do not upload your Figma file, layers, images, or design tokens to any server.</li>
    <li>We do not sell, rent, or share data with advertisers or data brokers.</li>
    <li>We do not train any machine-learning model on your seeds or requests.</li>
  </ul>
</section>

<section>
  <h2>Sub-processors</h2>
  <ul>
    <li><strong>Hetzner</strong> (Germany) — hosting for <code>api.navii.dev</code> and <code>navii.dev</code>.</li>
    <li><strong>Gumroad</strong> — payment processing and license verification for Navii Pro.</li>
    <li><strong>Cloudflare</strong> — DNS and edge caching for static avatar responses.</li>
  </ul>
</section>

<section>
  <h2>Your rights</h2>
  <p>Because Navii does not require an account, there is typically nothing to delete. If you have purchased Pro and want your license invalidated or your email removed from verification logs, email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> and we will action it within 30 days.</p>
</section>

<section>
  <h2>Children</h2>
  <p>Navii is a developer tool and is not directed at children under 13. We do not knowingly collect data from children.</p>
</section>

<section>
  <h2>Changes</h2>
  <p>If we materially change this policy we will update the date at the top of this page and, where reasonably possible, note the change in the project changelog at <a href="${GITHUB_URL}" rel="noopener">github.com/uxderrick/navii</a>.</p>
</section>

<section>
  <h2>Contact</h2>
  <p>Questions about privacy: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
</section>
  `;
}

function supportBody(): string {
  return `
<header class="page-head">
  <h1>Support</h1>
  <p class="lede">Bugs, questions, and feature requests — here is the fastest path to a human.</p>
</header>

<section>
  <h2>Email</h2>
  <p>General support, billing, privacy: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
  <p>Replies typically within 2 business days.</p>
</section>

<section>
  <h2>Bug reports and feature requests</h2>
  <p>Open an issue on GitHub: <a href="${GITHUB_ISSUES_URL}" rel="noopener">${GITHUB_ISSUES_URL}</a></p>
  <p>Useful details to include:</p>
  <ul>
    <li>Plugin version (visible in the Figma plugin <em>About</em> section).</li>
    <li>Browser or Figma desktop version.</li>
    <li>Steps to reproduce.</li>
    <li>Screenshot of the plugin iframe console, if there is an error.</li>
  </ul>
  <p>To open the plugin console: right-click the plugin window in Figma → <em>Open console</em>. Filter for <code>[navii]</code>.</p>
</section>

<section>
  <h2>Pro license issues</h2>
  <p>Lost your license key, need a refund, or changed email? Email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> with your Gumroad order number.</p>
</section>

<section>
  <h2>Status</h2>
  <p>API health endpoint: <a href="/healthz"><code>/healthz</code></a>. If avatars stop loading in the plugin, check this URL first.</p>
</section>

<section>
  <h2>Security</h2>
  <p>Found a security issue? Please do not file a public GitHub issue. Email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> with <em>[security]</em> in the subject and we will respond within 72 hours.</p>
</section>
  `;
}

function shell(meta: PageMeta, content: string): string {
  const url = `${SITE_BASE}${meta.path}`;
  const pageTitle = `${escapeHtml(meta.title)} — Navii`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${pageTitle}</title>
<meta name="description" content="${escapeHtml(meta.description)}" />
<meta name="theme-color" content="#0a0a0b" />
<meta name="color-scheme" content="dark" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${url}" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet" />
${styleBlock()}
</head>
<body>
<a class="skip-link" href="#main-content">Skip to content</a>
<div class="layout">

  <nav class="top">
    <a class="brand" href="${SITE_BASE}/">
      <img src="/favicon.svg" alt="navii" />
      <span>navii</span>
    </a>
    <div class="links">
      <a href="${SITE_BASE}/docs">docs</a>
      <a href="${SITE_BASE}/privacy">privacy</a>
      <a href="${SITE_BASE}/support">support</a>
      <a href="${GITHUB_URL}" rel="noopener">github</a>
    </div>
  </nav>

  <main class="content" id="main-content" tabindex="-1">
    ${content}
  </main>

  <footer class="bottom">
    <div>navii · deterministic avatars · open source · MIT</div>
    <div>
      <a href="${SITE_BASE}/privacy">privacy</a> ·
      <a href="${SITE_BASE}/support">support</a> ·
      <a href="${GITHUB_URL}" rel="noopener">github</a>
    </div>
  </footer>

</div>
</body>
</html>`;
}

function styleBlock(): string {
  return `<style>
:root {
  --bg: #0a0a0b;
  --bg-2: #131316;
  --ink: #f5f5f5;
  --muted: #a1a1aa;
  --line: #1f1f24;
  --accent: #c084fc;
  color-scheme: dark;
}
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); color: var(--ink); }
body {
  font: 15px/1.65 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-feature-settings: 'cv11', 'ss01';
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
a { color: var(--ink); text-decoration: underline; text-decoration-color: var(--line); text-underline-offset: 3px; }
a:hover { color: var(--accent); text-decoration-color: var(--accent); }
code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; background: var(--bg-2); border: 1px solid var(--line); padding: 1px 6px; border-radius: 4px; }

.layout { max-width: 760px; margin: 0 auto; padding: 0 24px; }

nav.top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px; margin: 0 -24px 36px;
  position: sticky; top: 0; z-index: 50;
  background: rgba(10, 10, 11, 0.72);
  backdrop-filter: saturate(140%) blur(10px);
  -webkit-backdrop-filter: saturate(140%) blur(10px);
  border-bottom: 1px solid var(--line);
}
nav.top .brand { display: flex; align-items: center; gap: 10px; font-weight: 600; letter-spacing: -0.01em; text-decoration: none; }
nav.top .brand img { width: 26px; height: 26px; border-radius: 50%; background: var(--bg-2); }
nav.top .links { display: flex; gap: 20px; font-size: 14px; color: var(--muted); }
nav.top .links a { color: var(--muted); text-decoration: none; }
nav.top .links a:hover { color: var(--ink); }

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

.content { min-height: 60vh; padding-bottom: 72px; }
.content .page-head { margin-bottom: 36px; }
.content .page-head h1 { font-size: clamp(28px, 4vw, 38px); letter-spacing: -0.02em; margin: 0 0 12px; }
.content .page-head .lede { color: var(--muted); font-size: 16px; margin: 0; }
.content section { margin-bottom: 32px; }
.content section h2 { font-size: 19px; letter-spacing: -0.01em; margin: 0 0 12px; }
.content section h3 { font-size: 15px; margin: 20px 0 8px; color: var(--muted); font-weight: 600; }
.content section p { margin: 0 0 12px; }
.content section ul { margin: 0 0 14px; padding-left: 22px; }
.content section li { margin: 4px 0; }
.content section li::marker { color: var(--muted); }

footer.bottom {
  display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between;
  padding: 24px 0 32px;
  margin-top: 32px;
  border-top: 1px solid var(--line);
  font-size: 13px; color: var(--muted);
}
footer.bottom a { color: var(--muted); }
footer.bottom a:hover { color: var(--ink); }
</style>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
