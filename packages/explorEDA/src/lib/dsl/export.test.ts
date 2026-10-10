import { beforeAll, describe, expect, it } from "vitest";
import { getChartDefinition } from "@/charts/registry";
import { registerAllCharts } from "@/charts/registerAllCharts";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import type { SavedChartSettings } from "@/types/SavedDataTypes";
import { compileDocument } from "./compile";
import { exportDocument } from "./export";

const rows = [
  {
    "Order Date": "2024-01-02",
    Revenue: 100,
    Cost: 60,
    Channel: "Web",
    Units: 3,
  },
  {
    "Order Date": "2024-02-11",
    Revenue: 50,
    Cost: 60,
    Channel: "Store, Mall",
    Units: 1,
  },
  {
    "Order Date": "2024-03-05",
    Revenue: 75,
    Cost: null,
    Channel: null,
    Units: 2,
  },
];

/** A dashboard without IDs or timestamps, to compare what users see. */
function meaning(settings: SavedDataStructure) {
  const scaleField = new Map(
    settings.colorScales.map((scale) => [scale.id, scale.sourceField])
  );
  return {
    ...settings,
    metadata: { ...settings.metadata, createdAt: "", modifiedAt: "" },
    colorScales: settings.colorScales.map((scale) => ({ ...scale, id: "" })),
    charts: settings.charts.map((chart) => ({
      ...chart,
      id: /^[0-9a-f-]{36}$/.test(chart.id) ? "" : chart.id,
      colorScaleId: chart.colorScaleId && scaleField.get(chart.colorScaleId),
    })),
  };
}

function roundTrip(settings: SavedDataStructure) {
  const { text, omitted } = exportDocument(settings, { rows });
  const rebuilt = compileDocument(text, { rows });
  return { text, omitted, rebuilt };
}

beforeAll(() => registerAllCharts());

describe("exportDocument", () => {
  it("writes each workspace filter as its own filter line and rebuilds it", () => {
    const start = compileDocument(
      `filter Channel=Web,null
filter "Order Date"=2024-01-01..2024-02-28
filter Units=2..
filter Channel.contains=mall
bar Channel`,
      { rows }
    );
    expect(
      start.diagnostics.map((item) => [item.severity, item.message])
    ).toEqual([
      [
        "warning",
        "Channel already has a filter, so this one replaces it. A field has one workspace filter.",
      ],
    ]);
    expect(start.settings.workspaceFilters).toEqual([
      { type: "text", field: "Channel", operator: "contains", value: "mall" },
      {
        type: "date-range",
        field: "Order Date",
        min: "2024-01-01",
        max: "2024-02-28",
      },
      { type: "range", field: "Units", min: 2 },
    ]);

    const { text, omitted, rebuilt } = roundTrip(start.settings);
    expect(omitted).toEqual([]);
    expect(text).toContain('filter Channel.contains="mall"');
    expect(text).toContain('filter "Order Date"=2024-01-01..2024-02-28');
    expect(text).toContain("filter Units=2..");
    expect(rebuilt.diagnostics).toEqual([]);
    expect(rebuilt.settings.workspaceFilters).toEqual(
      start.settings.workspaceFilters
    );
  });

  it("writes value filters and leaves out workspace filters it cannot say", () => {
    const settings = compileDocument("bar Channel", { rows }).settings;
    const { text, rebuilt } = roundTrip({
      ...settings,
      workspaceFilters: [
        { type: "value", field: "Channel", values: ["Store, Mall", null] },
      ],
    });
    expect(text).toContain('filter Channel="Store, Mall",null');
    expect(rebuilt.settings.workspaceFilters).toEqual([
      { type: "value", field: "Channel", values: ["Store, Mall", null] },
    ]);
    const blank = exportDocument(
      {
        ...settings,
        workspaceFilters: [{ type: "value", field: "Channel", values: [""] }],
      },
      { rows }
    );
    expect(blank.text).not.toContain("filter ");
    expect(blank.omitted).toEqual([
      "filter Channel: its values have no text form, such as a blank value",
    ]);
  });

  it("drops workspace filters when the text has no filter line", () => {
    expect(
      compileDocument("bar Channel", { rows }).settings
    ).not.toHaveProperty("workspaceFilters");
  });

  it("rebuilds a dashboard after edits in the normal controls", () => {
    const start = compileDocument(
      `dashboard name="Orders"
grid rowHeight=80
field "Order Date" label="Ordered" as=date
calc margin=(Revenue-Cost)/Revenue
calc "Net revenue"=Revenue-Cost
field margin format=percent precision=1
scatter @fit x=Revenue y=margin color=Channel where."Order Date"=2024-01-01..2024-02-28
+ regression=polynomial regression.degree=2
row Channel where.Channel="Store, Mall",null
metric avg=Revenue select.Units=2..
table Revenue,Cost,"Net revenue"`,
      { rows }
    );
    // Row 3 has no Cost, so only its formula results are missing.
    expect(start.diagnostics.map((item) => item.effect)).toEqual([
      "rows-missing",
      "rows-missing",
    ]);

    // Edits the way the settings panels make them.
    const edited = structuredClone(start.settings);
    const [scatter, row, , table] = edited.charts as SavedChartSettings[];
    Object.assign(scatter!, {
      title: "Margin by revenue",
      facet: {
        enabled: true,
        type: "wrap",
        rowVariable: "Channel",
        columnCount: 3,
        visibleFacetIds: [],
      },
      xAxis: { ...scatter!.xAxis, scaleType: "log", title: "" },
      display: "hexbin",
      hexbin: { columns: 18, showPoints: true },
      pointSize: 4.5,
      regression: undefined,
    });
    Object.assign(row!, {
      maxRowHeight: 64,
      filters: [{ type: "value", field: "Units", values: [3, 1] }],
    });
    Object.assign(table!, {
      columns: [
        { id: "Revenue", field: "Revenue", width: 140 },
        { id: "Net revenue", field: "Net revenue" },
      ],
      sortBy: "Revenue",
      sortDirection: "desc",
      showDistributions: false,
    });
    edited.charts.push({
      ...getChartDefinition("boxplot").createDefaultSettings(
        { x: 0, y: 20, w: 6, h: 4 },
        "Revenue"
      ),
      colorField: undefined,
      showOutliers: false,
    } as never);

    const { text, omitted, rebuilt } = roundTrip(edited);
    expect(omitted).toEqual([]);
    expect(rebuilt.diagnostics.map((item) => item.effect)).toEqual([
      "rows-missing",
      "rows-missing",
    ]);
    expect(meaning(rebuilt.settings)).toEqual(meaning(edited));
    // Readable text, no JSON blocks: every line is a declaration or a + line.
    expect(text).not.toMatch(/[{[]\s*"|^\s*[{[]/m);
    expect(text).toContain(
      "scatter x=Revenue y=margin @fit at=0,0,6,4 color=Channel"
    );
    expect(text).toContain("columns.0.width=140");
  });

  it("carries the workspace theme and chart subtitles and notes", () => {
    const start = compileDocument(
      `dashboard name="Orders"
theme name=newsprint
scatter x=Revenue y=Units title="Bigger orders earn more" subtitle="Revenue by units, 2024" note="Source: orders export" style.titleSize=26 style.titleWeight=700`,
      { rows }
    );
    expect(start.diagnostics).toEqual([]);
    expect(start.settings.theme).toEqual({ id: "newsprint" });
    const [scatter] = start.settings.charts;
    expect(scatter).toMatchObject({
      subtitle: "Revenue by units, 2024",
      note: "Source: orders export",
      style: { titleSize: 26, titleWeight: 700 },
    });

    const { text, rebuilt } = roundTrip(start.settings);
    expect(text).toContain("theme name=newsprint");
    expect(meaning(rebuilt.settings)).toEqual(meaning(start.settings));
  });

  it("reads the Report theme", () => {
    const { settings, diagnostics } = compileDocument(
      `dashboard name="Orders"
theme name=report`,
      { rows }
    );
    expect(diagnostics).toEqual([]);
    expect(settings.theme).toEqual({ id: "report" });
  });

  it("keeps Compact for an unknown theme and says so", () => {
    const { settings, diagnostics } = compileDocument(
      `dashboard name="Orders"
theme name=newsprnt`,
      { rows }
    );
    expect(settings.theme).toBeUndefined();
    expect(diagnostics[0]).toMatchObject({
      effect: "setting-default",
      suggestion: "Did you mean newsprint?",
    });
  });

  it("carries custom colors, grouped summaries, and the Rows view", () => {
    const { settings } = compileDocument(
      `scale @channels field=Channel
group @byChannel groupField=Channel aggregation=sum measureField=Revenue
bar Channel aggregateId=byChannel color=Channel
rows sortBy=Revenue sortDirection=desc where.Units=2..`,
      { rows }
    );
    settings.colorScales[0] = {
      ...settings.colorScales[0]!,
      mapping: [["Web", "#000000"]],
    } as never;
    settings.rowsSettings!.columns[0]!.width = 90;

    const { text, omitted, rebuilt } = roundTrip(settings);
    expect(omitted).toEqual([]);
    expect(text).toContain('mapping.0[]=Web,"#000000"');
    expect(rebuilt.settings.colorScales).toEqual(settings.colorScales);
    expect(rebuilt.settings.aggregates).toEqual(settings.aggregates);
    expect(rebuilt.settings.rowsSettings).toEqual(settings.rowsSettings);
    expect(rebuilt.settings.charts[0]).toMatchObject({
      aggregateId: "byChannel",
      colorScaleId: "channels",
    });
  });

  it("carries once-per IDs on grouped summaries and metric cards", () => {
    const { settings, diagnostics } = compileDocument(
      `group @channels groupField=Channel aggregation=count entityField=Units
bar Channel aggregateId=channels
metric sum=Revenue entityField=Channel`,
      { rows }
    );
    expect(diagnostics).toEqual([]);
    expect(settings.aggregates?.[0]?.entityField).toBe("Units");
    expect(settings.charts[1]).toMatchObject({ entityField: "Channel" });

    const { omitted, rebuilt } = roundTrip(settings);
    expect(omitted).toEqual([]);
    expect(rebuilt.settings.aggregates).toEqual(settings.aggregates);
    expect(rebuilt.settings.charts[1]).toMatchObject({
      entityField: "Channel",
    });
  });
});
