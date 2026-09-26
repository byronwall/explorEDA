import { finiteNumber } from "@/lib/numeric";
import { applyFilter } from "@/hooks/applyFilter";
import { getRangeFilterForField } from "@/hooks/getAxisFilter";
import type { IdType } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import type { ScatterPlotSettings } from "./definition";

export interface ScatterPointStyle {
  radius: { value: number; source: "chart-setting" | "scatter-default" };
  opacity: { value: number; source: "chart-setting" | "scatter-default" };
  dimmedOpacity: { value: number; source: "own-filter-rule" };
}

export function planScatterPoints({
  settings,
  style,
  ids,
  xData,
  yData,
  colorData,
  xScale,
  yScale,
  getColor,
}: {
  settings: ScatterPlotSettings;
  style: ScatterPointStyle;
  ids: IdType[];
  xData: Record<IdType, datum>;
  yData: Record<IdType, datum>;
  colorData: Record<IdType, datum>;
  xScale: (value: number) => number;
  yScale: (value: number) => number;
  getColor: (value: datum) => string;
}) {
  const xFilter = getRangeFilterForField(settings.filters, settings.xField);
  const yFilter = getRangeFilterForField(settings.filters, settings.yField);
  const colorFilters = settings.filters.filter(
    (filter) => filter.field === settings.colorField
  );
  const points = [];

  for (const sourceId of ids) {
    const rawX = xData[sourceId];
    const rawY = yData[sourceId];
    const xValue = finiteNumber(rawX) ?? NaN;
    const yValue = finiteNumber(rawY) ?? NaN;
    if (!Number.isFinite(xValue) || !Number.isFinite(yValue)) {
      continue;
    }

    const x = xScale(xValue);
    const y = yScale(yValue);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      continue;
    }

    const passesOwnFilter =
      (!xFilter || applyFilter(xValue, xFilter)) &&
      (!yFilter || applyFilter(yValue, yFilter)) &&
      colorFilters.every((filter) => applyFilter(colorData[sourceId], filter));
    const mappedColor = getColor(colorData[sourceId]);
    points.push({
      id: `${settings.id}:point:${sourceId}`,
      sourceId,
      xValue,
      yValue,
      colorValue: colorData[sourceId],
      mappedColor,
      x,
      y,
      color: passesOwnFilter ? mappedColor : "rgb(156 163 175)",
      opacity: passesOwnFilter
        ? style.opacity.value
        : style.dimmedOpacity.value,
      radius: style.radius.value,
      passesOwnFilter,
    });
  }

  return points;
}
