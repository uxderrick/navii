# Framework Documentation and Blog Design

## Goal

Update Navii's public documentation and generated release blog so users can install and use all five `0.9.1` packages with accurate framework-specific guidance.

## Scope

- Correct the recipes page to recommend the dedicated React, Vue, Svelte, and React Native packages.
- Update the React SDK page for the self-contained adapter behavior.
- Add SDK pages for React Native, Vue, and Svelte using the existing documentation layout and navigation.
- Update framework package READMEs so `@mhaadi/svg` is not described as a consumer dependency for React, Vue, or React Native.
- Expand the `0.28.1` changelog section, which supplies the generated blog release page, with symptoms, compatibility impact, installation commands, and upgrade guidance.
- Add route and content regression tests for the new documentation and expanded release post.

## Information Architecture

The existing server-rendered documentation system remains unchanged. New SDK entries are added to its page registry and use the same shared shell, headings, code blocks, and metadata as existing pages. The blog continues to parse `CHANGELOG.md`; no separate blog storage or rendering path is introduced.

The SDK navigation will cover:

1. Core
2. React
3. React Native
4. Vue
5. Svelte

Each framework page will include installation, a minimal avatar example, group rendering, relevant peer dependencies, and framework-specific limitations.

## Release Content

The `0.28.1` entry will explain:

- Direct Node ESM and SSR imports previously failed for React and Vue because of an upstream extensionless import.
- React Native 0.76 Metro previously required package-exports opt-in to resolve the SVG adapter.
- React, Vue, and React Native now bundle their SVG adapters.
- Framework runtimes remain peer dependencies.
- Svelte retains its current runtime adapter dependency.
- Existing component APIs and rendering behavior are unchanged.

## Verification

- Add failing API tests for every new docs route and key compatibility statements.
- Run those tests before and after implementation.
- Run API typechecking and the full workspace test suite.
- Confirm the generated `/blog/v0.28.1` page includes the expanded release guidance.
- Delete this temporary specification and its implementation plan after completion.

