/**
 * The `layout { }` block: one line per band of the grid, as a height and a
 * list of cells. Cells split the columns evenly unless a cell says its
 * width, as in `bill:7`. A name repeated across cells makes that chart
 * wider; repeated on the next line, taller. `.` leaves a cell empty.
 *
 *   layout {
 *     5: size size species island     6 / 3 / 3
 *     4: bill:7 mass                   7 / 5
 *   }
 */
import type { ChartLayout } from "@/types/ChartTypes";
import type { DslDeclaration, DslSpan } from "./parse";

export interface LayoutCell {
  /** The chart's name, or undefined for an empty cell. */
  name?: string;
  width?: number;
  span: DslSpan;
}

export interface LayoutRow {
  height: number;
  cells: LayoutCell[];
  span: DslSpan;
}

export interface LayoutProblem {
  message: string;
  span: DslSpan;
  suggestion?: string;
}

const ROW_HEAD = /^(\d+):$/;
const CELL = /^(?:"((?:[^"\\]|\\.)*)"|([^\s":]+))(?::(\d+))?$/;

/** True for a word that starts a layout line, such as `5:`. */
export function isLayoutRow(keyword: string) {
  return ROW_HEAD.test(keyword);
}

/** Reads the lines of a `layout` block. */
export function parseLayout(
  layout: DslDeclaration,
  problems: LayoutProblem[]
): LayoutRow[] {
  const rows: LayoutRow[] = [];
  for (const pair of layout.pairs) {
    problems.push({
      message: `${pair.key}= is not a layout setting, so it was ignored.`,
      span: pair.span,
      suggestion: "Write each band as a height and its cells: 5: a b c.",
    });
  }
  for (const child of layout.children) {
    const head = ROW_HEAD.exec(child.keyword);
    if (!head || Number(head[1]) < 1) {
      problems.push({
        message: `${child.keyword} doesn't start a layout line, so it was ignored.`,
        span: child.span,
        suggestion:
          "Start each line with the band's height in grid rows: 5: a b c.",
      });
      continue;
    }
    const cells: LayoutCell[] = [];
    let valid = true;
    for (const item of child.positional) {
      const match = CELL.exec(item.value.raw);
      if (!match) {
        problems.push({
          message: `${item.value.raw} is not a layout cell.`,
          span: item.span,
          suggestion:
            'Write a chart name, "a quoted name", name:width, or . for an empty cell.',
        });
        valid = false;
        continue;
      }
      const name =
        match[1] !== undefined
          ? JSON.parse(`"${match[1]}"`)
          : match[2] === "."
            ? undefined
            : match[2];
      const width = match[3] === undefined ? undefined : Number(match[3]);
      if (width === 0) {
        problems.push({
          message: `${item.value.raw} is zero columns wide.`,
          span: item.span,
          suggestion: "Give the cell a width of 1 or more, or leave it out.",
        });
        valid = false;
        continue;
      }
      cells.push({ name, width, span: item.span });
    }
    for (const pair of child.pairs) {
      problems.push({
        message: `${pair.key}= can't go in a layout line.`,
        span: pair.span,
      });
    }
    if (!cells.length) {
      problems.push({
        message: "This layout line has no cells.",
        span: child.span,
        suggestion: "List the charts in the band, or . for an empty one.",
      });
      continue;
    }
    if (valid) {
      rows.push({ height: Number(head[1]), cells, span: child.span });
    }
  }
  return rows;
}

/** Each cell's width: unsized cells share what the sized ones leave. */
function cellWidths(row: LayoutRow, columns: number): number[] | undefined {
  const sized = row.cells.reduce((sum, cell) => sum + (cell.width ?? 0), 0);
  const unsized = row.cells.filter((cell) => cell.width === undefined).length;
  if (!unsized) {
    return sized === columns ? row.cells.map((cell) => cell.width!) : undefined;
  }
  const share = (columns - sized) / unsized;
  if (!Number.isInteger(share) || share < 1) {
    return undefined;
  }
  return row.cells.map((cell) => cell.width ?? share);
}

/**
 * Places charts from layout lines. `resolve` turns a name into a chart ID,
 * or reports it and returns undefined. Returns each placed chart's layout.
 */
export function placeLayout(
  rows: LayoutRow[],
  columns: number,
  resolve: (name: string, span: DslSpan) => string | undefined,
  problems: LayoutProblem[]
): Map<string, ChartLayout> {
  const rects = new Map<string, { layout: ChartLayout; span: DslSpan }[]>();
  let y = 0;
  for (const row of rows) {
    const widths = cellWidths(row, columns);
    if (!widths) {
      problems.push({
        message: `These cells don't fill the ${columns} columns evenly, so this line was skipped.`,
        span: row.span,
        suggestion: `Give cells widths that add up to ${columns}, such as a:7 b:5, or use a number of cells that divides ${columns}.`,
      });
      y += row.height;
      continue;
    }
    let x = 0;
    row.cells.forEach((cell, index) => {
      const width = widths[index]!;
      if (cell.name !== undefined) {
        const id = resolve(cell.name, cell.span);
        if (id !== undefined) {
          const list = rects.get(id) ?? [];
          const last = list.at(-1);
          // A name repeated in the next cell widens the same chart.
          if (
            last &&
            last.layout.y === y &&
            last.layout.x + last.layout.w === x
          ) {
            last.layout.w += width;
          } else {
            list.push({
              layout: { x, y, w: width, h: row.height },
              span: cell.span,
            });
          }
          rects.set(id, list);
        }
      }
      x += width;
    });
    y += row.height;
  }
  const placed = new Map<string, ChartLayout>();
  for (const [id, list] of rects) {
    // Pieces on following lines must line up to make one rectangle.
    const [first, ...rest] = list;
    const layout = { ...first!.layout };
    let ok = true;
    for (const piece of rest) {
      if (
        piece.layout.x === layout.x &&
        piece.layout.w === layout.w &&
        piece.layout.y === layout.y + layout.h
      ) {
        layout.h += piece.layout.h;
      } else {
        ok = false;
        problems.push({
          message: `The cells for ${id} don't form one rectangle, so it was placed automatically.`,
          span: piece.span,
          suggestion:
            "Repeat the name in the same columns on lines that follow each other.",
        });
        break;
      }
    }
    if (ok) {
      placed.set(id, layout);
    }
  }
  return placed;
}

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

function overlaps(a: ChartLayout, b: ChartLayout) {
  return (
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  );
}

function cellName(name: string) {
  return /^[^\s":.{}#@][^\s":{}]*$/.test(name) ? name : JSON.stringify(name);
}

/**
 * Writes charts' positions as layout lines, or returns undefined when two
 * charts overlap and only `at=` can say where each sits.
 */
export function layoutLines(
  charts: Array<{ name: string; layout: ChartLayout }>,
  columns: number
): string[] | undefined {
  if (!charts.length) {
    return [];
  }
  for (let i = 0; i < charts.length; i++) {
    for (let j = i + 1; j < charts.length; j++) {
      if (overlaps(charts[i]!.layout, charts[j]!.layout)) {
        return undefined;
      }
    }
    if (charts[i]!.layout.x + charts[i]!.layout.w > columns) {
      return undefined;
    }
  }
  const cuts = [
    ...new Set(charts.flatMap(({ layout }) => [layout.y, layout.y + layout.h])),
  ].sort((a, b) => a - b);
  if (cuts[0]! > 0) {
    cuts.unshift(0);
  }
  const lines: string[] = [];
  for (let index = 0; index < cuts.length - 1; index++) {
    const top = cuts[index]!;
    const height = cuts[index + 1]! - top;
    const inBand = charts
      .filter(
        ({ layout }) => layout.y < top + height && layout.y + layout.h > top
      )
      .sort((a, b) => a.layout.x - b.layout.x);
    // Segments across the band: charts and the gaps between them.
    const segments: Array<{ name?: string; width: number }> = [];
    let x = 0;
    for (const chart of inBand) {
      if (chart.layout.x > x) {
        segments.push({ width: chart.layout.x - x });
      }
      segments.push({ name: chart.name, width: chart.layout.w });
      x = chart.layout.x + chart.layout.w;
    }
    if (x < columns) {
      segments.push({ width: columns - x });
    }
    const unit = segments.reduce(
      (value, segment) => gcd(value, segment.width),
      columns
    );
    const cells = columns / unit;
    const words =
      cells <= 4
        ? // Few cells read best as repeated names: a a b.
          segments.flatMap((segment) =>
            Array.from({ length: segment.width / unit }, () =>
              segment.name === undefined ? "." : cellName(segment.name)
            )
          )
        : sizedCells(segments, columns);
    lines.push(`${height}: ${words.join(" ")}`);
  }
  return lines;
}

/** Cells with widths, leaving a width two or more share to the even split. */
function sizedCells(
  segments: Array<{ name?: string; width: number }>,
  columns: number
): string[] {
  const counts = new Map<number, number>();
  for (const segment of segments) {
    counts.set(segment.width, (counts.get(segment.width) ?? 0) + 1);
  }
  const [common] = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || b[0] - a[0]
  )[0]!;
  const sized = segments
    .filter((segment) => segment.width !== common)
    .reduce((sum, segment) => sum + segment.width, 0);
  const unsized = segments.filter((segment) => segment.width === common).length;
  // One unsized cell would read as a riddle; name both widths instead.
  const evenly = unsized > 1 && (columns - sized) / unsized === common;
  return segments.map((segment) => {
    const name = segment.name === undefined ? "." : cellName(segment.name);
    return evenly && segment.width === common
      ? name
      : `${name}:${segment.width}`;
  });
}
