import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { barChartDefinition } from "../charts/BarChart/definition";
import { PlotChartPanel } from "../PlotChartPanel";

const capture = vi.hoisted(() => vi.fn());
vi.mock("@/components/charts/export/chartImage", async (load) => ({
  ...(await load<typeof import("@/components/charts/export/chartImage")>()),
  captureChartPanel: capture,
}));

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

afterEach(() => {
  capture.mockReset();
});

function renderPanel() {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values by month",
  };
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
  render(
    <DataLayerProvider data={[{ value: 1 }, { value: 2 }]} charts={[chart]}>
      <Panel />
    </DataLayerProvider>
  );
  return screen.getByRole("region", { name: "Values by month" });
}

const image = () => ({
  blob: new Blob(["png"], { type: "image/png" }),
  width: 20,
  height: 10,
});

it("lists Copy and Download in the header's image menu", async () => {
  renderPanel();
  const trigger = screen.getByRole("button", {
    name: "Export image of Values by month",
  });
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "Enter" });
  expect(
    await screen.findByRole("menuitem", { name: /Copy image/ })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("menuitem", { name: /Download image/ })
  ).toBeVisible();
});

it("copies with E and downloads with Shift+E while the chart is hovered", async () => {
  const panel = renderPanel();
  capture.mockImplementation(async () => image());
  const write = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { write },
  });
  vi.stubGlobal(
    "ClipboardItem",
    class {
      constructor(public items: Record<string, Promise<Blob>>) {}
    }
  );
  fireEvent.pointerEnter(panel);
  fireEvent.keyDown(document, { key: "e" });
  await waitFor(() => expect(write).toHaveBeenCalledOnce());
  expect(capture).toHaveBeenCalledWith(panel, {
    id: expect.any(String),
    type: "bar",
  });

  const click = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => {});
  URL.createObjectURL = vi.fn(() => "blob:chart");
  URL.revokeObjectURL = vi.fn();
  fireEvent.keyDown(document, { key: "E", shiftKey: true });
  await waitFor(() => expect(click).toHaveBeenCalledOnce());
  const link = click.mock.contexts[0] as HTMLAnchorElement;
  expect(link.download).toMatch(/^values-by-month-\d{4}-\d{2}-\d{2}\.png$/);
  click.mockRestore();
  vi.unstubAllGlobals();
});

it("ignores Shift with other chart keys", () => {
  const panel = renderPanel();
  fireEvent.pointerEnter(panel);
  fireEvent.keyDown(document, { key: "D", shiftKey: true });
  fireEvent.keyDown(document, { key: "S", shiftKey: true });
  expect(capture).not.toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("offers the image on a right-click that no other menu answers", async () => {
  const panel = renderPanel();
  const body = panel.querySelector(".eda-chart-content") ?? panel;
  fireEvent.contextMenu(body, { clientX: 40, clientY: 60, shiftKey: true });
  expect(screen.queryByRole("menuitem", { name: /Copy image/ })).toBeNull();
  fireEvent.contextMenu(body, { clientX: 40, clientY: 60 });
  expect(
    await screen.findByRole("menuitem", { name: /Copy image/ })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("menuitem", { name: /Download image/ })
  ).toBeVisible();
});
