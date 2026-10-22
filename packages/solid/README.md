# @usenavii/solid

Solid 1.9 components for deterministic Navii avatars and overlapping groups.

```sh
npm install @usenavii/solid
```

```tsx
import { createSignal } from 'solid-js';
import { Navii, NaviiGroup } from '@usenavii/solid';

const [seed, setSeed] = createSignal('alice');

<Navii seed={seed()} size={64} title="Alice" animated />
<NaviiGroup seeds={['alice', 'bob', 'carol']} size={48} max={2} />
```

Seed and option changes update the rendered avatar. `Navii` accepts the core avatar options, with `styleHint` for the engine's style selection and `class` and `style` for the rendered element. Styles are CSS strings. `NaviiGroup` also accepts `overlap`, `max`, `ring`, `tileBg`, `counterFill`, and `counterInk`.

Inline SVG rendering uses `@mhaadi/svg/solid`. Set `sanitize` to enable its sanitizer. `alt` overrides the accessible title. Groups have a default accessible label, and empty seed arrays render nothing. `loading`, `fallback`, `onSvgLoad`, and `onSvgError` pass through to the SVG renderer.

The SVG renderer loads inline content in a client effect. Use `as="img"` when the avatar must appear in server-rendered HTML. This renders a data-URI image and also works in the browser.

```tsx
<Navii seed="alice" as="img" size={64} alt="Alice" />
```

The package installs `@usenavii/core` and `@mhaadi/svg` automatically. Solid is a peer dependency. Core engine functions and types are also exported from this package.
