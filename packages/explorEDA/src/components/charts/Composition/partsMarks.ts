import { applyFilter } from "@/hooks/applyFilter";
import type { datum } from "@/types/ChartTypes";
import { planDonut, type DonutSlice } from "../Donut/donutPlan";
import {
  planAccumulate,
  planBridge,
  type WaterfallBar,
  type WaterfallPlan,
} from "../Waterfall/waterfallPlan";
import {
  INK,
  MUTED_INK,
  type DonutMark,
  type UnitElement,
  type WaterfallMark,
} from "./compositionTypes";
import type { Bounds, SceneNode } from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";

/** Rows of one repeat, as the unit resolver passes them. */
interface PartsSubset {
  key: string;
  label: string;
  allIds: number[];
  liveIds: number[];
}

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const signed = (value: number) =>
  `${value > 0 ? "+" : ""}${compact.format(value)}`;

/**
 * One repeat's waterfall, computed as the Waterfall chart computes it: a
 * bridge between two states, or a running total over ordered steps.
 */
export function waterfallPlan(
  mark: WaterfallMark,
  subset: PartsSubset,
  data: CompositionData
): WaterfallPlan {
  const measureOf = (field: string | undefined) =>
    mark.aggregation === "sum" && field ? data.column(field) : undefined;
  const shared = {
    ids: subset.liveIds,
    orderIds: subset.allIds,
    step: data.column(mark.stepField),
    parent: mark.parentField ? data.column(mark.parentField) : undefined,
    aggregation: mark.aggregation,
  };
  const labels: [string, string] = [
    mark.states[0]?.label ?? "Start",
    mark.states[1]?.label ?? "End",
  ];
  if (mark.mode === "accumulate")
    return planAccumulate({
      ...shared,
      measure: measureOf(mark.measureField),
      startValue: mark.startValue,
      labels,
    });
  const states = [0, 1].map((index) => {
    const state = mark.states[index] ?? { label: labels[index]!, filters: [] };
    const tests = state.filters.map((filter) => ({
      filter,
      values: data.column(filter.field),
    }));
    return {
      label: state.label,
      measure: measureOf(state.measureField || mark.measureField),
      includes: (id: number) =>
        tests.every(({ filter, values }) => applyFilter(values[id], filter)),
    };
  }) as Parameters<typeof planBridge>[0]["states"];
  return planBridge({ ...shared, states });
}

/** The value range every repeat's waterfall shares, always including zero. */
export function waterfallDomain(plans: WaterfallPlan[]): [number, number] {
  let min = 0;
  let max = 0;
  for (const plan of plans)
    for (const bar of plan.bars) {
      min = Math.min(min, bar.from, bar.to);
      max = Math.max(max, bar.from, bar.to);
    }
  return max > min ? [min, max] : [0, 1];
}

const rowsOf = (bar: WaterfallBar) =>
  [...(bar.states ?? []), ...(bar.rows ? [bar.rows] : [])].flatMap((state) =>
    state.contributors
      .filter((item) => item.included)
      .map((item) => item.sourceId)
  );

/**
 * One repeat's waterfall in its frame: step names in a column at the left,
 * signed steps as bars on a shared value axis, start and end as a line from
 * zero to a dot, and subtotals as hollow checkpoints on the running total.
 */
export function waterfallNodes(
  unit: UnitElement,
  mark: WaterfallMark,
  subset: PartsSubset,
  plan: WaterfallPlan,
  domain: [number, number],
  frame: Bounds,
  paper: string
): SceneNode[] {
  const bars = plan.bars;
  if (!bars.length) return [];
  const valueRoom = 34;
  // Values of falling steps and negative totals sit left of their marks,
  // so the value axis starts past room for them.
  const negativeRoom = domain[0] < 0 ? 30 : 0;
  const left =
    frame.x + Math.min(mark.labelWidth, frame.width * 0.5) + negativeRoom;
  const right = Math.max(left + 10, frame.x + frame.width - valueRoom);
  const x = (value: number) =>
    left + ((value - domain[0]) / (domain[1] - domain[0])) * (right - left);
  const row = frame.height / bars.length;
  const band = Math.max(1, row * 0.7);
  const keyOf = (bar: WaterfallBar) =>
    `${unit.id}:${subset.key}:${mark.id}:${bar.key}`;
  const nodes: SceneNode[] = [];
  const zero = x(0);
  nodes.push({
    type: "line",
    key: `${unit.id}:${subset.key}:${mark.id}:zero`,
    elementId: unit.id,
    x1: zero,
    x2: zero,
    y1: frame.y,
    y2: frame.y + frame.height,
    stroke: MUTED_INK,
    strokeWidth: 0.75,
  });
  bars.forEach((bar, index) => {
    const mid = frame.y + row * index + row / 2;
    const key = keyOf(bar);
    const glyph = {
      instanceKey: subset.key,
      markId: mark.id,
      bin: { key: bar.key, label: bar.label },
      value: bar.amount,
      rowIds: rowsOf(bar),
      waterfall: {
        kind: bar.kind,
        mode: mark.mode,
        stepField: mark.stepField,
        states: bar.states?.map((state, at) => ({
          label: mark.states[at]?.label ?? "",
          value: state.value ?? 0,
        })),
      },
    };
    if (index > 0) {
      const previous = bars[index - 1]!;
      nodes.push({
        type: "line",
        key: `${key}:connector`,
        elementId: unit.id,
        x1: x(previous.to),
        x2: x(previous.to),
        y1: mid - row + band / 2,
        y2: mid - band / 2,
        stroke: MUTED_INK,
        strokeWidth: 0.75,
        dash: "2 2",
      });
    }
    if (bar.kind === "step") {
      nodes.push({
        type: "rect",
        key,
        elementId: unit.id,
        instanceKey: subset.key,
        x: Math.min(x(bar.from), x(bar.to)),
        y: mid - band / 2,
        width: Math.max(1, Math.abs(x(bar.to) - x(bar.from))),
        height: band,
        fill: bar.amount < 0 ? mark.down : mark.up,
        glyph,
      });
    } else if (bar.kind === "subtotal") {
      nodes.push(
        {
          type: "line",
          key: `${key}:tick`,
          elementId: unit.id,
          x1: x(bar.to),
          x2: x(bar.to),
          y1: mid - band / 2,
          y2: mid + band / 2,
          stroke: mark.total,
          strokeWidth: 1.5,
        },
        {
          type: "circle",
          key,
          elementId: unit.id,
          instanceKey: subset.key,
          cx: x(bar.to),
          cy: mid,
          r: Math.min(3.5, band / 2),
          fill: paper,
          stroke: mark.total,
          glyph,
        }
      );
    } else {
      nodes.push(
        {
          type: "line",
          key: `${key}:rule`,
          elementId: unit.id,
          x1: zero,
          x2: x(bar.to),
          y1: mid,
          y2: mid,
          stroke: mark.total,
          strokeWidth: 1.5,
        },
        {
          type: "circle",
          key,
          elementId: unit.id,
          instanceKey: subset.key,
          cx: x(bar.to),
          cy: mid,
          r: Math.min(4, band / 2),
          fill: mark.total,
          glyph,
        }
      );
    }
    const leftward = bar.kind === "step" ? bar.amount < 0 : bar.to < 0;
    const edge =
      bar.kind === "step"
        ? leftward
          ? Math.min(x(bar.from), x(bar.to))
          : Math.max(x(bar.from), x(bar.to))
        : x(bar.to);
    const gap = bar.kind === "step" ? 3 : 6;
    nodes.push({
      type: "text",
      key: `${key}:value`,
      elementId: unit.id,
      instanceKey: subset.key,
      x: leftward ? edge - gap : edge + gap,
      lines: [
        {
          text:
            bar.kind === "step"
              ? signed(bar.amount)
              : compact.format(bar.amount),
          y: mid + 3.5,
        },
      ],
      fontSize: 10,
      fontWeight: bar.kind === "step" ? 400 : 600,
      fill: bar.kind === "subtotal" ? MUTED_INK : INK,
      anchor: leftward ? "end" : "start",
      halo: paper,
    });
    if (mark.labelWidth > 0)
      nodes.push({
        type: "text",
        key: `${key}:name`,
        elementId: unit.id,
        instanceKey: subset.key,
        x: left - negativeRoom - 6,
        lines: [
          {
            text: bar.kind === "subtotal" ? `${bar.label} subtotal` : bar.label,
            y: mid + 3.5,
          },
        ],
        fontSize: 10,
        fontWeight: bar.kind === "step" ? 400 : 600,
        fill: bar.kind === "subtotal" ? MUTED_INK : INK,
        anchor: "end",
      });
  });
  return nodes;
}

/** A category's place in the shared order, which sets its color. */
export function donutOrder(
  mark: DonutMark,
  data: CompositionData
): Map<string, number> {
  const column = data.column(mark.categoryField);
  const measure =
    mark.aggregation === "sum" && mark.measureField
      ? data.column(mark.measureField)
      : undefined;
  const totals = new Map<string, number>();
  for (const id of data.allIds) {
    const value = column[id];
    const key = value === null || value === undefined ? "" : String(value);
    const add = measure ? Number(measure[id]) || 0 : 1;
    totals.set(key, (totals.get(key) ?? 0) + add);
  }
  const keys = [...totals.keys()].sort((a, b) =>
    mark.order === "total"
      ? (totals.get(b) ?? 0) - (totals.get(a) ?? 0) || a.localeCompare(b)
      : a.localeCompare(b, undefined, { numeric: true })
  );
  return new Map(keys.map((key, index) => [key, index]));
}

const OTHER_FILL = "#9aa0a6";

/**
 * One repeat's donut, centered in its frame: each category's share of the
 * repeat's live rows, largest first clockwise from the top, with the total
 * in the hole. A repeat with a negative part or no total draws its reason.
 */
export function donutNodes(
  unit: UnitElement,
  mark: DonutMark,
  subset: PartsSubset,
  order: Map<string, number>,
  frame: Bounds,
  data: CompositionData,
  paper: string
): SceneNode[] {
  const plan = planDonut({
    ids: subset.liveIds,
    category: data.column(mark.categoryField),
    aggregation: mark.aggregation,
    measure:
      mark.aggregation === "sum" && mark.measureField
        ? data.column(mark.measureField)
        : undefined,
    topN: mark.topN,
  });
  const cx = frame.x + frame.width / 2;
  const cy = frame.y + frame.height / 2;
  if (!plan.slices.length) {
    return plan.message
      ? [
          {
            type: "text",
            key: `${unit.id}:${subset.key}:${mark.id}:message`,
            elementId: unit.id,
            instanceKey: subset.key,
            x: cx,
            lines: [{ text: "No shares", y: cy + 3.5 }],
            fontSize: 10,
            fontWeight: 400,
            fill: MUTED_INK,
            anchor: "middle",
          },
        ]
      : [];
  }
  const outer = Math.max(4, Math.min(frame.width, frame.height) / 2 - 1);
  const inner = outer * Math.min(0.9, Math.max(0, mark.hole));
  const colorOf = (slice: DonutSlice) => {
    if (slice.key === "__other") return OTHER_FILL;
    const key = slice.value == null ? "" : String(slice.value as datum);
    const index = order.get(key) ?? 0;
    return mark.colors[index % mark.colors.length] ?? INK;
  };
  const nodes: SceneNode[] = [];
  let angle = 0;
  for (const slice of plan.slices) {
    const sweep = slice.share * Math.PI * 2;
    nodes.push({
      type: "arc",
      key: `${unit.id}:${subset.key}:${mark.id}:${slice.key}`,
      elementId: unit.id,
      instanceKey: subset.key,
      cx,
      cy,
      innerRadius: inner,
      outerRadius: outer,
      startAngle: angle,
      endAngle: angle + sweep,
      fill: colorOf(slice),
      stroke: paper,
      glyph: {
        instanceKey: subset.key,
        markId: mark.id,
        bin: { key: slice.key, label: slice.label },
        value: slice.amount,
        rowIds: slice.row.contributors
          .filter((item) => item.included)
          .map((item) => item.sourceId),
        donut: {
          share: slice.share,
          total: plan.total,
          categoryField: mark.categoryField,
          aggregation: mark.aggregation,
          measureField: mark.measureField,
          members: slice.members?.map((member) => member.label),
        },
      },
    });
    angle += sweep;
  }
  if (mark.showTotal && inner > 12)
    nodes.push({
      type: "text",
      key: `${unit.id}:${subset.key}:${mark.id}:total`,
      elementId: unit.id,
      instanceKey: subset.key,
      x: cx,
      lines: [{ text: compact.format(plan.total), y: cy + 4 }],
      fontSize: Math.max(9, Math.min(16, inner * 0.45)),
      fontWeight: 600,
      fill: INK,
      anchor: "middle",
    });
  return nodes;
}
