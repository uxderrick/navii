import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.tsx' },
  format: ['esm', 'cjs'],
  // tsup injects baseUrl internally; only its TypeScript 6 declaration build needs this.
  dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  target: 'es2022',
  external: ['react', 'react-dom', '@usenavii/core'],
});
