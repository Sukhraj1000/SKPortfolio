# SKPortfolio

Sukhraj Kalon's software engineering portfolio, presented as a dark five-chapter Orbital Engineering Journey. Professional evidence remains server-rendered and directly readable; grounded pixel scenes, authored project windows, progressive technical records, and purposeful character motion provide the visual layer around it.

Production site: [sukhrajkalon.info](https://sukhrajkalon.info)

## Routes

- `/` — recruiter-facing portfolio: Profile, Projects, Experience, Skills, and Contact.
- `/game/` — optional **Chronicle Run** auto-runner through five chronological professional chapters. Selecting Game immediately displays an accessible dark launch state before transitioning into the paused five-step training shell. Phaser and world assets remain isolated from the Portfolio route and load only after explicit Game activation.

No portfolio evidence is gated behind the game.

## Technology

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- Radix Dialog primitives
- Playwright production-export coverage in Chromium, Firefox, and WebKit
- Phaser 3, isolated to the optional game runtime
- Static HTML export for deployment without a Node.js server

## Local development

Requirements:

- Node.js 20.9 or newer (`.nvmrc` selects Node 20)
- npm

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To inspect a completed production export instead of the development server:

```bash
npm run build
npm start
```

`npm start` runs the repository's dependency-free static server at `http://127.0.0.1:4173` by default. Set `HOST`, `PORT`, or `STATIC_ROOT` when a different local binding is needed.

## Quality gates

Install Playwright's browser binaries once on a new machine:

```bash
npm run qa:ui:install
```

Focused commands remain available during development:

```bash
npm run format:check      # deterministic formatting baseline
npm run lint              # ESLint, warnings treated as failures
npm run typecheck         # strict TypeScript without emitting files
npm run qa:unused         # unused file/export/dependency analysis
npm run qa:references     # asset, retired-source, and Phaser-palette boundaries
npm run qa:workflows      # CI permissions, immutable pins, and command parity
npm run qa:static         # exported HTML, references, metadata, and budgets
npm run qa:server         # static server routing/MIME/traversal contract
npm run qa:ui:chromium    # complete Portfolio and Chronicle browser matrix
npm run qa:ui:compat      # focused Firefox and WebKit compatibility contract
```

The complete local release gate is:

```bash
npm run qa
```

It runs formatting, lint, types, dead-reference checks, workflow validation, production build/static checks, dependency audit, the full Chromium suite, and focused Firefox/WebKit suites. The release checklist and remaining real-device checks are documented in [`docs/RELEASE_QA.md`](docs/RELEASE_QA.md).

## Continuous integration

GitHub Actions runs the same release contract on pull requests and `main`, using the lockfile and `.nvmrc`. Workflows use read-only permissions by default, immutable full-SHA action pins, npm download caching, `npm ci`, branch/PR concurrency cancellation, finite timeouts, one shared validated `out/` artifact, failure-only Playwright diagnostics, dependency review, and CodeQL. Dependabot proposes grouped weekly non-major npm and Actions updates; no auto-merge or automatic major migration is configured.

After the first green run, protect `main` with these workflow/job checks:

- `Quality / export`
- `Chromium UI`
- `Compatibility UI / firefox`
- `Compatibility UI / webkit`
- `Dependency review`
- `CodeQL / JavaScript-TypeScript`
- `CodeQL` (GitHub code-scanning result)

Require branches to be current, block force pushes and deletion, and require review conversations to be resolved. Exact check contexts must be confirmed from the first real workflow run before enabling the rules.

## Architecture

- Canonical professional content—including the public contact address—lives in [`src/data/portfolio.ts`](src/data/portfolio.ts).
- Portfolio sections and the Contact/legal footer are server components. The progressively enhanced CV link is a valid static `mailto:` path before its client dialog loads.
- [`PortfolioProgress.tsx`](src/components/pixel-quest/PortfolioProgress.tsx) owns one semantic chapter observer shared by the Portfolio header and desktop rail; the Game route does not load that provider or Portfolio-only navigation code.
- [`PortfolioMotion.tsx`](src/components/pixel-quest/PortfolioMotion.tsx) progressively enhances visible-by-default content and responds to live reduced-motion changes in both directions.
- Orbital Engineering Journey composition styles remain under `pq-` selectors in [`src/app/pixel-quest.css`](src/app/pixel-quest.css). Equivalent document-level dark semantic tokens provide a safe baseline for portalled dialogs, sheets, overlays, and fallback pages without a theme provider or switch.
- Projects, Experience, and Skills use native semantic disclosures with record-specific accessible names. Concise summaries and essential actions remain visible before expansion, and detail content derives from canonical data.
- Portfolio code does not import Phaser, game scenes, game state, or world artwork.
- The Game navbar, static fallback, hydrated shell, and Phaser display palette inherit the orbital token family. Phaser samples its host once during dark-only scene construction and receives semantic signal colours; this changes presentation only, not gameplay.
- Chronicle records in [`chronicle-story.ts`](src/components/game/chronicle-story.ts) adapt facts from canonical portfolio data; the scene emits stable record IDs rather than copied professional text.
- Chronicle progress is versioned, validated, and merged locally. Recovered records survive refresh until Restart or Replay begins a fresh `0/9` story run; tutorial completion, completion status, high score, and best time remain stored, while malformed or legacy values fail open.

## Accessibility and motion

The portfolio supports keyboard navigation, visible focus, semantic headings and landmarks, uniquely named native disclosure controls, widths from 320 pixels, 200% text sizing, static email contact, no-JavaScript content, and bidirectional live `prefers-reduced-motion` changes. The opening Profile operator remains at crisp 1× or 2× integer scale inside a dedicated dispatch berth. The near-native rail character has traversal, arrival, idle, inspection, and terminal states in standard motion, but updates immediately to its stable chapter pose under reduced motion. Decorative sprites and showcase geometry are pointer-inert and excluded from the accessibility tree while project-image alternatives remain available.

Chronicle Run adds labelled keyboard and touch controls, an input-driven five-step walkthrough, forgiving reachable routes, pause-aware personal-best timing, non-blocking DOM unlock cards, a focus-contained Story Log, live reduced-motion updates, and a direct Portfolio exit. The server-rendered training fallback remains informative when JavaScript is unavailable. Existing local progress, sound, and return keys retain their original names for backward compatibility even though legacy campaign wording is absent from the rendered site.

Automated Chromium, Firefox, and WebKit checks supplement rather than replace physical keyboard/touch and representative VoiceOver/NVDA review.

## Static deployment

```bash
npm run qa
```

The export is written to `out/`. Hostinger-specific deployment notes are available in [`DEPLOY.md`](DEPLOY.md); `deploy.sh` performs the production audit and complete release preparation.

The export publishes canonical/social metadata, Person/project JSON-LD, `robots.txt`, and `sitemap.xml` for `https://sukhrajkalon.info`. Existing repository imagery is reused; there is no generated social-art pipeline.

Private CV files, environment files, credentials, certificates, and profile-reference material are excluded from version control. The public contact email is intentionally present in static HTML so the primary contact and CV-request paths work without JavaScript.

## Dependency policy

Compatible patch/minor updates are reviewed through Dependabot and the complete release gate. Major migrations remain explicit projects. Current deferred majors include ESLint 10, Lucide 1, Phaser 4, TypeScript 7, and the Node type declarations beyond the deployed Node 20 line.

## License

Source code and original project artwork are released under the [MIT License](LICENSE). Third-party fonts, marks, and portfolio media retain the rights described in [Asset licensing and attribution](ASSET-LICENSES.md). The MIT License does not grant trademark or endorsement rights.
