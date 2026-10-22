import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'consumer.spec.mjs',
  timeout: 15_000,
  workers: 1,
  reporter: 'list',
  outputDir: process.env.CONSUMER_RESULTS,
  use: {
    headless: true,
    launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
    screenshot: 'only-on-failure',
  },
  projects: ['solid', 'angular', 'astro'].map((name, i) => ({
    name,
    use: { baseURL: `http://127.0.0.1:${Number(process.env.CONSUMER_PORT ?? 4310) + i}` },
  })),
});
