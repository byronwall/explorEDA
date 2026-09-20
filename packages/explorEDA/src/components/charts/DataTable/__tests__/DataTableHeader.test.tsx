import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataTableHeader } from "../DataTableHeader";
import { DataTableSettings } from "../definition";
import { getFilteredRows } from "../filteredRows";

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

  sortDirection: "asc",
  filters: [],
  globalSearch: "",
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

const mockFieldProfiles = [
  {
    name: "name",
    dataType: "categorical" as const,
    totalCount: 3,
    uniqueCount: 3,
    nullCount: 0,
    categories: {
      topValues: [],
      distribution: [
        { value: "John", count: 1 },
        { value: "Jane", count: 1 },
        { value: "Bob", count: 1 },
      ],
    },
  },
  {
    name: "age",
    dataType: "numeric" as const,
    totalCount: 3,
    uniqueCount: 3,
    nullCount: 0,
    statistics: { min: 25, max: 35, mean: 30, median: 30, stdDev: 5 },
  },
];

const dateProfile = {
  name: "Order Date",
  dataType: "datetime" as const,
  totalCount: 3,
  uniqueCount: 3,
  nullCount: 0,
};

const mockUseDataLayer = vi.fn();

vi.mock("@/providers/DataLayerProvider", () => ({
  useDataLayer: (selector: (state: unknown) => unknown) =>
    mockUseDataLayer(selector),
}));

const renderHeader = (settings: DataTableSettings) =>
  render(
    <table>
      <DataTableHeader settings={settings} />
    </table>
  );

describe("DataTableHeader", () => {
  beforeEach(() => {
    mockUseDataLayer.mockImplementation(
      (selector: (state: unknown) => unknown) => {
        if (selector.toString().includes("data")) {
          return mockData;
        }
        if (selector.toString().includes("getLiveItems")) {
          return mockLiveItems;
        }
        if (selector.toString().includes("fieldProfiles")) {
          return mockFieldProfiles;
        }
        if (selector.toString().includes("updateChart")) {
          return vi.fn();
        }
        return null;
      }
    );
  });

  it("renders column headers", () => {
    renderHeader(mockSettings);

    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("age")).toBeInTheDocument();
  });

  it("handles column sorting", () => {
    const updateChart = vi.fn();
    mockUseDataLayer.mockImplementation(
      (selector: (state: unknown) => unknown) => {
        if (selector.toString().includes("fieldProfiles")) {
          return mockFieldProfiles;
        }
        if (selector.toString().includes("updateChart")) {
          return updateChart;
        }
        return null;
      }
    );

    renderHeader(mockSettings);

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
    mockUseDataLayer.mockImplementation(
      (selector: (state: unknown) => unknown) => {
        if (selector.toString().includes("fieldProfiles")) {
          return mockFieldProfiles;
        }
        if (selector.toString().includes("updateChart")) {
          return updateChart;
        }
        return null;
      }
    );

    const settingsWithSort = {
      ...mockSettings,
      sortBy: "name",
      sortDirection: "asc" as const,
    };

    renderHeader(settingsWithSort);

    const nameHeader = screen.getByText("name");
    fireEvent.click(nameHeader);

    expect(updateChart).toHaveBeenCalledWith("test-table", {
      sortDirection: "desc",
    });
  });

  it("does not sort when opening a column filter", () => {
    const updateChart = vi.fn();
    mockUseDataLayer.mockImplementation(
      (selector: (state: unknown) => unknown) => {
        if (selector.toString().includes("fieldProfiles")) {
          return mockFieldProfiles;
        }
        if (selector.toString().includes("updateChart")) {
          return updateChart;
        }
        return null;
      }
    );

    renderHeader(mockSettings);
    fireEvent.click(screen.getByRole("button", { name: "Filter name" }));

    expect(updateChart).not.toHaveBeenCalled();
    expect(screen.getByRole("checkbox", { name: "John" })).toBeInTheDocument();
  });

  it("keeps both native date bounds across rerenders", () => {
    let settings: DataTableSettings = {
      ...mockSettings,
      columns: [{ id: "Order Date", field: "Order Date" }],
      filters: [{ type: "value", field: "Region", values: ["North"] }],
    };
    const data = [
      { __ID: 1, Region: "North", "Order Date": "2024-01-01" },
      { __ID: 2, Region: "North", "Order Date": "2024-03-31" },
      { __ID: 3, Region: "North", "Order Date": "2024-04-01" },
    ];
    const liveItems = {
      items: data.map((row) => ({ key: row.__ID, value: 1 })),
      nonce: 1,
    };
    const view = renderHeader(settings);
    const updateChart = vi.fn(
      (_id: string, updates: Partial<DataTableSettings>) => {
        settings = { ...settings, ...updates } as DataTableSettings;
        view.rerender(
          <table>
            <DataTableHeader settings={settings} />
          </table>
        );
      }
    );
    mockUseDataLayer.mockImplementation(
      (selector: (state: unknown) => unknown) => {
        if (selector.toString().includes("updateChart")) {
          return updateChart;
        }
        if (selector.toString().includes("fieldProfiles")) {
          return [dateProfile];
        }
        return null;
      }
    );
    view.rerender(
      <table>
        <DataTableHeader settings={settings} />
      </table>
    );

    fireEvent.click(screen.getByRole("button", { name: "Filter Order Date" }));
    fireEvent.input(screen.getByLabelText("Start date Order Date"), {
      target: { value: "2024-01-01" },
    });
    fireEvent.input(screen.getByLabelText("End date Order Date"), {
      target: { value: "2024-03-31" },
    });

    expect(settings.filters).toEqual([
      { type: "value", field: "Region", values: ["North"] },
      {
        type: "date-range",
        field: "Order Date",
        min: "2024-01-01",
        max: "2024-03-31",
      },
    ]);
    expect(
      getFilteredRows(data, liveItems, settings).map((row) => row.__ID)
    ).toEqual([1, 2]);
  });

  it("handles column resizing", () => {
    window.PointerEvent = MouseEvent as typeof PointerEvent;
    const updateChart = vi.fn();
    mockUseDataLayer.mockImplementation(
      (selector: (state: unknown) => unknown) => {
        if (selector.toString().includes("fieldProfiles")) {
          return mockFieldProfiles;
        }
        if (selector.toString().includes("updateChart")) {
          return updateChart;
        }
        return null;
      }
    );

    renderHeader(mockSettings);

    const resizeHandle = screen.getAllByRole("separator")[0]!;
    fireEvent.pointerDown(resizeHandle, { clientX: 0 });
    fireEvent.pointerMove(window, { clientX: 50 });
    fireEvent.pointerUp(window);

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
    window.PointerEvent = MouseEvent as typeof PointerEvent;
    const updateChart = vi.fn();
    mockUseDataLayer.mockImplementation(
      (selector: (state: unknown) => unknown) => {
        if (selector.toString().includes("fieldProfiles")) {
          return mockFieldProfiles;
        }
        if (selector.toString().includes("updateChart")) {
          return updateChart;
        }
        return null;
      }
    );

    renderHeader(mockSettings);

    const resizeHandle = screen.getAllByRole("separator")[0]!;
    fireEvent.pointerDown(resizeHandle, { clientX: 0 });
    fireEvent.pointerMove(window, { clientX: -200 }); // Try to make it smaller than minimum
    fireEvent.pointerUp(window);

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
