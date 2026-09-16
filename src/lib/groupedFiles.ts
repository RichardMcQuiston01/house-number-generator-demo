import {Colors, DxfWriter, LWPolylineFlags, Units} from '@tarikjabiri/dxf';
import type {
  GeneratedFile,
  MountingHole,
  PathCommand,
  PositionedGlyph,
  Unit,
} from '@richardmcquiston01/house-number-generator';

/**
 * Combines every glyph (and mounting hole) in a group into ONE cut file
 * instead of one file per glyph, matching the visual/dimensional
 * conventions the package's own per-glyph SVG/DXF output uses (so a
 * grouped file behaves identically to individual files, just merged).
 */

interface Point {
  readonly x: number;
  readonly y: number;
}

interface BoundingBox {
  readonly minX: number;
  readonly minY: number;
  readonly width: number;
  readonly height: number;
}

function pathPoints(path: readonly PathCommand[]): Point[] {
  const points: Point[] = [];
  for (const command of path) {
    switch (command.type) {
      case 'M':
      case 'L':
        points.push({x: command.x, y: command.y});
        break;
      case 'Q':
        points.push(
          {x: command.x1, y: command.y1},
          {x: command.x, y: command.y},
        );
        break;
      case 'C':
        points.push(
          {x: command.x1, y: command.y1},
          {x: command.x2, y: command.y2},
          {x: command.x, y: command.y},
        );
        break;
      case 'Z':
        break;
    }
  }
  return points;
}

function holeExtentPoints(hole: MountingHole): Point[] {
  const r = hole.diameter / 2;
  return [
    {x: hole.center.x - r, y: hole.center.y - r},
    {x: hole.center.x + r, y: hole.center.y + r},
  ];
}

function unionBoundingBox(
  glyphs: readonly PositionedGlyph[],
  holes: readonly MountingHole[],
): BoundingBox {
  const points = [
    ...glyphs.flatMap(glyph => pathPoints(glyph.path)),
    ...holes.flatMap(holeExtentPoints),
  ];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  if (!Number.isFinite(minX)) {
    return {minX: 0, minY: 0, width: 0, height: 0};
  }
  return {minX, minY, width: maxX - minX, height: maxY - minY};
}

function translatePath(
  path: readonly PathCommand[],
  dx: number,
  dy: number,
): PathCommand[] {
  return path.map((command): PathCommand => {
    switch (command.type) {
      case 'M':
        return {type: 'M', x: command.x + dx, y: command.y + dy};
      case 'L':
        return {type: 'L', x: command.x + dx, y: command.y + dy};
      case 'C':
        return {
          type: 'C',
          x1: command.x1 + dx,
          y1: command.y1 + dy,
          x2: command.x2 + dx,
          y2: command.y2 + dy,
          x: command.x + dx,
          y: command.y + dy,
        };
      case 'Q':
        return {
          type: 'Q',
          x1: command.x1 + dx,
          y1: command.y1 + dy,
          x: command.x + dx,
          y: command.y + dy,
        };
      case 'Z':
        return {type: 'Z'};
    }
  });
}

function translateHole(hole: MountingHole, dx: number, dy: number): MountingHole {
  return {center: {x: hole.center.x + dx, y: hole.center.y + dy}, diameter: hole.diameter};
}

// --- SVG ---

function round(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function strokeWidthFor(unit: Unit): number {
  return unit === 'mm' ? 0.1 : 0.004;
}

function svgPathD(path: readonly PathCommand[], localHeight: number): string {
  const flipY = (y: number): number => round(localHeight - y);
  return path
    .map(command => {
      switch (command.type) {
        case 'M':
          return `M ${round(command.x)},${flipY(command.y)}`;
        case 'L':
          return `L ${round(command.x)},${flipY(command.y)}`;
        case 'C':
          return (
            `C ${round(command.x1)},${flipY(command.y1)} ` +
            `${round(command.x2)},${flipY(command.y2)} ` +
            `${round(command.x)},${flipY(command.y)}`
          );
        case 'Q':
          return (
            `Q ${round(command.x1)},${flipY(command.y1)} ` +
            `${round(command.x)},${flipY(command.y)}`
          );
        case 'Z':
          return 'Z';
      }
    })
    .join(' ');
}

/** Builds one combined SVG cut file for every glyph (and hole) in a group. Returns `undefined` for an empty group. */
export function buildGroupedSvgFile(
  fileName: string,
  glyphs: readonly PositionedGlyph[],
  holes: readonly MountingHole[] | undefined,
  unit: Unit,
): GeneratedFile | undefined {
  if (glyphs.length === 0) {
    return undefined;
  }
  const allHoles = holes ?? [];
  const bbox = unionBoundingBox(glyphs, allHoles);
  const dx = -bbox.minX;
  const dy = -bbox.minY;
  const strokeWidth = strokeWidthFor(unit);

  const body: string[] = [
    ...glyphs.map(glyph => {
      const path = translatePath(glyph.path, dx, dy);
      return `<path class="cut" d="${svgPathD(path, bbox.height)}" fill="none" stroke="#000000" stroke-width="${strokeWidth}"/>`;
    }),
    ...allHoles.map(hole => {
      const translated = translateHole(hole, dx, dy);
      const cx = round(translated.center.x);
      const cy = round(bbox.height - translated.center.y);
      const r = round(hole.diameter / 2);
      return `<circle class="cut" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#000000" stroke-width="${strokeWidth}"/>`;
    }),
  ];

  const w = round(bbox.width);
  const h = round(bbox.height);
  const content = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}${unit}" height="${h}${unit}" viewBox="0 0 ${w} ${h}">`,
    ...body.map(element => `  ${element}`),
    '</svg>',
  ].join('\n');

  return {name: fileName, content};
}

// --- DXF ---

const BEZIER_SEGMENTS = 16;
const CUT_LAYER = 'CUT';

function cubicPointAt(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
}

function quadPointAt(p0: Point, p1: Point, p2: Point, t: number): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}

interface FlattenedSubpath {
  readonly vertices: readonly Point[];
  readonly closed: boolean;
}

function flattenPathToSubpaths(path: readonly PathCommand[]): FlattenedSubpath[] {
  const subpaths: FlattenedSubpath[] = [];
  let currentVertices: Point[] = [];
  let currentClosed = false;
  let currentPoint: Point = {x: 0, y: 0};
  let startPoint: Point = {x: 0, y: 0};

  const finalizeCurrent = (): void => {
    if (currentVertices.length > 0) {
      subpaths.push({vertices: currentVertices, closed: currentClosed});
    }
    currentVertices = [];
    currentClosed = false;
  };

  for (const command of path) {
    switch (command.type) {
      case 'M':
        finalizeCurrent();
        currentPoint = {x: command.x, y: command.y};
        startPoint = currentPoint;
        currentVertices.push(currentPoint);
        break;
      case 'L':
        currentPoint = {x: command.x, y: command.y};
        currentVertices.push(currentPoint);
        break;
      case 'C': {
        const p0 = currentPoint;
        const p1: Point = {x: command.x1, y: command.y1};
        const p2: Point = {x: command.x2, y: command.y2};
        const p3: Point = {x: command.x, y: command.y};
        for (let i = 1; i <= BEZIER_SEGMENTS; i += 1) {
          currentVertices.push(cubicPointAt(p0, p1, p2, p3, i / BEZIER_SEGMENTS));
        }
        currentPoint = p3;
        break;
      }
      case 'Q': {
        const p0 = currentPoint;
        const p1: Point = {x: command.x1, y: command.y1};
        const p2: Point = {x: command.x, y: command.y};
        for (let i = 1; i <= BEZIER_SEGMENTS; i += 1) {
          currentVertices.push(quadPointAt(p0, p1, p2, i / BEZIER_SEGMENTS));
        }
        currentPoint = p2;
        break;
      }
      case 'Z':
        currentClosed = true;
        currentPoint = startPoint;
        break;
    }
  }
  finalizeCurrent();
  return subpaths;
}

/** Builds one combined DXF cut file for every glyph (and hole) in a group. Returns `undefined` for an empty group. */
export function buildGroupedDxfFile(
  fileName: string,
  glyphs: readonly PositionedGlyph[],
  holes: readonly MountingHole[] | undefined,
  unit: Unit,
): GeneratedFile | undefined {
  if (glyphs.length === 0) {
    return undefined;
  }
  const allHoles = holes ?? [];
  const bbox = unionBoundingBox(glyphs, allHoles);
  const dx = -bbox.minX;
  const dy = -bbox.minY;

  const dxf = new DxfWriter();
  dxf.addLayer(CUT_LAYER, Colors.White);
  dxf.setUnits(unit === 'mm' ? Units.Millimeters : Units.Inches);

  for (const glyph of glyphs) {
    const path = translatePath(glyph.path, dx, dy);
    for (const subpath of flattenPathToSubpaths(path)) {
      if (subpath.vertices.length === 0) continue;
      dxf.addLWPolyline(
        subpath.vertices.map(vertex => ({point: {x: vertex.x, y: vertex.y}})),
        {
          layerName: CUT_LAYER,
          flags: subpath.closed ? LWPolylineFlags.Closed : LWPolylineFlags.None,
        },
      );
    }
  }
  for (const hole of allHoles) {
    const translated = translateHole(hole, dx, dy);
    dxf.addCircle(
      {x: translated.center.x, y: translated.center.y, z: 0},
      translated.diameter / 2,
      {layerName: CUT_LAYER},
    );
  }

  return {name: fileName, content: dxf.stringify()};
}
