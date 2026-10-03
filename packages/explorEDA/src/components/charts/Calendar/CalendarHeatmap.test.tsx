import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { CalendarHeatmap } from "./CalendarHeatmap";
import { calendarDefinition, type CalendarSettings } from "./definition";

beforeAll(registerAllCharts);

function Live() {
  const settings = useDataLayer((s) => s.charts[0]) as CalendarSettings;
  return (
    <>
      <CalendarHeatmap settings={settings} width={900} height={240} />
      <output data-testid="filters">{JSON.stringify(settings.filters)}</output>
    </>
  );
}

it("selects a day, moves by day with arrow keys, and steps between years", () => {
  const chart: CalendarSettings = {
    ...calendarDefinition.createDefaultSettings({ x: 0, y: 0, w: 12, h: 4 }, "Date"),
    id: "cal",
  };
  render(
    <DataLayerProvider
      data={[{ Date: "2023-06-01" }, { Date: "2024-03-04" }, { Date: "2024-03-05" }]}
      charts={[chart]}
    >
      <Live />
    </DataLayerProvider>
  );

  expect(screen.getByText("2024")).toBeInTheDocument();
  const first = screen.getByRole("button", { name: "Mon, Mar 4, 2024: 1" });
  expect(first).toHaveAttribute("tabindex", "0");
  fireEvent.keyDown(first, { key: "ArrowDown" });
  const next = screen.getByRole("button", { name: "Tue, Mar 5, 2024: 1" });
  expect(next).toHaveFocus();
  fireEvent.keyDown(next, { key: "Enter" });
  expect(JSON.parse(screen.getByTestId("filters").textContent!)).toEqual([
    { type: "date-range", field: "Date", min: "2024-03-05", max: "2024-03-05" },
  ]);

  fireEvent.click(screen.getByRole("button", { name: "Previous year" }));
  expect(screen.getByText("2023")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Thu, Jun 1, 2023: 1" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Previous year" })).toBeDisabled();
});
