import { act, fireEvent, render, screen } from "@testing-library/react";
import { useMemo } from "react";
import { expect, it } from "vitest";
import { scatterPlotDefinition } from "../ScatterPlot/definition";
import { planScatter, type ScatterPlan } from "../ScatterPlot/scatterPlan";
import { findScatterTraceRow } from "../ScatterPlot/scatterTrace";
import {
  ChartTraceScope,
  useChartTrace,
  useChartTraceApi,
  useTraceSource,
} from "./ChartTraceScope";
import type { TraceSource } from "./traceTypes";

const settings = scatterPlotDefinition.createDefaultSettings({
  x: 0,
  y: 0,
  w: 4,
  h: 4,
});
settings.xField = "x";
settings.yField = "y";
const snapshot = {
  revision: "one",
  allIds: [1, 2],
  chartIds: [1, 2],
  filteredIds: [1, 2],
  xData: { 1: 10, 2: 20 },
  yData: { 1: 30, 2: 40 },
  colorData: {},
  fieldSettings: {},
};

function Facet({ owner, plan }: { owner: string; plan: ScatterPlan }) {
  const source = useMemo(
    (): TraceSource => ({
      role: "chart",
      revision: plan.revision,
      resolve: (kind, id) => {
        const point = plan.points.find((item) => item.id === id);
        return kind === "point" && point
          ? ({ kind: "title", id, revision: plan.revision, text: `x ${point.x}`, source: "chart-setting" } as const)
          : undefined;
      },
      findRow: (id) => findScatterTraceRow(plan, id),
    }),
    [plan]
  );
  useTraceSource(owner, source);
  return null;
}

function Pending({ onFind }: { onFind: () => void }) {
  const source = useMemo(
    (): TraceSource => ({
      role: "facets",
      revision: "one",
      resolve: () => undefined,
      findRow: (id) => {
        if (id !== 9) return undefined;
        onFind();
        return "pending";
      },
    }),
    [onFind]
  );
  useTraceSource("facets", source);
  return null;
}

function Controls() {
  const trace = useChartTrace()!;
  const api = useChartTraceApi()!;
  return (
    <>
      <button onClick={() => api.findRow(2)}>Find row 2</button>
      <button onClick={() => api.findRow(9)}>Find row 9</button>
      <output>
        {`${trace.selection?.owner ?? "none"}:${trace.selection?.kind ?? "none"}:${trace.trace && "text" in trace.trace ? trace.trace.text : "none"}`}
      </output>
    </>
  );
}

function Scene({
  first,
  second,
  onFind = () => {},
}: {
  first: ScatterPlan;
  second: ScatterPlan;
  onFind?: () => void;
}) {
  return (
    <ChartTraceScope>
      <Facet owner="first" plan={first} />
      <Facet owner="second" plan={second} />
      <Pending onFind={onFind} />
      <Controls />
    </ChartTraceScope>
  );
}

it("routes a row to the chart that draws it and re-resolves against the current plan", () => {
  const first = planScatter(settings, { ...snapshot, facetIds: [1] }, 400, 300);
  const second = planScatter(settings, { ...snapshot, facetIds: [2] }, 400, 300);
  const view = render(<Scene first={first} second={second} />);
  fireEvent.click(screen.getByText("Find row 2"));
  const point = second.points[0]!;
  expect(screen.getByRole("status")).toHaveTextContent(
    `second:point:x ${point.x}`
  );

  // A resize keeps the revision, so the selection stays and shows the new geometry.
  const wider = planScatter(settings, { ...snapshot, facetIds: [2] }, 600, 300);
  view.rerender(<Scene first={first} second={wider} />);
  expect(screen.getByRole("status")).toHaveTextContent(
    `second:point:x ${wider.points[0]!.x}`
  );
});

it("clears a selection when the data revision changes", () => {
  const first = planScatter(settings, { ...snapshot, facetIds: [1] }, 400, 300);
  const second = planScatter(settings, { ...snapshot, facetIds: [2] }, 400, 300);
  const view = render(<Scene first={first} second={second} />);
  fireEvent.click(screen.getByText("Find row 2"));
  expect(screen.getByRole("status")).toHaveTextContent("second:point");
  const edited = planScatter(
    settings,
    { ...snapshot, revision: "two", facetIds: [2] },
    400,
    300
  );
  act(() => view.rerender(<Scene first={first} second={edited} />));
  expect(screen.getByRole("status")).toHaveTextContent("none:none:none");
});

it("lets a facet source open a hidden row after the charts miss it", () => {
  const first = planScatter(settings, { ...snapshot, facetIds: [1] }, 400, 300);
  const second = planScatter(settings, { ...snapshot, facetIds: [2] }, 400, 300);
  let opened = 0;
  render(
    <Scene first={first} second={second} onFind={() => (opened += 1)} />
  );
  fireEvent.click(screen.getByText("Find row 9"));
  expect(opened).toBe(1);
  expect(screen.getByRole("status")).toHaveTextContent("none:none");
});
