# Pixel Quest and Chronicle Run release QA

This checklist separates reproducible automated evidence from checks that still
require a deployment preview, physical device, or real assistive technology.
The recruiter-facing Pixel Quest portfolio and optional Chronicle Run game are
validated as independent routes.

## Automated release gates

Install dependencies and Chromium once, then run:

```bash
npm ci
npm run qa:ui:install
npm run qa:ui
npm run qa
```

`npm run qa:ui` covers:

- The complete five-chapter portfolio, canonical evidence, stable anchors, CV
  flow, contact actions, no-JavaScript content, themes, reduced motion, 320px
  layout, 200% text, keyboard operation, and coarse-pointer targets.
- The server-rendered Chronicle ready state, explicit Start boundary, saved
  progress summary, and absence of a canvas or game-world requests before Start.
- Auto-run, jump, dash, fast-drop, onboarding, safe and optional routes,
  momentum, hazards, checkpoints, quick recovery, and chronological chapters.
- Nine canonical story pickups, non-blocking unlock delivery, replay-safe
  deduplication, local persistence, empty/partial Story Log states, completion,
  recap, Story Log review, high score, and replay.
- Focus containment and return, explicit resume behavior, keyboard and touch
  parity, visibility pause, safe Escape exit, live theme changes, live
  reduced-motion changes, 320px/200% reflow, and unlock/control non-overlap.
- A complete finite run through Present Day using the public Start flow. Tests
  do not use query parameters, debug APIs, or production gameplay bypasses.

`npm run qa` runs strict ESLint, TypeScript, a production static export, and
`scripts/validate-static-export.mjs`. Static validation confirms:

- `/index.html`, `/game/index.html`, `404.html`, `.htaccess`, and `robots.txt`
  are exported.
- Portfolio chapters and the Chronicle premise, Start action, and direct
  Portfolio return are present in server-rendered HTML.
- Local `href` and `src` references resolve to exported files.
- The Chronicle character sheet, world atlas, and inventory exist and remain
  within explicit transfer budgets.
- Neither the Portfolio nor the Game ready state eagerly references a canvas,
  Phaser chunk, game-world artwork, or Chronicle scene code.
- A separate lazy Phaser chunk exists and is available only after Start.

## Current production bundle

Record these values from the final `npm run qa` output whenever dependencies or
route composition changes:

| Route | Route JS | First-load JS |
| --- | ---: | ---: |
| Portfolio `/` | 4.41 kB | 137 kB |
| Chronicle ready state `/game/` | 5.13 kB | 126 kB |

Phaser remains a separate lazy chunk and does not affect either initial route.
The world atlas is approximately 466 kB and the character sheet approximately
56 kB; both are requested only after Start.

## Local responsive and accessibility matrix

Automated Chromium checks cover the following dimensions. Local screenshots are
review artifacts under the ignored `test-results/` or `/tmp` directories and
must not be committed.

| Surface | 320px | 390px | 768px | 1440px | 200% text | Dark/light | Reduced motion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Portfolio reading flow | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Chronicle ready state | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Runtime HUD and controls | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Unlock card | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Story Log | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Completion recap | — | — | — | Pass | Shared responsive dialog rules | Pass | Pass |

The matrix demonstrates DOM reflow, semantics, and browser behavior. It is not a
substitute for the real-device and screen-reader checks below.

## Manual gameplay review on deployment preview

Complete every unchecked item before production approval and record the device,
browser, preview URL, reviewer, and result.

### Desktop keyboard

- [ ] Complete a fresh guided run and confirm auto-run, Space/Up jump, Shift/D
  dash, S/Down fast-drop, P pause, L Story Log, R restart, M sound, and Escape
  exit all match their visible labels.
- [ ] Take at least one safe route and one optional upper route; confirm the
  harder line rewards score or momentum without becoming mandatory.
- [ ] Hit a hazard and fall from an upper route; confirm recovery is quick, uses
  the latest checkpoint, and retains recovered story records.
- [ ] Recover representative Education, Experience, and Project cards; compare
  title, organisation/project, period/status, summary, and technologies with the
  recruiter-facing portfolio.
- [ ] Keep each unlock visible through the next route segment and confirm it does
  not hide the player, next hazard, critical HUD, or controls.
- [ ] Finish Present Day, review score and records, open the Story Log from the
  recap, replay, restart, refresh, and confirm durable records/completion/high
  score while transient score and position reset.

### Mobile and touch

- [ ] Repeat the route on a physical phone near 320–390 CSS pixels using only
  labelled Jump, Dash, and Drop press/release controls.
- [ ] Confirm all touch targets are at least 44px, the page does not move during
  gameplay gestures, orientation changes do not lose progress, and unlock cards
  remain outside the active lane and controls.
- [ ] Confirm the Story Log and recap scroll internally, actions remain reachable,
  and returning to gameplay restores focus and requires explicit Resume.

### Themes and motion

- [ ] Switch Day/Night during active play, during an unlock, and in the Story Log;
  confirm the world and DOM remain legible without restart or progress loss.
- [ ] Start with reduced motion enabled, then toggle it live. Confirm deployment
  travel, camera easing, parallax differentiation, flashes, shakes, and spatial
  UI motion stop while route timing, controls, score, records, and completion stay
  equivalent.
- [ ] Background and restore the tab on desktop and mobile; confirm movement,
  scoring, hazards, and input stop until explicit Resume.

## Assistive-technology review

- [ ] Complete the Portfolio reading flow with current VoiceOver/Safari and
  NVDA/Firefox or NVDA/Chrome.
- [ ] On `/game/`, verify the ready-state premise, duration, controls, Start, and
  direct Portfolio return are understandable before starting.
- [ ] Verify chapter/status changes and a recovered record's type and title are
  announced politely without repeated or competing announcements.
- [ ] Open an empty and partial Story Log, traverse all recovered/locked entries,
  verify focus remains contained, close with Escape and the close button, and
  confirm focus returns logically while gameplay remains paused.
- [ ] Verify completion recap actions and visible focus at 200% text and with a
  high-contrast user configuration.

## Deployment and repository checks

- [ ] Exercise direct `/`, `/game/`, and chapter-anchor refreshes on the actual
  static host, plus browser Back/Forward and remembered Portfolio return.
- [ ] Inspect network requests: Portfolio and pre-Start `/game/` must not request
  Phaser, the character sheet, or the industrial world atlas.
- [ ] Inspect the console throughout ready, active, paused, unlock, Story Log,
  completion, replay, refresh, and exit flows; no uncaught errors are acceptable.
- [ ] Confirm private CV files, environment files, credentials, certificates,
  local design studies, traces, screenshots, and temporary artifacts are absent
  from the release archive.

## Known release constraints

- Real-device, cross-browser, deployment-preview, and VoiceOver/NVDA checks
  remain manual approval gates even when local automation passes.
- `npm audit --omit=dev` reports two high-severity advisories through Next.js and
  its Sharp build dependency. This is a static export with no Next server,
  Server Actions, or image optimisation endpoint; the available automated fix
  requires a separate semver-major Next 16 migration.
- Phaser is intentionally substantial but isolated behind Start. It must remain
  absent from the initial recruiter-facing and Game ready-state requests.

Production deployment remains out of scope until the preview matrix is signed
off.
