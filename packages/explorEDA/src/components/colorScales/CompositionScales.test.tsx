import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { compositionDefinition } from "@/components/charts/Composition/definition";
import type { CompositionSettings } from "@/components/charts/Composition/definition";
import { CompositionScales } from "./CompositionScales";

beforeAll(registerAllCharts);

function StackColors() {
  const chart = useDataLayer((state) => state.charts[0] as CompositionSettings);
  const unit = chart.composition.elements[0];
  const mark = unit?.kind === "unit" ? unit.marks[0] : undefined;
  return (
    <output aria-label="Saved colors">
      {mark && "colors" in mark ? (mark.colors ?? []).join(",") : ""}
    </output>
  );
}

it("lists a composition's ramps and category colors and writes edits back", () => {
  const chart = compositionDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 12,
    h: 6,
  }) as CompositionSettings;
  chart.title = "Causes";
  chart.composition = {
    ...chart.composition,
    scales: [
      {
        id: "value-1",
        kind: "value",
        name: "Rate",
        domain: "shared",
        transform: "linear",
        colors: ["#ffffff", "#aa0000"],
      },
    ],
    elements: [
      {
        id: "unit-1",
        kind: "unit",
        name: "Columns",
        x: 0,
        y: 0,
        frame: { width: 100, height: 100 },
        label: { show: false, width: 0, fontSize: 12 },
        axis: false,
        marks: [
          {
            type: "stack",
            id: "mark-1",
            name: "Share",
            categoryField: "cause",
            aggregation: "count",
            normalize: true,
            order: "label",
            colors: ["#111111"],
            labelMinHeight: 10,
            inset: 0,
          },
        ],
        repeat: {
          arrangement: "rows",
          columns: 1,
          gap: 0,
          order: "label",
          limit: 1,
        },
      },
    ],
  };
  render(
    <DataLayerProvider
      data={[{ cause: "A" }, { cause: "B" }, { cause: "B" }]}
      charts={[chart]}
    >
      <CompositionScales />
      <StackColors />
    </DataLayerProvider>
  );
  const list = screen.getByRole("list", { name: "Composition colors" });
  expect(within(list).getByText("Rate")).toBeTruthy();
  fireEvent.click(within(list).getByText("Share"));
  const colors = screen.getByRole("group", { name: "Share colors" });
  // The one-color palette cycles over both categories; editing B spells it out.
  const inputs = within(colors).getAllByDisplayValue("#111111");
  expect(inputs).toHaveLength(2);
  fireEvent.change(inputs[1]!, { target: { value: "#22cc22" } });
  expect(screen.getByLabelText("Saved colors").textContent).toBe(
    "#111111,#22cc22"
  );
});
