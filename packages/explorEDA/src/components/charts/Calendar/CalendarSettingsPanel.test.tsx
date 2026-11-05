import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { CalendarSettingsPanel } from "./CalendarSettingsPanel";
import { calendarDefinition, type CalendarSettings } from "./definition";

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
  Element.prototype.scrollIntoView = () => {};
});

it("offers only date columns in the Date list", () => {
  const chart: CalendarSettings = {
    ...calendarDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 12, h: 4 },
      "when"
    ),
    id: "cal",
  };
  render(
    <DataLayerProvider
      charts={[chart]}
      data={[
        { age: 10, price: 3.5, when: "2024-01-01" },
        { age: 30, price: 4, when: "2024-02-01" },
      ]}
    >
      <CalendarSettingsPanel settings={chart} onSettingsChange={() => {}} />
    </DataLayerProvider>
  );
  fireEvent.click(screen.getByRole("combobox", { name: "Date field" }));
  const options = within(screen.getByRole("listbox"))
    .getAllByRole("option")
    .map((option) => option.textContent);
  expect(options.some((text) => text?.includes("when"))).toBe(true);
  expect(options.some((text) => text?.includes("age"))).toBe(false);
  expect(options.some((text) => text?.includes("price"))).toBe(false);
});
