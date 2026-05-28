/**
 * Figma main thread. Sandboxed QuickJS — no DOM, no fetch by default.
 * Receives messages from UI iframe, mutates Figma document via `figma.*` API.
 */

import { createAvatar, build as buildAvatar } from '@usenavii/core';
import type { AvatarOptions, BuildSpec } from '@usenavii/core';

const API_BASE = 'https://api.navii.dev';

type InsertMsg = {
  type: 'insert';
  seed: string;
  options: AvatarOptions;
  /**
   * Override the default selection-aware routing:
   * - 'insert' = always create a new SVG node, ignore selection
   * - 'fill'   = always try to image-fill selected shapes (error if none)
   * - undefined = legacy: fill if shapes selected, else new node
   */
  force?: 'insert' | 'fill';
};

type InsertBuildMsg = {
  type: 'insert-build';
  spec: BuildSpec;
  options: AvatarOptions;
  svg?: string;
  bytes?: Uint8Array;
  /** Same semantics as InsertMsg.force — overrides selection-aware routing. */
  force?: 'insert' | 'fill';
};

type FillRandomMsg = {
  type: 'fill-random';
  options: AvatarOptions;
};

type LicenseVerifyMsg = {
  type: 'license-verify';
  key: string;
  email?: string;
};

type LicenseRestoreMsg = {
  type: 'license-restore';
};

type LicenseClearMsg = {
  type: 'license-clear';
};

type ListVariablesMsg = {
  type: 'list-variables';
};

type CopyUrlMsg = {
  type: 'copy-url';
  seed: string;
  options: AvatarOptions;
};

type NotifyMsg = {
  type: 'notify';
  message: string;
  error?: boolean;
};

/**
 * Saved mascot preset — a named snapshot of either a seed (+ pack/style/palette
 * overrides) or a builder spec. Lets users reuse "Our brand mascot Aria",
 * "Acme Bot", etc. across files. Stored in figma.clientStorage per user.
 */
export interface MascotPreset {
  id: string;
  name: string;
  mode: 'seed' | 'build';
  /** seed mode only */
  seed?: string;
  /** build mode only */
  buildSpec?: BuildSpec;
  /** shared — at-save snapshot of options */
  packs?: string[];
  style?: 'masc' | 'femme' | 'neutral';
  mood?: 'happy' | 'serious' | 'sleepy' | 'wink';
  paletteId?: string;
  background?: 'none' | 'solid' | 'ring';
  createdAt: number;
}

type PresetListMsg = { type: 'preset-list' };
type PresetSaveMsg = { type: 'preset-save'; preset: MascotPreset };
type PresetDeleteMsg = { type: 'preset-delete'; id: string };

type UsageGetMsg = { type: 'usage-get' };

type OnboardingGetMsg = { type: 'onboarding-get' };
type OnboardingSetMsg = { type: 'onboarding-set'; seen: boolean };

type PacksGetMsg = { type: 'packs-get' };
type PacksSetMsg = { type: 'packs-set'; packs: string[] };

type PrefsGetMsg = { type: 'prefs-get' };
type PrefsSetMsg = { type: 'prefs-set'; key: string; value: unknown };

type Msg =
  | InsertMsg
  | InsertBuildMsg
  | FillRandomMsg
  | LicenseVerifyMsg
  | LicenseRestoreMsg
  | LicenseClearMsg
  | ListVariablesMsg
  | CopyUrlMsg
  | NotifyMsg
  | PresetListMsg
  | PresetSaveMsg
  | PresetDeleteMsg
  | UsageGetMsg
  | OnboardingGetMsg
  | OnboardingSetMsg
  | PacksGetMsg
  | PacksSetMsg
  | PrefsGetMsg
  | PrefsSetMsg
  | { type: 'close' };

figma.showUI(__html__, { width: 640, height: 520, themeColors: true });

figma.ui.onmessage = async (msg: Msg) => {
  switch (msg.type) {
    case 'insert':         return doInsert(msg);
    case 'insert-build':   return doInsertBuild(msg);
    case 'fill-random':    return doFillRandom(msg);
    case 'license-verify': return doLicenseVerify(msg);
    case 'license-restore':return doLicenseRestore();
    case 'license-clear':  return doLicenseClear();
    case 'list-variables': return doListVariables();
    case 'copy-url':       return doCopyUrl(msg);
    case 'notify':         return figma.notify(msg.message, msg.error ? { error: true } : undefined);
    case 'preset-list':    return doPresetList();
    case 'preset-save':    return doPresetSave(msg);
    case 'preset-delete':  return doPresetDelete(msg);
    case 'usage-get':      return doUsageGet();
    case 'onboarding-get': return doOnboardingGet();
    case 'onboarding-set': return doOnboardingSet(msg);
    case 'packs-get':      return doPacksGet();
    case 'packs-set':      return doPacksSet(msg);
    case 'prefs-get':      return doPrefsGet();
    case 'prefs-set':      return doPrefsSet(msg);
    case 'close':          return figma.closePlugin();
  }
};

// On startup, restore cached license + revalidate if stale (>24h).
void doLicenseRestore();

function buildUrl(seed: string, opts: AvatarOptions, ext = ''): string {
  // QuickJS (Figma main thread) lacks URLSearchParams — build manually.
  // Keep this in sync with packages/api/src/app.ts's /avatar/:seed query
  // parser — otherwise the fill (image-fetch) path silently strips options
  // and the rendered image diverges from the in-plugin preview.
  const parts: string[] = [];
  if (opts.size) parts.push(`size=${opts.size}`);
  if (opts.paletteId) parts.push(`palette=${encodeURIComponent(opts.paletteId)}`);
  if (typeof opts.background === 'string') parts.push(`background=${opts.background}`);
  if (opts.tileBg) parts.push(`tileBg=${encodeURIComponent(opts.tileBg)}`);
  if (opts.mood) parts.push(`mood=${opts.mood}`);
  if (opts.packs && opts.packs.length > 0) {
    parts.push(`packs=${opts.packs.map(encodeURIComponent).join(',')}`);
  }
  if (opts.style) parts.push(`style=${opts.style}`);
  // opts.palette (Palette object) intentionally NOT serialized — brand
  // palettes don't round-trip through the HTTP API (no registry id). The
  // in-plugin preview uses the local engine; fill mode falls back to the
  // paletteId if one is set, otherwise the seed-derived palette.
  const qs = parts.length ? '?' + parts.join('&') : '';
  return `${API_BASE}/avatar/${encodeURIComponent(seed)}${ext}${qs}`;
}

function tagNode(node: SceneNode, seed: string, opts: AvatarOptions) {
  node.name = `Navii / ${seed}`;
  node.setPluginData('naviiSeed', seed);
  node.setPluginData('naviiUrl', buildUrl(seed, opts));
  node.setPluginData('naviiOptions', JSON.stringify(opts));
}

function placeAt(node: SceneNode, x: number, y: number) {
  node.x = x;
  node.y = y;
}

// ---------- Daily usage cap (free tier) ----------
//
// Free users get a soft daily insert budget. Pro skips the check entirely.
// Counter lives in figma.clientStorage so it follows the user across files.
// Reset is local-midnight by ISO date string (YYYY-MM-DD).
//
// Client-side counter is a deterrent, not a vault — a determined user could
// clear clientStorage or uninstall to reset. Sufficient for nudging the
// curious / casual user toward Pro. Hard cap belongs server-side (future
// API-key gate). v1 keeps it light.

const USAGE_STORAGE_KEY = 'navii.usage';
const FREE_DAILY_LIMIT = 10;

interface UsageRecord {
  date: string; // YYYY-MM-DD
  count: number;
}

function today(): string {
  // Use device-local YYYY-MM-DD so the reset feels right wherever the user is.
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

async function readUsage(): Promise<UsageRecord> {
  try {
    const stored = await figma.clientStorage.getAsync(USAGE_STORAGE_KEY);
    if (!stored || typeof stored !== 'object') return { date: today(), count: 0 };
    const rec = stored as UsageRecord;
    if (rec.date !== today()) return { date: today(), count: 0 };
    return rec;
  } catch {
    return { date: today(), count: 0 };
  }
}

async function writeUsage(rec: UsageRecord): Promise<void> {
  try {
    await figma.clientStorage.setAsync(USAGE_STORAGE_KEY, rec);
  } catch {
    // clientStorage rarely fails; non-fatal.
  }
}

function isProActive(): boolean {
  return cachedLicenseOk;
}

let cachedLicenseOk = false;

/**
 * Check + reserve one insert against the daily budget. Returns true if the
 * action is allowed; false (and pings UI to show the upgrade modal) otherwise.
 * Pro users always pass.
 */
async function checkAndIncrementUsage(): Promise<boolean> {
  if (isProActive()) return true;
  const rec = await readUsage();
  if (rec.count >= FREE_DAILY_LIMIT) {
    figma.notify(
      `Daily limit reached (${FREE_DAILY_LIMIT}). Upgrade to Pro for unlimited inserts.`,
      { error: true },
    );
    figma.ui.postMessage({
      type: 'usage-blocked',
      usage: { ...rec, limit: FREE_DAILY_LIMIT, pro: false },
    });
    return false;
  }
  const next = { date: rec.date, count: rec.count + 1 };
  await writeUsage(next);
  figma.ui.postMessage({
    type: 'usage',
    usage: { ...next, limit: FREE_DAILY_LIMIT, pro: false },
  });
  return true;
}

async function doUsageGet() {
  const rec = await readUsage();
  figma.ui.postMessage({
    type: 'usage',
    usage: { ...rec, limit: FREE_DAILY_LIMIT, pro: isProActive() },
  });
}

// ---------- Onboarding seen-flag ----------
//
// Figma plugin UI iframe localStorage is unreliable across sessions, so the
// onboarding screen was showing on every launch. Persistent flag lives in
// figma.clientStorage on the main thread.

const ONBOARDING_STORAGE_KEY = 'navii.onboarded';

async function doOnboardingGet() {
  let seen = false;
  try {
    const stored = await figma.clientStorage.getAsync(ONBOARDING_STORAGE_KEY);
    seen = stored === true;
  } catch {
    // clientStorage rarely fails; treat as unseen.
  }
  figma.ui.postMessage({ type: 'onboarding-status', seen });
}

async function doOnboardingSet(msg: OnboardingSetMsg) {
  try {
    if (msg.seen) {
      await figma.clientStorage.setAsync(ONBOARDING_STORAGE_KEY, true);
    } else {
      await figma.clientStorage.deleteAsync(ONBOARDING_STORAGE_KEY);
    }
  } catch {
    // non-fatal.
  }
}

// ---------- Enabled packs (per-user persistence) ----------
//
// Pack toggles previously used UI-iframe localStorage, which Figma wipes
// between plugin sessions. Move to figma.clientStorage on the main thread
// (same pattern as onboarding + usage + license).

const PACKS_STORAGE_KEY = 'navii.enabled-packs';

async function doPacksGet() {
  let packs: string[] = [];
  try {
    const stored = await figma.clientStorage.getAsync(PACKS_STORAGE_KEY);
    if (Array.isArray(stored)) {
      packs = stored.filter((v): v is string => typeof v === 'string');
    }
  } catch {
    // clientStorage rarely fails; treat as no packs enabled.
  }
  figma.ui.postMessage({ type: 'packs-list', packs });
}

async function doPacksSet(msg: PacksSetMsg) {
  try {
    const packs = (msg.packs ?? []).filter((v) => typeof v === 'string');
    if (packs.length === 0) {
      await figma.clientStorage.deleteAsync(PACKS_STORAGE_KEY);
    } else {
      await figma.clientStorage.setAsync(PACKS_STORAGE_KEY, packs);
    }
  } catch {
    // non-fatal.
  }
}

// ---------- Generic UI prefs ----------
//
// Single clientStorage blob keyed by 'navii.prefs'. UI requests the whole
// object on init (prefs-get → prefs-list), then individual updates flow
// through prefs-set with { key, value }. Whitelist guards the namespace so
// the UI can't sneak arbitrary keys into persistent storage.

const PREFS_STORAGE_KEY = 'navii.prefs';
const ALLOWED_PREF_KEYS = new Set([
  'style',            // 'masc' | 'femme' | 'neutral'
  'mood',             // 'happy' | 'serious' | 'sleepy' | 'wink'
  'recent',           // string[] (recent seed history)
  'brandCollapsed',   // string[] (collapsed brand group keys)
  'brandSelection',   // { collectionId, variableName } | null
]);

async function doPrefsGet() {
  let prefs: Record<string, unknown> = {};
  try {
    const stored = await figma.clientStorage.getAsync(PREFS_STORAGE_KEY);
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      prefs = stored as Record<string, unknown>;
    }
  } catch {
    // clientStorage rarely fails; treat as no prefs.
  }
  figma.ui.postMessage({ type: 'prefs-list', prefs });
}

async function doPrefsSet(msg: PrefsSetMsg) {
  if (!ALLOWED_PREF_KEYS.has(msg.key)) return;
  try {
    const stored = await figma.clientStorage.getAsync(PREFS_STORAGE_KEY);
    const current =
      stored && typeof stored === 'object' && !Array.isArray(stored)
        ? (stored as Record<string, unknown>)
        : {};
    if (msg.value === null || msg.value === undefined) {
      const { [msg.key]: _, ...rest } = current;
      await figma.clientStorage.setAsync(PREFS_STORAGE_KEY, rest);
    } else {
      await figma.clientStorage.setAsync(PREFS_STORAGE_KEY, {
        ...current,
        [msg.key]: msg.value,
      });
    }
  } catch {
    // non-fatal.
  }
}

async function doInsert(msg: InsertMsg) {
  if (!(await checkAndIncrementUsage())) return;
  // Routing:
  // - force='fill'    → must fill selection (error if none)
  // - force='insert'  → always create new node, ignore selection
  // - undefined       → legacy: fill if selection, else new node
  const fillable = fillableSelection();
  if (msg.force === 'fill' && fillable.length === 0) {
    figma.notify('Select shapes or frames to fill first', { error: true });
    return;
  }
  const shouldFill = msg.force === 'fill' || (msg.force !== 'insert' && fillable.length > 0);
  if (shouldFill) {
    figma.notify(`Filling ${fillable.length} shape${fillable.length === 1 ? '' : 's'}…`);
    const url = buildUrl(msg.seed, { ...msg.options, size: 512 }, '.png');
    try {
      const image = await figma.createImageAsync(url);
      const fill: ImagePaint = { type: 'IMAGE', imageHash: image.hash, scaleMode: 'FILL' };
      for (const node of fillable) {
        (node as SceneNode & { fills: Paint[] }).fills = [fill];
        node.setPluginData('naviiSeed', msg.seed);
        node.setPluginData('naviiUrl', url);
      }
      figma.notify(`Filled ${fillable.length} shape${fillable.length === 1 ? '' : 's'} with "${msg.seed}"`);
      figma.ui.postMessage({ type: 'inserted', seed: msg.seed, url });
    } catch (err) {
      console.error('navii: insert (fill mode) failed', err);
      figma.notify('Fill failed — check network access for api.navii.dev', { error: true });
    }
    return;
  }

  // No selection → place new SVG node.
  const svg = createAvatar(msg.seed, msg.options);
  const node = figma.createNodeFromSvg(svg);
  tagNode(node, msg.seed, msg.options);
  const center = figma.viewport.center;
  placeAt(node, center.x - node.width / 2, center.y - node.height / 2);
  figma.currentPage.selection = [node];
  figma.notify(`Inserted Navii for "${msg.seed}"`);
  figma.ui.postMessage({ type: 'inserted', seed: msg.seed, url: buildUrl(msg.seed, msg.options) });
}

async function doInsertBuild(msg: InsertBuildMsg) {
  if (!(await checkAndIncrementUsage())) return;
  // Routing — see InsertMsg.force docs. Build flow can only fill when raster
  // bytes are present (Figma image fills require PNG, not SVG).
  const fillable = fillableSelection();
  if (msg.force === 'fill' && fillable.length === 0) {
    figma.notify('Select shapes or frames to fill first', { error: true });
    return;
  }
  if (msg.force === 'fill' && !msg.bytes) {
    figma.notify('Fill unavailable — no raster bytes', { error: true });
    return;
  }
  const shouldFill = (msg.force === 'fill') ||
    (msg.force !== 'insert' && fillable.length > 0 && !!msg.bytes);
  if (shouldFill && msg.bytes) {
    try {
      const image = figma.createImage(msg.bytes);
      const fill: ImagePaint = { type: 'IMAGE', imageHash: image.hash, scaleMode: 'FILL' };
      for (const node of fillable) {
        (node as SceneNode & { fills: Paint[] }).fills = [fill];
        node.setPluginData('naviiSource', 'build');
      }
      figma.notify(`Filled ${fillable.length} shape${fillable.length === 1 ? '' : 's'} with custom build`);
    } catch (err) {
      console.error('navii: insert-build (fill mode) failed', err);
      figma.notify('Fill failed', { error: true });
    }
    return;
  }

  try {
    const svg = msg.svg ?? buildAvatar(msg.spec, msg.options);
    const node = figma.createNodeFromSvg(svg);
    const labelParts = [
      msg.spec.body, msg.spec.eyes, msg.spec.mouth, msg.spec.palette,
    ].filter(Boolean);
    node.name = `Navii / build / ${labelParts.join('-') || 'custom'}`;
    node.setPluginData('naviiBuildSpec', JSON.stringify(msg.spec));
    node.setPluginData('naviiOptions', JSON.stringify(msg.options));
    const center = figma.viewport.center;
    placeAt(node, center.x - node.width / 2, center.y - node.height / 2);
    figma.currentPage.selection = [node];
    figma.notify('Inserted custom Navii');
  } catch (err) {
    console.error('navii: insert-build (new node) failed', err);
    figma.notify('Insert failed — try again', { error: true });
  }
}

function fillableSelection(): (SceneNode & { fills: readonly Paint[] })[] {
  return figma.currentPage.selection.filter(
    (n): n is SceneNode & { fills: readonly Paint[] } =>
      'fills' in n && Array.isArray((n as { fills?: unknown }).fills),
  );
}

async function doFillRandom(msg: FillRandomMsg) {
  const fillable = fillableSelection();
  if (fillable.length === 0) {
    figma.notify('Select shapes or frames first', { error: true });
    return;
  }
  // Fill counts as one usage tick regardless of shape count — a single user
  // action. Casual designers can still test 50-cell grids on free tier.
  if (!(await checkAndIncrementUsage())) return;

  figma.notify(`Generating ${fillable.length} random avatars…`);

  let count = 0;
  let failed = 0;

  for (const node of fillable) {
    // Use Figma's stable node id as the seed so each shape gets a unique
    // avatar that's reproducible across plugin runs.
    const seed = node.id;
    const url = buildUrl(seed, { ...msg.options, size: 512 }, '.png');
    try {
      const image = await figma.createImageAsync(url);
      const fill: ImagePaint = { type: 'IMAGE', imageHash: image.hash, scaleMode: 'FILL' };
      (node as SceneNode & { fills: Paint[] }).fills = [fill];
      node.setPluginData('naviiSeed', seed);
      node.setPluginData('naviiUrl', url);
      count++;
    } catch (err) {
      console.error('navii: fill-random failed for', node.id, err);
      failed++;
    }
  }

  const failMsg = failed > 0 ? ` (${failed} failed)` : '';
  figma.notify(`Filled ${count} shape${count === 1 ? '' : 's'} with random avatars${failMsg}`);
}

// ---------- License (Pro) ----------
//
// Source of truth lives on navii-api. We cache the result in clientStorage so
// the user doesn't need to re-paste on every plugin open, but we re-verify
// against the server every 24h to catch refunds, chargebacks, or revocations.

const LICENSE_STORAGE_KEY = 'navii.license';
const LICENSE_REVALIDATE_MS = 24 * 60 * 60 * 1000;

interface LicenseRecord {
  ok: boolean;
  plan?: 'pro';
  purchaseId?: string;
  email?: string;
  verifiedAt: number;
  key: string;
}

async function readLicense(): Promise<LicenseRecord | null> {
  try {
    const stored = await figma.clientStorage.getAsync(LICENSE_STORAGE_KEY);
    if (!stored || typeof stored !== 'object') return null;
    return stored as LicenseRecord;
  } catch {
    return null;
  }
}

/**
 * Sanitized view of a LicenseRecord for posting to the UI iframe.
 *
 * The raw license key stays in the main thread (we need it to re-verify on
 * restore + stale cache refresh). The UI never needs the key string — it
 * only renders status + email. Stripping `key` here is defense-in-depth so a
 * future UI logger or DOM dump can't accidentally leak it.
 */
function publicLicenseView(rec: LicenseRecord | { ok: false } | null) {
  if (!rec || !('ok' in rec) || !rec.ok) return { ok: false } as const;
  return {
    ok: true as const,
    ...(rec.plan ? { plan: rec.plan } : {}),
    ...(rec.purchaseId ? { purchaseId: rec.purchaseId } : {}),
    ...(rec.email ? { email: rec.email } : {}),
    ...(rec.verifiedAt ? { verifiedAt: rec.verifiedAt } : {}),
  };
}

async function writeLicense(rec: LicenseRecord | null) {
  try {
    if (rec) await figma.clientStorage.setAsync(LICENSE_STORAGE_KEY, rec);
    else await figma.clientStorage.deleteAsync(LICENSE_STORAGE_KEY);
  } catch {
    // clientStorage rarely fails; non-fatal.
  }
}

async function verifyLicenseRemote(key: string, email?: string): Promise<LicenseRecord> {
  const body: Record<string, string> = { key };
  if (email) body.email = email;
  try {
    const response = await fetch(`${API_BASE}/license/verify`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as {
      ok: boolean;
      plan?: 'pro';
      purchaseId?: string;
      email?: string;
      reason?: string;
    };
    return {
      ok: data.ok,
      ...(data.plan ? { plan: data.plan } : {}),
      ...(data.purchaseId ? { purchaseId: data.purchaseId } : {}),
      ...(data.email ? { email: data.email } : {}),
      verifiedAt: Date.now(),
      key,
    };
  } catch (err) {
    console.error('navii: license verify request failed', err);
    return { ok: false, verifiedAt: Date.now(), key };
  }
}

async function doLicenseVerify(msg: LicenseVerifyMsg) {
  const result = await verifyLicenseRemote(msg.key.trim(), msg.email?.trim());
  await writeLicense(result.ok ? result : null);
  cachedLicenseOk = result.ok;
  figma.ui.postMessage({ type: 'license-status', license: publicLicenseView(result) });
  // Push fresh usage state so UI removes / shows the daily counter promptly.
  void doUsageGet();
  if (result.ok) {
    figma.notify('Navii Pro unlocked. Thanks!');
  } else {
    figma.notify('License key invalid or expired', { error: true });
  }
}

async function doLicenseRestore() {
  const cached = await readLicense();
  if (!cached) {
    cachedLicenseOk = false;
    figma.ui.postMessage({ type: 'license-status', license: { ok: false } });
    void doUsageGet();
    return;
  }
  const stale = Date.now() - cached.verifiedAt > LICENSE_REVALIDATE_MS;
  if (!stale) {
    cachedLicenseOk = true;
    figma.ui.postMessage({ type: 'license-status', license: publicLicenseView(cached) });
    // Push a fresh usage snapshot now that we know Pro state — otherwise the
    // UI's earlier usage-get could've raced ahead of license restore and
    // reported pro:false, leaving the chip stuck on "10 of 10 left today".
    void doUsageGet();
    return;
  }
  // Stale — re-verify silently using the cached key (kept main-thread only).
  const fresh = await verifyLicenseRemote(cached.key);
  await writeLicense(fresh.ok ? fresh : null);
  cachedLicenseOk = fresh.ok;
  figma.ui.postMessage({ type: 'license-status', license: publicLicenseView(fresh) });
  void doUsageGet();
}

async function doLicenseClear() {
  await writeLicense(null);
  cachedLicenseOk = false;
  figma.ui.postMessage({ type: 'license-status', license: { ok: false } });
  void doUsageGet();
  figma.notify('Pro license removed from this device');
}

// ---------- Brand mode: list local color variables ----------
//
// Only the main thread can call figma.variables.* APIs. UI iframe receives
// the resolved hex list and shows the picker.

interface VariableEntry {
  id: string;
  name: string;
  collection: string;
  hex: string;
  source: 'variable' | 'style';
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

/**
 * Resolve a variable value to a concrete RGB. Follows VARIABLE_ALIAS chains
 * up to `maxDepth` hops to defend against pathological cycles.
 */
async function resolveColorValue(
  value: VariableValue,
  modeId: string,
  visited: Set<string> = new Set(),
  maxDepth = 8,
): Promise<{ r: number; g: number; b: number } | null> {
  if (maxDepth <= 0) return null;
  if (!value || typeof value !== 'object') return null;
  if ('r' in value && 'g' in value && 'b' in value) {
    return { r: value.r, g: value.g, b: value.b };
  }
  if ('type' in value && value.type === 'VARIABLE_ALIAS' && 'id' in value) {
    if (visited.has(value.id)) return null;
    visited.add(value.id);
    try {
      const aliased = await figma.variables.getVariableByIdAsync(value.id);
      if (!aliased) return null;
      const aliasedValue = aliased.valuesByMode[modeId] ?? Object.values(aliased.valuesByMode)[0];
      if (!aliasedValue) return null;
      return resolveColorValue(aliasedValue, modeId, visited, maxDepth - 1);
    } catch {
      return null;
    }
  }
  return null;
}

async function doListVariables() {
  try {
    // getLocalVariablesAsync returns BOTH file-local variables AND library
    // variables that have been imported into this file. Designers using a
    // shared design system see their library colors here as long as the
    // collection is linked.
    const [collections, variables] = await Promise.all([
      figma.variables.getLocalVariableCollectionsAsync(),
      figma.variables.getLocalVariablesAsync('COLOR'),
    ]);
    const byId = new Map(collections.map((c) => [c.id, c]));

    const entries: VariableEntry[] = [];
    for (const v of variables) {
      const collection = byId.get(v.variableCollectionId);
      const modeId = collection?.defaultModeId;
      if (!modeId) continue;
      const value = v.valuesByMode[modeId];
      if (!value) continue;
      // Follow aliases (common in design systems — semantic tokens point to primitives).
      const rgb = await resolveColorValue(value, modeId);
      if (!rgb) continue;
      entries.push({
        id: v.id,
        name: v.name,
        // Tag library-imported variables so the UI can group them.
        collection: collection?.name ?? 'Local',
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        source: 'variable',
      });
    }

    // ALSO include local paint styles. Teams that haven't migrated to
    // variables still rely on styles — design systems shipped before Figma
    // Variables existed live here.
    try {
      const paintStyles = await figma.getLocalPaintStylesAsync();
      for (const style of paintStyles) {
        const solid = style.paints.find((p) => p.type === 'SOLID');
        if (!solid || solid.type !== 'SOLID') continue;
        entries.push({
          id: style.id,
          name: style.name,
          collection: 'Styles',
          hex: rgbToHex(solid.color.r, solid.color.g, solid.color.b),
          source: 'style',
        });
      }
    } catch (err) {
      console.warn('navii: paint styles fetch failed', err);
    }

    // ALSO pull from linked design system libraries. getLocalVariablesAsync
    // only returns file-local variables — imported library variables are NOT
    // included. To surface them, we walk the available library collections,
    // import each COLOR variable, and resolve its hex.
    //
    // Side effect: importVariableByKeyAsync gives the file access to the
    // library variable (so it can be bound later). It does NOT duplicate the
    // variable into the file or change the library's source of truth.
    let availableLibraries: { name: string; libraryName?: string }[] = [];
    try {
      const libCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
      for (const libColl of libCollections) {
        availableLibraries.push({
          name: libColl.name,
          libraryName: libColl.libraryName,
        });
        try {
          const libVars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(libColl.key);
          for (const libVar of libVars) {
            if (libVar.resolvedType !== 'COLOR') continue;
            try {
              const imported = await figma.variables.importVariableByKeyAsync(libVar.key);
              // Library variables may use a different mode id space; pick the
              // first available mode to read a representative value.
              const modeIds = Object.keys(imported.valuesByMode);
              if (modeIds.length === 0) continue;
              const modeId = modeIds[0]!;
              const value = imported.valuesByMode[modeId];
              if (!value) continue;
              const rgb = await resolveColorValue(value, modeId);
              if (!rgb) continue;
              entries.push({
                id: imported.id,
                name: libVar.name,
                collection: libColl.libraryName
                  ? `${libColl.libraryName} · ${libColl.name}`
                  : libColl.name,
                hex: rgbToHex(rgb.r, rgb.g, rgb.b),
                source: 'variable',
              });
            } catch (err) {
              // Some variables may fail to import (permissions, deleted, etc.) — skip.
              console.warn('navii: failed to import library variable', libVar.name, err);
            }
          }
        } catch (err) {
          console.warn('navii: failed to list variables in library collection', libColl.name, err);
        }
      }
    } catch {
      // teamLibrary may be unavailable (e.g., file isn't connected to libraries).
    }

    // Figma plugin API doesn't expose a list of library *styles* — only
    // library variable collections. Library color styles will appear in the
    // entry list above once the user inserts at least one node using them
    // (Figma imports the style locally at that point). Nothing else to do.

    figma.ui.postMessage({
      type: 'variables-list',
      variables: entries,
      availableLibraries,
    });
  } catch (err) {
    console.error('navii: list-variables failed', err);
    figma.ui.postMessage({
      type: 'variables-list',
      variables: [],
      availableLibraries: [],
      error: String(err),
    });
  }
}

async function doCopyUrl(msg: CopyUrlMsg) {
  const url = buildUrl(msg.seed, msg.options);
  figma.ui.postMessage({ type: 'url', url });
}

// ---------- Saved mascot presets ----------
//
// Per-user storage via figma.clientStorage. Persists across files. Pro-only —
// the gate lives in the UI iframe (isPaid() check) since the storage itself is
// inert without a way to load presets back into a renderable spec.

const PRESETS_STORAGE_KEY = 'navii.presets';
const PRESETS_MAX = 100;

async function readPresets(): Promise<MascotPreset[]> {
  try {
    const stored = await figma.clientStorage.getAsync(PRESETS_STORAGE_KEY);
    if (!Array.isArray(stored)) return [];
    return stored as MascotPreset[];
  } catch {
    return [];
  }
}

async function writePresets(list: MascotPreset[]): Promise<void> {
  try {
    await figma.clientStorage.setAsync(PRESETS_STORAGE_KEY, list);
  } catch {
    // clientStorage rarely fails; non-fatal.
  }
}

async function doPresetList() {
  const list = await readPresets();
  figma.ui.postMessage({ type: 'presets', presets: list });
}

async function doPresetSave(msg: { preset: MascotPreset }) {
  const list = await readPresets();
  const idx = list.findIndex((p) => p.id === msg.preset.id);
  if (idx >= 0) {
    list[idx] = msg.preset;
  } else {
    list.unshift(msg.preset);
    if (list.length > PRESETS_MAX) list.length = PRESETS_MAX;
  }
  await writePresets(list);
  figma.ui.postMessage({ type: 'presets', presets: list });
}

async function doPresetDelete(msg: { id: string }) {
  const list = await readPresets();
  const next = list.filter((p) => p.id !== msg.id);
  if (next.length === list.length) return;
  await writePresets(next);
  figma.ui.postMessage({ type: 'presets', presets: next });
}
