# @usenavii/figma-plugin

Drop deterministic Navii avatars into Figma. Same seed → same mascot.

## MVP features

- **Seed mode** — type a user ID/email, get an avatar. Roll for random. Recent seeds saved.
- **Build mode** — manual body/eyes/mouth/topper/palette picker. No seed needed.
- **Bulk mode** — select layers, each layer's name becomes a seed. Avatars placed over each layer.
- **URL handoff** — every inserted node tagged with `naviiUrl` + `naviiSeed` via plugin data. Sidebar shows the CDN URL after insert; engineers can copy it.

## Dev

```sh
pnpm install                    # from monorepo root
pnpm --filter @usenavii/figma-plugin run build
# or watch mode while iterating:
pnpm --filter @usenavii/figma-plugin run dev
```

Then in Figma desktop app:
- Plugins → Development → Import plugin from manifest…
- Pick `packages/figma-plugin/manifest.json`

Reload plugin after each build via cmd+option+P or the menu.

## Layout

```
packages/figma-plugin/
├── manifest.json              # Figma plugin manifest
├── scripts/build.mjs          # esbuild → dist/code.js + dist/ui.html (inlined)
├── src/
│   ├── code.ts                # Figma main thread (sandboxed)
│   ├── ui.html                # iframe shell
│   └── ui.ts                  # iframe logic (live preview, message passing)
└── dist/                      # build output (gitignored)
```

## Roadmap

See parent `docs/private/backlog.md` and `docs/private/monetization.md` for Pro features.

- [ ] Pro license unlock flow (server-validated)
- [ ] Copy snippet (React/Vue/Swift/HTML)
- [ ] Replace placeholder shapes (`avatar`/`user`/`profile` named layers)
- [ ] Fit-to-shape (size avatar to selected ellipse)
- [ ] CSV/data import
- [ ] Brand palette upload
- [ ] PNG export
- [ ] Templates (testimonial wall, org chart, etc.)
