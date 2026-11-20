import { Easing } from 'react-native-reanimated';

type Pose = {
  y?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
};

type Keyframe = Pose & { at: number };

// Mirror the poses in core's SVG keyframes. The generated SVG supplies the
// duration and seed-specific start delay for each motion.
const motions = {
  body: {
    name: 'n-float',
    frames: [
      { at: 0 },
      { at: 0.25, y: -2, rotation: -1.6, scaleX: 1.025, scaleY: 0.975 },
      { at: 0.5, y: -4.5, scaleX: 0.985, scaleY: 1.025 },
      { at: 0.75, y: -2, rotation: 1.6, scaleX: 1.025, scaleY: 0.975 },
      { at: 1 },
    ],
  },
  eyes: {
    name: 'n-blink',
    frames: [
      { at: 0 },
      { at: 0.85 },
      { at: 0.87, scaleY: 0.06 },
      { at: 0.89, scaleY: 0.06 },
      { at: 0.91 },
      { at: 0.93, scaleY: 0.06 },
      { at: 0.95, scaleY: 0.06 },
      { at: 1 },
    ],
  },
  antenna: {
    name: 'n-sway',
    frames: [{ at: 0 }, { at: 0.25, rotation: -5 }, { at: 0.75, rotation: 5 }, { at: 1 }],
  },
  spark: {
    name: 'n-pulse',
    frames: [
      { at: 0, opacity: 0.55 },
      { at: 0.5, opacity: 1, scaleX: 1.32, scaleY: 1.32 },
      { at: 1, opacity: 0.55 },
    ],
  },
  sparkle: {
    name: 'n-twinkle',
    frames: [
      { at: 0, opacity: 0.3, scaleX: 0.85, scaleY: 0.85 },
      { at: 0.5, opacity: 1, rotation: 180, scaleX: 1.12, scaleY: 1.12 },
      { at: 1, opacity: 0.3, scaleX: 0.85, scaleY: 0.85 },
    ],
  },
} as const satisfies Record<string, { name: string; frames: readonly [Keyframe, ...Keyframe[]] }>;

export type MotionPart = keyof typeof motions;
export type MotionTiming = { duration: number; delay: number };
export type MotionTimings = ReadonlyMap<string, MotionTiming>;

export function readMotionTimings(svg: string): MotionTimings {
  const timings = new Map<string, MotionTiming>();
  const style = /<style>([\s\S]*?)<\/style>/.exec(svg)?.[1] ?? '';
  const declarations = /animation: (n-\w+) (\d+(?:\.\d+)?)s [^;]+; animation-delay: (\d+(?:\.\d+)?)s;/g;
  for (const [, name, duration, delay] of style.matchAll(declarations)) {
    if (name && duration && delay) {
      timings.set(name, { duration: Number(duration) * 1000, delay: Number(delay) * 1000 });
    }
  }
  return timings;
}

export function isMotionPart(name: unknown): name is MotionPart {
  return typeof name === 'string' && Object.hasOwn(motions, name);
}

export function getMotion(part: MotionPart, timings: MotionTimings) {
  const { name, frames } = motions[part];
  const timing = timings.get(name);
  return timing && { ...timing, frames };
}

const easeInOut = Easing.bezierFn(0.42, 0, 0.58, 1);

function lerp(from: number, to: number, progress: number): number {
  'worklet';
  return from + (to - from) * progress;
}

export function motionProps(
  elapsed: number,
  timing: MotionTiming,
  frames: readonly [Keyframe, ...Keyframe[]],
  originX: number,
  originY: number,
  restingOpacity: number,
) {
  'worklet';
  if (elapsed < timing.delay) {
    return { matrix: [1, 0, 0, 1, 0, 0], opacity: restingOpacity };
  }

  const phase = ((elapsed - timing.delay) % timing.duration) / timing.duration;
  let from = frames[0];
  let to = from;
  for (const frame of frames) {
    to = frame;
    if (frame.at >= phase) break;
    from = frame;
  }
  const progress = from === to ? 0 : easeInOut((phase - from.at) / (to.at - from.at));
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
