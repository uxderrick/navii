import { describe, it, expect, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import * as React from 'react';
import { Navii, NaviiGroup } from '../src/index';

afterEach(() => {
  cleanup();
});

describe('Navii', () => {
  it('renders an inline <svg> by default (better-svg path)', async () => {
    const { container } = render(<Navii seed="abc" />);
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeTruthy();
    });
    expect(container.querySelector('img')).toBeNull();
  });

  it('falls back to <img src="data:..."> when as="img"', () => {
    const { container } = render(<Navii seed="abc" as="img" />);
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')?.startsWith('data:image/svg+xml')).toBe(true);
  });

  it('preserves engine viewBox 0 0 100 100 in the root svg', async () => {
    const { container } = render(<Navii seed="hello" size={48} />);
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeTruthy();
    });
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 100 100');
  });

  it('overrides engine width/height with caller props', async () => {
    const { container } = render(<Navii seed="x" size={48} />);
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeTruthy();
    });
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('48');
    expect(container.querySelector('svg')?.getAttribute('height')).toBe('48');
  });

  it('preserves the <style> animation block when animated=true', async () => {
    const { container } = render(<Navii seed="anim" animated />);
    await waitFor(() => {
      expect(container.querySelector('style')).toBeTruthy();
    });
    expect(container.querySelector('style')?.textContent).toContain('@keyframes n-float');
    expect(container.querySelector('g[class^="n-"]')).toBeTruthy();
  });

  it('preserves <title> for screen readers', async () => {
    const { container } = render(<Navii seed="t" title="Mascot" />);
    await waitFor(() => {
      expect(container.querySelector('title')).toBeTruthy();
    });
    expect(container.querySelector('title')?.textContent).toBe('Mascot');
  });

  it('emits role and aria-label when title is set', async () => {
    const { container } = render(<Navii seed="t" title="Mascot" />);
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeTruthy();
    });
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('Mascot');
  });

  it('emits aria-hidden when no title or alt is set', async () => {
    const { container } = render(<Navii seed="t" />);
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeTruthy();
    });
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('forwards className and style to the root svg', async () => {
    const { container } = render(
      <Navii seed="x" className="rounded" style={{ border: '1px solid red' }} />,
    );
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeTruthy();
    });
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('rounded')).toBe(true);
    expect((svg as SVGElement).style.border).toContain('red');
  });

  it('respects alt over title for aria-label', async () => {
    const { container } = render(<Navii seed="t" title="Internal" alt="Public" />);
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeTruthy();
    });
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe('Public');
  });

  it('is deterministic across re-renders', async () => {
    const a = render(<Navii seed="same" size={40} />);
    await waitFor(() => expect(a.container.querySelector('svg')).toBeTruthy());
    const htmlA = a.container.innerHTML;
    cleanup();
    const b = render(<Navii seed="same" size={40} />);
    await waitFor(() => expect(b.container.querySelector('svg')).toBeTruthy());
    expect(b.container.innerHTML).toBe(htmlA);
  });

  it('honors paletteId override', async () => {
    const { container } = render(<Navii seed="x" paletteId="mint" />);
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeTruthy();
    });
    expect(container.querySelector('svg')).toBeTruthy();
  });
});

describe('NaviiGroup', () => {
  it('renders N svg elements (one per tile)', async () => {
    const { container } = render(<NaviiGroup seeds={['a', 'b', 'c']} size={48} />);
    await waitFor(() => {
      expect(container.querySelectorAll('svg')).toHaveLength(3);
    });
  });

  it('emits a +N counter tile when overflow', async () => {
    const { container } = render(
      <NaviiGroup seeds={['a', 'b', 'c', 'd', 'e']} size={32} max={3} />,
    );
    await waitFor(() => {
      expect(container.querySelectorAll('svg')).toHaveLength(3);
    });
    expect(container.textContent).toContain('+3');
  });

  it('omits counter tile when no overflow', async () => {
    const { container } = render(<NaviiGroup seeds={['a', 'b']} size={32} max={5} />);
    await waitFor(() => {
      expect(container.querySelectorAll('svg')).toHaveLength(2);
    });
    expect(container.textContent).not.toContain('+');
  });

  it('produces per-tile unique clipPath ids', async () => {
    const { container } = render(<NaviiGroup seeds={['a', 'b', 'c']} />);
    await waitFor(() => {
      expect(container.querySelectorAll('svg')).toHaveLength(3);
    });
    const ids = [...container.querySelectorAll('[id^="navii-clip-"]')].map(
      (el) => el.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('falls back to <img> when as="img"', () => {
    const { container } = render(<NaviiGroup seeds={['a', 'b']} as="img" />);
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')?.startsWith('data:image/svg+xml')).toBe(true);
  });

  it('returns null for empty seeds', () => {
    const { container } = render(<NaviiGroup seeds={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('is deterministic across re-renders', async () => {
    const a = render(<NaviiGroup seeds={['x', 'y']} size={40} />);
    await waitFor(() => expect(a.container.querySelectorAll('svg').length).toBe(2));
    const htmlA = a.container.innerHTML;
    cleanup();
    const b = render(<NaviiGroup seeds={['x', 'y']} size={40} />);
    await waitFor(() => expect(b.container.querySelectorAll('svg').length).toBe(2));
    expect(b.container.innerHTML).toBe(htmlA);
  });

  it('positions tiles with absolute left offsets', async () => {
    const { container } = render(<NaviiGroup seeds={['a', 'b', 'c']} size={64} overlap={0.3} />);
    await waitFor(() => {
      expect(container.querySelectorAll('svg')).toHaveLength(3);
    });
    const wrappers = container.querySelectorAll('div[style*="position: absolute"]');
    expect(wrappers).toHaveLength(3);
    const step = 64 * (1 - 0.3);
    const first = wrappers[0] as HTMLElement;
    const second = wrappers[1] as HTMLElement;
    expect(first.style.left).toBe('0px');
    expect(second.style.left).toBe(`${step}px`);
  });
});
