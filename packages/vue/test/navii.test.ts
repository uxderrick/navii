import { cleanup, render, screen, waitFor } from '@testing-library/vue';
import { afterEach, describe, expect, it } from 'vitest';
import { Navii, NaviiGroup } from '../src/index.js';

afterEach(cleanup);

describe('Navii', () => {
  it('renders an accessible inline SVG', async () => {
    const { container } = render(Navii, {
      props: { seed: 'alice', title: 'Alice' },
    });

    expect(await screen.findByRole('img', { name: 'Alice' })).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector('svg')).toBeInTheDocument());
  });

  it('renders an image fallback with caller styling', () => {
    render(Navii, {
      props: {
        seed: 'alice',
        as: 'img',
        alt: 'Alice avatar',
        class: 'avatar',
        style: { borderRadius: '50%' },
      },
    });

    const image = screen.getByRole('img', { name: 'Alice avatar' });
    expect(image).toHaveClass('avatar');
    expect(image).toHaveStyle({ borderRadius: '50%' });
    expect(image).toHaveAttribute('src', expect.stringContaining('data:image/svg+xml'));
  });

  it('updates generated markup when the seed changes', async () => {
    const view = render(Navii, { props: { seed: 'alice', as: 'img' } });
    const before = screen.getByRole('img').getAttribute('src');

    await view.rerender({ seed: 'bob', as: 'img' });

    expect(screen.getByRole('img').getAttribute('src')).not.toBe(before);
  });

  it('is deterministic across equivalent rerenders', async () => {
    const view = render(Navii, { props: { seed: 'alice', as: 'img' } });
    const before = screen.getByRole('img').getAttribute('src');

    await view.rerender({ seed: 'alice', as: 'img' });

    expect(screen.getByRole('img').getAttribute('src')).toBe(before);
  });
});

describe('NaviiGroup', () => {
  it('renders one inline SVG per visible tile', async () => {
    const { container } = render(NaviiGroup, {
      props: { seeds: ['alice', 'bob', 'carol'], alt: 'Team' },
    });

    expect(screen.getByRole('img', { name: 'Team' })).toBeInTheDocument();
    await waitFor(() => expect(container.querySelectorAll('svg')).toHaveLength(3));
  });

  it('renders an overflow counter', async () => {
    const { container } = render(NaviiGroup, {
      props: { seeds: ['a', 'b', 'c', 'd', 'e'], max: 4 },
    });

    await waitFor(() => expect(container.querySelectorAll('svg')).toHaveLength(4));
    expect(container.textContent).toContain('+2');
  });

  it('renders a composite image fallback', () => {
    render(NaviiGroup, {
      props: { seeds: ['alice', 'bob'], as: 'img', alt: 'Pair' },
    });

    const image = screen.getByRole('img', { name: 'Pair' });
    expect(image).toHaveAttribute('width', '108.8');
    expect(image).toHaveAttribute('height', '64');
  });

  it('updates when seeds change', async () => {
    const view = render(NaviiGroup, {
      props: { seeds: ['alice', 'bob'], as: 'img' },
    });
    const before = screen.getByRole('img').getAttribute('src');

    await view.rerender({ seeds: ['alice', 'carol'], as: 'img' });

    expect(screen.getByRole('img').getAttribute('src')).not.toBe(before);
  });

  it('renders nothing for an empty seed array', () => {
    const { container } = render(NaviiGroup, { props: { seeds: [] } });

    expect(container.firstElementChild).toBeNull();
  });
});
