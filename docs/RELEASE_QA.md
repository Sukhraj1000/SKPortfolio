# Orbital Engineering Journey and Chronicle Run release QA

This checklist separates reproducible automated evidence from checks that still
require a deployment preview, physical device, or real assistive technology.
The recruiter-facing Orbital Engineering Journey portfolio and optional
Chronicle Run game are validated as independent routes.

## Automated release gates

Install exact dependencies and all three browser engines once, then run the complete release gate:

```bash
npm ci
npm run qa:ui:install
npm run qa
```

`npm run qa` includes formatter, lint, strict types, unused/reference/workflow checks, production build/static/server validation, dependency audit, the complete Chromium suite, and focused Firefox/WebKit compatibility suites. Focused scripts remain available for diagnosis but are not substitutes for the aggregate gate.

The Chromium suite covers:

- The complete five-chapter portfolio, canonical evidence, stable anchors, CV
  flow, contact actions, no-JavaScript content, the dark-only palette, reduced
  motion, 320px layout, 200% text, keyboard operation, and coarse-pointer targets.
- Direct name/role Hero hierarchy, retired campaign wording, the grounded dispatch
  and arrival-bay scenes, a clean integer-scaled Profile operator berth, near-native
  stateful rail travel, authored Tymaura/Skaltek media windows, and correctly
  separated current-role versus personal AI evidence.
- Native mission, timeline, and toolkit disclosures; immediate accessible Game
  launch feedback; duplicate activation protection; and a static reduced-motion state.
- The server-rendered Chronicle training fallback, direct Game transition,
  orbital Game navigation and token continuity through the Phaser host, exactly
  five matching-input walkthrough steps, returning-player skip, and absence of
  game-world requests from the recruiter-facing Portfolio route.
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

The focused Firefox/WebKit contract independently covers static navigation, native disclosures, uniquely named controls, contact and CV fallbacks, portalled dark tokens, bidirectional live reduced motion, 320px/200% reflow, no-JavaScript operation, canonical metadata, and the unstarted Game shell. The timing-sensitive complete Phaser gameplay matrix remains Chromium-only.

Zero known vulnerabilities are required. Static validation confirms:

- `/index.html`, `/game/index.html`, `404.html`, `.htaccess`, `robots.txt`, and `sitemap.xml` are exported.
- Canonical/social metadata, existing metadata imagery, and recruiter-facing Person/project JSON-LD use `https://sukhrajkalon.info` and canonical facts.
- Portfolio chapters, the clean Profile operator berth, and the Chronicle
  five-action fallback, orbital token scope/navigation, and direct Portfolio
  return are present in server-rendered HTML.
- Local `href` and `src` references resolve to exported files.
- The Chronicle character sheet, world atlas, and inventory exist and remain
  within explicit transfer budgets.
- Neither the Portfolio nor the server-rendered Game fallback eagerly references a canvas or game-world artwork.
- Production-browser network evidence verifies Phaser, Chronicle scene code, the character sheet, and world atlas remain absent before explicit Game activation and appear only when the runtime starts. Static validation no longer classifies chunks by matching incidental copy.

## Continuous-integration merge gate

The tracked GitHub Actions workflows use `.nvmrc`, `npm ci`, npm download caching, immutable full-SHA action pins, read-only default permissions, branch/PR concurrency cancellation, explicit timeouts, one validated export artifact, failure-only diagnostics, dependency review, and job-scoped CodeQL upload permission. Weekly Dependabot updates cover npm and Actions, group only compatible non-major changes, and never auto-merge.

Confirm these contexts from the first green pull-request run, then require them on an up-to-date `main` branch:

- `Release assurance / Quality / export`
- `Release assurance / Chromium UI`
- `Release assurance / Compatibility UI / firefox`
- `Release assurance / Compatibility UI / webkit`
- `Release assurance / Dependency review`
- `CodeQL / CodeQL / JavaScript-TypeScript`

Also block force pushes/deletion and require review conversations to be resolved. Repository settings are verified separately because workflow files cannot enforce their own branch protection.

## Current production bundle

The static release validator sums each modern initial script after gzip and
excludes the legacy `nomodule` polyfill. It enforces a 200 kB budget per route:

| Route                             | Initial scripts (gzip) | Budget |
| --------------------------------- | ---------------------: | -----: |
| Portfolio `/`                     |               169.0 kB | 200 kB |
| Chronicle training route `/game/` |               154.9 kB | 200 kB |

Phaser remains a separate lazy chunk and does not affect either initial-script
measurement. The world atlas is approximately 466 kB and the character sheet
approximately 56 kB; both are requested only after Game mode activation.

## Local responsive and accessibility matrix

Automated Chromium checks cover the complete matrix, with the shared static compatibility contract repeated in Firefox and WebKit. Local screenshots are
review artifacts under the ignored `test-results/` or `/tmp` directories and
must not be committed.

| Surface                  | 320px | 390px | 768px | 1440px | 200% text                      | Dark-only | Reduced motion |
| ------------------------ | ----- | ----- | ----- | ------ | ------------------------------ | --------- | -------------- |
| Portfolio reading flow   | Pass  | Pass  | Pass  | Pass   | Pass                           | Pass      | Pass           |
| Chronicle training shell | Pass  | Pass  | Pass  | Pass   | Pass                           | Pass      | Pass           |
| Runtime HUD and controls | Pass  | Pass  | Pass  | Pass   | Pass                           | Pass      | Pass           |
| Unlock card              | Pass  | Pass  | Pass  | Pass   | Pass                           | Pass      | Pass           |
| Story Log                | Pass  | Pass  | Pass  | Pass   | Pass                           | Pass      | Pass           |
| Completion recap         | —     | —     | —     | Pass   | Shared responsive dialog rules | Pass      | Pass           |

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
- [ ] Scroll and use chapter links in both directions on desktop; confirm the
      near-native rail operator walks between rows, settles into chapter-specific
      inspection/terminal poses without obscuring labels, and updates instantly to a
      static pose when reduced motion is enabled live.
- [ ] Confirm the Hero dispatch station reads as the route entry and the Contact
      arrival bay as the conclusion with and without JavaScript; neither scene should
      place the pixel character inside circular orbital graphics. At desktop and
      compact widths, verify the Profile operator is crisp and grounded inside its
      angular berth with clear space from the start label, route, and equipment.
- [ ] Inspect Tymaura and Skaltek media at 320px, 390px, tablet, desktop, and 200%
      text; confirm both are integrated into distinct mission windows without crop,
      distortion, HUD collision, or horizontal overflow.
- [ ] Expand project mission records, all Experience timeline records, and every
      Skills toolkit using pointer and keyboard. Confirm labels, focus, announced
      state, complete canonical evidence, and reduced-motion behavior remain clear.
- [ ] Expand the current Software Engineer role and AI inventory; confirm Jinja,
      agentic development, and multi-agent systems remain in current-role evidence,
      while RAG, MCP, loop/graph engineering, and agent evaluations appear only in
      personal Skills.
- [ ] Activate Game on a cold route; confirm “Opening Chronicle Run” appears
      immediately, repeated activation is guarded, reduced motion is static, and the
      existing five-step training shell follows without Portfolio-side Phaser or
      world-asset preloading.

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
      Confirm the Game header, surfaces, borders, focus, controls, and world palette
      continue the portfolio's near-black/cyan/lime orbital system rather than the
      older blue-grey presentation.
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
      Chronicle character sheet, or the industrial world atlas; those requests may
      begin only after the visitor activates Game mode or opens `/game/` directly.
      The neutral Portfolio operator sheet may load on `/`.
- [ ] Inspect the console throughout training, active, paused, unlock, Story Log,
      completion, timing, replay, refresh, and exit flows; no uncaught errors are
      acceptable.
- [ ] Confirm private CV files, environment files, credentials, certificates,
      local design studies, traces, screenshots, and temporary artifacts are absent
      from the release archive.

## Known release constraints

- Physical-device, deployment-preview, and representative VoiceOver/NVDA checks remain manual approval gates even when automated Chromium/Firefox/WebKit coverage passes.
- Phaser is intentionally substantial but isolated behind Game mode activation.
  It must remain absent from the initial recruiter-facing Portfolio request.

Production deployment remains out of scope until the preview matrix is signed
off.
