# Accra Gallery Pack Design

## Summary

Accra Gallery is a premium Ghana-inspired avatar identity pack for the Figma
plugin. It should feel like contemporary gallery design: warm ivory canvas,
refined dark linework, gold/red/green/black accents, and kente-inspired
geometric striping used as controlled detail.

The pack is not a costume pack. It should read as a polished design system with
Ghanaian visual DNA, suitable for founder pages, team pages, dashboards, pitch
decks, and brand presentations.

## Goals

- Create a distinctive pack that makes Navii feel less generic than common
  avatar libraries.
- Use Ghana-inspired visual language respectfully through color, geometry,
  textile rhythm, and material cues.
- Keep avatars legible at small Figma UI sizes such as 32px, 48px, and 80px.
- Ship as a normal built-in pack for the current plugin/core architecture.
- Preserve deterministic rendering: the same seed, pack, palette, and style
  options must produce the same output.

## Non-Goals

- No server-driven pack catalog work in this phase.
- No API-admin workflow for uploading packs.
- No cultural costume caricatures.
- No broad, generic "Africa" treatment.
- No sacred or meaning-heavy symbols unless intentionally researched and
  reviewed.

## Visual Direction

The chosen direction is Contemporary Gallery.

The base surface should feel warm and editorial rather than loud:

- warm ivory backgrounds
- clean dark strokes
- deep red, green, gold, and black accents
- geometric striping inspired by kente cloth construction
- pattern used on collars, side bands, toppers, pins, and background edges
- elegant rounded shapes rather than novelty silhouettes

Pattern is an accent, not a texture flood. At small sizes, the avatar should
still read first as a clean Navii-style avatar, then as Accra Gallery through
color and detail.

## Pack Name

Display name: `Accra Gallery`

Pack id: `accra-gallery`

The name is place-based, modern, and premium without being too literal.

## Palettes

The pack should ship five palettes based on the approved swatch strip:
near-black, warm gold, brick red, deep green, and bright gold. Warm ivory is
the gallery/card surface, not a primary avatar body color.

- `accra-gallery:gallery-gold`
  - warm gold body
  - brick red secondary
  - black stroke
- `accra-gallery:green-gold`
  - deep green body/accent
  - gold highlight
  - black stroke
- `accra-gallery:red-black`
  - brick red
  - near-black secondary
  - gold highlight
- `accra-gallery:black-gold`
  - near-black body
  - gold secondary
  - red accent
- `accra-gallery:woven-gold`
  - bright gold body
  - deep green secondary
  - brick red accent

Palette colors should be saturated enough to be recognizable, but less harsh
than flat flag colors. The final values should be tuned against 32px and 48px
renders.

## Parts

### Body Shapes

Accra Gallery should add or reuse refined body shapes:

- rounded gallery plaque
- soft shield
- woven tile
- medallion

If new body art is expensive, the first implementation can reuse existing body
shapes and rely on palettes, backgrounds, toppers, and accessories. However,
the design target is an identity system with distinct shapes.

### Toppers

The pack should include a few restrained toppers:

- textile band
- geometric cap
- headwrap-inspired silhouette

These should be abstract and minimal. They should not become costume pieces.

### Accessories

Recommended accessories:

- gold hoop
- black star pin
- minimalist glasses
- patterned collar

The black star may appear as a small design accent, not as a full flag motif.

### Backgrounds

Recommended background treatments:

- ivory canvas
- gold side strip
- red/green woven edge
- black gallery plate

Backgrounds should use simple geometry so the face remains dominant.

## Style Hints

The pack should support the existing `masc`, `femme`, and `neutral` style
hints, but the differences should be subtle.

- `neutral`: balanced body, simple topper/accessory pool
- `masc`: slightly more angular body/accessory pool
- `femme`: slightly softer topper/accessory pool

Style hints should not encode stereotypes. They are only pool biases for
presentation variety.

## Rendering Rules

- Use `paletteExclusive: true` so Accra Gallery avatars stay on-theme.
- Prefer `flat: true` or a low-depth treatment so the pack feels editorial.
- Avoid heavy glow.
- Keep face-feature strokes clean and slightly premium; tune `featureStroke`
  only if the face becomes too thin against patterned elements.
- Pattern must not cover the whole avatar body.
- Any kente-inspired band should be simplified to block/stripe rhythm, not a
  detailed literal copy.

## Figma Plugin Behavior

Accra Gallery appears in the existing Packs tab alongside the other built-in
packs.

The pack card should show:

- display name `Accra Gallery`
- description: `Contemporary Ghana-inspired avatars with refined textile geometry, warm ivory, gold, red, green, and black accents.`
- generated preview using `createAvatar('accra-gallery', { packs: ['accra-gallery'] })`
- normal Pro gating behavior
- existing modal behavior with sample seeds and style hint controls

Saved enabled packs should continue to store only pack ids. No storage schema
change is required.

## Testing

Core tests should verify:

- `BUILT_IN_PACKS` includes `accra-gallery`
- `PACK_REGISTRY['accra-gallery']` resolves
- enabling the pack changes output from base for representative seeds
- same seed plus same pack is deterministic
- explicit pack palette selection is deterministic
- unknown pack behavior remains unchanged

Plugin verification should include:

- pack appears in Packs tab
- pack can be enabled and disabled
- enabled pack appears in active pack chips
- seed preview can focus the pack
- modal samples render without visual crowding

## Implementation Notes

The first build must feel like a pack identity system, not only a color preset.
At minimum, it should combine exclusive palettes, narrowed part picks, flat or
low-depth rendering, and at least one distinctive visual treatment such as a
background strip, patterned collar, topper, or accessory.

New body/accessory/topper variants should be added if the current part registry
can support them without broad renderer refactoring. If the renderer needs
larger changes for new parts, keep those changes scoped and document any
follow-up work.
