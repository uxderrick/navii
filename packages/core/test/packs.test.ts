import { describe, it, expect } from 'vitest';
import {
  createAvatar,
  selectAvatar,
  resolvePacks,
  PACK_REGISTRY,
  BUILT_IN_PACKS,
} from '../src/index.js';

describe('packs — scaffold', () => {
  it('exposes the launch packs in the registry', () => {
    const ids = BUILT_IN_PACKS.map((p) => p.id).sort();
    expect(ids).toEqual([
      'accra-gallery',
      'command-center',
      'earth', 'halloween', 'lagos-danfo', 'mono', 'nairobi-matatu', 'neon',
      'office', 'office-bright', 'pastel',
    ]);
    // Every built-in is reachable by id
    for (const pack of BUILT_IN_PACKS) {
      expect(PACK_REGISTRY[pack.id]).toBe(pack);
    }
  });

  it('resolvePacks() skips unknown ids and dedupes', () => {
    const result = resolvePacks(['office', 'office', 'does-not-exist', 'halloween']);
    expect(result.map((p) => p.id)).toEqual(['office', 'halloween']);
  });

  it('packs=[] / undefined / unknown leaves base seed output unchanged', () => {
    const baseline = createAvatar('alice');
    expect(createAvatar('alice', { packs: [] })).toBe(baseline);
    expect(createAvatar('alice', { packs: undefined })).toBe(baseline);
    expect(createAvatar('alice', { packs: ['does-not-exist'] })).toBe(baseline);
  });

  it('enabling an empty pack does not change selection', () => {
    // Packs that ship with no content yet (Day 1 skeletons) must be no-ops
    // until their content lands.
    const baseline = selectAvatar('alice');
    for (const pack of BUILT_IN_PACKS) {
      if ((pack.palettes ?? []).length === 0) {
        const withPack = selectAvatar('alice', { packs: [pack.id] });
        expect(withPack, `pack '${pack.id}' should be no-op while empty`).toEqual(baseline);
      }
    }
  });

  it('office pack contributes 5 namespaced palettes', () => {
    const pack = PACK_REGISTRY['office']!;
    expect(pack.palettes).toBeDefined();
    expect(pack.palettes!.length).toBe(5);
    for (const p of pack.palettes!) {
      expect(p.id.startsWith('office:'), `palette id "${p.id}" must be namespaced`).toBe(true);
    }
  });

  it('paletteId can target a pack palette explicitly', () => {
    const officeSvg = createAvatar('alice', {
      packs: ['office'],
      paletteId: 'office:navy',
    });
    // Same seed without pack/palette should differ (palette colors differ).
    expect(officeSvg).not.toBe(createAvatar('alice'));
    // Same seed + same pack + same paletteId → byte-identical.
    expect(officeSvg).toBe(createAvatar('alice', { packs: ['office'], paletteId: 'office:navy' }));
  });

  it('enabling office pack with random pick is deterministic across runs', () => {
    const a = createAvatar('alice', { packs: ['office'] });
    const b = createAvatar('alice', { packs: ['office'] });
    expect(a).toBe(b);
  });

  it('accra gallery pack contributes 5 namespaced palettes', () => {
    const pack = PACK_REGISTRY['accra-gallery']!;
    const paletteIds = pack.palettes!.map((p) => p.id);
    expect(pack).toBeDefined();
    expect(pack.name).toBe('Accra Gallery');
    expect(pack.palettes).toBeDefined();
    expect(pack.palettes!.length).toBe(5);
    expect(paletteIds).toEqual([
      'accra-gallery:gallery-gold',
      'accra-gallery:green-red',
      'accra-gallery:red-black',
      'accra-gallery:black-red',
      'accra-gallery:red-gold',
    ]);
    expect(pack.palettes![0]).toMatchObject({
      bodyFrom: '#F3CF4E',
      bodyTo: '#B12F28',
      accent: '#111827',
      ink: '#111827',
    });
    expect(pack.palettes!.find((p) => p.id === 'accra-gallery:black-red')).toMatchObject({
      bodyFrom: '#111827',
      ink: '#F6EEDC',
    });
    expect(pack.palettes!.filter((p) => p.bodyFrom === '#B12F28' || p.bodyFrom === '#812723')).toHaveLength(2);
    for (const p of pack.palettes!) {
      expect(p.id.startsWith('accra-gallery:'), `palette id "${p.id}" must be namespaced`).toBe(true);
    }
    expect(pack.paletteExclusive).toBe(true);
    expect(pack.flat).toBe(true);
  });

  it('accra gallery changes output while remaining deterministic', () => {
    const base = createAvatar('ama');
    const first = createAvatar('ama', { packs: ['accra-gallery'] });
    const second = createAvatar('ama', { packs: ['accra-gallery'] });
    expect(first).not.toBe(base);
    expect(first).toBe(second);
  });

  it('accra gallery paletteId can target a pack palette explicitly', () => {
    const svg = createAvatar('kwame', {
      packs: ['accra-gallery'],
      paletteId: 'accra-gallery:gallery-gold',
    });
    expect(svg).toBe(createAvatar('kwame', {
      packs: ['accra-gallery'],
      paletteId: 'accra-gallery:gallery-gold',
    }));
    expect(svg).toContain('#F6EEDC');
  });

  it('lagos danfo pack contributes 5 namespaced palettes', () => {
    const pack = PACK_REGISTRY['lagos-danfo']!;
    const paletteIds = pack.palettes!.map((p) => p.id);
    expect(pack).toBeDefined();
    expect(pack.name).toBe('Lagos Danfo');
    expect(pack.description).toContain('Nigerian green-white-green');
    expect(pack.palettes).toBeDefined();
    expect(pack.palettes!.length).toBe(5);
    expect(paletteIds).toEqual([
      'lagos-danfo:green-white',
      'lagos-danfo:white-green',
      'lagos-danfo:danfo-green',
      'lagos-danfo:deep-green',
      'lagos-danfo:street-black',
    ]);
    expect(pack.palettes![0]).toMatchObject({
      bodyFrom: '#008753',
      bodyTo: '#F8F7EF',
      accent: '#F5C51B',
      ink: '#111827',
    });
    expect(pack.palettes!.find((p) => p.id === 'lagos-danfo:street-black')).toMatchObject({
      bodyFrom: '#111827',
      ink: '#F8F7EF',
    });
    for (const p of pack.palettes!) {
      expect(p.id.startsWith('lagos-danfo:'), `palette id "${p.id}" must be namespaced`).toBe(true);
    }
    expect(pack.paletteExclusive).toBe(true);
    expect(pack.flat).toBe(true);
  });

  it('lagos danfo changes output while remaining deterministic', () => {
    const base = createAvatar('lagos-founder');
    const first = createAvatar('lagos-founder', { packs: ['lagos-danfo'] });
    const second = createAvatar('lagos-founder', { packs: ['lagos-danfo'] });
    expect(first).not.toBe(base);
    expect(first).toBe(second);
    expect(first).toContain('#F8F7EF');
  });

  it('lagos danfo paletteId can target the street black palette visibly', () => {
    const svg = createAvatar('eko-night', {
      packs: ['lagos-danfo'],
      paletteId: 'lagos-danfo:street-black',
    });
    expect(svg).toBe(createAvatar('eko-night', {
      packs: ['lagos-danfo'],
      paletteId: 'lagos-danfo:street-black',
    }));
    expect(svg).toContain('#111827');
    expect(svg).toContain('#F8F7EF');
    expect(svg).toContain('#F5C51B');
    expect(svg).toContain('#008753');
  });

  it('nairobi matatu pack contributes 5 namespaced palettes', () => {
    const pack = PACK_REGISTRY['nairobi-matatu']!;
    const paletteIds = pack.palettes!.map((p) => p.id);
    expect(pack).toBeDefined();
    expect(pack.name).toBe('Nairobi Matatu');
    expect(pack.description).toContain('matatu route stickers');
    expect(pack.palettes).toBeDefined();
    expect(pack.palettes!.length).toBe(5);
    expect(paletteIds).toEqual([
      'nairobi-matatu:route-black',
      'nairobi-matatu:kanu-red',
      'nairobi-matatu:city-green',
      'nairobi-matatu:yellow-stripe',
      'nairobi-matatu:shuka-blue',
    ]);
    expect(pack.palettes![0]).toMatchObject({
      bodyFrom: '#101820',
      bodyTo: '#101820',
      accent: '#F5C51B',
      ink: '#F8F7EF',
    });
    expect(pack.palettes!.find((p) => p.id === 'nairobi-matatu:route-black')).toMatchObject({
      bodyFrom: '#101820',
      ink: '#F8F7EF',
    });
    for (const p of pack.palettes!) {
      expect(p.id.startsWith('nairobi-matatu:'), `palette id "${p.id}" must be namespaced`).toBe(true);
    }
    expect(pack.paletteExclusive).toBe(true);
    expect(pack.flat).toBe(true);
  });

  it('nairobi matatu changes output while remaining deterministic', () => {
    const base = createAvatar('nairobi-founder');
    const first = createAvatar('nairobi-founder', { packs: ['nairobi-matatu'] });
    const second = createAvatar('nairobi-founder', { packs: ['nairobi-matatu'] });
    expect(first).not.toBe(base);
    expect(first).toBe(second);
    expect(first).toContain('#101820');
  });

  it('nairobi matatu dark palette keeps neon and light details visible', () => {
    const svg = createAvatar('matatu-night', {
      packs: ['nairobi-matatu'],
      paletteId: 'nairobi-matatu:route-black',
    });
    expect(svg).toBe(createAvatar('matatu-night', {
      packs: ['nairobi-matatu'],
      paletteId: 'nairobi-matatu:route-black',
    }));
    expect(svg).toContain('#101820');
    expect(svg).toContain('#F8F7EF');
    expect(svg).toContain('#F5C51B');
    expect(svg).toContain('#00843D');
    expect(svg).toContain('#C8102E');
  });

  it('nairobi matatu route-sticker palette includes route and flag markers', () => {
    const svg = createAvatar('route-46', {
      packs: ['nairobi-matatu'],
      paletteId: 'nairobi-matatu:route-black',
    });
    expect(svg).toContain('#F5C51B');
    expect(svg).toContain('#00843D');
    expect(svg).toContain('#C8102E');
    expect(svg).toContain('#F8F7EF');
    expect(svg).toMatch(/>46<|>CBD</);
  });

  it('command center pack contributes 6 namespaced system-token palettes', () => {
    const pack = PACK_REGISTRY['command-center']!;
    const paletteIds = pack.palettes!.map((p) => p.id);
    expect(pack).toBeDefined();
    expect(pack.name).toBe('Command Center');
    expect(pack.description).toContain('system tokens');
    expect(pack.palettes).toBeDefined();
    expect(pack.palettes!.length).toBe(6);
    expect(paletteIds).toEqual([
      'command-center:graphite',
      'command-center:slate',
      'command-center:cloud',
      'command-center:moss',
      'command-center:cobalt',
      'command-center:sand',
    ]);
    expect(pack.palettes![0]).toMatchObject({
      bodyFrom: '#111827',
      bodyTo: '#111827',
      accent: '#CBD5E1',
      ink: '#F8FAFC',
    });
    for (const p of pack.palettes!) {
      expect(p.id.startsWith('command-center:'), `palette id "${p.id}" must be namespaced`).toBe(true);
    }
    expect(pack.paletteExclusive).toBe(true);
    expect(pack.flat).toBe(true);
  });

  it('command center changes output while remaining deterministic', () => {
    const base = createAvatar('saas-founder');
    const first = createAvatar('saas-founder', { packs: ['command-center'] });
    const second = createAvatar('saas-founder', { packs: ['command-center'] });
    expect(first).not.toBe(base);
    expect(first).toBe(second);
    expect(first).toContain('#F7F8FA');
  });

  it('command center system-token palette stays abstract and app-safe', () => {
    const svg = createAvatar('dashboard-ready', {
      packs: ['command-center'],
      paletteId: 'command-center:graphite',
    });
    expect(svg).toBe(createAvatar('dashboard-ready', {
      packs: ['command-center'],
      paletteId: 'command-center:graphite',
    }));
    expect(svg).toContain('#111827');
    expect(svg).toContain('#8FB7A2');
    expect(svg).not.toMatch(/>OK<|>API<|>99<|>CMD<|<text/);
    expect(svg).not.toContain('#FDE68A');
    expect(svg).not.toContain('#38BDF8');
  });

  it('command center renders workspace glyphs instead of character faces', () => {
    const svg = createAvatar('workspace-glyph', {
      packs: ['command-center'],
      paletteId: 'command-center:cloud',
    });
    expect(svg).toContain('data-navii-render="workspace-glyph"');
    expect(svg).not.toContain('class="eyes"');
    expect(svg).not.toContain('class="body"');
    expect(svg).not.toContain('class="antenna"');
    expect(svg).not.toContain('<text');
    expect(svg).toContain('#64748B');
    expect(svg).toContain('#B7C3D0');
  });

  it('command center workspace glyphs stay quiet and minimal', () => {
    const svg = createAvatar('minimal-workspace-token', {
      packs: ['command-center'],
      paletteId: 'command-center:moss',
    });
    expect(svg).toContain('data-navii-render="workspace-glyph"');
    expect(svg).not.toContain('<ellipse');
    expect(svg.match(/<rect /g)?.length ?? 0).toBeLessThanOrEqual(3);
    expect(svg.match(/<circle /g)?.length ?? 0).toBeLessThanOrEqual(2);
    expect(svg).not.toContain('width="8" height="8"');
    expect(svg).not.toContain('rx="2.5"');
  });
});
