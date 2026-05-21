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

export type BodyShapeId = 'orb' | 'tall' | 'squat' | 'pear' | 'pebble';
export type EyeStyleId = 'round' | 'wide' | 'squint' | 'wink' | 'sleepy' | 'star';
export type MouthStyleId = 'smile' | 'grin' | 'open' | 'flat' | 'smirk' | 'awe';
export type AntennaStyleId = 'none' | 'classic' | 'curl' | 'double' | 'spike';
export type AccessoryId = 'none' | 'blush' | 'freckles' | 'sparkle';
export type BackgroundId = 'none' | 'solid' | 'ring';
export type TopperId =
  | 'none'
  | 'ears'
  | 'roundEars'
  | 'horn'
  | 'horns'
  | 'tuft'
  | 'cap'
  | 'leaf';

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
}
