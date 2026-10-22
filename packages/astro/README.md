# @usenavii/astro

Astro components for server-rendered deterministic avatars and overlapping groups. They require no client JavaScript or hydration directive.

```sh
npm install @usenavii/astro
```

```astro
---
import { Navii, NaviiGroup } from '@usenavii/astro';
---

<Navii seed="alice" size={64} title="Alice" animated />
<NaviiGroup seeds={['alice', 'bob', 'carol']} size={48} max={2} />
```

`Navii` accepts the core avatar options. Use `styleHint` for the engine's style selection, and `class` and `style` for the rendered element. `style` is a CSS string. `NaviiGroup` also accepts `overlap`, `max`, `ring`, `tileBg`, `counterFill`, and `counterInk`.

Inline SVG rendering uses `@mhaadi/svg/astro`. `alt` overrides the accessible title, and unlabeled avatars are hidden from assistive technology. Groups have a default accessible label. Empty seed arrays render nothing. Set `sanitize` to enable the SVG sanitizer, or `as="img"` for a data-URI image.

The components also have direct entry points:

```astro
---
import Navii from '@usenavii/astro/Navii.astro';
import NaviiGroup from '@usenavii/astro/NaviiGroup.astro';
---
```

The package installs `@usenavii/core` and `@mhaadi/svg` automatically. Astro is a peer dependency. Astro 5 and newer are supported; development checks run on Astro 7. Core engine functions and types are also exported from the package root.
