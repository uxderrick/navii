import type { AvatarSpec } from './types.js';
import { createRng } from './prng.js';

/**
 * Emits a <style> block scoped via classes used by the renderer wrapper groups.
 * Delays are seeded so a grid of avatars desyncs naturally.
 *
 * Respects prefers-reduced-motion: animations collapse to a single keyframe.
 */
export function renderAnimationStyle(spec: AvatarSpec): string {
  const rng = createRng(`anim:${spec.seed}`);
  const floatDelay = (rng.next() * 2).toFixed(2);
  const blinkDelay = (rng.next() * 5).toFixed(2);
  const pulseDelay = (rng.next() * 1.5).toFixed(2);
  const twinkleDelay = (rng.next() * 1.8).toFixed(2);
  const swayDelay = (rng.next() * 2.4).toFixed(2);

  return `<style>
    .n-body { animation: n-float 3.4s ease-in-out infinite; animation-delay: ${floatDelay}s; transform-origin: 50px 80px; transform-box: view-box; }
    .n-eyes { animation: n-blink 5.4s ease-in-out infinite; animation-delay: ${blinkDelay}s; transform-origin: 50px 52px; transform-box: view-box; }
    .n-antenna { animation: n-sway 3.6s ease-in-out infinite; animation-delay: ${swayDelay}s; transform-origin: 50% 100%; transform-box: fill-box; }
    .n-spark { animation: n-pulse 1.9s ease-in-out infinite; animation-delay: ${pulseDelay}s; transform-origin: center; transform-box: fill-box; }
    .n-sparkle { animation: n-twinkle 2.2s ease-in-out infinite; animation-delay: ${twinkleDelay}s; transform-origin: center; transform-box: fill-box; }
    @keyframes n-float {
      0%, 100% { transform: translateY(0)      rotate(0deg)    scale(1, 1); }
      25%      { transform: translateY(-2px)   rotate(-1.6deg) scale(1.025, 0.975); }
      50%      { transform: translateY(-4.5px) rotate(0deg)    scale(0.985, 1.025); }
      75%      { transform: translateY(-2px)   rotate(1.6deg)  scale(1.025, 0.975); }
    }
    @keyframes n-blink {
      0%, 85%, 91%, 100% { transform: scaleY(1); }
      87%, 89%, 93%, 95% { transform: scaleY(0.06); }
    }
    @keyframes n-sway {
      0%, 100% { transform: rotate(0deg); }
      25%      { transform: rotate(-5deg); }
      75%      { transform: rotate(5deg); }
    }
    @keyframes n-pulse {
      0%, 100% { opacity: 0.55; transform: scale(1); }
      50%      { opacity: 1;    transform: scale(1.32); }
    }
    @keyframes n-twinkle {
      0%, 100% { opacity: 0.3; transform: rotate(0deg) scale(0.85); }
      50%      { opacity: 1;   transform: rotate(180deg) scale(1.12); }
    }
    @media (prefers-reduced-motion: reduce) {
      .n-body, .n-eyes, .n-antenna, .n-spark, .n-sparkle { animation: none; }
    }
  </style>`;
}
