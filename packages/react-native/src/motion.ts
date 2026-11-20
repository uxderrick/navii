import { avatarMotion, type AvatarMotionPose } from '@usenavii/core/parts';
import { Easing } from 'react-native-reanimated';

type Keyframe = AvatarMotionPose & { at: number; pose: number };
export type MotionPart = keyof typeof avatarMotion;
export type MotionTiming = { duration: number; delay: number };

const framesByPart = {
  body: flattenFrames(avatarMotion.body.frames),
  eyes: flattenFrames(avatarMotion.eyes.frames),
  antenna: flattenFrames(avatarMotion.antenna.frames),
  spark: flattenFrames(avatarMotion.spark.frames),
  sparkle: flattenFrames(avatarMotion.sparkle.frames),
};

function flattenFrames(frames: readonly (AvatarMotionPose & { readonly at: readonly number[] })[]): Keyframe[] {
  return frames.flatMap(({ at, ...values }, pose) =>
    at.map((percent) => ({ ...values, at: percent / 100, pose })),
  ).sort((left, right) => left.at - right.at);
}

export function isMotionPart(name: unknown): name is MotionPart {
  return typeof name === 'string' && Object.hasOwn(avatarMotion, name);
}

export function getMotion(part: MotionPart, delay: string) {
  return {
    duration: avatarMotion[part].duration * 1000,
    delay: Number(delay) * 1000,
    frames: framesByPart[part],
  };
}

const easeInOut = Easing.bezierFn(0.42, 0, 0.58, 1);

/** Keep the derived phase constant while a sequence of keyframes shares a pose. */
export function motionPhase(elapsed: number, timing: MotionTiming, frames: readonly Keyframe[]): number {
  'worklet';
  if (elapsed < timing.delay) return -1;
  const phase = ((elapsed - timing.delay) % timing.duration) / timing.duration;
  let from = frames[0];
  for (const to of frames) {
    if (from && phase <= to.at) return from.pose === to.pose ? from.at : phase;
    from = to;
  }
  return phase;
}

function lerp(from: number, to: number, progress: number): number {
  'worklet';
  return from + (to - from) * progress;
}

export function motionProps(
  phase: number,
  frames: readonly Keyframe[],
  originX: number,
  originY: number,
  restingOpacity: number,
) {
  'worklet';
  let from = frames[0];
  let to = from;
  if (phase < 0 || !from || !to) {
    return { matrix: [1, 0, 0, 1, 0, 0], opacity: restingOpacity };
  }

  for (const frame of frames) {
    to = frame;
    if (frame.at >= phase) break;
    from = frame;
  }
  const progress = from.at === to.at ? 0 : easeInOut((phase - from.at) / (to.at - from.at));
  const y = lerp(from.y ?? 0, to.y ?? 0, progress);
  const angle = lerp(from.rotation ?? 0, to.rotation ?? 0, progress) * Math.PI / 180;
  const scaleX = lerp(from.scaleX ?? 1, to.scaleX ?? 1, progress);
  const scaleY = lerp(from.scaleY ?? 1, to.scaleY ?? 1, progress);
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const a = cosine * scaleX;
  const b = sine * scaleX;
  const c = -sine * scaleY;
  const d = cosine * scaleY;
  return {
    matrix: [
      a, b, c, d,
      originX - a * originX - c * originY,
      y + originY - b * originX - d * originY,
    ],
    opacity: lerp(from.opacity ?? restingOpacity, to.opacity ?? restingOpacity, progress),
  };
}
