import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { ChartSpecPanel } from "../ChartSpecPanel";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { barChartDefinition } from "@/components/charts/BarChart/definition";
import { colorLegendDefinition } from "@/components/charts/ColorLegend/definition";
import { summaryTableDefinition } from "@/components/charts/SummaryTable/definition";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import type { ColorScaleType } from "@/types/ColorScaleTypes";

beforeAll(registerAllCharts);

const isReference =
  (text: string) => (_content: string, element: Element | null) =>
    element?.tagName === "SUMMARY" &&
    element.textContent?.replace(/\s+/g, " ").trim() === text;

/** A reference's one-line summary, such as "Calculation: double". */
const reference = (text: string) => screen.getByText(isReference(text));
const queryReference = (text: string) => screen.queryByText(isReference(text));

function Setup() {
  const addCalculation = useDataLayer((state) => state.addCalculation);
  const addColorScale = useDataLayer((state) => state.addColorScale);
  const updateChart = useDataLayer((state) => state.updateChart);
  const updateChartLayouts = useDataLayer((state) => state.updateChartLayouts);
  const chart = useDataLayer((state) => state.charts[0]!);

  return (
    <>
      <button
        onClick={async () => {
          await addCalculation({
            resultColumnName: "double",
            expression: parseExpression("value * 2"),
          });
          updateChart(chart.id, { field: "double" });
        }}
      >
        Use calculation
      </button>
      <button
        onClick={() => {
          const scale = addColorScale({
            type: "categorical",
            name: "Group colors",
            sourceField: "group",
            palette: ["#123456"],
            mapping: new Map([["A", "#123456"]]),
          } as Omit<ColorScaleType, "id">);
          updateChart(chart.id, {
            colorField: "group",
            colorScaleId: scale.id,
          });
        }}
      >
        Use color scale
      </button>
      <button
        onClick={() =>
          updateChartLayouts({ [chart.id]: { ...chart.layout, x: 3, y: 4 } })
        }
      >
        Move chart
      </button>
      <ChartSpecPanel />
    </>
  );
}

it("shows current chart layout and expands the definitions used by its fields", async () => {
  const chart = barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 4 },
    "value"
  );
  chart.title = "Revenue by group";
  render(
    <DataLayerProvider data={[{ value: 1, group: "A" }]} charts={[chart]}>
      <Setup />
    </DataLayerProvider>
  );

  expect(
    within(screen.getByRole("navigation", { name: "Charts" })).getByRole(
      "button",
      {
        name: /Revenue by group/,
      }
    )
  ).toHaveTextContent("x 0 · y 0 · 6 × 4");
  fireEvent.click(screen.getByRole("button", { name: "Use calculation" }));
  expect(await screen.findByText("value * 2")).toBeInTheDocument();
  fireEvent.click(reference("Calculation: double"));
  expect(screen.getByText("Dependencies")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Use color scale" }));
  await screen.findByText("Group colors");
  fireEvent.click(reference("Color scale: Group colors"));
  expect(screen.getByText("#123456")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Move chart" }));
  expect(
    within(screen.getByRole("navigation", { name: "Charts" })).getByRole(
      "button",
      {
        name: /Revenue by group/,
      }
    )
  ).toHaveTextContent("x 3 · y 4 · 6 × 4");
});

it("makes unavailable explicit references understandable", () => {
  const chart = barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 4 },
    "missing-field"
  );
  chart.colorScaleId = "removed-scale";
  chart.aggregateId = "removed-summary";
  render(
    <DataLayerProvider data={[{ value: 1 }]} charts={[chart]}>
      <ChartSpecPanel />
    </DataLayerProvider>
  );

  expect(reference("Missing field: missing-field")).toBeInTheDocument();
  expect(reference("Grouped summary: removed-summary")).toBeInTheDocument();
  fireEvent.click(reference("Color scale: removed-scale"));
  expect(screen.getAllByText(/definition that is not available/)).toHaveLength(
    3
  );
});

function ReferenceBranches() {
  const charts = useDataLayer((state) => state.charts);
  const addCalculation = useDataLayer((state) => state.addCalculation);
  const addAggregate = useDataLayer((state) => state.addAggregate);
  const addColorScale = useDataLayer((state) => state.addColorScale);
  const updateChart = useDataLayer((state) => state.updateChart);
  const bar = charts.find((chart) => chart.type === "bar")!;
  const legend = charts.find((chart) => chart.type === "color-legend")!;

  return (
    <>
      <button
        onClick={async () => {
          await addCalculation({
            resultColumnName: "double",
            expression: parseExpression("value * 2"),
          });
          await addCalculation({
            resultColumnName: "quad",
            expression: parseExpression("double * 2"),
          });
          const aggregate = addAggregate({
            name: "Revenue total",
            groupField: "group",
            measureField: "quad",
            aggregation: "sum",
          });
          updateChart(bar.id, {
            field: "quad",
            aggregateId: aggregate.id,
            facet: {
              enabled: true,
              type: "wrap",
              rowVariable: "double",
              columnCount: 2,
            },
            filters: [{ type: "range", field: "double", min: 0 }],
          });
          for (const [field, name] of [
            ["group", "group colors"],
            ["group", "alternate group colors"],
            ["segment", "segment colors"],
            ["unused", "unused colors"],
          ]) {
            addColorScale({
              type: "categorical",
              name,
              sourceField: field,
              palette: ["#123456"],
              mapping: new Map([["A", "#123456"]]),
            } as Omit<ColorScaleType, "id">);
          }
          updateChart(legend.id, {
            title: "Groups and segments",
            fields: ["group", "segment"],
          });
        }}
      >
        Build reference branches
      </button>
      <ChartSpecPanel />
    </>
  );
}

it("resolves calculated facet and aggregate fields plus implicit legend scales", async () => {
  const bar = barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 4 },
    "value"
  );
  const legend = colorLegendDefinition.createDefaultSettings(
    { x: 6, y: 0, w: 6, h: 4 },
    "group"
  );
  const summary = summaryTableDefinition.createDefaultSettings({
    x: 0,
    y: 4,
    w: 6,
    h: 4,
  });
  render(
    <DataLayerProvider
      data={[{ value: 1, group: "A", segment: "B", unused: "C" }]}
      charts={[bar, legend, summary]}
    >
      <ReferenceBranches />
    </DataLayerProvider>
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Build reference branches" })
  );
  await screen.findByText("quad", { selector: "summary span" });
  expect(reference("Calculation: quad")).toBeInTheDocument();
  expect(reference("Calculation: double")).toBeInTheDocument();
  expect(reference("Grouped summary: Revenue total")).toBeInTheDocument();
  expect(screen.getByText("Row Variable")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /Groups and segments/ }));
  expect(reference("Color scale: group colors")).toBeInTheDocument();
  expect(reference("Color scale: segment colors")).toBeInTheDocument();
  expect(
    queryReference("Color scale: alternate group colors")
  ).not.toBeInTheDocument();
  expect(queryReference("Color scale: unused colors")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /Summary Table/ }));
  expect(reference("Calculation: quad")).toBeInTheDocument();
  const fields = within(screen.getByRole("region", { name: "Fields" }));
  for (const field of ["value", "group", "segment", "unused", "double", "quad"])
    expect(fields.getByText(field)).toBeInTheDocument();
});
