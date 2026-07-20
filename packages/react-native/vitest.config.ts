import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'],
  },
  test: {
    include: ['test/**/*.test.tsx'],
    environment: 'node',
  },
});
