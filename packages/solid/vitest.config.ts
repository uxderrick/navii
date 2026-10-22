import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    server: {
      deps: {
        // @mhaadi/svg ships extensionless internal imports that fail native
        // Node ESM resolution; inlining runs them through vite's resolver.
        inline: ['@mhaadi/svg'],
      },
    },
  },
});
