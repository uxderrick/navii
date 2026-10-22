import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  target: 'es2022',
  noExternal: ['@mhaadi/svg', '@xmldom/xmldom'],
  external: ['solid-js', 'solid-js/web', '@usenavii/core'],
});
