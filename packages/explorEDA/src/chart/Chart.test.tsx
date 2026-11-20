import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// jsdom has no WebGL; the 3D scatter draws through a stand-in renderer.
vi.mock("three", async (importOriginal) => {
  const three = await importOriginal<typeof import("three")>();
  class WebGLRenderer {
    domElement = document.createElement("canvas");
    setSize() {}
    setPixelRatio() {}
    setClearColor() {}
    render() {}
    dispose() {}
    forceContextLoss() {}
  }
  return { ...three, WebGLRenderer };
});
import { chartRegistry } from "@/charts/registry";
import { Chart } from "./index";
import { SAMPLE_CONFIGS as CONFIGS, SAMPLE_ROWS as ROWS } from "./samples";
import { toChartSettings } from "./config";
import {
  DataLayerProvider,
  useDataLayer,
  useDataLayerSnapshot,
} from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";

// jsdom has no 2D canvas either; canvas charts skip their drawing.
HTMLCanvasElement.prototype.getContext = (() =>
  null) as typeof HTMLCanvasElement.prototype.getContext;

describe("Chart", () => {
  it("has a smoke config for every registered chart type", () => {
    expect(Object.keys(CONFIGS).sort()).toEqual(
      chartRegistry
        .getAll()
        .map((definition) => definition.type)
        .sort()
    );
  });

  it.each(Object.entries(CONFIGS))(
    "draws %s from rows and a config",
    (_, config) => {
      const { container } = render(
        <Chart data={ROWS} config={config} width={480} height={320} />
      );
      const root = container.querySelector(".eda-standalone");
      expect(root).not.toBeNull();
      expect(
        root!.querySelector("svg, canvas, table, [role='grid']") ??
          root!.textContent?.trim()
      ).toBeTruthy();
    }
  );

  it("draws category colors for a dark host", () => {
    const config = {
      type: "bar",
      field: "Region",
      colorField: "Region",
    } as const;
    const fills = (container: HTMLElement) =>
      [...container.querySelectorAll<SVGElement>("rect[data-plan-id]")]
        .map((rect) => rect.getAttribute("fill") || rect.style.fill)
        .sort()
        .join(" ");
    const light = render(
      <Chart data={ROWS} config={config} width={400} height={300} />
    );
    const dark = render(
      <div className="dark">
        <Chart data={ROWS} config={config} width={400} height={300} />
      </div>
    );
    expect(fills(light.container)).not.toBe("");
    expect(fills(dark.container)).not.toBe(fills(light.container));
  });

  it("fills its parent when no size is given", () => {
    const sized = class {
      constructor(private report: ResizeObserverCallback) {}
      observe(element: Element) {
        const contentRect = { width: 420, height: 260 } as DOMRectReadOnly;
        this.report(
          [{ target: element, contentRect } as ResizeObserverEntry],
          this as unknown as ResizeObserver
        );
      }
      unobserve() {}
      disconnect() {}
    };
    const original = globalThis.ResizeObserver;
    globalThis.ResizeObserver = sized as unknown as typeof ResizeObserver;
    try {
      const { container } = render(
        <Chart data={ROWS} config={{ type: "bar", field: "Region" }} />
      );
      const svg = container.querySelector(".eda-standalone svg");
      expect(svg?.getAttribute("width")).toBe("420");
    } finally {
      globalThis.ResizeObserver = original;
    }
  });

  it("shows the config title, a field-based name, or nothing", () => {
    const { container, rerender } = render(
      <Chart
        data={ROWS}
        config={{ type: "bar", field: "Region" }}
        width={300}
        height={200}
      />
    );
    expect(container.querySelector(".eda-standalone-title")?.textContent).toBe(
      "Bar Chart"
    );
    rerender(
      <Chart
        data={ROWS}
        config={{ type: "bar", field: "Region", title: "Sales" }}
        width={300}
        height={200}
      />
    );
    expect(container.querySelector(".eda-standalone-title")?.textContent).toBe(
      "Sales"
    );
    rerender(
      <Chart
        data={ROWS}
        config={{ type: "bar", field: "Region" }}
        title={false}
        width={300}
        height={200}
      />
    );
    expect(container.querySelector(".eda-standalone-title")).toBeNull();
  });

  it("drops the filters a chart writes, but keeps other edits", () => {
    const chart = toChartSettings({ type: "bar", field: "Region" }, "c1");
    let api:
      | {
          update: (u: Partial<ChartSettings>) => void;
          read: () => ChartSettings;
        }
      | undefined;
    function Probe() {
      const updateChart = useDataLayer((state) => state.updateChart);
      const getState = useDataLayerSnapshot();
      api = {
        update: (u) => updateChart("c1", u),
        read: () => getState().charts[0] as ChartSettings,
      };
      return null;
    }
    render(
      <DataLayerProvider data={ROWS} charts={[chart]} selections={false}>
        <Probe />
      </DataLayerProvider>
    );
    act(() =>
      api!.update({
        filters: [{ type: "value", field: "Region", values: ["West"] }],
      })
    );
    expect(api!.read().filters).toEqual([]);
    act(() => api!.update({ title: "Kept" }));
    expect(api!.read().title).toBe("Kept");
  });
});
