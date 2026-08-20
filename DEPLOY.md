# Static deployment to Hostinger

SKPortfolio uses Next.js static export. Production requires only the generated files in `out/`; it does not require a Node.js server.

## Prerequisites

- Node.js 20.9 or newer
- npm
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
3. runs lint, TypeScript, the production build, and static-export validation;
4. verifies required Hostinger files; and
5. reports the number of generated files.

Browser tests are intentionally separate because they start a local development server:

```bash
npm run qa:ui:install # first run only
npm run qa:ui
```

## Upload

Upload the **contents** of `out/` to Hostinger's `public_html` directory using File Manager, SFTP, or another approved transfer method. Do not upload repository source, `.env` files, credentials, private CV files, or package metadata.

`public/.htaccess` enforces HTTPS, disables directory listing, provides the exported 404 page, sets response security headers, and configures static-asset caching.

## Preview checks

Before replacing the production site, verify the deployment preview against [`docs/RELEASE_QA.md`](docs/RELEASE_QA.md), including:

- direct `/` and `/game/` refreshes;
- dark/light theme persistence;
- keyboard and reduced-motion behavior;
- representative mobile and desktop layouts;
- external project/contact links; and
- the optional game's direct five-step training and Exit flow.

## Rollback

Keep the previous known-good `out/` archive until preview checks pass. If deployment validation fails, restore that archive rather than uploading a partial build.
