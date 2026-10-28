import {
  scaleBand,
  scaleLinear,
  type ScaleBand,
  type ScaleLinear,
} from "d3-scale";
import type { MarginSettings } from "@/types/ChartTypes";
import { numericScale } from "./numericScale";

export type AxisName = "x" | "y";
export type ChartScale = ScaleLinear<number, number> | ScaleBand<string>;

export type ScaleDescriptor =
  | {
      type: "band";
      domain: string[];
      range: [number, number];
      padding: number;
    }
  | {
      type: "linear" | "symlog" | "log";
      domain: [number, number];
      range: [number, number];
    };

/** Records a D3 scale so a trace can show it and a renderer can rebuild it. */
export function describeScale(
  scale: ChartScale,
  scaleType?: string
): ScaleDescriptor {
  if ("bandwidth" in scale) {
    return {
      type: "band",
      domain: scale.domain(),
      range: scale.range() as [number, number],
      padding: scale.padding(),
    };
  }
  return {
    // A log scale says so itself; a saved type alone may not have applied.
    type:
      "base" in scale ? "log" : scaleType === "symlog" ? "symlog" : "linear",
    domain: scale.domain() as [number, number],
    range: scale.range() as [number, number],
  };
}

export function buildScale(descriptor: ScaleDescriptor): ChartScale {
  if (descriptor.type === "band") {
    return scaleBand<string>()
      .domain(descriptor.domain)
      .range(descriptor.range)
      .padding(descriptor.padding);
  }
  return numericScale({ scaleType: descriptor.type }, true)
    .domain(descriptor.domain)
    .range(descriptor.range);
}

export type GuideRole = "rule" | "tick" | "grid" | "label" | "zero";
export type GuideSource = "scale" | "chart-setting" | "field-label";

export interface GuideLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface GuideText {
  text: string;
  fullText: string;
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  fontSize: number;
  dy?: string;
  rotate?: number;
}

/** One selectable axis object in plot coordinates. */
export interface AxisGuide {
  id: string;
  axis: AxisName;
  role: GuideRole;
  value?: number | string;
  source: GuideSource;
  ariaLabel: string;
  line?: GuideLine;
  label?: GuideText;
  /** The field this axis shows, on titles and tick labels. */
  field?: string;
}

export interface AxisDomainSource {
  /** Which rows set the domain, in words a reader can check. */
  population: string;
  rows: number;
  bounds: [number, number];
  padding: string;
  lower?: { label: string; value: number };
  upper?: { label: string; value: number };
}

/** Marks a chart draws past one end of an axis, so the axis hides them. */
export interface AxisHidden {
  count: number;
  /** What the count counts, singular then plural, such as ["row", "rows"]. */
  unit: [string, string];
  /** Why they are hidden: a bound the user set. */
  reason: "bound";
  /** The axis end they pass, in data units. */
  at: number;
  /** That end as the axis writes it, such as "$1,000.00". */
  atLabel?: string;
  /** True when the marks run past the end and are cut off, such as bars. */
  cut?: boolean;
}

/** Hidden marks past the low and high end of an axis. */
export interface AxisHiddenEnds {
  low?: AxisHidden;
  high?: AxisHidden;
  /** Rows a log axis cannot place, because they are zero or negative. */
  nonpositive?: { count: number; unit: [string, string] };
}

export interface AxisPlan {
  axis: AxisName;
  field?: string;
  fieldLabel?: string;
  scale: ScaleDescriptor;
  labelText?: string;
  labelSource?: GuideSource;
  ticks: {
    requested: number;
    candidates: (number | string)[];
    shown: (number | string)[];
    omitted: (number | string)[];
    minLabelGap: number;
    labelSpacing: string;
    maxLabelChars: number;
  };
  grid?: { requested: number; values: number[] };
  domainSource?: AxisDomainSource;
  hidden?: AxisHiddenEnds;
  guides: AxisGuide[];
  gridGuides: AxisGuide[];
}

export interface MarginPolicy {
  requestedLeftMargin: number;
  labelLeftMargin: number;
  maxLeftMargin: number;
  minPlotWidth: number;
  bottomMargin: number;
}

export interface ChartAxesPlan {
  x: AxisPlan;
  y: AxisPlan;
  plotWidth: number;
  plotHeight: number;
  margin: MarginSettings;
  marginPolicy?: MarginPolicy;
}

/**
 * The theme's axis type. Sizes fill in where the chart sets none, and
 * `measure` gives rendered text width so wide type claims room.
 */
export interface AxisTypography {
  tickSize: number;
  labelSize: number;
  measure: (text: string, size: number) => number;
}

export const DEFAULT_AXIS_TYPOGRAPHY: AxisTypography = {
  tickSize: 10,
  labelSize: 11,
  measure: (text, size) => text.length * size * 0.6,
};

/**
 * Text width for layout: the measured width, never less than the estimate
 * the axes always used, so compact charts keep their spacing.
 */
function textWidth(
  typography: AxisTypography,
  text: string,
  size: number,
  factor = 0.6
) {
  return Math.max(text.length * size * factor, typography.measure(text, size));
}

/** Cuts text with an ellipsis so it fits a width. */
function fitText(
  typography: AxisTypography,
  text: string,
  size: number,
  maxWidth: number,
  factor = 0.6
) {
  if (textWidth(typography, text, size, factor) <= maxWidth) return text;
  let low = 0;
  let high = text.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (
      textWidth(typography, `${text.slice(0, mid)}…`, size, factor) <= maxWidth
    )
      low = mid;
    else high = mid - 1;
  }
  return `${text.slice(0, Math.max(2, low))}…`;
}

export interface AxisInput {
  scale: ChartScale;
  /** Theme sizes and text measurement. Defaults to the compact sizes. */
  typography?: AxisTypography;
  /** Explicit data-unit ticks, such as UTC calendar boundaries. */
  tickValues?: number[];
  scaleType?: string;
  field?: string;
  fieldLabel?: string;
  /** Tick density from the chart setting. Undefined uses 5. */
  density?: number;
  tickFontSize?: number;
  labelFontSize?: number;
  grid?: boolean;
  format: (value: string | number) => string;
  label?: string;
  labelSource?: GuideSource;
  rule?: boolean;
  zero?: boolean;
  /** Keeps the title on a band Y axis, where tick labels alone do not name the field. */
  bandTitle?: boolean;
  domainSource?: AxisDomainSource;
  /** Marks past either end of the axis, which it marks at that end. */
  hidden?: AxisHiddenEnds;
}

const MIN_LABEL_GAP = 8;
function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Keeps label order by position and drops a label that would overlap the last kept one. */
function spacedTicks<T extends number | string>(
  ticks: T[],
  position: (tick: T) => number,
  size: (tick: T) => number
) {
  let edge = -Infinity;
  return [...ticks]
    .sort((a, b) => position(a) - position(b))
    .filter((tick) => {
      const half = size(tick) / 2;
      if (position(tick) - half < edge + MIN_LABEL_GAP) return false;
      edge = position(tick) + half;
      return true;
    });
}

/**
 * A log axis labels powers of ten, adding 2s and 5s only across a short
 * span, as D3's own log tick format chooses.
 */
function logTicks(scale: ScaleLinear<number, number>, requested: number) {
  const keep = scale.tickFormat(requested);
  return scale.ticks(requested).filter((tick) => keep(tick) !== "");
}

function position(scale: ChartScale, tick: number | string) {
  return "bandwidth" in scale
    ? (scale(String(tick)) ?? 0) + scale.bandwidth() / 2
    : scale(Number(tick));
}

const AXIS_WORD = { x: "Horizontal", y: "Vertical" } as const;

/**
 * A field's precision pads every tick, so a round axis reads 0.0, 100.0,
 * 200.0. When every tick's fraction is zero, the ticks drop it; ticks with a
 * real fraction, such as 2.0 beside 2.5, keep it.
 */
function trimZeroFractions(
  format: AxisInput["format"],
  ticks: (number | string)[]
): AxisInput["format"] {
  const zero = /(\d)\.0+(?!\d)/;
  const labels = ticks.map((tick) => format(tick));
  if (!labels.length || !labels.every((label) => zero.test(label)))
    return format;
  return (value) => format(value).replace(zero, "$1");
}

function planAxis(
  axis: AxisName,
  input: AxisInput,
  plotWidth: number,
  plotHeight: number,
  margin: MarginSettings,
  footer = 0
): AxisPlan {
  const { scale } = input;
  const band = "bandwidth" in scale;
  const typography = input.typography ?? DEFAULT_AXIS_TYPOGRAPHY;
  const tickFontSize = input.tickFontSize ?? typography.tickSize;
  const labelFontSize = input.labelFontSize ?? typography.labelSize;
  const tickCharWidth = tickFontSize * 0.6;
  // Density sets the D3 candidate target. Spacing then drops overlapping labels.
  const requested = Math.max(2, input.density ?? 5);
  const candidates: (number | string)[] =
    input.tickValues ??
    (band
      ? scale.domain()
      : "base" in scale
        ? logTicks(scale, requested)
        : scale.ticks(requested));
  const format = band
    ? input.format
    : trimZeroFractions(input.format, candidates);
  // Crowded band labels keep every stride-th category, so each shown label
  // has room for about six characters instead of two or three. Past a dozen
  // categories most labels drop anyway, so the kept ones get room for twelve
  // and a date reads 2021-07-05, not 2021-….
  const roomChars = candidates.length > 12 ? 12 : 6;
  const stride =
    axis === "x" && band
      ? Math.max(
          1,
          Math.ceil(
            (Math.min(
              roomChars * tickFontSize * 0.7,
              Math.max(
                0,
                ...candidates.map((tick) =>
                  textWidth(typography, format(tick), tickFontSize, 0.7)
                )
              )
            ) +
              MIN_LABEL_GAP) /
              Math.max(1, scale.step())
          )
        )
      : 1;
  const shown = band
    ? candidates.filter((_, index) => index % stride === 0)
    : spacedTicks(
        candidates,
        (tick) => position(scale, tick),
        axis === "x"
          ? (tick) => textWidth(typography, format(tick), tickFontSize)
          : () => tickFontSize * 1.2
      );
  const maxLabelChars =
    axis === "x"
      ? band
        ? Math.max(
            3,
            Math.floor((stride * scale.step()) / (tickFontSize * 0.7))
          )
        : 20
      : Math.max(5, Math.floor((margin.left - 12 - 4) / tickCharWidth));
  // Tick text fits the room the layout gives it, measured in its own font.
  const maxTickWidth =
    axis === "x"
      ? band
        ? Math.max(
            3 * tickFontSize * 0.7,
            stride * scale.step() - MIN_LABEL_GAP
          )
        : 20 * tickCharWidth
      : Math.max(5 * tickCharWidth, margin.left - 12 - 4);
  const tickText = (text: string) =>
    fitText(
      typography,
      truncate(text, maxLabelChars),
      tickFontSize,
      maxTickWidth,
      axis === "x" && band ? 0.7 : 0.6
    );
  const word = AXIS_WORD[axis];
  const guides: AxisGuide[] = [];
  if (input.rule !== false) {
    guides.push({
      id: `${axis}:rule`,
      axis,
      role: "rule",
      source: "scale",
      ariaLabel: `${word} axis`,
      line:
        axis === "x"
          ? { x1: 0, y1: plotHeight, x2: plotWidth, y2: plotHeight }
          : { x1: 0, y1: plotHeight, x2: 0, y2: 0 },
    });
  }
  for (const tick of shown) {
    const at = position(scale, tick);
    const fullText = format(tick);
    guides.push({
      id: `${axis}:tick:${String(tick)}`,
      axis,
      role: "tick",
      value: tick,
      source: "scale",
      field: input.field,
      ariaLabel: `${word} tick ${fullText}`,
      line:
        axis === "x"
          ? { x1: at, y1: plotHeight, x2: at, y2: plotHeight + 4 }
          : undefined,
      label:
        axis === "x"
          ? {
              text: tickText(fullText),
              fullText,
              x: at,
              y: plotHeight + 7 + tickFontSize,
              anchor: "middle",
              fontSize: tickFontSize,
            }
          : {
              text: tickText(fullText),
              fullText,
              x: -9,
              y: at,
              anchor: "end",
              fontSize: tickFontSize,
              dy: ".32em",
            },
    });
  }
  // A band Y axis names its categories in the tick labels, so it has no title.
  if (input.label && !(axis === "y" && band && !input.bandTitle)) {
    guides.push({
      id: `${axis}:label`,
      axis,
      role: "label",
      source: input.labelSource ?? "chart-setting",
      field: input.field,
      ariaLabel: `${word} axis label ${input.label}`,
      label:
        axis === "x"
          ? {
              text: fitText(
                typography,
                input.label,
                labelFontSize,
                Math.max(3 * labelFontSize * 0.6, plotWidth)
              ),
              fullText: input.label,
              x: plotWidth / 2,
              y:
                plotHeight +
                Math.max(
                  32 + (tickFontSize - 10) + (labelFontSize - 11),
                  margin.bottom - footer - 8
                ),
              anchor: "middle",
              fontSize: labelFontSize,
            }
          : {
              text: fitText(
                typography,
                input.label,
                labelFontSize,
                Math.max(3 * labelFontSize * 0.6, plotHeight)
              ),
              fullText: input.label,
              x: -plotHeight / 2,
              y: -(margin.left - 12),
              anchor: "middle",
              fontSize: labelFontSize,
              rotate: -90,
            },
    });
  }
  if (input.zero && !band && Number.isFinite(scale(0))) {
    const at = scale(0);
    guides.push({
      id: `${axis}:zero`,
      axis,
      role: "zero",
      value: 0,
      source: "scale",
      ariaLabel: "Zero baseline",
      line:
        axis === "y"
          ? { x1: 0, y1: at, x2: plotWidth, y2: at }
          : { x1: at, y1: 0, x2: at, y2: plotHeight },
    });
  }
  const gridRequested = input.density || 5;
  const linear = band ? undefined : scale;
  const gridValues = input.grid && linear ? linear.ticks(gridRequested) : [];
  const gridGuides = gridValues.map((tick): AxisGuide => {
    const at = linear!(tick);
    return {
      id: `grid:${axis}:${tick}`,
      axis,
      role: "grid",
      value: tick,
      source: "scale",
      ariaLabel: `${input.label || input.fieldLabel || `${axis.toUpperCase()} axis`} grid line at ${input.format(tick)}`,
      line:
        axis === "x"
          ? { x1: at, y1: 0, x2: at, y2: plotHeight }
          : { x1: 0, y1: at, x2: plotWidth, y2: at },
    };
  });
  return {
    axis,
    field: input.field,
    fieldLabel: input.fieldLabel,
    scale: describeScale(scale, input.scaleType),
    labelText: input.label,
    labelSource: input.labelSource,
    ticks: {
      requested,
      candidates,
      shown,
      omitted: candidates.filter((tick) => !shown.includes(tick)),
      minLabelGap: MIN_LABEL_GAP,
      labelSpacing:
        axis === "x"
          ? `${tickCharWidth} px per character`
          : `${tickFontSize * 1.2} px per label`,
      maxLabelChars,
    },
    grid:
      input.grid && !band
        ? { requested: gridRequested, values: gridValues }
        : undefined,
    domainSource: input.domainSource,
    hidden: input.hidden,
    guides,
    gridGuides,
  };
}

/** Plans both axes and their grid lines. Drawing and tracing read the same objects. */
export function planAxes({
  x,
  y,
  plotWidth,
  plotHeight,
  margin,
  marginPolicy,
  footer = 0,
}: {
  x: AxisInput;
  y: AxisInput;
  plotWidth: number;
  plotHeight: number;
  margin: MarginSettings;
  marginPolicy?: MarginPolicy;
  /** Bottom margin kept below the axis title, such as for a status line. */
  footer?: number;
}): ChartAxesPlan {
  return {
    x: planAxis("x", x, plotWidth, plotHeight, margin, footer),
    y: planAxis("y", y, plotWidth, plotHeight, margin),
    plotWidth,
    plotHeight,
    margin,
    marginPolicy,
  };
}

/** Widens the left margin for Y labels while keeping a minimum plot width. */
export function planChartMargin({
  margin,
  width,
  yDomain,
  hasXLabel,
  hasYLabel,
  yTickFontSize,
  yLabels,
  typography = DEFAULT_AXIS_TYPOGRAPHY,
  xTickFontSize,
}: {
  margin: MarginSettings;
  width: number;
  yDomain: [number, number];
  hasXLabel: boolean;
  hasYLabel: boolean;
  yTickFontSize?: number;
  /** Tick labels of a band Y axis, which replace the numeric ticks. */
  yLabels?: string[];
  typography?: AxisTypography;
  /** The X tick size, when the chart sets one; it sizes the bottom margin. */
  xTickFontSize?: number;
}): { margin: MarginSettings; policy: MarginPolicy } {
  const labels = yLabels ?? scaleLinear().domain(yDomain).ticks(5).map(String);
  const yTick = yTickFontSize ?? typography.tickSize;
  // Larger type than the compact sizes widens the title band and footer.
  const labelGrowth = Math.max(0, typography.labelSize - 11);
  const tickGrowth = Math.max(0, (xTickFontSize ?? typography.tickSize) - 10);
  const labelLeftMargin = Math.max(
    margin.left,
    ...labels.map(
      (label) =>
        textWidth(typography, label, yTick, 0.7) +
        (hasYLabel ? 38 + labelGrowth : 18)
    )
  );
  const minPlotWidth = Math.min(
    80,
    Math.max(0, width - margin.left - margin.right)
  );
  const maxLeftMargin = Math.max(0, width - margin.right - minPlotWidth);
  const bottomMargin = Math.max(
    margin.bottom,
    (hasXLabel ? 46 + labelGrowth : 28) + tickGrowth
  );
  return {
    margin: {
      ...margin,
      left: Math.min(labelLeftMargin, maxLeftMargin),
      bottom: bottomMargin,
    },
    policy: {
      requestedLeftMargin: margin.left,
      labelLeftMargin,
      maxLeftMargin,
      minPlotWidth,
      bottomMargin,
    },
  };
}

export function axisGuides(plan: ChartAxesPlan): AxisGuide[] {
  return [
    ...plan.x.gridGuides,
    ...plan.y.gridGuides,
    ...plan.x.guides,
    ...plan.y.guides,
  ];
}

export function findAxisGuide(plan: ChartAxesPlan, id: string) {
  for (const axis of [plan.x, plan.y]) {
    const guide =
      axis.guides.find((item) => item.id === id) ??
      axis.gridGuides.find((item) => item.id === id);
    if (guide) return { guide, axis };
  }
  return undefined;
}
