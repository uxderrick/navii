import * as React from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { SVG as SvgRoot, type NativeSvgProps } from '@mhaadi/svg/react-native';
import { avatarMotion, avatarMotionDelays } from '@usenavii/core/parts';
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  type FrameInfo,
  type SharedValue,
} from 'react-native-reanimated';
import { G, parse, SvgAst, type JsxAST, type XmlAST } from 'react-native-svg';
import {
  getMotion,
  isMotionPart,
  motionPhase,
  motionProps,
  type MotionPart,
} from './motion.js';

type AvatarSvgProps = Pick<
  NativeSvgProps,
  'width' | 'height' | 'sanitize' | 'loading' | 'fallback' | 'onSvgLoad' | 'onSvgError'
> & {
  src: string;
  animated?: boolean | undefined;
  seed?: string | undefined;
};
type ActiveMotion = ReturnType<typeof getMotion>;
type MotionDelays = ReturnType<typeof avatarMotionDelays>;
type Point = readonly [number, number];

const MotionGroup = Animated.createAnimatedComponent(G);
const avatarTags = new Set([
  'circle', 'clipPath', 'defs', 'ellipse', 'g', 'line', 'path',
  'radialGradient', 'rect', 'stop', 'svg', 'text',
]);
const ignoredTags = new Set(['filter', 'style', 'title']);

export function AvatarSvg({ animated, seed, ...props }: AvatarSvgProps) {
  return animated && seed !== undefined && Platform.OS !== 'web' && props.src.includes('<style>')
    ? <AnimatedAvatarSvg {...props} seed={seed} />
    : <SvgRoot {...props} />;
}

function useSystemReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = React.useState(useReducedMotion());

  React.useEffect(() => {
    let updatePending = true;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      updatePending = false;
      setReducedMotion(enabled);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (updatePending) setReducedMotion(enabled);
    }, () => {});
    return () => {
      updatePending = false;
      subscription.remove();
    };
  }, []);

  return reducedMotion;
}

function AnimatedAvatarSvg({
  src, seed, sanitize, width, height, loading, fallback, onSvgLoad, onSvgError,
}: AvatarSvgProps & { seed: string }) {
  const idPrefix = React.useId().replace(/[^\w-]/g, '');
  const elapsed = useSharedValue(-1);
  const reducedMotion = useSystemReducedMotion();
  const request = React.useMemo(() => ({ src, sanitize, seed }), [src, sanitize, seed]);
  const [result, setResult] = React.useState<{ request: typeof request; ast: JsxAST | null }>();
  const callbacks = React.useRef({ onSvgLoad, onSvgError });
  React.useEffect(() => {
    callbacks.current = { onSvgLoad, onSvgError };
  }, [onSvgLoad, onSvgError]);

  React.useEffect(() => {
    if (reducedMotion) elapsed.value = -1;
  }, [elapsed, reducedMotion]);

  React.useEffect(() => {
    try {
      const delays = avatarMotionDelays(request.seed);
      const ast = parse(request.src, (root) => {
        if (root.tag !== 'svg') throw new Error('SVG markup is invalid.');
        prepareTree(root, idPrefix, elapsed, delays, request.sanitize === true);
        return root;
      });
      if (!ast) throw new Error('SVG markup is invalid.');
      elapsed.value = -1;
      setResult({ request, ast });
    } catch (error) {
      setResult({ request, ast: null });
      callbacks.current.onSvgError?.(error instanceof Error ? error : new Error('Failed to load SVG.'));
      return;
    }
    callbacks.current.onSvgLoad?.(request.src);
  }, [request, idPrefix, elapsed]);

  if (result?.request !== request) return loading;
  if (!result.ast) return fallback;
  return (
    <>
      {!reducedMotion && <AnimationClock elapsed={elapsed} />}
      <SvgAst ast={result.ast} override={{ width, height }} />
    </>
  );
}

function AnimationClock({ elapsed }: { elapsed: SharedValue<number> }) {
  const update = React.useCallback((frame: FrameInfo) => {
    'worklet';
    elapsed.value = frame.timeSinceFirstFrame;
  }, [elapsed]);
  useFrameCallback(update);
  return null;
}

function AnimatedPart({
  children, elapsed, motion, origin, restingOpacity,
}: React.PropsWithChildren<{
  elapsed: SharedValue<number>;
  motion: ActiveMotion;
  origin: Point;
  restingOpacity: number;
}>) {
  const { frames, duration, delay } = motion;
  const [originX, originY] = origin;
  // An unchanged numeric phase doesn't trigger the animated-props mapper.
  const phase = useDerivedValue(() => {
    'worklet';
    return motionPhase(elapsed.value, { duration, delay }, frames);
  });
  // The native SVG host accepts the affine matrix directly on the UI thread.
  const animatedProps = useAnimatedProps<React.ComponentProps<typeof G> & { matrix: number[] }>(() => {
    'worklet';
    return motionProps(phase.value, frames, originX, originY, restingOpacity);
  });
  return <MotionGroup opacity={restingOpacity} animatedProps={animatedProps}>{children}</MotionGroup>;
}

/** Apply animation only to the named pieces of core's generated SVG. */
function prepareTree(
  node: XmlAST,
  idPrefix: string,
  elapsed: SharedValue<number>,
  delays: MotionDelays,
  sanitize: boolean,
) {
  node.children = node.children.filter((child) => {
    if (typeof child === 'string') return node.tag === 'text';
    return !ignoredTags.has(child.tag) && (!sanitize || avatarTags.has(child.tag));
  });

  // Better SVG's native adapter omits filter elements in the static avatar.
  delete node.props.filter;
  for (const [name, value] of Object.entries(node.props)) {
    if (sanitize && (/^on/i.test(name) || /^(?:style|href|xlinkHref|src)$/i.test(name))) {
      delete node.props[name];
      continue;
    }
    if (typeof value !== 'string') continue;
    if (name === 'id') {
      node.props[name] = `${idPrefix}-${value}`;
    } else if (name === 'href' && value.startsWith('#')) {
      node.props[name] = `#${idPrefix}-${value.slice(1)}`;
    } else {
      node.props[name] = value.replace(/url\(#([^)]*)\)/g, `url(#${idPrefix}-$1)`);
    }
  }

  const part = node.props.class;
  delete node.props.class;
  if (isMotionPart(part)) {
    const Tag = node.Tag;
    const motion = getMotion(part, delays[part]);
    const origin = partOrigin(part, node);
    const opacity = Number(node.props.opacity ?? 1);
    delete node.props.opacity;
    node.Tag = (props) => (
      <AnimatedPart elapsed={elapsed} motion={motion} origin={origin} restingOpacity={opacity}>
        <Tag {...props} />
      </AnimatedPart>
    );
  }

  for (const child of node.children) {
    if (typeof child !== 'string') prepareTree(child, idPrefix, elapsed, delays, sanitize);
  }
}

function partOrigin(part: MotionPart, node: XmlAST): Point {
  if (part === 'body' || part === 'eyes') return avatarMotion[part].origin;

  const points = artPoints(node);
  if (!points.length) return [50, 50];
  const x = points.map(([x]) => x);
  const y = points.map(([, y]) => y);
  const bottom = Math.max(...y);
  return [
    (Math.min(...x) + Math.max(...x)) / 2,
    part === 'antenna' ? bottom : (Math.min(...y) + bottom) / 2,
  ];
}

function artPoints(node: XmlAST): Point[] {
  if (node.tag === 'circle') {
    const x = Number(node.props.cx);
    const y = Number(node.props.cy);
    const r = Number(node.props.r);
    return [[x - r, y - r], [x + r, y + r]];
  }
  if (node.tag === 'path' && typeof node.props.d === 'string') {
    const points: Point[] = [];
    // Navii's antenna and sparkle paths use absolute coordinate pairs.
    const coordinates = node.props.d.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)?.map(Number) ?? [];
    for (let i = 0; i + 1 < coordinates.length; i += 2) {
      const x = coordinates[i];
      const y = coordinates[i + 1];
      if (x !== undefined && y !== undefined) points.push([x, y]);
    }
    return points;
  }
  return node.children.flatMap((child) => typeof child === 'string' ? [] : artPoints(child));
}
