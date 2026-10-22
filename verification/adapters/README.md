# Packed adapter consumer checks

These apps install archives of core, Solid, Angular, and Astro. They do not import SDK source files or use workspace links. The source checkout must have its dependencies installed and packages built.

1. Use the Node and pnpm versions required by the source checkout.
2. Run `npm ci --prefix verification/adapters`.
3. Run `verification/adapters/node_modules/.bin/playwright install chromium`.
4. Run `node verification/adapters/run.mjs /absolute/path/to/source-checkout`.

You can use an existing Chrome installation with `CHROME_PATH=/absolute/path/to/chrome`. Set `CONSUMER_PORT` to change the starting port (default 4310; three consecutive ports are used).

The runner builds a Vite app for Solid, an Angular production app with strict template checking, and a static Astro site with `astro check`. Chromium checks rendering, labels, image loading, group overflow, empty groups, SVG ID isolation and references, browser errors, and Solid/Angular input updates. Astro has no client update test because these components render on the server without hydration.

The runner prints its temporary directory. That directory contains installed consumer apps, package archives, build logs, browser results, and `result.json`. A failed build or browser assertion produces a nonzero exit code. No SDK or dependency versions are changed in the source checkout.

## Angular regression found in PR #8

The original PR revision fails all Angular browser checks with `JIT compiler unavailable`. Its esbuild output escapes the `ɵ` characters, so Angular's `needsLinking` function does not recognize the partial declarations. The package builds, but a production consumer cannot start.

The Angular build now preserves UTF-8 identifiers. Its declaration test includes a regression assertion using Angular's own `needsLinking` function. See `RESULTS.md` for the before/after results.

This checks the framework versions declared in the source checkout, with Angular CLI/build 22.2.1 and Vite 8.3.2. It does not establish compatibility with every version allowed by the SDK peer dependency ranges. Consumer installs save lockfiles in the result directory; later runs can resolve newer versions within the declared ranges.
