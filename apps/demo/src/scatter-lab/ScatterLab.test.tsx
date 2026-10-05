import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ScatterLab from "./ScatterLab";
import { defaults, exportSettings } from "./settings";

// Component-unit tests only. Real Chromium checks in the report exercise the
// real canvas and public ExplorEda; this jsdom context is not visual evidence.
// In particular, do NOT replace Node's AbortController or AbortSignal.
beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  const context = new Proxy({} as CanvasRenderingContext2D, {
    get: () => vi.fn(),
    set: () => true,
  });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => context);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function smallLab() {
  const settings = defaults(); settings.fixture.n = 20;
  return render(<ScatterLab initialSettings={settings} />);
}
function choose(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}
describe("scatter lab visible interactions", () => {
  it("separates filtering from a fixed reference, then clears and resets", () => {
    const { container } = smallLab();
    const main = () => container.querySelector("main")!;
    choose("External group filter", "A");
    expect(main().getAttribute("data-analysis-count")).toBe("10");
    fireEvent.click(screen.getByText("Fields, populations and coordinates"));
    choose("Reference fit", "full");
    choose("External cohort filter", "held-out");
    expect(main().getAttribute("data-analysis-count")).toBe("3");
    expect(main().getAttribute("data-reference-count")).toBe("20");
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(main().getAttribute("data-analysis-count")).toBe("20");
    fireEvent.click(screen.getByRole("button", { name: "Reset preset" }));
    expect(main().getAttribute("data-analysis-count")).toBe("1000");
  });
  it("enables required layers, exposes exact bins, and inspects a source row", () => {
    const { container } = smallLab();
    for (const label of ["Hexagonal bins", "Density fill", "Density contours", "Mean region", "Distance diagnostics", "Principal axes", "Marginal histograms"]) {
      const button = screen.getByRole("button", { name: label });
      fireEvent.click(button); expect(button.getAttribute("aria-pressed")).toBe("true");
    }
    expect(screen.getByLabelText("Inspect hexagonal bin").querySelectorAll("option").length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText("Source row index"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Inspect source row" }));
    expect(container.querySelector("[data-inspected-id]")?.getAttribute("data-inspected-id")).toBe("synthetic:20261003:3");
    expect(container.querySelector(".sl-inspected")?.textContent).toContain("Squared Mahalanobis distance D²");
  });
  it("restores settings, rejects bad versions, and disables categorical statistics", () => {
    const { container } = smallLab();
    fireEvent.click(screen.getByText("Restore or edit reproducible settings"));
    const settings = defaults("ring"); settings.fixture.n = 20; settings.method.hexRadius = 23; settings.layers.hex = true;
    const input = screen.getByLabelText("Scatter lab settings JSON");
    fireEvent.change(input, { target: { value: exportSettings(settings) } });
    fireEvent.click(screen.getByRole("button", { name: "Restore settings" }));
    expect(container.querySelector("main")?.getAttribute("data-fixture")).toBe("ring");
    expect((screen.getByLabelText("Hex radius (px)") as HTMLInputElement).value).toBe("23");
    fireEvent.change(input, { target: { value: '{"format":"exploreda-scatter-lab","version":99}' } });
    fireEvent.click(screen.getByRole("button", { name: "Restore settings" }));
    expect(screen.getByRole("alert").textContent).toContain("version 1");
    fireEvent.click(screen.getByText("Fields, populations and coordinates"));
    choose("X field", "group");
    expect((screen.getByRole("button", { name: "Data ellipse" }) as HTMLButtonElement).disabled).toBe(true);
    expect(container.querySelector(".sl-empty")?.textContent).toContain("two numeric fields");
  });
});
