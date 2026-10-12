import {
  calculateGroupedAggregate,
  summarizeGroup,
  type AggregateInputRow,
  type AggregateResultRow,
} from "@/lib/aggregates";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";
import type { WaterfallAggregation } from "./waterfallTypes";

export type WaterfallBarKind = "start" | "step" | "subtotal" | "end";

/** One reduced state behind a bar: its value and the rows that made it. */
export type WaterfallStateValue = Pick<
  AggregateResultRow,
  "value" | "rowCount" | "contributors"
>;

export interface WaterfallBar {
  /** `start`, `end`, `step:<category key>`, or `subtotal:<parent key>`. */
  key: string;
  kind: WaterfallBarKind;
  /** The step's category or the subtotal's parent value. */
  value: datum;
  label: string;
  /** A step's signed change; a total bar's running total. */
  amount: number;
  /** Where the bar starts and ends on the value axis. */
  from: number;
  to: number;
  /** Each state's reduction: one category for a step, every row for a total. */
  states: [WaterfallStateValue, WaterfallStateValue] | undefined;
  /** The state a step's category is missing from, which counts as 0. */
  missingFrom?: 0 | 1;
  /** A subtotal's step categories. */
  members?: datum[];
  /** The parent group a step belongs to. */
  parent?: { key: string; value: datum; label: string };
}

export interface WaterfallPlan {
  bars: WaterfallBar[];
  /** Set instead of bars when the bridge cannot be drawn. */
  message?: string;
}

export interface BridgeStateInput {
  label: string;
  /** Measure values by row ID; omitted for a count. */
  measure?: Record<number, datum>;
  /** Whether a row belongs to this state. */
  includes: (id: number) => boolean;
  /** Each row's measure before conversion, shown in traces. */
  rawInputs?: Record<number, datum>;
  /** Why a row's measure value was left out, such as a failed conversion. */
  exclusionReasons?: Record<number, string>;
}

export interface BridgeInput {
  /** Rows that pass the other charts' filters. */
  ids: readonly number[];
  /** Every row the chart can draw, in data order, which sets step order. */
  orderIds: readonly number[];
  step: Record<number, datum>;
  parent?: Record<number, datum>;
  aggregation: WaterfallAggregation;
  states: [BridgeStateInput, BridgeStateInput];
}

const STEP = "step";
const MEASURE = "measure";

function inputRows(
  ids: readonly number[],
  input: BridgeInput,
  state: BridgeStateInput
): AggregateInputRow[] {
  const rows: AggregateInputRow[] = [];
  for (const id of ids) {
    if (!state.includes(id)) continue;
    rows.push({
      __ID: id,
      [STEP]: input.step[id],
      ...(state.measure ? { [MEASURE]: state.measure[id] } : {}),
    });
  }
  return rows;
}

const EMPTY: WaterfallStateValue = { value: 0, rowCount: 0, contributors: [] };

/**
 * Bridges one state's total to another's: the start bar is the first state,
 * each step is one category's change between them, a subtotal closes each
 * parent group, and the end bar is the second state. Both states reduce with
 * the shared grouped aggregate, so every bar matches a direct grouped sum and
 * keeps the rows behind it.
 */
export function planBridge(input: BridgeInput): WaterfallPlan {
  const spec = (index: 0 | 1) => ({
    id: `state-${index}`,
    name: input.states[index].label,
    groupField: STEP,
    measureField: input.states[index].measure ? MEASURE : undefined,
    aggregation: input.aggregation,
  });
  const rows = [0, 1].map((index) =>
    inputRows(input.ids, input, input.states[index as 0 | 1])
  ) as [AggregateInputRow[], AggregateInputRow[]];
  const emptyState = rows.findIndex((list) => list.length === 0);
  if (emptyState >= 0) {
    return {
      bars: [],
      message: `${input.states[emptyState]!.label || (emptyState ? "The end state" : "The start state")} has no rows under the current filters.`,
    };
  }

  const grouped = [0, 1].map((index) => {
    const state = input.states[index as 0 | 1];
    const result = calculateGroupedAggregate(
      rows[index]!,
      spec(index as 0 | 1),
      state.rawInputs,
      state.exclusionReasons
    );
    return new Map(
      result.rows.map((row) => [categoryKey(row.groupValue), row])
    );
  });
  const totals = [0, 1].map((index) =>
    summarizeGroup(
      rows[index]!,
      spec(index as 0 | 1),
      input.states[index as 0 | 1].rawInputs,
      input.states[index as 0 | 1].exclusionReasons
    )
  ) as [WaterfallStateValue, WaterfallStateValue];

  // Steps keep the order their categories first appear in the data, grouped
  // under the parent each first appears with.
  const order = new Map<string, datum>();
  const seen = new Set<string>();
  const parents = new Map<string, { value: datum; keys: string[] }>();
  for (const id of input.orderIds) {
    const value = categoryValue(input.step[id]);
    const key = categoryKey(value);
    if (seen.has(key)) continue;
    if (!grouped[0]!.has(key) && !grouped[1]!.has(key)) continue;
    seen.add(key);
    const parentValue = input.parent
      ? categoryValue(input.parent[id])
      : undefined;
    const parentKey = input.parent ? categoryKey(parentValue) : "";
    const parent = parents.get(parentKey);
    if (parent) parent.keys.push(key);
    else parents.set(parentKey, { value: parentValue, keys: [key] });
    order.set(key, value);
  }
  // Rows outside the order, such as live rows the population leaves out.
  for (const map of grouped) {
    for (const [key, row] of map) {
      if (seen.has(key)) continue;
      seen.add(key);
      const parent = parents.get("");
      if (parent) parent.keys.push(key);
      else parents.set("", { value: undefined, keys: [key] });
      order.set(key, row.groupValue);
    }
  }

  const reduced = (row: AggregateResultRow | undefined) =>
    row
      ? {
          value: row.value,
          rowCount: row.rowCount,
          contributors: row.contributors,
        }
      : EMPTY;
  const start = totals[0].value ?? 0;
  const bars: WaterfallBar[] = [
    {
      key: "start",
      kind: "start",
      value: undefined,
      label: input.states[0].label,
      amount: start,
      from: 0,
      to: start,
      states: totals,
    },
  ];
  let running = start;
  for (const [parentKey, parent] of parents) {
    for (const key of parent.keys) {
      const before = grouped[0]!.get(key);
      const after = grouped[1]!.get(key);
      const amount = (after?.value ?? 0) - (before?.value ?? 0);
      const value = order.get(key);
      bars.push({
        key: `step:${key}`,
        kind: "step",
        value,
        label: categoryLabel(value),
        amount,
        from: running,
        to: running + amount,
        states: [reduced(before), reduced(after)],
        ...(before ? (after ? {} : { missingFrom: 1 }) : { missingFrom: 0 }),
        ...(input.parent
          ? {
              parent: {
                key: parentKey,
                value: parent.value,
                label: categoryLabel(parent.value),
              },
            }
          : {}),
      });
      running += amount;
    }
    if (input.parent) {
      bars.push({
        key: `subtotal:${parentKey}`,
        kind: "subtotal",
        value: parent.value,
        label: categoryLabel(parent.value),
        amount: running,
        from: 0,
        to: running,
        states: undefined,
        members: parent.keys.map((key) => order.get(key)),
      });
    }
  }
  const end = totals[1].value ?? 0;
  bars.push({
    key: "end",
    kind: "end",
    value: undefined,
    label: input.states[1].label,
    amount: end,
    from: 0,
    to: end,
    states: totals,
  });
  return { bars };
}
