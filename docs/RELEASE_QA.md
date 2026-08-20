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
npm audit
```

`npm run qa:ui` covers:

- The complete five-chapter portfolio, canonical evidence, stable anchors, CV
  flow, contact actions, no-JavaScript content, the dark-only palette, reduced
  motion, 320px layout, 200% text, keyboard operation, and coarse-pointer targets.
- Direct name/role Hero hierarchy, retired campaign wording, the opening checkpoint
  and concluding door, chapter-aware rail travel, aligned featured-project media,
  and current-role AI/agentic engineering evidence.
- The server-rendered Chronicle training fallback, direct Game transition,
  exactly five matching-input walkthrough steps, returning-player skip, and
  absence of game-world requests from the recruiter-facing Portfolio route.
- Auto-run, forgiving buffered jump, dash, fast-drop, safe one-way optional
  routes, momentum, hazards, checkpoints, quick recovery, and chronological
  chapters, including a measured reachability margin for every upper entrance.
- Nine larger animated canonical story pickups, optional flow rewards,
  non-blocking unlock delivery, within-run deduplication, local persistence,
  fresh `0/9` story state after Restart/Replay, empty/partial Story Log states,
  completion, elapsed time, personal best, recap, high score, and replay.
- Focus containment and return, explicit resume behavior, keyboard and touch
  parity through the walkthrough and run, Restart readiness, interactive-element
  key isolation, visibility/timer pause, safe Escape exit, the fixed dark shell,
  live reduced-motion settling, 320px/200% reflow, and unlock/control/player
  non-overlap.
- A complete finite run through Present Day using public Game activation and
  walkthrough/skip controls. Tests do not use query parameters, debug APIs, or
  production gameplay bypasses.

`npm run qa` runs strict ESLint, TypeScript, a production static export, and
`scripts/validate-static-export.mjs`. `npm audit` must report zero known
vulnerabilities. Static validation confirms:

- `/index.html`, `/game/index.html`, `404.html`, `.htaccess`, and `robots.txt`
  are exported.
- Portfolio chapters and the Chronicle five-action fallback and direct
  Portfolio return are present in server-rendered HTML.
- Local `href` and `src` references resolve to exported files.
- The Chronicle character sheet, world atlas, and inventory exist and remain
  within explicit transfer budgets.
- Neither the Portfolio nor the server-rendered Game fallback eagerly references
  a canvas, Phaser chunk, game-world artwork, or Chronicle scene code.
- A separate lazy Phaser chunk exists and loads only after Game mode activation;
  it remains absent from the initial recruiter-facing route.

## Current production bundle

The static release validator sums each modern initial script after gzip and
excludes the legacy `nomodule` polyfill. It enforces a 200 kB budget per route:

| Route | Initial scripts (gzip) | Budget |
| --- | ---: | ---: |
| Portfolio `/` | 169.3 kB | 200 kB |
| Chronicle training route `/game/` | 170.3 kB | 200 kB |

Phaser remains a separate lazy chunk and does not affect either initial-script
measurement. The world atlas is approximately 466 kB and the character sheet
approximately 56 kB; both are requested only after Game mode activation.

## Local responsive and accessibility matrix

Automated Chromium checks cover the following dimensions. Local screenshots are
review artifacts under the ignored `test-results/` or `/tmp` directories and
must not be committed.

| Surface | 320px | 390px | 768px | 1440px | 200% text | Dark-only | Reduced motion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Portfolio reading flow | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Chronicle training shell | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Runtime HUD and controls | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Unlock card | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Story Log | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Completion recap | — | — | — | Pass | Shared responsive dialog rules | Pass | Pass |

The matrix demonstrates DOM reflow, semantics, and browser behavior. It is not a
substitute for the real-device and screen-reader checks below.

## Manual portfolio and gameplay review on deployment preview

Complete every unchecked item before production approval and record the device,
browser, preview URL, reviewer, and result.

### Portfolio presentation

- [ ] Confirm the opening viewport leads with Sukhraj Kalon, Software Engineer,
  and direct engineering positioning; no visible legacy campaign wording or
  employer-qualified “at Northrop Grumman” title remains, while employer evidence
  is still present in Experience.
- [ ] Scroll and use chapter links in both directions on desktop; confirm the rail
  operator settles beside the active section, jumps down/up only as a decorative
  cue, and updates instantly when reduced motion is enabled live.
- [ ] Confirm the Hero scene reads as the route entry and the Contact door as the
  conclusion with and without JavaScript.
- [ ] Inspect Tymaura and Skaltek media at 320px, 390px, tablet, desktop, and 200%
  text; confirm both are centered and intentionally scaled without crop,
  distortion, HUD collision, or horizontal overflow.
- [ ] Expand the current Software Engineer role and AI inventory; confirm Jinja,
  agentic development, multi-agent systems, RAG, MCP, loop/graph engineering,
  and agent evaluations are concise and consistent with the existing secure
  full-stack and cloud evidence.

### Desktop keyboard

- [ ] Enter through the Portfolio Game control and complete Jump, Dash, safe
  airborne Fast Drop, Pause/Resume, and Story Log as the five displayed actions;
  confirm unrelated inputs do not advance a step and normal play starts after
  step five without an intermediate deployment page.
- [ ] Complete a run and confirm auto-run, Space/Up jump, Shift/D dash, S/Down
  fast-drop, P pause, L Story Log, R restart, M sound, and Escape exit all match
  their visible labels.
- [ ] During the Jump tutorial step, focus a different HUD/touch button and the
  Portfolio return link; confirm gameplay keys do not advance the walkthrough,
  then refocus the stage and confirm the matching input does.
- [ ] Inspect the main route floor in the dark presentation; confirm it reads as
  one solid industrial deck with a clear top edge and long structural spans rather than a
  row of square atlas blocks.
- [ ] Take every optional upper-route entrance at least once; confirm each jump
  has forgiving clearance, lower routes remain unobstructed, continuous upper
  deck beams align with collision surfaces, and harder lines reward score or
  momentum without becoming mandatory.
- [ ] Hit a hazard and fall from an upper route; confirm recovery is quick, uses
  the latest checkpoint, and retains recovered story records.
- [ ] Recover representative Education, Experience, and Project cards; confirm
  the larger halo/pulse reads clearly before collision, catch feedback is brief,
  and title, organisation/project, period/status, summary, and technologies
  match the recruiter-facing portfolio.
- [ ] Keep each unlock visible through the next route segment and confirm it does
  not hide the player, next hazard, critical HUD, or controls.
- [ ] Finish Present Day, review score, elapsed time, personal best and records,
  open the Story Log from the recap, then choose Replay; confirm position, score,
  time, cards, HUD records, Story Log records, and stored record IDs reset to
  `0/9`, while tutorial completion, completed status, high score, and best time
  remain, and the next pickup presents normal unlock feedback.

### Mobile and touch

- [ ] Repeat the route on a physical phone near 320–390 CSS pixels using only
  labelled Jump, Dash, and Drop press/release controls.
- [ ] Confirm all touch targets are at least 44px, the page does not move during
  gameplay gestures, orientation changes do not lose progress, and unlock cards
  remain outside the active lane and controls.
- [ ] Confirm the Story Log and recap scroll internally, actions remain reachable,
  and returning to gameplay restores focus and requires explicit Resume.

### Dark presentation and motion

- [ ] Start with an operating-system light preference and a stale saved light
  preference; confirm Portfolio, training, active play, unlock cards, Story Log,
  and recap remain dark and expose no theme switch without restart or progress loss.
- [ ] Start with reduced motion enabled, then toggle it live. Confirm camera
  easing, parallax differentiation, pickup bob/pulse, character angle/afterimage,
  particles, flashes, shakes, and spatial UI motion settle while route physics,
  controls, score, time, records, and completion stay equivalent.
- [ ] Background and restore the tab on desktop and mobile; confirm movement,
  scoring, hazards, and input stop until explicit Resume.

## Assistive-technology review

- [ ] Complete the Portfolio reading flow with current VoiceOver/Safari and
  NVDA/Firefox or NVDA/Chrome.
- [ ] On `/game/`, verify the five-step training premise, ordinal progress,
  current input, returning-player skip, and direct Portfolio return are
  understandable before normal movement starts.
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
- [ ] Inspect network requests: the Portfolio must not request Phaser, the
  character sheet, or the industrial world atlas; those requests may begin only
  after the visitor activates Game mode or opens `/game/` directly.
- [ ] Inspect the console throughout training, active, paused, unlock, Story Log,
  completion, timing, replay, refresh, and exit flows; no uncaught errors are
  acceptable.
- [ ] Confirm private CV files, environment files, credentials, certificates,
  local design studies, traces, screenshots, and temporary artifacts are absent
  from the release archive.

## Known release constraints

- Real-device, cross-browser, deployment-preview, and VoiceOver/NVDA checks
  remain manual approval gates even when local automation passes.
- Phaser is intentionally substantial but isolated behind Game mode activation.
  It must remain absent from the initial recruiter-facing Portfolio request.

Production deployment remains out of scope until the preview matrix is signed
off.
