# CHANGELOG

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
