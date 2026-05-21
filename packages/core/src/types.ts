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
  | 'dumpling' | 'taro' | 'wisp';
export type EyeStyleId =
  | 'round' | 'wide' | 'squint' | 'wink' | 'sleepy' | 'star'
  | 'heart' | 'oval' | 'dot' | 'cross';
export type MouthStyleId =
  | 'smile' | 'grin' | 'open' | 'flat' | 'smirk' | 'awe'
  | 'tongue' | 'tooth' | 'wave' | 'dot';
export type AntennaStyleId = 'none' | 'classic' | 'curl' | 'double' | 'spike';
export type AccessoryId =
  | 'none' | 'blush' | 'freckles' | 'sparkle'
  | 'glasses' | 'eyepatch' | 'mole';
export type BackgroundId = 'none' | 'solid' | 'ring';
export type TopperId =
  | 'none' | 'ears' | 'roundEars' | 'horn' | 'horns' | 'tuft' | 'cap' | 'leaf'
  | 'headband' | 'halo' | 'crown' | 'antlers';

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
}

export interface AvatarOptions {
  /** Output canvas size in px. SVG renders at viewBox 100x100; width/height attrs scale it. */
  size?: number;
  /** Override background. By default the seed picks. */
  background?: BackgroundId | { color: string };
  /** Override palette id (forces a specific color family). */
  paletteId?: string;
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
