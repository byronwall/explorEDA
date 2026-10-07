import { readFileSync } from "node:fs";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
        sidePanels?: import("exploreda").ExplorEdaSidePanel[];
        readOnly?: boolean;
        toolbarStart?: React.ReactNode;
        toolbarEnd?: React.ReactNode;
      }
    >(
      (
        {
          data,
          savedData,
          onStateChange,
          sidePanels = [],
          readOnly,
          toolbarStart,
          toolbarEnd,
        },
        ref
      ) => {
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
            "data-read-only": readOnly ? "true" : "false",
          },
          toolbarStart,
          toolbarEnd,
          ...sidePanels.map((panel) =>
            React.createElement(
              React.Fragment,
              { key: panel.id },
              React.createElement(
                "button",
                {
                  "aria-pressed": panel.open,
                  onClick: () => panel.onOpenChange(!panel.open),
                },
                panel.label
              ),
              panel.open &&
                React.createElement(
                  "aside",
                  { "aria-label": panel.label },
                  panel.actions,
                  panel.banner,
                  panel.children
                )
            )
          ),
          React.createElement("input", {
            "aria-label": "Editor draft",
            value: draft,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
              setDraft(event.target.value),
            onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") {
                emit("filter");
              }
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
      }
    ),
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

function openHistory() {
  const toggle = screen.getByRole("button", { name: "History" });
  if (toggle.getAttribute("aria-pressed") !== "true") {
    fireEvent.click(toggle);
  }
  return screen.getByRole("complementary", { name: "History" });
}

function station(index: number) {
  const list = screen.getByRole("list", { name: "Checkpoints, newest first" });
  const button = within(list)
    .getAllByRole("button")
    .find((candidate) => candidate.dataset.index === String(index));
  if (!button) {
    throw new Error(`No checkpoint ${index}`);
  }
  return button;
}

function mountOf() {
  return screen.getByTestId("workspace").getAttribute("data-mount");
}

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
    const initialMount = mountOf();
    fireEvent.change(editor, { target: { value: "unfinished expression" } });
    editor.focus();
    fireEvent.keyDown(editor, { key: "Enter" });
    expect(editor).toHaveFocus();
    expect(editor).toHaveValue("unfinished expression");
    expect(mountOf()).toBe(initialMount);

    fireEvent.click(screen.getByRole("button", { name: "Emit filter" }));
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      /^Filter · Changed a Rows filter/
    );
    const beforeChartMount = mountOf();
    fireEvent.click(screen.getByRole("button", { name: "Emit chart" }));
    expect(mountOf()).toBe(beforeChartMount);
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-chart-count",
      "1"
    );
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      /^View ·/
    );
    fireEvent.click(screen.getByRole("button", { name: "Emit both" }));
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      /^View \+ filter ·/
    );
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-filter-count",
      "1"
    );

    const beforeNewView = mountOf();
    fireEvent.click(screen.getByRole("button", { name: "New view" }));
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(mountOf()).not.toBe(beforeNewView);
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      "Created view “New view”"
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
      "Shared · Added calculation “total”"
    );
    fireEvent.click(screen.getByRole("tab", { name: "Sales" }));
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-calculation-count",
      "1"
    );
    fireEvent.click(screen.getByRole("tab", { name: "New view" }));

    // Previewing an earlier step shows it read-only and saves nothing.
    await screen.findByRole("button", { name: "Saved. Open history" });
    const beforePreview = localStorage.getItem("exploreda.saved-views.v1");
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
    const panel = openHistory();
    expect(within(panel).getByText("Added calculation “total”")).toBeVisible();
    const beforePreviewMount = mountOf();
    fireEvent.click(station(newViewCheckpoint));
    expect(mountOf()).not.toBe(beforePreviewMount);
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-calculation-count",
      "0"
    );
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-read-only",
      "true"
    );
    expect(screen.getByText(/^Previewing/)).toBeInTheDocument();
    expect(station(newViewCheckpoint)).toHaveFocus();
    expect(station(newViewCheckpoint)).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("exploreda.saved-views.v1")).toBe(
      beforePreview
    );
    expect(screen.getByRole("button", { name: "New view" })).toBeDisabled();
    fireEvent.click(screen.getByRole("tab", { name: "Sales" }));
    expect(screen.getByRole("tab", { name: "Sales" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    const previewMount = mountOf();
    fireEvent.click(screen.getByRole("button", { name: "Back to present" }));
    expect(screen.queryByText(/^Previewing/)).toBeNull();
    expect(mountOf()).not.toBe(previewMount);
    expect(screen.getByRole("tab", { name: "New view" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-calculation-count",
      "1"
    );
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-read-only",
      "false"
    );

    const beforeUndoMount = mountOf();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(mountOf()).not.toBe(beforeUndoMount);
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-calculation-count",
      "0"
    );
    const beforeRedoMount = mountOf();
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(mountOf()).not.toBe(beforeRedoMount);
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-calculation-count",
      "1"
    );

    // Restoring keeps the present recoverable with Undo.
    fireEvent.click(station(newViewCheckpoint));
    fireEvent.click(screen.getByRole("tab", { name: "Sales" }));
    expect(screen.getByRole("tab", { name: "Sales" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    const historyBeforeRestore = readSavedViewsSession()!.history.length;
    fireEvent.click(
      screen.getByRole("button", { name: "Restore this version" })
    );
    await waitFor(() => {
      expect(screen.queryByText(/^Previewing/)).toBeNull();
      expect(readSavedViewsSession()!.history).toHaveLength(
        historyBeforeRestore + 1
      );
    });
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      /Restored the version from/
    );
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
    // The restore that the new edit replaced stays on a branch.
    expect(
      within(screen.getByRole("complementary", { name: "History" })).getByText(
        "Replaced"
      )
    ).toBeInTheDocument();

    const saved = readSavedViewsSession();
    const restoredRows = saved ? getSavedViewsRows(saved) : [];
    expect(restoredRows).toEqual(data);
    expect(Object.hasOwn(restoredRows[0] ?? {}, "missing")).toBe(true);
    expect(Number.isNaN(restoredRows[0]?.ratio)).toBe(true);
    expect(saved?.history.every((entry) => !("sourceAnalysis" in entry))).toBe(
      true
    );
    expect(screen.getByText(/latest 50 steps/)).toBeInTheDocument();
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
    // The tabs sit in the workspace toolbar and remount with each view, so
    // focus moves to the new copy of the selected tab.
    const sales = () => screen.getByRole("tab", { name: "Sales" });
    const newView = () => screen.getByRole("tab", { name: "New view" });

    sales().focus();
    fireEvent.keyDown(sales(), { key: "ArrowRight" });
    expect(newView()).toHaveFocus();
    expect(newView()).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(newView(), { key: "ArrowLeft" });
    expect(sales()).toHaveFocus();
    expect(sales()).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(sales(), { key: "End" });
    expect(newView()).toHaveFocus();
    fireEvent.keyDown(newView(), { key: "Home" });
    expect(sales()).toHaveFocus();

    // A switch by pointer leaves focus where it was.
    fireEvent.click(screen.getByRole("button", { name: "Emit chart" }));
    fireEvent.click(newView());
    expect(newView()).toHaveAttribute("aria-selected", "true");
  });

  it("renames, duplicates, moves, and deletes views with undo", async () => {
    render(
      <SavedViewsWorkspace
        data={[]}
        initialSettings={makeSettings()}
        viewName="Sales"
      />
    );
    await screen.findByTestId("workspace");
    fireEvent.click(screen.getByRole("button", { name: "Emit chart" }));

    const sales = screen.getByRole("tab", { name: "Sales" });
    fireEvent.keyDown(sales, { key: "F2" });
    const name = screen.getByRole("textbox", { name: "View name" });
    fireEvent.change(name, { target: { value: "Store orders" } });
    fireEvent.keyDown(name, { key: "Enter" });
    expect(screen.getByRole("tab", { name: "Store orders" })).toBeVisible();
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      "Renamed view “Sales” to “Store orders”"
    );

    // Escape leaves the name as it was.
    fireEvent.doubleClick(screen.getByRole("tab", { name: "Store orders" }));
    const again = screen.getByRole("textbox", { name: "View name" });
    fireEvent.change(again, { target: { value: "Discarded" } });
    fireEvent.keyDown(again, { key: "Escape" });
    expect(screen.queryByRole("tab", { name: "Discarded" })).toBeNull();

    fireEvent.keyDown(
      screen.getByRole("button", { name: "Options for Store orders" }),
      { key: "ArrowDown" }
    );
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Duplicate view" })
    );
    const copy = screen.getByRole("tab", { name: "Store orders copy" });
    expect(copy).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-chart-count",
      "1"
    );
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      "Duplicated “Store orders” as “Store orders copy”"
    );

    fireEvent.keyDown(
      screen.getByRole("button", { name: "Options for Store orders copy" }),
      { key: "ArrowDown" }
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Move left" }));
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Store orders copy",
      "Store orders",
    ]);

    fireEvent.keyDown(
      screen.getByRole("button", { name: "Options for Store orders copy" }),
      { key: "ArrowDown" }
    );
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Delete view" })
    );
    expect(screen.getAllByRole("tab")).toHaveLength(1);
    expect(screen.getByText(/Deleted “Store orders copy”/)).toBeInTheDocument();
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      "Deleted view “Store orders copy”"
    );

    // The platform shortcut undoes the delete outside text fields.
    act(() => {
      fireEvent.keyDown(document.body, { key: "z", ctrlKey: true });
    });
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    act(() => {
      fireEvent.keyDown(document.body, {
        key: "z",
        ctrlKey: true,
        shiftKey: true,
      });
    });
    expect(screen.getAllByRole("tab")).toHaveLength(1);
    const editor = screen.getByRole("textbox", { name: "Editor draft" });
    fireEvent.keyDown(editor, { key: "z", ctrlKey: true });
    expect(screen.getAllByRole("tab")).toHaveLength(1);
  });

  it("captures defaults before labeling the first filter edit", async () => {
    render(<SavedViewsWorkspace data={[]} viewName="Orders" />);
    await screen.findByTestId("workspace");
    fireEvent.click(screen.getByRole("button", { name: "Emit filter" }));
    expect(screen.getByTestId("current-history-label")).toHaveTextContent(
      /^Filter ·/
    );
  });

  it("saves the latest session on pagehide before the deferred write", async () => {
    const data = [{ region: "North" }];
    render(
      <SavedViewsWorkspace
        data={data}
        initialSettings={makeSettings()}
        viewName="Orders"
      />
    );
    await screen.findByTestId("workspace");
    fireEvent.click(screen.getByRole("button", { name: "Emit filter" }));
    fireEvent(window, new Event("pagehide"));

    expect(readSavedViewsSession()?.history.at(-1)?.label).toBe("Filter");
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
    await waitFor(() =>
      expect(localStorage.getItem("exploreda.saved-views.v1")).not.toBeNull()
    );
    const saved = localStorage.getItem("exploreda.saved-views.v1")!;
    const session = readSavedViewsSession()!;
    const storageBytes = new Blob([saved]).size;
    expect(session.history).toHaveLength(50);
    expect(session.history.every((entry) => !("sourceAnalysis" in entry))).toBe(
      true
    );
    // Parents still point inside the kept history after the oldest drop.
    expect(
      session.history.every(
        (entry) =>
          entry.parent === undefined ||
          (entry.parent >= 0 && entry.parent < session.history.length)
      )
    ).toBe(true);
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
    expect(
      screen.getByRole("button", { name: "Not saved. Open history" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Export analysis" }));
    expect(click).toHaveBeenCalled();

    vi.mocked(Storage.prototype.setItem).mockRestore();
    for (let index = 0; index < 55; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Emit filter" }));
    }
    await screen.findByRole("button", { name: "Saved. Open history" });
    fireEvent.click(
      screen.getByRole("button", { name: "Saved. Open history" })
    );
    expect(screen.getByText(/latest 50 steps; 50 are saved/)).toBeVisible();
    expect(readSavedViewsSession()?.history).toHaveLength(50);
  });
});
