import { defineConfig } from 'tsup';

const entry = { index: 'src/index.ts' };

export default defineConfig({
  entry,
  format: ['esm', 'cjs'],
  // tsup injects baseUrl internally; only its TypeScript 6 declaration build needs this.
  dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  target: 'es2022',
  external: ['vue', '@mhaadi/svg/vue', '@usenavii/core', './svg-adapter.js'],
  // Both builds load the ESM bridge because the SVG export only matches imports.
  esbuildOptions(options, { format }) {
    if (format === 'esm') {
      options.entryPoints = { ...entry, 'svg-adapter': 'src/svg-adapter.ts' };
    }
  },
});
