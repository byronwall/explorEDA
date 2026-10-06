import { finiteNumber, isMissingValue } from "@/lib/numeric";
import {
  getFieldLabel,
  formatFieldValue,
  hasFieldDisplayFormat,
  type FieldSettingsMap,
} from "@/lib/fieldSettings";
import { makeColorScale } from "@/lib/colorScaleMath";
import { STATUS_LINE_HEIGHT } from "../ChartStatusLine";
import {
  categoryIncludes,
  categoryKey,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import type { IdType } from "@/providers/DataLayerProvider";
import type { datum, MarginSettings } from "@/types/ChartTypes";
import type { ColorScaleType } from "@/types/ColorScaleTypes";
import type { Filter, ValueFilter } from "@/types/FilterTypes";
import type { DataType } from "@/components/SummaryTable/utils/dataTypeDetection";
import {
  buildScale,
  describeScale,
  planAxes,
  planChartMargin,
  type ChartAxesPlan,
  type ScaleDescriptor,
} from "../Axis/axisPlan";
import { getChartTitle } from "../chartAccessibility";
import { planScatterPoints, type ScatterPointStyle } from "./planScatterPoints";
import { MARGINAL_GAP, MARGINAL_SIZE } from "./marginalPlan";
import type { ScatterPlotSettings } from "./definition";
import {
  DOMAIN_PADDING,
  filterSpan,
  planScatterAxis,
  spanFilter,
  type ScatterAxisScale,
  type ScatterCategory,
} from "./scatterAxis";

export { paddedDomain } from "./scatterAxis";

/** Estimated axis title glyph width; ScatterPlot measures the rendered title. */
const TITLE_CHAR_WIDTH = 6.5;
/** Room for a hexagon or smoothed-density legend line. */
export const SURFACE_LEGEND_HEIGHT = 20;
/** Space between an axis title and its calculated-field badge. */
export const BADGE_GAP = 4;

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
  sizeData?: Record<IdType, datum>;
  /** Detected field types; omitted types are detected from the column. */
  xType?: DataType;
  yType?: DataType;
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
  /** Each badge anchors just past the end of its axis title, on the title's midline. */
  calculatedBadges: {
    id: string;
    field: string;
    x: number;
    y: number;
    rotation: number;
  }[];
  xScale: ScaleDescriptor;
  yScale: ScaleDescriptor;
  /** Band categories in axis order, for a categorical axis. */
  xCategories?: ScatterCategory[];
  yCategories?: ScatterCategory[];
  title: string;
  description: string;
  axes: ChartAxesPlan;
  domainInputs: {
    x?: [number, number];
    y?: [number, number];
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
  size?: {
    field: string;
    label: string;
    max: number;
    radius: number;
    legendHeight: number;
    samples: { value: number; label: string; radius: number }[];
  };
  points: ScatterPoint[];
  exclusions: {
    sourceId: IdType;
    reason: "invalid-x" | "invalid-y" | "invalid-size" | "nonfinite-position";
  }[];
  /** Why nothing is drawn when rows remain but none has a position. */
  emptyMessage?: string;
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

function fieldLabel(field: string, settings: FieldSettingsMap) {
  return field === "__ID"
    ? "Row sequence"
    : getFieldLabel(field, settings[field]);
}

function display(field: string, value: datum, settings: FieldSettingsMap) {
  return hasFieldDisplayFormat(settings[field])
    ? formatFieldValue(field, value, settings[field])
    : typeof value === "number"
      ? String(value)
      : categoryLabel(value);
}

/** Longest band label that widens the left margin; longer labels truncate. */
const MAX_MARGIN_LABEL_CHARS = 18;

/** Rebuilds a planned axis so brushing reads the same scale the plan drew. */
function planAxisScale(
  descriptor: ScaleDescriptor,
  categories?: ScatterCategory[]
): ScatterAxisScale {
  const scale = buildScale(descriptor);
  if ("bandwidth" in scale) {
    return { kind: "band", type: "band", scale, categories: categories ?? [] };
  }
  const domain = descriptor.domain as [number, number];
  return {
    kind: "numeric",
    type: descriptor.type === "symlog" ? "symlog" : "linear",
    scale,
    bounds: domain,
    domain,
  };
}

function emptyMessage(
  exclusions: ScatterPlan["exclusions"],
  snapshot: ScatterSnapshot,
  xLabel: string,
  yLabel: string
) {
  const empty = (data: Record<IdType, datum>) =>
    snapshot.allIds.every((id) => isMissingValue(data[id]));
  const xEmpty = empty(snapshot.xData);
  const yEmpty = empty(snapshot.yData);
  if (xEmpty && yEmpty) return `${xLabel} and ${yLabel} have no values.`;
  if (xEmpty) return `${xLabel} has no values.`;
  if (yEmpty) return `${yLabel} has no values.`;
  const x = exclusions.some((item) => item.reason === "invalid-x");
  const y = exclusions.some((item) => item.reason === "invalid-y");
  if (x && !y) return `${xLabel} has no numeric values in these rows.`;
  if (y && !x) return `${yLabel} has no numeric values in these rows.`;
  return `No row has a plottable value for both ${xLabel} and ${yLabel}.`;
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
  const axisFor = (
    data: Record<IdType, datum>,
    dataType: DataType | undefined,
    axis: ScatterPlotSettings["xAxis"],
    range: [number, number]
  ) => planScatterAxis({ ids: snapshot.allIds, data, dataType, axis, range });
  // Plan Y once without pixels to size the left margin from its labels.
  const yShape = axisFor(
    snapshot.yData,
    snapshot.yType,
    settings.yAxis,
    [0, 1]
  );
  const { margin, policy: marginPolicy } = planChartMargin({
    margin: settings.margin,
    width,
    yDomain: yShape.kind === "numeric" ? yShape.domain : [0, 1],
    hasXLabel: Boolean(xLabel),
    hasYLabel: Boolean(yLabel),
    yTickFontSize: settings.yAxis.tickFontSize,
    yLabels:
      yShape.kind === "band"
        ? yShape.categories.map((item) =>
            display(settings.yField, item.value, snapshot.fieldSettings).slice(
              0,
              MAX_MARGIN_LABEL_CHARS
            )
          )
        : undefined,
  });
  const bubbleRadius = Math.min(
    settings.maxBubbleRadius ?? 20,
    Math.max(2, width * 0.08),
    Math.max(2, height * 0.08)
  );
  const sizeMax = settings.sizeField
    ? snapshot.allIds.reduce(
        (max, id) => Math.max(max, finiteNumber(snapshot.sizeData?.[id]) ?? 0),
        0
      )
    : 0;
  const size = settings.sizeField
    ? {
        field: settings.sizeField,
        label: fieldLabel(settings.sizeField, snapshot.fieldSettings),
        max: sizeMax,
        radius: bubbleRadius,
        legendHeight: bubbleRadius * 2 + 30,
        samples: (sizeMax > 0 ? [0.25, 0.5, 1] : [0]).map((fraction) => ({
          value: sizeMax * fraction,
          label: display(
            settings.sizeField!,
            sizeMax * fraction,
            snapshot.fieldSettings
          ),
          radius: fraction === 0 ? 2 : bubbleRadius * Math.sqrt(fraction),
        })),
      }
    : undefined;
  if (size) margin.bottom += size.legendHeight;
  // A density surface keeps one line under the axis for its color legend.
  if (settings.display === "hexbin" || settings.display === "contour")
    margin.bottom += SURFACE_LEGEND_HEIGHT;
  // Marginal histograms take a band above the plot and one to its right.
  if (settings.marginals) {
    margin.top += MARGINAL_SIZE + MARGINAL_GAP;
    margin.right += MARGINAL_SIZE + MARGINAL_GAP;
  }
  // A lone chart keeps a line under its axis title for the status line.
  const footer = snapshot.facetIds ? 0 : STATUS_LINE_HEIGHT;
  margin.bottom += footer;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const inset = size ? bubbleRadius : 0;
  const xAxis = axisFor(snapshot.xData, snapshot.xType, settings.xAxis, [
    inset,
    Math.max(inset, plotWidth - inset),
  ]);
  // Bands list top to bottom; numbers grow upward.
  const yAxis = axisFor(
    snapshot.yData,
    snapshot.yType,
    settings.yAxis,
    yShape.kind === "band"
      ? [inset, Math.max(inset, plotHeight - inset)]
      : [Math.max(inset, plotHeight - inset), inset]
  );
  const xScale = xAxis.scale;
  const yScale = yAxis.scale;
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
  // Without a saved size, dense clouds get smaller, lighter points so
  // overlaps read as density instead of one solid shape.
  const density = ids.length > 5000 ? 2 : ids.length > 1000 ? 1 : 0;
  const pointStyle: ScatterPointStyle = {
    radius: {
      value: settings.pointSize ?? [3, 2.5, 2][density]!,
      source: settings.pointSize == null ? "scatter-default" : "chart-setting",
    },
    opacity: {
      value: settings.pointOpacity ?? [0.7, 0.55, 0.4][density]!,
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
    sizeData: snapshot.sizeData,
    sizeScale: size,
    xAxis,
    yAxis,
    getColor,
  }).map((point) => ({
    ...point,
    passesAllFilters: filteredSet.has(point.sourceId),
  }));
  if (size)
    points.sort((a, b) => b.radius - a.radius || a.sourceId - b.sourceId);
  const included = new Set(points.map((point) => point.sourceId));
  const unplotted = (axis: ScatterAxisScale, value: datum) =>
    axis.kind === "numeric" && finiteNumber(value) === undefined;
  const exclusions: ScatterPlan["exclusions"] = ids
    .filter((id) => !included.has(id))
    .map((sourceId) => ({
      sourceId,
      reason: unplotted(xAxis, snapshot.xData[sourceId])
        ? ("invalid-x" as const)
        : unplotted(yAxis, snapshot.yData[sourceId])
          ? ("invalid-y" as const)
          : size &&
              (finiteNumber(snapshot.sizeData?.[sourceId]) === undefined ||
                Number(snapshot.sizeData?.[sourceId]) < 0)
            ? ("invalid-size" as const)
            : ("nonfinite-position" as const),
    }));

  const format =
    (field: string, axis: ScatterAxisScale) => (value: string | number) => {
      if (axis.kind === "numeric")
        return formatFieldValue(field, value, snapshot.fieldSettings[field]);
      const category = axis.categories.find((item) => item.label === value);
      return category
        ? display(field, category.value, snapshot.fieldSettings)
        : String(value);
    };
  const domainSource = (axis: ScatterAxisScale) =>
    axis.kind === "numeric"
      ? {
          population: "all source rows",
          rows: snapshot.allIds.length,
          bounds: axis.bounds,
          padding: "10% on each side",
        }
      : undefined;
  const axisLabel = (label: string, axis: ScatterAxisScale) =>
    [label, axis.type === "symlog" && "symlog"].filter(Boolean).join(" · ");
  const labelSource = (local: string) =>
    local ? ("chart-setting" as const) : ("field-label" as const);
  const axes = planAxes({
    plotWidth,
    plotHeight,
    margin: {
      ...margin,
      bottom:
        margin.bottom -
        (size?.legendHeight ?? 0) -
        (settings.display === "hexbin" || settings.display === "contour"
          ? SURFACE_LEGEND_HEIGHT
          : 0),
    },
    marginPolicy,
    footer,
    x: {
      scale: xScale,
      scaleType: xAxis.type,
      field: settings.xField,
      fieldLabel: xLabel,
      density: settings.xGridLines,
      tickFontSize: settings.xAxis.tickFontSize,
      labelFontSize: settings.xAxis.labelFontSize,
      grid: settings.xAxis.grid,
      format: format(settings.xField, xAxis),
      label: axisLabel(xLabel, xAxis),
      labelSource: labelSource(settings.xAxisLabel),
      domainSource: domainSource(xAxis),
    },
    y: {
      scale: yScale,
      scaleType: yAxis.type,
      field: settings.yField,
      fieldLabel: yLabel,
      density: settings.yGridLines,
      tickFontSize: settings.yAxis.tickFontSize,
      labelFontSize: settings.yAxis.labelFontSize,
      grid: settings.yAxis.grid,
      format: format(settings.yField, yAxis),
      label: axisLabel(yLabel, yAxis),
      labelSource: labelSource(settings.yAxisLabel),
      rule: false,
      bandTitle: true,
      domainSource: domainSource(yAxis),
    },
  });

  const xSpan = filterSpan(xAxis, settings.filters, settings.xField);
  const ySpan = filterSpan(yAxis, settings.filters, settings.yField);
  const round = (value: number) => Math.round(value * 10000) / 10000;
  const brushExtent: Extent | null =
    xSpan && ySpan
      ? [
          [round(xSpan[0]), round(ySpan[0])],
          [round(xSpan[1]), round(ySpan[1])],
        ]
      : null;
  const title = getChartTitle(settings, (field) =>
    fieldLabel(field, snapshot.fieldSettings)
  );
  const calculatedBadges: ScatterPlan["calculatedBadges"] = [];
  const axisTitle = (axis: "x" | "y") =>
    axes[axis].guides.find((guide) => guide.role === "label")?.label;
  const xTitle = axisTitle("x");
  if (xTitle && snapshot.calculatedFields?.includes(settings.xField)) {
    calculatedBadges.push({
      id: "calculation:x",
      field: settings.xField,
      x:
        margin.left +
        xTitle.x +
        (xTitle.fullText.length * TITLE_CHAR_WIDTH) / 2 +
        BADGE_GAP,
      y: margin.top + xTitle.y - xTitle.fontSize * 0.35,
      rotation: 0,
    });
  }
  const yTitle = axisTitle("y");
  if (yTitle && snapshot.calculatedFields?.includes(settings.yField)) {
    // The title is rotated -90°, so its end is above its centre.
    calculatedBadges.push({
      id: "calculation:y",
      field: settings.yField,
      x: margin.left + yTitle.y - yTitle.fontSize * 0.35,
      y:
        margin.top -
        yTitle.x -
        (yTitle.fullText.length * TITLE_CHAR_WIDTH) / 2 -
        BADGE_GAP,
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
    xScale: describeScale(xScale, xAxis.type),
    yScale: describeScale(yScale, yAxis.type),
    xCategories: xAxis.kind === "band" ? xAxis.categories : undefined,
    yCategories: yAxis.kind === "band" ? yAxis.categories : undefined,
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
      x: xAxis.kind === "numeric" ? xAxis.bounds : undefined,
      y: yAxis.kind === "numeric" ? yAxis.bounds : undefined,
      buffer: DOMAIN_PADDING,
      population: "all",
    },
    legend,
    brushExtent,
    pointStyle,
    size,
    points,
    exclusions,
    emptyMessage:
      ids.length > 0 && points.length === 0
        ? size && exclusions.some((item) => item.reason === "invalid-size")
          ? `${size.label} needs finite, nonnegative values. Inspect excluded rows to see their inputs.`
          : emptyMessage(exclusions, snapshot, xLabel, yLabel)
        : undefined,
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

export function scatterPointAt(plan: ScatterPlan, x: number, y: number) {
  if (plan.size) {
    // Canvas paints small bubbles last. Hit the topmost visible bubble.
    for (let i = plan.points.length - 1; i >= 0; i--) {
      const point = plan.points[i]!;
      if (Math.hypot(point.x - x, point.y - y) <= Math.max(6, point.radius))
        return point;
    }
    return undefined;
  }
  let nearest: ScatterPoint | undefined;
  let distance = 10;
  for (const point of plan.points) {
    const next = Math.hypot(point.x - x, point.y - y);
    if (next < distance) {
      nearest = point;
      distance = next;
    }
  }
  return nearest;
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
    sizeText: settings.sizeField
      ? value(settings.sizeField, point.sizeValue)
      : undefined,
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

/** The chart's own filters for a brushed rectangle, one per axis field. */
export function brushFilters(plan: ScatterPlan, extent: Extent): Filter[] {
  const xAxis = planAxisScale(plan.xScale, plan.xCategories);
  const yAxis = planAxisScale(plan.yScale, plan.yCategories);
  const filters: Filter[] = [
    spanFilter(xAxis, plan.xField, [extent[0][0], extent[1][0]]),
    spanFilter(yAxis, plan.yField, [extent[0][1], extent[1][1]]),
  ];
  if (plan.size) {
    const sizeRange = filters.find(
      (filter) => filter.field === plan.size!.field && filter.type === "range"
    );
    if (sizeRange?.type === "range")
      sizeRange.min = Math.max(0, sizeRange.min ?? 0);
    else filters.push({ type: "range", field: plan.size.field, min: 0 });
  }
  return filters;
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
    const xWidth = xText.length * 6.2 + 10;
    const yWidth = yText.length * 6.2 + 10;
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
        r: point.radius + 4,
        fill: "none",
        stroke: "var(--foreground)",
        strokeWidth: 2,
      },
      { kind: "circle", id: "readout:center", cx: x, cy: y, r: 2, fill: color },
      // Hovered values sit on the axes in dark pills, as on the ECDF and
      // line charts.
      {
        kind: "rect",
        id: "readout:x-bg",
        x: labelX - xWidth / 2,
        y: plan.plotHeight + 4,
        width: xWidth,
        height: 16,
        rx: 3,
        fill: "var(--foreground)",
      },
      {
        kind: "rect",
        id: "readout:y-bg",
        x: -yWidth - 4,
        y: y - 8,
        width: yWidth,
        height: 16,
        rx: 3,
        fill: "var(--foreground)",
      },
      {
        kind: "text",
        id: "readout:x-text",
        x: labelX,
        y: plan.plotHeight + 15,
        text: xText,
        fill: "var(--background)",
        fontSize: 10,
        fontWeight: 600,
        textAnchor: "middle",
      },
      {
        kind: "text",
        id: "readout:y-text",
        x: -4 - yWidth / 2,
        y,
        dy: ".32em",
        text: yText,
        fill: "var(--background)",
        fontSize: 10,
        fontWeight: 600,
        textAnchor: "middle",
      }
    );
  }
  return {
    brush,
    readout,
    readoutLabel,
  };
}
