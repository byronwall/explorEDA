import { beforeAll, describe, expect, it } from "vitest";
import { getChartDefinition } from "@/charts/registry";
import { registerAllCharts } from "@/charts/registerAllCharts";
import type { ChartSettings, datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { countRows, findRecoveryOptions } from "./recoverRows";

const rows: Record<string, datum>[] = [
  { id: "A", region: "West", channel: "Web", amount: 5 },
  { id: "B", region: "West", channel: "Store", amount: 15 },
  { id: "C", region: "East", channel: "Web", amount: 25 },
  { id: "D", region: "East", channel: "Store", amount: 35 },
];
const ids = rows.map((_, index) => index);
const fieldGetter = (field: string) =>
  Object.fromEntries(rows.map((row, index) => [index, row[field]]));

function chart(
  id: string,
  filters: Filter[],
  type: ChartSettings["type"] = "row"
): ChartSettings {
  const definition = getChartDefinition(type);
  return {
    ...definition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }, "region"),
    id,
    title: id,
    filters,
  } as ChartSettings;
}

function returned(options: ReturnType<typeof findRecoveryOptions>) {
  return Object.fromEntries(
    options.map((option) => [
      option.key,
      option.ids.map((id) => rows[id as number]?.id),
    ])
  );
}

beforeAll(() => registerAllCharts());

describe("findRecoveryOptions", () => {
  it("returns the exact rows each single removal brings back", () => {
    const options = findRecoveryOptions({
      ids,
      charts: [
        chart("regions", [
          { type: "value", field: "region", values: ["East"] },
        ]),
      ],
      workspaceFilters: [{ type: "value", field: "region", values: ["West"] }],
      fieldGetter,
    });
    expect(returned(options)).toEqual({
      "workspace:region": ["C", "D"],
      "chart:regions:0": ["A", "B"],
    });
  });

  it("keeps a chart's other filters when one is removed", () => {
    const options = findRecoveryOptions({
      ids,
      charts: [
        chart(
          "brush",
          [
            { type: "range", field: "amount", min: 0, max: 20 },
            { type: "value", field: "channel", values: ["Web"] },
          ],
          "data-table"
        ),
      ],
      workspaceFilters: [{ type: "value", field: "region", values: ["East"] }],
      fieldGetter,
    });
    // Dropping the range keeps Web, so only C returns; D is Store.
    expect(returned(options)).toEqual({
      "workspace:region": ["A"],
      "chart:brush:0": ["C"],
      "chart:brush:1": [],
    });
  });

  it("offers nothing when every single removal stays empty", () => {
    const options = findRecoveryOptions({
      ids,
      charts: [
        chart("one", [{ type: "value", field: "region", values: ["East"] }]),
        chart("two", [{ type: "value", field: "region", values: ["North"] }]),
      ],
      workspaceFilters: [{ type: "value", field: "region", values: ["West"] }],
      fieldGetter,
    });
    expect(options).toHaveLength(3);
    expect(options.every((option) => option.ids.length === 0)).toBe(true);
  });

  it("counts the Rows table: removing search, a Rows filter, or a workspace filter", () => {
    // A calculated field only the Rows table resolves.
    const label = (id: number) => `${rows[id]?.region}-${rows[id]?.channel}`;
    const options = findRecoveryOptions({
      ids,
      charts: [],
      workspaceFilters: [{ type: "value", field: "region", values: ["West"] }],
      fieldGetter,
      rows: {
        filters: [{ type: "value", field: "channel", values: ["Store"] }],
        search: "WEST-WEB",
        row: (id) => ({
          __ID: id,
          ...rows[id as number],
          label: label(id as number),
        }),
      },
    });
    expect(returned(options)).toEqual({
      // The search matches only A, which the Store filter rules out.
      "workspace:region": [],
      "rows:0": ["A"],
      "rows:search": ["B"],
    });
  });

  it("ignores chart selections when selections stay local", () => {
    const options = findRecoveryOptions({
      ids,
      charts: [
        chart("regions", [
          { type: "value", field: "region", values: ["East"] },
        ]),
      ],
      workspaceFilters: [{ type: "value", field: "region", values: ["North"] }],
      fieldGetter,
      localSelections: true,
    });
    expect(returned(options)).toEqual({
      "workspace:region": ["A", "B", "C", "D"],
    });
  });

  it("counts Rows after the workspace's own rows", () => {
    expect(
      countRows(
        [0, 1],
        {
          filters: [],
          search: "store",
          row: (id) => ({ __ID: id, ...rows[id as number] }),
        },
        fieldGetter
      )
    ).toBe(1);
  });
});
