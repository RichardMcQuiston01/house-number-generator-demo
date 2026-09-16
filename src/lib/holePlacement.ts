import type {
  MountingHole,
  PathCommand,
  PositionedGlyph,
  SignLayout,
} from '@richardmcquiston01/house-number-generator';

/**
 * The package centers each glyph's mounting hole on the glyph's bounding-box
 * center, which frequently lands outside the glyph's actual ink for
 * asymmetric or open shapes (e.g. "1", "7", "T", "L") — the hole ends up in
 * empty space rather than in material. Recomputes each hole's center as the
 * point of maximum clearance from the glyph's own outline (its "pole of
 * inaccessibility"), which stays within solid material whenever the glyph's
 * stroke is thick enough to contain the hole at all. Diameters are left
 * untouched — only positions move. Engraving marks on the backer are moved
 * to match, since they mirror the number/name holes at the same indices.
 */
export function improveHolePlacement(layout: SignLayout): SignLayout {
  const numberHoles = layout.numberHoles?.map((hole, index) =>
    relocateHole(hole, layout.numberGlyphs[index]),
  );
  const nameHoles =
    layout.nameHoles && layout.nameGlyphs
      ? layout.nameHoles.map((hole, index) =>
          relocateHole(hole, (layout.nameGlyphs as readonly PositionedGlyph[])[index]),
        )
      : layout.nameHoles;

  const relocated = [...(numberHoles ?? []), ...(nameHoles ?? [])];
  const engravingMarks = layout.engravingMarks?.map((mark, index) => ({
    ...mark,
    center: relocated[index]?.center ?? mark.center,
  }));

  return {
    ...layout,
    ...(numberHoles ? {numberHoles} : {}),
    ...(nameHoles ? {nameHoles} : {}),
    ...(engravingMarks ? {engravingMarks} : {}),
  };
}

function relocateHole(hole: MountingHole, glyph: PositionedGlyph): MountingHole {
  const center = deepestInteriorPoint(glyph.path);
  return center ? {...hole, center} : hole;
}

// ---- geometry ----

interface Point {
  readonly x: number;
  readonly y: number;
}

interface BBox {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

interface Ring {
  readonly points: readonly Point[];
  readonly area: number;
  readonly bbox: BBox;
}

const BEZIER_SEGMENTS = 12;
const COARSE_GRID_STEPS = 16;
const REFINE_GRID_STEPS = 12;

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

/** Flattens a glyph path into one closed point ring per subpath (font outlines are always closed contours). */
function flattenToRings(path: readonly PathCommand[]): Point[][] {
  const rings: Point[][] = [];
  let current: Point[] = [];
  let currentPoint: Point = {x: 0, y: 0};

  const finalize = (): void => {
    if (current.length >= 3) {
      rings.push(current);
    }
    current = [];
  };

  for (const command of path) {
    switch (command.type) {
      case 'M':
        finalize();
        currentPoint = {x: command.x, y: command.y};
        current.push(currentPoint);
        break;
      case 'L':
        currentPoint = {x: command.x, y: command.y};
        current.push(currentPoint);
        break;
      case 'C': {
        const p0 = currentPoint;
        const p1: Point = {x: command.x1, y: command.y1};
        const p2: Point = {x: command.x2, y: command.y2};
        const p3: Point = {x: command.x, y: command.y};
        for (let i = 1; i <= BEZIER_SEGMENTS; i += 1) {
          current.push(cubicPointAt(p0, p1, p2, p3, i / BEZIER_SEGMENTS));
        }
        currentPoint = p3;
        break;
      }
      case 'Q': {
        const p0 = currentPoint;
        const p1: Point = {x: command.x1, y: command.y1};
        const p2: Point = {x: command.x, y: command.y};
        for (let i = 1; i <= BEZIER_SEGMENTS; i += 1) {
          current.push(quadPointAt(p0, p1, p2, i / BEZIER_SEGMENTS));
        }
        currentPoint = p2;
        break;
      }
      case 'Z':
        break;
    }
  }
  finalize();
  return rings;
}

function ringArea(points: readonly Point[]): number {
  let sum = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    sum += points[j].x * points[i].y - points[i].x * points[j].y;
  }
  return sum / 2;
}

function ringBBox(points: readonly Point[]): BBox {
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
  return {minX, minY, maxX, maxY};
}

// Treats a subpath as a "hole" (counter) of the primary outline when its
// bounding box sits within the primary's, with a small tolerance for
// flattening error. A disjoint decoration (e.g. the dot of "i") falls
// outside the primary's bbox and is correctly left alone.
function bboxContains(outer: BBox, inner: BBox): boolean {
  const epsilon = Math.max(outer.maxX - outer.minX, outer.maxY - outer.minY) * 0.01;
  return (
    inner.minX >= outer.minX - epsilon &&
    inner.maxX <= outer.maxX + epsilon &&
    inner.minY >= outer.minY - epsilon &&
    inner.maxY <= outer.maxY + epsilon
  );
}

function pointInRing(point: Point, ring: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const pi = ring[i];
    const pj = ring[j];
    const crosses =
      pi.y > point.y !== pj.y > point.y &&
      point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x;
    if (crosses) {
      inside = !inside;
    }
  }
  return inside;
}

function distancePointToSegment(point: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) {
    return Math.hypot(point.x - a.x, point.y - a.y);
  }
  const t = Math.max(
    0,
    Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared),
  );
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

function distanceToRing(point: Point, ring: readonly Point[]): number {
  let min = Infinity;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    min = Math.min(min, distancePointToSegment(point, ring[i], ring[j]));
  }
  return min;
}

interface SearchResult {
  readonly point: Point;
  readonly clearance: number;
}

/** Finds the point inside `outer` (and outside every ring in `holes`) with the largest minimum distance to any ring's edge, searching a grid over `bounds`. */
function searchGrid(
  bounds: BBox,
  steps: number,
  outer: Ring,
  holes: readonly Ring[],
): SearchResult | undefined {
  const stepX = (bounds.maxX - bounds.minX) / steps;
  const stepY = (bounds.maxY - bounds.minY) / steps;
  if (!(stepX > 0) || !(stepY > 0)) {
    return undefined;
  }

  let best: SearchResult | undefined;
  for (let i = 0; i <= steps; i += 1) {
    for (let j = 0; j <= steps; j += 1) {
      const candidate: Point = {
        x: bounds.minX + stepX * i,
        y: bounds.minY + stepY * j,
      };
      if (!pointInRing(candidate, outer.points)) {
        continue;
      }
      if (holes.some(hole => pointInRing(candidate, hole.points))) {
        continue;
      }
      let clearance = distanceToRing(candidate, outer.points);
      for (const hole of holes) {
        clearance = Math.min(clearance, distanceToRing(candidate, hole.points));
      }
      if (!best || clearance > best.clearance) {
        best = {point: candidate, clearance};
      }
    }
  }
  return best;
}

/** The point deepest inside a (possibly multi-contour) glyph outline, or `undefined` if the path has no usable area (e.g. a space). */
function deepestInteriorPoint(path: readonly PathCommand[]): Point | undefined {
  const rings: Ring[] = flattenToRings(path).map(points => ({
    points,
    area: Math.abs(ringArea(points)),
    bbox: ringBBox(points),
  }));
  if (rings.length === 0) {
    return undefined;
  }

  rings.sort((a, b) => b.area - a.area);
  const [outer, ...rest] = rings;
  if (outer.area <= 0) {
    return undefined;
  }
  const holes = rest.filter(ring => bboxContains(outer.bbox, ring.bbox));

  const coarse = searchGrid(outer.bbox, COARSE_GRID_STEPS, outer, holes);
  if (!coarse) {
    return undefined;
  }

  const refineHalfWidth = (outer.bbox.maxX - outer.bbox.minX) / COARSE_GRID_STEPS;
  const refineHalfHeight = (outer.bbox.maxY - outer.bbox.minY) / COARSE_GRID_STEPS;
  const refined = searchGrid(
    {
      minX: coarse.point.x - refineHalfWidth,
      maxX: coarse.point.x + refineHalfWidth,
      minY: coarse.point.y - refineHalfHeight,
      maxY: coarse.point.y + refineHalfHeight,
    },
    REFINE_GRID_STEPS,
    outer,
    holes,
  );

  return (refined && refined.clearance > coarse.clearance ? refined : coarse).point;
}
