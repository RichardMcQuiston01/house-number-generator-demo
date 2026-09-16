# House Number Generator Demo

## Overview

TypeScript-based demo Single Page Application (SPA) showcasing the features of the [`@richardmcquiston01/house-number-generator`](https://www.npmjs.com/package/@richardmcquiston01/house-number-generator) NPM package.

The package generates laser-cutter SVG/DXF cut files for a physical house-number sign — one file per digit, per name letter, and for the sign's backer plate — from a config: sign style (numbers only, or name + numbers), shape, dimensions, margin, unit, fonts, and assembly type (hardware with screws, or adhesive). This demo lets you configure a sign in the browser, see an assembled preview, and download the generated cut files, without writing any code.

Built with Vite, React, TypeScript, and Tailwind CSS; deployed as a static site on [Vercel](https://vercel.com).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- npm (ships with Node.js)

### Installation

```bash
git clone https://github.com/RichardMcQuiston01/house-number-generator-demo.git
cd house-number-generator-demo
npm install
```

### Usage

```bash
npm run dev        # start the Vite dev server (http://localhost:5173)
npm run build       # type-check and build a production bundle to dist/
npm run preview     # serve the production build locally
npm run typecheck   # type-check without emitting
npm run lint         # lint with ESLint
npm run lint:fix     # lint and auto-fix
npm run format       # format with Prettier
npm run format:check # check formatting without writing
```

### Examples

1. Open the app and choose a sign style: **Numbers only**, or **Name + numbers**.
2. Enter the house number (and name, if applicable).
3. Pick a font for the number text (and name text, if applicable) from the bundled font dropdown (see `public/fonts/THIRD-PARTY-LICENSES.md` for attribution).
4. Choose the sign shape, dimensions, margin, unit, and assembly type (hardware with a screw size, or adhesive).
5. Choose the output format (SVG/DXF/both), cut file grouping (one file per glyph, or one combined file per number/name group), and optionally include a multi-layer SVG (backer, numbers, and name each on their own colored layer).
6. Click **Generate Sign** to see an assembled preview and download the cut files individually or all together as a ZIP.

## Buy Me a Coffee

If this app, code, or repository has helped you or someone you know, please consider donating. I appreciate any help to offset the costs of development and/or AI Credits.

[**Donate via Stripe**](https://donate.stripe.com/00w5kD3Gj1Xo9v7gVOcs800), or scan:

[![Donate via Stripe](./donate.svg)](https://donate.stripe.com/00w5kD3Gj1Xo9v7gVOcs800)

## License

Apache 2

## Copyright

(c)2026 Richard McQuiston.  All rights reserved.
