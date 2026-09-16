# CHANGELOG

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Cut file grouping choice: **Individual** (one SVG/DXF per glyph, the
  original behavior) or **Grouped** (one combined SVG/DXF for all number
  glyphs, and one for all name glyphs) — `src/lib/groupedFiles.ts`. The
  backer plate is always its own file either way.
- A multi-layer combined SVG (`src/lib/multiLayerSvg.ts`), generated
  alongside the cut files on every run: one SVG with the backer, numbers,
  and name each on their own Inkscape-compatible layer
  (`inkscape:groupmode="layer"`) with a distinct stroke color (backer
  black, numbers red, name blue), for laser workflows that assign an
  operation per layer/color rather than per file.
- The file gallery is now tabbed by piece category (House number / Name /
  Backer plate / Multi-layer SVG) instead of one long stacked list.

### Changed

- Both SVG and DXF cut files are always generated (the "Output format"
  selector was removed) and the multi-layer combined SVG is always
  included (its checkbox was removed) — both were more friction than
  choice worth keeping.
- The "Generate Sign" button moved from the bottom of the form to a
  header row at the top, inline with the file gallery's "Download All
  (ZIP)" button.
- Font selection is now a dropdown of bundled fonts (`src/lib/fonts.ts`,
  served from `public/fonts/`) instead of uploading a `.ttf`/`.otf` file —
  no font file required to try the demo. See
  `public/fonts/THIRD-PARTY-LICENSES.md` for attribution (DejaVu, Bitstream
  Vera License; Liberation, SIL OFL 1.1).
- The Buy Me a Coffee donation block moved from the page footer to a
  dismissible floating card fixed to the bottom-right corner
  (`src/components/layout/DonateCard.tsx`); the dismissal persists via
  `localStorage`.

## [0.1.0] - 2026-09-16

### Added

- Project scaffolding: Vite + React 18 + strict TypeScript + Tailwind CSS,
  ESLint (typescript-eslint + Prettier) matching the Google TypeScript
  Style Guide, and a Vercel static-site deployment config.
- `src/lib/generator.ts` and `src/lib/useSignGenerator.ts`: a thin wrapper
  around `@richardmcquiston01/house-number-generator` that maps UI form
  state to a `SignConfig`, registers uploaded font files, runs the
  validate → layout → generate pipeline, and exposes it as a single React
  hook shared by the form and preview panel.
- `src/lib/renderSignSvg.ts`: renders a computed `SignLayout` into one
  assembled preview SVG (backer, number/name glyph cuts, mounting holes,
  engraving marks), separate from the package's own per-piece cut files.
- Interactive sign configurator (`src/components/configurator/`): style,
  house number, name, per-slot font upload, shape, dimensions, margin,
  unit, assembly type/screw size, and output format, with validation
  errors surfaced from the package.
- Results panel (`src/components/preview/`): assembled sign preview, a
  file gallery grouped by piece (number/name/backer) with per-file
  previews, individual downloads, and a "Download All" ZIP export.
- Page shell (`src/components/layout/`): header, hero, and footer with a
  Buy Me a Coffee donation block.
- GitHub Actions CI (`.github/workflows/ci.yml`) running typecheck, lint,
  and build on every push/PR.
- Filled in the README's Prerequisites/Installation/Usage/Examples
  sections; added the full Apache-2.0 license text and the `donate.svg`
  asset referenced by the README's donation section.
