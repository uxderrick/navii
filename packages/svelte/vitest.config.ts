import adapter from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [adapter()],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.svelte'],
  },
  ssr: {
    noExternal: ['@mhaadi/svg'],
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'happy-dom',
    setupFiles: [],
  },
});
