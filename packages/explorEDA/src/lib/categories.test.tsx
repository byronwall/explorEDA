import { ColumnFilter } from "@/components/charts/DataTable/components/ColumnFilter";
import { buildFieldProfiles } from "./fieldProfiles";
import { vi } from "vitest";
import {
  act,
  render,
  screen,
  fireEvent,
  createEvent,
  cleanup,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { useEffect } from "react";
import { registerAllCharts } from "@/charts/registerAllCharts";
import {
  DataLayerProvider,
  IdType,
  useDataLayer,
} from "@/providers/DataLayerProvider";
import { useGetAllIds } from "@/components/charts/useGetLiveData";
import { ActiveFilterStatus } from "@/components/ActiveFilterStatus";
import { RowChart } from "@/components/charts/RowChart/RowChart";
import { rowChartDefinition } from "@/components/charts/RowChart/definition";
import { BarChart } from "@/components/charts/BarChart/BarChart";
import { barChartDefinition } from "@/components/charts/BarChart/definition";
import { BarTracePanel } from "@/components/charts/BarChart/BarTracePanel";
import {
  BarTraceScope,
  useBarTraceSelection,
} from "@/components/charts/BarChart/BarTraceContext";
import { ChartTraceControl } from "@/components/charts/ChartTraceControl";
import { groupFacetData } from "@/components/charts/FacetRelated/FacetContainer";
import { categoryKey, categoryLabel } from "./categories";

beforeAll(registerAllCharts);

function FilterProbe({ chartId }: { chartId: string }) {
  const filters = useDataLayer(
    (state) => state.charts.find((item) => item.id === chartId)?.filters ?? []
  );
  const values = filters.flatMap((filter) =>
    filter.type === "value"
      ? filter.values.map((value) => typeof value + ":" + String(value))
      : []
  );
  return <div data-testid="category-filter">{values.join("|")}</div>;
}

function RangeProbe({ chartId }: { chartId: string }) {
  const ranges = useDataLayer(
    (state) =>
      state.charts
        .find((item) => item.id === chartId)
        ?.filters.filter((filter) => filter.type === "range")
        .flatMap((filter) =>
          filter.type === "range"
            ? [`${filter.field}:${filter.min}-${filter.max}`]
            : []
        )
        .join("|") ?? ""
  );
  return <div data-testid="range-filter">{ranges}</div>;
}

function CategoryChart({
  chartId,
  facetIds,
}: {
  chartId: string;
  facetIds?: IdType[];
}) {
  const settings = useDataLayer((state) =>
    state.charts.find((item) => item.id === chartId)
  );
  if (!settings || (settings.type !== "row" && settings.type !== "bar"))
    return null;
  return settings.type === "row" ? (
    <RowChart settings={settings} width={700} height={600} />
  ) : (
    <BarTraceScope>
      <BarChart
        settings={settings}
        width={700}
        height={600}
        facetIds={facetIds}
      />
      <BarTraceTestControl />
    </BarTraceScope>
  );
}

function BarTraceTestControl() {
  const trace = useBarTraceSelection()!;
  return (
    <ChartTraceControl
      selection={trace.selection}
      onClear={() => trace.select(null)}
      heading="Bar trace"
      ariaLabel="Bar trace inspector"
    >
      <BarTracePanel
        selection={trace.selection}
        onFindRow={trace.inspectRow}
        onSelect={(selection) => trace.select(selection)}
        guides={trace.guides}
      />
    </ChartTraceControl>
  );
}

it("clicks typed and missing categories without merging their rows or facet keys", () => {
  const values = [
    1,
    "1",
    true,
    "true",
    null,
    undefined,
    "a__b",
    "__proto__",
    NaN,
    Infinity,
    -Infinity,
  ];
  const data = values.map((category) => ({ category }));
  const total = values.length;
  for (const type of ["row", "bar"] as const) {
    const definition = type === "row" ? rowChartDefinition : barChartDefinition;
    const chart = {
      ...definition.createDefaultSettings(
        { x: 0, y: 0, w: 6, h: 6 },
        "category"
      ),
      forceString: true,
    };
    render(
      <DataLayerProvider data={data} charts={[chart]}>
        <ActiveFilterStatus />
        <FilterProbe chartId={chart.id} />
        <CategoryChart chartId={chart.id} />
      </DataLayerProvider>
    );
    for (const value of [
      1,
      "1",
      true,
      "true",
      null,
      NaN,
      Infinity,
      -Infinity,
    ]) {
      const expectedCount = value === null ? 2 : 1;
      fireEvent.click(
        screen.getByRole("button", {
          name: `${categoryLabel(value)}: ${expectedCount} ${type === "row" ? "rows" : "records"}`,
        })
      );
      expect(screen.getByRole("status")).toHaveTextContent(
        `Showing ${expectedCount} of ${total} rows`
      );
      expect(screen.getByTestId("category-filter")).toHaveTextContent(
        `${typeof value}:${String(value)}`
      );
      fireEvent.click(
        screen.getByRole("button", {
          name: `${categoryLabel(value)}: ${expectedCount} ${type === "row" ? "rows" : "records"}`,
        })
      );
      expect(screen.getByRole("status")).toHaveTextContent(
        `Showing ${total} of ${total} rows`
      );
      expect(screen.getByTestId("category-filter")).toHaveTextContent("");
    }
    cleanup();
  }
  const facets = groupFacetData(
    [0, 1, 2, 3, 4],
    { 0: 1, 1: "1", 2: "a__b", 3: "a", 4: "__proto__" },
    { 0: "x", 1: "x", 2: "c", 3: "b__c", 4: "" }
  );
  expect(facets).toHaveLength(5);
  expect(facets.map((facet) => facet.ids)).toEqual([[0], [1], [2], [3], [4]]);
  expect(facets.map((facet) => facet.rowRawValue)).toEqual([
    1,
    "1",
    "a__b",
    "a",
    "__proto__",
  ]);
});

it("opens a count bar trace with Alt-click and filters on a normal click", async () => {
  const chart = barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 6 },
    "category"
  );
  const data = [{ category: "A" }, { category: "A" }, { category: "B" }];

  render(
    <DataLayerProvider data={data} charts={[chart]}>
      <FilterProbe chartId={chart.id} />
      <CategoryChart chartId={chart.id} />
    </DataLayerProvider>
  );

  fireEvent.click(screen.getByRole("button", { name: "A: 2 records" }), {
    altKey: true,
  });
  const dialog = await screen.findByRole("dialog", {
    name: "Bar trace inspector",
  });
  expect(dialog).toHaveTextContent("A contributors");
  expect(dialog).toHaveTextContent("Source row ID");
  expect(dialog).toHaveTextContent("0");
  expect(dialog).toHaveTextContent("1");
  expect(dialog).toHaveTextContent("Aggregation: count");
  expect(dialog).toHaveTextContent("Fill:");

  cleanup();
  render(
    <DataLayerProvider data={data} charts={[chart]}>
      <FilterProbe chartId={chart.id} />
      <CategoryChart chartId={chart.id} />
    </DataLayerProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "A: 2 records" }));
  expect(screen.getByTestId("category-filter")).toHaveTextContent("string:A");
  cleanup();
});

it("previews a bar on hover and marks its Alt-hover target", () => {
  const chart = barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 6 },
    "category"
  );
  const view = render(
    <DataLayerProvider
      data={[{ category: "A" }, { category: "A" }]}
      charts={[chart]}
    >
      <CategoryChart chartId={chart.id} />
    </DataLayerProvider>
  );

  const bar = screen.getByRole("button", { name: "A: 2 records" });
  const svg = view.container.querySelector("svg")!;
  fireEvent.pointerMove(bar, { buttons: 0 });
  expect(screen.getByRole("status")).toHaveTextContent("Bar · A");
  const altMove = createEvent.pointerMove(bar, { buttons: 0 });
  Object.defineProperty(altMove, "altKey", { value: true });
  fireEvent(bar, altMove);
  expect(svg).toHaveAttribute("data-alt-hover", "true");
  fireEvent.pointerMove(bar, { buttons: 0, altKey: false });
  expect(svg).not.toHaveAttribute("data-alt-hover");
  cleanup();
});

it("opens a count bar trace with Alt+Enter", async () => {
  const chart = barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 6 },
    "category"
  );
  render(
    <DataLayerProvider data={[{ category: "A" }]} charts={[chart]}>
      <CategoryChart chartId={chart.id} />
    </DataLayerProvider>
  );
  fireEvent.keyDown(screen.getByRole("button", { name: "A: 1 records" }), {
    key: "Enter",
    altKey: true,
  });
  expect(
    await screen.findByRole("dialog", { name: "Bar trace inspector" })
  ).toHaveTextContent("Bar geometry");
});

it("uses the visible facet rows in a count bar trace", async () => {
  const chart = barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 6 },
    "category"
  );
  const data = [
    { facet: "left", category: "A" },
    { facet: "left", category: "A" },
    { facet: "right", category: "A" },
    { facet: "right", category: "B" },
  ];

  render(
    <DataLayerProvider data={data} charts={[chart]}>
      <CategoryChart chartId={chart.id} facetIds={[0, 1]} />
    </DataLayerProvider>
  );

  fireEvent.click(screen.getByRole("button", { name: "A: 2 records" }), {
    altKey: true,
  });
  const dialog = await screen.findByRole("dialog", {
    name: "Bar trace inspector",
  });
  expect(dialog).toHaveTextContent("Exact result: 2");
  expect(dialog).toHaveTextContent("Contributors: 2 of 2");
  expect(
    within(dialog)
      .getAllByRole("row")
      .slice(1)
      .map((row) => within(row).getAllByRole("cell")[0]?.textContent)
  ).toEqual(["0", "1"]);
  cleanup();
});

it("traces a bar zero baseline with Alt-click without changing filters", async () => {
  const chart = barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 6 },
    "category"
  );
  render(
    <DataLayerProvider
      data={[{ category: "A" }, { category: "B" }]}
      charts={[chart]}
    >
      <FilterProbe chartId={chart.id} />
      <CategoryChart chartId={chart.id} />
    </DataLayerProvider>
  );

  fireEvent.click(screen.getByRole("button", { name: "Zero baseline" }), {
    altKey: true,
  });
  const popover = await screen.findByRole("dialog", {
    name: "Bar trace inspector",
  });
  expect(popover).toHaveTextContent("Object: zero");
  expect(popover).toHaveTextContent("Zero baseline");
  expect(screen.getByTestId("category-filter")).toHaveTextContent("");
});

it("keeps a numeric bin range filter when Alt-clicking a bar", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 6 },
      "value"
    ),
    filters: [{ type: "range" as const, field: "value", min: 1, max: 2 }],
  };
  const view = render(
    <DataLayerProvider data={[{ value: 1 }, { value: 2 }]} charts={[chart]}>
      <RangeProbe chartId={chart.id} />
      <CategoryChart chartId={chart.id} />
    </DataLayerProvider>
  );

  const bar = screen
    .getAllByRole("button")
    .find((element) => element.classList.contains("chart-mark"));
  expect(bar).toBeTruthy();
  const brushTarget = view.container.querySelector(".eda-brush rect");
  expect(brushTarget).toBeTruthy();
  const svg = view.container.querySelector("svg");
  expect(svg).toBeTruthy();
  const barX = Number(bar!.getAttribute("x"));
  const barY = Number(bar!.getAttribute("y"));
  fireEvent.pointerDown(brushTarget!, {
    altKey: true,
    button: 0,
    clientX: 100,
    clientY: 100,
  });
  fireEvent.pointerUp(svg!, {
    altKey: true,
    button: 0,
    clientX: 60 + barX + 1,
    clientY: 20 + barY + 1,
  });
  fireEvent.click(svg!, {
    altKey: true,
    clientX: 60 + barX + 1,
    clientY: 20 + barY + 1,
  });
  expect(
    await screen.findByRole("dialog", { name: "Bar trace inspector" })
  ).toHaveTextContent("Bin interval");
  expect(screen.getByTestId("range-filter")).toHaveTextContent("value:1-2");
});

it("finds only live numeric source rows and uses half-open bins", async () => {
  const chart = barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 6 },
    "value"
  );
  render(
    <DataLayerProvider data={[{ value: 1 }, { value: 9 }]} charts={[chart]}>
      <CategoryChart chartId={chart.id} facetIds={[0]} />
    </DataLayerProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Trace chart objects" }));
  const input = screen.getByLabelText("Source row ID");
  fireEvent.change(input, { target: { value: "1" } });
  fireEvent.submit(input.closest("form")!);
  expect(screen.getByRole("status")).toHaveTextContent("outside the visible bars");
  fireEvent.change(input, { target: { value: "0" } });
  fireEvent.submit(input.closest("form")!);
  expect(
    await screen.findByRole("dialog", { name: "Bar trace inspector" })
  ).toHaveTextContent("Bin interval");
});

it("uses facet-local contributors for grouped aggregate bars", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 6 },
      "region"
    ),
    aggregateId: "sales",
  };
  render(
    <DataLayerProvider
      data={[
        { region: "A", value: 10 },
        { region: "A", value: 20 },
        { region: "B", value: 5 },
      ]}
      savedData={{
        charts: [chart],
        aggregates: [
          {
            id: "sales",
            name: "Sum value by region",
            groupField: "region",
            measureField: "value",
            aggregation: "sum",
          },
        ],
        calculations: [],
        gridSettings: {
          columnCount: 12,
          rowHeight: 100,
          containerPadding: 10,
          showBackgroundMarkers: true,
        },
        metadata: {
          name: "Test",
          version: 1,
          createdAt: "2025-01-01T00:00:00.000Z",
          modifiedAt: "2025-01-01T00:00:00.000Z",
        },
        colorScales: [],
      }}
    >
      <CategoryChart chartId={chart.id} facetIds={[0, 2]} />
    </DataLayerProvider>
  );

  fireEvent.click(screen.getByRole("button", { name: "A: 10" }), {
    altKey: true,
  });
  const popover = await screen.findByRole("dialog", {
    name: "Bar trace inspector",
  });
  expect(popover).toHaveTextContent("Exact result: 10");
  expect(popover).toHaveTextContent("Source row ID");
  expect(within(popover).getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
    "0",
    "10",
    "10",
    "number",
    "Yes",
  ]);
});

it("keeps mixed types in table category options", () => {
  const profile = buildFieldProfiles([
    { value: 1 },
    { value: "1" },
    { value: true },
    { value: "true" },
    { value: "__proto__" },
  ])[0]!;
  const onChange = vi.fn();
  render(
    <ColumnFilter
      columnId="value"
      columnLabel="value"
      profile={profile}
      onChange={onChange}
      onClear={() => {}}
    />
  );
  fireEvent.click(screen.getByRole("checkbox", { name: '"1"' }));
  expect(onChange).toHaveBeenLastCalledWith("value", {
    type: "value",
    field: "value",
    values: ["1"],
  });
  fireEvent.click(screen.getByRole("checkbox", { name: "1" }));
  expect(onChange).toHaveBeenLastCalledWith("value", {
    type: "value",
    field: "value",
    values: [1],
  });
});

it("keeps row bars separate when display precision makes labels equal", async () => {
  const chart = rowChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 6 },
    "category"
  );
  function ApplyDisplayFormat() {
    const updateFieldSettings = useDataLayer(
      (state) => state.updateFieldSettings
    );
    useEffect(() => {
      updateFieldSettings("category", { format: "number", precision: 0 });
    }, [updateFieldSettings]);
    return null;
  }

  render(
    <DataLayerProvider
      data={[{ category: 1.1 }, { category: 1.2 }]}
      charts={[chart]}
    >
      <ApplyDisplayFormat />
      <CategoryChart chartId={chart.id} />
    </DataLayerProvider>
  );

  await waitFor(() => {
    expect(screen.getAllByRole("button", { name: "1: 1 rows" })).toHaveLength(
      2
    );
  });
  cleanup();
});

it("keeps non-finite categories distinct", () => {
  expect(new Set([NaN, Infinity, -Infinity].map(categoryKey)).size).toBe(3);
});

it("refreshes facet IDs and groups when the provider data changes size", () => {
  let replaceData!: (rows: { category: string }[]) => void;
  function Probe() {
    const ids = useGetAllIds();
    const getColumnData = useDataLayer((state) => state.getColumnData);
    replaceData = useDataLayer((state) => state.setData);
    const groups = groupFacetData(ids, getColumnData("category"), null);
    return (
      <>
        <output data-testid="facet-ids">{ids.join(",")}</output>
        <output data-testid="facet-groups">
          {groups.map((group) => group.rowValue).join(",")}
        </output>
      </>
    );
  }

  render(
    <DataLayerProvider data={[{ category: "A" }, { category: "B" }]}>
      <Probe />
    </DataLayerProvider>
  );
  expect(screen.getByTestId("facet-ids")).toHaveTextContent("0,1");
  expect(screen.getByTestId("facet-groups")).toHaveTextContent("A,B");

  act(() =>
    replaceData([{ category: "A" }, { category: "B" }, { category: "C" }])
  );
  expect(screen.getByTestId("facet-ids")).toHaveTextContent("0,1,2");
  expect(screen.getByTestId("facet-groups")).toHaveTextContent("A,B,C");

  act(() => replaceData([{ category: "Z" }]));
  expect(screen.getByTestId("facet-ids")).toHaveTextContent("0");
  expect(screen.getByTestId("facet-groups")).toHaveTextContent("Z");
  cleanup();
});
