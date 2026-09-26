import type { RowCalculationTrace } from "@/lib/calculations/CalculationState";
import type { planNumericalLegend } from "@/lib/colorScaleMath";
import type { datum } from "@/types/ChartTypes";
import {
  findAxisGuide,
  type AxisGuide,
  type AxisPlan,
  type ChartAxesPlan,
} from "../Axis/axisPlan";
import type { FacetLayoutPlan } from "../FacetRelated/facetLayout";
import type { BarTrace } from "../BarChart/barTrace";
import type { ScatterTrace } from "../ScatterPlot/scatterTrace";

/** A selected object. The owner's source resolves it against its current plan. */
export interface TraceSelection {
  owner: string;
  kind: string;
  id: string;
  revision: string;
}

export interface TraceTarget {
  kind: string;
  id: string;
  label: string;
}

export interface GuideTrace {
  kind: "guide";
  id: string;
  revision: string;
  guide: AxisGuide;
  axis: AxisPlan;
  axes: ChartAxesPlan;
}

export interface TitleTrace {
  kind: "title";
  id: string;
  revision: string;
  text: string;
  source: "chart-setting" | "field-label";
  field?: string;
}

export interface FacetHeadingTrace {
  field: string;
  value: datum;
  label: string;
  raw?: datum;
  sampleSourceId?: number;
  calculation?: RowCalculationTrace;
}

export interface FacetTrace {
  kind: "facet";
  id: string;
  revision: string;
  role: "panel" | "row-heading" | "column-heading";
  row?: FacetHeadingTrace;
  column?: FacetHeadingTrace;
  layout: FacetLayoutPlan;
  sourceIds: number[];
  chartIds: number[];
}

export interface LegendTrace {
  kind: "legend";
  id: string;
  revision: string;
  field: string;
  fieldLabel: string;
  scaleId: string;
  scaleType: "categorical" | "numerical";
  palette: string | string[];
  domain?: [number, number];
  item?: {
    id: string;
    label: string;
    color: string;
    count: number;
    selected: boolean;
  };
  rowIds: number[];
  numericalPlan?: ReturnType<typeof planNumericalLegend>;
}

export type ChartTrace =
  | ScatterTrace
  | BarTrace
  | GuideTrace
  | TitleTrace
  | FacetTrace
  | LegendTrace;

/** A planned legend entry that a chart owns, so the legend draws what the chart drew. */
export interface PlannedLegendItem {
  id: string;
  value: datum;
  label: string;
  count: number;
  color: string;
  selected: boolean;
}

export interface TraceSource {
  role: "chart" | "facets" | "legend" | "title";
  /** Data revision. A selection made under another revision is stale. */
  revision: string;
  resolve(kind: string, id: string): ChartTrace | undefined;
  /** Returns the object that draws this source row, or "pending" while a view changes to show it. */
  findRow?(id: number): { kind: string; id: string } | "pending" | undefined;
  targets?(): TraceTarget[];
  legendItems?: PlannedLegendItem[];
}

export function resolveGuideTrace(
  axes: ChartAxesPlan,
  id: string,
  revision: string
): GuideTrace | undefined {
  const found = findAxisGuide(axes, id);
  return found && {
    kind: "guide",
    id,
    revision,
    guide: found.guide,
    axis: found.axis,
    axes,
  };
}

export function guideTargets(axes: ChartAxesPlan): TraceTarget[] {
  return [
    ...axes.x.gridGuides,
    ...axes.y.gridGuides,
    ...axes.x.guides,
    ...axes.y.guides,
  ].map((guide) => ({ kind: "guide", id: guide.id, label: guide.id }));
}
