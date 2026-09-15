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
  { name: "A", category: "x" },
  { name: "B", category: "x" },
  { name: "A", category: "y" },
];

const makeChart = (filters: DataTableSettings["filters"]) => ({
  ...dataTableDefinition.createDefaultSettings({ x: 0, y: 0, w: 1, h: 1 }),
  id: "table",
  columns: [
    { id: "name", field: "name" },
    { id: "category", field: "category" },
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
        name: /Remove kind: A, missing from Data Table/i,
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
});
