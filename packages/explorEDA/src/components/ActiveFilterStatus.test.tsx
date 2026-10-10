import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
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
  it("labels chips with the field's name, format, and unit", () => {
    const chart = makeChart([
      { type: "range", field: "time", min: 1.02, max: 1.04 },
      { type: "range", field: "z", min: 12.5 },
    ]);

    render(
      <DataLayerProvider
        data={data}
        savedData={{
          charts: [chart],
          calculations: [],
          fieldSettings: {
            time: { label: "Duration", unit: "s", precision: 1 },
            z: { format: "currency", precision: 2 },
          },
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
        }}
      >
        <ActiveFilterStatus />
      </DataLayerProvider>
    );

    // Rounding to one place would show 1.0 s–1.0 s, so the bounds gain a place.
    expect(
      screen.getByRole("button", {
        name: "Remove Duration: 1.02 s–1.04 s from Data Table",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove z: ≥ $12.50 from Data Table" })
    ).toBeInTheDocument();
  });

  it("shows the owning chart from the label and removes only from the X", () => {
    const chart = makeChart([
      { type: "value", field: "category", values: ["x"] },
    ]);
    const onShowChart = vi.fn();

    render(
      <DataLayerProvider data={data} charts={[chart]}>
        <ActiveFilterStatus onShowChart={onShowChart} />
      </DataLayerProvider>
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Show Data Table, the chart with filter category: x",
      })
    );

    expect(onShowChart).toHaveBeenCalledWith("table");
    expect(screen.getByRole("status")).toHaveTextContent("Showing 2 of 3 rows");
    expect(
      screen.getByRole("button", {
        name: "Remove category: x from Data Table",
      })
    ).toBeInTheDocument();
  });

  it("keeps chips on one line and lists the rest in a popover", async () => {
    // Only the first chip fits in the 100px list.
    const rect = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: Element) {
        const right = this.classList.contains("eda-filter-chips")
          ? 100
          : this.classList.contains("eda-filter-chip")
            ? 90 * (Array.from(this.parentElement!.children).indexOf(this) + 1)
            : 0;
        return { right } as DOMRect;
      });
    const chart = makeChart([
      { type: "value", field: "category", values: ["x"] },
      { type: "value", field: "name", values: ["A"] },
      { type: "range", field: "z", min: 10 },
    ]);

    render(
      <DataLayerProvider data={data} charts={[chart]}>
        <ActiveFilterStatus />
      </DataLayerProvider>
    );

    const list = screen.getByRole("list", { name: "Active filters" });
    const chips = list.querySelectorAll("li");
    expect(chips[0]).not.toHaveAttribute("data-overflow");
    expect(chips[1]).toHaveAttribute("data-overflow");
    expect(chips[2]).toHaveAttribute("data-overflow");

    const more = screen.getByRole("button", {
      name: "Show all 3 active filters",
    });
    expect(more).toHaveTextContent("+2 more");
    fireEvent.click(more);

    const all = await screen.findByRole("list", { name: "All active filters" });
    expect(all.querySelectorAll("li")).toHaveLength(3);
    rect.mockRestore();
  });

  it("hides the clear action when nothing is filtered", () => {
    render(
      <DataLayerProvider data={data} charts={[makeChart([])]}>
        <ActiveFilterStatus />
      </DataLayerProvider>
    );

    expect(screen.getByRole("status")).toHaveTextContent("Showing 3 of 3 rows");
    expect(
      screen.queryByRole("button", { name: "Clear all filters" })
    ).not.toBeInTheDocument();
  });

  describe("workspace filters", () => {
    beforeAll(() => {
      Element.prototype.scrollIntoView ??= () => {};
    });

    const renderBar = () =>
      render(
        <DataLayerProvider data={data} charts={[makeChart([])]}>
          <ActiveFilterStatus />
        </DataLayerProvider>
      );

    const addCategoryX = async () => {
      fireEvent.click(screen.getByRole("button", { name: "Add filter" }));
      const dialog = await screen.findByRole("dialog", {
        name: "Add a workspace filter",
      });
      fireEvent.click(within(dialog).getByRole("option", { name: /category/ }));
      fireEvent.click(await screen.findByRole("checkbox", { name: /^x/ }));
    };

    it("adds a filter from the bar that narrows the row count", async () => {
      renderBar();
      expect(screen.getByRole("status")).toHaveTextContent(
        "Showing 3 of 3 rows"
      );
      await addCategoryX();
      expect(screen.getByRole("status")).toHaveTextContent(
        "Showing 2 of 3 rows"
      );
      expect(
        screen.getByRole("button", {
          name: "Edit workspace filter category: x",
        })
      ).toHaveTextContent("Workspace · category: x");
    });

    it("edits the field's one filter from its chip and removes it with ×", async () => {
      renderBar();
      await addCategoryX();
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      );

      fireEvent.click(
        screen.getByRole("button", {
          name: "Edit workspace filter category: x",
        })
      );
      const dialog = await screen.findByRole("dialog", {
        name: "Edit workspace filter",
      });
      fireEvent.click(within(dialog).getByRole("checkbox", { name: /^y/ }));
      expect(screen.getByRole("status")).toHaveTextContent(
        "Showing 3 of 3 rows"
      );
      expect(
        screen.getByRole("button", {
          name: "Edit workspace filter category: x, y",
        })
      ).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole("button", {
          name: "Remove workspace filter category: x, y",
        })
      );
      expect(
        screen.queryByRole("button", { name: /Edit workspace filter/ })
      ).not.toBeInTheDocument();
    });

    it("clears workspace filters with every other filter", async () => {
      renderBar();
      await addCategoryX();
      fireEvent.click(
        screen.getByRole("button", { name: "Clear all filters" })
      );
      expect(screen.getByRole("status")).toHaveTextContent(
        "Showing 3 of 3 rows"
      );
      expect(
        screen.queryByRole("button", { name: /Edit workspace filter/ })
      ).not.toBeInTheDocument();
    });
  });
});
