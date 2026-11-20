import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { chartRegistry } from "@/charts/registry";
import { Chart } from "./index";
import { SAMPLE_ROWS } from "./samples";

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

// A fresh module graph: `exploreda/chart` has registered nothing yet.
describe("exploreda/chart loads chart types on demand", () => {
  it("holds the chart's box, then draws once its type arrives", async () => {
    const { container } = render(
      <Chart
        data={SAMPLE_ROWS}
        config={{ type: "bar", field: "Region" }}
        width={300}
        height={200}
      />
    );
    const holder = screen.getByRole("status", { name: "Loading chart" });
    expect(holder.style.height).toBe("200px");
    await waitFor(() =>
      expect(container.querySelector(".eda-standalone svg")).not.toBeNull()
    );
    // Only the type that drew was loaded.
    expect(chartRegistry.has("bar")).toBe(true);
    expect(chartRegistry.has("map")).toBe(false);
  });

  it("loads every type for Dashboard text, which can name any", async () => {
    const { container } = render(
      <Chart
        data={SAMPLE_ROWS}
        config="scatter x=Price y=Rating"
        width={300}
        height={200}
      />
    );
    await waitFor(() =>
      expect(container.querySelector(".eda-standalone svg")).not.toBeNull()
    );
    expect(chartRegistry.has("map")).toBe(true);
  });

  it("says so for a type that does not exist", () => {
    render(
      <Chart
        data={SAMPLE_ROWS}
        config={{ type: "nonsense" } as never}
        width={300}
        height={200}
      />
    );
    expect(screen.getByRole("alert").textContent).toBe(
      '"nonsense" isn\'t a chart type.'
    );
  });
});
