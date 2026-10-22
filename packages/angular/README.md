# @usenavii/angular

Standalone Angular 22 components for deterministic avatars and overlapping groups.

```sh
npm install @usenavii/angular
```

```ts
import { Component } from '@angular/core';
import { Navii, NaviiGroup, type AvatarOptions } from '@usenavii/angular';

@Component({
  selector: 'app-team',
  imports: [Navii, NaviiGroup],
  template: `
    <navii-avatar seed="alice" [size]="64" title="Alice" [animated]="true" [options]="options" />
    <navii-group [seeds]="['alice', 'bob', 'carol']" [size]="48" [max]="2" />
  `,
})
export class Team {
  readonly options: AvatarOptions = { paletteId: 'mint', mood: 'happy' };
}
```

`Navii` uses the `navii-avatar` selector. Its required `seed` input and optional `size`, `title`, `animated`, and `styleHint` inputs update reactively. Pass other core avatar options through `[options]`.

`NaviiGroup` uses `navii-group` and requires `[seeds]`. It adds `overlap`, `max`, `ring`, `tileBg`, `counterFill`, and `counterInk`. Empty seed arrays render nothing. Avatar size defaults to 96, and group tile size defaults to 64.

Both components accept `alt`, `sanitize`, `svgClass`, and `svgStyle`. `svgStyle` is a CSS string. Use normal `class` and `style` bindings to style the component host. `(svgLoad)` emits the generated markup, and `(svgError)` emits an error from the SVG renderer.

Inline SVG uses `@mhaadi/svg/angular` and loads in the browser. For server-rendered avatars, set `as="img"`. This produces a data-URI image in both server and browser output.

```html
<navii-avatar seed="alice" as="img" alt="Alice" />
```

The package installs `@usenavii/core` and `@mhaadi/svg` automatically. Angular core, common, and platform-browser are peer dependencies. Angular's application build links the package's partial declarations. Core engine functions and types are also exported.
