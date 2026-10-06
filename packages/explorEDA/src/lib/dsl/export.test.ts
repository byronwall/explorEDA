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
      hexbin: { columns: 18, showPoints: false },
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
});
