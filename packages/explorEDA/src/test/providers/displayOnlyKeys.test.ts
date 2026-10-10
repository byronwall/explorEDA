import { describe, expect, it } from "vitest";
import { chartRegistry } from "@/charts/registry";
import { registerAllCharts } from "@/charts/registerAllCharts";
import {
  createEmptyComposition,
  createTextElement,
} from "@/components/charts/Composition/compositionTypes";
import { getPopulationTest } from "@/lib/chartPopulation";
import { DISPLAY_ONLY_KEYS } from "@/providers/DataLayerProvider";
import type { ChartSettings, datum } from "@/types/ChartTypes";

/**
 * `updateChart` keeps every chart's live items when an edit touches only
 * DISPLAY_ONLY_KEYS. That is correct only while no chart type's filter or
 * population reads those keys. This checks every registered type, so a new
 * type or a new display key is covered here.
 */

const rows: Record<string, datum>[] = Array.from({ length: 30 }, (_, i) => ({
  value: i * 3,
  size: (i % 5) + 1,
  group: ["North", "South", "East"][i % 3],
  kind: ["A", "B"][i % 2],
  date: `2024-0${(i % 9) + 1}-1${i % 9}`,
}));

const fieldGetter = (field: string) =>
  Object.fromEntries(rows.map((row, id) => [id, row[field]])) as Record<
    number,
    datum
  >;

/** A changed value for every display-only key. A new key needs one here. */
const SAMPLES: Record<string, unknown> = {
  title: "Changed title",
  subtitle: "Changed subtitle",
  note: "Changed note",
  style: { titleSize: 30, titleWeight: 400, subtitleSize: 15 },
  composition: (() => {
    const base = createEmptyComposition();
    return { ...base, elements: [createTextElement(base, "title")] };
  })(),
};

const FILTERS = [{ type: "value" as const, field: "group", values: ["North"] }];
const LOCAL_FILTERS = [
  { type: "value" as const, field: "kind", values: ["A"] },
];

function rowsKept(settings: ChartSettings) {
  const definition = chartRegistry.get(settings.type)!;
  const passes = definition.getFilterFunction(settings, fieldGetter);
  const population = getPopulationTest(settings, fieldGetter);
  return rows.map(
    (_, id) => `${passes(id) ? 1 : 0}${population?.(id) === false ? 0 : 1}`
  );
}

// The per-type tests below are generated from the registry as the file loads.
registerAllCharts();

describe("display-only chart settings", () => {
  it("has a sample value for every display-only key", () => {
    for (const key of DISPLAY_ONLY_KEYS)
      expect(SAMPLES, key).toHaveProperty(key);
  });

  for (const definition of chartRegistry.getAll()) {
    it(`never change which rows a ${definition.type} chart holds`, () => {
      const settings = {
        ...definition.createDefaultSettings(
          { x: 0, y: 0, w: 6, h: 4 },
          "value"
        ),
        filters: FILTERS,
        localFilters: LOCAL_FILTERS,
      } as ChartSettings;
      const before = rowsKept(settings);
      for (const key of DISPLAY_ONLY_KEYS) {
        const changed = { ...settings, [key]: SAMPLES[key] } as ChartSettings;
        expect(rowsKept(changed), `${definition.type}.${key}`).toEqual(before);
      }
    });
  }
});
