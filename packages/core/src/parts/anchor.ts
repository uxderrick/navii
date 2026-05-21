import type { BodyShapeId } from '../types.js';

/**
 * Face anchors define where features attach for each body silhouette.
 *
 * Without anchors, every body wears the same face at the same coordinates and
 * the avatar reads as "AI-generated." With anchors, a tall egg-shaped body has
 * a higher, narrower face than a squat mushroom-shaped one, and antenna mounts
 * follow each silhouette's actual apex.
 *
 * All coordinates are in the 100x100 viewBox.
 */
export interface FaceAnchor {
  /** Center of the face for symmetry math. */
  cx: number;
  /** Vertical line where eyes sit. */
  eyeY: number;
  /** Horizontal distance from cx to each eye center. */
  eyeOffset: number;
  /** Vertical eye size scale (1.0 = baseline). */
  eyeScale: number;
  /** Vertical line where the mouth sits. */
  mouthY: number;
  /** Mouth horizontal half-width (smile arc spans cx ± this). */
  mouthSpan: number;
  /** Where the antenna / topper mounts on the body. */
  topperX: number;
  topperY: number;
  /** Body's lowest point — used by ground shadow. */
  groundY: number;
  /** Body's leftmost / rightmost extents at the eye line — for cheek blush placement. */
  cheekY: number;
  cheekOffset: number;
}

export const ANCHORS: Record<BodyShapeId, FaceAnchor> = {
  orb: {
    cx: 50, eyeY: 52, eyeOffset: 10, eyeScale: 1.0,
    mouthY: 62, mouthSpan: 7,
    topperX: 50, topperY: 22,
    groundY: 86,
    cheekY: 58, cheekOffset: 18,
  },
  tall: {
    cx: 50, eyeY: 49, eyeOffset: 8, eyeScale: 1.05,
    mouthY: 60, mouthSpan: 6,
    topperX: 50, topperY: 18,
    groundY: 91,
    cheekY: 55, cheekOffset: 14,
  },
  squat: {
    cx: 50, eyeY: 56, eyeOffset: 11, eyeScale: 0.95,
    mouthY: 66, mouthSpan: 8,
    topperX: 50, topperY: 30,
    groundY: 86,
    cheekY: 62, cheekOffset: 20,
  },
  pear: {
    cx: 50, eyeY: 51, eyeOffset: 9, eyeScale: 1.0,
    mouthY: 60, mouthSpan: 6.5,
    topperX: 50, topperY: 24,
    groundY: 90,
    cheekY: 57, cheekOffset: 15,
  },
  pebble: {
    cx: 50, eyeY: 54, eyeOffset: 10.5, eyeScale: 1.0,
    mouthY: 63, mouthSpan: 7.5,
    topperX: 53, topperY: 23,
    groundY: 85,
    cheekY: 59, cheekOffset: 19,
  },
  dumpling: {
    cx: 50, eyeY: 58, eyeOffset: 11, eyeScale: 0.98,
    mouthY: 68, mouthSpan: 8,
    topperX: 50, topperY: 32,
    groundY: 88,
    cheekY: 64, cheekOffset: 21,
  },
  taro: {
    cx: 50, eyeY: 50, eyeOffset: 9, eyeScale: 1.02,
    mouthY: 60, mouthSpan: 6.5,
    topperX: 50, topperY: 14,
    groundY: 91,
    cheekY: 55, cheekOffset: 14,
  },
  wisp: {
    cx: 50, eyeY: 47, eyeOffset: 7.5, eyeScale: 1.08,
    mouthY: 58, mouthSpan: 5.5,
    topperX: 50, topperY: 12,
    groundY: 94,
    cheekY: 53, cheekOffset: 12,
  },
};
