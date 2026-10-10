// Run with: pnpm --filter exploreda exec vitest bench --run src/components/charts/ScatterMatrix
import { bench, describe } from "vitest";
import { matrixFields, matrixRows } from "@/test/fixtures/matrixData";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import type { Filter } from "@/types/FilterTypes";
import type { ScatterMatrixSettings } from "./definition";
import {
  planMatrixLayout,
  planMatrixSelection,
  planScatterMatrix,
  withSelectedBars,
} from "./matrixPlan";

const SIZE = 900;

function settings(
  fields: string[],
  filters: Filter[] = []
): ScatterMatrixSettings {
  return {
    ...DEFAULT_CHART_SETTINGS,
    id: "bench",
    type: "scatter-matrix",
    fields,
    // Both triangles as points: the worst case for drawing.
    lower: { numeric: "points", mixed: "points", categorical: "points" },
    upper: { numeric: "points", mixed: "points", categorical: "points" },
    diagonal: { continuous: "histogram", categorical: "bars" },
    margin: { top: 4, right: 4, bottom: 4, left: 4 },
    filters,
  };
}

const brush: Filter[] = [
  { type: "range", field: "n0", min: -1, max: 1 },
  { type: "range", field: "n1", min: 0, max: 5 },
];

for (const rows of [10_000, 100_000]) {
  const data = matrixRows(rows, 7, 3);
  for (const count of [3, 5, 10]) {
    for (const mixed of [false, true]) {
      const fields = matrixFields(count, mixed);
      const label = `${rows / 1000}k rows × ${count} fields${mixed ? ", mixed" : ""}`;
      describe(label, () => {
        bench("plan", () => {
          planScatterMatrix({
            settings: settings(fields),
            snapshot: data,
            width: SIZE,
            height: SIZE,
          });
        });
        const layout = planMatrixLayout({
          settings: settings(fields),
          snapshot: data,
          width: SIZE,
          height: SIZE,
        });
        bench("brush on a planned layout", () => {
          withSelectedBars(layout, planMatrixSelection(layout, brush, data));
        });
      });
    }
  }
}
