import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { SVG as SvgRoot } from '@mhaadi/svg/angular';
import { createAvatar, renderGroup, renderGroupTiles, type AvatarOptions, type GroupOptions, type StyleHint } from '@usenavii/core';

// Inputs are declared flat on each component instead of a shared base class:
// re-declaring an inherited signal input (NaviiGroup's size) is fragile, so the
// `applySharedInputs helper mirrors them once and both components call it.
function applySharedInputs(
  base: AvatarOptions,
  values: {
    size: number;
    options: AvatarOptions;
    title?: string | undefined;
    animated?: boolean | undefined;
    styleHint?: StyleHint | undefined;
  },
): AvatarOptions {
  const options: AvatarOptions = { ...base, ...values.options, size: values.size };
  if (values.title !== undefined) options.title = values.title;
  if (values.animated !== undefined) options.animated = values.animated;
  if (values.styleHint !== undefined) options.style = values.styleHint;
  return options;
}

/** Standalone avatar component. Import Navii into the consuming component. */
@Component({
  selector: 'navii-avatar',
  standalone: true,
  imports: [SvgRoot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ':host { display: inline-block; vertical-align: middle; }',
  template: `
    @if (renderAs() === 'img') {
      <img [src]="dataUri()" [width]="size()" [height]="size()" [alt]="label()"
        [class]="svgClass()" [style]="svgStyle()" />
    } @else {
      <better-svg [src]="svg()" [width]="size()" [height]="size()" [sanitize]="sanitize()"
        [svgClass]="svgClass()" [svgStyle]="svgStyle()"
        [role]="label() ? 'img' : undefined" [ariaLabel]="label() || undefined" [ariaHidden]="!label()"
        (svgLoad)="svgLoad.emit($event)" (svgError)="svgError.emit($event)" />
    }
  `,
})
export class Navii {
  readonly seed = input.required<string>();
  readonly size = input(96);
  readonly options = input<AvatarOptions>({});
  readonly title = input<string>();
  readonly animated = input<boolean>();
  readonly styleHint = input<StyleHint>();
  readonly renderAs = input<'svg' | 'img'>('svg', { alias: 'as' });
  readonly alt = input<string>();
  readonly sanitize = input(false);
  readonly svgClass = input<string>();
  readonly svgStyle = input<string>();
  readonly svgLoad = output<string>();
  readonly svgError = output<Error>();

  protected readonly avatarOptions = computed(() =>
    applySharedInputs({}, {
      size: this.size(),
      options: this.options(),
      title: this.title(),
      animated: this.animated(),
      styleHint: this.styleHint(),
    }),
  );
  protected readonly svg = computed(() => createAvatar(this.seed(), this.avatarOptions()));
  protected readonly label = computed(() => this.alt() ?? this.avatarOptions().title ?? '');
  protected readonly dataUri = computed(() => `data:image/svg+xml;utf8,${encodeURIComponent(this.svg())}`);
}

/** Standalone overlapping stack. Empty seed arrays render no tiles. */
@Component({
  selector: 'navii-group',
  standalone: true,
  imports: [SvgRoot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ':host { display: inline-block; vertical-align: middle; }',
  template: `
    @if (tiles(); as group) {
      @if (renderAs() === 'img') {
        <img [src]="dataUri()" [width]="group.width" [height]="group.height" [alt]="label()"
          [class]="svgClass()" [style]="svgStyle()" />
      } @else {
        <div [class]="svgClass()" [style]="wrapperStyle()" [attr.role]="label() ? 'img' : null"
          [attr.aria-label]="label() || null">
          @for (tile of tileList(); track $index) {
            <div style="position:absolute;top:0" [style.left.px]="$index * step()"
              [style.width.px]="size()" [style.height.px]="size()">
              <better-svg [src]="tile" [width]="size()" [height]="size()" [sanitize]="sanitize()" [ariaHidden]="true"
                (svgLoad)="svgLoad.emit($event)" (svgError)="svgError.emit($event)" />
            </div>
          }
        </div>
      }
    }
  `,
})
export class NaviiGroup {
  readonly seeds = input.required<string[]>();
  readonly size = input(64);
  readonly options = input<AvatarOptions>({});
  readonly title = input<string>();
  readonly animated = input<boolean>();
  readonly styleHint = input<StyleHint>();
  readonly renderAs = input<'svg' | 'img'>('svg', { alias: 'as' });
  readonly alt = input<string>();
  readonly sanitize = input(false);
  readonly svgClass = input<string>();
  readonly svgStyle = input<string>();
  readonly svgLoad = output<string>();
  readonly svgError = output<Error>();

  readonly overlap = input(0.3);
  readonly max = input<number>();
  readonly ring = input<string>();
  readonly tileBg = input<string>();
  readonly counterFill = input<string>();
  readonly counterInk = input<string>();

  protected readonly groupOptions = computed<GroupOptions>(() => {
    const options: GroupOptions = applySharedInputs({}, {
      size: this.size(),
      options: this.options(),
      title: this.title(),
      animated: this.animated(),
      styleHint: this.styleHint(),
    });
    options.overlap = this.overlap();
    const max = this.max();
    const ring = this.ring();
    const tileBg = this.tileBg();
    const counterFill = this.counterFill();
    const counterInk = this.counterInk();
    if (max !== undefined) options.max = max;
    if (ring !== undefined) options.ring = ring;
    if (tileBg !== undefined) options.tileBg = tileBg;
    if (counterFill !== undefined) options.counterFill = counterFill;
    if (counterInk !== undefined) options.counterInk = counterInk;
    return options;
  });
  protected readonly tiles = computed(() => this.seeds().length ? renderGroupTiles(this.seeds(), this.groupOptions()) : undefined);
  protected readonly tileList = computed(() => {
    const group = this.tiles();
    return group ? (group.counter ? [...group.tiles, group.counter] : group.tiles) : [];
  });
  protected readonly label = computed(() => this.alt() ?? `Group of ${this.seeds().length} avatars`);
  protected readonly step = computed(() => this.size() * (1 - Math.max(0, Math.min(0.7, this.overlap()))));
  protected readonly dataUri = computed(() => this.tiles() ? `data:image/svg+xml;utf8,${encodeURIComponent(renderGroup(this.seeds(), this.groupOptions()))}` : '');
  protected readonly wrapperStyle = computed(() => {
    const group = this.tiles();
    return group ? `position:relative;width:${group.width}px;height:${group.height}px;${this.svgStyle() ?? ''}` : '';
  });
}
