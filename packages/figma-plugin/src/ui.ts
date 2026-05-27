/**
 * Plugin UI iframe. Runs in normal browser env.
 * Uses @usenavii/core directly for live previews.
 * Posts messages to main thread (code.ts) to mutate the Figma document.
 */

import { createAvatar, build as buildAvatar, BUILT_IN_PACKS, selectAvatar } from '@usenavii/core';
import type { AvatarOptions, BuildSpec, Pack } from '@usenavii/core';

// ---------- constants ----------
const PALETTE_IDS = [
  'indigo', 'mint', 'amber', 'sky', 'violet', 'cyan', 'rose', 'lime',
  'peach', 'teal', 'sand', 'plum', 'coral', 'forest', 'slate', 'fuchsia',
  'terracotta', 'navy', 'lavender', 'charcoal', 'butter', 'aqua',
];
const BODY_IDS = ['orb', 'tall', 'squat', 'pear', 'pebble', 'dumpling', 'taro', 'wisp'];
const EYE_IDS = ['round', 'wide', 'squint', 'wink', 'sleepy', 'star', 'heart', 'oval', 'dot', 'cross'];
const MOUTH_IDS = ['smile', 'grin', 'open', 'flat', 'smirk', 'awe', 'tongue', 'tooth', 'wave', 'dot'];
const ANTENNA_IDS = ['none', 'classic', 'curl', 'double', 'spike'];
const ACCESSORY_IDS = ['none', 'blush', 'freckles', 'sparkle', 'glasses', 'eyepatch', 'mole'];
const TOPPER_IDS = ['none', 'ears', 'roundEars', 'horn', 'horns', 'tuft', 'cap', 'leaf', 'headband', 'halo', 'crown', 'antlers'];

const PALETTE_PREVIEW: Record<string, string> = {
  indigo: '#6366F1', mint: '#34D399', amber: '#F59E0B', sky: '#3B82F6',
  violet: '#A855F7', cyan: '#06B6D4', rose: '#F43F5E', lime: '#84CC16',
  peach: '#F97316', teal: '#14B8A6', sand: '#EAB308', plum: '#9333EA',
  coral: '#EF4444', forest: '#16A34A', slate: '#64748B', fuchsia: '#D946EF',
  terracotta: '#C2410C', navy: '#1E3A8A', lavender: '#A78BFA', charcoal: '#374151',
  butter: '#FDE68A', aqua: '#22D3EE',
};

// ---------- state ----------
const STORAGE_KEY = 'navii.recent';
let recent: string[] = [];
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) recent = JSON.parse(raw);
} catch (err) {
  console.warn('[navii] localStorage unavailable', err);
}

function persistRecent() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recent)); } catch { /* noop */ }
}

console.log('[navii] ui.ts loaded');

// ---------- offline awareness ----------
// `navigator.onLine` is best-effort (false negatives possible) but gives us a
// fast, library-free way to short-circuit and notify the user instead of
// failing silently when the avatar/license fetch would otherwise time out.
function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

function notifyHost(message: string, error = false) {
  parent.postMessage({ pluginMessage: { type: 'notify', message, error } }, '*');
}

function guardOnline(action: string): boolean {
  if (!isOffline()) return true;
  notifyHost(`You appear to be offline. ${action} needs a connection to api.navii.dev.`, true);
  return false;
}

const seedState = {
  seedPaletteId: '' as string, // '' = auto
  background: '' as '' | 'none' | 'solid' | 'ring',
  size: 96,
  // Style hint biases pack picks toward masc/femme/neutral (only takes effect
  // when at least one enabled pack declares styleHints).
  style: '' as '' | 'masc' | 'femme' | 'neutral',
  // Mood overrides seed-derived eyes + mouth with a curated pair conveying
  // an expression. '' (Auto) = leave seed-derived.
  mood: '' as '' | 'happy' | 'serious' | 'sleepy' | 'wink',
};

// ---------- style-hint persistence ----------
const STYLE_STORAGE_KEY = 'navii.style';
try {
  const raw = localStorage.getItem(STYLE_STORAGE_KEY);
  if (raw === 'masc' || raw === 'femme' || raw === 'neutral') {
    seedState.style = raw;
  }
} catch { /* noop */ }

function persistStyle() {
  try {
    if (seedState.style) localStorage.setItem(STYLE_STORAGE_KEY, seedState.style);
    else localStorage.removeItem(STYLE_STORAGE_KEY);
  } catch { /* noop */ }
}

// ---------- mood persistence ----------
const MOOD_STORAGE_KEY = 'navii.mood';
try {
  const raw = localStorage.getItem(MOOD_STORAGE_KEY);
  if (raw === 'happy' || raw === 'serious' || raw === 'sleepy' || raw === 'wink') {
    seedState.mood = raw;
  }
} catch { /* noop */ }

function persistMood() {
  try {
    if (seedState.mood) localStorage.setItem(MOOD_STORAGE_KEY, seedState.mood);
    else localStorage.removeItem(MOOD_STORAGE_KEY);
  } catch { /* noop */ }
}

const buildSpec: BuildSpec = {
  palette: 'indigo',
  body: 'orb',
  eyes: 'round',
  mouth: 'smile',
  antenna: 'none',
  accessory: 'none',
  topper: 'none',
};

let activeTab: 'seed' | 'build' | 'packs' | 'mascots' = 'seed';

// ---------- Mascot presets ----------
interface MascotPresetUI {
  id: string;
  name: string;
  mode: 'seed' | 'build';
  seed?: string;
  buildSpec?: BuildSpec;
  packs?: string[];
  style?: 'masc' | 'femme' | 'neutral';
  mood?: 'happy' | 'serious' | 'sleepy' | 'wink';
  paletteId?: string;
  background?: 'none' | 'solid' | 'ring';
  createdAt: number;
}
let presets: MascotPresetUI[] = [];

// ---------- Packs state ----------
const PACKS_STORAGE_KEY = 'navii.enabled-packs';
let enabledPackIds: Set<string> = new Set();
try {
  const raw = localStorage.getItem(PACKS_STORAGE_KEY);
  if (raw) enabledPackIds = new Set(JSON.parse(raw));
} catch { /* noop */ }

function persistEnabledPacks() {
  try {
    localStorage.setItem(PACKS_STORAGE_KEY, JSON.stringify([...enabledPackIds]));
  } catch { /* noop */ }
}

function isPackAvailable(pack: Pack): boolean {
  if (!pack.unlockDate) return true;
  return Date.now() >= new Date(pack.unlockDate).getTime();
}

function getEnabledPackIds(): string[] {
  // Even if a previously-enabled pack is now "coming soon", filter it out.
  return [...enabledPackIds].filter((id) => {
    const pack = BUILT_IN_PACKS.find((p) => p.id === id);
    return pack && isPackAvailable(pack);
  });
}

// ---------- DOM helpers ----------
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

function clear(el: HTMLElement) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function setSvgPreview(target: HTMLElement, svgString: string) {
  clear(target);
  const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  const svg = doc.documentElement;
  if (svg.tagName.toLowerCase() === 'svg') {
    target.appendChild(document.importNode(svg, true));
  }
}

function makeOption(value: string, label = value): HTMLOptionElement {
  const opt = document.createElement('option');
  opt.value = value;
  opt.textContent = label;
  return opt;
}

function fillSelect(el: HTMLSelectElement, ids: string[]) {
  clear(el);
  for (const id of ids) el.appendChild(makeOption(id));
}

// ---------- option getters ----------
function currentSeedOptions(): AvatarOptions {
  const opts: AvatarOptions = { size: seedState.size };
  if (seedState.background) opts.background = seedState.background;
  if (seedState.seedPaletteId === 'brand' && brandPalette) {
    opts.palette = brandPalette;
  } else if (seedState.seedPaletteId) {
    opts.paletteId = seedState.seedPaletteId;
  }
  const packs = getEnabledPackIds();
  if (packs.length > 0) {
    opts.packs = packs;
    // Style hint only meaningful when at least one pack active.
    if (seedState.style) opts.style = seedState.style;
  }
  // Mood applies regardless of packs — it overrides face features directly.
  if (seedState.mood) opts.mood = seedState.mood;
  return opts;
}

// ---------- rendering ----------
function renderSeedPreview() {
  const seed = $<HTMLInputElement>('seed-input').value || 'alice';
  setSvgPreview($('preview-seed'), createAvatar(seed, { ...currentSeedOptions(), animated: true }));
  updateUrlText();
}

/**
 * Compose AvatarOptions for the Build flow. When the user selects the brand
 * swatch in the Build palette grid, inject the brand Palette object via
 * `options.palette` — core's `build()` honors that as an override of
 * `spec.palette` (which is just a string id).
 */
function currentBuildOptions(size = 200, animated = true): AvatarOptions {
  const opts: AvatarOptions = { size };
  if (animated) opts.animated = true;
  if (buildSpec.palette === 'brand' && brandPalette && isPaid()) {
    opts.palette = brandPalette;
  }
  return opts;
}

function renderBuildPreview() {
  setSvgPreview($('preview-build'), buildAvatar(buildSpec, currentBuildOptions(200, true)));
}

function renderRecent() {
  const el = $('recent');
  clear(el);
  if (recent.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'recent-empty';
    empty.textContent = 'No recent yet. Insert one to see it here.';
    el.appendChild(empty);
    return;
  }
  for (const seed of recent) {
    const chip = document.createElement('button');
    chip.className = 'recent-chip';
    chip.title = seed;
    setSvgPreview(chip, createAvatar(seed, { size: 36 }));
    chip.addEventListener('click', () => {
      $<HTMLInputElement>('seed-input').value = seed;
      renderSeedPreview();
    });
    el.appendChild(chip);
  }
}

function renderSwatchGrid(
  containerId: string,
  selectedId: string,
  includeAuto: boolean,
  onPick: (id: string) => void,
) {
  const grid = $(containerId);
  clear(grid);
  if (includeAuto) {
    const sw = document.createElement('div');
    sw.className = 'swatch auto' + (selectedId === '' ? ' active' : '');
    sw.title = 'auto (seed-derived)';
    sw.addEventListener('click', () => onPick(''));
    grid.appendChild(sw);
  }
  for (const id of PALETTE_IDS) {
    const sw = document.createElement('div');
    sw.className = 'swatch' + (id === selectedId ? ' active' : '');
    sw.style.background = PALETTE_PREVIEW[id] || '#6366F1';
    sw.title = id;
    sw.addEventListener('click', () => onPick(id));
    grid.appendChild(sw);
  }
  // Brand swatch — only inline when Pro + brand set. Otherwise the explicit
  // "Brand palette" button below the grid handles the CTA (more pronounced
  // for free users + first-time Pro setup).
  if (brandPalette && isPaid()) {
    const brandSw = document.createElement('div');
    brandSw.className = 'swatch brand-set' + (selectedId === 'brand' ? ' active' : '');
    brandSw.style.background = `linear-gradient(135deg, ${brandPalette.bodyFrom}, ${brandPalette.bodyTo})`;
    brandSw.title = `Brand: ${brandPalette.name}`;
    brandSw.addEventListener('click', () => onPick('brand'));
    grid.appendChild(brandSw);
  }
}

function updateBrandUi() {
  const freeSec = document.getElementById('free-brand-section');
  const proBrandSec = document.getElementById('pro-brand-section');
  const proCustomSec = document.getElementById('pro-custom-section');
  if (!freeSec || !proBrandSec || !proCustomSec) return;
  if (isPaid()) {
    freeSec.style.display = 'none';
    proBrandSec.style.display = 'block';
    proCustomSec.style.display = 'block';
    fetchBrandColors();
    renderBrandSwatches();
  } else {
    freeSec.style.display = 'block';
    proBrandSec.style.display = 'none';
    proCustomSec.style.display = 'none';
  }
}

function renderSeedPalettes(opts: { skipBrand?: boolean } = {}) {
  renderSwatchGrid('palette-swatches', seedState.seedPaletteId, true, (id) => {
    seedState.seedPaletteId = id;
    renderSeedPalettes();
    renderSeedPreview();
  });
  if (!opts.skipBrand) updateBrandUi();
}

function renderBuildPalettes() {
  renderSwatchGrid('b-palette-swatches', buildSpec.palette ?? '', false, (id) => {
    buildSpec.palette = id;
    renderBuildPalettes();
    renderBuildPreview();
  });
}

// ---------- Build mode visual pickers ----------
type BuildPartKey = 'body' | 'eyes' | 'mouth' | 'antenna' | 'accessory' | 'topper';

const BUILD_PARTS: { key: BuildPartKey; label: string; ids: string[] }[] = [
  { key: 'body', label: 'Body', ids: BODY_IDS },
  { key: 'eyes', label: 'Eyes', ids: EYE_IDS },
  { key: 'mouth', label: 'Mouth', ids: MOUTH_IDS },
  { key: 'antenna', label: 'Antenna', ids: ANTENNA_IDS },
  { key: 'accessory', label: 'Accessory', ids: ACCESSORY_IDS },
  { key: 'topper', label: 'Topper', ids: TOPPER_IDS },
];

function renderBuildPickers() {
  const root = $('build-pickers');
  clear(root);
  for (const part of BUILD_PARTS) {
    const row = document.createElement('div');
    row.className = 'picker-row';

    const label = document.createElement('div');
    label.className = 'picker-row-label';
    const labelText = document.createElement('span');
    labelText.textContent = part.label;
    const valueText = document.createElement('span');
    valueText.className = 'picker-row-value';
    valueText.textContent = String((buildSpec as Record<string, unknown>)[part.key] ?? '—');
    label.appendChild(labelText);
    label.appendChild(valueText);
    row.appendChild(label);

    const strip = document.createElement('div');
    strip.className = 'picker-strip';

    const currentValue = (buildSpec as Record<string, unknown>)[part.key];

    for (const id of part.ids) {
      const thumb = document.createElement('button');
      thumb.className = 'picker-thumb' + (id === currentValue ? ' active' : '');
      thumb.title = id;
      // Render mini avatar with this part swapped in.
      const previewSpec = { ...buildSpec, [part.key]: id };
      setSvgPreview(thumb, buildAvatar(previewSpec, { size: 64 }));
      thumb.addEventListener('click', () => {
        (buildSpec as Record<string, unknown>)[part.key] = id;
        renderBuildPickers();
        renderBuildPreview();
      });
      strip.appendChild(thumb);
    }

    row.appendChild(strip);
    root.appendChild(row);
  }
}

// ---------- actions ----------
function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

function rollSeed() {
  $<HTMLInputElement>('seed-input').value = randomSeed();
  renderSeedPreview();
}

function pushRecent(seed: string) {
  recent = [seed, ...recent.filter((x) => x !== seed)].slice(0, 16);
  persistRecent();
  renderRecent();
}

// ---------- snippet generation ----------
const API_BASE = 'https://api.navii.dev';
// Checkout URL. Points at our own /checkout route (powered by @polar-sh/hono)
// which redirects to Polar with the product preselected. Lets us swap payment
// providers later without re-publishing the plugin.
const POLAR_PURCHASE_URL = `${API_BASE}/checkout`;

// ---------- Brand palette (Pro) ----------
//
// Pulls color variables from the user's Figma file → designer picks one →
// plugin derives a full palette around it (lighter shade for gradient top,
// dark ink for line work, soft blush, white accent).

interface BrandPalette {
  id: string;
  name: string;
  bodyFrom: string;
  bodyTo: string;
  accent: string;
  ink: string;
  blush: string;
}

let brandPalette: BrandPalette | null = null;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return {
    r: parseInt(v.slice(0, 2), 16) / 255,
    g: parseInt(v.slice(2, 4), 16) / 255,
    b: parseInt(v.slice(4, 6), 16) / 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  if (s === 0) return { r: l, g: l, b: l };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return { r: hue(h + 1 / 3), g: hue(h), b: hue(h - 1 / 3) };
}

function derivePalette(baseHex: string, name: string): BrandPalette {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);
  // bodyFrom = lighter sibling of bodyTo
  const lighter = hslToRgb(h, Math.max(0.4, s * 0.95), Math.min(0.78, l + 0.18));
  // ink = darkened complement (line work)
  const ink = hslToRgb(h, Math.min(0.5, s * 0.5), 0.18);
  // blush = warm pink (always — universal for cheeks)
  return {
    id: 'brand:' + Date.now().toString(36),
    name,
    bodyFrom: rgbToHex(lighter.r, lighter.g, lighter.b),
    bodyTo: baseHex.toUpperCase(),
    accent: '#FFFFFF',
    ink: rgbToHex(ink.r, ink.g, ink.b),
    blush: '#F9A8D4',
  };
}

const BRAND_STORAGE_KEY = 'navii.brand-palette';

function loadBrandPalette(): BrandPalette | null {
  try {
    const raw = localStorage.getItem(BRAND_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BrandPalette;
  } catch {
    return null;
  }
}

function persistBrandPalette(p: BrandPalette | null) {
  try {
    if (p) localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(p));
    else localStorage.removeItem(BRAND_STORAGE_KEY);
  } catch { /* noop */ }
}

// ---------- License state ----------
interface LicenseStatus {
  ok: boolean;
  plan?: 'pro';
  email?: string;
}
let licenseStatus: LicenseStatus = { ok: false };

function isPaid(): boolean {
  return licenseStatus.ok && licenseStatus.plan === 'pro';
}

function updateProPill() {
  const pill = document.getElementById('pro-pill');
  const label = document.getElementById('pro-pill-label');
  if (!pill || !label) return;
  if (isPaid()) {
    pill.classList.add('unlocked');
    pill.title = `Pro unlocked${licenseStatus.email ? ` (${licenseStatus.email})` : ''}. Click to view account / sign out.`;
    label.textContent = 'Pro';
  } else {
    pill.classList.remove('unlocked');
    pill.title = 'Unlock Navii Pro';
    label.textContent = 'Upgrade';
  }
  // Sync the upgrade-modal Pro footer too — visible only when Pro.
  const card = document.getElementById('upgrade-modal-card');
  const emailEl = document.getElementById('modal-pro-email');
  if (card) card.classList.toggle('is-pro', isPaid());
  if (emailEl) emailEl.textContent = licenseStatus.email ? `Signed in as ${licenseStatus.email}` : 'Pro license active on this device';
}

function openUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.classList.add('show');
  // Always open on the buy view — the key view is a deliberate next step.
  setUpgradeModalView('buy');
  // Populate cast w/ animated mini Naviis on open.
  const cast = document.getElementById('upgrade-cast');
  if (cast && cast.children.length === 0) {
    const seeds = ['aria', 'milo', 'nova', 'kai', 'sage'];
    for (const seed of seeds) {
      const tile = document.createElement('div');
      tile.className = 'cast-tile';
      setSvgPreview(tile, createAvatar(seed, { size: 44, animated: true }));
      cast.appendChild(tile);
    }
  }
  // Populate feature icons with mini avatars (replaces emoji glyphs). Each
  // <li data-seed="..."> gets a tiny seeded avatar so the row reads as Navii
  // itself rather than generic emoji art.
  const featureLis = Array.from(document.querySelectorAll<HTMLLIElement>('.upgrade-features li'));
  for (const li of featureLis) {
    const icon = li.querySelector<HTMLElement>('.upgrade-feat-icon');
    if (!icon || icon.firstChild) continue; // already populated
    const seed = li.getAttribute('data-seed') || 'navii';
    setSvgPreview(icon, createAvatar(seed, { size: 28 }));
  }
  // Reset carousel to slide 0 on each open.
  setUpgradeCarouselSlide(0);
}

let upgradeCarouselSlide = 0;
function setUpgradeCarouselSlide(idx: number) {
  upgradeCarouselSlide = idx;
  const slides = document.getElementById('upgrade-slides');
  if (slides) slides.style.transform = `translateX(${-idx * 100}%)`;
  const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('.upgrade-dot'));
  for (const d of dots) {
    const i = Number.parseInt(d.getAttribute('data-slide') ?? '0', 10);
    d.classList.toggle('active', i === idx);
  }
}

function closeUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.classList.remove('show');
  const status = document.getElementById('modal-status');
  if (status) { status.textContent = ''; status.className = 'modal-status'; }
  // Reset to buy view so next open starts clean.
  setUpgradeModalView('buy');
}

function setUpgradeModalView(view: 'buy' | 'key') {
  const card = document.getElementById('upgrade-modal-card');
  if (card) card.setAttribute('data-view', view);
  if (view === 'key') {
    const input = document.getElementById('modal-key-input') as HTMLInputElement | null;
    if (input) {
      // Defer focus past the layout swap.
      setTimeout(() => input.focus(), 60);
    }
  } else {
    const status = document.getElementById('modal-status');
    if (status) { status.textContent = ''; status.className = 'modal-status'; }
  }
}

function setLicenseStatus(s: LicenseStatus) {
  licenseStatus = s;
  updateProPill();
  // Re-render palettes + packs — locked states depend on Pro status.
  if (document.getElementById('palette-swatches')) {
    renderSeedPalettes();
    renderBuildPalettes();
  }
  if (document.getElementById('pack-grid')) {
    renderPackGrid();
  }
  if (s.ok) closeUpgradeModal();
}

interface VariableEntry {
  id: string;
  name: string;
  collection: string;
  hex: string;
  source?: 'variable' | 'style';
}

let brandColors: VariableEntry[] = [];
let brandColorsFetched = false;

function fetchBrandColors() {
  if (!isPaid() || brandColorsFetched) return;
  brandColorsFetched = true;
  parent.postMessage({ pluginMessage: { type: 'list-variables' } }, '*');
}

/**
 * Parse hex codes from arbitrary pasted text. Accepts `#ABC`, `#AABBCC`,
 * `AABBCC`, with any whitespace, commas, semicolons between them. Returns up
 * to `max` normalized uppercase `#RRGGBB` strings in source order.
 *
 * Uses String.replace callback (no matchAll → keeps es2019 lib happy).
 */
function parseHexes(text: string, max = 5): string[] {
  const out: string[] = [];
  text.replace(/#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, (_match, raw: string) => {
    if (out.length >= max) return _match;
    let h = raw;
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const norm = `#${h.toUpperCase()}`;
    if (!out.includes(norm)) out.push(norm);
    return _match;
  });
  return out;
}

/**
 * Build a brand palette from up to 5 hex codes pasted together.
 * Order: body (primary) · ink · accent · blush · (5th ignored). Missing
 * fields auto-derive from `body`.
 */
function deriveMultiHexPalette(hexes: string[], label: string): BrandPalette {
  const primary = hexes[0]!;
  const derived = derivePalette(primary, label);
  return {
    ...derived,
    ...(hexes[1] ? { ink: hexes[1] } : {}),
    ...(hexes[2] ? { accent: hexes[2] } : {}),
    ...(hexes[3] ? { blush: hexes[3] } : {}),
  };
}

function applyBrandFromMultiHex(text: string) {
  const hexes = parseHexes(text);
  const status = document.getElementById('brand-status');
  if (hexes.length === 0) {
    if (status) {
      status.textContent = 'No hex codes found. Try "#6366F1 #1E1B4B #FFFFFF".';
      status.className = 'modal-status err';
    }
    return;
  }
  const label = hexes.length === 1 ? hexes[0]! : `Custom (${hexes.length})`;
  brandPalette = deriveMultiHexPalette(hexes, label);
  persistBrandPalette(brandPalette);
  seedState.seedPaletteId = 'brand';
  renderSeedPalettes();
  renderBuildPalettes();
  renderSeedPreview();
  renderBuildPreview();
  if (status) {
    status.textContent = `Applied ${hexes.length} hex code${hexes.length === 1 ? '' : 's'}.`;
    status.className = 'modal-status ok';
  }
}

function applyBrandFromHex(hex: string, label: string) {
  brandPalette = derivePalette(hex, label);
  persistBrandPalette(brandPalette);
  seedState.seedPaletteId = 'brand';
  // DON'T rebuild brand groups (would collapse the user's expanded sections).
  // Surgically update active states on existing DOM instead.
  updateBrandActiveStates(hex);
  // Main palette grid still needs re-render so the previously-selected
  // base palette deactivates and the seed preview reflects the change.
  renderSeedPalettes({ skipBrand: true });
  renderBuildPalettes();
  renderSeedPreview();
  renderBuildPreview();
}

function updateBrandActiveStates(activeHex: string) {
  const root = document.getElementById('brand-groups');
  if (!root) return;
  root.querySelectorAll('.swatch').forEach((el) => {
    const sw = el as HTMLElement;
    const bg = sw.style.background.toUpperCase();
    // Inline background is the swatch's own hex; check via title which holds "(hex)".
    const titleMatch = sw.title.match(/\(#([0-9A-F]+)\)/i);
    const hex = titleMatch && titleMatch[1] ? `#${titleMatch[1].toUpperCase()}` : bg;
    sw.classList.toggle('active', hex === activeHex.toUpperCase());
  });
}

// Per-collection collapse state — persisted so the designer's choices stick.
// Special sentinel "*all*" means "everything starts collapsed" (used on first
// load when the user hasn't toggled anything yet).
const COLLAPSE_STORAGE_KEY = 'navii.brand-collapsed';
const COLLAPSE_INITIALIZED_KEY = 'navii.brand-collapsed-init';
let collapsedGroups: Set<string> = new Set();
let collapseInitialized = false;
try {
  const raw = localStorage.getItem(COLLAPSE_STORAGE_KEY);
  if (raw) collapsedGroups = new Set(JSON.parse(raw));
  collapseInitialized = localStorage.getItem(COLLAPSE_INITIALIZED_KEY) === 'true';
} catch { /* noop */ }

function persistCollapseState() {
  try {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify([...collapsedGroups]));
    localStorage.setItem(COLLAPSE_INITIALIZED_KEY, 'true');
    collapseInitialized = true;
  } catch { /* noop */ }
}

function groupBrandColors(colors: VariableEntry[]): Map<string, VariableEntry[]> {
  const groups = new Map<string, VariableEntry[]>();
  for (const c of colors) {
    const key = c.collection || 'Other';
    const list = groups.get(key) ?? [];
    list.push(c);
    groups.set(key, list);
  }
  return groups;
}

/**
 * Sub-group items by name prefix. Design system tokens are typically named
 * like `color/primary/500`, `color/neutral/100`. We split on the last `/` to
 * derive a sub-group key. Items without `/` go into "" (rendered flat).
 *
 * Returns:
 *   { ungrouped: [...], subs: Map<prefix, items> }
 * Only sub-groups with >1 prefix or when multiple prefixes are present.
 */
function subgroupByPrefix(items: VariableEntry[]): { ungrouped: VariableEntry[]; subs: Map<string, VariableEntry[]> } {
  const subs = new Map<string, VariableEntry[]>();
  const ungrouped: VariableEntry[] = [];
  for (const item of items) {
    const idx = item.name.lastIndexOf('/');
    if (idx <= 0) {
      ungrouped.push(item);
      continue;
    }
    const prefix = item.name.slice(0, idx);
    const list = subs.get(prefix) ?? [];
    list.push(item);
    subs.set(prefix, list);
  }
  // If only one sub-group exists and nothing ungrouped, flatten.
  if (subs.size <= 1 && ungrouped.length === 0) {
    return { ungrouped: items, subs: new Map() };
  }
  return { ungrouped, subs };
}

function renderBrandSwatches() {
  const root = document.getElementById('brand-groups');
  const empty = document.getElementById('brand-empty');
  const tag = document.getElementById('brand-count-tag');
  if (!root || !empty || !tag) return;
  clear(root);

  if (brandColors.length === 0) {
    empty.style.display = 'block';
    tag.textContent = '';
    return;
  }
  empty.style.display = 'none';
  tag.textContent = `${brandColors.length} color${brandColors.length === 1 ? '' : 's'}`;

  const groups = groupBrandColors(brandColors);
  const groupKeys = [...groups.keys()];

  // First-time render: collapse everything so designers w/ massive palettes
  // aren't hit with a wall of swatches. They expand sections they care about.
  if (!collapseInitialized) {
    for (const k of groupKeys) collapsedGroups.add(k);
    persistCollapseState();
  }

  for (const [name, items] of groups) {
    const group = document.createElement('div');
    group.className = 'brand-group' + (collapsedGroups.has(name) ? ' collapsed' : '');

    const header = document.createElement('button');
    header.className = 'brand-group-header';
    header.innerHTML = `
      <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="6 9 12 15 18 9"/></svg>
      <span class="brand-group-name"></span>
      <span class="brand-group-count"></span>
    `;
    (header.querySelector('.brand-group-name') as HTMLElement).textContent = name;
    (header.querySelector('.brand-group-count') as HTMLElement).textContent = `${items.length}`;
    header.addEventListener('click', () => {
      if (collapsedGroups.has(name)) collapsedGroups.delete(name);
      else collapsedGroups.add(name);
      persistCollapseState();
      group.classList.toggle('collapsed');
    });

    const body = document.createElement('div');
    body.className = 'brand-group-body';

    // Try splitting by token name prefix (color/primary/...). Falls back to
    // flat row if there's nothing to split on.
    const { ungrouped, subs } = subgroupByPrefix(items);

    function appendSwatchRow(parent: HTMLElement, list: VariableEntry[]) {
      const row = document.createElement('div');
      row.className = 'swatch-row';
      for (const c of list) {
        const sw = document.createElement('div');
        const active = brandPalette?.bodyTo === c.hex && seedState.seedPaletteId === 'brand';
        sw.className = 'swatch' + (active ? ' active' : '');
        sw.style.background = c.hex;
        sw.title = `${c.name} (${c.hex})`;
        sw.addEventListener('click', () => applyBrandFromHex(c.hex, c.name));
        row.appendChild(sw);
      }
      parent.appendChild(row);
    }

    if (subs.size === 0) {
      appendSwatchRow(body, ungrouped);
    } else {
      if (ungrouped.length > 0) {
        const wrap = document.createElement('div');
        wrap.className = 'brand-subgroup';
        const label = document.createElement('div');
        label.className = 'brand-subgroup-label';
        label.textContent = '(unprefixed)';
        wrap.appendChild(label);
        appendSwatchRow(wrap, ungrouped);
        body.appendChild(wrap);
      }
      // Stable, alphabetically-sorted sub-group order.
      const sortedPrefixes = [...subs.keys()].sort();
      for (const prefix of sortedPrefixes) {
        const wrap = document.createElement('div');
        wrap.className = 'brand-subgroup';
        const label = document.createElement('div');
        label.className = 'brand-subgroup-label';
        label.textContent = prefix;
        wrap.appendChild(label);
        appendSwatchRow(wrap, subs.get(prefix)!);
        body.appendChild(wrap);
      }
    }

    group.appendChild(header);
    group.appendChild(body);
    root.appendChild(group);
  }
}

function isValidHex(s: string): string | null {
  const trimmed = s.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    return '#' + trimmed.split('').map((c) => c + c).join('').toUpperCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return '#' + trimmed.toUpperCase();
  }
  return null;
}

function currentPreviewUrl(): string {
  const seed = $<HTMLInputElement>('seed-input').value.trim() || 'alice';
  const opts = currentSeedOptions();
  const parts: string[] = [];
  if (opts.size) parts.push(`size=${opts.size}`);
  if (opts.paletteId) parts.push(`palette=${encodeURIComponent(opts.paletteId)}`);
  if (typeof opts.background === 'string' && opts.background) parts.push(`background=${opts.background}`);
  const qs = parts.length ? '?' + parts.join('&') : '';
  return `${API_BASE}/avatar/${encodeURIComponent(seed)}${qs}`;
}

function buildSnippet(format: string): string {
  const url = currentPreviewUrl();
  const seed = $<HTMLInputElement>('seed-input').value.trim() || 'alice';
  switch (format) {
    case 'url':   return url;
    case 'html':  return `<img src="${url}" alt="Avatar" />`;
    case 'react': return `import { Navii } from '@usenavii/react';\n\n<Navii seed="${seed}" size={${seedState.size}} />`;
    case 'vue':   return `<img src="${url}" alt="Avatar" />`;
    case 'swift': return `let url = URL(string: "${url}")!`;
    case 'curl':  return `curl -o avatar.svg '${url}'`;
    default:      return url;
  }
}

function updateUrlText() {
  const sel = $<HTMLSelectElement>('snippet-select');
  if (!sel) return;
  $('url-text').textContent = buildSnippet(sel.value);
}

/**
 * Copy text to clipboard. Figma's plugin iframe blocks the async clipboard
 * API via Permissions Policy, so try it first then fall back to the legacy
 * textarea + execCommand("copy") trick which still works in sandboxed contexts.
 */
function copyText(text: string): boolean {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through to legacy */ }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '0';
  ta.style.left = '0';
  ta.style.opacity = '0';
  ta.style.pointerEvents = 'none';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch { /* noop */ }
  document.body.removeChild(ta);
  return ok;
}

function setActiveTab(tab: 'seed' | 'build' | 'packs' | 'mascots') {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', (t as HTMLElement).dataset.panel === tab);
  });
  document.querySelectorAll('.panel').forEach((p) => {
    p.classList.toggle('active', p.id === `panel-${tab}`);
  });
  const btn = $('primary-btn');
  const labels: Record<typeof activeTab, string> = {
    seed: 'Insert avatar',
    build: 'Insert custom',
    packs: 'Insert avatar',
    mascots: 'Insert avatar',
  };
  // Build button content as text + safe child node (avoid innerHTML XSS surface)
  clear(btn);
  btn.appendChild(document.createTextNode(labels[tab]));
  const kbd = document.createElement('span');
  kbd.className = 'kbd';
  kbd.textContent = '⌘↵';
  btn.appendChild(kbd);
  // Fill random only applies in Seed mode (Build mode = one specific spec).
  $('fill-random-btn').style.display = tab === 'seed' ? '' : 'none';
  $('url-bar').classList.remove('show');
  // Footer hidden on browsing tabs (Packs, Mascots) — they have their own
  // inline actions (Enable in pack-modal, card-click action modal in Mascots).
  // Seed + Build keep the footer because Insert is the primary CTA there.
  const footer = document.querySelector<HTMLElement>('.footer');
  if (footer) {
    const hide = tab === 'packs' || tab === 'mascots';
    footer.style.display = hide ? 'none' : '';
  }
  // Refresh panel content when entering its tab.
  if (tab === 'packs') renderPacksHero();
  if (tab === 'mascots') renderMascotGrid();
}

// ---------- Packs UI ----------
function renderPacksHero() {
  const preview = document.getElementById('preview-packs');
  if (!preview) return;
  const sampleSeed = $<HTMLInputElement>('seed-input').value || 'alice';
  const packs = getEnabledPackIds();
  const opts: AvatarOptions = { size: 280, animated: true };
  if (packs.length > 0) opts.packs = packs;
  setSvgPreview(preview, createAvatar(sampleSeed, opts));

  const row = document.getElementById('active-packs-row');
  if (row) {
    clear(row);
    if (packs.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'active-pack-empty';
      empty.textContent = 'None active.';
      row.appendChild(empty);
    } else {
      for (const id of packs) {
        const pack = BUILT_IN_PACKS.find((p) => p.id === id);
        if (!pack) continue;
        const chip = document.createElement('span');
        chip.className = 'active-pack-chip';
        const chipThumb = document.createElement('span');
        chipThumb.className = 'active-pack-thumb';
        setSvgPreview(chipThumb, createAvatar(pack.id, { size: 18, packs: [pack.id] }));
        const chipName = document.createElement('span');
        chipName.textContent = pack.name;
        chip.appendChild(chipThumb);
        chip.appendChild(chipName);
        const x = document.createElement('span');
        x.className = 'x';
        x.textContent = '×';
        x.title = 'Remove';
        x.addEventListener('click', () => togglePack(pack.id));
        chip.appendChild(x);
        row.appendChild(chip);
      }
    }
  }
}

function renderPackGrid() {
  // Renders the Packs tab right-pane as a grid of square tiles. Each tile is
  // a thumbnail + name. Clicking opens a modal where the user explicitly
  // enables/disables the pack after seeing sample avatars. Active state =
  // emerald ring + checkmark badge.
  const grid = document.getElementById('pack-grid');
  if (!grid) return;
  clear(grid);

  for (const pack of BUILT_IN_PACKS) {
    const available = isPackAvailable(pack);
    const active = enabledPackIds.has(pack.id);
    const locked = !isPaid();

    const tile = document.createElement('button');
    tile.className = 'pack-tile';
    if (active) tile.classList.add('active');
    if (locked) tile.classList.add('locked');
    if (!available) tile.classList.add('coming');

    // Coming-soon badge (top-left)
    if (!available) {
      const days = Math.max(0, Math.ceil((new Date(pack.unlockDate!).getTime() - Date.now()) / 86_400_000));
      const badge = document.createElement('span');
      badge.className = 'pack-tile-badge';
      badge.textContent = days === 0 ? 'Soon' : `${days}d`;
      tile.appendChild(badge);
    }

    // Active checkmark (top-right) — CSS hides unless .pack-tile.active
    const check = document.createElement('span');
    check.className = 'pack-tile-check';
    check.textContent = '✓';
    tile.appendChild(check);

    const thumb = document.createElement('div');
    thumb.className = 'pack-tile-thumb';
    setSvgPreview(thumb, createAvatar(pack.id, { size: 80, packs: [pack.id] }));
    tile.appendChild(thumb);

    const name = document.createElement('div');
    name.className = 'pack-tile-name';
    name.textContent = pack.name;
    // Inline avatar-count badge — sits right after the name so designers
    // see the combinatorial size at a glance without opening details.
    const countSpan = document.createElement('span');
    countSpan.className = 'pack-tile-count';
    countSpan.textContent = formatCount(countPackCombos(pack));
    countSpan.title = `${countPackCombos(pack).toLocaleString('en-US')} unique avatars`;
    name.appendChild(document.createTextNode(' '));
    name.appendChild(countSpan);
    tile.appendChild(name);

    // Always open the details modal on click — even for locked (free) users.
    // We want free users to SEE what they're missing (samples, count, style
    // hints). The paywall fires only when they actually try to enable.
    tile.addEventListener('click', () => {
      if (!available) return; // 'coming soon' packs stay inert
      openPackModal(pack);
    });

    grid.appendChild(tile);
  }
}

/**
 * Opens a detail modal for a pack. Shows pack hero + description, six sample
 * avatars rendered with this pack enabled, an optional style-hint pill row,
 * and an Enable/Disable button. The user explicitly confirms the pack toggle
 * — no surprise activation from clicking the tile.
 */
/**
 * Combinatorial count of distinct avatars a pack can produce.
 * Multiplies the unique picks per slot. Falls back to base pool size for
 * any slot the pack doesn't constrain. Outfit defaults to 1 (just 'none')
 * when undeclared, since base avatars don't draw outfits from seed.
 */
function countPackCombos(pack: Pack): number {
  const uniq = <T,>(arr: readonly T[] | undefined): number =>
    arr ? new Set(arr).size : 0;
  const palettes = pack.palettes?.length ?? 0;
  const body = uniq(pack.picks?.body) || BODY_IDS.length;
  const eyes = uniq(pack.picks?.eyes) || EYE_IDS.length;
  const mouth = uniq(pack.picks?.mouth) || MOUTH_IDS.length;
  const antenna = uniq(pack.picks?.antenna) || ANTENNA_IDS.length;
  const accessory = uniq(pack.picks?.accessory) || ACCESSORY_IDS.length;
  const topper = uniq(pack.picks?.topper) || TOPPER_IDS.length;
  // Base palettes still apply when not exclusive.
  const palettePool = pack.paletteExclusive ? palettes : palettes + PALETTE_IDS.length;
  // Background defaults to ['none','solid','ring'] = 3.
  const background = uniq(pack.picks?.background) || 3;
  // Outfit defaults to just 'none' when pack doesn't declare it (base seeds
  // never wear outfits — they're a builder-only opt-in).
  const outfit = uniq(pack.picks?.outfit) || 1;
  return palettePool * body * eyes * mouth * antenna * accessory * topper * background * outfit;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toLocaleString('en-US');
}

function openPackModal(pack: Pack) {
  const overlay = document.getElementById('pack-modal');
  const card = document.getElementById('pack-modal-card');
  if (!overlay || !card) return;
  clear(card);

  // --- Head: hero + name + desc ---
  const head = document.createElement('div');
  head.className = 'pack-modal-head';

  const hero = document.createElement('div');
  hero.className = 'pack-modal-hero';
  setSvgPreview(hero, createAvatar(pack.id, { size: 56, packs: [pack.id] }));
  head.appendChild(hero);

  const titles = document.createElement('div');
  titles.className = 'pack-modal-titles';
  const name = document.createElement('div');
  name.className = 'pack-modal-name';
  name.textContent = pack.name;
  const desc = document.createElement('div');
  desc.className = 'pack-modal-desc';
  desc.textContent = pack.description;
  const count = document.createElement('div');
  count.className = 'pack-modal-count';
  count.textContent = `${formatCount(countPackCombos(pack))} unique avatars`;
  count.title = 'Distinct combinations of palette × body × face × topper × outfit (within this pack\'s pool).';
  titles.appendChild(name);
  titles.appendChild(desc);
  titles.appendChild(count);
  head.appendChild(titles);
  card.appendChild(head);

  // --- Twelve sample avatars (2 rows × 6) — broader variety than 6 ---
  const samples = document.createElement('div');
  samples.className = 'pack-modal-samples';
  const sampleSeeds = [
    'ari', 'milo', 'nova', 'kai', 'sage', 'eden',
    'luna', 'rio', 'wren', 'pip', 'zane', 'iris',
  ];
  for (const seed of sampleSeeds) {
    const cell = document.createElement('div');
    cell.className = 'pack-modal-sample';
    const opts: AvatarOptions = { size: 48, packs: [pack.id] };
    if (seedState.style) opts.style = seedState.style;
    setSvgPreview(cell, createAvatar(seed, opts));
    samples.appendChild(cell);
  }
  card.appendChild(samples);

  // --- Style hints row (only when pack declares styleHints) ---
  if (pack.styleHints) {
    // Divider above the style row so the section reads as a separate group
    const divider = document.createElement('hr');
    divider.className = 'pack-modal-divider';
    card.appendChild(divider);
    const styleRow = document.createElement('div');
    styleRow.className = 'pack-modal-style-row';
    const label = document.createElement('span');
    label.className = 'pack-modal-style-label';
    label.textContent = 'Style';
    styleRow.appendChild(label);
    const styles: Array<{ val: '' | 'masc' | 'femme' | 'neutral'; label: string }> = [
      { val: '',        label: 'Auto' },
      { val: 'masc',    label: 'Masc' },
      { val: 'femme',   label: 'Femme' },
      { val: 'neutral', label: 'Neutral' },
    ];
    for (const s of styles) {
      const pill = document.createElement('div');
      pill.className = 'style-pill';
      if (s.val === seedState.style) pill.classList.add('active');
      pill.textContent = s.label;
      pill.addEventListener('click', () => {
        setStyleHint(s.val);
        // Re-open modal so pills + sample avatars reflect the new hint.
        openPackModal(pack);
      });
      styleRow.appendChild(pill);
    }
    card.appendChild(styleRow);
  }

  // --- Actions: Close + Enable/Disable ---
  const actions = document.createElement('div');
  actions.className = 'pack-modal-actions';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'pack-modal-close';
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', () => closePackModal());
  actions.appendChild(closeBtn);

  const toggleBtn = document.createElement('button');
  const isActive = enabledPackIds.has(pack.id);
  const locked = !isPaid();
  toggleBtn.className = `pack-modal-toggle ${isActive ? 'disable' : 'enable'}`;
  if (locked && !isActive) toggleBtn.classList.add('locked');
  // Label hints at the paywall for free users so the click is informed.
  toggleBtn.textContent = isActive
    ? 'Disable pack'
    : locked
    ? 'Unlock with Pro'
    : 'Enable pack';
  toggleBtn.addEventListener('click', () => {
    if (locked && !isActive) {
      closePackModal();
      openUpgradeModal();
      return;
    }
    togglePack(pack.id);
    closePackModal();
  });
  actions.appendChild(toggleBtn);

  card.appendChild(actions);

  overlay.classList.add('show');
}

function closePackModal() {
  const overlay = document.getElementById('pack-modal');
  if (!overlay) return;
  overlay.classList.remove('show');
  const card = document.getElementById('pack-modal-card');
  if (card) clear(card);
}

function togglePack(id: string) {
  if (enabledPackIds.has(id)) enabledPackIds.delete(id);
  else enabledPackIds.add(id);
  persistEnabledPacks();
  renderPackGrid();
  renderPacksHero();
  renderSeedPreview();
}

function setStyleHint(value: '' | 'masc' | 'femme' | 'neutral') {
  seedState.style = value;
  persistStyle();
  // Re-render pack grid so each active pack's pill row reflects the new
  // global style hint.
  renderPackGrid();
  renderPacksHero();
  renderSeedPreview();
}

// ---------- Mood pill row ----------
function setMood(value: '' | 'happy' | 'serious' | 'sleepy' | 'wink') {
  seedState.mood = value;
  persistMood();
  renderMoodRow();
  renderSeedPreview();
  renderPacksHero();
}

function renderMoodRow() {
  const row = document.getElementById('mood-row');
  if (!row) return;
  const pills = Array.from(row.querySelectorAll<HTMLDivElement>('.style-pill'));
  for (const pill of pills) {
    const val = pill.getAttribute('data-mood') ?? '';
    pill.classList.toggle('active', val === seedState.mood);
  }
}

function bindMoodHandlers() {
  const row = document.getElementById('mood-row');
  if (!row) return;
  const pills = Array.from(row.querySelectorAll<HTMLDivElement>('.style-pill'));
  for (const pill of pills) {
    pill.addEventListener('click', () => {
      const val = (pill.getAttribute('data-mood') ?? '') as
        | '' | 'happy' | 'serious' | 'sleepy' | 'wink';
      setMood(val);
    });
  }
}

function doPrimary() {
  if (activeTab === 'seed' || activeTab === 'packs' || activeTab === 'mascots') {
    // Mascots/Packs tabs reuse the seed flow — primary inserts the current seed.
    const seed = $<HTMLInputElement>('seed-input').value.trim();
    if (!seed) return;
    if (!guardOnline('Inserting a Navii')) return;
    pushRecent(seed);
    parent.postMessage({ pluginMessage: { type: 'insert', seed, options: currentSeedOptions() } }, '*');
  } else {
    // Build mode primary — main thread decides insert vs fill based on selection.
    void doBuildPrimary();
  }
}

// ---------- Mascot presets UI ----------
function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Figma sandbox sometimes lacks crypto.randomUUID — fall back to time + rand
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function requestPresets() {
  parent.postMessage({ pluginMessage: { type: 'preset-list' } }, '*');
}

function captureCurrentAvatar(name: string): MascotPresetUI {
  const id = uuid();
  const createdAt = Date.now();
  const enabledPacks = getEnabledPackIds();
  if (activeTab === 'build') {
    return {
      id, name, mode: 'build',
      buildSpec: { ...buildSpec },
      ...(enabledPacks.length > 0 ? { packs: enabledPacks } : {}),
      ...(seedState.style ? { style: seedState.style } : {}),
      createdAt,
    };
  }
  // Default: seed mode capture (Seed / Packs / Mascots tabs all use seed input)
  const seed = $<HTMLInputElement>('seed-input').value.trim() || 'alice';
  return {
    id, name, mode: 'seed',
    seed,
    ...(enabledPacks.length > 0 ? { packs: enabledPacks } : {}),
    ...(seedState.style ? { style: seedState.style } : {}),
    ...(seedState.mood ? { mood: seedState.mood } : {}),
    ...(seedState.seedPaletteId && seedState.seedPaletteId !== 'brand'
      ? { paletteId: seedState.seedPaletteId } : {}),
    ...(seedState.background ? { background: seedState.background } : {}),
    createdAt,
  };
}

function renderMascotPreviewSvg(p: MascotPresetUI): string {
  if (p.mode === 'build' && p.buildSpec) {
    return buildAvatar(p.buildSpec, { size: 96 });
  }
  const seed = p.seed || 'alice';
  const opts: AvatarOptions = { size: 96 };
  if (p.packs && p.packs.length > 0) opts.packs = p.packs;
  if (p.style) opts.style = p.style;
  if (p.mood) opts.mood = p.mood;
  if (p.paletteId) opts.paletteId = p.paletteId;
  if (p.background) opts.background = p.background;
  return createAvatar(seed, opts);
}

function renderMascotGrid() {
  const grid = document.getElementById('mascot-grid');
  if (!grid) return;
  clear(grid);
  if (presets.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'mascot-empty';
    empty.textContent = 'No mascots yet. Configure an avatar in Seed or Build, name it on the left, then click Save.';
    grid.appendChild(empty);
    return;
  }
  for (const p of presets) {
    const card = document.createElement('div');
    card.className = 'mascot-card';
    card.title = `${p.name} · ${p.mode}`;

    const thumb = document.createElement('div');
    thumb.className = 'mascot-card-thumb';
    setSvgPreview(thumb, renderMascotPreviewSvg(p));
    card.appendChild(thumb);

    const name = document.createElement('div');
    name.className = 'mascot-card-name';
    name.textContent = p.name;
    card.appendChild(name);

    const meta = document.createElement('div');
    meta.className = 'mascot-card-meta';
    meta.textContent = p.mode;
    card.appendChild(meta);

    const del = document.createElement('button');
    del.className = 'mascot-card-del';
    del.title = 'Delete';
    del.textContent = '×';
    del.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (!confirm(`Delete mascot "${p.name}"?`)) return;
      parent.postMessage({ pluginMessage: { type: 'preset-delete', id: p.id } }, '*');
    });
    card.appendChild(del);

    card.addEventListener('click', () => openMascotActionModal(p));
    grid.appendChild(card);
  }
}

// ---------- Mascot action modal (Insert / Fill / Edit / Delete) ----------
let actionTarget: MascotPresetUI | null = null;

function openMascotActionModal(p: MascotPresetUI) {
  actionTarget = p;
  const overlay = document.getElementById('mascot-action-modal');
  if (!overlay) return;
  const thumb = document.getElementById('mascot-action-thumb');
  if (thumb) setSvgPreview(thumb, renderMascotPreviewSvg(p));
  const nameEl = document.getElementById('mascot-action-name');
  if (nameEl) nameEl.textContent = p.name;
  const modeEl = document.getElementById('mascot-action-mode');
  if (modeEl) modeEl.textContent = `${p.mode} mode` + (p.packs?.length ? ` · ${p.packs.length} pack${p.packs.length === 1 ? '' : 's'}` : '');
  overlay.classList.add('show');
}

function closeMascotActionModal() {
  const overlay = document.getElementById('mascot-action-modal');
  if (overlay) overlay.classList.remove('show');
  actionTarget = null;
}

function handleMascotAction(action: 'insert' | 'fill' | 'edit' | 'delete') {
  const p = actionTarget;
  if (!p) return;
  if (action === 'delete') {
    if (!confirm(`Delete mascot "${p.name}"?`)) return;
    parent.postMessage({ pluginMessage: { type: 'preset-delete', id: p.id } }, '*');
    closeMascotActionModal();
    return;
  }
  if (action === 'edit') {
    closeMascotActionModal();
    editMascot(p);
    return;
  }
  if (action === 'insert' || action === 'fill') {
    if (!guardOnline('Inserting a Navii')) return;
    insertMascot(p, action);
    closeMascotActionModal();
    return;
  }
}

/**
 * Insert/fill a mascot. For seed presets, sends a regular `insert` msg with
 * captured options. For build presets, renders SVG locally + posts an
 * `insert-build` msg so the main thread can image-fill (PNG) or place node.
 */
function insertMascot(p: MascotPresetUI, force: 'insert' | 'fill') {
  if (p.mode === 'build' && p.buildSpec) {
    void doBuildInsertFromPreset(p, force);
    return;
  }
  // Seed mode — reconstruct options from preset fields.
  const seed = p.seed || 'alice';
  const opts: AvatarOptions = { size: 96 };
  if (p.packs && p.packs.length > 0) opts.packs = p.packs;
  if (p.style) opts.style = p.style;
  if (p.mood) opts.mood = p.mood;
  if (p.paletteId) opts.paletteId = p.paletteId;
  if (p.background) opts.background = p.background;
  pushRecent(seed);
  parent.postMessage({
    pluginMessage: { type: 'insert', seed, options: opts, force },
  }, '*');
}

async function doBuildInsertFromPreset(p: MascotPresetUI, force: 'insert' | 'fill') {
  if (!p.buildSpec) return;
  const opts = currentBuildOptionsFromSpec(p.buildSpec, p);
  const svg = buildAvatar(p.buildSpec, { ...opts, size: 200 });
  const svgLarge = buildAvatar(p.buildSpec, { ...opts, size: 512 });
  let bytes: Uint8Array | undefined;
  try {
    bytes = await rasterizeSvgToPng(svgLarge, 512);
  } catch (err) {
    console.error('[navii] rasterize failed', err);
  }
  parent.postMessage({
    pluginMessage: {
      type: 'insert-build',
      spec: p.buildSpec,
      options: { ...opts, size: 200 },
      svg, bytes, force,
    },
  }, '*');
}

function currentBuildOptionsFromSpec(_spec: BuildSpec, _preset: MascotPresetUI): AvatarOptions {
  // Build presets don't currently capture brand palette — keep simple.
  return { size: 200 };
}

/**
 * Edit a preset — materializes the spec (running selectAvatar for seed
 * presets) and loads into Build tab's manual pickers.
 */
function editMascot(p: MascotPresetUI) {
  let spec: BuildSpec;
  if (p.mode === 'build' && p.buildSpec) {
    spec = { ...p.buildSpec };
  } else {
    // Seed preset → run selectAvatar to derive the exact parts that seed
    // produces under the preset's options, then map to BuildSpec.
    const seed = p.seed || 'alice';
    const opts: AvatarOptions = {};
    if (p.packs && p.packs.length > 0) opts.packs = p.packs;
    if (p.style) opts.style = p.style;
    if (p.mood) opts.mood = p.mood;
    if (p.paletteId) opts.paletteId = p.paletteId;
    if (p.background) opts.background = p.background;
    const a = selectAvatar(seed, opts);
    spec = {
      palette: a.palette.id,
      body: a.body,
      eyes: a.eyes,
      mouth: a.mouth,
      antenna: a.antenna,
      accessory: a.accessory,
      background: a.background,
      topper: a.topper,
      outfit: a.outfit,
      hueShift: a.hueShift,
      bodyScale: a.bodyScale,
      eyeGapShift: a.eyeGapShift,
      mouthCurveScale: a.mouthCurveScale,
      antennaTilt: a.antennaTilt,
    };
  }
  Object.assign(buildSpec, spec);
  renderBuildPalettes();
  renderBuildPickers();
  renderBuildPreview();
  setActiveTab('build');
  notifyHost(`Editing "${p.name}" — changes won't overwrite the saved mascot`);
}

function bindMascotActionModalHandlers() {
  document.getElementById('mascot-action-close')?.addEventListener('click', closeMascotActionModal);
  document.getElementById('mascot-action-modal')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'mascot-action-modal') closeMascotActionModal();
  });
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('#mascot-action-modal .action-btn'),
  );
  for (const btn of buttons) {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action') as
        'insert' | 'fill' | 'edit' | 'delete' | null;
      if (action) handleMascotAction(action);
    });
  }
}

function loadMascot(p: MascotPresetUI) {
  if (p.mode === 'build' && p.buildSpec) {
    Object.assign(buildSpec, p.buildSpec);
    if (p.style) {
      seedState.style = p.style;
      persistStyle();
    }
    if (p.packs) {
      enabledPackIds = new Set(p.packs);
      persistEnabledPacks();
      renderPackGrid();
      renderPacksHero();
    }
    renderBuildPickers();
    renderBuildPreview();
    setActiveTab('build');
    notifyHost(`Loaded "${p.name}"`);
    return;
  }
  // seed mode
  if (p.seed) $<HTMLInputElement>('seed-input').value = p.seed;
  if (p.paletteId !== undefined) seedState.seedPaletteId = p.paletteId;
  else seedState.seedPaletteId = '';
  if (p.background !== undefined) seedState.background = p.background;
  else seedState.background = '';
  if (p.style) {
    seedState.style = p.style;
    persistStyle();
  } else {
    seedState.style = '';
    persistStyle();
  }
  if (p.mood) {
    seedState.mood = p.mood;
    persistMood();
  } else {
    seedState.mood = '';
    persistMood();
  }
  enabledPackIds = new Set(p.packs ?? []);
  persistEnabledPacks();
  renderSeedPalettes();
  renderPackGrid();
  renderPacksHero();
  renderMoodRow();
  renderSeedPreview();
  setActiveTab('seed');
  notifyHost(`Loaded "${p.name}"`);
}

// ---------- Save mascot modal ----------
//
// Opened from "+ Add to library" link in Seed / Build (and from the Mascots
// tab's primary button). Asks for a name + shows a live thumbnail of the
// avatar currently configured in the active tab. Pro-only — non-Pro click
// opens the upgrade modal instead.

function openSaveMascotModal() {
  if (!isPaid()) {
    openUpgradeModal();
    return;
  }
  const overlay = document.getElementById('save-mascot-modal');
  if (!overlay) return;
  // Render live thumbnail using whichever tab the user is in.
  const thumb = document.getElementById('save-mascot-thumb');
  if (thumb) {
    if (activeTab === 'build') {
      setSvgPreview(thumb, buildAvatar(buildSpec, currentBuildOptions(96, false)));
    } else {
      const seed = $<HTMLInputElement>('seed-input').value.trim() || 'alice';
      setSvgPreview(thumb, createAvatar(seed, { ...currentSeedOptions(), size: 96 }));
    }
  }
  const input = document.getElementById('save-mascot-name') as HTMLInputElement | null;
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 50);
  }
  const status = document.getElementById('save-mascot-status');
  if (status) { status.textContent = ''; status.className = 'save-mascot-status'; }
  overlay.classList.add('show');
}

function closeSaveMascotModal() {
  const overlay = document.getElementById('save-mascot-modal');
  if (overlay) overlay.classList.remove('show');
}

function submitSaveMascotModal() {
  const input = document.getElementById('save-mascot-name') as HTMLInputElement | null;
  const status = document.getElementById('save-mascot-status');
  const name = (input?.value ?? '').trim();
  if (!name) {
    if (status) {
      status.textContent = 'Name required.';
      status.className = 'save-mascot-status err';
    }
    input?.focus();
    return;
  }
  if (!isPaid()) {
    closeSaveMascotModal();
    openUpgradeModal();
    return;
  }
  const preset = captureCurrentAvatar(name);
  parent.postMessage({ pluginMessage: { type: 'preset-save', preset } }, '*');
  closeSaveMascotModal();
  notifyHost(`Saved "${name}" to library`);
}

function bindMascotHandlers() {
  // "+ Add to library" links from Seed / Build / Mascots tab.
  const triggers = ['seed-add-to-library', 'build-add-to-library', 'mascot-add-from-tab'];
  for (const id of triggers) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', openSaveMascotModal);
  }
  // Modal close handlers — × button, Cancel, backdrop click, Esc key.
  document.getElementById('save-mascot-close')?.addEventListener('click', closeSaveMascotModal);
  document.getElementById('save-mascot-cancel')?.addEventListener('click', closeSaveMascotModal);
  document.getElementById('save-mascot-modal')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'save-mascot-modal') closeSaveMascotModal();
  });
  document.getElementById('save-mascot-submit')?.addEventListener('click', submitSaveMascotModal);
  const input = document.getElementById('save-mascot-name') as HTMLInputElement | null;
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitSaveMascotModal();
    if (e.key === 'Escape') closeSaveMascotModal();
  });
}

// ---------- Daily usage chip ----------
function renderUsageChip(u: { count: number; limit: number; pro: boolean }) {
  const chip = document.getElementById('usage-chip');
  const txt = document.getElementById('usage-chip-text');
  if (!chip || !txt) return;
  chip.classList.remove('low', 'out', 'pro');
  if (u.pro) {
    chip.classList.add('pro');
    txt.textContent = 'Pro · Unlimited';
    chip.title = 'Pro license active — no daily limit.';
    chip.onclick = null;
    return;
  }
  const left = Math.max(0, u.limit - u.count);
  txt.textContent = left === 0 ? `Daily limit reached` : `${left} of ${u.limit} left today`;
  chip.title = left === 0
    ? 'Daily insert budget used. Upgrade to Pro for unlimited inserts.'
    : `Free tier: ${u.limit} inserts per day. Upgrade to Pro for unlimited.`;
  if (left === 0) {
    chip.classList.add('out');
    chip.onclick = () => openUpgradeModal();
  } else {
    if (left <= 3) chip.classList.add('low');
    chip.onclick = null;
  }
}

function requestUsage() {
  parent.postMessage({ pluginMessage: { type: 'usage-get' } }, '*');
}

// Build mode primary: rasterize PNG up-front so main thread can either fill
// the current selection or place a new SVG node depending on what's selected.
async function doBuildPrimary() {
  const svg = buildAvatar(buildSpec, currentBuildOptions(200, false));
  const svgLarge = buildAvatar(buildSpec, currentBuildOptions(512, false));
  let bytes: Uint8Array | undefined;
  try {
    bytes = await rasterizeSvgToPng(svgLarge, 512);
  } catch (err) {
    console.error('[navii] rasterize failed', err);
  }
  // Pre-rasterized SVG + PNG are sent to main thread; carry the same options
  // so the inserted node's `naviiOptions` plugin data reflects the brand
  // palette in use. Main thread itself can't reconstruct the palette object
  // (it doesn't share UI's brand state), so we rely on what UI sends.
  parent.postMessage({
    pluginMessage: { type: 'insert-build', spec: buildSpec, options: currentBuildOptions(200, false), svg, bytes },
  }, '*');
}

// Rasterize an SVG string to PNG bytes via canvas. Needed for Fill in Build
// mode since the API has no /build endpoint — we render core's SVG, raster,
// and ship bytes to the main thread for figma.createImage().
async function rasterizeSvgToPng(svgString: string, size: number): Promise<Uint8Array> {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('SVG load failed'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');
    ctx.drawImage(img, 0, 0, size, size);
    const pngBlob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
    });
    const ab = await pngBlob.arrayBuffer();
    return new Uint8Array(ab);
  } finally {
    URL.revokeObjectURL(url);
  }
}


// ---------- init ----------
function init() {
  // Tabs
  document.querySelectorAll('.tab').forEach((t) => {
    t.addEventListener('click', () => {
      const panel = (t as HTMLElement).dataset.panel as 'seed' | 'build';
      setActiveTab(panel);
    });
  });

  // Seed panel
  $<HTMLInputElement>('seed-input').addEventListener('input', renderSeedPreview);
  $('roll-btn').addEventListener('click', rollSeed);
  $('prev-btn').addEventListener('click', rollSeed);
  $('next-btn').addEventListener('click', rollSeed);

  // Background segmented control
  document.querySelectorAll('#bg-seg .seg-opt').forEach((opt) => {
    opt.addEventListener('click', () => {
      const bg = (opt as HTMLElement).dataset.bg as '' | 'none' | 'solid' | 'ring';
      seedState.background = bg;
      document.querySelectorAll('#bg-seg .seg-opt').forEach((o) => o.classList.toggle('active', o === opt));
      renderSeedPreview();
    });
  });

  // Size slider
  const slider = $<HTMLInputElement>('size-slider');
  slider.addEventListener('input', () => {
    seedState.size = parseInt(slider.value, 10) || 96;
    $('size-val').textContent = `${seedState.size}px`;
    renderSeedPreview();
  });

  // Snippet picker
  $<HTMLSelectElement>('snippet-select').addEventListener('change', updateUrlText);
  $('url-copy').addEventListener('click', () => {
    const text = buildSnippet($<HTMLSelectElement>('snippet-select').value);
    const btn = $('url-copy');
    const orig = btn.innerHTML;
    const ok = copyText(text);
    btn.textContent = ok ? '✓' : '×';
    setTimeout(() => { btn.innerHTML = orig; }, 1000);
  });

  // Primary + Fill random buttons
  $('primary-btn').addEventListener('click', doPrimary);
  $('fill-random-btn').addEventListener('click', () => {
    if (!guardOnline('Filling random avatars')) return;
    const opts: AvatarOptions = {};
    if (seedState.seedPaletteId) opts.paletteId = seedState.seedPaletteId;
    if (seedState.background) opts.background = seedState.background;
    parent.postMessage({ pluginMessage: { type: 'fill-random', options: opts } }, '*');
  });

  // Cmd/Ctrl+Enter shortcut — submit primary action without leaving keyboard
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      doPrimary();
    }
  });

  // Incoming messages from main thread
  window.addEventListener('message', (e) => {
    const msg = e.data?.pluginMessage;
    if (!msg) return;
    if (msg.type === 'variables-list') {
      brandColors = (msg.variables as VariableEntry[]) || [];
      renderBrandSwatches();
    }
    if (msg.type === 'license-status') {
      setLicenseStatus(msg.license || { ok: false });
      const status = document.getElementById('modal-status');
      if (status) {
        if (msg.license?.ok) {
          status.textContent = 'Verified. Pro unlocked.';
          status.className = 'modal-status ok';
        } else if (status.textContent === 'Verifying…') {
          status.textContent = 'Key invalid or already used.';
          status.className = 'modal-status err';
        }
      }
    }
    if (msg.type === 'presets') {
      presets = (msg.presets as MascotPresetUI[]) || [];
      renderMascotGrid();
    }
    if (msg.type === 'usage' || msg.type === 'usage-blocked') {
      const u = msg.usage as { count: number; limit: number; pro: boolean };
      renderUsageChip(u);
      if (msg.type === 'usage-blocked') openUpgradeModal();
    }
    if (msg.type === 'onboarding-status') {
      handleOnboardingStatus(msg.seen === true);
    }
  });

  // Pro pill + upgrade modal wiring
  $('pro-pill').addEventListener('click', () => {
    // Free users get the buy flow. Pro users get the modal too, but it shows
    // their email + Sign out button (so they can flip to free-mode for testing).
    openUpgradeModal();
  });
  // Sign out — clears cached license + flips UI to free-tier mode.
  document.getElementById('modal-sign-out')?.addEventListener('click', () => {
    if (!confirm('Sign out of Pro? Your license key is preserved on Polar — you can re-verify any time.')) return;
    parent.postMessage({ pluginMessage: { type: 'license-clear' } }, '*');
    closeUpgradeModal();
  });
  $('modal-close').addEventListener('click', closeUpgradeModal);
  document.getElementById('upgrade-modal')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'upgrade-modal') closeUpgradeModal();
  });
  // Pack-detail modal: dismiss when clicking the overlay outside the card.
  document.getElementById('pack-modal')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'pack-modal') closePackModal();
  });
  // Esc also dismisses any open modal-overlay (defensive — handled by browser
  // for most form fields but not the pack-modal which has no inputs).
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePackModal();
  });
  $('modal-buy').addEventListener('click', () => {
    window.open(POLAR_PURCHASE_URL, '_blank');
  });
  $('modal-have-key').addEventListener('click', () => {
    setUpgradeModalView('key');
  });
  // Carousel navigation — delegated handler on the slides wrapper.
  // Catches clicks on dots (data-slide) + Next/Back buttons (data-target-slide).
  const slidesHost = document.getElementById('upgrade-slides');
  if (slidesHost) {
    slidesHost.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const dot = target.closest('.upgrade-dot');
      if (dot) {
        const idx = Number.parseInt(dot.getAttribute('data-slide') ?? '0', 10);
        setUpgradeCarouselSlide(idx);
        return;
      }
      const nav = target.closest<HTMLElement>('[data-target-slide]');
      if (nav) {
        const idx = Number.parseInt(nav.getAttribute('data-target-slide') ?? '0', 10);
        setUpgradeCarouselSlide(idx);
      }
    });
  }
  // Left/Right arrows step the carousel when modal is open + on buy view
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('upgrade-modal');
    const card = document.getElementById('upgrade-modal-card');
    if (!modal || !modal.classList.contains('show')) return;
    if (card?.getAttribute('data-view') !== 'buy') return;
    if (e.key === 'ArrowRight') setUpgradeCarouselSlide(Math.min(1, upgradeCarouselSlide + 1));
    else if (e.key === 'ArrowLeft') setUpgradeCarouselSlide(Math.max(0, upgradeCarouselSlide - 1));
  });
  $('modal-key-back').addEventListener('click', () => {
    setUpgradeModalView('buy');
  });
  // Enter inside the key input also fires verify.
  $<HTMLInputElement>('modal-key-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      $('modal-key-verify').click();
    }
  });
  $('modal-key-verify').addEventListener('click', () => {
    const key = $<HTMLInputElement>('modal-key-input').value.trim();
    const status = document.getElementById('modal-status');
    if (!key) {
      if (status) { status.textContent = 'Paste a license key first.'; status.className = 'modal-status err'; }
      return;
    }
    if (isOffline()) {
      if (status) { status.textContent = 'You are offline. License verification needs a connection.'; status.className = 'modal-status err'; }
      return;
    }
    if (status) { status.textContent = 'Verifying…'; status.className = 'modal-status'; }
    parent.postMessage({ pluginMessage: { type: 'license-verify', key } }, '*');
  });
  updateProPill();

  // Brand wiring
  brandPalette = loadBrandPalette();
  $('brand-open-btn').addEventListener('click', openUpgradeModal);

  // Custom palette: color picker ↔ hex sync + apply
  const colorPicker = $<HTMLInputElement>('brand-color-picker');
  const hexInput = $<HTMLInputElement>('brand-hex-input');
  colorPicker.addEventListener('input', () => {
    hexInput.value = colorPicker.value.toUpperCase();
    const status = document.getElementById('brand-status');
    if (status) { status.textContent = ''; status.className = 'modal-status'; }
  });
  hexInput.addEventListener('input', () => {
    const normalized = isValidHex(hexInput.value);
    if (normalized) colorPicker.value = normalized;
  });
  $('brand-hex-apply').addEventListener('click', () => {
    const status = document.getElementById('brand-status');
    const normalized = isValidHex(hexInput.value);
    if (!normalized) {
      if (status) { status.textContent = 'Enter a valid hex (e.g. #6366F1 or 6366F1)'; status.className = 'modal-status err'; }
      return;
    }
    applyBrandFromHex(normalized, normalized);
  });
  hexInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('brand-hex-apply').click();
  });

  // Multi-hex quick-import — paste several hex codes at once.
  const multiInput = document.getElementById('brand-multi-input') as HTMLInputElement | null;
  const multiBtn = document.getElementById('brand-multi-apply');
  if (multiBtn && multiInput) {
    multiBtn.addEventListener('click', () => {
      applyBrandFromMultiHex(multiInput.value);
    });
    multiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') applyBrandFromMultiHex(multiInput.value);
    });
  }

  updateBrandUi();

  // Onboarding (first run only) — persistence handled by main thread via
  // figma.clientStorage (UI iframe localStorage is unreliable across sessions).
  // We bind handlers eagerly but only reveal the screen if the main thread
  // tells us the user has not seen it yet.
  $('onboarding-start').addEventListener('click', () => dismissOnboarding('start'));
  $('onboarding-skip').addEventListener('click', () => dismissOnboarding('skip'));

  const onbSeedInput = $<HTMLInputElement>('onb-seed');
  if (onbSeedInput) {
    onbSeedInput.addEventListener('input', () => {
      const v = onbSeedInput.value.trim() || 'Navii';
      renderOnbHero(v);
      const heroEl = document.getElementById('onb-hero');
      if (heroEl) {
        heroEl.classList.remove('pulse');
        // Reflow so re-adding the class restarts the animation.
        void heroEl.offsetWidth;
        heroEl.classList.add('pulse');
      }
    });
    onbSeedInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') dismissOnboarding('start');
    });
  }

  parent.postMessage({ pluginMessage: { type: 'onboarding-get' } }, '*');

  // Initial render
  $<HTMLInputElement>('seed-input').value = 'alice';
  renderSeedPalettes();
  renderBuildPalettes();
  renderBuildPickers();
  renderSeedPreview();
  renderBuildPreview();
  renderRecent();
  renderPackGrid();
  renderPacksHero();
  bindMascotHandlers();
  bindMascotActionModalHandlers();
  bindMoodHandlers();
  renderMoodRow();
  requestPresets();
  requestUsage();
  // Explicit pull of cached license — main thread also pushes on startup,
  // but that race lost the message before the UI iframe attached its
  // listener, so users had to re-enter their key on every plugin open.
  parent.postMessage({ pluginMessage: { type: 'license-restore' } }, '*');
}

function handleOnboardingStatus(seen: boolean) {
  if (seen) return;
  const onboardEl = document.getElementById('onboarding');
  if (!onboardEl) return;
  onboardEl.classList.add('show');
  renderOnboardingCast();
  renderOnbHero('Navii');
  const seedInput = document.getElementById('onb-seed') as HTMLInputElement | null;
  if (seedInput) setTimeout(() => seedInput.focus(), 500);
}

function dismissOnboarding(via: 'start' | 'skip') {
  const onboardEl = document.getElementById('onboarding');
  if (!onboardEl) return;
  const seedEl = document.getElementById('onb-seed') as HTMLInputElement | null;
  const typed = seedEl ? seedEl.value.trim() : '';
  onboardEl.classList.remove('show');
  parent.postMessage(
    { pluginMessage: { type: 'onboarding-set', seen: true } },
    '*',
  );
  // Wipe onboarding SVGs so their <defs> IDs (navii-grad-<seedHash>) leave
  // the document. Otherwise the hero SVG (carrying same seed as main
  // preview) collides on gradient IDs and the visible main preview
  // resolves url(#...) to the hidden onboarding defs → empty fill = faded.
  const heroEl = document.getElementById('onb-hero');
  const castEl = document.getElementById('onb-cast');
  if (heroEl) clear(heroEl);
  if (castEl) clear(castEl);
  const main = document.getElementById('seed-input') as HTMLInputElement | null;
  if (main && typed) {
    main.value = typed;
    notifyHost(`Saved "${typed}" as your starter mascot.`);
  }
  requestAnimationFrame(() => {
    renderSeedPreview();
    renderBuildPreview();
  });
  // Drop reason on the floor for now — keeps signature future-proof for analytics.
  void via;
}

function renderOnboardingCast() {
  // Small thumbnail strip under the hero — hints at variety without
  // dominating the screen.
  const cast = document.getElementById('onb-cast');
  if (!cast) return;
  clear(cast);
  const seeds = ['aria', 'milo', 'nova', 'kai', 'sage', 'eden'];
  seeds.forEach((seed, i) => {
    const tile = document.createElement('div');
    tile.className = 'mini-tile';
    tile.style.animationDelay = (i * 60 + 200) + 'ms';
    setSvgPreview(tile, createAvatar(seed, { size: 30, animated: false }));
    cast.appendChild(tile);
  });
}

function renderOnbHero(seed: string) {
  const hero = document.getElementById('onb-hero');
  if (!hero) return;
  setSvgPreview(hero, createAvatar(seed, { size: 156, animated: true }));
}

try {
  init();
  console.log('[navii] init complete');
} catch (err) {
  console.error('[navii] init failed', err);
}
