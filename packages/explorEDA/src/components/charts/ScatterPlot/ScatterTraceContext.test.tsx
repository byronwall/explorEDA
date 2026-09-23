import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { expect, it } from "vitest";
import { scatterPlotDefinition } from "./definition";
import { planScatter } from "./scatterPlan";
import {
  ScatterTraceScope,
  useScatterTraceSelection,
} from "./ScatterTraceContext";

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
const first = planScatter(settings, { ...snapshot, facetIds: [1] }, 400, 300);
const second = planScatter(settings, { ...snapshot, facetIds: [2] }, 400, 300);

function Facet({ owner, plan }: { owner: string; plan: typeof first }) {
  const trace = useScatterTraceSelection()!;
  const { register, select } = trace;
  useEffect(
    () =>
      register(owner, plan, (selection) =>
        select({ ...selection, owner, plan })
      ),
    [register, select, owner, plan]
  );
  return null;
}

function Controls() {
  const trace = useScatterTraceSelection()!;
  return (
    <>
      <button onClick={() => trace.inspectRow(2)}>Find row 2</button>
      <button
        onClick={() => trace.inspectFirst({ kind: "legend", id: "scale" })}
      >
        Trace legend
      </button>
      <output>{`${trace.selection?.owner ?? "none"}:${trace.selection?.kind ?? "none"}`}</output>
    </>
  );
}

it("keeps one chart trace while routing rows to the correct facet", () => {
  render(
    <ScatterTraceScope>
      <Facet owner="first" plan={first} />
      <Facet owner="second" plan={second} />
      <Controls />
    </ScatterTraceScope>
  );
  fireEvent.click(screen.getByText("Find row 2"));
  expect(screen.getByRole("status")).toHaveTextContent("second:point");
  fireEvent.click(screen.getByText("Trace legend"));
  expect(screen.getByRole("status")).toHaveTextContent("first:legend");
});
