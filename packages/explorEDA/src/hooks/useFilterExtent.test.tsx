import { renderHook } from "@testing-library/react";
import { scaleLinear } from "d3-scale";
import { expect, it } from "vitest";
import {
  DEFAULT_TIME_SERIES,
  lineChartDefinition,
} from "@/components/charts/LineChart/definition";
import { useFilterExtent } from "./useFilterExtent";

const yScale = scaleLinear().domain([0, 1]).range([100, 0]);

it("keeps a restored date selection inside the plot", () => {
  const settings = {
    ...lineChartDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    id: "time",
    xField: "Date",
    time: { ...DEFAULT_TIME_SERIES },
    filters: [
      {
        type: "date-range" as const,
        field: "Date",
        min: "2023-12-01",
        max: "2024-05-31",
      },
    ],
  };
  // The axis runs from January to the end of April.
  const xScale = scaleLinear()
    .domain([Date.UTC(2024, 0, 1), Date.UTC(2024, 4, 1)])
    .range([0, 300]);
  const { result } = renderHook(() =>
    useFilterExtent({ settings, xScale, yScale, innerHeight: 100 })
  );
  expect(result.current).toEqual([
    [0, 0],
    [300, 100],
  ]);
});

it("restores an observation line's date selection", () => {
  const settings = {
    ...lineChartDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    id: "line",
    xField: "time",
    seriesField: ["y"],
    filters: [
      {
        type: "date-range" as const,
        field: "time",
        min: "2024-01-02T00:00:00.000Z",
        max: "2024-01-03T00:00:00.000Z",
      },
    ],
  };
  const xScale = scaleLinear()
    .domain([Date.UTC(2024, 0, 1), Date.UTC(2024, 0, 5)])
    .range([0, 400]);
  const { result } = renderHook(() =>
    useFilterExtent({ settings, xScale, yScale, innerHeight: 100 })
  );
  expect(result.current).toEqual([
    [100, 0],
    [200, 100],
  ]);
});
