import { applyFilter } from "@/hooks/applyFilter";
import { finiteNumber } from "@/lib/numeric";
import type { IdType } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import type { ScatterPlotSettings } from "./definition";
import {
  passesAxisFilters,
  scatterPosition,
  type ScatterAxisScale,
} from "./scatterAxis";

export interface ScatterPointStyle {
  radius: { value: number; source: "chart-setting" | "scatter-default" };
  opacity: { value: number; source: "chart-setting" | "scatter-default" };
  dimmedOpacity: { value: number; source: "own-filter-rule" };
}

/** Jitter salts, so a row spreads differently across X and Y bands. */
const X_SALT = 1;
const Y_SALT = 2;

export function planScatterPoints({
  settings,
  style,
  ids,
  xData,
  yData,
  colorData,
  sizeData = {},
  sizeScale,
  xAxis,
  yAxis,
  getColor,
}: {
  settings: ScatterPlotSettings;
  style: ScatterPointStyle;
  ids: IdType[];
  xData: Record<IdType, datum>;
  yData: Record<IdType, datum>;
  colorData: Record<IdType, datum>;
  sizeData?: Record<IdType, datum>;
  sizeScale?: { max: number; radius: number };
  xAxis: ScatterAxisScale;
  yAxis: ScatterAxisScale;
  getColor: (value: datum) => string;
}) {
  const colorFilters = settings.filters.filter(
    (filter) => filter.field === settings.colorField
  );
  const points = [];

  for (const sourceId of ids) {
    const x = scatterPosition(xAxis, xData[sourceId], sourceId, X_SALT);
    const y = scatterPosition(yAxis, yData[sourceId], sourceId, Y_SALT);
    if (!x || !y) {
      continue;
    }

    const passesOwnFilter =
      passesAxisFilters(xAxis, settings.filters, settings.xField, x.value) &&
      passesAxisFilters(yAxis, settings.filters, settings.yField, y.value) &&
      colorFilters.every((filter) =>
        applyFilter(colorData[sourceId], filter)
      ) &&
      settings.filters
        .filter((filter) => filter.field === "__ID")
        .every((filter) => applyFilter(sourceId, filter)) &&
      (!settings.sizeField ||
        settings.filters
          .filter((filter) => filter.field === settings.sizeField)
          .every((filter) => applyFilter(sizeData[sourceId], filter)));
    const sizeValue = sizeScale ? finiteNumber(sizeData[sourceId]) : undefined;
    if (sizeScale && (sizeValue === undefined || sizeValue < 0)) continue;
    const dataRadius =
      sizeScale && sizeScale.max > 0
        ? sizeScale.radius * Math.sqrt(sizeValue! / sizeScale.max)
        : 0;
    const mappedColor = getColor(colorData[sourceId]);
    points.push({
      id: `${settings.id}:point:${sourceId}`,
      sourceId,
      xValue: x.value,
      yValue: y.value,
      colorValue: colorData[sourceId],
      mappedColor,
      x: x.pixel,
      y: y.pixel,
      color: passesOwnFilter ? mappedColor : "rgb(156 163 175)",
      opacity: passesOwnFilter
        ? style.opacity.value
        : style.dimmedOpacity.value,
      radius: sizeScale
        ? sizeValue === 0
          ? 2
          : dataRadius
        : style.radius.value,
      sizeValue,
      passesOwnFilter,
    });
  }

  return points;
}
