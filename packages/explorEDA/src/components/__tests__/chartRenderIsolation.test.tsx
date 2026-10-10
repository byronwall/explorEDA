import { act, render } from "@testing-library/react";
import { memo, Profiler, useEffect, useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { chartRegistry } from "@/charts/registry";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { useCreateCharts } from "@/hooks/useCreateCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings, ChartType } from "@/types/ChartTypes";
import { sameGridPanelProps } from "../GridChartPanel";
import { PlotChartPanel } from "../PlotChartPanel";

/**
 * Every chart type, drawn as the workspace grid draws it. Editing one chart's
 * text or style must leave every other panel alone; a filter must reach them.
 * A new chart type is covered without changes here. When it fails, a hook in
 * that type's panel subscribes to more of the store than it reads: see
 * docs/performance-checks.md.
 */

const rows = Array.from({ length: 24 }, (_, index) => ({
  value: index * 3,
  size: (index % 5) + 1,
  score: (index * 7) % 11,
  group: ["North", "South", "East"][index % 3],
  kind: ["A", "B"][index % 2],
  date: `2024-0${(index % 9) + 1}-1${index % 9}`,
  lat: 40 + index / 10,
  lon: -100 + index / 10,
}));

/** Types that cannot draw in jsdom. Each needs a reason. */
const SKIPPED: Partial<Record<ChartType, string>> = {
  "3d-scatter": "needs WebGL",
};

interface Commit {
  id: string;
}

type PanelProps = Parameters<typeof PlotChartPanel>[0];

/**
 * The grid's panel with a profiler inside its memo boundary. A profiler
 * outside it would report every time the list re-renders, even when the
 * panel itself is skipped.
 */
const MeasuredPanel = memo(function MeasuredPanel(
  props: PanelProps & { onCommit: (id: string) => void }
) {
  const { onCommit, ...panel } = props;
  return (
    <Profiler id={panel.settings.type} onRender={(id) => onCommit(id)}>
      <PlotChartPanel {...panel} />
    </Profiler>
  );
}, sameGridPanelProps);

function Workspace({ commits }: { commits: Commit[] }) {
  const charts = useDataLayer((state) => state.charts);
  const addChart = useDataLayer((state) => state.addChart);
  const { buildChart } = useCreateCharts();
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (added) return;
    setAdded(true);
    for (const definition of chartRegistry.getAll()) {
      if (SKIPPED[definition.type]) continue;
      const { id: _id, ...settings } = buildChart(definition.type, "", {
        x: 0,
        y: 0,
        w: 6,
        h: 4,
      });
      addChart({ ...settings, title: definition.type } as Omit<
        ChartSettings,
        "id"
      >);
    }
  }, [added, addChart, buildChart]);
  return (
    <>
      {charts.map((chart) => (
        <MeasuredPanel
          key={chart.id}
          settings={chart}
          width={480}
          height={320}
          onDelete={() => {}}
          onDuplicate={() => {}}
          onCommit={(id) => commits.push({ id })}
        />
      ))}
    </>
  );
}

let store: {
  charts: ChartSettings[];
  updateChart: (id: string, settings: Partial<ChartSettings>) => void;
};

function StoreHandle() {
  store = {
    charts: useDataLayer((state) => state.charts),
    updateChart: useDataLayer((state) => state.updateChart),
  };
  return null;
}

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

async function renderAllTypes() {
  const commits: Commit[] = [];
  render(
    <DataLayerProvider data={rows}>
      <StoreHandle />
      <Workspace commits={commits} />
    </DataLayerProvider>
  );
  // Let charts finish their first measurements and effects.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  return commits;
}

describe("chart render isolation", () => {
  it("draws a panel for every registered type", async () => {
    await renderAllTypes();
    const drawn = new Set(store.charts.map((chart) => chart.type));
    for (const definition of chartRegistry.getAll()) {
      if (SKIPPED[definition.type]) continue;
      expect(drawn, definition.type).toContain(definition.type);
    }
  });

  it.each([
    ["title", { title: "Renamed" }],
    ["subtitle", { subtitle: "A subtitle" }],
    ["note", { note: "Source: test" }],
    ["style", { style: { titleSize: 22 } }],
  ])("editing one chart's %s re-renders only that chart", async (_, edit) => {
    const commits = await renderAllTypes();
    const target = store.charts.find((chart) => chart.type === "bar")!;
    commits.length = 0;
    await act(async () => {
      store.updateChart(target.id, edit as Partial<ChartSettings>);
    });
    const others = [...new Set(commits.map((commit) => commit.id))].filter(
      (id) => id !== "bar"
    );
    expect(others).toEqual([]);
  });

  it("re-renders the other charts when a filter changes", async () => {
    const commits = await renderAllTypes();
    const target = store.charts.find((chart) => chart.type === "row")!;
    commits.length = 0;
    await act(async () => {
      store.updateChart(target.id, {
        filters: [{ type: "value", field: "group", values: ["North"] }],
      });
    });
    const touched = new Set(commits.map((commit) => commit.id));
    expect(touched.size).toBeGreaterThan(1);
  });
});
