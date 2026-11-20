import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Chart } from "./index";
import { textToSavedData, toChartSettings } from "./config";
import { SAMPLE_ROWS } from "./samples";
import { registerAllCharts } from "@/charts/registerAllCharts";

// These tests draw charts; loading types on demand has its own test.
registerAllCharts();

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

describe("a Dashboard text config", () => {
  it("builds the same chart as the object form", () => {
    const text = textToSavedData("scatter x=Price y=Rating", SAMPLE_ROWS, "c1")
      .savedData.charts[0];
    const object = toChartSettings(
      { type: "scatter", xField: "Price", yField: "Rating" },
      "c1"
    );
    expect(text).toMatchObject({
      id: "c1",
      type: "scatter",
      xField: object.type === "scatter" ? object.xField : "",
      yField: "Rating",
    });
  });

  it("draws a summary chart from one line", () => {
    const { container } = render(
      <Chart
        data={SAMPLE_ROWS}
        config="metric sum(Units)"
        width={300}
        height={160}
      />
    );
    const total = SAMPLE_ROWS.reduce((sum, row) => sum + row.Units, 0);
    expect(container.textContent).toContain(String(total));
  });

  it("shows the problem when the text builds no chart", () => {
    render(
      <Chart
        data={SAMPLE_ROWS}
        config="scatter x=Nope"
        width={300}
        height={160}
      />
    );
    expect(screen.getByRole("alert").textContent).toMatch(/\S/);
  });
});
