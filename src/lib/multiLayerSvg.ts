import type {
  GeneratedFile,
  MountingHole,
  PathCommand,
  PositionedGlyph,
  SignConfig,
  SignLayout,
} from '@richardmcquiston01/house-number-generator';

/**
 * Renders one SVG with the backer, number glyphs, and name glyphs each on
 * their own Inkscape-compatible layer (`inkscape:groupmode="layer"`), each
 * with a distinct stroke color — for workflows that assign a laser
 * operation per layer/color rather than per file.
 *
 * Uses the same Y-up-to-Y-down flip as {@link renderCompositeSignSvg}, but
 * (unlike that preview-only renderer) emits plain unfilled cut/engrave
 * geometry, matching the package's own cut-file conventions.
 */

const BACKER_COLOR = '#000000';
const NUMBERS_COLOR = '#FF0000';
const NAME_COLOR = '#0000FF';

function round(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function pathToD(path: readonly PathCommand[], flipY: (y: number) => number): string {
  return path
    .map(command => {
      switch (command.type) {
        case 'M':
          return `M ${round(command.x)},${round(flipY(command.y))}`;
        case 'L':
          return `L ${round(command.x)},${round(flipY(command.y))}`;
        case 'C':
          return (
            `C ${round(command.x1)},${round(flipY(command.y1))} ` +
            `${round(command.x2)},${round(flipY(command.y2))} ` +
            `${round(command.x)},${round(flipY(command.y))}`
          );
        case 'Q':
          return (
            `Q ${round(command.x1)},${round(flipY(command.y1))} ` +
            `${round(command.x)},${round(flipY(command.y))}`
          );
        case 'Z':
          return 'Z';
      }
    })
    .join(' ');
}

function glyphPathElements(
  glyphs: readonly PositionedGlyph[],
  flipY: (y: number) => number,
  strokeWidth: number,
): string[] {
  return glyphs.map(
    glyph =>
      `<path d="${pathToD(glyph.path, flipY)}" fill="none" stroke-width="${strokeWidth}"/>`,
  );
}

function holeCircleElements(
  holes: readonly MountingHole[],
  flipY: (y: number) => number,
  strokeWidth: number,
): string[] {
  return holes.map(
    hole =>
      `<circle cx="${round(hole.center.x)}" cy="${round(flipY(hole.center.y))}" r="${round(hole.diameter / 2)}" fill="none" stroke-width="${strokeWidth}"/>`,
  );
}

function layerGroup(
  label: string,
  id: string,
  color: string,
  elements: readonly string[],
): string {
  const body = elements.map(element => `    ${element}`).join('\n');
  return `  <g inkscape:groupmode="layer" inkscape:label="${label}" id="${id}" stroke="${color}">\n${body}\n  </g>`;
}

export function buildMultiLayerSvg(
  layout: SignLayout,
  config: SignConfig,
): GeneratedFile {
  const {backer} = layout;
  const flipY = (y: number): number => backer.height - y;
  const strokeWidth = backer.width / 400;

  const backerShape =
    backer.shape === 'round'
      ? `<circle cx="${round(backer.width / 2)}" cy="${round(backer.height / 2)}" r="${round(backer.width / 2)}" fill="none" stroke-width="${strokeWidth}"/>`
      : `<rect x="0" y="0" width="${round(backer.width)}" height="${round(backer.height)}" fill="none" stroke-width="${strokeWidth}"/>`;

  const layers: string[] = [
    layerGroup('Backer', 'layer-backer', BACKER_COLOR, [
      backerShape,
      ...holeCircleElements(layout.engravingMarks ?? [], flipY, strokeWidth),
    ]),
    layerGroup('Numbers', 'layer-numbers', NUMBERS_COLOR, [
      ...glyphPathElements(layout.numberGlyphs, flipY, strokeWidth),
      ...holeCircleElements(layout.numberHoles ?? [], flipY, strokeWidth),
    ]),
  ];

  if (layout.nameGlyphs && layout.nameGlyphs.length > 0) {
    layers.push(
      layerGroup('Name', 'layer-name', NAME_COLOR, [
        ...glyphPathElements(layout.nameGlyphs, flipY, strokeWidth),
        ...holeCircleElements(layout.nameHoles ?? [], flipY, strokeWidth),
      ]),
    );
  }

  const content = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${round(backer.width)}${config.unit}" height="${round(backer.height)}${config.unit}" viewBox="0 0 ${round(backer.width)} ${round(backer.height)}">`,
    `  <desc>Layers: Backer (${BACKER_COLOR}), Numbers (${NUMBERS_COLOR})${layout.nameGlyphs ? `, Name (${NAME_COLOR})` : ''}.</desc>`,
    ...layers,
    '</svg>',
  ].join('\n');

  return {name: 'sign-layers.svg', content};
}
