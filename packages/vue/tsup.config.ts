import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  // tsup injects baseUrl internally; only its TypeScript 6 declaration build needs this.
  dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  target: 'es2022',
  // Keep Node ESM and Metro compatible with the SVG package's internal imports.
  noExternal: ['@mhaadi/svg', '@xmldom/xmldom'],
  external: ['vue', '@usenavii/core'],
});
