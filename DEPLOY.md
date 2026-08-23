# Static deployment to Hostinger

SKPortfolio uses Next.js static export. Production requires only the generated files in `out/`; it does not require a Node.js application server.

## Prerequisites

- Node.js 20.9 or newer (`.nvmrc` selects Node 20)
- npm
- Playwright Chromium, Firefox, and WebKit binaries (`npm run qa:ui:install` once)
- Hostinger hosting with Apache support for `public/.htaccess`

Install exact dependencies from the lockfile:

```bash
npm ci
```

## Build and verify

Run:

```bash
./deploy.sh
```

The script:

1. blocks high or critical production dependency advisories;
2. removes previous `.next/` and `out/` output;
3. runs the complete `npm run qa` release gate, including production-export Chromium, Firefox, and WebKit assurance;
4. verifies `.htaccess`, `robots.txt`, `sitemap.xml`, route HTML, and required assets in `out/`; and
5. reports the number of generated files.

For focused iteration, the individual scripts are documented in [`README.md`](README.md). They do not replace the complete release gate.

To inspect the generated release through the same dependency-free static server used by Playwright:

```bash
npm run build
npm start
```

The default local address is `http://127.0.0.1:4173`.

## Upload

Upload the **contents** of `out/` to Hostinger's `public_html` directory using File Manager, SFTP, or another approved transfer method. Do not upload repository source, `.env` files, credentials, private CV files, browser diagnostics, or package metadata.

`out/.htaccess` enforces HTTPS, disables directory listing, provides the exported 404 page, sets response security headers, and configures static-asset caching.

## Preview checks

Before replacing production, verify the deployment preview against [`docs/RELEASE_QA.md`](docs/RELEASE_QA.md), including:

- direct `/`, `/game/`, `/robots.txt`, and `/sitemap.xml` refreshes;
- canonical URLs and existing social metadata assets;
- the dark orbital palette in normal and portalled UI;
- keyboard, touch, live reduced-motion, no-JavaScript, 320px, and 200% text behavior;
- external project/contact links and the static email/CV fallback;
- the optional Game's direct five-step training and Exit flow; and
- network confirmation that Phaser and world assets remain behind explicit Game activation.

Automated cross-browser checks remain complementary to physical touch/keyboard and representative VoiceOver/NVDA approval.

## GitHub merge protection

The tracked workflows use immutable action pins, least-privilege permissions, deterministic installation, bounded execution, production-export reuse, dependency review, and CodeQL. Configure `main` with the required checks listed in [`README.md`](README.md), require branches to be current, resolve review conversations, and block force pushes/deletion. Confirm exact check contexts from a green pull-request run before enabling the rule.

## Rollback

Keep the previous known-good `out/` archive until preview and manual accessibility checks pass. If deployment validation fails, restore that archive rather than uploading a partial build. Workflow changes do not deploy automatically and can be reverted independently while the local `npm run qa` gate remains available.
