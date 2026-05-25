/**
 * Public types for the Navii avatar engine.
 *
 * AvatarSpec is the resolved description of an individual avatar — a tuple of
 * part IDs derived from the seed. The renderer turns it into SVG markup.
 */

export interface Palette {
  id: string;
  bodyFrom: string;
  bodyTo: string;
  accent: string;
  ink: string;
  blush: string;
}

export type BodyShapeId =
  | 'orb' | 'tall' | 'squat' | 'pear' | 'pebble'
  | 'dumpling' | 'taro' | 'wisp' | 'squircle'
  // Halloween pack-only bodies (kept out of base BODY_IDS to preserve seeds)
  | 'pumpkin' | 'ghost' | 'skullHead';
export type EyeStyleId =
  | 'round' | 'wide' | 'squint' | 'wink' | 'sleepy' | 'star'
  | 'heart' | 'oval' | 'dot' | 'cross';
export type MouthStyleId =
  | 'smile' | 'grin' | 'open' | 'flat' | 'smirk' | 'awe'
  | 'tongue' | 'tooth' | 'wave' | 'dot'
  // Halloween pack-only mouths
  | 'jagged' | 'fangs';
export type AntennaStyleId = 'none' | 'classic' | 'curl' | 'double' | 'spike';
export type AccessoryId =
  | 'none' | 'blush' | 'freckles' | 'sparkle'
  | 'glasses' | 'eyepatch' | 'mole' | 'earring';
export type BackgroundId = 'none' | 'solid' | 'ring';
export type TopperId =
  | 'none' | 'ears' | 'roundEars' | 'horn' | 'horns' | 'tuft' | 'cap' | 'leaf'
  | 'headband' | 'halo' | 'crown' | 'antlers'
  | 'bob' | 'bun' | 'ponytail'
  // Halloween pack-only toppers
  | 'witchHat' | 'pumpkinStem' | 'ghostSheet';
export type OutfitId =
  | 'none' | 'collar' | 'scarf' | 'bowtie' | 'sunflower' | 'necklace' | 'tie';

/**
 * Optional style hint used to bias seeded picks toward a gender expression.
 *
 * The pack defines a mapping for each value (outfit + accessory + topper
 * subsets). When set, those subsets intersect with the pack's normal picks.
 * `neutral` is the default fallback when a pack lacks a specific mapping.
 *
 * Packs that don't declare styleHints simply ignore this option.
 */
export type StyleHint = 'masc' | 'femme' | 'neutral';

export interface AvatarSpec {
  seed: string;
  palette: Palette;
  body: BodyShapeId;
  eyes: EyeStyleId;
  mouth: MouthStyleId;
  antenna: AntennaStyleId;
  accessory: AccessoryId;
  background: BackgroundId;
  topper: TopperId;
  outfit: OutfitId;

  // Continuous tweaks — extend the 1.4M discrete combos toward unbounded.
  /** Hue rotation applied to body fill via SVG feColorMatrix. Degrees, signed. */
  hueShift: number;
  /** Uniform scale on body group. ~0.92 to 1.08. */
  bodyScale: number;
  /** Adjustment to anchor.eyeOffset (px in viewBox units). Signed. */
  eyeGapShift: number;
  /** Multiplier on mouth span. ~0.85 to 1.15. */
  mouthCurveScale: number;
  /** Antenna rotation in degrees. Signed. */
  antennaTilt: number;

  /**
   * Flat render mode — when true, body uses solid fill (no radial gradient),
   * no sheen, no ground shadow. Used by packs that want a 2D editorial look
   * (Office ID-badge, etc.). Set by `selectAvatar` from pack flags.
   */
  flat?: boolean;
  /**
   * Override background paint — when set, render emits an opaque full-bleed
   * rect of this color and skips the seeded background id. Used by packs to
   * force a specific plate (e.g. Office → pure white).
   */
  bgColor?: string;
  /**
   * Multiplier on the stroke width of face features (eyes, mouth, glasses
   * accessory lines). Default = 1 (baseline 1.7-1.8 px in viewBox units).
   * Packs like Office bump to ~1.4 for bolder editorial face features.
   */
  featureStroke?: number;
  /**
   * When true, body silhouette gets a soft outer glow halo (Gaussian blur
   * behind the sharp body). Used by Neon for cyberpunk signage feel.
   */
  glow?: boolean;
}

export interface AvatarOptions {
  /** Output canvas size in px. SVG renders at viewBox 100x100; width/height attrs scale it. */
  size?: number;
  /** Override background. By default the seed picks. */
  background?: BackgroundId | { color: string };
  /** Override palette id (forces a specific color family). */
  paletteId?: string;
  /**
   * Inject a fully custom palette object (overrides `paletteId`). Useful for
   * brand palettes derived at runtime — the avatar still picks deterministic
   * parts from the seed but renders in your custom colors.
   */
  palette?: Palette;
  /**
   * Enable themed packs (premium content). Pack ids resolve against the
   * built-in registry; unknown ids are silently skipped. When packs are
   * enabled their palettes + (future) parts merge into the selection pool,
   * so the same seed renders differently from the base pool.
   *
   * Empty/undefined → base pool only (preserves existing seed outputs).
   */
  packs?: readonly string[];
  /**
   * Bias seeded picks toward a gender expression (`masc` | `femme` | `neutral`).
   * Only takes effect when an enabled pack defines `styleHints` for the value.
   * Determinism preserved: same seed + same style = same output.
   */
  style?: StyleHint;
  /** Add `role="img"` and `aria-label`. */
  title?: string;
  /** Emit idle animations (float, blink, antenna pulse, sparkle twinkle). Default false. */
  animated?: boolean;
  /**
   * Opaque circular background behind the avatar (clipped to disc).
   * Examples: `'#ffffff'`, `'#0b0b0c'`, `'auto'` (palette accent).
   * When set, avatar renders as a filled tile rather than a transparent figure.
   */
  tileBg?: string;
}
