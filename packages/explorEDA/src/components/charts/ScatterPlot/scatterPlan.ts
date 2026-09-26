import { finiteNumber } from "@/lib/numeric";
import { getRangeFilterForField } from "@/hooks/getAxisFilter";
import {
  getFieldLabel,
  formatFieldValue,
  hasFieldDisplayFormat,
  type FieldSettingsMap,
} from "@/lib/fieldSettings";
import { makeColorScale } from "@/lib/colorScaleMath";
import {
  categoryIncludes,
  categoryKey,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import type { IdType } from "@/providers/DataLayerProvider";
import type { datum, MarginSettings } from "@/types/ChartTypes";
import type { ColorScaleType } from "@/types/ColorScaleTypes";
import type { ValueFilter } from "@/types/FilterTypes";
import { numericScale } from "../Axis/numericScale";
import {
  planAxes,
  planChartMargin,
  type ChartAxesPlan,
} from "../Axis/axisPlan";
import { getChartTitle } from "../chartAccessibility";
import { planScatterPoints, type ScatterPointStyle } from "./planScatterPoints";
import type { ScatterPlotSettings } from "./definition";

export type Extent = [[number, number], [number, number]];
type ScatterPoint = ReturnType<typeof planScatterPoints>[number] & {
  passesAllFilters: boolean;
};
export type SvgPrimitive =
  | {
      kind: "line";
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      className?: string;
      stroke?: string;
      strokeOpacity?: number;
      strokeWidth?: number;
      strokeDasharray?: string;
      hitStrokeWidth?: number;
    }
  | {
      kind: "rect";
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
      fill?: string;
      fillOpacity?: number;
      stroke?: string;
      strokeWidth?: number;
      cursor?: string;
    }
  | {
      kind: "circle";
      id: string;
      cx: number;
      cy: number;
      r: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
    }
  | {
      kind: "text";
      id: string;
      x: number;
      y: number;
      text: string;
      className?: string;
      fill?: string;
      textAnchor?: "start" | "middle" | "end";
      fontSize?: number;
      fontWeight?: number;
      dy?: string;
      transform?: string;
      title?: string;
    };

export interface ScatterSnapshot {
  revision: string;
  allIds: IdType[];
  chartIds: IdType[];
  filteredIds: IdType[];
  facetIds?: IdType[];
  xData: Record<IdType, datum>;
  yData: Record<IdType, datum>;
  colorData: Record<IdType, datum>;
  facetRowData?: Record<IdType, datum>;
  facetColumnData?: Record<IdType, datum>;
  fieldSettings: FieldSettingsMap;
  colorScale?: ColorScaleType;
  calculatedFields?: string[];
  pixelRatio?: number;
}

export interface ScatterPlan {
  revision: string;
  width: number;
  height: number;
  margin: MarginSettings;
  plotWidth: number;
  plotHeight: number;
  clipWidth: number;
  clipHeight: number;
  pixelRatio: number;
  calculatedBadges: {
    id: string;
    field: string;
    x: number;
    y: number;
    rotation: number;
  }[];
  xScale: {
    type: "linear" | "symlog";
    domain: [number, number];
    range: [number, number];
  };
  yScale: {
    type: "linear" | "symlog";
    domain: [number, number];
    range: [number, number];
  };
  title: string;
  description: string;
  axes: ChartAxesPlan;
  domainInputs: {
    x: [number, number];
    y: [number, number];
    buffer: number;
    population: "all";
  };
  legend?: {
    field: string;
    scaleId: string;
    type: "categorical" | "numerical";
    palette: string | string[];
    domain?: [number, number];
    items: {
      id: string;
      value: datum;
      label: string;
      count: number;
      color: string;
      selected: boolean;
    }[];
  };
  brushExtent: Extent | null;
  pointStyle: ScatterPointStyle;
  points: ScatterPoint[];
  exclusions: {
    sourceId: IdType;
    reason: "invalid-x" | "invalid-y" | "nonfinite-position";
  }[];
  populations: { all: number; chart: number; filtered: number; facet: number };
  rowSets: {
    all: IdType[];
    chart: IdType[];
    filtered: IdType[];
    facet: IdType[];
  };
  xField: string;
  yField: string;
  xDisplay: string;
  yDisplay: string;
  fieldSettings: FieldSettingsMap;
}

function numeric(value: datum) {
  return finiteNumber(value) ?? NaN;
}

function bounds(ids: IdType[], data: Record<IdType, datum>): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const id of ids) {
    const value = numeric(data[id]);
    if (!Number.isFinite(value)) {
      continue;
    }
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return min === Infinity ? [0, 1] : [min, max];
}

function fieldLabel(field: string, settings: FieldSettingsMap) {
  return field === "__ID"
    ? "Row sequence"
    : getFieldLabel(field, settings[field]);
}

function display(field: string, value: number, settings: FieldSettingsMap) {
  return hasFieldDisplayFormat(settings[field])
    ? formatFieldValue(field, value, settings[field])
    : String(value);
}

export function planScatter(
  settings: ScatterPlotSettings,
  snapshot: ScatterSnapshot,
  width: number,
  height: number
): ScatterPlan {
  const xLabel =
    settings.xAxisLabel || fieldLabel(settings.xField, snapshot.fieldSettings);
  const yLabel =
    settings.yAxisLabel || fieldLabel(settings.yField, snapshot.fieldSettings);
  const [xMin, xMax] = bounds(snapshot.allIds, snapshot.xData);
  const [yMin, yMax] = bounds(snapshot.allIds, snapshot.yData);
  const xBuffer = (xMax - xMin) * 0.1;
  const yBuffer = (yMax - yMin) * 0.1;
  const yDomain: [number, number] = [yMin - yBuffer, yMax + yBuffer];
  const { margin, policy: marginPolicy } = planChartMargin({
    margin: settings.margin,
    width,
    yDomain,
    hasXLabel: Boolean(xLabel),
    hasYLabel: Boolean(yLabel),
  });
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const xDomain: [number, number] = [
    settings.xAxis.scaleType === "symlog" ? xMin : xMin - xBuffer,
    xMax + xBuffer,
  ];
  const actualYDomain: [number, number] =
    settings.yAxis.scaleType === "symlog" ? [yMin, yDomain[1]] : yDomain;
  const xScale = numericScale(settings.xAxis)
    .domain(xDomain)
    .range([0, plotWidth]);
  const yScale = numericScale(settings.yAxis)
    .domain(actualYDomain)
    .range([plotHeight, 0]);
  const xType = settings.xAxis.scaleType === "symlog" ? "symlog" : "linear";
  const yType = settings.yAxis.scaleType === "symlog" ? "symlog" : "linear";
  const facetSet = new Set(snapshot.facetIds);
  // Preserve the current helper's rule: an empty facet list means unrestricted.
  const ids = snapshot.facetIds?.length
    ? snapshot.chartIds.filter((id) => facetSet.has(id))
    : snapshot.chartIds;
  const resolveColor = snapshot.colorScale
    ? makeColorScale(snapshot.colorScale)
    : null;
  const getColor = (value: datum) => {
    if (!settings.colorScaleId) {
      return "#3479a8";
    }
    if (!resolveColor) {
      return "#000000";
    }
    try {
      return resolveColor(value);
    } catch {
      return "#000000";
    }
  };
  const filteredSet = new Set(snapshot.filteredIds);
  const pointStyle: ScatterPointStyle = {
    radius: {
      value: settings.pointSize ?? 3,
      source: settings.pointSize == null ? "scatter-default" : "chart-setting",
    },
    opacity: {
      value: settings.pointOpacity ?? 0.7,
      source:
        settings.pointOpacity == null ? "scatter-default" : "chart-setting",
    },
    dimmedOpacity: { value: 0.15, source: "own-filter-rule" },
  };
  const points = planScatterPoints({
    settings,
    style: pointStyle,
    ids,
    xData: snapshot.xData,
    yData: snapshot.yData,
    colorData: snapshot.colorData,
    xScale,
    yScale,
    getColor,
  }).map((point) => ({
    ...point,
    passesAllFilters: filteredSet.has(point.sourceId),
  }));
  const included = new Set(points.map((point) => point.sourceId));

  const format = (field: string) => (value: string | number) =>
    formatFieldValue(field, value, snapshot.fieldSettings[field]);
  const labelSource = (local: string) =>
    local ? ("chart-setting" as const) : ("field-label" as const);
  const axes = planAxes({
    plotWidth,
    plotHeight,
    margin,
    marginPolicy,
    x: {
      scale: xScale,
      scaleType: xType,
      field: settings.xField,
      fieldLabel: xLabel,
      density: settings.xGridLines,
      grid: settings.xAxis.grid,
      format: format(settings.xField),
      label: [xLabel, xType === "symlog" && "symlog"].filter(Boolean).join(" · "),
      labelSource: labelSource(settings.xAxisLabel),
      domainSource: {
        population: "all source rows",
        rows: snapshot.allIds.length,
        bounds: [xMin, xMax],
        padding: xType === "symlog" ? "10% above" : "10% on each side",
      },
    },
    y: {
      scale: yScale,
      scaleType: yType,
      field: settings.yField,
      fieldLabel: yLabel,
      density: settings.yGridLines,
      grid: settings.yAxis.grid,
      format: format(settings.yField),
      label: [yLabel, yType === "symlog" && "symlog"].filter(Boolean).join(" · "),
      labelSource: labelSource(settings.yAxisLabel),
      rule: false,
      domainSource: {
        population: "all source rows",
        rows: snapshot.allIds.length,
        bounds: [yMin, yMax],
        padding: yType === "symlog" ? "10% above" : "10% on each side",
      },
    },
  });

  const xFilter = getRangeFilterForField(settings.filters, settings.xField);
  const yFilter = getRangeFilterForField(settings.filters, settings.yField);
  const round = (value: number) => Math.round(value * 10000) / 10000;
  const brushExtent: Extent | null =
    xFilter?.min !== undefined &&
    xFilter.max !== undefined &&
    yFilter?.min !== undefined &&
    yFilter.max !== undefined
      ? [
          [round(xScale(xFilter.min)), round(yScale(yFilter.max))],
          [round(xScale(xFilter.max)), round(yScale(yFilter.min))],
        ]
      : null;
  const title = getChartTitle(settings, (field) =>
    fieldLabel(field, snapshot.fieldSettings)
  );
  const calculatedBadges: ScatterPlan["calculatedBadges"] = [];
  if (snapshot.calculatedFields?.includes(settings.xField)) {
    calculatedBadges.push({
      id: "calculation:x",
      field: settings.xField,
      x: margin.left + plotWidth / 2 + Math.min(90, xLabel.length * 3.2) + 8,
      y: margin.top + plotHeight + Math.max(30, margin.bottom - 10) - 12,
      rotation: 0,
    });
  }
  if (snapshot.calculatedFields?.includes(settings.yField)) {
    calculatedBadges.push({
      id: "calculation:y",
      field: settings.yField,
      x: 0,
      y: margin.top + plotHeight / 2 - Math.min(90, yLabel.length * 3.2) - 30,
      rotation: -90,
    });
  }
  let legend: ScatterPlan["legend"];
  if (settings.colorField && settings.colorScaleId && snapshot.colorScale) {
    const scale = snapshot.colorScale;
    if (scale.type === "categorical") {
      const values = new Map<string, datum>();
      for (const id of snapshot.allIds) {
        const value = categoryValue(snapshot.colorData[id]);
        values.set(categoryKey(value), value);
      }
      const counts = new Map<string, number>();
      for (const id of snapshot.chartIds) {
        const key = categoryKey(snapshot.colorData[id]);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      const selected = settings.filters
        .filter(
          (filter): filter is ValueFilter =>
            filter.type === "value" && filter.field === settings.colorField
        )
        .flatMap((filter) => filter.values);
      legend = {
        field: settings.colorField,
        scaleId: scale.id,
        type: "categorical",
        palette: [...scale.palette],
        items: [...values].map(([id, value]) => ({
          id,
          value,
          label: hasFieldDisplayFormat(
            snapshot.fieldSettings[settings.colorField!]
          )
            ? formatFieldValue(
                settings.colorField!,
                value,
                snapshot.fieldSettings[settings.colorField!]
              )
            : categoryLabel(value),
          count: counts.get(id) ?? 0,
          color: getColor(value),
          selected: categoryIncludes(selected, value),
        })),
      };
    } else {
      legend = {
        field: settings.colorField,
        scaleId: scale.id,
        type: "numerical",
        palette: scale.palette,
        domain: [scale.min, scale.max],
        items: [],
      };
    }
  }
  return {
    revision: snapshot.revision,
    width,
    height,
    margin,
    plotWidth,
    plotHeight,
    clipWidth: Math.max(0, plotWidth),
    clipHeight: Math.max(0, plotHeight),
    pixelRatio: snapshot.pixelRatio ?? 1,
    calculatedBadges,
    xScale: { type: xType, domain: xDomain, range: [0, plotWidth] },
    yScale: { type: yType, domain: actualYDomain, range: [plotHeight, 0] },
    title,
    description: [
      `Interactive scatter chart.`,
      settings.xAxisLabel && `Horizontal axis: ${settings.xAxisLabel}.`,
      settings.yAxisLabel && `Vertical axis: ${settings.yAxisLabel}.`,
    ]
      .filter(Boolean)
      .join(" "),
    axes,
    domainInputs: {
      x: [xMin, xMax],
      y: [yMin, yMax],
      buffer: 0.1,
      population: "all",
    },
    legend,
    brushExtent,
    pointStyle,
    points,
    exclusions: ids
      .filter((id) => !included.has(id))
      .map((sourceId) => ({
        sourceId,
        reason: !Number.isFinite(numeric(snapshot.xData[sourceId]))
          ? ("invalid-x" as const)
          : !Number.isFinite(numeric(snapshot.yData[sourceId]))
            ? ("invalid-y" as const)
            : ("nonfinite-position" as const),
      })),
    populations: {
      all: snapshot.allIds.length,
      chart: snapshot.chartIds.length,
      filtered: snapshot.filteredIds.length,
      facet: ids.length,
    },
    rowSets: {
      all: snapshot.allIds,
      chart: snapshot.chartIds,
      filtered: snapshot.filteredIds,
      facet: ids,
    },
    xField: settings.xField,
    yField: settings.yField,
    xDisplay: xLabel,
    yDisplay: yLabel,
    fieldSettings: snapshot.fieldSettings,
  };
}

export function scatterPointReadout(plan: ScatterPlan, point: ScatterPoint) {
  return {
    xText: display(plan.xField, point.xValue, plan.fieldSettings),
    yText: display(plan.yField, point.yValue, plan.fieldSettings),
  };
}

export function scatterHoverReadout(
  plan: ScatterPlan,
  snapshot: ScatterSnapshot,
  settings: ScatterPlotSettings,
  point: ScatterPoint
) {
  const value = (field: string, item: datum) =>
    hasFieldDisplayFormat(snapshot.fieldSettings[field])
      ? formatFieldValue(field, item, snapshot.fieldSettings[field])
      : categoryLabel(item);
  return {
    ...scatterPointReadout(plan, point),
    colorText: settings.colorField
      ? value(settings.colorField, point.colorValue)
      : undefined,
    facetRowText: settings.facet.enabled
      ? value(
          settings.facet.rowVariable,
          snapshot.facetRowData?.[point.sourceId]
        )
      : undefined,
    facetColumnText:
      settings.facet.enabled && settings.facet.type === "grid"
        ? value(
            settings.facet.columnVariable,
            snapshot.facetColumnData?.[point.sourceId]
          )
        : undefined,
  };
}

export function brushFilters(plan: ScatterPlan, extent: Extent) {
  const xScale = numericScale({ scaleType: plan.xScale.type })
    .domain(plan.xScale.domain)
    .range(plan.xScale.range);
  const yScale = numericScale({ scaleType: plan.yScale.type })
    .domain(plan.yScale.domain)
    .range(plan.yScale.range);
  return {
    x: [
      Math.min(xScale.invert(extent[0][0]), xScale.invert(extent[1][0])),
      Math.max(xScale.invert(extent[0][0]), xScale.invert(extent[1][0])),
    ] as [number, number],
    y: [
      Math.min(yScale.invert(extent[0][1]), yScale.invert(extent[1][1])),
      Math.max(yScale.invert(extent[0][1]), yScale.invert(extent[1][1])),
    ] as [number, number],
  };
}

export function planScatterOverlay(
  plan: ScatterPlan,
  extent: Extent | null,
  hoveredId: string | null
) {
  const brush: SvgPrimitive[] = [];
  if (extent) {
    const [[x0, y0], [x1, y1]] = extent;
    brush.push({
      kind: "rect",
      id: "brush",
      x: x0,
      y: y0,
      width: Math.max(0, x1 - x0),
      height: Math.max(0, y1 - y0),
      fill: "var(--primary)",
      fillOpacity: 0.09,
      stroke: "var(--primary)",
      strokeWidth: 1.25,
      cursor: "move",
    });
    for (const [i, x] of [x0, x1].entries()) {
      brush.push({
        kind: "rect",
        id: `brush:x:${i}`,
        x: x - 2,
        y: (y0 + y1) / 2 - 8,
        width: 4,
        height: 16,
        rx: 2,
        fill: "var(--primary)",
        cursor: "ew-resize",
      });
    }
    for (const [i, y] of [y0, y1].entries()) {
      brush.push({
        kind: "rect",
        id: `brush:y:${i}`,
        x: (x0 + x1) / 2 - 8,
        y: y - 2,
        width: 16,
        height: 4,
        rx: 2,
        fill: "var(--primary)",
        cursor: "ns-resize",
      });
    }
  }
  const point = plan.points.find((item) => item.id === hoveredId);
  const readout: SvgPrimitive[] = [];
  let readoutLabel: string | undefined;
  if (point) {
    const { x, y, color } = point;
    const { xText, yText } = scatterPointReadout(plan, point);
    readoutLabel = `Source row ${point.sourceId}; ${plan.xDisplay}: ${xText}; ${plan.yDisplay}: ${yText}`;
    const xWidth = xText.length * 6 + 12;
    const yWidth = yText.length * 6 + 12;
    const labelX = Math.max(
      xWidth / 2,
      Math.min(plan.plotWidth - xWidth / 2, x)
    );
    readout.push(
      {
        kind: "line",
        id: "readout:x-rule",
        x1: x,
        x2: x,
        y1: y,
        y2: plan.plotHeight + 3,
        stroke: color,
        strokeOpacity: 0.4,
        strokeWidth: 1,
        strokeDasharray: "2 3",
      },
      {
        kind: "line",
        id: "readout:y-rule",
        x1: x,
        x2: 0,
        y1: y,
        y2: y,
        stroke: color,
        strokeOpacity: 0.4,
        strokeWidth: 1,
        strokeDasharray: "2 3",
      },
      {
        kind: "circle",
        id: "readout:ring",
        cx: x,
        cy: y,
        r: point.radius + 5,
        fill: "none",
        stroke: "var(--primary)",
        strokeWidth: 2.5,
      },
      { kind: "circle", id: "readout:center", cx: x, cy: y, r: 2, fill: color },
      {
        kind: "rect",
        id: "readout:x-bg",
        x: labelX - xWidth / 2,
        y: plan.plotHeight + 5,
        width: xWidth,
        height: 20,
        fill: "var(--card)",
      },
      {
        kind: "rect",
        id: "readout:y-bg",
        x: -yWidth - 3,
        y: y - 10,
        width: yWidth,
        height: 20,
        fill: "var(--card)",
      },
      {
        kind: "text",
        id: "readout:x-text",
        x: labelX,
        y: plan.plotHeight + 18,
        text: xText,
        fill: color,
        fontSize: 10,
        fontWeight: 600,
        textAnchor: "middle",
      },
      {
        kind: "text",
        id: "readout:y-text",
        x: -8,
        y,
        dy: ".32em",
        text: yText,
        fill: color,
        fontSize: 10,
        fontWeight: 600,
        textAnchor: "end",
      }
    );
  }
  return {
    brush,
    readout,
    readoutLabel,
  };
}
