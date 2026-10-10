import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { barChartDefinition } from "../charts/BarChart/definition";
import { boxPlotDefinition } from "../charts/BoxPlot/definition";
import { rowChartDefinition } from "../charts/RowChart/definition";
import { PlotChartPanel } from "../PlotChartPanel";
import { GlobalAlertDialog } from "../GlobalAlertDialog";
import { useAlertStore } from "@/stores/alertStore";

beforeAll(() => {
  registerAllCharts();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  Element.prototype.scrollIntoView = vi.fn();
});

it("runs chart actions with keys while the pointer is over the chart", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values",
    filters: [{ type: "range" as const, field: "value", min: 2 }],
  };
  const onDelete = vi.fn();
  const onDuplicate = vi.fn();
  function Panel() {
    const charts = useDataLayer((s) => s.charts);
    return (
      <PlotChartPanel
        settings={charts[0]!}
        width={500}
        height={400}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    );
  }
  render(
    <DataLayerProvider data={[{ value: 1 }, { value: 2 }]} charts={[chart]}>
      <Panel />
    </DataLayerProvider>
  );
  const panel = screen.getByRole("region", { name: "Values" });
  fireEvent.pointerEnter(panel);
  fireEvent.keyDown(document, { key: "d" });
  expect(onDuplicate).toHaveBeenCalledOnce();
  fireEvent.pointerLeave(panel);
  fireEvent.keyDown(document, { key: "d" });
  expect(onDuplicate).toHaveBeenCalledOnce();
  const settingsButton = screen.getByRole("button", {
    name: "Configure Values",
  });
  act(() => settingsButton.focus());
  fireEvent.keyDown(settingsButton, { key: "d" });
  expect(onDuplicate).toHaveBeenCalledTimes(2);
  act(() => settingsButton.blur());
  fireEvent.pointerEnter(panel);

  fireEvent.keyDown(document, { key: "v" });
  expect(
    await screen.findByRole("dialog", { name: "Data for Values" })
  ).toBeInTheDocument();
  fireEvent.keyDown(document, { key: "d" });
  expect(onDuplicate).toHaveBeenCalledTimes(2);
  fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Data for Values" })
    ).not.toBeInTheDocument()
  );

  fireEvent.keyDown(document, { key: "s" });
  expect(
    await screen.findByRole("dialog", { name: "Settings for Values" })
  ).toBeInTheDocument();
  fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Settings for Values" })
    ).not.toBeInTheDocument()
  );

  fireEvent.keyDown(document, { key: "c" });
  expect(
    screen.queryByRole("button", { name: "Clear filters for Values" })
  ).not.toBeInTheDocument();
  fireEvent.keyDown(document, { key: "x" });
  expect(useAlertStore.getState().isOpen).toBe(true);
  await act(async () => useAlertStore.getState().closeAlert(true));
  expect(onDelete).toHaveBeenCalledOnce();
});

it("previews filtered rows without adding a chart and clears the chart filter from its header", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values",
    filters: [{ type: "range" as const, field: "value", min: 2 }],
  };
  function Panel() {
    const charts = useDataLayer((s) => s.charts);
    return (
      <>
        <output aria-label="Chart count">{charts.length}</output>
        <PlotChartPanel
          settings={charts[0]!}
          width={500}
          height={400}
          onDelete={() => {}}
          onDuplicate={() => {}}
        />
      </>
    );
  }
  render(
    <DataLayerProvider
      data={[{ value: 1 }, { value: 2 }, { value: 3 }]}
      charts={[chart]}
    >
      <Panel />
    </DataLayerProvider>
  );
  expect(
    screen.getByRole("button", { name: "Clear filters for Values" })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "View data for Values" }));
  const preview = await screen.findByRole("dialog", {
    name: "Data for Values",
  });
  expect(
    within(preview)
      .getAllByRole("cell")
      .map((cell) => cell.textContent)
  ).toEqual(["2", "3"]);
  expect(screen.getByLabelText("Chart count")).toHaveTextContent("1");
  fireEvent.keyDown(preview, { key: "Escape" });
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Data for Values" })
    ).not.toBeInTheDocument()
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Clear filters for Values" })
  );
  expect(
    screen.queryByRole("button", { name: "Clear filters for Values" })
  ).not.toBeInTheDocument();
});

it("marks the chart whose settings are open", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values",
  };
  render(
    <DataLayerProvider data={[{ value: 1 }, { value: 2 }]} charts={[chart]}>
      <PlotChartPanel
        settings={chart}
        width={500}
        height={400}
        onDelete={() => {}}
        onDuplicate={() => {}}
      />
    </DataLayerProvider>
  );
  const panel = screen.getByRole("region", { name: "Values" });
  expect(panel).not.toHaveAttribute("data-settings-open");
  fireEvent.click(screen.getByRole("button", { name: "Configure Values" }));
  await screen.findByRole("dialog", { name: "Settings for Values" });
  expect(panel).toHaveAttribute("data-settings-open", "true");
  fireEvent.keyDown(document.activeElement ?? document.body, {
    key: "Escape",
  });
  await waitFor(() => expect(panel).not.toHaveAttribute("data-settings-open"));
});

it("applies a chart type change together and can reset the edit session", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values",
  };
  function Panel() {
    const charts = useDataLayer((s) => s.charts);
    const updateChart = useDataLayer((s) => s.updateChart);
    return (
      <>
        <output aria-label="Chart type">{charts[0]!.type}</output>
        <button
          onClick={() =>
            updateChart(chart.id, {
              filters: [{ type: "range", field: "value", min: 2 }],
            })
          }
        >
          Filter externally
        </button>
        <PlotChartPanel
          settings={charts[0]!}
          width={500}
          height={400}
          onDelete={() => {}}
          onDuplicate={() => {}}
        />
      </>
    );
  }
  render(
    <DataLayerProvider data={[{ value: 1 }, { value: 2 }]} charts={[chart]}>
      <Panel />
    </DataLayerProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Configure Values" }));
  fireEvent.click(screen.getByRole("combobox", { name: "Chart type" }));
  fireEvent.click(await screen.findByRole("option", { name: "Row Chart" }));
  expect(
    screen.getByLabelText("Chart type", { selector: "output" })
  ).toHaveTextContent("row");
  fireEvent.click(screen.getByRole("button", { name: "Reset changes" }));
  expect(
    screen.getByLabelText("Chart type", { selector: "output" })
  ).toHaveTextContent("bar");
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Labels" }), {
    button: 0,
    ctrlKey: false,
  });
  fireEvent.change(screen.getByLabelText("Chart title"), {
    target: { value: "Edited" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Filter externally" }));
  fireEvent.click(screen.getByRole("button", { name: "Reset changes" }));
  expect(screen.getByLabelText("Chart title")).toHaveValue("Values");
  expect(
    screen.getByRole("button", { name: "Clear filters for Values" })
  ).toBeInTheDocument();
});

it("opens the shared bar trace popover from an Alt-click", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "category"
    ),
    title: "Categories",
  };
  render(
    <DataLayerProvider
      data={[{ category: "A" }, { category: "A" }, { category: "B" }]}
      charts={[chart]}
    >
      <PlotChartPanel
        settings={chart}
        width={500}
        height={400}
        onDelete={() => {}}
        onDuplicate={() => {}}
      />
    </DataLayerProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "A: 2 records" }), {
    altKey: true,
  });
  expect(
    await screen.findByRole("dialog", { name: "Bar trace inspector" })
  ).toHaveTextContent("Bar geometry");
});

it("clears a selected bar when another chart changes its filter scope", async () => {
  const first = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "category"
    ),
    title: "Categories",
  };
  const second = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values",
  };
  function Panels() {
    const updateChart = useDataLayer((state) => state.updateChart);
    const charts = useDataLayer((state) => state.charts);
    return (
      <>
        <button
          onClick={() =>
            updateChart(first.id, {
              filters: [{ type: "value", field: "category", values: ["B"] }],
            })
          }
        >
          Filter categories from values chart
        </button>
        <PlotChartPanel
          settings={charts[0]!}
          width={500}
          height={400}
          onDelete={() => {}}
          onDuplicate={() => {}}
        />
        <PlotChartPanel
          settings={charts[1]!}
          width={500}
          height={400}
          onDelete={() => {}}
          onDuplicate={() => {}}
        />
      </>
    );
  }
  render(
    <DataLayerProvider
      data={[
        { category: "A", value: 1 },
        { category: "B", value: 2 },
      ]}
      charts={[first, second]}
    >
      <Panels />
    </DataLayerProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "A: 1 records" }), {
    altKey: true,
  });
  expect(
    await screen.findByRole("dialog", { name: "Bar trace inspector" })
  ).toHaveTextContent("Bar geometry");
  fireEvent.click(
    screen.getByRole("button", { name: "Filter categories from values chart" })
  );
  await waitFor(() =>
    expect(screen.queryByText("Bar geometry")).not.toBeInTheDocument()
  );
  expect(
    screen.getByRole("dialog", { name: "Bar trace inspector" })
  ).toHaveTextContent("Alt-click a bar");
});

it("omits the color legend on row charts and box plots, whose marks already label each color", async () => {
  const colorScale = {
    id: "category-colors",
    name: "category",
    sourceField: "category",
    type: "categorical" as const,
    palette: ["#1f77b4", "#ff7f0e"],
    mapping: [
      ["A", "#1f77b4"],
      ["B", "#ff7f0e"],
    ] as [string, string][],
  };
  const colored = {
    colorField: "category",
    colorScaleId: colorScale.id,
  };
  const rowChart = {
    ...rowChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "category"
    ),
    ...colored,
    title: "Rows by category",
  };
  const barChart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 6, y: 0, w: 6, h: 4 },
      "value"
    ),
    ...colored,
    title: "Values by category",
  };
  const boxPlot = {
    ...boxPlotDefinition.createDefaultSettings(
      { x: 0, y: 4, w: 6, h: 4 },
      "value"
    ),
    ...colored,
    title: "Value spread by category",
  };
  function Panels() {
    const charts = useDataLayer((s) => s.charts);
    return (
      <>
        {charts.map((chart) => (
          <PlotChartPanel
            key={chart.id}
            settings={chart}
            width={500}
            height={400}
            onDelete={() => {}}
            onDuplicate={() => {}}
          />
        ))}
      </>
    );
  }
  render(
    <DataLayerProvider
      data={[
        { category: "A", value: 1 },
        { category: "B", value: 2 },
      ]}
      savedData={{
        charts: [rowChart, barChart, boxPlot],
        calculations: [],
        gridSettings: {
          columnCount: 12,
          rowHeight: 100,
          containerPadding: 10,
          showBackgroundMarkers: false,
        },
        metadata: {
          name: "Legends",
          version: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          modifiedAt: "2026-01-01T00:00:00.000Z",
        },
        colorScales: [colorScale],
      }}
    >
      <Panels />
    </DataLayerProvider>
  );

  const legendItem = { name: /^Filter category by A/ };
  expect(
    await within(
      screen.getByRole("region", { name: "Values by category" })
    ).findByRole("button", legendItem)
  ).toBeInTheDocument();
  expect(
    within(
      screen.getByRole("region", { name: "Rows by category" })
    ).queryByRole("button", legendItem)
  ).not.toBeInTheDocument();
  expect(
    within(
      screen.getByRole("region", { name: "Value spread by category" })
    ).queryByRole("button", legendItem)
  ).not.toBeInTheDocument();
});

it("traces a faceted bar chart's facets, bars and title through one inspector", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "category"
    ),
    title: "Categories",
    facet: {
      enabled: true,
      type: "wrap" as const,
      rowVariable: "group",
      columnCount: 2,
    },
  };
  render(
    <DataLayerProvider
      data={[
        { category: "A", group: "left" },
        { category: "A", group: "left" },
        { category: "A", group: "right" },
        { category: "B", group: "right" },
      ]}
      charts={[chart]}
    >
      <PlotChartPanel
        settings={chart}
        width={700}
        height={500}
        onDelete={() => {}}
        onDuplicate={() => {}}
      />
    </DataLayerProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Focus left facet" }), {
    altKey: true,
  });
  const dialog = await screen.findByRole("dialog", {
    name: "Bar trace inspector",
  });
  expect(dialog).toHaveTextContent("Facet panel");
  expect(dialog).toHaveTextContent("2 source rows belong to this facet");

  fireEvent.click(screen.getAllByRole("button", { name: "A: 2 records" })[0]!, {
    altKey: true,
  });
  await waitFor(() => expect(dialog).toHaveTextContent("Contributors: 2 of 2"));

  const title = screen.getByRole("heading", { name: "Categories" });
  fireEvent.mouseUp(title, { altKey: true });
  await waitFor(() =>
    expect(dialog).toHaveTextContent("Chart title · Categories")
  );
});

it("opens the field inspector from an axis title with Command-click or its context menu", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values",
  };
  function Panel() {
    const charts = useDataLayer((s) => s.charts);
    return (
      <>
        <output aria-label="Chart count">{charts.length}</output>
        <PlotChartPanel
          settings={charts[0]!}
          width={500}
          height={400}
          onDelete={() => {}}
          onDuplicate={() => {}}
        />
      </>
    );
  }
  render(
    <DataLayerProvider
      data={[{ value: 1 }, { value: 2 }, { value: 3 }]}
      charts={[chart]}
    >
      <Panel />
    </DataLayerProvider>
  );

  const title = document.querySelector(
    '[data-field="value"][data-plan-id="x:label"]'
  )!;
  expect(title).toBeTruthy();
  fireEvent.click(title, { metaKey: true });
  expect(
    await screen.findByRole("dialog", { name: "Inspect field: value" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("group", { name: /Distribution of value/ })
  ).toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  );

  fireEvent.contextMenu(title, { clientX: 40, clientY: 60 });
  fireEvent.click(
    await screen.findByRole("menuitem", { name: "New chart of value" })
  );
  expect(screen.getByLabelText("Chart count")).toHaveTextContent("2");

  fireEvent.contextMenu(title, { clientX: 40, clientY: 60 });
  fireEvent.click(
    await screen.findByRole("menuitem", { name: "Inspect value" })
  );
  expect(
    await screen.findByRole("dialog", { name: "Inspect field: value" })
  ).toBeInTheDocument();
});

it("keeps chart actions in the header and settings free of them", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values",
  };
  const onDuplicate = vi.fn();
  render(
    <DataLayerProvider data={[{ value: 1 }, { value: 2 }]} charts={[chart]}>
      <PlotChartPanel
        settings={chart}
        width={500}
        height={400}
        onDelete={() => {}}
        onDuplicate={onDuplicate}
      />
    </DataLayerProvider>
  );
  const header = screen
    .getByRole("heading", { name: "Values" })
    .closest(".eda-panel-header") as HTMLElement;
  for (const name of [
    "View data for Values",
    "Duplicate Values",
    "Open details for Values",
    "Configure Values",
    "Delete Values",
  ]) {
    expect(within(header).getByRole("button", { name })).toBeInTheDocument();
  }
  fireEvent.click(
    within(header).getByRole("button", { name: "Duplicate Values" })
  );
  expect(onDuplicate).toHaveBeenCalledOnce();

  fireEvent.click(screen.getByRole("button", { name: "Configure Values" }));
  const settings = await screen.findByRole("dialog", {
    name: "Settings for Values",
  });
  expect(
    within(settings).queryByRole("button", {
      name: /Duplicate|Delete|View data/,
    })
  ).not.toBeInTheDocument();
});

it("keeps the chart when its delete confirmation is canceled", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values",
  };
  const onDelete = vi.fn();
  render(
    <DataLayerProvider data={[{ value: 1 }, { value: 2 }]} charts={[chart]}>
      <PlotChartPanel
        settings={chart}
        width={500}
        height={400}
        onDelete={onDelete}
        onDuplicate={() => {}}
      />
    </DataLayerProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Delete Values" }));
  expect(useAlertStore.getState()).toMatchObject({
    isOpen: true,
    title: "Delete chart?",
    confirmLabel: "Delete",
    destructive: true,
  });
  await act(async () => useAlertStore.getState().closeAlert(false));
  expect(onDelete).not.toHaveBeenCalled();
});

it("closes details on a second Escape while the confirmation exits", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values",
  };
  render(
    <DataLayerProvider data={[{ value: 1 }]} charts={[chart]}>
      <>
        <PlotChartPanel
          settings={chart}
          width={500}
          height={400}
          onDelete={() => {}}
          onDuplicate={() => {}}
        />
        <GlobalAlertDialog />
      </>
    </DataLayerProvider>
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Open details for Values" })
  );
  expect(
    await screen.findByRole("dialog", { name: "Values" })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Delete Values" }));
  expect(await screen.findByRole("alertdialog")).toBeInTheDocument();

  fireEvent.keyDown(document.body, { key: "Escape" });
  await waitFor(() => expect(useAlertStore.getState().isOpen).toBe(false));
  expect(screen.getByRole("dialog", { name: "Values" })).toBeInTheDocument();
  // Keep the closed alert layer mounted to model its browser exit animation.
  const closingAlert = document.createElement("div");
  closingAlert.setAttribute("role", "alertdialog");
  closingAlert.setAttribute("data-state", "closed");
  const focusedAlertAction = document.createElement("button");
  closingAlert.append(focusedAlertAction);
  closingAlert.addEventListener("keydown", (event) => event.stopPropagation());
  document.body.append(closingAlert);
  const nestedEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") event.preventDefault();
  };
  window.addEventListener("keydown", nestedEscape, true);
  expect(closingAlert.isConnected).toBe(true);
  fireEvent.keyDown(focusedAlertAction, { key: "Escape" });
  window.removeEventListener("keydown", nestedEscape, true);

  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Values" })
    ).not.toBeInTheDocument()
  );
  closingAlert.remove();
});

it("opens details with settings ready and data in a tab, without changing the charts", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values",
    filters: [{ type: "range" as const, field: "value", min: 2 }],
  };
  function Panel() {
    const charts = useDataLayer((s) => s.charts);
    return (
      <>
        <output aria-label="Charts">
          {charts.map((item) => JSON.stringify(item.layout)).join(" ")}
        </output>
        <PlotChartPanel
          settings={charts[0]!}
          width={500}
          height={400}
          onDelete={() => {}}
          onDuplicate={() => {}}
        />
      </>
    );
  }
  render(
    <DataLayerProvider
      data={[{ value: 1 }, { value: 2 }, { value: 3 }]}
      charts={[chart]}
    >
      <Panel />
    </DataLayerProvider>
  );
  const layouts = screen.getByLabelText("Charts").textContent;
  fireEvent.click(
    screen.getByRole("button", { name: "Open details for Values" })
  );
  const details = await screen.findByRole("dialog", { name: "Values" });
  // One chart renders, and its settings are already open beside it.
  expect(
    within(details).getAllByRole("region", { name: "Values" })
  ).toHaveLength(1);
  expect(screen.getAllByRole("region", { name: "Values" })).toHaveLength(1);
  expect(
    within(details).getByRole("tab", { name: "Settings" })
  ).toHaveAttribute("aria-selected", "true");
  expect(
    within(details).getByRole("combobox", { name: "Chart type" })
  ).toBeInTheDocument();
  expect(
    within(details).getByRole("button", { name: "Reset changes" })
  ).toBeInTheDocument();

  fireEvent.mouseDown(
    within(details).getByRole("tab", { name: "Chart data" }),
    {
      button: 0,
      ctrlKey: false,
    }
  );
  expect(
    within(details)
      .getAllByRole("cell")
      .map((cell) => cell.textContent)
  ).toEqual(["2", "3"]);
  expect(screen.getByLabelText("Charts")).toHaveTextContent(layouts!);

  fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Values" })
    ).not.toBeInTheDocument()
  );
  expect(screen.getByLabelText("Charts")).toHaveTextContent(layouts!);
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Open details for Values" })
    ).toHaveFocus()
  );
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

it("shows a subtitle and note in Compact without a clip marker", () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values climb through the year and peak in the last quarter",
    subtitle: "Monthly value, all sites",
    note: "Source: plant log",
    filters: [{ type: "range" as const, field: "value", min: 2 }],
  };
  // jsdom has no layout, so report a title taller than its two lines.
  const heights = vi
    .spyOn(HTMLElement.prototype, "scrollHeight", "get")
    .mockImplementation(function (this: HTMLElement) {
      return this.classList.contains("eda-panel-title") ? 90 : 0;
    });
  function Panel() {
    const charts = useDataLayer((s) => s.charts);
    return (
      <PlotChartPanel
        settings={charts[0]!}
        width={500}
        height={400}
        onDelete={() => {}}
        onDuplicate={() => {}}
      />
    );
  }
  const { container } = render(
    <DataLayerProvider data={[{ value: 1 }, { value: 2 }]} charts={[chart]}>
      <Panel />
    </DataLayerProvider>
  );
  const panel = container.querySelector(".eda-panel")!;
  // Compact keeps the one-line header and no clip marker.
  expect(panel).toHaveAttribute("data-headline", "inline");
  expect(screen.queryByRole("img", { name: "Title clipped" })).toBeNull();
  expect(screen.getByText("Monthly value, all sites")).toHaveClass(
    "eda-panel-subtitle"
  );
  expect(screen.getByText("Source: plant log")).toHaveClass("eda-panel-note");
  heights.mockRestore();
});

it("marks a clipped headline title under Newsprint", () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values climb through the year and peak in the last quarter",
    filters: [{ type: "range" as const, field: "value", min: 2 }],
  };
  const heights = vi
    .spyOn(HTMLElement.prototype, "scrollHeight", "get")
    .mockImplementation(function (this: HTMLElement) {
      return this.classList.contains("eda-panel-title") ? 90 : 0;
    });
  function Panel() {
    const charts = useDataLayer((s) => s.charts);
    const setTheme = useDataLayer((s) => s.setTheme);
    return (
      <>
        <button onClick={() => setTheme("newsprint")}>newsprint</button>
        <PlotChartPanel
          settings={charts[0]!}
          width={500}
          height={400}
          onDelete={() => {}}
          onDuplicate={() => {}}
        />
      </>
    );
  }
  const { container } = render(
    <DataLayerProvider data={[{ value: 1 }, { value: 2 }]} charts={[chart]}>
      <Panel />
    </DataLayerProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "newsprint" }));
  const panel = container.querySelector(".eda-panel")!;
  expect(panel).toHaveAttribute("data-eda-theme", "newsprint");
  expect(panel).toHaveAttribute("data-headline", "block");
  expect(
    screen.getByRole("img", { name: "Title clipped" })
  ).toBeInTheDocument();
  // The full title stays the panel's accessible name.
  expect(
    screen.getByRole("region", {
      name: "Values climb through the year and peak in the last quarter",
    })
  ).toBe(panel);
  // The filter control is status, not a hidden action.
  const clear = screen.getByRole("button", { name: /Clear filters for/ });
  expect(clear.closest(".eda-panel-status")).not.toBeNull();
  expect(clear.closest(".eda-panel-actions")).toBeNull();
  heights.mockRestore();
});
