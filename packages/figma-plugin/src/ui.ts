/**
 * Plugin UI iframe. Runs in normal browser env.
 * Uses @usenavii/core directly for live previews.
 * Posts messages to main thread (code.ts) to mutate the Figma document.
 */

import { createAvatar, build as buildAvatar, BUILT_IN_PACKS } from '@usenavii/core';
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
};

const buildSpec: BuildSpec = {
  palette: 'indigo',
  body: 'orb',
  eyes: 'round',
  mouth: 'smile',
  antenna: 'none',
  accessory: 'none',
  topper: 'none',
};

let activeTab: 'seed' | 'build' | 'packs' = 'seed';

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
  if (packs.length > 0) opts.packs = packs;
  return opts;
}

// ---------- rendering ----------
function renderSeedPreview() {
  const seed = $<HTMLInputElement>('seed-input').value || 'alice';
  setSvgPreview($('preview-seed'), createAvatar(seed, { ...currentSeedOptions(), animated: true }));
  updateUrlText();
}

function renderBuildPreview() {
  setSvgPreview($('preview-build'), buildAvatar(buildSpec, { size: 200, animated: true }));
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
const GUMROAD_PURCHASE_URL = 'https://uxderrick.gumroad.com/l/navii-pro';

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
    pill.title = `Pro unlocked${licenseStatus.email ? ` (${licenseStatus.email})` : ''}`;
    label.textContent = 'Pro';
  } else {
    pill.classList.remove('unlocked');
    pill.title = 'Unlock Navii Pro';
    label.textContent = 'Upgrade';
  }
}

function openUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.classList.add('show');
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
}

function closeUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.classList.remove('show');
  const status = document.getElementById('modal-status');
  if (status) { status.textContent = ''; status.className = 'modal-status'; }
  const keySection = document.getElementById('modal-key-section');
  if (keySection) keySection.style.display = 'none';
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

function setActiveTab(tab: 'seed' | 'build' | 'packs') {
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
  };
  btn.innerHTML = `${labels[tab]}<span class="kbd">⌘↵</span>`;
  // Fill random only applies in Seed mode (Build mode = one specific spec).
  $('fill-random-btn').style.display = tab === 'seed' ? '' : 'none';
  $('url-bar').classList.remove('show');
  // Refresh packs hero preview when entering the tab.
  if (tab === 'packs') renderPacksHero();
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
        chip.innerHTML = `<span>${pack.emoji ?? '✦'}</span><span>${pack.name}</span>`;
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
  const grid = document.getElementById('pack-grid');
  if (!grid) return;
  clear(grid);

  for (const pack of BUILT_IN_PACKS) {
    const card = document.createElement('button');
    const available = isPackAvailable(pack);
    const active = enabledPackIds.has(pack.id);
    const locked = !isPaid();

    card.className = 'pack-card';
    if (active) card.classList.add('active');
    if (locked) card.classList.add('locked');
    if (!available) card.classList.add('coming');

    const emoji = document.createElement('div');
    emoji.className = 'pack-card-emoji';
    emoji.textContent = pack.emoji ?? '✦';

    const info = document.createElement('div');
    info.className = 'pack-card-info';
    const title = document.createElement('div');
    title.className = 'pack-card-title';
    title.innerHTML = `<span>${pack.name}</span>`;
    if (!available) {
      const days = Math.max(0, Math.ceil((new Date(pack.unlockDate!).getTime() - Date.now()) / 86_400_000));
      const badge = document.createElement('span');
      badge.className = 'badge soon';
      badge.textContent = days === 0 ? 'Coming soon' : `In ${days}d`;
      title.appendChild(badge);
    }
    const desc = document.createElement('div');
    desc.className = 'pack-card-desc';
    desc.textContent = pack.description;
    info.appendChild(title);
    info.appendChild(desc);

    const toggle = document.createElement('div');
    toggle.className = 'pack-card-toggle';

    card.appendChild(emoji);
    card.appendChild(info);
    card.appendChild(toggle);

    card.addEventListener('click', () => {
      if (locked) {
        openUpgradeModal();
        return;
      }
      if (!available) return; // soon — no-op
      togglePack(pack.id);
    });

    grid.appendChild(card);
  }
}

function togglePack(id: string) {
  if (enabledPackIds.has(id)) enabledPackIds.delete(id);
  else enabledPackIds.add(id);
  persistEnabledPacks();
  renderPackGrid();
  renderPacksHero();
  renderSeedPreview();
}

function doPrimary() {
  if (activeTab === 'seed') {
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

// Build mode primary: rasterize PNG up-front so main thread can either fill
// the current selection or place a new SVG node depending on what's selected.
async function doBuildPrimary() {
  const svg = buildAvatar(buildSpec, { size: 200 });
  const svgLarge = buildAvatar(buildSpec, { size: 512 });
  let bytes: Uint8Array | undefined;
  try {
    bytes = await rasterizeSvgToPng(svgLarge, 512);
  } catch (err) {
    console.error('[navii] rasterize failed', err);
  }
  parent.postMessage({
    pluginMessage: { type: 'insert-build', spec: buildSpec, options: { size: 200 }, svg, bytes },
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

  // Cmd/Ctrl+Enter shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      doPrimary();
    }
    // Dev bypass — Cmd+Shift+P toggles Pro locally for testing.
    // This only flips the UI's `isPaid()` view; server-side gated features
    // (Gumroad-verified) still need a real key. Safe to ship — power users
    // can find this in the source anyway.
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      const now = !isPaid();
      setLicenseStatus(now ? { ok: true, plan: 'pro', email: 'dev@local' } : { ok: false });
      console.log('[navii] dev pro toggled:', now);
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
  });

  // Pro pill + upgrade modal wiring
  $('pro-pill').addEventListener('click', () => {
    if (!isPaid()) openUpgradeModal();
  });
  $('modal-close').addEventListener('click', closeUpgradeModal);
  document.getElementById('upgrade-modal')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'upgrade-modal') closeUpgradeModal();
  });
  $('modal-buy').addEventListener('click', () => {
    window.open(GUMROAD_PURCHASE_URL, '_blank');
  });
  $('modal-have-key').addEventListener('click', () => {
    const sec = document.getElementById('modal-key-section');
    if (sec) sec.style.display = 'block';
    $<HTMLInputElement>('modal-key-input').focus();
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

  updateBrandUi();

  // Onboarding (first run only) — stage 1: confetti + cast, stage 2: hero + live seed
  const onboardEl = $('onboarding');
  const onboardKey = 'navii.onboarded';
  let seenOnboarding = false;
  try { seenOnboarding = localStorage.getItem(onboardKey) === 'true'; } catch { /* noop */ }

  function dismissOnboarding() {
    const seedEl = $<HTMLInputElement>('onb-seed');
    const typed = seedEl ? seedEl.value.trim() : '';
    onboardEl.classList.remove('show', 'stage-1', 'stage-2');
    try { localStorage.setItem(onboardKey, 'true'); } catch { /* noop */ }
    // Wipe onboarding SVGs so their <defs> IDs (navii-grad-<seedHash>) leave
    // the document. Otherwise the hero SVG (carrying same seed as main
    // preview) collides on gradient IDs and the visible main preview
    // resolves url(#...) to the hidden onboarding defs → empty fill = faded.
    const heroEl = document.getElementById('onb-hero');
    const castEl = document.getElementById('onb-cast');
    const confEl = document.getElementById('onb-confetti');
    if (heroEl) clear(heroEl);
    if (castEl) clear(castEl);
    if (confEl) clear(confEl);
    const main = $<HTMLInputElement>('seed-input');
    if (main && typed) main.value = typed;
    requestAnimationFrame(() => {
      renderSeedPreview();
      renderBuildPreview();
    });
  }

  function transitionToHero() {
    onboardEl.classList.add('stage-2');
    const tiles = onboardEl.querySelectorAll<HTMLElement>('.cast-tile');
    tiles.forEach((tile, i) => {
      const angle = (i / Math.max(tiles.length, 1)) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 230 + Math.random() * 70;
      tile.style.setProperty('--tx', (Math.cos(angle) * dist).toFixed(0) + 'px');
      tile.style.setProperty('--ty', (Math.sin(angle) * dist).toFixed(0) + 'px');
      tile.style.setProperty('--rot', ((Math.random() - 0.5) * 60).toFixed(0) + 'deg');
    });
    renderOnbHero('Navii');
    updateOnbBubble('Navii');
    const titleEl = document.getElementById('onb-title');
    const leadEl = document.getElementById('onb-lead');
    if (titleEl) titleEl.textContent = 'Make yours.';
    if (leadEl) leadEl.textContent = 'Type any name. Same seed → same mascot, forever.';
    const seedInput = $<HTMLInputElement>('onb-seed');
    if (seedInput) {
      seedInput.addEventListener('input', () => {
        const v = seedInput.value.trim() || 'Navii';
        renderOnbHero(v);
        updateOnbBubble(v);
      });
      seedInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') dismissOnboarding();
      });
      setTimeout(() => seedInput.focus(), 700);
    }
  }

  if (!seenOnboarding) {
    onboardEl.classList.add('show', 'stage-1');
    renderOnboardingCast();
    spawnConfetti(60);
    setTimeout(transitionToHero, 1600);
  }

  $('onboarding-start').addEventListener('click', dismissOnboarding);
  $('onboarding-skip').addEventListener('click', dismissOnboarding);

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
}

function renderOnboardingCast() {
  const cast = document.getElementById('onb-cast');
  if (!cast) return;
  clear(cast);
  const seeds = ['aria', 'milo', 'nova', 'kai', 'sage', 'eden', 'luna', 'rio'];
  seeds.forEach((seed, i) => {
    const tile = document.createElement('div');
    tile.className = 'cast-tile';
    tile.style.animationDelay = (i * 80) + 'ms';
    setSvgPreview(tile, createAvatar(seed, { size: 76, animated: true }));
    cast.appendChild(tile);
  });
}

function spawnConfetti(count: number) {
  const wrap = document.getElementById('onb-confetti');
  if (!wrap) return;
  clear(wrap);
  const colors = ['#6366f1', '#a855f7', '#22d3ee', '#f59e0b', '#34d399', '#f43f5e', '#facc15'];
  for (let i = 0; i < count; i++) {
    const bit = document.createElement('div');
    bit.className = 'confetti-bit';
    bit.style.left = (Math.random() * 100) + '%';
    bit.style.background = colors[i % colors.length] || '#6366f1';
    bit.style.animationDelay = (Math.random() * 400) + 'ms';
    bit.style.animationDuration = (1500 + Math.random() * 800) + 'ms';
    wrap.appendChild(bit);
  }
}

function renderOnbHero(seed: string) {
  const hero = document.getElementById('onb-hero');
  if (!hero) return;
  setSvgPreview(hero, createAvatar(seed, { size: 180, animated: true }));
}

function updateOnbBubble(name: string) {
  const bubble = document.getElementById('onb-bubble');
  if (!bubble) return;
  bubble.textContent = '';
  bubble.appendChild(document.createTextNode("Hi, I'm "));
  const strong = document.createElement('strong');
  strong.textContent = name;
  bubble.appendChild(strong);
}

try {
  init();
  console.log('[navii] init complete');
} catch (err) {
  console.error('[navii] init failed', err);
}
