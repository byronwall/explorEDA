import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";

vi.mock("../PlotManager", async () => {
  const { useDataLayer } = await import("@/providers/DataLayerProvider");
  const { ChartSpecPanel } = await import("../ChartSpecPanel");
  return {
    PlotManager() {
      const chart = useDataLayer((state) => state.charts[0]!);
      const updateChart = useDataLayer((state) => state.updateChart);
      return (
        <>
          <button
            onClick={() =>
              updateChart(chart.id, {
                title: "Edited chart",
                layout: { ...chart.layout, x: 3, y: 4 },
              })
            }
          >
            Edit chart
          </button>
          <output aria-label="Rendered chart">
            {chart.title} at {chart.layout.x},{chart.layout.y}
          </output>
          <ChartSpecPanel />
        </>
      );
    },
  };
});

import { createRef } from "react";
import { ExplorEda, type ExplorEdaHandle } from "../ExplorEda";

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  Element.prototype.scrollIntoView = vi.fn();
});

it("reads initial and edited chart settings from the same rendered state", async () => {
  const workspace = createRef<ExplorEdaHandle>();
  const onStateChange = vi.fn();
  const data = [{ value: 1 }, { value: 2 }];
  render(
    <ExplorEda ref={workspace} data={data} onStateChange={onStateChange} />
  );

  const initial = workspace.current!.getSettings();
  expect(initial.charts).toHaveLength(2);
  expect(onStateChange).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole("button", { name: "Edit chart" }));
  const edited = workspace.current!.getSettings().charts[0]!;
  await waitFor(() =>
    expect(screen.getByLabelText("Rendered chart")).toHaveTextContent(
      "Edited chart at 3,4"
    )
  );
  expect(edited.title).toBe("Edited chart");
  expect(edited.layout).toMatchObject({ x: 3, y: 4 });
  expect(
    within(screen.getByRole("navigation", { name: "Charts" })).getByRole(
      "button",
      { name: /Edited chart/ }
    )
  ).toHaveTextContent("x 3 · y 4");
  expect(onStateChange).toHaveBeenCalledTimes(1);
  expect(onStateChange.mock.calls[0]![0].charts[0]).toMatchObject({
    title: "Edited chart",
    layout: { x: 3, y: 4 },
  });
});
