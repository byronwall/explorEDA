import { ChartSettings } from "@/types/ChartTypes";
import { ScaleLinear } from "d3-scale";
import { useCallback, useMemo } from "react";
import { getRangeFilterForField } from "./getAxisFilter";
import { RangeFilter } from "@/types/FilterTypes";
import { dateBound } from "@/lib/valueParsing";

interface UseFilterExtentProps {
  settings: ChartSettings;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  innerHeight: number;
}

export function useFilterExtent({
  settings,
  xScale,
  yScale,
  innerHeight,
}: UseFilterExtentProps) {
  const convertFilterRangeToExtent = useCallback(
    (filter: RangeFilter, scale: ScaleLinear<number, number>) => {
      if (!filter || filter.min === undefined || filter.max === undefined) {
        return null;
      }

      // Round to 4 decimal places to avoid floating point issues
      const min = Math.round(scale(filter.min) * 10000) / 10000;
      const max = Math.round(scale(filter.max) * 10000) / 10000;

      return [min, max] as [number, number];
    },
    []
  );

  const extent = useMemo(() => {
    switch (settings.type) {
      case "scatter": {
        const xFilter = getRangeFilterForField(
          settings.filters,
          settings.xField
        );
        const yFilter = getRangeFilterForField(
          settings.filters,
          settings.yField
        );

        if (!xFilter || !yFilter) {
          return null;
        }

        const xExtent = convertFilterRangeToExtent(xFilter, xScale);
        const yExtent = convertFilterRangeToExtent(yFilter, yScale);

        if (!xExtent || !yExtent) {
          return null;
        }

        return [
          [xExtent[0], yExtent[1]],
          [xExtent[1], yExtent[0]],
        ] as [[number, number], [number, number]];
      }

      case "line":
      case "bar": {
        if ("bandwidth" in xScale) {
          return null;
        }

        if (settings.type === "line" && settings.time) {
          const filter = settings.filters.find(
            (filter) =>
              filter.type === "date-range" && filter.field === settings.xField
          );
          if (!filter || filter.type !== "date-range") return null;
          const domain = xScale.domain();
          const min = filter.min ? dateBound(filter.min) : domain[0]!;
          const max = filter.max ? dateBound(filter.max, true) : domain[1]!;
          if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
          return [
            [xScale(min), 0],
            [xScale(max), innerHeight],
          ] as [[number, number], [number, number]];
        }

        const rangeFilter = getRangeFilterForField(
          settings.filters,
          settings.type === "line" ? settings.xField : settings.field
        );
        if (!rangeFilter) {
          return null;
        }

        const xExtent = convertFilterRangeToExtent(rangeFilter, xScale);

        if (!xExtent) {
          return null;
        }

        return [
          [xExtent[0], 0],
          [xExtent[1], innerHeight],
        ] as [[number, number], [number, number]];
      }

      case "row":
        return null;
    }
  }, [settings, xScale, yScale, innerHeight, convertFilterRangeToExtent]);

  return extent;
}
