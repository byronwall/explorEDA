import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  compileDocument,
  compileViews,
  exportDocument,
  exportViews,
  normalizeDashboard,
  type SavedDataStructure,
} from "exploreda";
import { evaluateAnalysisQuery } from "exploreda/analysis";
import { parseCsvData } from "./csvParser";
import { examples } from "./demos/examples";

const GENERATED_ID = /^[0-9a-f]{8}-[0-9a-f-]{27}$/;

/**
 * Text names every chart. A chart saved with a generated ID comes back under
 * its text name, so compare it by position under the saved ID.
 */
function withSavedIds(
  rebuilt: SavedDataStructure,
  saved: SavedDataStructure
): SavedDataStructure {
  return {
    ...rebuilt,
    charts: rebuilt.charts.map((chart, index) => {
      const id = saved.charts[index]?.id;
      return id && GENERATED_ID.test(id) ? { ...chart, id } : chart;
    }),
  };
}

/**
 * The saved view without its timestamps. Charts compare in normalized form:
 * a setting left out draws as its default, so text leaves it out too.
 */
function meaning(saved: SavedDataStructure) {
  const settings = normalizeDashboard(saved);
  return {
    ...settings,
    metadata: { ...settings.metadata, createdAt: "", modifiedAt: "" },
    // Generated chart IDs carry no meaning; named ones must survive.
    charts: settings.charts.map((chart) => ({
      ...chart,
      id: GENERATED_ID.test(chart.id) ? "" : chart.id,
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
    // A project view's rows are its query result.
    const rows =
      example.project && example.tables
        ? evaluateAnalysisQuery(
            example.project,
            example.tables,
            ("queryId" in view && view.queryId) ||
              example.project.queries[0]!.id,
            ("bindings" in view && view.bindings) || {}
          ).rows.map((row) => row.data)
        : await parseCsvData(
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
    expect(meaning(withSavedIds(rebuilt.settings, view.savedData))).toEqual(
      meaning(view.savedData)
    );
  });
});

describe("all views as one text", () => {
  // Project views each chart their own query, so only file examples share rows.
  const withViews = examples.filter(
    (example) => !example.project && example.savedData && example.views?.length
  );
  it.each(withViews.map((example) => [example.id, example] as const))(
    "%s",
    async (_id, example) => {
      const rows = await parseCsvData(
        readFileSync(join(__dirname, "../public", example.data), "utf8")
      );
      const tabs = [
        { name: example.title, settings: example.savedData! },
        ...example.views!.map((view) => ({
          name: view.name,
          settings: view.savedData,
        })),
      ];
      const { text, omitted } = exportViews(tabs, { rows });
      expect(omitted).toEqual([]);
      const rebuilt = compileViews(text, {
        rows,
        geometryAssets: example.savedData!.geometryAssets,
      });
      expect(
        rebuilt.diagnostics.filter((item) => item.effect !== "rows-missing")
      ).toEqual([]);
      expect(rebuilt.views.map((view) => view.name)).toEqual(
        tabs.map((tab) => tab.name)
      );
      expect(
        rebuilt.views.map((view, index) =>
          meaning(withSavedIds(view.settings, tabs[index]!.settings))
        )
      ).toEqual(tabs.map((tab) => meaning(tab.settings)));
    }
  );
});
