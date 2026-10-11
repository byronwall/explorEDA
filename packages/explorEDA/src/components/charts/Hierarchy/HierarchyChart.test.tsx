import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { HierarchyChart, textOn } from "./HierarchyChart";
import { hierarchyDefinition, type HierarchySettings } from "./definition";

beforeAll(registerAllCharts);

function Live() {
  const settings = useDataLayer((s) => s.charts[0]) as HierarchySettings;
  return (
    <>
      <HierarchyChart settings={settings} width={600} height={360} />
      <output data-testid="filters">{JSON.stringify(settings.filters)}</output>
    </>
  );
}

const data = [
  { Region: "North", Category: "Home" },
  { Region: "North", Category: "Home" },
  { Region: "North", Category: "Office" },
  { Region: "South", Category: "Home" },
];

function setup() {
  const chart: HierarchySettings = {
    ...hierarchyDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    id: "tree",
    levels: ["Region", "Category"],
  };
  render(
    <DataLayerProvider data={data} charts={[chart]}>
      <Live />
    </DataLayerProvider>
  );
  return () => JSON.parse(screen.getByTestId("filters").textContent!);
}

it("selects a branch by click, adds a sibling with Shift, and clears on empty space", () => {
  const filters = setup();
  const northHome = screen.getByRole("button", {
    name: "North › Home: 2 rows, 66.7% of North",
  });
  fireEvent.click(northHome);
  expect(filters()).toEqual([
    { type: "value", field: "Region", values: ["North"] },
    { type: "value", field: "Category", values: ["Home"] },
  ]);
  expect(northHome).toHaveAttribute("aria-pressed", "true");

  fireEvent.click(
    screen.getByRole("button", {
      name: "North › Office: 1 row, 33.3% of North",
    }),
    { shiftKey: true }
  );
  expect(filters()).toEqual([
    { type: "value", field: "Region", values: ["North"] },
    { type: "value", field: "Category", values: ["Home", "Office"] },
  ]);

  // A sibling under another parent is refused, and the selection stays.
  fireEvent.click(
    screen.getByRole("button", { name: "South › Home: 1 row, 100% of South" }),
    { shiftKey: true }
  );
  expect(filters()[1].values).toEqual(["Home", "Office"]);
  expect(screen.getByText(/same parent only/)).toBeInTheDocument();

  fireEvent.click(document.querySelector("svg > rect")!);
  expect(filters()).toEqual([]);
});

it("moves focus with the arrow keys and selects with Enter", () => {
  const filters = setup();
  const north = screen.getByRole("button", {
    name: "North: 3 rows, 75% of all",
  });
  expect(north).toHaveAttribute("tabindex", "0");
  north.focus();
  fireEvent.keyDown(north, { key: "ArrowRight" });
  const next = document.activeElement!;
  expect(next.getAttribute("aria-label")).toMatch(/^North › Home/);
  fireEvent.keyDown(next, { key: "Enter" });
  expect(filters()).toHaveLength(2);
});

it("picks readable text on light and dark fills", () => {
  expect(textOn("#1b4f8a")).toBe("#fff");
  expect(textOn("#f2d64b")).toBe("#1b1f24");
});
