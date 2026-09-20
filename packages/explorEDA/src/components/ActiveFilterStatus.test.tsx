import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import {
  dataTableDefinition,
  DataTableSettings,
} from "./charts/DataTable/definition";
import { ActiveFilterStatus } from "./ActiveFilterStatus";

const data = [
  { name: "A", category: "x", time: 0.2, z: 20 },
  { name: "B", category: "x", time: 0.5, z: 40 },
  { name: "A", category: "y", time: 0.8, z: 20 },
];

const makeChart = (filters: DataTableSettings["filters"]) => ({
  ...dataTableDefinition.createDefaultSettings({ x: 0, y: 0, w: 1, h: 1 }),
  id: "table",
  columns: [
    { id: "name", field: "name" },
    { id: "category", field: "category" },
    { id: "time", field: "time" },
    { id: "z", field: "z" },
  ],
  filters,
});

describe("ActiveFilterStatus", () => {
  beforeAll(() => registerAllCharts());

  it("renders compact labels for each filter type with chart ownership", () => {
    const filters = [
      { type: "value" as const, field: "kind", values: ["A", null] },
      { type: "range" as const, field: "score", min: 1, max: 3 },
      {
        type: "text" as const,
        field: "name",
        operator: "contains" as const,
        value: "al",
      },
    ];
    const chart = makeChart(filters);

    render(
      <DataLayerProvider data={data} charts={[chart]}>
        <ActiveFilterStatus />
      </DataLayerProvider>
    );

    expect(
      screen.getByRole("button", {
        name: /Remove kind: A, \(missing\) from Data Table/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Remove score: 1–3 from Data Table/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Remove name contains “al” from Data Table/i,
      })
    ).toBeInTheDocument();
  });

  it("shows all-filter rows and removes one filter without clearing siblings", async () => {
    const chart = makeChart([
      { type: "text", field: "name", operator: "equals", value: "A" },
      { type: "value", field: "category", values: ["x"] },
    ]);

    render(
      <DataLayerProvider data={data} charts={[chart]}>
        <ActiveFilterStatus />
      </DataLayerProvider>
    );

    expect(screen.getByRole("status")).toHaveTextContent("Showing 1 of 3 rows");
    const removeName = screen.getByRole("button", {
      name: /Remove name equals “A” from Data Table/i,
    });
    fireEvent.click(removeName);

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Showing 2 of 3 rows"
      )
    );
    expect(
      screen.getByRole("button", {
        name: /Remove category: x from Data Table/i,
      })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear all filters" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Showing 3 of 3 rows"
      )
    );
    expect(
      screen.queryByRole("button", {
        name: /Remove category: x from Data Table/i,
      })
    ).not.toBeInTheDocument();
  });

  it("formats brush bounds and removes only the selected range filter", async () => {
    const chart = makeChart([
      {
        type: "range",
        field: "time",
        min: 0.20000000000000004,
        max: 0.5000000000000001,
      },
      { type: "range", field: "z", min: 10, max: 30 },
    ]);

    render(
      <DataLayerProvider data={data} charts={[chart]}>
        <ActiveFilterStatus />
      </DataLayerProvider>
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove time: 0.2–0.5 from Data Table",
      })
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: "Remove z: 10–30 from Data Table",
        })
      ).toBeInTheDocument()
    );
    expect(screen.getByRole("status")).toHaveTextContent("Showing 2 of 3 rows");
  });
});
