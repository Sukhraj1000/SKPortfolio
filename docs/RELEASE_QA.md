# IRON//SIGNAL release QA

Validated against issue #9 on 13 August 2026, with the portfolio reading-flow
suite expanded on 14 August 2026. This document separates reproducible
automated evidence from checks that still require a real browser or device
before production deployment.

## Automated evidence

Run the complete local release gate with:

```bash
npm run qa
```

Run the recruiter-facing browser regression suite with:

```bash
npm run qa:ui:install # first run on a machine
npm run qa:ui
```

To capture full-page images for the five-size day/night visual matrix on macOS
or Linux, run:

```bash
CAPTURE_UI_MATRIX=1 npm run qa:ui -- --grep "renders the"
```

The ignored `test-results/` directory keeps these review artifacts local.

`qa:ui` uses Playwright against the local portfolio and covers narrow-screen
overflow, visible professional context, text metrics, chapter navigation,
keyboard disclosure behavior, representative day/night contrast pairs, and
reduced-motion fallbacks. It is development-only and does not add JavaScript to
the production route.

The gate performs the production TypeScript, lint, static-export, and route checks. `scripts/validate-static-export.mjs` verifies that:

- Portfolio and Game ready-state HTML export successfully.
- Every local `href` and `src` in those documents resolves to exported output.
- Game artwork and Phaser chunks are absent from the initial Portfolio request.
- Phaser is also absent from the Game ready state and loads only after deployment starts.
- Game mode does not create a canvas before the visitor presses Start.
- The favicon and responsive project images remain within explicit transfer budgets.

Production bundle result after the reading-flow changes:

| Route | Route JS | First-load JS |
| --- | ---: | ---: |
| Portfolio `/` | 3.71 kB | 137 kB |
| Game ready state `/game/` | 4.23 kB | 118 kB |

Before cleanup, Portfolio was 8.97 kB route JS and 142 kB first-load JS. The Phaser runtime remains a separate lazy chunk of approximately 1.19 MB uncompressed and is requested only after Start deployment.

## Manual browser and assistive-technology matrix

Complete these checks on the deployment preview before production approval.
They cover visual judgment, real-device behavior, and assistive-technology
quality that the automated suite cannot prove. Record browser/device and result
alongside each row.

| Flow | 320×568 | 390×844 | 768×1024 | 1024×768 | 1440×900 |
| --- | --- | --- | --- | --- | --- |
| Local Chromium layout, navigation, disclosures, CV dialog and links | Pass | Pass | Pass | Pass | Pass |
| Local day/night theme, refresh persistence and visible focus | Pass | Pass | Pass | Pass | Pass |
| Local clipping, overlap, horizontal overflow and layout-shift review | Pass | Pass | Pass | Pass | Pass |

The local results combine Playwright assertions with full-page visual review in
both themes. A real-device deployment-preview pass is still required before
production approval.

Game-mode checks:

- Desktop keyboard: complete a run with arrows/WASD, Space/Up, E/Enter, pause, restart and exit.
- Mobile touch: move, jump, interact, open and close a terminal, pause, restart and exit.
- Confirm the canvas is nonblank and only one canvas exists after repeated enter/exit and restart cycles.
- Confirm all four cores are reachable and the final Comms uplink unlocks.
- Refresh `/game/`, use browser Back/Forward, and return to the remembered Portfolio chapter.
- Inspect the console throughout both primary flows; no uncaught errors are acceptable.
- Check header, navigation, sections, disclosures, dialogs, game controls and terminal panels with a screen reader.
- Repeat both modes with reduced motion enabled; the spawn drop, scan, status pulse, camera easing and core bobbing must not loop or move continuously.

## Targeted release changes

- Converted large project PNGs to responsive WebP sources with stable dimensions.
- Replaced the 1.8 MB favicon source with a 192×192, 34 kB export.
- Self-hosted the Latin Geist variable fonts so clean production builds require no Google Fonts connection.
- Removed unused legacy motion components, Framer Motion, obsolete public scripts and unused public starter assets.
- Increased practical icon controls and dialog close buttons to at least 44×44 CSS pixels.
- Raised essential Day-theme faint, green, cyan and warning text tokens to WCAG AA contrast.
- Added a trailing-slash static export so direct `/game/` refreshes resolve without server-side application routing.
- Limited decorative status/scan animations and disabled camera smoothing and collectible bobbing under reduced motion.

## Known limitations before deployment

- Local Chromium automation and visual capture are available. Real-device,
  cross-browser, console, and screen-reader passes must still be completed on
  the PR deployment preview.
- `npm audit --omit=dev` still reports two high-severity findings through Next.js's bundled Sharp/image build path. This deployment is a static export, has no Next server, Server Actions, or image-optimisation endpoint, and project images use static responsive files. Next was patched within the 15.5 line; removing the remaining transitive alert currently requires a breaking Next 16 upgrade and is deferred to a dedicated framework migration.
- Phaser is intentionally large but isolated: it does not affect the initial recruiter-facing Portfolio or Game ready-state requests.

Production deployment remains out of scope until the preview matrix is signed off.
