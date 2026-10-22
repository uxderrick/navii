import { build } from 'esbuild';
import { copyFile, rm } from 'node:fs/promises';

// Flatten partial Angular declarations and resolve the SVG adapter's internal imports.
await build({
  entryPoints: ['dist/compiled/index.js'],
  outfile: 'dist/index.js',
  bundle: true,
  format: 'esm',
  // Angular's linker detects literal ɵɵngDeclare identifiers before parsing.
  charset: 'utf8',
  platform: 'neutral',
  // The neutral platform ignores "main"; the SVG adapter's XML parser
  // dependency (@xmldom/xmldom) declares only "main", so bundle it explicitly.
  mainFields: ['main'],
  target: 'es2022',
  sourcemap: true,
  conditions: ['import'],
  external: ['@angular/*', '@usenavii/core', 'rxjs', 'rxjs/*'],
});
for (const name of ['index.d.ts', 'components.d.ts']) {
  await copyFile(`dist/compiled/${name}`, `dist/${name}`);
}
await rm('dist/compiled', { recursive: true });
