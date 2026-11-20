import { build } from 'esbuild';
import { copyFile, rm } from 'node:fs/promises';

// Flatten Navii's partial Angular declarations for application builds.
await build({
  entryPoints: ['dist/compiled/index.js'],
  outfile: 'dist/index.js',
  bundle: true,
  format: 'esm',
  // Angular's linker detects literal ɵɵngDeclare identifiers before parsing.
  charset: 'utf8',
  platform: 'neutral',
  target: 'es2022',
  sourcemap: true,
  conditions: ['import'],
  external: ['@angular/*', '@mhaadi/svg/angular', '@usenavii/core', 'rxjs', 'rxjs/*'],
});
for (const name of ['index.d.ts', 'components.d.ts']) {
  await copyFile(`dist/compiled/${name}`, `dist/${name}`);
}
await rm('dist/compiled', { recursive: true });
