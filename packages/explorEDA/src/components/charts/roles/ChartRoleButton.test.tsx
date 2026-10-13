import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import type { ChartSettings } from "@/types/ChartTypes";
import { PlotChartPanel } from "../../PlotChartPanel";
import { scatterPlotDefinition } from "../ScatterPlot/definition";

beforeAll(() => {
  registerAllCharts();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  Element.prototype.scrollIntoView = vi.fn();
});

const rows = [
  { x: 1, y: 2, region: "East", team: "A" },
  { x: 2, y: 3, region: "West", team: "B" },
  { x: 3, y: 1, region: "East", team: "B" },
];

function scatter(
  id: string,
  title: string,
  extra: Partial<ChartSettings> = {}
) {
  return {
    ...scatterPlotDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "x"
    ),
    id,
    title,
    xField: "x",
    yField: "y",
    ...extra,
  } as ChartSettings;
}

function Panel({ id }: { id: string }) {
  const chart = useDataLayer((s) => s.charts.find((item) => item.id === id));
  return (
    <PlotChartPanel
      settings={chart!}
      width={500}
      height={400}
      onDelete={() => {}}
      onDuplicate={() => {}}
    />
  );
}

function Readout() {
  const charts = useDataLayer((s) => s.charts);
  const scales = useDataLayer((s) => s.colorScales);
  return (
    <output aria-label="State">
      {JSON.stringify({
        charts: charts.map((chart) => ({
          id: chart.id,
          colorField: chart.colorField ?? null,
          colorScaleId: chart.colorScaleId ?? null,
          filters: chart.filters,
        })),
        scales: scales.map((scale) => scale.id),
      })}
    </output>
  );
}

const readState = () =>
  JSON.parse(screen.getByRole("status", { name: "State" }).textContent!) as {
    charts: {
      id: string;
      colorField: string | null;
      colorScaleId: string | null;
      filters: unknown[];
    }[];
    scales: string[];
  };

it("colors an uncolored scatter from its Color label as one change", async () => {
  const changes: SavedDataStructure[] = [];
  const filters = [{ type: "range" as const, field: "x", min: 2 }];
  render(
    <DataLayerProvider
      data={rows}
      charts={[scatter("a", "Points", { filters })]}
      onStateChange={(state) => changes.push(state)}
    >
      <Panel id="a" />
      <Readout />
    </DataLayerProvider>
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Color: None. Change field" })
  );
  const picker = await screen.findByRole("dialog", { name: "Color field" });
  expect(within(picker).getByText("This chart · all points")).toBeVisible();
  const search = within(picker).getByPlaceholderText("Color by…");
  await waitFor(() => expect(search).toHaveFocus());
  fireEvent.change(search, { target: { value: "reg" } });
  fireEvent.keyDown(search, { key: "Enter" });

  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Color field" })
    ).not.toBeInTheDocument()
  );
  const state = readState();
  expect(state.charts[0]!.colorField).toBe("region");
  expect(state.scales).toContain(state.charts[0]!.colorScaleId);
  expect(state.charts[0]!.filters).toEqual(filters);
  // Scale creation and binding reach the host together, so one undo step
  // restores both.
  expect(changes).toHaveLength(1);
  const saved = changes[0]!;
  const savedChart = saved.charts.find((chart) => chart.id === "a")!;
  expect(savedChart.colorField).toBe("region");
  expect(
    saved.colorScales.some((scale) => scale.id === savedChart.colorScaleId)
  ).toBe(true);
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Color: region. Change field" })
    ).toHaveFocus()
  );
});

it("joins the shared scale of a field another chart colors by", async () => {
  render(
    <DataLayerProvider
      data={rows}
      charts={[scatter("a", "Points"), scatter("b", "Peer")]}
    >
      <Panel id="a" />
      <Panel id="b" />
      <Readout />
    </DataLayerProvider>
  );
  const chooseTeam = async (index: number, sharedText?: string) => {
    fireEvent.click(
      screen.getAllByRole("button", { name: "Color: None. Change field" })[
        index
      ]!
    );
    const picker = await screen.findByRole("dialog", { name: "Color field" });
    const team = within(picker).getByRole("option", { name: /team/ });
    if (sharedText) expect(team).toHaveTextContent(sharedText);
    fireEvent.click(team);
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Color field" })
      ).not.toBeInTheDocument()
    );
  };

  await chooseTeam(1);
  const peerScale = readState().charts[1]!.colorScaleId;
  expect(peerScale).toBeTruthy();
  await chooseTeam(0, "1 chart");

  expect(readState().charts[0]!.colorField).toBe("team");
  expect(readState().charts[0]!.colorScaleId).toBe(peerScale);
  expect(readState().scales.filter((id) => id === peerScale)).toHaveLength(1);
});

it("removes the color with None and closes on Escape without a change", async () => {
  const changes: SavedDataStructure[] = [];
  render(
    <DataLayerProvider
      data={rows}
      charts={[scatter("a", "Points", { colorField: "region" })]}
      onStateChange={(state) => changes.push(state)}
    >
      <Panel id="a" />
      <Readout />
    </DataLayerProvider>
  );
  const button = await screen.findByRole("button", {
    name: "Color: region. Change field",
  });
  const before = changes.length;

  fireEvent.click(button);
  let picker = await screen.findByRole("dialog", { name: "Color field" });
  fireEvent.keyDown(within(picker).getByPlaceholderText("Color by…"), {
    key: "Escape",
  });
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Color field" })
    ).not.toBeInTheDocument()
  );
  expect(changes).toHaveLength(before);

  fireEvent.click(button);
  picker = await screen.findByRole("dialog", { name: "Color field" });
  act(() => {
    fireEvent.click(within(picker).getByRole("option", { name: "None" }));
  });
  await waitFor(() => expect(readState().charts[0]!.colorField).toBeNull());
  expect(changes).toHaveLength(before + 1);
});
