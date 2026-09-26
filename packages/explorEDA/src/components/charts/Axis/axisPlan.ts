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
      type: "linear" | "symlog";
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
    type: scaleType === "symlog" ? "symlog" : "linear",
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
  return numericScale({ scaleType: descriptor.type })
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

export interface AxisInput {
  scale: ChartScale;
  scaleType?: string;
  field?: string;
  fieldLabel?: string;
  /** Tick density from the chart setting. Undefined uses 5. */
  density?: number;
  grid?: boolean;
  format: (value: string | number) => string;
  label?: string;
  labelSource?: GuideSource;
  rule?: boolean;
  zero?: boolean;
  domainSource?: AxisDomainSource;
}

const MIN_LABEL_GAP = 8;
const X_LABEL_CHAR_WIDTH = 6;
const Y_LABEL_HEIGHT = 12;

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

function position(scale: ChartScale, tick: number | string) {
  return "bandwidth" in scale
    ? (scale(String(tick)) ?? 0) + scale.bandwidth() / 2
    : scale(Number(tick));
}

const AXIS_WORD = { x: "Horizontal", y: "Vertical" } as const;

function planAxis(
  axis: AxisName,
  input: AxisInput,
  plotWidth: number,
  plotHeight: number,
  margin: MarginSettings
): AxisPlan {
  const { scale, format } = input;
  const band = "bandwidth" in scale;
  // Density sets the D3 candidate target. Spacing then drops overlapping labels.
  const requested = Math.max(2, input.density ?? 5);
  const candidates: (number | string)[] = band
    ? scale.domain()
    : scale.ticks(requested);
  const shown = band
    ? candidates
    : spacedTicks(
        candidates,
        (tick) => position(scale, tick),
        axis === "x"
          ? (tick) => format(tick).length * X_LABEL_CHAR_WIDTH
          : () => Y_LABEL_HEIGHT
      );
  const maxLabelChars =
    axis === "x"
      ? band
        ? Math.max(3, Math.floor(scale.step() / 7))
        : 20
      : Math.max(5, Math.floor((margin.left - 12 - 4) / 6));
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
      ariaLabel: `${word} tick ${fullText}`,
      line:
        axis === "x"
          ? { x1: at, y1: plotHeight, x2: at, y2: plotHeight + 4 }
          : undefined,
      label:
        axis === "x"
          ? {
              text: truncate(fullText, maxLabelChars),
              fullText,
              x: at,
              y: plotHeight + 17,
              anchor: "middle",
              fontSize: 10,
            }
          : {
              text: truncate(fullText, maxLabelChars),
              fullText,
              x: -9,
              y: at,
              anchor: "end",
              fontSize: 10,
              dy: ".32em",
            },
    });
  }
  // A band Y axis names its categories in the tick labels, so it has no title.
  if (input.label && !(axis === "y" && band)) {
    guides.push({
      id: `${axis}:label`,
      axis,
      role: "label",
      source: input.labelSource ?? "chart-setting",
      ariaLabel: `${word} axis label ${input.label}`,
      label:
        axis === "x"
          ? {
              text: input.label,
              fullText: input.label,
              x: plotWidth / 2,
              y: plotHeight + Math.max(32, margin.bottom - 8),
              anchor: "middle",
              fontSize: 11,
            }
          : {
              text: input.label,
              fullText: input.label,
              x: -plotHeight / 2,
              y: -(margin.left - 12),
              anchor: "middle",
              fontSize: 11,
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
      ariaLabel: `${axis === "x" ? "Horizontal" : "Vertical"} grid line ${tick}`,
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
          ? `${X_LABEL_CHAR_WIDTH} px per character`
          : `${Y_LABEL_HEIGHT} px per label`,
      maxLabelChars,
    },
    grid: input.grid && !band ? { requested: gridRequested, values: gridValues } : undefined,
    domainSource: input.domainSource,
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
}: {
  x: AxisInput;
  y: AxisInput;
  plotWidth: number;
  plotHeight: number;
  margin: MarginSettings;
  marginPolicy?: MarginPolicy;
}): ChartAxesPlan {
  return {
    x: planAxis("x", x, plotWidth, plotHeight, margin),
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
}: {
  margin: MarginSettings;
  width: number;
  yDomain: [number, number];
  hasXLabel: boolean;
  hasYLabel: boolean;
}): { margin: MarginSettings; policy: MarginPolicy } {
  const labelLeftMargin = Math.max(
    margin.left,
    ...scaleLinear()
      .domain(yDomain)
      .ticks(5)
      .map((tick) => String(tick).length * 7 + (hasYLabel ? 38 : 18))
  );
  const minPlotWidth = Math.min(
    80,
    Math.max(0, width - margin.left - margin.right)
  );
  const maxLeftMargin = Math.max(0, width - margin.right - minPlotWidth);
  const bottomMargin = Math.max(margin.bottom, hasXLabel ? 46 : 28);
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
