# House Number Generator Demo

A browser-based demo for the
[`@richardmcquiston01/house-number-generator`](https://www.npmjs.com/package/@richardmcquiston01/house-number-generator)
NPM package. Configure a house-number sign, preview it assembled, and download
laser-cutter-ready SVG and DXF cut files — no code required.

Built with Vite, React 18, TypeScript (strict), and Tailwind CSS. Deployed as a
static site on [Vercel](https://vercel.com).

## Features

- **Two sign styles** — numbers only, or a name plus numbers.
- **Configurable layout** — square, rectangle, or round backer; dimensions,
  margin, and units (inches or millimeters).
- **Bundled fonts** — pick from DejaVu and Liberation families; no font upload
  needed.
- **Assembly options** — hardware (two screw holes per glyph, so pieces can't
  spin, sized for common M4/SAE hardware) or adhesive (no holes).
- **File grouping** — one file per glyph, or one combined file per number/name
  group. The backer plate is always its own file.
- **Every format, every time** — SVG and DXF cut files, plus a multi-layer SVG
  with the backer, numbers, and name on separate Inkscape-compatible layers
  (black/red/blue) for per-layer laser operations.
- **Downloads** — preview and download files individually, or all at once as a
  ZIP.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (ships with Node.js)

### Installation

```bash
git clone https://github.com/RichardMcQuiston01/house-number-generator-demo.git
cd house-number-generator-demo
npm install
npm run dev
```

Then open <http://localhost:5173>.

### Scripts

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                     |
| `npm run build`     | Type-check and build to `dist/`               |
| `npm run preview`   | Serve the production build locally            |
| `npm run typecheck` | Type-check without emitting                   |
| `npm run lint`      | Lint with ESLint (`lint:fix` to auto-fix)     |
| `npm run format`    | Format with Prettier (`format:check` to test) |

## Usage

1. Choose a sign style: **Numbers only** or **Name + numbers**.
2. Enter the house number (and name, if applicable) and pick fonts.
3. Set the shape, dimensions, margin, unit, and assembly type.
4. Choose how cut files are grouped.
5. Click **Generate Sign** to see the assembled preview and download the files,
   organized into tabs by piece.

## Project Structure

```text
src/
├── components/
│   ├── configurator/   # Sign configuration form
│   ├── preview/        # Assembled preview and file gallery
│   └── layout/         # Header, hero, footer, donate card
├── lib/                # Generation, hole placement, grouping, analytics
├── App.tsx
└── main.tsx
public/
├── fonts/              # Bundled fonts + THIRD-PARTY-LICENSES.md
└── donate.svg
```

## Configuration

### Google Analytics (optional)

GA4 is off by default. To enable it, set `VITE_GA_MEASUREMENT_ID` to your
measurement ID (`G-XXXXXXXXXX`):

- **Vercel:** Project Settings → Environment Variables, then redeploy.
- **Locally:** copy `.env.example` to `.env.local` and fill it in.

When unset, `src/lib/analytics.ts` does nothing. It never loads outside a
production build, so local traffic is never counted. The module depends only on
that env var, so it can be copied into any other Vite project and initialized
with `initGoogleAnalytics()`.

## Deployment

The repo includes a `vercel.json` (`npm run build` → `dist/`). Import the
repository into Vercel and it deploys as a static site with no further setup.
CI (`.github/workflows/ci.yml`) runs typecheck, lint, and build on every push
and pull request to `main` and `dev`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

Licensed under the [Apache License 2.0](./LICENSE). Bundled fonts carry their
own licenses — see
[`public/fonts/THIRD-PARTY-LICENSES.md`](./public/fonts/THIRD-PARTY-LICENSES.md).

© 2026 Richard McQuiston. All rights reserved.

## Buy Me a Coffee

If this app, code, or repository has helped you or someone you know, please consider donating. I appreciate any help to offset the costs of development and/or AI Credits.

[**Donate via Stripe**](https://donate.stripe.com/00w5kD3Gj1Xo9v7gVOcs800), or scan:

[![Donate via Stripe](./donate.svg)](https://donate.stripe.com/00w5kD3Gj1Xo9v7gVOcs800)
