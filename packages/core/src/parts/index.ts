export * from './palette.js';
export * from './body.js';
export * from './eyes.js';
export * from './mouth.js';
export * from './antenna.js';
export * from './accessory.js';
export * from './background.js';
export * from './topper.js';
export * from './anchor.js';

import type {
  AccessoryId,
  AntennaStyleId,
  BackgroundId,
  BodyShapeId,
  EyeStyleId,
  MouthStyleId,
  TopperId,
} from '../types.js';

export const BODY_IDS: readonly BodyShapeId[] = ['orb', 'tall', 'squat', 'pear', 'pebble'];
export const EYE_IDS: readonly EyeStyleId[] = ['round', 'wide', 'squint', 'wink', 'sleepy', 'star'];
export const MOUTH_IDS: readonly MouthStyleId[] = ['smile', 'grin', 'open', 'flat', 'smirk', 'awe'];
export const ANTENNA_IDS: readonly AntennaStyleId[] = ['none', 'classic', 'curl', 'double', 'spike'];
export const ACCESSORY_IDS: readonly AccessoryId[] = ['none', 'blush', 'freckles', 'sparkle'];
export const BACKGROUND_IDS: readonly BackgroundId[] = ['none', 'solid', 'ring'];
export const TOPPER_IDS: readonly TopperId[] = [
  'none', 'none', 'ears', 'roundEars', 'horn', 'horns', 'tuft', 'cap', 'leaf',
];
