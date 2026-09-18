import type {
  MountingHole,
  PathCommand,
  PositionedGlyph,
  SignLayout,
} from '@richardmcquiston01/house-number-generator';

/**
 * The package (v0.1.1+) already places each glyph's single mounting hole at
 * the glyph's own deepest interior point ("pole of inaccessibility"), so it
 * always lands on solid material. But one hole per piece still lets it
 * rotate around the screw once installed, so this adds a second
 * well-separated hole per glyph — the point maximizing distance from the
 * package's hole, subject to its own clearance check — falling back to just
 * the package's hole when the glyph is too thin/small to safely fit a
 * second. Diameters are left untouched. Engraving marks on the backer are
 * recomputed to match, one per hole.
 */
export interface RelocatedHoles {
  readonly numberHolesByGlyph: readonly (readonly MountingHole[])[];
  readonly nameHolesByGlyph: readonly (readonly MountingHole[])[] | undefined;
  readonly numberHoles: readonly MountingHole[];
  readonly nameHoles: readonly MountingHole[] | undefined;
  readonly engravingMarks: readonly MountingHole[] | undefined;
}

const HOLES_PER_GLYPH = 2;
// Extra clearance beyond the bare screw-hole radius required before a
// candidate point counts as "safely" inside material.
const CLEARANCE_MARGIN = 1.15;

export function improveHolePlacement(layout: SignLayout): RelocatedHoles {
  const numberHolesByGlyph =
    layout.numberHoles?.map((hole, index) =>
      addSecondHole(hole, layout.numberGlyphs[index]),
    ) ?? layout.numberGlyphs.map(() => []);

  const nameHolesByGlyph =
    layout.nameHoles && layout.nameGlyphs
      ? layout.nameHoles.map((hole, index) =>
          addSecondHole(
            hole,
            (layout.nameGlyphs as readonly PositionedGlyph[])[index],
          ),
        )
      : undefined;

  const numberHoles = numberHolesByGlyph.flat();
  const nameHoles = nameHolesByGlyph?.flat();
  const relocated = [...numberHoles, ...(nameHoles ?? [])];

  const markDiameter = layout.engravingMarks?.[0]?.diameter;
  const engravingMarks =
    layout.engravingMarks && markDiameter !== undefined
      ? relocated.map(hole => ({center: hole.center, diameter: markDiameter}))
      : layout.engravingMarks;

  return {
    numberHolesByGlyph,
    nameHolesByGlyph,
    numberHoles,
    nameHoles,
    engravingMarks,
  };
}

function addSecondHole(
  hole: MountingHole,
  glyph: PositionedGlyph,
): readonly MountingHole[] {
  const centers = additionalHoleCenters(
    glyph.path,
    hole.center,
    HOLES_PER_GLYPH,
    hole.diameter / 2,
  );
  return centers.map(center => ({...hole, center}));
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

interface ScoredPoint {
  readonly point: Point;
  readonly score: number;
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

function isInside(point: Point, outer: Ring, holes: readonly Ring[]): boolean {
  if (!pointInRing(point, outer.points)) {
    return false;
  }
  return !holes.some(hole => pointInRing(point, hole.points));
}

function clearanceAt(point: Point, outer: Ring, holes: readonly Ring[]): number {
  let clearance = distanceToRing(point, outer.points);
  for (const hole of holes) {
    clearance = Math.min(clearance, distanceToRing(point, hole.points));
  }
  return clearance;
}

/** Grid search over `bounds` for the interior point maximizing `score`, among candidates with at least `requiredClearance`. */
function searchGrid(
  bounds: BBox,
  steps: number,
  outer: Ring,
  holes: readonly Ring[],
  requiredClearance: number,
  score: (point: Point) => number,
): ScoredPoint | undefined {
  const stepX = (bounds.maxX - bounds.minX) / steps;
  const stepY = (bounds.maxY - bounds.minY) / steps;
  if (!(stepX > 0) || !(stepY > 0)) {
    return undefined;
  }

  let best: ScoredPoint | undefined;
  for (let i = 0; i <= steps; i += 1) {
    for (let j = 0; j <= steps; j += 1) {
      const point: Point = {x: bounds.minX + stepX * i, y: bounds.minY + stepY * j};
      if (!isInside(point, outer, holes)) {
        continue;
      }
      if (clearanceAt(point, outer, holes) < requiredClearance) {
        continue;
      }
      const value = score(point);
      if (!best || value > best.score) {
        best = {point, score: value};
      }
    }
  }
  return best;
}

/** Two-pass (coarse grid + refine around the coarse winner) search maximizing `score`. */
function findBestPoint(
  outer: Ring,
  holes: readonly Ring[],
  requiredClearance: number,
  score: (point: Point) => number,
): ScoredPoint | undefined {
  const coarse = searchGrid(outer.bbox, COARSE_GRID_STEPS, outer, holes, requiredClearance, score);
  if (!coarse) {
    return undefined;
  }
  const halfWidth = (outer.bbox.maxX - outer.bbox.minX) / COARSE_GRID_STEPS;
  const halfHeight = (outer.bbox.maxY - outer.bbox.minY) / COARSE_GRID_STEPS;
  const refined = searchGrid(
    {
      minX: coarse.point.x - halfWidth,
      maxX: coarse.point.x + halfWidth,
      minY: coarse.point.y - halfHeight,
      maxY: coarse.point.y + halfHeight,
    },
    REFINE_GRID_STEPS,
    outer,
    holes,
    requiredClearance,
    score,
  );
  return refined && refined.score > coarse.score ? refined : coarse;
}

function outerAndHoleRings(path: readonly PathCommand[]): {
  outer: Ring;
  holes: readonly Ring[];
} | undefined {
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
  return {outer, holes: rest.filter(ring => bboxContains(outer.bbox, ring.bbox))};
}

/**
 * `first` (already a valid interior point, placed by the package) plus up to
 * `count - 1` more well-separated points inside the same glyph outline: each
 * maximizes distance from every point already chosen, among candidates with
 * at least `minRadius * CLEARANCE_MARGIN` clearance so the hole actually
 * fits. Returns just `[first]` when the glyph can't safely fit a second
 * point.
 */
function additionalHoleCenters(
  path: readonly PathCommand[],
  first: Point,
  count: number,
  minRadius: number,
): readonly Point[] {
  const chosen: Point[] = [first];

  const rings = outerAndHoleRings(path);
  if (!rings) {
    return chosen;
  }
  const {outer, holes} = rings;

  const requiredClearance = minRadius * CLEARANCE_MARGIN;
  while (chosen.length < count) {
    const next = findBestPoint(outer, holes, requiredClearance, point =>
      Math.min(...chosen.map(c => Math.hypot(point.x - c.x, point.y - c.y))),
    );
    if (!next) {
      break;
    }
    chosen.push(next.point);
  }

  return chosen;
}
