import { readFile, writeFile } from 'node:fs/promises';

// tsup's dts bundler cannot type .astro default exports, so the emitted root
// declaration would re-export from a 'Navii.astro' module that never ships.
// Replace those lines with factory declarations, following the pattern the
// SVG adapter uses for its own Astro components (sibling .astro.d.ts files).
const source = await readFile(new URL('../dist/index.d.ts', import.meta.url), 'utf8');

const withoutAstroReexports = source
  .replace(/^export \{ default as Navii \} from '\.\/Navii\.astro';\n/m, '')
  .replace(/^export \{ default as NaviiGroup \} from '\.\/NaviiGroup\.astro';\n/m, '');

if (withoutAstroReexports === source) {
  throw new Error('expected .astro re-exports in dist/index.d.ts, found none');
}

const patched = `import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

${withoutAstroReexports}
declare const Navii: (props: NaviiProps) => ReturnType<AstroComponentFactory>;
declare const NaviiGroup: (props: NaviiGroupProps) => ReturnType<AstroComponentFactory>;
export { Navii, NaviiGroup };
`;

await writeFile(new URL('../dist/index.d.ts', import.meta.url), patched);
