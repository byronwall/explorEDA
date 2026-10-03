import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { SankeyChart } from "./SankeyChart";
import { sankeyDefinition, type SankeySettings } from "./definition";

beforeAll(registerAllCharts);

function Live() {
  const settings = useDataLayer((s) => s.charts[0]) as SankeySettings;
  return (
    <>
      <SankeyChart settings={settings} width={600} height={320} />
      <output data-testid="filters">{JSON.stringify(settings.filters)}</output>
    </>
  );
}

it("selects nodes and links by click and keyboard, and moves focus across stages", () => {
  const chart: SankeySettings = {
    ...sankeyDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    id: "flow",
    stages: ["Channel", "Status"],
  };
  render(
    <DataLayerProvider
      data={[
        { Channel: "Web", Status: "Kept" },
        { Channel: "Web", Status: "Returned" },
        { Channel: "Store", Status: "Kept" },
      ]}
      charts={[chart]}
    >
      <Live />
    </DataLayerProvider>
  );
  const filters = () => JSON.parse(screen.getByTestId("filters").textContent!);

  const web = screen.getByRole("button", { name: "Channel: Web, 2 rows" });
  expect(web).toHaveAttribute("tabindex", "0");
  fireEvent.click(web);
  expect(filters()).toEqual([
    { type: "value", field: "Channel", values: ["Web"] },
  ]);
  fireEvent.click(
    screen.getByRole("button", { name: "Channel: Store, 1 row" }),
    {
      shiftKey: true,
    }
  );
  expect(filters()).toEqual([
    { type: "value", field: "Channel", values: ["Web", "Store"] },
  ]);

  const link = screen.getByRole("button", { name: "Web to Returned: 1 row" });
  fireEvent.click(link);
  expect(filters()).toEqual([
    { type: "value", field: "Channel", values: ["Web"] },
    { type: "value", field: "Status", values: ["Returned"] },
  ]);
  expect(
    screen.getByRole("button", { name: "Web to Returned: 1 row" })
  ).toHaveAttribute("aria-pressed", "true");

  // Right from a first-stage node reaches a link, then the next stage's node.
  const first = screen.getByRole("button", { name: "Channel: Web, 2 rows" });
  first.focus();
  fireEvent.keyDown(first, { key: "ArrowRight" });
  const focusedLink = document.activeElement!;
  expect(focusedLink.getAttribute("aria-label")).toMatch(/^Web to /);
  fireEvent.keyDown(focusedLink, { key: "ArrowRight" });
  expect(document.activeElement!.getAttribute("aria-label")).toMatch(
    /^Status: /
  );
  fireEvent.keyDown(document.activeElement!, { key: "Enter" });
  expect(
    filters().some((filter: { field: string }) => filter.field === "Status")
  ).toBe(true);
});
