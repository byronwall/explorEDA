import { describe, expect, it, vi } from "vitest";
import { focusChartInContainer } from "../PlotManager";

describe("focusChartInContainer", () => {
  it("focuses and scrolls the mounted chart wrapper by its stable id", () => {
    const container = document.createElement("div");
    const chart = document.createElement("div");
    chart.dataset.chartId = "new-chart";
    chart.tabIndex = -1;
    chart.scrollIntoView = vi.fn();
    container.append(chart);
    document.body.append(container);

    focusChartInContainer(container, "new-chart");

    expect(chart).toHaveFocus();
    expect(chart.scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    });
  });
});
