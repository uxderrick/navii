# Nairobi Matatu Pack Design

## Summary

Nairobi Matatu is a premium Nairobi/Kenya-inspired avatar identity pack for the
Figma plugin and shared Navii Core pack system. It should feel urban, electric,
and expressive: Nairobi matatu graphics provide the city-specific energy, while
restrained shuka-inspired grid accents add Kenyan visual DNA.

The pack is not a costume pack and not a generic "Africa" treatment. It should
feel like a polished identity system built from route signage, sticker-like
geometry, dark plates, neon color, and controlled textile rhythm.

## Goals

- Create a pack that reads clearly as Nairobi/Kenya while staying distinct
  from Accra Gallery and Lagos Danfo.
- Use matatu-inspired visual language through bold route graphics, energetic
  color, and layered sticker geometry.
- Use shuka-inspired checks as restrained bands/collars/trim, not as full-body
  costume or literal cultural dress.
- Keep avatars legible at small Figma sizes such as 32px, 48px, and 80px.
- Preserve deterministic rendering: the same seed, pack, palette, style, and
  mood options must produce the same output.
- Ship as a normal built-in premium pack through the current Core and Figma
  plugin architecture.

## Non-Goals

- No server-driven pack catalog work in this phase.
- No API-admin workflow for uploading packs.
- No cultural costume caricatures.
- No sacred, religious, tribal, or meaning-heavy symbols.
- No literal vehicle illustration as the main avatar. Matatu should influence
  route graphics, trim, badges, and color energy, not turn every avatar into a
  bus.
- No busy full-surface patterning that reduces face legibility.

## Visual Direction

The chosen direction is Matatu Neon with Shuka Grid accents.

The pack should feel darker and louder than Lagos Danfo. Lagos is flag-first
and clean; Nairobi Matatu should be more night-city, route-sticker, and neon.
The base surfaces can use black/charcoal plates, with electric green, red,
blue, yellow, and warm white as accents.

The design language should use:

- dark charcoal or near-black plates
- electric green, red, yellow, and blue accents
- shuka-inspired red/black/blue/white check bands
- route-sticker geometry
- angled sign tiles and side strips
- sharp black or light strokes depending on palette contrast

Pattern is an accent. At small sizes, the avatar should read first as a clean
Navii avatar, then as Nairobi Matatu through route bands, neon trim, and
checked collars/toppers.

## Pack Name

Display name: `Nairobi Matatu`

Pack id: `nairobi-matatu`

The name is place-based and specific. It gives the pack a recognizable Nairobi
hook without making the art literal.

## Palettes

The pack should ship five exclusive palettes. Exact hex values can be tuned in
implementation, but the roles should stay stable:

- `nairobi-matatu:night-green`
  - near-black body
  - electric green accent
  - warm white ink/details
  - red secondary mark
- `nairobi-matatu:route-red`
  - deep red body or secondary panel
  - charcoal base
  - blue/yellow accent
  - light ink where needed
- `nairobi-matatu:electric-blue`
  - electric blue body or trim
  - dark secondary
  - green/yellow accents
  - light or dark ink based on contrast
- `nairobi-matatu:shuka-check`
  - red-led palette
  - black secondary
  - white/blue checked accents
  - yellow route pop
- `nairobi-matatu:safari-neon`
  - warm cream body or plate
  - green secondary
  - red/yellow/blue accents
  - dark ink

Unlike Lagos Danfo, this pack can use dark bodies more often. Near-black
palettes must force light face/accessory details so the avatar remains readable.

## Parts

### Body Shapes

Nairobi Matatu should add or reuse city-signage shapes:

- matatu badge
- route sticker
- city plaque
- angled sign tile

The shapes should feel like graphic signs and badges, not literal vehicles.

### Toppers

Recommended toppers:

- neon route band
- shuka grid band
- sticker cap

Toppers should carry much of the Nairobi identity. They can be louder than
Accra/Lagos toppers, but still compact and legible.

### Accessories

Recommended accessories:

- bright glasses
- route dot
- Kenya pin
- small graphic mark

Accessories should add expressive variety without hiding the face.

### Outfits

Recommended outfits:

- shuka-check collar
- neon trim collar
- route-stripe necklace

Outfits are the safest place to force shuka-grid rhythm into every generated
avatar without overwhelming the body.

### Backgrounds

Recommended background treatments:

- dark plate
- green/red side strips
- small route-line detail
- cream plate for lighter palette variants

Backgrounds should stay flat and editorial. Avoid full street scenes, skylines,
or detailed map graphics.

## Style Hints

The pack should support `masc`, `femme`, and `neutral` using subtle pool
biases only.

- `neutral`: balanced body, compact route band, shuka/check collar
- `masc`: slightly more angular sign shapes, route dots, dark/neon trims
- `femme`: slightly softer sticker cap, bright glasses, collar/necklace trim

Style hints must not encode cultural or gender stereotypes. They are only
presentation variety controls.

## Rendering Rules

- Use `paletteExclusive: true` so Nairobi Matatu stays on-theme.
- Prefer `flat: true` for a crisp route-poster/plugin-card look.
- Use a dark or warm-cream `bgColor` depending on legibility. If using a dark
  plate, the face and accessories must remain bright enough.
- Tune `featureStroke` so faces stay readable against dark and red bodies.
- Force at least one visible route/neon/check detail through topper, outfit, or
  accessory pools so the pack does not become generic dark avatars.
- Avoid heavy glow unless it is extremely subtle. The pack should feel neon
  through color and contrast, not blur.
- Avoid full-body checks. Checks belong on bands, collars, and small trim.

## Figma Plugin Behavior

Nairobi Matatu appears in the existing Packs tab alongside other built-in
premium packs.

The pack card should show:

- display name `Nairobi Matatu`
- description: `Nairobi-inspired avatars with matatu route graphics, dark plates, neon color, and restrained shuka-grid accents.`
- generated preview using `createAvatar('nairobi-matatu', { packs: ['nairobi-matatu'] })`
- normal Pro gating behavior
- existing modal behavior with sample seeds and style hint controls

Saved enabled packs should continue to store only pack ids. No storage schema
change is required.

## Local Preview Behavior

Before treating the Figma plugin visuals as final, create a local review route
similar to `/accra-packs` and `/lagos-packs`:

- route: `/nairobi-packs`
- render a dense grid directly from Core using `packs: ['nairobi-matatu']`
- cycle all five palettes, style hints, and moods
- show the pack swatches at the top of the page

This route is for visual review only and does not need to ship unless demo
routes become an intentional product surface.

## Testing

Core tests should verify:

- `nairobi-matatu` is present in `BUILT_IN_PACKS`.
- The pack has five namespaced palettes.
- The palette ids match the agreed names.
- The pack uses `paletteExclusive: true`.
- The pack uses `flat: true`.
- The pack exposes pack-specific body, topper, accessory, or outfit picks.
- Rendering with `packs: ['nairobi-matatu']` produces deterministic SVG output.
- Dark palette output keeps face/accessory details visible.

React verification should include:

- `<Navii />` and `<NaviiGroup />` continue forwarding `packs` after the Lagos
  fix.
- Typecheck passes.

Figma plugin verification should include:

- Core build.
- Figma plugin typecheck.
- Figma plugin build.
- Bundle grep or equivalent check confirming `Nairobi Matatu` and
  `nairobi-matatu` are present in plugin output.

## Open Implementation Notes

- Implementation can reuse some Lagos route/sign geometry if the resulting
  visuals still feel distinct: Lagos should remain flag-first and clean;
  Nairobi should be darker, louder, and more neon.
- If new part ids are added, update public union types and renderer switch
  statements in the same implementation slice.
- The plugin Pro copy should be updated from 9 premium packs to 10 premium
  packs when this pack ships.
- The palette total should increase by 5 when this pack ships.
