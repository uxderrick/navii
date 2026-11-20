import type { AvatarSpec } from './types.js';
import { createRng } from './prng.js';

export type AvatarMotionPose = {
  readonly y?: number;
  readonly rotation?: number;
  readonly scaleX?: number;
  readonly scaleY?: number;
  readonly opacity?: number;
};

type Keyframe = AvatarMotionPose & { readonly at: readonly number[] };

export const avatarMotion = {
  body: {
    name: 'n-float',
    duration: 3.4,
    origin: [50, 80],
    frames: [
      { at: [0, 100], y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      { at: [25], y: -2, rotation: -1.6, scaleX: 1.025, scaleY: 0.975 },
      { at: [50], y: -4.5, rotation: 0, scaleX: 0.985, scaleY: 1.025 },
      { at: [75], y: -2, rotation: 1.6, scaleX: 1.025, scaleY: 0.975 },
    ],
  },
  eyes: {
    name: 'n-blink',
    duration: 5.4,
    origin: [50, 52],
    frames: [
      { at: [0, 85, 91, 100], scaleY: 1 },
      { at: [87, 89, 93, 95], scaleY: 0.06 },
    ],
  },
  antenna: {
    name: 'n-sway',
    duration: 3.6,
    frames: [
      { at: [0, 100], rotation: 0 },
      { at: [25], rotation: -5 },
      { at: [75], rotation: 5 },
    ],
  },
  spark: {
    name: 'n-pulse',
    duration: 1.9,
    frames: [
      { at: [0, 100], opacity: 0.55, scaleX: 1, scaleY: 1 },
      { at: [50], opacity: 1, scaleX: 1.32, scaleY: 1.32 },
    ],
  },
  sparkle: {
    name: 'n-twinkle',
    duration: 2.2,
    frames: [
      { at: [0, 100], opacity: 0.3, rotation: 0, scaleX: 0.85, scaleY: 0.85 },
      { at: [50], opacity: 1, rotation: 180, scaleX: 1.12, scaleY: 1.12 },
    ],
  },
} as const;

export function avatarMotionDelays(seed: string): Record<keyof typeof avatarMotion, string> {
  const rng = createRng(`anim:${seed}`);
  return {
    body: (rng.next() * 2).toFixed(2),
    eyes: (rng.next() * 5).toFixed(2),
    spark: (rng.next() * 1.5).toFixed(2),
    sparkle: (rng.next() * 1.8).toFixed(2),
    antenna: (rng.next() * 2.4).toFixed(2),
  };
}

function keyframes<Frame extends Keyframe>(
  motion: { name: string; frames: readonly Frame[] },
  labelWidth: number,
  declarations: (frame: Frame) => string,
): string {
  const lines = motion.frames.map((frame) => {
    const label = frame.at.map((at) => `${at}%`).join(', ').padEnd(labelWidth);
    return `      ${label} { ${declarations(frame)} }`;
  });
  return `    @keyframes ${motion.name} {\n${lines.join('\n')}\n    }`;
}

const { body, eyes, antenna, spark, sparkle } = avatarMotion;
const idleKeyframes = [
  keyframes(body, 8, ({ y, rotation, scaleX, scaleY }) => {
    const translation = `translateY(${y === 0 ? '0' : `${y}px`})`.padEnd(19);
    const angle = `rotate(${rotation}deg)`.padEnd(16);
    return `transform: ${translation}${angle}scale(${scaleX}, ${scaleY});`;
  }),
  keyframes(eyes, 18, ({ scaleY }) => `transform: scaleY(${scaleY});`),
  keyframes(antenna, 8, ({ rotation }) => `transform: rotate(${rotation}deg);`),
  keyframes(spark, 8, ({ opacity, scaleX }) =>
    `opacity: ${`${opacity};`.padEnd(5)} transform: scale(${scaleX});`),
  keyframes(sparkle, 8, ({ opacity, rotation, scaleX }) =>
    `opacity: ${`${opacity};`.padEnd(4)} transform: rotate(${rotation}deg) scale(${scaleX});`),
].join('\n');

/** Emits seeded idle animations scoped to a single avatar's SVG group. */
export function renderAnimationStyle(spec: AvatarSpec, scopeClass: string): string {
  const delays = avatarMotionDelays(spec.seed);

  return `<style>
    .${scopeClass} .body { animation: ${body.name} ${body.duration}s ease-in-out infinite; animation-delay: ${delays.body}s; transform-origin: ${body.origin[0]}px ${body.origin[1]}px; transform-box: view-box; }
    .${scopeClass} .eyes { animation: ${eyes.name} ${eyes.duration}s ease-in-out infinite; animation-delay: ${delays.eyes}s; transform-origin: ${eyes.origin[0]}px ${eyes.origin[1]}px; transform-box: view-box; }
    .${scopeClass} .antenna { animation: ${antenna.name} ${antenna.duration}s ease-in-out infinite; animation-delay: ${delays.antenna}s; transform-origin: 50% 100%; transform-box: fill-box; }
    .${scopeClass} .spark { animation: ${spark.name} ${spark.duration}s ease-in-out infinite; animation-delay: ${delays.spark}s; transform-origin: center; transform-box: fill-box; }
    .${scopeClass} .sparkle { animation: ${sparkle.name} ${sparkle.duration}s ease-in-out infinite; animation-delay: ${delays.sparkle}s; transform-origin: center; transform-box: fill-box; }
${idleKeyframes}
    @media (prefers-reduced-motion: reduce) {
      .${scopeClass} .body, .${scopeClass} .eyes, .${scopeClass} .antenna, .${scopeClass} .spark, .${scopeClass} .sparkle { animation: none; }
    }
  </style>`;
}
