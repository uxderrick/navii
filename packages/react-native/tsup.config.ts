import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.tsx' },
  format: ['esm'],
  // tsup injects baseUrl internally; only its TypeScript 6 declaration build needs this.
  dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  target: 'es2022',
  external: [
    '@mhaadi/svg/react-native',
    '@usenavii/core',
    'react',
    'react-native',
    'react-native-reanimated',
    'react-native-svg',
  ],
});
