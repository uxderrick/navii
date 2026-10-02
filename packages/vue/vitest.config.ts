import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'],
  },
  ssr: {
    noExternal: ['@mhaadi/svg'],
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
