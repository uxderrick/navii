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
    expect(pack.description).toContain('matatu route graphics');
    expect(pack.palettes).toBeDefined();
    expect(pack.palettes!.length).toBe(5);
    expect(paletteIds).toEqual([
      'nairobi-matatu:night-green',
      'nairobi-matatu:route-red',
      'nairobi-matatu:electric-blue',
      'nairobi-matatu:shuka-check',
      'nairobi-matatu:safari-neon',
    ]);
    expect(pack.palettes![0]).toMatchObject({
      bodyFrom: '#101820',
      bodyTo: '#12D977',
      accent: '#F8F7EF',
      ink: '#F8F7EF',
    });
    expect(pack.palettes!.find((p) => p.id === 'nairobi-matatu:night-green')).toMatchObject({
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
      paletteId: 'nairobi-matatu:night-green',
    });
    expect(svg).toBe(createAvatar('matatu-night', {
      packs: ['nairobi-matatu'],
      paletteId: 'nairobi-matatu:night-green',
    }));
    expect(svg).toContain('#101820');
    expect(svg).toContain('#F8F7EF');
    expect(svg).toContain('#12D977');
    expect(svg).toContain('#FF2D55');
  });
});
