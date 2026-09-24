import type { AggregateResultRow } from "@/lib/aggregates";
import type { AxisSettings, MarginSettings, datum } from "@/types/ChartTypes";
import { numericScale } from "../Axis/numericScale";
import { scaleBand, type ScaleBand, type ScaleLinear } from "d3-scale";

export interface AggregateBarPlanInput {
  rows: AggregateResultRow[];
  width: number;
  height: number;
  margin: MarginSettings;
  yAxis?: AxisSettings;
  xScale?: ScaleBand<string>;
  yScale?: ScaleLinear<number, number>;
  colorScaleId?: string;
  getColor?: (value: datum) => string;
  domainValues?: { rowId: string; value: number }[];
}

export interface AggregateBarPlanRow {
  markId: string;
  rowId: string;
  order: number;
  label: string;
  groupValue: datum;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  baseline: number;
  fill: string;
  fillSource: {
    kind: "color-scale";
    scaleId?: string;
    value: datum;
  };
}

export interface AggregateBarPlan {
  bars: AggregateBarPlanRow[];
  groupOrder: string[];
  innerWidth: number;
  innerHeight: number;
  xScale: { domain: string[]; range: [number, number]; padding: number };
  yScale: {
    domain: [number, number];
    range: [number, number];
    type: "linear" | "symlog";
  };
  domainValues: { rowId: string; value: number }[];
  domainSetters: {
    lower: { source: "zero" | "aggregate"; rowId?: string; value: number };
    upper: { source: "zero" | "aggregate"; rowId?: string; value: number };
  };
  zeroBaseline: number;
}

const DEFAULT_FILL = "#3479a8";

function finiteValues(rows: AggregateResultRow[]) {
  return rows.flatMap((row) =>
    typeof row.value === "number" && Number.isFinite(row.value)
      ? [{ rowId: row.id, value: row.value }]
      : []
  );
}

export function planAggregateBars({
  rows,
  width,
  height,
  margin,
  yAxis,
  xScale: suppliedXScale,
  yScale: suppliedYScale,
  colorScaleId,
  getColor,
  domainValues: suppliedDomainValues,
}: AggregateBarPlanInput): AggregateBarPlan {
  const groupOrder = rows.map((row) => row.groupLabel);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const values = suppliedDomainValues ?? finiteValues(rows);
  const min = values.reduce((result, item) => Math.min(result, item.value), 0);
  const max = values.reduce((result, item) => Math.max(result, item.value), 0);
  const padding = min === max ? 0.5 : (max - min) * 0.1;
  const domain: [number, number] = [
    min - (min < 0 ? padding : 0),
    max + padding,
  ];
  const xScale =
    suppliedXScale ??
    scaleBand<string>().domain(groupOrder).range([0, innerWidth]).padding(0.3);
  const yScale =
    suppliedYScale ??
    numericScale(yAxis).domain(domain).range([innerHeight, 0]);
  const baseline = yScale(0);
  const lower = values.reduce(
    (winner, item) => (item.value < winner.value ? item : winner),
    { rowId: "", value: 0 }
  );
  const upper = values.reduce(
    (winner, item) => (item.value > winner.value ? item : winner),
    { rowId: "", value: 0 }
  );
  const bars = rows.flatMap((row, order) => {
    if (typeof row.value !== "number" || !Number.isFinite(row.value)) {
      return [];
    }
    const x = xScale(row.groupLabel);
    if (x === undefined || xScale.bandwidth() < 1) return [];
    const valuePosition = yScale(row.value);
    return [
      {
        markId: `aggregate-bar:${row.id}`,
        rowId: row.id,
        order,
        label: row.groupLabel,
        groupValue: row.groupValue,
        value: row.value,
        x,
        y: Math.min(baseline, valuePosition),
        width: xScale.bandwidth(),
        height: Math.max(1, Math.abs(baseline - valuePosition)),
        baseline,
        fill: getColor?.(row.groupValue) ?? DEFAULT_FILL,
        fillSource: {
          kind: "color-scale" as const,
          scaleId: colorScaleId,
          value: row.groupValue,
        },
      },
    ];
  });
  return {
    bars,
    groupOrder,
    innerWidth,
    innerHeight,
    xScale: {
      domain: xScale.domain(),
      range: xScale.range() as [number, number],
      padding: xScale.padding(),
    },
    yScale: {
      domain: yScale.domain() as [number, number],
      range: yScale.range() as [number, number],
      type: yAxis?.scaleType === "symlog" ? "symlog" : "linear",
    },
    domainValues: values,
    domainSetters: {
      lower:
        lower.rowId === ""
          ? { source: "zero", value: 0 }
          : { source: "aggregate", rowId: lower.rowId, value: lower.value },
      upper:
        upper.rowId === ""
          ? { source: "zero", value: 0 }
          : { source: "aggregate", rowId: upper.rowId, value: upper.value },
    },
    zeroBaseline: baseline,
  };
}

export const planGroupedAggregateBars = planAggregateBars;
