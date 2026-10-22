import { cellCategory, cellKey, sameCategory } from "@/lib/annotations/cells";
import type { AnnotationFrame, PlottedRecord } from "@/lib/annotations/resolve";
import type { AnnotationKeyValue } from "@/lib/annotations/types";
import type { ChartAnnotationFrame } from "../annotations/ChartAnnotations";
import type { HeatmapPlan } from "./heatmapPlan";

/** The center of the cell at a row value and a column value. */
function cellAt(
  plan: HeatmapPlan,
  row: AnnotationKeyValue,
  column: AnnotationKeyValue
): PlottedRecord | undefined {
  const cell = plan.cells.find(
    (item) =>
      sameCategory(row, item.row.value, item.row.label) &&
      sameCategory(column, item.column.value, item.column.label)
  );
  return (
    cell && {
      x: cell.x + cell.width / 2,
      y: cell.y + cell.height / 2,
      selected: cell.selected !== false,
    }
  );
}

/**
 * What a heatmap offers annotations: callouts on a cell, named by its row
 * and column values. Both axes name categories, so lines and bands have no
 * place on it.
 */
export function heatmapAnnotationFrame(
  plan: HeatmapPlan,
  facetKey?: string
): ChartAnnotationFrame {
  const band = (keys: string[], size: number) => ({
    type: "band" as const,
    domain: keys,
    range: [0, size] as [number, number],
    padding: 0,
  });
  const cell: AnnotationFrame["cell"] = (attach) => {
    const key = cellKey(attach, [plan.rowField, plan.columnField]);
    if (!key) return "unsupported";
    return cellAt(plan, key[0]!, key[1]!) ?? "missing";
  };
  return {
    xScale: band(
      plan.columns.map((column) => column.key),
      plan.plotWidth
    ),
    yScale: band(
      plan.rows.map((row) => row.key),
      plan.plotHeight
    ),
    plotWidth: plan.plotWidth,
    plotHeight: plan.plotHeight,
    facetKey,
    category: ({ value }) => {
      const [row, column, extra] = cellCategory(value);
      return row !== undefined && column !== undefined && extra === undefined
        ? cellAt(plan, row, column)
        : undefined;
    },
    cell,
  };
}
