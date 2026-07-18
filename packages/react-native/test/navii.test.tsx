import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Navii, NaviiGroup } from '../src/index.js';

vi.mock('react-native', () => ({
  View: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement('View', props, children),
}));

vi.mock('@mhaadi/svg/react-native', () => ({
  SVG: (props: Record<string, unknown>) => React.createElement('SvgRoot', props),
}));

const mounted: TestRenderer.ReactTestRenderer[] = [];

function render(element: React.ReactElement): TestRenderer.ReactTestRenderer {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(element);
  });
  mounted.push(renderer);
  return renderer;
}

afterEach(() => {
  for (const renderer of mounted.splice(0)) {
    act(() => renderer.unmount());
  }
});

describe('Navii', () => {
  it('renders generated SVG with dimensions', () => {
    const renderer = render(<Navii seed="alice" size={80} />);
    const svg = renderer.root.findByType('SvgRoot');

    expect(svg.props.src).toContain('<svg');
    expect(svg.props.width).toBe(80);
    expect(svg.props.height).toBe(80);
  });

  it('sets native accessibility and forwards style', () => {
    const style = { borderRadius: 40 };
    const renderer = render(<Navii seed="alice" alt="Alice" style={style} />);
    const root = renderer.root.findByType('View');

    expect(root.props.accessibilityLabel).toBe('Alice');
    expect(root.props.accessibilityRole).toBe('image');
    expect(root.props.style).toBe(style);
  });

  it('updates SVG markup when the seed changes', () => {
    const renderer = render(<Navii seed="alice" />);
    const before = renderer.root.findByType('SvgRoot').props.src;

    act(() => renderer.update(<Navii seed="bob" />));

    expect(renderer.root.findByType('SvgRoot').props.src).not.toBe(before);
  });

  it('is deterministic across equivalent updates', () => {
    const renderer = render(<Navii seed="alice" sanitize />);
    const before = renderer.root.findByType('SvgRoot').props.src;

    act(() => renderer.update(<Navii seed="alice" sanitize />));

    expect(renderer.root.findByType('SvgRoot').props.src).toBe(before);
    expect(renderer.root.findByType('SvgRoot').props.sanitize).toBe(true);
  });
});

describe('NaviiGroup', () => {
  it('renders one SVG per visible tile', () => {
    const renderer = render(<NaviiGroup seeds={['alice', 'bob', 'carol']} />);

    expect(renderer.root.findAllByType('SvgRoot')).toHaveLength(3);
  });

  it('renders an overflow counter', () => {
    const renderer = render(
      <NaviiGroup seeds={['a', 'b', 'c', 'd', 'e']} max={4} />,
    );
    const svgs = renderer.root.findAllByType('SvgRoot');

    expect(svgs).toHaveLength(4);
    expect(svgs.at(-1)?.props.src).toContain('+2');
  });

  it('sets group geometry and accessibility', () => {
    const renderer = render(
      <NaviiGroup seeds={['alice', 'bob']} size={50} overlap={0.2} alt="Pair" />,
    );
    const root = renderer.root.findAllByType('View')[0];

    expect(root.props.accessibilityLabel).toBe('Pair');
    expect(root.props.accessibilityRole).toBe('image');
    expect(root.props.style[0]).toEqual({
      position: 'relative',
      width: 90,
      height: 50,
    });
  });

  it('updates tiles when seeds change', () => {
    const renderer = render(<NaviiGroup seeds={['alice', 'bob']} />);
    const before = renderer.root.findAllByType('SvgRoot')[1]?.props.src;

    act(() => renderer.update(<NaviiGroup seeds={['alice', 'carol']} />));

    expect(renderer.root.findAllByType('SvgRoot')[1]?.props.src).not.toBe(before);
  });

  it('renders nothing for an empty seed array', () => {
    const renderer = render(<NaviiGroup seeds={[]} />);

    expect(renderer.toJSON()).toBeNull();
  });
});
