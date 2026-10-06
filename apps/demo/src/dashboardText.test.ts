import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  compileDocument,
  exportDocument,
  type SavedDataStructure,
} from "exploreda";
import { parseCsvData } from "./csvParser";
import { examples } from "./demos/examples";

/** What a user sees: charts and definitions, without generated IDs. */
function meaning(settings: SavedDataStructure) {
  return {
    name: settings.metadata.name,
    grid: settings.gridSettings,
    calculations: settings.calculations,
    fieldSettings: settings.fieldSettings ?? {},
    charts: settings.charts.map((chart) => ({
      ...chart,
      id: undefined,
      colorScaleId: undefined,
      aggregateId: undefined,
      geometryAssetId: undefined,
    })),
  };
}

// Region maps reference shared map shapes, which text can't carry yet.
const NOT_YET_IN_TEXT = new Set(["region-map"]);

const views = examples
  .filter((example) => !NOT_YET_IN_TEXT.has(example.id))
  .flatMap((example) =>
    [
      ...(example.savedData
        ? [{ name: example.title, savedData: example.savedData }]
        : []),
      ...(example.views ?? []),
    ].map((view) => ({ example, view }))
  );

describe("dashboard text round trip", () => {
  it.each(
    views.map(
      ({ example, view }) =>
        [`${example.id}: ${view.name}`, example, view] as const
    )
  )("%s", async (_name, example, view) => {
    const rows = await parseCsvData(
      readFileSync(join(__dirname, "../public", example.data), "utf8")
    );
    const { text, omitted } = exportDocument(view.savedData, { rows });
    // Only workspace definitions shared by ID stay out of the text.
    expect(
      omitted.filter(
        (item) => !/grouped summary|Custom chart colors/.test(item)
      )
    ).toEqual([]);
    const rebuilt = compileDocument(text, { rows });
    expect(
      rebuilt.diagnostics.filter((item) => item.effect !== "rows-missing")
    ).toEqual([]);
    expect(meaning(rebuilt.settings)).toEqual(meaning(view.savedData));
  });
});
