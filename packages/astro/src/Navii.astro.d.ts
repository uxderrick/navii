import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { NaviiProps } from './props.js';

declare const Navii: (props: NaviiProps) => ReturnType<AstroComponentFactory>;
export default Navii;
