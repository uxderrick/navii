import type { BackgroundId, Palette } from '../types.js';

export function renderBackground(id: BackgroundId, palette: Palette, override?: string): string {
  const color = override ?? palette.bodyFrom;
  switch (id) {
    case 'none':
      return '';
    case 'solid':
      return `<rect x="0" y="0" width="100" height="100" fill="${color}" opacity="0.18" />`;
    case 'ring':
      return [
        `<circle cx="50" cy="50" r="48" fill="${color}" opacity="0.14" />`,
        `<circle cx="50" cy="50" r="46" fill="none" stroke="${palette.accent}" stroke-width="0.6" opacity="0.4" />`,
      ].join('');
  }
}
