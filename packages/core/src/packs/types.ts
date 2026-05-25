/**
 * Pack type definitions.
 *
 * A Pack is a themed bundle of palettes + (eventually) parts that opt-in
 * extends the deterministic selection pool. Packs are referenced by id in
 * `AvatarOptions.packs` — when enabled, their content joins the base pool
 * for that render call.
 *
 * Identity rule: every variant a pack ships must have a NAMESPACED id of the
 * form `<packId>/<localId>` (e.g. `office/suit-body`) to guarantee no
 * collisions with base variants or other packs.
 *
 * Determinism: same `seed` + same enabled `packs` (order-insensitive, by id
 * set) produce byte-identical output. Enabling a new pack will shift seeds
 * that previously rendered against the base pool — by design (that's the
 * "unlock" value).
 */

import type {
  AccessoryId,
  AntennaStyleId,
  BackgroundId,
  BodyShapeId,
  EyeStyleId,
  MouthStyleId,
  OutfitId,
  Palette,
  StyleHint,
  TopperId,
} from '../types.js';

/**
 * Part subset constraints. When a pack with `picks` is enabled, the named
 * part type is restricted to the listed ids — `selectAvatar` will only pick
 * from this subset (intersected with other enabled packs' picks). This is
 * how a pack can make avatars feel themed even without shipping new SVG art:
 * Office restricts to clean bodies + simple features + no antenna, Halloween
 * picks creepy bodies + fang mouths + dark toppers, etc.
 *
 * Empty/undefined arrays = "no opinion, fall back to base pool".
 */
export interface PackPicks {
  body?: readonly BodyShapeId[];
  eyes?: readonly EyeStyleId[];
  mouth?: readonly MouthStyleId[];
  antenna?: readonly AntennaStyleId[];
  accessory?: readonly AccessoryId[];
  topper?: readonly TopperId[];
  background?: readonly BackgroundId[];
  /**
   * Constrain the outfit slot. Unlike base avatars (where outfit is always
   * 'none' from seed selection), a pack can force outfits like ties, scarves,
   * collars — gives the pack a wardrobe signature.
   */
  outfit?: readonly OutfitId[];
}

export interface Pack {
  /** Stable identifier. Used as namespace prefix for variant ids. */
  id: string;
  /** Display name shown in plugin UI. */
  name: string;
  /** One-line description for marketing copy. */
  description: string;
  /** Optional emoji glyph for compact UI badges. */
  emoji?: string;
  /**
   * ISO-8601 date string. If set and Date.now() < this date, plugin/UI
   * should treat the pack as "Coming soon" and refuse activation even for
   * Pro users. Core itself does not enforce — host code does.
   */
  unlockDate?: string;
  /**
   * Palettes contributed by this pack. Each palette id should already be
   * unique (e.g. prefixed with the pack id like `office:navy`) to avoid
   * collision with the 22 base palettes.
   */
  palettes?: Palette[];
  /**
   * Constrain selection pools for each part type. Used to give packs a
   * cohesive visual identity (e.g. Office allows no antenna, Halloween
   * forces fang mouths). When multiple packs are enabled, their picks are
   * INTERSECTED — only ids present in every enabled pack's pick list
   * survive. If the intersection is empty, fall back to the union to avoid
   * blank renders.
   */
  picks?: PackPicks;
  /**
   * Render style flags — pack-level directives that bypass the seeded 3D look.
   *
   * - `flat`: solid body fill, no gradient, no sheen, no ground shadow.
   *   Editorial / corporate look. Used by Office.
   * - `bgColor`: opaque full-bleed background of this color. Replaces the
   *   seeded background id entirely. e.g. `#FFFFFF` for ID-badge plate.
   * - `paletteExclusive`: when true, AvatarSpec selection only draws palettes
   *   from THIS pack's `palettes` list (intersected with base if no pack
   *   palettes exist). Prevents pack-themed avatars from accidentally using
   *   off-theme base colors.
   */
  flat?: boolean;
  bgColor?: string;
  paletteExclusive?: boolean;
  /**
   * Multiplier on face-feature stroke width (eyes, mouth, glasses lines).
   * Default = 1. Higher values = bolder face lines, useful for editorial
   * packs (Office uses ~1.4).
   */
  featureStroke?: number;
  /**
   * Apply an outer-glow halo behind the body silhouette. Used by Neon to
   * give bright bodies a soft cyberpunk light bleed on the dark plate.
   */
  glow?: boolean;
  /**
   * Style-hint to part-subset mapping. When `AvatarOptions.style` is set to
   * one of `masc`/`femme`/`neutral`, the corresponding sub-pools are
   * INTERSECTED with the pack's normal picks. The seed still drives the
   * actual pick — the hint only narrows the candidate pool.
   *
   * Packs that don't define a given style key (or omit this field entirely)
   * fall through to the normal picks for that part.
   */
  styleHints?: {
    masc?: StylePartSubset;
    femme?: StylePartSubset;
    neutral?: StylePartSubset;
  };
  // Part variants (new SVG art) come in a future PR — placeholder slots:
  // bodies?: BodyVariant[]
  // eyes?: EyeVariant[]
  // mouths?: MouthVariant[]
  // antennae?: AntennaVariant[]
  // accessories?: AccessoryVariant[]
  // toppers?: TopperVariant[]
}

/** Read-only registry shape — host code passes one to select/render. */
export type PackRegistry = Record<string, Pack>;

/**
 * Subset of parts a pack restricts when a specific style hint is requested.
 * Only the parts most expressive of gender presentation are listed: outfit,
 * accessory, topper. Bodies + faces stay seed-driven.
 */
export interface StylePartSubset {
  outfit?: readonly OutfitId[];
  accessory?: readonly AccessoryId[];
  topper?: readonly TopperId[];
}
