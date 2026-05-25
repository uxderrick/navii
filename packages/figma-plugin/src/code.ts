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
};

type InsertBuildMsg = {
  type: 'insert-build';
  spec: BuildSpec;
  options: AvatarOptions;
  svg?: string;
  bytes?: Uint8Array;
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
  | { type: 'close' };

figma.showUI(__html__, { width: 760, height: 640, themeColors: true });

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
    case 'close':          return figma.closePlugin();
  }
};

// On startup, restore cached license + revalidate if stale (>24h).
void doLicenseRestore();

function buildUrl(seed: string, opts: AvatarOptions, ext = ''): string {
  // QuickJS (Figma main thread) lacks URLSearchParams — build manually.
  const parts: string[] = [];
  if (opts.size) parts.push(`size=${opts.size}`);
  if (opts.paletteId) parts.push(`palette=${encodeURIComponent(opts.paletteId)}`);
  if (typeof opts.background === 'string') parts.push(`background=${opts.background}`);
  if (opts.tileBg) parts.push(`tileBg=${encodeURIComponent(opts.tileBg)}`);
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

async function doInsert(msg: InsertMsg) {
  // Selection-aware: shapes selected → image-fill each one with the seed.
  // No selection → create new SVG node at viewport center.
  const fillable = fillableSelection();
  if (fillable.length > 0) {
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
  // Selection-aware: shapes selected → image-fill each one with the rasterized
  // build PNG (sent from UI). No selection → place new SVG node.
  const fillable = fillableSelection();
  if (fillable.length > 0 && msg.bytes) {
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
  figma.ui.postMessage({ type: 'license-status', license: result });
  if (result.ok) {
    figma.notify('Navii Pro unlocked. Thanks!');
  } else {
    figma.notify('License key invalid or expired', { error: true });
  }
}

async function doLicenseRestore() {
  const cached = await readLicense();
  if (!cached) {
    figma.ui.postMessage({ type: 'license-status', license: { ok: false } });
    return;
  }
  const stale = Date.now() - cached.verifiedAt > LICENSE_REVALIDATE_MS;
  if (!stale) {
    figma.ui.postMessage({ type: 'license-status', license: cached });
    return;
  }
  // Stale — re-verify silently.
  const fresh = await verifyLicenseRemote(cached.key);
  await writeLicense(fresh.ok ? fresh : null);
  figma.ui.postMessage({ type: 'license-status', license: fresh });
}

async function doLicenseClear() {
  await writeLicense(null);
  figma.ui.postMessage({ type: 'license-status', license: { ok: false } });
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
