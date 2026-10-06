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

/** The saved view without its timestamps. */
function meaning(settings: SavedDataStructure) {
  return {
    ...settings,
    metadata: { ...settings.metadata, createdAt: "", modifiedAt: "" },
    // Generated chart IDs carry no meaning; named ones must survive.
    charts: settings.charts.map((chart) => ({
      ...chart,
      id: /^[0-9a-f]{8}-[0-9a-f-]{27}$/.test(chart.id) ? "" : chart.id,
    })),
    fieldSettings: settings.fieldSettings ?? {},
    aggregates: settings.aggregates ?? [],
    geometryAssets: settings.geometryAssets ?? [],
  };
}

const views = examples.flatMap((example) =>
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
    expect(omitted).toEqual([]);
    const rebuilt = compileDocument(text, {
      rows,
      geometryAssets: view.savedData.geometryAssets,
    });
    expect(
      rebuilt.diagnostics.filter((item) => item.effect !== "rows-missing")
    ).toEqual([]);
    expect(meaning(rebuilt.settings)).toEqual(meaning(view.savedData));
  });
});
