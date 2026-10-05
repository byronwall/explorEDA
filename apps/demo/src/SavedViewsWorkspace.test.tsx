import { readFileSync } from "node:fs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SavedDataStructure } from "exploreda";
import { parseCsvData } from "./csvParser";
import { SavedViewsWorkspace } from "./SavedViewsWorkspace";
import { getSavedViewsRows, readSavedViewsSession } from "./savedViewsSession";

vi.mock("exploreda", async () => {
  const React = await import("react");
  const actual = await vi.importActual<typeof import("exploreda")>("exploreda");
  let workspaceMounts = 0;
  return {
    ...actual,
    ExplorEda: React.forwardRef<
      import("exploreda").ExplorEdaHandle,
      {
        data: unknown[];
        savedData?: SavedDataStructure;
        onStateChange?: (settings: SavedDataStructure) => void;
      }
    >(({ data, savedData, onStateChange }, ref) => {
      const [mount] = React.useState(() => ++workspaceMounts);
      const [currentSettings, setCurrentSettings] = React.useState(
        () => savedData ?? makeSettings()
      );
      const [draft, setDraft] = React.useState("");
      React.useImperativeHandle(
        ref,
        () => ({ getSettings: () => currentSettings }),
        [currentSettings]
      );
      const emit = (kind: "filter" | "chart" | "both" | "shared") => {
        const current = currentSettings;
        const filters = current.rowsSettings?.filters ?? [];
        const nextFilter = {
          type: "text" as const,
          field: "region",
          operator: "equals" as const,
          value:
            filters[0]?.type === "text" && filters[0].value === "North"
              ? "South"
              : "North",
        };
        const next = {
          ...current,
          charts:
            kind === "chart" || kind === "both"
              ? ([
                  { id: `chart-${current.charts.length + 1}`, filters: [] },
                ] as unknown as SavedDataStructure["charts"])
              : current.charts,
          calculations:
            kind === "shared"
              ? [{ resultColumnName: "total", expression: "1" }]
              : current.calculations,
          rowsSettings: {
            columns: current.rowsSettings?.columns ?? [],
            sortDirection: current.rowsSettings?.sortDirection ?? "asc",
            filters:
              kind === "filter" || kind === "both" ? [nextFilter] : filters,
            globalSearch: current.rowsSettings?.globalSearch ?? "",
          },
        } as SavedDataStructure;
        setCurrentSettings(next);
        onStateChange?.(next);
      };
      return React.createElement(
        "div",
        {
          "data-testid": "workspace",
          "data-mount": mount,
          "data-rows": data.length,
          "data-filter-count":
            currentSettings.rowsSettings?.filters.length ?? 0,
          "data-chart-count": currentSettings.charts.length,
          "data-calculation-count": currentSettings.calculations.length,
        },
        React.createElement("input", {
          "aria-label": "Editor draft",
          value: draft,
          onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            setDraft(event.target.value),
          onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") emit("filter");
          },
        }),
        React.createElement(
          "button",
          { onClick: () => emit("filter") },
          "Emit filter"
        ),
        React.createElement(
          "button",
          { onClick: () => emit("chart") },
          "Emit chart"
        ),
        React.createElement(
          "button",
          { onClick: () => emit("both") },
          "Emit both"
        ),
        React.createElement(
          "button",
          { onClick: () => emit("shared") },
          "Emit shared change"
        )
      );
    }),
  };
});

function makeSettings(): SavedDataStructure {
  return {
    charts: [],
    calculations: [],
    gridSettings: {
      columnCount: 12,
      rowHeight: 100,
      containerPadding: 10,
      showBackgroundMarkers: true,
    },
    metadata: {
      name: "Sales",
      version: 1,
      createdAt: "2026-10-05T00:00:00.000Z",
      modifiedAt: "2026-10-05T00:00:00.000Z",
    },
    colorScales: [],
    rowsSettings: {
      columns: [],
      sortDirection: "asc",
      filters: [],
      globalSearch: "",
    },
  };
}

afterEach(() => localStorage.clear());

describe("saved view session and history", () => {
  it("keeps filters per view, shares definitions, and recovers edits through history", async () => {
    const data = [{ region: "North", missing: undefined, ratio: NaN }];
    const view = render(
      <SavedViewsWorkspace
        data={data}
        initialSettings={makeSettings()}
        viewName="Sales"
      />
    );
    await screen.findByTestId("workspace");

    const editor = screen.getByRole("textbox", { name: "Editor draft" });
    const initialMount = screen
      .getByTestId("workspace")
      .getAttribute("data-mount");
    fireEvent.change(editor, { target: { value: "unfinished expression" } });
    editor.focus();
    fireEvent.keyDown(editor, { key: "Enter" });
    expect(editor).toHaveFocus();
    expect(editor).toHaveValue("unfinished expression");
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-mount",
      initialMount
    );

    fireEvent.click(screen.getByRole("button", { name: "Emit filter" }));
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      /^Filter ·/
    );
    const beforeChartMount = screen
      .getByTestId("workspace")
      .getAttribute("data-mount");
    fireEvent.click(screen.getByRole("button", { name: "Emit chart" }));
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-mount",
      beforeChartMount
    );
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-chart-count",
      "1"
    );
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      /^View ·/
    );
    fireEvent.click(screen.getByRole("button", { name: "Emit both" }));
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      /^Both ·/
    );
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-filter-count",
      "1"
    );

    const beforeNewView = screen
      .getByTestId("workspace")
      .getAttribute("data-mount");
    fireEvent.click(screen.getByRole("button", { name: "New view" }));
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByTestId("workspace").getAttribute("data-mount")).not.toBe(
      beforeNewView
    );
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-filter-count",
      "0"
    );
    fireEvent.click(screen.getByRole("button", { name: "Emit filter" }));
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-filter-count",
      "1"
    );
    fireEvent.click(screen.getByRole("tab", { name: "Sales" }));
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-filter-count",
      "1"
    );
    fireEvent.click(screen.getByRole("tab", { name: "New view" }));
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-filter-count",
      "1"
    );

    fireEvent.click(screen.getByRole("button", { name: "Emit shared change" }));
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      /^Shared ·/
    );
    fireEvent.click(screen.getByRole("tab", { name: "Sales" }));
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-calculation-count",
      "1"
    );
    fireEvent.click(screen.getByRole("tab", { name: "New view" }));

    const beforePreview = localStorage.getItem("exploreda.saved-views.v1");
    const slider = screen.getByRole("slider", { name: "Saved history" });
    const currentSession = readSavedViewsSession()!;
    const newViewCheckpoint = currentSession.history.findIndex((entry) =>
      entry.tabs.some(
        (tab) =>
          tab.name === "New view" &&
          tab.settings?.rowsSettings?.filters.length === 0 &&
          tab.settings?.calculations.length === 0
      )
    );
    expect(newViewCheckpoint).toBeGreaterThan(-1);
    const beforePreviewMount = screen
      .getByTestId("workspace")
      .getAttribute("data-mount");
    fireEvent.change(slider, { target: { value: String(newViewCheckpoint) } });
    expect(screen.getByTestId("workspace").getAttribute("data-mount")).not.toBe(
      beforePreviewMount
    );
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-calculation-count",
      "0"
    );
    expect(screen.getByText(/Preview ·/)).toBeInTheDocument();
    expect(localStorage.getItem("exploreda.saved-views.v1")).toBe(
      beforePreview
    );
    fireEvent.click(screen.getByRole("tab", { name: "Sales" }));
    expect(screen.getByRole("tab", { name: "Sales" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    const previewMount = screen
      .getByTestId("workspace")
      .getAttribute("data-mount");
    fireEvent.click(screen.getByRole("button", { name: "Return to present" }));
    expect(screen.queryByText(/Preview ·/)).toBeNull();
    expect(screen.getByTestId("workspace").getAttribute("data-mount")).not.toBe(
      previewMount
    );
    expect(screen.getByRole("tab", { name: "New view" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-calculation-count",
      "1"
    );

    const beforeUndoMount = screen
      .getByTestId("workspace")
      .getAttribute("data-mount");
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByTestId("workspace").getAttribute("data-mount")).not.toBe(
      beforeUndoMount
    );
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-calculation-count",
      "0"
    );
    const beforeRedoMount = screen
      .getByTestId("workspace")
      .getAttribute("data-mount");
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(screen.getByTestId("workspace").getAttribute("data-mount")).not.toBe(
      beforeRedoMount
    );
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-calculation-count",
      "1"
    );

    fireEvent.change(slider, {
      target: { value: String(newViewCheckpoint) },
    });
    fireEvent.click(screen.getByRole("tab", { name: "Sales" }));
    expect(screen.getByRole("tab", { name: "Sales" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    fireEvent.click(screen.getByRole("button", { name: "Restore this view" }));
    await waitFor(() => expect(screen.queryByText(/Preview ·/)).toBeNull());
    expect(screen.getByRole("tab", { name: "Sales" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-calculation-count",
      "0"
    );
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-calculation-count",
      "1"
    );
    fireEvent.click(screen.getByRole("button", { name: "Emit filter" }));
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      /^Filter ·/
    );
    expect(
      Number(
        screen
          .getByRole("slider", { name: "Saved history" })
          .getAttribute("max")
      )
    ).toBeGreaterThan(newViewCheckpoint);

    const saved = readSavedViewsSession();
    const restoredRows = saved ? getSavedViewsRows(saved) : [];
    expect(restoredRows).toEqual(data);
    expect(Object.hasOwn(restoredRows[0] ?? {}, "missing")).toBe(true);
    expect(Number.isNaN(restoredRows[0]?.ratio)).toBe(true);
    expect(saved?.history.every((entry) => !("sourceAnalysis" in entry))).toBe(
      true
    );
    expect(screen.getByText(/of 50 checkpoints saved/)).toBeInTheDocument();
    view.unmount();
  });
  it("moves focus and selection through saved tabs with arrow and boundary keys", async () => {
    render(
      <SavedViewsWorkspace
        data={[]}
        initialSettings={makeSettings()}
        viewName="Sales"
      />
    );
    await screen.findByTestId("workspace");
    fireEvent.click(screen.getByRole("button", { name: "New view" }));
    const sales = screen.getByRole("tab", { name: "Sales" });
    const newView = screen.getByRole("tab", { name: "New view" });

    sales.focus();
    fireEvent.keyDown(sales, { key: "ArrowRight" });
    expect(newView).toHaveFocus();
    expect(newView).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(newView, { key: "ArrowLeft" });
    expect(sales).toHaveFocus();
    expect(sales).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(sales, { key: "End" });
    expect(newView).toHaveFocus();
    fireEvent.keyDown(newView, { key: "Home" });
    expect(sales).toHaveFocus();
  });

  it("captures defaults before labeling the first filter edit", async () => {
    render(<SavedViewsWorkspace data={[]} viewName="Orders" />);
    await screen.findByTestId("workspace");
    fireEvent.click(screen.getByRole("button", { name: "Emit filter" }));
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      /^Filter ·/
    );
  });

  it("measures the 500-order source with the full retained history", async () => {
    const csv = readFileSync("public/datasets/shop-operations.csv", "utf8");
    const rows = await parseCsvData(csv);
    expect(rows).toHaveLength(500);
    render(
      <SavedViewsWorkspace
        data={rows}
        initialSettings={makeSettings()}
        viewName="Orders"
      />
    );
    await screen.findByTestId("workspace");
    for (let index = 0; index < 55; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Emit filter" }));
    }
    const saved = localStorage.getItem("exploreda.saved-views.v1")!;
    const session = readSavedViewsSession()!;
    const storageBytes = new Blob([saved]).size;
    expect(session.history).toHaveLength(50);
    expect(session.history.every((entry) => !("sourceAnalysis" in entry))).toBe(
      true
    );
    expect(storageBytes).toBeGreaterThan(0);
  });

  it("shows the history bound and exports when local storage refuses a save", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage full", "QuotaExceededError");
    });
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:analysis"),
      revokeObjectURL: vi.fn(),
    });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    render(
      <SavedViewsWorkspace
        data={[{ region: "North" }]}
        initialSettings={makeSettings()}
        viewName="Orders"
      />
    );
    await screen.findByTestId("workspace");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Local save failed"
    );
    fireEvent.click(screen.getByRole("button", { name: "Export analysis" }));
    expect(click).toHaveBeenCalled();

    vi.mocked(Storage.prototype.setItem).mockRestore();
    for (let index = 0; index < 55; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Emit filter" }));
    }
    expect(screen.getByText(/50 of 50 checkpoints saved/)).toBeInTheDocument();
    expect(readSavedViewsSession()?.history).toHaveLength(50);
  });
});
