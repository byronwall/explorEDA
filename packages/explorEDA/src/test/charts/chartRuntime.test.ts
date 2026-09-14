import { describe, expect, it } from "vitest";
import { lineChartDefinition } from "../../components/charts/LineChart/definition";
import { calculateBeeSwarmPositions } from "../../components/charts/BoxPlot/boxPlotCalculations";
import { sampleData } from "../../components/SummaryTable/utils/samplingStrategy";
import { threeDScatterDefinition } from "../../components/charts/ThreeDScatter/definition";

describe("chart runtime", () => {
  it("applies line chart filters to row ids", () => {
    const settings = lineChartDefinition.createDefaultSettings({
      x: 0,
      y: 0,
      w: 4,
      h: 4,
    });
    settings.filters = [
      { type: "range", field: "x", min: 2, max: 3 },
    ];
    const filter = lineChartDefinition.getFilterFunction(settings, () => ({
      1: 1,
      2: 2,
      3: 3,
    }));

    expect(filter(1)).toBe(false);
    expect(filter(2)).toBe(true);
  });

  it("repeats seeded random samples", () => {
    const data = Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [i, i])
    );
    const options = { method: "random" as const, sampleSize: 5, seed: 42 };

    expect(sampleData(data, options)).toEqual(sampleData(data, options));
  });

  it("repeats seeded bee swarm samples", () => {
    const data = Array.from({ length: 1001 }, (_, i) => i);
    expect(calculateBeeSwarmPositions(data, 100, 1000, 42)).toEqual(
      calculateBeeSwarmPositions(data, 100, 1000, 42)
    );
  });

  it("starts 3D charts with a usable camera", () => {
    const settings = threeDScatterDefinition.createDefaultSettings({
      x: 0,
      y: 0,
      w: 4,
      h: 4,
    });
    expect(settings.cameraPosition.toArray()).toEqual([10, 10, 10]);
    expect(settings.cameraTarget.toArray()).toEqual([0, 0, 0]);
  });
});
