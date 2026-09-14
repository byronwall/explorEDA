import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataTableHeader } from "../DataTableHeader";
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

describe("DataTableHeader", () => {
  beforeEach(() => {
    mockUseDataLayer.mockImplementation((selector: (state: unknown) => unknown) => {
      if (selector.toString().includes("data")) {
        return mockData;
      }
      if (selector.toString().includes("getLiveItems")) {
        return mockLiveItems;
      }
      if (selector.toString().includes("updateChart")) {
        return vi.fn();
      }
      return null;
    });
  });

  it("renders column headers", () => {
    render(<DataTableHeader settings={mockSettings} />);

    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("age")).toBeInTheDocument();
  });

  it("handles column sorting", () => {
    const updateChart = vi.fn();
    mockUseDataLayer.mockImplementation((selector: (state: unknown) => unknown) => {
      if (selector.toString().includes("updateChart")) {
        return updateChart;
      }
      return null;
    });

    render(<DataTableHeader settings={mockSettings} />);

    const nameHeader = screen.getByText("name");
    fireEvent.click(nameHeader);

    expect(updateChart).toHaveBeenCalledWith(
      "test-table",
      expect.objectContaining({
        sortBy: "name",
        sortDirection: "asc",
      })
    );
  });

  it("toggles sort direction when clicking the same column", () => {
    const updateChart = vi.fn();
    mockUseDataLayer.mockImplementation((selector: (state: unknown) => unknown) => {
      if (selector.toString().includes("updateChart")) {
        return updateChart;
      }
      return null;
    });

    const settingsWithSort = {
      ...mockSettings,
      sortBy: "name",
      sortDirection: "asc" as const,
    };

    render(<DataTableHeader settings={settingsWithSort} />);

    const nameHeader = screen.getByText("name");
    fireEvent.click(nameHeader);

    expect(updateChart).toHaveBeenCalledWith("test-table", {
      sortDirection: "desc",
    });
  });

  it("does not sort when opening a column filter", () => {
    const updateChart = vi.fn();
    mockUseDataLayer.mockImplementation((selector: (state: unknown) => unknown) => {
      if (selector.toString().includes("updateChart")) {
        return updateChart;
      }
      return null;
    });

    render(<DataTableHeader settings={mockSettings} />);
    fireEvent.click(screen.getByRole("button", { name: "Filter name" }));

    expect(updateChart).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Filter name...")).toBeInTheDocument();
  });

  it("handles column resizing", () => {
    const updateChart = vi.fn();
    mockUseDataLayer.mockImplementation((selector: (state: unknown) => unknown) => {
      if (selector.toString().includes("updateChart")) {
        return updateChart;
      }
      return null;
    });

    render(<DataTableHeader settings={mockSettings} />);

    const resizeHandle = screen.getAllByRole("separator")[0]!;
    fireEvent.mouseDown(resizeHandle, { clientX: 0 });
    fireEvent.mouseMove(window, { clientX: 50 });
    fireEvent.mouseUp(window);

    expect(updateChart).toHaveBeenCalledWith(
      "test-table",
      expect.objectContaining({
        columns: expect.arrayContaining([
          expect.objectContaining({
            id: "name",
            width: 250, // 200 + 50
          }),
        ]),
      })
    );
  });

  it("respects minimum column width", () => {
    const updateChart = vi.fn();
    mockUseDataLayer.mockImplementation((selector: (state: unknown) => unknown) => {
      if (selector.toString().includes("updateChart")) {
        return updateChart;
      }
      return null;
    });

    render(<DataTableHeader settings={mockSettings} />);

    const resizeHandle = screen.getAllByRole("separator")[0]!;
    fireEvent.mouseDown(resizeHandle, { clientX: 0 });
    fireEvent.mouseMove(window, { clientX: -200 }); // Try to make it smaller than minimum
    fireEvent.mouseUp(window);

    expect(updateChart).toHaveBeenCalledWith(
      "test-table",
      expect.objectContaining({
        columns: expect.arrayContaining([
          expect.objectContaining({
            id: "name",
            width: 50, // Minimum width
          }),
        ]),
      })
    );
  });
});
