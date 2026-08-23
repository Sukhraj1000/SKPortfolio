# Chronicle Run game asset kit

This directory contains the normalized runtime exports for the character, industrial-world, story-pickup, hazard, and HUD artwork used by optional Chronicle Run mode. Generated source sheets remain outside the public bundle under `assets/game/source/` so they do not ship with the static site.

## Runtime contract

- `sk-character-sheet.png`: 192 × 256 pixels, arranged as 4 × 4 frames of 48 × 64 pixels.
- `industrial-world-atlas.png`: 640 × 640 pixels, arranged as 5 × 5 cells of 128 × 128 pixels.
- `inventory.json`: machine-readable source-art coordinates, animation timing, semantic IDs, and intended use for every frame.

Use nearest-neighbour rendering (`image-rendering: pixelated`) and crop with the coordinates in `inventory.json`. Physics, hitboxes, level design, scoring, and portfolio panels intentionally remain outside this kit.

## Source artwork and runtime colour

The character is an identity-inspired abstraction rather than a portrait: dark bomber jacket and clothing, steel boots, a cool-blue signal stripe, and a small SK jacket identifier. The source atlas palette recorded in `inventory.json` describes pixels baked into the original character/world artwork; it is not the active DOM or Phaser display-token contract.

The current dark-only runtime places these source pixels inside the Orbital Engineering Journey's inherited near-black, cyan, lime, mint, gold, coral, and restrained violet display palette. Phaser samples semantic CSS values from its scoped host when the scene is constructed. Build Lab may therefore use a violet chapter accent even though the source artwork itself was deliberately generated without purple-neon branding. There are no light Day scenes in the current runtime.

The artwork avoids weapons, military rank marks, cute/chibi treatment, pastel branding, orange-led branding, and soft antialiased presentation. Both exported PNGs have transparent corners and remain legible against the current dark orbital surfaces.

## Source provenance

The source sheets were generated with the built-in OpenAI image-generation workflow on 2026-08-12. A private profile photograph was used only as an identity reference for the SK character and is deliberately not included in the repository. The character source used a flat chroma background that was removed locally; the world source was returned with an alpha channel. Both were normalized into exact frame grids using nearest-neighbour resampling.

## License

The source sheets and normalized Chronicle Run exports are original project artwork released under the repository's [MIT License](../../../LICENSE). The private reference photograph is not included and is not licensed. See [Asset licensing and attribution](../../../ASSET-LICENSES.md) for the complete asset and trademark notice.
