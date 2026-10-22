import { describe, expect, it } from 'vitest';
import { renderToString } from 'solid-js/web';
import { Navii, NaviiGroup } from '../src/index';

describe('Navii (SSR)', () => {
  it('renders the image fallback markup on the server', () => {
    const html = renderToString(() => Navii({ seed: 'solid-ssr', as: 'img', size: 64 }));
    expect(html).toMatch(/^<img /);
    expect(html).toContain('data:image/svg+xml;utf8,%3Csvg');
    expect(html).toContain('width="64"');
  });

  it('falls back to inline SVG markup when a label is present', () => {
    const html = renderToString(() =>
      NaviiGroup({ seeds: ['a', 'b', 'c', 'd'], max: 2, as: 'img', alt: 'Team' }),
    );
    expect(html).toMatch(/^<img /);
    expect(decodeURIComponent(html)).toContain('Team');
  });
});
