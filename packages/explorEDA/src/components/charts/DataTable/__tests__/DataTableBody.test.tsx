import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataTableBody } from "../DataTableBody";
import { DataTableSettings } from "../definition";

const mockSettings: DataTableSettings = {
  id: "test-table",
  type: "data-table",
  title: "Test Table",
  field: "test",
  layout: { x: 0, y: 0, w: 12, h: 6 },
  colorScaleId: undefined,
  colorField: undefined,
  facet: {
    enabled: false,
    type: "grid",
    rowVariable: "",
    columnVariable: "",
  },
  xAxis: {},
  yAxis: {},
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  xAxisLabel: "",
  yAxisLabel: "",
  xGridLines: 0,
  yGridLines: 0,
  columns: [
    { id: "name", field: "name", width: 200 },
    { id: "age", field: "age", width: 100 },
  ],
  pageSize: 10,
  currentPage: 1,
  sortDirection: "asc",
  filters: [],
  globalSearch: "",
  tableHeight: 600,
};

const mockData = [
  { __ID: 1, name: "John", age: 30 },
  { __ID: 2, name: "Jane", age: 25 },
  { __ID: 3, name: "Bob", age: 35 },
];

const mockLiveItems = {
  items: [
    { key: 1, value: 1 },
    { key: 2, value: 1 },
    { key: 3, value: 1 },
  ],
};

const mockUseDataLayer = vi.fn();

vi.mock("@/providers/DataLayerProvider", () => ({
  useDataLayer: (selector: (state: unknown) => unknown) => mockUseDataLayer(selector),
}));

describe("DataTableBody", () => {
  beforeEach(() => {
    mockUseDataLayer.mockImplementation((selector: (state: unknown) => unknown) => {
      if (selector.toString().includes("data")) {
        return mockData;
      }
      if (selector.toString().includes("getLiveItems")) {
        return mockLiveItems;
      }
      return null;
    });
  });

  it("renders all rows when no filters are applied", () => {
    render(<DataTableBody settings={mockSettings} />);

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("applies global search correctly", () => {
    const settingsWithSearch = {
      ...mockSettings,
      globalSearch: "John",
    };

    render(<DataTableBody settings={settingsWithSearch} />);

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.queryByText("Jane")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("applies column filters correctly", () => {
    const settingsWithFilter = {
      ...mockSettings,
      filters: [
        { type: "text" as const, field: "name", value: "John", operator: "equals" as const },
      ],
    };

    render(<DataTableBody settings={settingsWithFilter} />);

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.queryByText("Jane")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("applies numeric sorting correctly", () => {
    const settingsWithSort = {
      ...mockSettings,
      sortBy: "age",
      sortDirection: "desc" as const,
    };

    render(<DataTableBody settings={settingsWithSort} />);

    const rows = screen.getAllByRole("row");
    expect(rows[0]).toHaveTextContent("35"); // First row should be Bob (age 35)
    expect(rows[1]).toHaveTextContent("30"); // Second row should be John (age 30)
    expect(rows[2]).toHaveTextContent("25"); // Third row should be Jane (age 25)
  });

  it("applies pagination correctly", () => {
    const settingsWithPagination = {
      ...mockSettings,
      pageSize: 2,
      currentPage: 2,
    };

    render(<DataTableBody settings={settingsWithPagination} />);

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("John")).not.toBeInTheDocument();
    expect(screen.queryByText("Jane")).not.toBeInTheDocument();
  });

  it("respects column widths", () => {
    render(<DataTableBody settings={mockSettings} />);

    const cells = screen.getAllByRole("cell");
    expect(cells[0]).toHaveStyle({ width: "200px" });
    expect(cells[1]).toHaveStyle({ width: "100px" });
  });

  it("uses column fields for row lookup", () => {
    const settingsWithStableIds = {
      ...mockSettings,
      columns: [
        { id: "name-column", field: "name", width: 200 },
        { id: "age-column", field: "age", width: 100 },
      ],
    };

    render(<DataTableBody settings={settingsWithStableIds} />);

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("shows an empty state when no rows match", () => {
    render(<DataTableBody settings={{ ...mockSettings, globalSearch: "missing" }} />);

    expect(screen.getByText("No rows match the current filters.")).toBeInTheDocument();
  });
});
