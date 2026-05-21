import { describe, it, expect } from 'vitest';
import { createAvatar, selectAvatar, renderAvatar } from '../src/index.js';

describe('animated', () => {
  it('emits no <style> by default', () => {
    const svg = createAvatar('alice');
    expect(svg).not.toContain('<style>');
  });

  it('emits <style> with keyframes when animated=true', () => {
    const svg = createAvatar('alice', { animated: true });
    expect(svg).toContain('<style>');
    expect(svg).toContain('@keyframes n-float');
    expect(svg).toContain('@keyframes n-blink');
  });

  it('wraps body + eyes + scope class in animated mode', () => {
    const svg = createAvatar('alice', { animated: true });
    expect(svg).toContain('class="body"');
    expect(svg).toContain('class="eyes"');
    expect(svg).toMatch(/class="n-[a-z0-9]+"/); // per-seed scope wrapper
  });

  it('respects prefers-reduced-motion', () => {
    const svg = createAvatar('alice', { animated: true });
    expect(svg).toContain('prefers-reduced-motion: reduce');
  });

  it('still deterministic when animated', () => {
    expect(createAvatar('alice', { animated: true })).toBe(
      createAvatar('alice', { animated: true }),
    );
  });

  it('animation delays vary across seeds', () => {
    const a = createAvatar('a', { animated: true });
    const b = createAvatar('b', { animated: true });
    expect(a).not.toBe(b);
  });
});
