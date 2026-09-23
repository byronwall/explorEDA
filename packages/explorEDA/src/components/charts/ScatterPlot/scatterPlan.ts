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
import { scaleLinear } from "d3-scale";
import { numericScale } from "../Axis/numericScale";
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
  grid: SvgPrimitive[];
  axes: SvgPrimitive[];
  guideRefs: Record<string, string[]>;
  guidePolicy: {
    requestedLeftMargin: number;
    labelLeftMargin: number;
    maxLeftMargin: number;
    minPlotWidth: number;
    bottomMargin: number;
    x: {
      gridRequested: number;
      axisRequested: number;
      candidates: number[];
      kept: number[];
      omitted: number[];
      minLabelGap: number;
      maxLabelChars: number;
    };
    y: {
      gridRequested: number;
      axisRequested: number;
      candidates: number[];
      kept: number[];
      omitted: number[];
      minLabelGap: number;
      maxLabelChars: number;
    };
  };
  guideDetails: Record<
    string,
    {
      axis: "x" | "y";
      role: "grid" | "tick" | "tick-text" | "rule" | "label";
      value?: number;
      source: "scale" | "chart-setting" | "field-label";
    }
  >;
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
  return value == null || value === "" ? NaN : Number(value);
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

function spacedTicks(
  ticks: number[],
  position: (value: number) => number,
  size: (value: number) => number
) {
  let edge = -Infinity;
  return [...ticks]
    .sort((a, b) => position(a) - position(b))
    .filter((tick) => {
      const half = size(tick) / 2;
      if (position(tick) - half < edge + 8) {
        return false;
      }
      edge = position(tick) + half;
      return true;
    });
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
  const requestedLabelMargin = Math.max(
    settings.margin.left,
    ...scaleLinear()
      .domain(yDomain)
      .ticks(5)
      .map((tick) => String(tick).length * 7 + (yLabel ? 38 : 18))
  );
  const minPlotWidth = Math.min(
    80,
    Math.max(0, width - settings.margin.left - settings.margin.right)
  );
  const maxLabelMargin = Math.max(
    0,
    width - settings.margin.right - minPlotWidth
  );
  const margin = {
    ...settings.margin,
    left: Math.min(requestedLabelMargin, maxLabelMargin),
    bottom: Math.max(settings.margin.bottom, xLabel ? 46 : 28),
  };
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

  const grid: SvgPrimitive[] = [];
  const xGridRequested = settings.xGridLines || 5;
  const yGridRequested = settings.yGridLines || 5;
  if (settings.xAxis.grid) {
    for (const tick of xScale.ticks(xGridRequested)) {
      grid.push({
        kind: "line",
        id: `grid:x:${tick}`,
        x1: xScale(tick),
        x2: xScale(tick),
        y1: 0,
        y2: plotHeight,
        className: "stroke-border",
        strokeOpacity: 0.55,
        hitStrokeWidth: 9,
      });
    }
  }
  if (settings.yAxis.grid) {
    for (const tick of yScale.ticks(yGridRequested)) {
      grid.push({
        kind: "line",
        id: `grid:y:${tick}`,
        x1: 0,
        x2: plotWidth,
        y1: yScale(tick),
        y2: yScale(tick),
        className: "stroke-border",
        strokeOpacity: 0.55,
        hitStrokeWidth: 9,
      });
    }
  }

  const axes: SvgPrimitive[] = [
    {
      kind: "line",
      id: "x:rule",
      x1: 0,
      x2: plotWidth,
      y1: plotHeight,
      y2: plotHeight,
      className: "stroke-border",
    },
  ];
  const xCount = Math.max(2, settings.xGridLines ?? 5);
  const xFormat = (value: number) =>
    formatFieldValue(
      settings.xField,
      value,
      snapshot.fieldSettings[settings.xField]
    );
  const yFormat = (value: number) =>
    formatFieldValue(
      settings.yField,
      value,
      snapshot.fieldSettings[settings.yField]
    );
  const xCandidates = xScale.ticks(xCount);
  const xTicks = spacedTicks(
    xCandidates,
    xScale,
    (tick) => xFormat(tick).length * 6
  );
  for (const tick of xTicks) {
    const x = xScale(tick);
    const text = xFormat(tick);
    axes.push({
      kind: "line",
      id: `x:tick:${tick}`,
      x1: x,
      x2: x,
      y1: plotHeight,
      y2: plotHeight + 4,
      className: "stroke-border",
    });
    axes.push({
      kind: "text",
      id: `x:text:${tick}`,
      x,
      y: plotHeight + 17,
      text: text.length > 20 ? `${text.slice(0, 19)}…` : text,
      title: text,
      textAnchor: "middle",
      fontSize: 10,
      className: "fill-muted-foreground",
    });
  }
  const xAxisText = [xLabel, xType === "symlog" && "symlog"]
    .filter(Boolean)
    .join(" · ");
  if (xAxisText) {
    axes.push({
      kind: "text",
      id: "x:label",
      x: plotWidth / 2,
      y: plotHeight + Math.max(32, margin.bottom - 8),
      text: xAxisText,
      textAnchor: "middle",
      fontSize: 11,
      className: "fill-muted-foreground",
    });
  }
  const yCount = Math.max(2, settings.yGridLines ?? 5);
  const yCandidates = yScale.ticks(yCount);
  const yTicks = spacedTicks(yCandidates, yScale, () => 12);
  const yMaxChars = Math.max(5, Math.floor((margin.left - 12 - 4) / 6));
  for (const tick of yTicks) {
    const text = yFormat(tick);
    axes.push({
      kind: "text",
      id: `y:text:${tick}`,
      x: -9,
      y: yScale(tick),
      dy: ".32em",
      text: text.length > yMaxChars ? `${text.slice(0, yMaxChars - 1)}…` : text,
      title: text,
      textAnchor: "end",
      fontSize: 10,
      className: "fill-muted-foreground",
    });
  }
  const yAxisText = [yLabel, yType === "symlog" && "symlog"]
    .filter(Boolean)
    .join(" · ");
  if (yAxisText) {
    axes.push({
      kind: "text",
      id: "y:label",
      x: -plotHeight / 2,
      y: -(margin.left - 12),
      transform: "rotate(-90)",
      text: yAxisText,
      textAnchor: "middle",
      fontSize: 11,
      className: "fill-muted-foreground",
    });
  }

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
  const guideRefs = Object.fromEntries(
    [...grid, ...axes].map((item) => {
      const axis =
        item.id.startsWith("x:") || item.id.startsWith("grid:x:") ? "x" : "y";
      const refs = [`scale:${axis}`];
      if (item.kind === "text") {
        refs.push(`field-format:${axis}`);
      }
      if (item.id.endsWith(":label")) {
        refs.push(`axis-label:${axis}`);
      }
      return [item.id, refs];
    })
  );
  const guidePolicy: ScatterPlan["guidePolicy"] = {
    requestedLeftMargin: settings.margin.left,
    labelLeftMargin: requestedLabelMargin,
    maxLeftMargin: maxLabelMargin,
    minPlotWidth,
    bottomMargin: margin.bottom,
    x: {
      gridRequested: xGridRequested,
      axisRequested: xCount,
      candidates: xCandidates,
      kept: xTicks,
      omitted: xCandidates.filter((tick) => !xTicks.includes(tick)),
      minLabelGap: 8,
      maxLabelChars: 20,
    },
    y: {
      gridRequested: yGridRequested,
      axisRequested: yCount,
      candidates: yCandidates,
      kept: yTicks,
      omitted: yCandidates.filter((tick) => !yTicks.includes(tick)),
      minLabelGap: 8,
      maxLabelChars: yMaxChars,
    },
  };
  const guideDetails: ScatterPlan["guideDetails"] = Object.fromEntries(
    [...grid, ...axes].map((item) => {
      const axis =
        item.id.startsWith("x:") || item.id.startsWith("grid:x:") ? "x" : "y";
      const role = item.id.startsWith("grid:")
        ? "grid"
        : item.id.endsWith(":label")
          ? "label"
          : item.id.endsWith(":rule")
            ? "rule"
            : item.id.includes(":text:")
              ? "tick-text"
              : "tick";
      const valueText = item.id.split(":").at(-1);
      const value =
        role === "grid" || role === "tick" || role === "tick-text"
          ? Number(valueText)
          : undefined;
      return [
        item.id,
        {
          axis,
          role,
          value,
          source:
            role === "label"
              ? (axis === "x" ? settings.xAxisLabel : settings.yAxisLabel)
                ? "chart-setting"
                : "field-label"
              : "scale",
        },
      ];
    })
  );
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
    grid,
    axes,
    guideRefs,
    guidePolicy,
    guideDetails,
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
