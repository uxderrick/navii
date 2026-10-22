# Adapter consumer results — 22 October 2026

Source: PR #8, commit `8205f5f4f1469fdcf9ebfbfbb00f39aa0102e32c`.

Tests installed packed `@usenavii/core`, `@usenavii/solid`, `@usenavii/angular`, and `@usenavii/astro` version `0.10.0` into independent consumer apps. They used Node 24.22.1, pnpm 12.8.1, and headless Google Chrome.

| Consumer | Installed framework | Original PR | With Angular patch |
| --- | --- | --- | --- |
| Solid | Solid 1.9.17, Vite 8.3.5 | Build passed; 6 browser checks passed | Same 6 passed |
| Angular | Angular 22.2.3, CLI/build 22.2.1 | Build passed; all 6 browser checks failed | Build passed; all 6 passed |
| Astro | Astro 7.4.2 | Type check and static build passed; 5 browser checks passed | Same 5 passed |

One Astro client update test is skipped because these components render on the server without hydration. The passing checks cover SVG rendering, labels, decorative accessibility, image fallback dimensions and image loading, empty groups, overflow counters, repeated SVG ID isolation, fragment references, browser errors, and Solid/Angular live input updates.

## Angular failure and verified fix

The original production Angular app renders a blank page and reports `JIT compiler unavailable`. The bundled SDK contains escaped `\u0275\u0275ngDeclare...` identifiers. Angular's linker checks for literal `ɵɵngDeclare...` strings before it parses a dependency. Its `needsLinking` function returns `false` for the original package.

The fix adds `charset: 'utf8'` to the SDK's esbuild configuration. It also adds a regression assertion using `needsLinking` to the package's declaration test. With this fix, fresh package archives and fresh consumer apps pass all 17 applicable browser checks. The full SDK suite also passes: 218 tests, plus Angular and Astro declaration checks.

Original run: `/var/folders/9b/bl3n14z17p5f1bbgwz0cy2d80000gn/T/navii-consumers-kNCJZA`.

Fixed run: `/var/folders/9b/bl3n14z17p5f1bbgwz0cy2d80000gn/T/navii-consumers-Z9DOGv`.

Each run directory contains app package lockfiles, build logs, browser logs, and results. Temporary directories may be removed by the operating system; this report, the runner, fixtures, and Angular fix are saved in the repository.

These results cover the versions above in Chrome. They do not verify every allowed framework version, other browsers, or Angular/Solid server hydration.
