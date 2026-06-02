# Lagos Danfo Pack Design

## Summary

Lagos Danfo is a premium Lagos/Nigeria-inspired avatar identity pack for the
Figma plugin and shared Navii Core pack system. It should feel bright, urban,
friendly, and unmistakably Nigerian: green-white-green is the main identity
signal, while danfo yellow adds the Lagos-specific punch.

The pack is not a costume pack and not a broad "Africa" treatment. It should
feel like a polished avatar identity system built from national color,
transport geometry, route-sign rhythm, and clean black linework.

## Goals

- Create a pack that reads clearly as Nigeria/Lagos at small Figma sizes.
- Make the Nigerian green-white-green prominent without losing the danfo
  yellow Lagos cue.
- Keep the pack visually distinct from Accra Gallery, which is warmer,
  textile-led, and gallery-like.
- Preserve deterministic rendering: the same seed, pack, palette, style, and
  mood options must produce the same output.
- Ship as a normal built-in premium pack through the current Core and Figma
  plugin architecture.

## Non-Goals

- No server-driven pack catalog work in this phase.
- No API-admin workflow for uploading packs.
- No cultural costume caricatures.
- No sacred, religious, or meaning-heavy symbols.
- No literal vehicle illustration as the main avatar. Danfo should influence
  shapes, stripes, and details, not turn every avatar into a bus.

## Visual Direction

The chosen direction is Flag-First Danfo.

The avatar bodies and backgrounds should lead with Nigerian green-white-green.
Danfo yellow should appear as the Lagos accent: roof stripes, route bands,
side trims, collars, glasses, pins, and small graphic details.

The design language should use:

- saturated Nigerian green
- warm white or cream panels
- danfo yellow accents
- black route-line strokes
- simple rounded bus-panel and road-sign geometry
- restrained bands, stripes, and route dots

Pattern and transport detail should support the face, not compete with it. At
32px and 48px, the first read should be clean Navii avatar, then Nigeria/Lagos
through color and trim.

## Pack Name

Display name: `Lagos Danfo`

Pack id: `lagos-danfo`

The name is direct and memorable. It gives the pack a Lagos-specific hook while
leaving the visual system free to lead with Nigerian green-white-green.

## Palettes

The pack should ship five exclusive palettes. The exact hex values can be tuned
in implementation, but the roles should stay stable:

- `lagos-danfo:green-white`
  - green body
  - white secondary panel
  - danfo yellow accent
  - black ink
- `lagos-danfo:white-green`
  - warm white body
  - green secondary
  - danfo yellow accent
  - black ink
- `lagos-danfo:danfo-green`
  - danfo yellow body or trim
  - green secondary
  - white accent
  - black ink
- `lagos-danfo:deep-green`
  - dark green body
  - white secondary
  - yellow accent
  - black or near-black ink
- `lagos-danfo:street-black`
  - near-black body
  - yellow secondary
  - green/white accents
  - light ink where needed for visibility

Unlike Accra Gallery, yellow should not dominate every body. It should be
strong enough to read as Lagos, but green-white-green should remain the pack's
main signature.

## Parts

### Body Shapes

Lagos Danfo should add or reuse shapes inspired by transport and city signage:

- rounded bus badge
- route plaque
- soft shield
- sign tile

The shapes should stay character-like. Avoid literal wheels, windows, or full
bus silhouettes as the primary body.

### Toppers

Recommended toppers:

- danfo roof stripe
- green-white-green band
- small route-cap shape

These should be simple, graphic, and legible. Yellow can appear strongly here
even when the body is green or white.

### Accessories

Recommended accessories:

- yellow glasses
- green pin
- route dot
- simple black glasses

Accessories should provide variety without making the pack noisy.

### Outfits

Recommended outfits:

- road-stripe collar
- flag collar
- yellow trim necklace

Outfits are a good place to force the green-white-green/yellow relationship
into every generated avatar.

### Backgrounds

Recommended background treatments:

- white plate
- green side panels
- yellow route stripe
- subtle black route line

Backgrounds should be mostly flat and editorial. Avoid street-scene
illustration, skylines, or cluttered maps.

## Style Hints

The pack should support `masc`, `femme`, and `neutral` using subtle pool
biases only.

- `neutral`: balanced body, simple band, route/flag collar
- `masc`: slightly more angular sign/badge shapes and black/yellow details
- `femme`: slightly softer bands, pins, and yellow trim

Style hints must not encode cultural or gender stereotypes. They are only
presentation variety controls.

## Rendering Rules

- Use `paletteExclusive: true` so Lagos Danfo stays on-theme.
- Prefer `flat: true` for a crisp editorial/plugin-card look.
- Use a warm white or clean white `bgColor` depending on legibility.
- Tune `featureStroke` so faces stay readable on green and black bodies.
- If a palette uses near-black bodies, use light ink or forced light facial
  details where needed.
- Force at least one visible flag/yellow detail through topper, outfit, or
  background pools so the pack does not become generic green avatars.
- Avoid heavy gradients and glow.

## Figma Plugin Behavior

Lagos Danfo appears in the existing Packs tab alongside other built-in premium
packs.

The pack card should show:

- display name `Lagos Danfo`
- description: `Lagos-inspired avatars with Nigerian green-white-green, danfo yellow accents, bold route-line geometry, and clean city energy.`
- generated preview using `createAvatar('lagos-danfo', { packs: ['lagos-danfo'] })`
- normal Pro gating behavior
- existing modal behavior with sample seeds and style hint controls

Saved enabled packs should continue to store only pack ids. No storage schema
change is required.

## Testing

Core tests should verify:

- `lagos-danfo` is present in `BUILT_IN_PACKS`.
- The pack has five namespaced palettes.
- The palette ids match the agreed names.
- The pack uses `paletteExclusive: true`.
- The pack exposes pack-specific body, topper, accessory, or outfit picks.
- Rendering with `packs: ['lagos-danfo']` produces deterministic SVG output.
- Near-black palette output keeps face/accessory details visible.

Figma plugin verification should include:

- Core build.
- Figma plugin typecheck.
- Figma plugin build.
- Bundle grep or equivalent check confirming `Lagos Danfo` and
  `lagos-danfo` are present in plugin output.

## Open Implementation Notes

- Implementation can initially reuse some Accra/Core part infrastructure if
  the resulting visuals still read clearly as Lagos Danfo.
- If new part ids are added, update public union types and renderer switch
  statements in the same implementation slice.
- The plugin Pro copy should be updated from 8 premium packs to 9 premium
  packs when this pack ships.
