# SKPortfolio

Sukhraj Kalon's software engineering portfolio, presented as a five-chapter Pixel Quest journey. The professional evidence remains server-rendered and directly readable; pixel scenes and finite motion provide an optional visual layer around it.

Production site: [sukhrajkalon.info](https://sukhrajkalon.info)

## Routes

- `/` — recruiter-facing portfolio: Profile, Projects, Experience, Skills, and Contact.
- `/game/` — optional **Chronicle Run** auto-runner through five chronological professional chapters. Selecting Game transitions directly into a paused five-step training shell; Phaser and world assets remain isolated from the Portfolio route and load only after Game mode activation.

No portfolio evidence is gated behind the game.

## Technology

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- Radix Dialog primitives
- Playwright browser coverage
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

## Quality gates

```bash
npm run lint       # ESLint, with warnings treated as failures
npm run typecheck  # TypeScript without emitting files
npm run qa:ui      # Playwright browser suite
npm run qa         # lint, types, production build, and static-export checks
```

Install Playwright's Chromium binary once on a new machine:

```bash
npm run qa:ui:install
```

The release checklist and remaining real-device checks are documented in [`docs/RELEASE_QA.md`](docs/RELEASE_QA.md).

## Architecture

- Canonical professional content lives in [`src/data/portfolio.ts`](src/data/portfolio.ts).
- Portfolio sections are predominantly server components.
- [`PortfolioProgress.tsx`](src/components/pixel-quest/PortfolioProgress.tsx) owns one semantic chapter observer shared by the header and desktop rail; the decorative rail operator follows that same active chapter without creating a second scroll system.
- [`PortfolioMotion.tsx`](src/components/pixel-quest/PortfolioMotion.tsx) progressively enhances visible-by-default content without an animation dependency or permanent frame loop.
- Pixel Quest composition styles are scoped under `pq-` selectors in [`src/app/pixel-quest.css`](src/app/pixel-quest.css). The server-rendered document uses one dark palette without a client-side theme provider or switch.
- Portfolio code does not import Phaser, game scenes, game state, or world artwork.
- Chronicle records in [`chronicle-story.ts`](src/components/game/chronicle-story.ts) adapt facts from the canonical portfolio data; the Phaser scene emits stable record IDs rather than copied professional text.
- Chronicle progress is versioned, validated, and merged locally. Recovered records survive refresh until Restart or Replay begins a fresh `0/9` story run; tutorial completion, completion status, high score, and best time remain stored, while malformed or legacy values fail open.

## Accessibility and motion

The portfolio uses one high-contrast dark presentation and supports keyboard navigation, visible focus, semantic headings and landmarks, native disclosure controls, widths from 320 pixels, 200% text sizing, no-JavaScript content, and live `prefers-reduced-motion` changes. Decorative sprites are pointer-inert and excluded from the accessibility tree.

Chronicle Run adds labelled keyboard and touch controls, an input-driven five-step walkthrough, forgiving reachable routes, larger animated rewards, pause-aware personal-best timing, non-blocking DOM unlock cards, a focus-contained Story Log, live reduced-motion updates, and a direct Portfolio exit. The server-rendered training fallback remains informative when JavaScript is unavailable. Existing local progress, sound, and return keys retain their original names for backward compatibility even though legacy campaign wording is absent from the rendered site.

Automated accessibility checks supplement rather than replace real assistive-technology review.

## Static deployment

```bash
npm run qa
```

The export is written to `out/`. Hostinger-specific deployment notes are available in [`DEPLOY.md`](DEPLOY.md); `deploy.sh` performs the production audit and build preparation.

Private CV files, environment files, credentials, certificates, and profile-reference material are excluded from version control. The contact address is assembled in the browser to avoid placing the complete value in server-rendered HTML; this is not a privacy boundary.

## License

Source code and original project artwork are released under the [MIT License](LICENSE). Third-party fonts, marks, and portfolio media retain the rights described in [Asset licensing and attribution](ASSET-LICENSES.md). The MIT License does not grant trademark or endorsement rights.
