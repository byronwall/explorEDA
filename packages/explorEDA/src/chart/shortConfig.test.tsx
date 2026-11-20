import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Chart, type ChartConfig } from "./index";
import { chartText } from "@/docsKit/index";
import type { ChartSettings } from "@/types/ChartTypes";
import {
  shortConfig,
  sortedText,
  textToSavedData,
  toChartSettings,
} from "./config";
import { SAMPLE_CONFIGS, SAMPLE_ROWS } from "./samples";
import { registerAllCharts } from "@/charts/registerAllCharts";

// These tests draw charts; loading types on demand has its own test.
registerAllCharts();

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

describe("short configs", () => {
  it.each(Object.entries(SAMPLE_CONFIGS))(
    "%s: the short config draws the same chart",
    (_, config) => {
      const full = toChartSettings(config, "c1");
      const short = shortConfig(full);
      expect(sortedText(toChartSettings(short, "c1"))).toBe(sortedText(full));
      expect(sortedText(short).length).toBeLessThan(sortedText(full).length);
    }
  );

  it.each(Object.entries(SAMPLE_CONFIGS))(
    "%s: its Dashboard text builds the same short config",
    (_, config) => {
      const text = chartText(config, SAMPLE_ROWS);
      const chart = textToSavedData(text, SAMPLE_ROWS, "c1").savedData
        .charts[0] as ChartSettings;
      expect(sortedText(shortConfig(chart))).toBe(
        sortedText(shortConfig(toChartSettings(config, "c1")))
      );
    }
  );

  it("keeps only what differs from the defaults", () => {
    const full = toChartSettings(
      { type: "scatter", xField: "Price", yField: "Rating", display: "hexbin" },
      "c1"
    );
    expect(shortConfig(full)).toEqual({
      type: "scatter",
      xField: "Price",
      yField: "Rating",
      display: "hexbin",
    });
  });
});

describe("a config that cannot draw", () => {
  it("shows why in its place and leaves other charts drawn", () => {
    const { container } = render(
      <>
        <Chart
          data={SAMPLE_ROWS}
          config={{ type: "nonsense" } as unknown as ChartConfig}
          width={300}
          height={200}
        />
        <Chart
          data={SAMPLE_ROWS}
          config={{ type: "bar", field: "Region" }}
          width={300}
          height={200}
        />
      </>
    );
    expect(screen.getByRole("alert").textContent).toMatch(/nonsense/);
    expect(
      container.querySelectorAll(".eda-standalone svg").length
    ).toBeGreaterThan(0);
  });
});
