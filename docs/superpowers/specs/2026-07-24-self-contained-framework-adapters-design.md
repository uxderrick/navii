# Self-contained framework adapter compatibility fix

## Goal

Ship `@usenavii/react`, `@usenavii/vue`, and `@usenavii/react-native`
without a runtime module-resolution dependency on `@mhaadi/svg`, while
preserving their existing public APIs and rendering behavior.

This addresses two published-package failures:

- React and Vue cannot be imported directly by Node ESM because
  `@mhaadi/svg@0.2.3` contains extensionless internal imports.
- React Native 0.73–0.76 Metro configurations cannot resolve
  `@mhaadi/svg/react-native` unless experimental package-exports support is
  enabled.

## Architecture

Continue using `@mhaadi/svg` as the implementation source during development,
but bundle its relevant adapter code into the React, Vue, and React Native
package outputs.

For those three packages:

- remove `@mhaadi/svg` from the bundler's external package list;
- move `@mhaadi/svg` from `dependencies` to `devDependencies`;
- keep framework runtimes and `react-native-svg` external;
- ensure generated declarations do not expose private `@mhaadi/svg` types.

`@usenavii/svelte` remains unchanged. Its published package passes a clean
Svelte/Vite consumer build, and Svelte source packages intentionally rely on
the Svelte-aware package loader.

## Compatibility contract

The fix must preserve:

- existing component names and props;
- inline SVG as the default React and Vue rendering mode;
- image fallback behavior;
- loading, error, sanitization, and callback behavior;
- React Native SVG-tree rendering;
- current peer dependency ranges.

All five public packages will move from `0.9.0` to `0.9.1` to preserve the
repository's lockstep release contract. Every framework package will depend on
`@usenavii/core` using `workspace:^0.9.1`, which pnpm rewrites to `^0.9.1` in
published tarballs.

## Regression testing

Add automated published-artifact checks that pack and install the workspace
packages into clean temporary consumers.

Required checks:

1. React imports directly in Node ESM and server-renders an image fallback.
2. Vue imports directly in Node ESM and server-renders an image fallback.
3. React and Vue still produce browser bundles.
4. React Native 0.76 produces a Metro iOS bundle without
   `unstable_enablePackageExports`.
5. Svelte still produces a normal Svelte/Vite consumer bundle.
6. Packed React, Vue, and React Native manifests do not contain a runtime
   `@mhaadi/svg` dependency.
7. Existing unit tests, build, and typecheck remain green.

Tests must use packed artifacts rather than workspace module resolution so
they catch dependency and export mistakes before publication.

## Release

Document the compatibility fixes in the changelog and publish all five public
packages as `0.9.1` after clean-consumer verification. Do not deprecate `0.9.0`;
its browser-bundler use cases remain functional, and the compatibility limits
can be addressed through the patch release.
