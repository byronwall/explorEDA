import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import type { FieldSettingsMap } from "@/lib/fieldSettings";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import {
  dataTableDefinition,
  type DataTableSettings,
} from "../../charts/DataTable/definition";
import { FieldInspector } from "./FieldInspector";

const savedData = (
  charts: ChartSettings[],
  fieldSettings: FieldSettingsMap = {}
) => ({
  charts,
  calculations: [],
  fieldSettings,
  gridSettings: {
    columnCount: 12,
    rowHeight: 100,
    containerPadding: 10,
    showBackgroundMarkers: false,
  },
  metadata: {
    name: "Test",
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    modifiedAt: "2026-01-01T00:00:00.000Z",
  },
  colorScales: [],
});

describe("FieldInspector", () => {
  it("previews failed conversions and applies a type override", async () => {
    Element.prototype.scrollIntoView = vi.fn();
    render(
      <DataLayerProvider
        data={[{ revenue: "12.5" }, { revenue: "bad" }]}
        charts={[]}
      >
        <FieldInspector field="revenue" open onOpenChange={vi.fn()} />
      </DataLayerProvider>
    );

    fireEvent.mouseDown(screen.getByRole("tab", { name: "Type" }), {
      button: 0,
      ctrlKey: false,
    });
    fireEvent.click(screen.getByRole("combobox", { name: "Type override" }));
    fireEvent.click(await screen.findByRole("option", { name: "numeric" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Apply field settings" })
    );

    expect(await screen.findByText(/Effective:/)).toHaveTextContent("numeric");
    expect(screen.getByText(/1 failed/)).toBeInTheDocument();
    expect(
      screen.getByText(/Invalid values become missing/)
    ).toBeInTheDocument();
  });

  it("offers to apply only after a setting changes", () => {
    render(
      <DataLayerProvider data={[{ weight: 3 }]} charts={[]}>
        <FieldInspector field="weight" open onOpenChange={vi.fn()} />
      </DataLayerProvider>
    );
    expect(
      screen.getByRole("heading", { name: "Inspect field: weight" })
    ).toBeInTheDocument();
    const apply = () =>
      screen.queryByRole("button", { name: "Apply field settings" });
    expect(apply()).not.toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole("tab", { name: "Display" }), {
      button: 0,
      ctrlKey: false,
    });
    const label = screen.getByLabelText("Display label");
    fireEvent.change(label, { target: { value: "Weight" } });
    expect(apply()).toBeInTheDocument();

    fireEvent.change(label, { target: { value: "" } });
    expect(apply()).not.toBeInTheDocument();
  });
});

describe("FieldInspector values", () => {
  beforeAll(() => registerAllCharts());

  const data = [
    { price: 12.5, region: "North" },
    { price: 40, region: "North" },
    { price: 18, region: "South" },
    { price: null, region: "South" },
  ];
  const tableWith = (filters: DataTableSettings["filters"]) => ({
    ...dataTableDefinition.createDefaultSettings({ x: 0, y: 0, w: 1, h: 1 }),
    id: "table",
    columns: [
      { id: "price", field: "price" },
      { id: "region", field: "region" },
    ],
    filters,
  });

  it("shows the distribution, counts, and statistics in the field format", () => {
    render(
      <DataLayerProvider
        data={data}
        savedData={savedData([tableWith([])], {
          price: { format: "currency", precision: 2 },
        })}
      >
        <FieldInspector field="price" open onOpenChange={vi.fn()} />
      </DataLayerProvider>
    );

    expect(
      screen.getByRole("group", { name: /Distribution of price/ })
    ).toBeInTheDocument();
    const counts = screen.getAllByRole("table")[0]!;
    expect(within(counts).getByRole("row", { name: /Values 3/ })).toBeTruthy();
    expect(within(counts).getByRole("row", { name: /Missing 1/ })).toBeTruthy();
    expect(screen.getByRole("row", { name: /Median \$18\.00/ })).toBeTruthy();
    expect(screen.getByRole("row", { name: /Maximum \$40\.00/ })).toBeTruthy();
  });

  it("compares rows after filters with all rows", () => {
    render(
      <DataLayerProvider
        data={data}
        savedData={savedData([
          tableWith([{ type: "value", field: "region", values: ["North"] }]),
        ])}
      >
        <FieldInspector field="region" open onOpenChange={vi.fn()} />
      </DataLayerProvider>
    );

    const list = screen.getByRole("list", { name: /Value counts after/ });
    const items = within(list).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent(/North.*2 \/ 2.*100%/);
    expect(items[1]).toHaveTextContent(/South.*0 \/ 2.*0%/);
    expect(
      screen.getByRole("columnheader", { name: "After filters" })
    ).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /Rows 2 4/ })).toBeTruthy();
  });

  it("reads bins with the arrow keys", () => {
    render(
      <DataLayerProvider data={data} savedData={savedData([tableWith([])])}>
        <FieldInspector field="price" open onOpenChange={vi.fn()} />
      </DataLayerProvider>
    );

    const plot = screen.getByRole("group", { name: /Distribution of price/ });
    fireEvent.keyDown(plot, { key: "Home" });
    expect(plot.parentElement).toHaveTextContent(/12 – 13\s*1 row\s*33%/);
    fireEvent.keyDown(plot, { key: "End" });
    expect(plot.parentElement).toHaveTextContent(/39 – 40\s*1 row/);
  });
});
