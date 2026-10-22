import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { NaviiGroupProps } from './props.js';

declare const NaviiGroup: (props: NaviiGroupProps) => ReturnType<AstroComponentFactory>;
export default NaviiGroup;
