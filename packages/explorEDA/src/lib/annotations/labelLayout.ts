import type { ProjectedAnnotation } from "./resolve";
import {
  POPULATION_NAMES,
  STATISTIC_NAMES,
  type ReferenceLineAnnotation,
} from "./types";

/**
 * Where annotation labels go. Each rule, band, and callout without a saved
 * offset gets a short list of candidate spots, each scored by the marks it
 * covers, the labels already placed, and how far it runs off the plot. The
 * cheapest spot wins, in a fixed order, so a chart always lays out the same.
 */

/** What a chart draws, in plot pixels, so labels can keep clear of it. */
export interface AnnotationMarks {
  points?: { x: number; y: number; r: number }[];
  /** SVG path data, read as the polylines through its points. */
  paths?: string[];
  rects?: { x: number; y: number; width: number; height: number }[];
}

export type Anchor = "start" | "middle" | "end";
export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
export interface LabelPlace {
  x: number;
  y: number;
  anchor: Anchor;
}

export const LABEL_FONT_SIZE = 11;
/** Room a label may run past the plot, into the chart's margins. */
export const LABEL_OVERHANG = 12;
/** Space between stacked rule labels. */
const ROW_STEP = LABEL_FONT_SIZE + 4;
/** How far a bracket sits inside the plot edge. */
export const BRACKET_INSET = 6;
const CELL = 4;
const LINE_HEIGHT = 1.2;

type Shown = Extract<ProjectedAnnotation, { status: "shown" }>;
type ShownOf<T extends Shown["annotation"]["type"]> = Extract<
  Shown,
  { annotation: { type: T } }
>;

/** A rule's label; a calculated rule says what it read and the result. */
export function ruleText(annotation: ReferenceLineAnnotation, value: number) {
  const label = annotation.label?.trim();
  if (!annotation.calculated) return label;
  const { statistic, population } = annotation.calculated;
  const what = label
    ? `${label} (${POPULATION_NAMES[population]})`
    : `${STATISTIC_NAMES[statistic]} of ${POPULATION_NAMES[population]}`;
  return `${what}: ${Number(value.toPrecision(4)).toLocaleString()}`;
}

/** The box a one-line `<text>` covers when its baseline sits at y. */
export function textBox({ x, y, anchor }: LabelPlace, width: number): Box {
  const x0 =
    anchor === "start" ? x : anchor === "end" ? x - width : x - width / 2;
  return {
    x0: x0 - 2,
    y0: y - LABEL_FONT_SIZE * 0.8 - 1,
    x1: x0 + width + 2,
    y1: y + LABEL_FONT_SIZE * 0.25 + 1,
  };
}

/** The box a callout covers: its first line is centred on y. */
function calloutBox(place: LabelPlace, width: number, lines: number): Box {
  const box = textBox({ ...place, y: place.y + LABEL_FONT_SIZE * 0.3 }, width);
  return { ...box, y1: box.y1 + (lines - 1) * LABEL_FONT_SIZE * LINE_HEIGHT };
}

const area = (box: Box) =>
  Math.max(0, box.x1 - box.x0) * Math.max(0, box.y1 - box.y0);
const overlap = (a: Box, b: Box) =>
  area({
    x0: Math.max(a.x0, b.x0),
    y0: Math.max(a.y0, b.y0),
    x1: Math.min(a.x1, b.x1),
    y1: Math.min(a.y1, b.y1),
  });

/** The corner points of SVG path data, absolute or relative. */
export function pathPoints(d: string): [number, number][][] {
  const runs: [number, number][][] = [];
  let run: [number, number][] = [];
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
  let command = "";
  let i = 0;
  const num = () => Number(tokens[i++]);
  // Arguments per command; only each segment's end point matters here.
  const argCounts: Record<string, number> = {
    m: 2,
    l: 2,
    h: 1,
    v: 1,
    c: 6,
    s: 4,
    q: 4,
    t: 2,
    a: 7,
    z: 0,
  };
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i]!)) command = tokens[i++]!;
    const lower = command.toLowerCase();
    const relative = command === lower;
    const count = argCounts[lower];
    if (count === undefined) break;
    if (lower === "z") {
      x = startX;
      y = startY;
      run.push([x, y]);
      continue;
    }
    if (i + count > tokens.length) break;
    const args = Array.from({ length: count }, num);
    if (lower === "h") x = relative ? x + args[0]! : args[0]!;
    else if (lower === "v") y = relative ? y + args[0]! : args[0]!;
    else {
      x = relative ? x + args[count - 2]! : args[count - 2]!;
      y = relative ? y + args[count - 1]! : args[count - 1]!;
    }
    if (lower === "m") {
      if (run.length) runs.push(run);
      run = [];
      startX = x;
      startY = y;
      // Further pairs after a move are lines.
      command = relative ? "l" : "L";
    }
    run.push([x, y]);
  }
  if (run.length) runs.push(run);
  return runs;
}

/**
 * Which 4 px cells of the plot hold a mark, with sums so a box's count of
 * marked cells is four lookups. It covers the margins labels may use too.
 */
export function markGrid(
  marks: AnnotationMarks | undefined,
  plotWidth: number,
  plotHeight: number
) {
  const pad = LABEL_OVERHANG;
  const cols = Math.max(1, Math.ceil((plotWidth + pad * 2) / CELL));
  const rows = Math.max(1, Math.ceil((plotHeight + pad * 2) / CELL));
  const cells = new Uint8Array(cols * rows);
  const col = (x: number) => Math.floor((x + pad) / CELL);
  const row = (y: number) => Math.floor((y + pad) / CELL);
  const mark = (c: number, r: number) => {
    if (c >= 0 && c < cols && r >= 0 && r < rows) cells[r * cols + c] = 1;
  };
  for (const { x, y, r } of marks?.points ?? []) {
    const reach = r + 1;
    for (let c = col(x - reach); c <= col(x + reach); c++)
      for (let rr = row(y - reach); rr <= row(y + reach); rr++) {
        const cx = Math.max(c * CELL - pad, Math.min(x, (c + 1) * CELL - pad));
        const cy = Math.max(
          rr * CELL - pad,
          Math.min(y, (rr + 1) * CELL - pad)
        );
        if (Math.hypot(cx - x, cy - y) <= reach) mark(c, rr);
      }
  }
  for (const rect of marks?.rects ?? []) {
    for (let c = col(rect.x); c <= col(rect.x + rect.width - 0.01); c++)
      for (let r = row(rect.y); r <= row(rect.y + rect.height - 0.01); r++)
        mark(c, r);
  }
  for (const d of marks?.paths ?? []) {
    for (const run of pathPoints(d)) {
      run.forEach(([x, y], index) => {
        const [px, py] = run[index - 1] ?? [x, y];
        const steps = Math.max(1, Math.ceil(Math.hypot(x - px, y - py) / 2));
        for (let s = 0; s <= steps; s++)
          mark(
            col(px + ((x - px) * s) / steps),
            row(py + ((y - py) * s) / steps)
          );
      });
    }
  }
  const sums = new Int32Array((cols + 1) * (rows + 1));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      sums[(r + 1) * (cols + 1) + c + 1] =
        cells[r * cols + c]! +
        sums[r * (cols + 1) + c + 1]! +
        sums[(r + 1) * (cols + 1) + c]! -
        sums[r * (cols + 1) + c]!;
  /** Marked cells under a box. */
  return (box: Box) => {
    const c0 = Math.max(0, col(box.x0));
    const c1 = Math.min(cols, col(box.x1) + 1);
    const r0 = Math.max(0, row(box.y0));
    const r1 = Math.min(rows, row(box.y1) + 1);
    if (c1 <= c0 || r1 <= r0) return 0;
    const at = (r: number, c: number) => sums[r * (cols + 1) + c]!;
    return at(r1, c1) - at(r0, c1) - at(r1, c0) + at(r0, c0);
  };
}

interface Candidate<T> {
  box: Box;
  /** Preference: 0 for the usual spot, more for spots further from it. */
  cost: number;
  place: T;
}
interface Obstacle {
  box: Box;
  weight: number;
  /** The annotation it belongs to; its own label may touch it. */
  owner?: string;
}

/** Score cells: a label over another label costs more than over marks. */
function score(
  box: Box,
  owner: string,
  marked: (box: Box) => number,
  obstacles: Obstacle[],
  plotWidth: number,
  plotHeight: number
) {
  let cost = marked(box);
  for (const obstacle of obstacles)
    if (obstacle.owner !== owner)
      cost += (overlap(box, obstacle.box) / (CELL * CELL)) * obstacle.weight;
  const inside = overlap(box, {
    x0: 0,
    y0: 0,
    x1: plotWidth,
    y1: plotHeight,
  });
  const allowed = overlap(box, {
    x0: -LABEL_OVERHANG,
    y0: -LABEL_OVERHANG,
    x1: plotWidth + LABEL_OVERHANG,
    y1: plotHeight + LABEL_OVERHANG,
  });
  // A little past the plot is fine; past the margin it is cut off.
  cost += ((allowed - inside) / (CELL * CELL)) * 0.5;
  cost += ((area(box) - allowed) / (CELL * CELL)) * 20;
  return cost;
}

function choose<T>(
  owner: string,
  candidates: Candidate<T>[],
  marked: (box: Box) => number,
  obstacles: Obstacle[],
  plotWidth: number,
  plotHeight: number
) {
  let best: Candidate<T> | undefined;
  let bestCost = Infinity;
  for (const candidate of candidates) {
    const cost =
      candidate.cost +
      score(candidate.box, owner, marked, obstacles, plotWidth, plotHeight);
    // Strictly less, so ties keep the earlier, preferred spot.
    if (cost < bestCost - 1e-9) {
      best = candidate;
      bestCost = cost;
    }
  }
  return best;
}

/** Baselines for a row of labels from the top, then from the bottom. */
function rows(top: number, plotHeight: number) {
  const out: { y: number; cost: number }[] = [];
  const count = Math.max(1, Math.floor((plotHeight - top) / ROW_STEP) + 1);
  for (let k = 0; k < count; k++) {
    const y = top + k * ROW_STEP;
    const fromBottom = Math.floor((plotHeight - 4 - y) / ROW_STEP);
    out.push({ y, cost: Math.min(k * 1.5, 2 + fromBottom * 1.5) });
  }
  return out;
}

/**
 * Spots along a horizontal line: its right end, its left end, then the
 * stops between, for each baseline. Below the line costs more than above.
 */
function alongLine(
  width: number,
  left: number,
  right: number,
  ys: { y: number; cost: number }[]
) {
  const out: Candidate<LabelPlace>[] = [];
  const step = 16;
  const span = Math.max(0, right - left - 8 - width);
  const count = Math.floor(span / step) + 1;
  for (const { y, cost } of ys) {
    const start = { x: left + 4, y, anchor: "start" as const };
    for (let j = 0; j < count; j++) {
      const place = { x: right - 4 - j * step, y, anchor: "end" as const };
      out.push({
        box: textBox(place, width),
        cost: cost + (j ? 0.5 + j * 0.04 : 0),
        place,
      });
    }
    out.push({ box: textBox(start, width), cost: cost + 0.5, place: start });
  }
  return out;
}

export interface CalloutPlace extends LabelPlace {
  /** The label's offset from its subject, as drawn. */
  dx: number;
  dy: number;
  auto: boolean;
}

/**
 * Keeps a callout label readable at the plot's edges without overriding
 * the user's offset: a label that would run off one side reads from its
 * other end, and one past the top or bottom stops at the edge.
 */
export function placeLabel(
  lx: number,
  ly: number,
  anchor: "start" | "end",
  width: number,
  lineCount: number,
  plotWidth: number,
  plotHeight: number
): LabelPlace {
  let next = anchor;
  if (anchor === "start" && lx + width > plotWidth + LABEL_OVERHANG)
    next = "end";
  else if (anchor === "end" && lx - width < -LABEL_OVERHANG) next = "start";
  const height = lineCount * LABEL_FONT_SIZE * LINE_HEIGHT;
  const top = -LABEL_OVERHANG + LABEL_FONT_SIZE / 2;
  const bottom = plotHeight + LABEL_OVERHANG - height + LABEL_FONT_SIZE / 2;
  return {
    x: lx,
    y: Math.min(Math.max(ly, top), Math.max(top, bottom)),
    anchor: next,
  };
}

/** Directions around a callout's subject, in order of preference. */
const DIRECTIONS: [number, number][] = [
  [1, -1],
  [-1, -1],
  [1, 1],
  [-1, 1],
  [1, 0],
  [-1, 0],
  [0, -1],
  [0, 1],
];
const RINGS = [10, 22, 36, 56];
/** A callout drawn this far from its subject gets a leader. */
export const LEADER_MIN = { saved: 10, auto: 15 };

/** Small boxes along a leader, so other labels keep off it. */
function segmentBoxes(x1: number, y1: number, x2: number, y2: number) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 4));
  return Array.from({ length: steps + 1 }, (_, s) => {
    const x = x1 + ((x2 - x1) * s) / steps;
    const y = y1 + ((y2 - y1) * s) / steps;
    return { box: { x0: x - 2, y0: y - 2, x1: x + 2, y1: y + 2 }, weight: 2 };
  });
}

export interface LabelLayout {
  rules: Map<string, LabelPlace>;
  bands: Map<string, LabelPlace>;
  callouts: Map<string, CalloutPlace>;
}

/**
 * Places the labels of shown rules, bands, and callouts. A callout with a
 * saved offset stays where the user put it and the others work around it;
 * one without an offset takes the clearest spot near its subject.
 */
export function layoutLabels({
  projected,
  plotWidth,
  plotHeight,
  marks,
  measure,
}: {
  projected: ProjectedAnnotation[];
  plotWidth: number;
  plotHeight: number;
  marks?: AnnotationMarks;
  measure: (text: string) => number;
}): LabelLayout {
  const layout: LabelLayout = {
    rules: new Map(),
    bands: new Map(),
    callouts: new Map(),
  };
  const of = <T extends Shown["annotation"]["type"]>(type: T) =>
    projected.filter(
      (item) => item.status === "shown" && item.annotation.type === type
    ) as ShownOf<T>[];
  const marked = markGrid(marks, plotWidth, plotHeight);
  const obstacles: Obstacle[] = [];
  const place = <T extends LabelPlace>(
    owner: string,
    candidates: Candidate<T>[]
  ): T | undefined => {
    const best = choose(
      owner,
      candidates,
      marked,
      obstacles,
      plotWidth,
      plotHeight
    );
    if (best) obstacles.push({ box: best.box, weight: 4 });
    return best?.place;
  };

  const rules = of("reference-line");
  const callouts = of("callout");
  // Lines other labels should not sit across, and callout subjects.
  for (const { position, annotation } of rules)
    obstacles.push({
      box:
        annotation.axis === "x"
          ? { x0: position - 1, y0: 0, x1: position + 1, y1: plotHeight }
          : { x0: 0, y0: position - 1, x1: plotWidth, y1: position + 1 },
      weight: 1,
      owner: annotation.id,
    });
  for (const { x, y, annotation } of callouts)
    obstacles.push({
      box: { x0: x - 7, y0: y - 7, x1: x + 7, y1: y + 7 },
      weight: 2,
      owner: annotation.id,
    });

  // Saved offsets first: those labels are fixed.
  const measured = callouts.map((item) => {
    const lines = item.annotation.text.split("\n");
    return {
      item,
      lines: lines.length,
      width: Math.max(...lines.map((line) => measure(line))),
    };
  });
  for (const { item, lines, width } of measured) {
    const { annotation, x, y } = item;
    const { dx, dy } = annotation.offset;
    if (!dx && !dy) continue;
    const spot = placeLabel(
      x + dx,
      y + dy,
      dx < 0 ? "end" : "start",
      width,
      lines,
      plotWidth,
      plotHeight
    );
    layout.callouts.set(annotation.id, {
      ...spot,
      dx,
      dy,
      auto: false,
    });
    obstacles.push({ box: calloutBox(spot, width, lines), weight: 4 });
    if (annotation.leader !== false && Math.hypot(dx, dy) > LEADER_MIN.saved)
      obstacles.push(...segmentBoxes(spot.x, spot.y, x, y));
  }
  // Then callouts without one, which need a spot near their subject.
  for (const { item, lines, width } of measured) {
    const { annotation, x, y } = item;
    if (annotation.offset.dx || annotation.offset.dy) continue;
    const candidates: Candidate<CalloutPlace>[] = [];
    RINGS.forEach((ring, ringIndex) =>
      DIRECTIONS.forEach(([ux, uy], dirIndex) => {
        // A label straight above or below needs room for its own height.
        const reach = ux ? ring : ring + 4;
        const diagonal = ux && uy ? Math.SQRT1_2 : 1;
        const dx = Math.round(ux * reach * diagonal);
        let dy = Math.round(uy * reach * diagonal);
        // Lines below the first grow downward, so lift a label above.
        if (uy < 0)
          dy -= Math.round((lines - 1) * LABEL_FONT_SIZE * LINE_HEIGHT);
        const anchor: Anchor = ux > 0 ? "start" : ux < 0 ? "end" : "middle";
        const spot = { x: x + dx, y: y + dy, anchor, dx, dy, auto: true };
        candidates.push({
          box: calloutBox(spot, width, lines),
          cost: ringIndex * 3 + dirIndex * 0.4,
          place: spot,
        });
      })
    );
    const best = place(annotation.id, candidates);
    if (!best) continue;
    layout.callouts.set(annotation.id, best);
    if (
      annotation.leader !== false &&
      Math.hypot(best.dx, best.dy) > LEADER_MIN.auto
    )
      obstacles.push(...segmentBoxes(best.x, best.y, x, y));
  }

  for (const { annotation, start, end } of of("band")) {
    const text = annotation.label?.trim();
    if (!text) continue;
    const width = measure(text);
    const bracket = annotation.display === "bracket";
    let candidates: Candidate<LabelPlace>[];
    if (annotation.axis === "x") {
      const x = (start + end) / 2;
      candidates = rows(bracket ? BRACKET_INSET + 18 : 12, plotHeight).map(
        ({ y, cost }) => {
          const spot = { x, y, anchor: "middle" as const };
          return { box: textBox(spot, width), cost, place: spot };
        }
      );
    } else {
      const top = Math.min(start, end);
      const bottom = Math.max(start, end);
      const right = bracket ? plotWidth - BRACKET_INSET - 8 : plotWidth;
      candidates = alongLine(width, 0, right, [
        { y: top + 12, cost: 0 },
        { y: bottom - 4, cost: 1 },
        { y: top - 4, cost: 2 },
        { y: bottom + 12, cost: 2.5 },
      ]);
    }
    const best = place(annotation.id, candidates);
    if (best) layout.bands.set(annotation.id, best);
  }

  // Vertical rules left to right, then horizontal ones top to bottom.
  const ordered = [...rules].sort(
    (a, b) =>
      Number(a.annotation.axis === "y") - Number(b.annotation.axis === "y") ||
      a.position - b.position
  );
  for (const { annotation, position, value } of ordered) {
    const text = ruleText(annotation, value);
    if (!text) continue;
    const width = measure(text);
    let candidates: Candidate<LabelPlace>[];
    if (annotation.axis === "x") {
      // Beside the line, on the right unless it runs off the plot.
      const room = position + 4 + width <= plotWidth + LABEL_OVERHANG;
      candidates = rows(10, plotHeight).flatMap(({ y, cost }) =>
        (["start", "end"] as const).map((anchor) => {
          const spot = {
            x: anchor === "start" ? position + 4 : position - 4,
            y,
            anchor,
          };
          const flipped = (anchor === "end") === room;
          return {
            box: textBox(spot, width),
            cost: cost + (flipped ? 1 : 0),
            place: spot,
          };
        })
      );
    } else {
      // Above the line at its right end, then its left end, then below.
      candidates = alongLine(width, 0, plotWidth, [
        { y: position - 4, cost: 0 },
        { y: position + LABEL_FONT_SIZE + 2, cost: 3 },
        // A row clear of the line, for a line crowded on both sides.
        { y: position - 4 - ROW_STEP, cost: 6 },
      ]);
    }
    const best = place(annotation.id, candidates);
    if (best) layout.rules.set(annotation.id, best);
  }
  return layout;
}
