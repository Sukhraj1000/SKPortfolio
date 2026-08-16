# Chronicle Run game asset kit

This directory contains the normalized runtime exports for the character, industrial-world, story-pickup, hazard, and HUD artwork used by the optional Chronicle Run mode. The generated source sheets are preserved outside the public bundle under `assets/game/source/` so they do not ship with the static site.

## Runtime contract

- `sk-character-sheet.png`: 192 × 256 pixels, arranged as 4 × 4 frames of 48 × 64 pixels.
- `industrial-world-atlas.png`: 640 × 640 pixels, arranged as 5 × 5 cells of 128 × 128 pixels.
- `inventory.json`: machine-readable coordinates, animation timing, semantic IDs, and intended use for every frame.
Use nearest-neighbour rendering (`image-rendering: pixelated`) and crop with the coordinates in `inventory.json`. Physics, hitboxes, level design, scoring, and portfolio panels intentionally remain outside this kit.

## Visual contract

The character is an identity-inspired abstraction rather than a portrait: dark bomber jacket and clothing, steel boots, cool-blue signal stripe, and a small SK jacket identifier. The world uses the shared Day/Night palette with shape-based distinctions for interactive states, collectibles, hazards, and controls.

The artwork avoids weapons, military rank marks, cute or chibi treatment, pastel color, orange-led branding, purple neon, and soft antialiased presentation. Both exported PNGs have transparent corners and are intended to remain legible against light-concrete Day scenes and deep blue-grey Night scenes.

## Source provenance

The source sheets were generated with the built-in OpenAI image generation workflow on 2026-08-12. A private profile photograph was used only as an identity reference for the SK character and is deliberately not included in the repository. The character source used a flat chroma background that was removed locally; the world source was returned with an alpha channel. Both were normalized into exact frame grids using nearest-neighbour resampling.

## License

The source sheets and normalized Chronicle Run exports are original project artwork released under the repository's [MIT License](../../../LICENSE). The private reference photograph is not included and is not licensed. See [Asset licensing and attribution](../../../ASSET-LICENSES.md) for the complete asset and trademark notice.
