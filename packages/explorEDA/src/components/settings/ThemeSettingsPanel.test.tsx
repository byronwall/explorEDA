import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { ThemeSettingsPanel } from "./ThemeSettingsPanel";
import { barChartDefinition } from "../charts/BarChart/definition";

beforeAll(() => registerAllCharts());

function ThemeId() {
  const theme = useDataLayer((state) => state.theme);
  return <output aria-label="theme">{theme?.id ?? "compact"}</output>;
}

it("switches the workspace theme and marks the choice", () => {
  render(
    <DataLayerProvider data={[{ value: 1 }]} charts={[]}>
      <ThemeSettingsPanel />
      <ThemeId />
    </DataLayerProvider>
  );
  const compact = screen.getByRole("radio", { name: "Compact" });
  const newsprint = screen.getByRole("radio", { name: "Newsprint" });
  expect(compact).toHaveAttribute("aria-checked", "true");

  fireEvent.click(newsprint);
  expect(newsprint).toHaveAttribute("aria-checked", "true");
  expect(screen.getByLabelText("theme")).toHaveTextContent("newsprint");

  fireEvent.click(screen.getByRole("radio", { name: "Report" }));
  expect(screen.getByLabelText("theme")).toHaveTextContent("report");

  fireEvent.click(compact);
  expect(screen.getByLabelText("theme")).toHaveTextContent("compact");
});

it("lists charts that override the theme and resets them", () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 4, h: 4 },
      "value"
    ),
    title: "Values",
    style: { titleSize: 28 },
    xAxis: { tickFontSize: 12 as const },
  };
  function Overrides() {
    const charts = useDataLayer((state) => state.charts);
    return (
      <output aria-label="style">
        {JSON.stringify([charts[0]!.style, charts[0]!.xAxis.tickFontSize])}
      </output>
    );
  }
  render(
    <DataLayerProvider data={[{ value: 1 }]} charts={[chart]}>
      <ThemeSettingsPanel />
      <Overrides />
    </DataLayerProvider>
  );
  expect(screen.getByText("Title size")).toBeInTheDocument();
  expect(screen.getByText("X tick text")).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole("button", { name: "Reset Title size of Values" })
  );
  expect(screen.getByLabelText("style")).toHaveTextContent("[null,12]");

  fireEvent.click(
    screen.getByRole("button", { name: "Reset Values to the theme" })
  );
  expect(screen.getByLabelText("style")).toHaveTextContent("[null,null]");
  expect(screen.getByText(/Every chart follows/)).toBeInTheDocument();
});
