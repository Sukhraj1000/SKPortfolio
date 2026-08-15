# SKPortfolio

Sukhraj Kalon's software engineering portfolio, presented as a five-chapter Pixel Quest journey. The professional evidence remains server-rendered and directly readable; pixel scenes and finite motion provide an optional visual layer around it.

Production site: [sukhrajkalon.info](https://sukhrajkalon.info)

## Routes

- `/` — recruiter-facing portfolio: Profile, Projects, Experience, Skills, and Contact.
- `/game/` — separate optional Phaser experience. The game runtime and world assets stay lazy-loaded until the visitor explicitly selects **Start deployment**.

No portfolio evidence is gated behind the game.

## Technology

- Next.js 15 App Router and React 19
- TypeScript and Tailwind CSS 4
- Radix Dialog primitives and `next-themes`
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
- [`PortfolioProgress.tsx`](src/components/pixel-quest/PortfolioProgress.tsx) owns one semantic chapter observer shared by the header and desktop rail.
- [`PortfolioMotion.tsx`](src/components/pixel-quest/PortfolioMotion.tsx) progressively enhances visible-by-default content without an animation dependency or permanent frame loop.
- Pixel Quest composition styles are scoped under `pq-` selectors in [`src/app/pixel-quest.css`](src/app/pixel-quest.css).
- Portfolio code does not import Phaser, game scenes, game state, or world artwork.

The selected standalone design is retained for comparison at [`design-reference/pixel-quest/index.html`](design-reference/pixel-quest/index.html). It is not linked from or copied into the production export.

## Accessibility and motion

The portfolio supports keyboard navigation, visible focus, semantic headings and landmarks, native disclosure controls, dark and light themes, widths from 320 pixels, 200% text sizing, no-JavaScript content, and `prefers-reduced-motion`. Decorative sprites are pointer-inert and excluded from the accessibility tree.

Automated accessibility checks supplement rather than replace real assistive-technology review.

## Static deployment

```bash
npm run qa
```

The export is written to `out/`. Hostinger-specific deployment notes are available in [`DEPLOY.md`](DEPLOY.md); `deploy.sh` performs the production audit and build preparation.

Private CV files, environment files, credentials, certificates, and profile-reference material are excluded from version control. The contact address is assembled in the browser to avoid placing the complete value in server-rendered HTML; this is not a privacy boundary.

## License

Released under the [MIT License](LICENSE).
