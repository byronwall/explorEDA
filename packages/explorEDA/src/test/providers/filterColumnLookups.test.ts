import { describe, expect, it } from "vitest";
import { chartRegistry } from "@/charts/registry";
import { registerAllCharts } from "@/charts/registerAllCharts";
import type { ChartSettings, datum } from "@/types/ChartTypes";

/**
 * A chart's filter function runs once per row, for every chart, on every
 * filter change and restore. A column lookup inside it costs a pass over all
 * rows per row, so 27,000 rows take tens of seconds. Each type must look its
 * columns up when it builds the filter function. This checks every
 * registered type, so a new type is covered here.
 */

const rows: Record<string, datum>[] = Array.from({ length: 40 }, (_, i) => ({
  value: i * 3,
  group: ["North", "South", "East"][i % 3],
  date: `2024-01-${String((i % 28) + 1).padStart(2, "0")}`,
}));

const FILTERS = [
  { type: "value" as const, field: "group", values: ["North"] },
  { type: "range" as const, field: "value", min: 10, max: 90 },
];

registerAllCharts();

describe("chart filter functions", () => {
  for (const definition of chartRegistry.getAll()) {
    it(`${definition.type} looks up columns before it tests rows`, () => {
      const settings = {
        ...definition.createDefaultSettings(
          { x: 0, y: 0, w: 6, h: 4 },
          "value"
        ),
        filters: FILTERS,
      } as ChartSettings;
      let lookups = 0;
      const fieldGetter = (field: string) => {
        lookups++;
        return Object.fromEntries(
          rows.map((row, id) => [id, row[field]])
        ) as Record<number, datum>;
      };
      const passes = definition.getFilterFunction(settings, fieldGetter);
      const built = lookups;
      rows.forEach((_, id) => passes(id));
      expect(lookups - built).toBe(0);
    });
  }
});
