import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.tsx' },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  target: 'es2022',
  external: ['react', 'react-native', 'react-native-svg', '@usenavii/core', '@mhaadi/svg'],
});
