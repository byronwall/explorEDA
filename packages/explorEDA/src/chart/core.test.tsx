import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { entries } from "../../entries.json";
import { barChartDefinition } from "@/components/charts/BarChart/definition";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { chartRegistry } from "@/charts/registry";
import { CHART_IMPORTS, Chart, registerCharts } from "./core";
import { SAMPLE_ROWS } from "./samples";

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

// Each test file runs in a fresh module graph, so nothing is registered yet.
describe("exploreda/chart-core", () => {
  it("names the import to add for a type the page never registered", () => {
    render(
      <Chart
        data={SAMPLE_ROWS}
        config={{ type: "bar", field: "Region" }}
        width={300}
        height={200}
      />
    );
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toMatch(/^The bar chart isn't registered\. Add:/);
    expect(alert.querySelector("code")?.textContent).toBe(
      'import { barChartDefinition } from "exploreda/charts/bar";\nregisterCharts(barChartDefinition);'
    );
  });

  it("draws a type once it is registered", () => {
    registerCharts(barChartDefinition);
    const { container } = render(
      <Chart
        data={SAMPLE_ROWS}
        config={{ type: "bar", field: "Region" }}
        width={300}
        height={200}
      />
    );
    expect(container.querySelector(".eda-standalone svg")).not.toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("points every chart type at a package entry that exports it", () => {
    registerAllCharts();
    const modules = import.meta.glob("../components/charts/*/definition.ts", {
      eager: true,
    });
    const types = chartRegistry.getAll().map((definition) => definition.type);
    expect(Object.keys(CHART_IMPORTS).sort()).toEqual([...types].sort());
    for (const type of types) {
      const { entry, name } = CHART_IMPORTS[type];
      const source = (entries as Record<string, string>)[`charts/${entry}`];
      expect(source, `entries.json has charts/${entry}`).toBeDefined();
      const module = modules[`../${source!.replace(/^src\//, "")}`] as Record<
        string,
        { type?: string }
      >;
      expect(module?.[name]?.type, `${source} exports ${name}`).toBe(type);
    }
  });
});
