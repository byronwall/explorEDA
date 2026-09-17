import { useState } from "react";
import {
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { PlotChartPanel } from "@/components/PlotChartPanel";
import { DataTable } from "../DataTable";
import { dataTableDefinition } from "../definition";

const rows = [
  { __ID: 1, phase: "Baseline" },
  { __ID: 2, phase: "Release" },
];

function TableWithHeader() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [settings, setSettings] = useState(() => ({
    ...dataTableDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 6 }),
    columns: [{ id: "phase", field: "phase" }],
  }));
  return (
    <>
      <header ref={setTarget} aria-label="Table tools" />
      <DataTable
        settings={settings}
        rows={rows}
        toolbarTarget={target}
        width={400}
        height={300}
        onSettingsChange={(next) =>
          setSettings((current) => ({ ...current, ...next }))
        }
      />
    </>
  );
}

beforeAll(registerAllCharts);

it("searches and clears rows from the header without adding a table toolbar row", () => {
  render(
    <DataLayerProvider data={rows}>
      <TableWithHeader />
    </DataLayerProvider>
  );
  const tools = screen.getByRole("banner", { name: "Table tools" });
  fireEvent.click(within(tools).getByRole("button", { name: "Search rows" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Search table" }), {
    target: { value: "Release" },
  });
  expect(within(tools).getByText("1 row")).toBeInTheDocument();
  expect(
    screen.queryByRole("cell", { name: "Baseline" })
  ).not.toBeInTheDocument();
  expect(screen.getByRole("cell", { name: "Release" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Clear table search" }));
  expect(screen.getByRole("cell", { name: "Baseline" })).toBeInTheDocument();
  expect(within(tools).getByText("2 rows")).toBeInTheDocument();
  expect(screen.getAllByRole("row")).toHaveLength(3);
});

it("closes table search with Escape without restoring the expanded panel", async () => {
  const settings = {
    ...dataTableDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 6 }),
    title: "Observations",
    columns: [{ id: "phase", field: "phase" }],
  };
  render(
    <DataLayerProvider data={rows}>
      <PlotChartPanel
        settings={settings}
        width={500}
        height={400}
        onDelete={() => {}}
        onDuplicate={() => {}}
      />
    </DataLayerProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Expand Observations" }));
  fireEvent.click(screen.getByRole("button", { name: "Search rows" }));
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Search table" }), {
    key: "Escape",
  });
  await waitFor(() =>
    expect(
      screen.queryByRole("textbox", { name: "Search table" })
    ).not.toBeInTheDocument()
  );
  expect(
    screen.getByRole("button", { name: "Restore Observations" })
  ).toBeInTheDocument();
  fireEvent.keyDown(
    screen.getByRole("button", { name: "Restore Observations" }),
    { key: "Escape" }
  );
  expect(
    screen.getByRole("button", { name: "Expand Observations" })
  ).toBeInTheDocument();
});
