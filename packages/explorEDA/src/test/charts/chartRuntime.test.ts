import { describe, expect, it } from "vitest";
import { pivotTableDefinition } from "../../components/charts/PivotTable/definition";
import { lineChartDefinition } from "../../components/charts/LineChart/definition";
import { calculateBeeSwarmPositions } from "../../components/charts/BoxPlot/boxPlotCalculations";
import { sampleData } from "../../components/SummaryTable/utils/samplingStrategy";
import { threeDScatterDefinition } from "../../components/charts/ThreeDScatter/definition";
import { buildThreeDScatterData } from "../../components/charts/ThreeDScatter/useThreeDScatterData";
import { colorLegendDefinition } from "../../components/charts/ColorLegend/definition";

describe("chart runtime", () => {
  it("links legend categories across fields and preserves category value types", () => {
    const settings = colorLegendDefinition.createDefaultSettings({
      x: 0,
      y: 0,
      w: 6,
      h: 2,
    });
    settings.fields = ["position", "group"];
    const fields = {
      position: { 1: "PG", 2: "C", 3: "SF", 4: "PG" },
      group: { 1: 1, 2: 1, 3: 1, 4: 2 },
    };
    const getter = (name: string) => fields[name as keyof typeof fields];
    settings.filters = [
      { type: "value", field: "position", values: ["PG", "C"] },
      { type: "value", field: "group", values: [1] },
    ];
    expect(
      [1, 2, 3, 4].filter(
        colorLegendDefinition.getFilterFunction(settings, getter)
      )
    ).toEqual([1, 2]);
    settings.filters = [{ type: "value", field: "group", values: ["1"] }];
    expect(
      [1, 2, 3, 4].filter(
        colorLegendDefinition.getFilterFunction(settings, getter)
      )
    ).toEqual([]);
    settings.filters = [];
    expect(
      [1, 2, 3, 4].filter(
        colorLegendDefinition.getFilterFunction(settings, getter)
      )
    ).toEqual([1, 2, 3, 4]);
  });
  it("applies line chart filters to row ids", () => {
    const settings = lineChartDefinition.createDefaultSettings({
      x: 0,
      y: 0,
      w: 4,
      h: 4,
    });
    settings.filters = [{ type: "range", field: "x", min: 2, max: 3 }];
    const filter = lineChartDefinition.getFilterFunction(settings, () => ({
      1: 1,
      2: 2,
      3: 3,
    }));

    expect(filter(1)).toBe(false);
    expect(filter(2)).toBe(true);
  });

  it("intersects pivot fields while accepting alternatives within a field", () => {
    const settings = pivotTableDefinition.createDefaultSettings({
      x: 0,
      y: 0,
      w: 4,
      h: 4,
    });
    settings.rowFields = ["region", "channel"];
    settings.filters = [
      { type: "value", field: "region", values: ["East"] },
      { type: "value", field: "region", values: ["West"] },
      { type: "value", field: "channel", values: ["Web"] },
    ];
    const fields = {
      region: { 1: "East", 2: "West", 3: "East", 4: "North" },
      channel: { 1: "Web", 2: "Web", 3: "Store", 4: "Web" },
    };
    const filter = pivotTableDefinition.getFilterFunction(
      settings,
      (name) => fields[name as keyof typeof fields]
    );
    expect([1, 2, 3, 4].filter(filter)).toEqual([1, 2]);
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

  it("omits invalid 3D coordinates and normalizes finite sizes", () => {
    const result = buildThreeDScatterData(
      [1, 2, 3],
      [10, 20, 30],
      [100, 200, Number.NaN],
      ["a", "b", "c"],
      [2, null, 8],
      [2, 8],
      (value) => String(value)
    );
    expect(result.omitted).toBe(1);
    expect(result.points).toEqual([
      { x: 1, y: 10, z: 100, color: "a", size: 0.5 },
      { x: 2, y: 20, z: 200, color: "b", size: 1 },
    ]);
  });
});
