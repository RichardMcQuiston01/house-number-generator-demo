import type {PathCommand} from '@richardmcquiston01/house-number-generator';
import type {SignConfig, SignLayout} from './types';

/**
 * Renders a full assembled-sign preview (backer + number/name glyphs +
 * mounting holes/engraving marks) as one self-contained SVG string.
 *
 * `SignLayout` uses a Y-up coordinate system with the origin at the backer's
 * bottom-left corner (see the package's `layout.ts`); SVG is Y-down, so every
 * point is flipped here: `svgY = backerHeight - signY`.
 */
export function renderCompositeSignSvg(
  layout: SignLayout,
  config: SignConfig,
): string {
  const {backer} = layout;
  const flipY = (y: number): number => backer.height - y;
  const pathToD = (path: readonly PathCommand[]): string =>
    path
      .map(command => {
        switch (command.type) {
          case 'M':
            return `M ${command.x} ${flipY(command.y)}`;
          case 'L':
            return `L ${command.x} ${flipY(command.y)}`;
          case 'C':
            return `C ${command.x1} ${flipY(command.y1)}, ${command.x2} ${flipY(command.y2)}, ${command.x} ${flipY(command.y)}`;
          case 'Q':
            return `Q ${command.x1} ${flipY(command.y1)}, ${command.x} ${flipY(command.y)}`;
          case 'Z':
            return 'Z';
        }
      })
      .join(' ');

  const backerShape =
    backer.shape === 'round'
      ? `<circle class="backer" cx="${backer.width / 2}" cy="${backer.height / 2}" r="${backer.width / 2}" />`
      : `<rect class="backer" x="0" y="0" width="${backer.width}" height="${backer.height}" ${backer.shape === 'square' ? '' : 'rx="0"'} />`;

  const glyphPaths = [
    ...layout.numberGlyphs,
    ...(layout.nameGlyphs ?? []),
  ]
    .map(glyph => `<path class="glyph" d="${pathToD(glyph.path)}" />`)
    .join('');

  const mountingHoles = [
    ...(layout.numberHoles ?? []),
    ...(layout.nameHoles ?? []),
  ]
    .map(
      hole =>
        `<circle class="mounting-hole" cx="${hole.center.x}" cy="${flipY(hole.center.y)}" r="${hole.diameter / 2}" />`,
    )
    .join('');

  const engravingMarks = (layout.engravingMarks ?? [])
    .map(
      mark =>
        `<circle class="engraving-mark" cx="${mark.center.x}" cy="${flipY(mark.center.y)}" r="${mark.diameter / 2}" />`,
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${backer.width} ${backer.height}" width="${backer.width}${config.unit}" height="${backer.height}${config.unit}">
  <style>
    .backer { fill: #f5f0e6; stroke: #17456a; stroke-width: ${backer.width / 200}; }
    .glyph { fill: #17456a; stroke: none; }
    .mounting-hole { fill: #ffffff; stroke: #17456a; stroke-width: ${backer.width / 400}; }
    .engraving-mark { fill: none; stroke: #2680bd; stroke-width: ${backer.width / 400}; stroke-dasharray: ${backer.width / 200} ${backer.width / 200}; }
  </style>
  ${backerShape}
  ${engravingMarks}
  ${glyphPaths}
  ${mountingHoles}
</svg>`;
}
