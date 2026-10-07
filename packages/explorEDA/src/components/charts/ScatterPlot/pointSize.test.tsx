import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { scatterPlotDefinition, type ScatterPlotSettings } from "./definition";
import { planScatter, type ScatterSnapshot } from "./scatterPlan";
import { parsePointSize } from "./PointSizeSetting";
import { SurfaceLayer } from "./SurfaceLayer";
import { SurfaceSettings } from "./SurfaceSettings";

function setup(n: number, extra: Partial<ScatterPlotSettings> = {}) {
  const settings = scatterPlotDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 4,
    h: 4,
  });
  Object.assign(settings, {
    xField: "x",
    yField: "y",
    display: "contour",
    ...extra,
  });
  const ids = Array.from({ length: n }, (_, i) => i);
  const col = (f: (i: number) => datum): Record<number, datum> =>
    Object.fromEntries(ids.map((i) => [i, f(i)]));
  const snapshot: ScatterSnapshot = {
    revision: "1:1",
    allIds: ids,
    chartIds: ids,
    filteredIds: ids,
    xData: col((i) => i % 17),
    yData: col((i) => (i * 7) % 13),
    colorData: {},
    fieldSettings: {},
  };
  return planScatter(settings, snapshot, 400, 300);
}

/** The arc radius of every point drawn over the surface. */
function overlayRadii(plan: ReturnType<typeof planScatter>) {
  const { container } = render(
    <svg>
      <SurfaceLayer plan={plan} showPoints />
    </svg>
  );
  const d = [...container.querySelectorAll("path")]
    .map((path) => path.getAttribute("d"))
    .join("");
  return new Set([...d.matchAll(/a([\d.]+),/g)].map((match) => match[1]));
}

describe("points over a density surface", () => {
  it("use the chart's point radius instead of a fixed tiny dot", () => {
    expect(overlayRadii(setup(200))).toEqual(new Set(["3"]));
    expect(overlayRadii(setup(1599))).toEqual(new Set(["2.5"]));
    expect(overlayRadii(setup(200, { pointSize: 5 }))).toEqual(new Set(["5"]));
  });

  it("offers a point size setting while points are shown", () => {
    const settings = scatterPlotDefinition.createDefaultSettings({
      x: 0,
      y: 0,
      w: 4,
      h: 4,
    }) as ScatterPlotSettings;
    settings.display = "contour";
    const onSettingsChange = vi.fn();
    const { rerender } = render(
      <SurfaceSettings
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
    );
    fireEvent.change(screen.getByLabelText("Point size"), {
      target: { value: "4.5" },
    });
    expect(onSettingsChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ pointSize: 4.5 })
    );

    rerender(
      <SurfaceSettings
        settings={{ ...settings, contour: { showPoints: false } }}
        onSettingsChange={onSettingsChange}
      />
    );
    expect(screen.queryByLabelText("Point size")).toBeNull();
  });
});

describe("parsePointSize", () => {
  it("reads empty as automatic and rejects sizes out of range", () => {
    expect(parsePointSize("")).toBeUndefined();
    expect(parsePointSize("4")).toBe(4);
    expect(parsePointSize("0.5")).toBeNull();
    expect(parsePointSize("13")).toBeNull();
    expect(parsePointSize("abc")).toBeNull();
  });
});
