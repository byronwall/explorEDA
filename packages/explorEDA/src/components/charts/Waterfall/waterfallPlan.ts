import {
  calculateGroupedAggregate,
  summarizeGroup,
  type AggregateInputRow,
  type AggregateResultRow,
} from "@/lib/aggregates";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import { parseDateText } from "@/lib/valueParsing";
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
  /** A running total's one reduction: a step's category, or every row at the end. */
  rows?: WaterfallStateValue;
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

  const parents = orderSteps(
    input,
    [...grouped[0]!.values(), ...grouped[1]!.values()].map(
      (row) => row.groupValue
    ),
    false
  );
  const reduced = (row: AggregateResultRow | undefined) =>
    row
      ? {
          value: row.value,
          rowCount: row.rowCount,
          contributors: row.contributors,
        }
      : EMPTY;
  const start = totals[0].value ?? 0;
  const end = totals[1].value ?? 0;
  return {
    bars: stackBars(
      parents,
      Boolean(input.parent),
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
      (key) => {
        const before = grouped[0]!.get(key);
        const after = grouped[1]!.get(key);
        return {
          amount: (after?.value ?? 0) - (before?.value ?? 0),
          states: [reduced(before), reduced(after)],
          ...(before ? (after ? {} : { missingFrom: 1 }) : { missingFrom: 0 }),
        };
      },
      () => ({
        key: "end",
        kind: "end",
        value: undefined,
        label: input.states[1].label,
        // The second state's own total, which the steps reach.
        amount: end,
        from: 0,
        to: end,
        states: totals,
      })
    ),
  };
}

interface StepGroup {
  value: datum;
  steps: { key: string; value: datum }[];
}

/** Whether every value is a number, or every value is date text. */
function sortableOrder(values: datum[]) {
  if (values.every((value) => typeof value === "number")) {
    return (value: datum) => value as number;
  }
  if (
    values.every(
      (value) =>
        typeof value === "string" && Number.isFinite(parseDateText(value))
    )
  ) {
    return (value: datum) => parseDateText(value as string);
  }
  return undefined;
}

/**
 * Steps in the order their categories first appear in the data, or sorted
 * when the categories are numbers or dates and the steps run in sequence.
 * With a parent field, steps gather under the parent each first appears
 * with, and groups keep the order of their first step.
 */
function orderSteps(
  input: Pick<BridgeInput, "orderIds" | "step" | "parent">,
  liveValues: datum[],
  sequence: boolean
): Map<string, StepGroup> {
  const live = new Set(liveValues.map((value) => categoryKey(value)));
  const firstParent = new Map<string, datum>();
  const values = new Map<string, datum>();
  for (const id of input.orderIds) {
    const value = categoryValue(input.step[id]);
    const key = categoryKey(value);
    if (values.has(key) || !live.has(key)) continue;
    values.set(key, value);
    firstParent.set(
      key,
      input.parent ? categoryValue(input.parent[id]) : undefined
    );
  }
  // Live rows outside the order, such as rows the population leaves out.
  for (const value of liveValues) {
    const key = categoryKey(value);
    if (values.has(key)) continue;
    values.set(key, value);
    firstParent.set(key, undefined);
  }
  let keys = [...values.keys()];
  const position = sequence ? sortableOrder([...values.values()]) : undefined;
  if (position) {
    keys = keys.sort(
      (a, b) => position(values.get(a)!) - position(values.get(b)!)
    );
  }
  const groups = new Map<string, StepGroup>();
  for (const key of keys) {
    const parentValue = firstParent.get(key);
    const parentKey = input.parent ? categoryKey(parentValue) : "";
    const group = groups.get(parentKey) ?? { value: parentValue, steps: [] };
    group.steps.push({ key, value: values.get(key) });
    groups.set(parentKey, group);
  }
  return groups;
}

/** Start, each group's steps and subtotal, then end, each from the running total. */
function stackBars(
  groups: Map<string, StepGroup>,
  subtotals: boolean,
  start: WaterfallBar | undefined,
  step: (
    key: string
  ) => Pick<WaterfallBar, "amount" | "states" | "rows" | "missingFrom">,
  end: (running: number) => WaterfallBar
): WaterfallBar[] {
  const bars: WaterfallBar[] = start ? [start] : [];
  let running = start?.to ?? 0;
  for (const [parentKey, group] of groups) {
    for (const item of group.steps) {
      const values = step(item.key);
      bars.push({
        key: `step:${item.key}`,
        kind: "step",
        value: item.value,
        label: categoryLabel(item.value),
        ...values,
        from: running,
        to: running + values.amount,
        ...(subtotals
          ? {
              parent: {
                key: parentKey,
                value: group.value,
                label: categoryLabel(group.value),
              },
            }
          : {}),
      });
      running += values.amount;
    }
    if (subtotals) {
      bars.push({
        key: `subtotal:${parentKey}`,
        kind: "subtotal",
        value: group.value,
        label: categoryLabel(group.value),
        amount: running,
        from: 0,
        to: running,
        states: undefined,
        members: group.steps.map((item) => item.value),
      });
    }
  }
  bars.push(end(running));
  return bars;
}

export interface AccumulateInput {
  /** Rows that pass the other charts' filters. */
  ids: readonly number[];
  /** Every row the chart can draw, in data order. */
  orderIds: readonly number[];
  step: Record<number, datum>;
  parent?: Record<number, datum>;
  aggregation: WaterfallAggregation;
  /** Signed measure values by row ID; omitted for a count. */
  measure?: Record<number, datum>;
  rawInputs?: Record<number, datum>;
  exclusionReasons?: Record<number, string>;
  /** A value the running total starts from, drawn as the first bar. */
  startValue?: number;
  labels: [start: string, end: string];
}

/**
 * A running total over ordered steps: each step adds its category's sum of
 * a signed measure, or its row count, to the total so far. Numeric and date
 * categories run in sequence; others keep data order. The end bar is the
 * start value plus every step.
 */
export function planAccumulate(input: AccumulateInput): WaterfallPlan {
  const spec = {
    id: "accumulate",
    name: input.labels[1],
    groupField: STEP,
    measureField: input.measure ? MEASURE : undefined,
    aggregation: input.aggregation,
  };
  const rows: AggregateInputRow[] = input.ids.map((id) => ({
    __ID: id,
    [STEP]: input.step[id],
    ...(input.measure ? { [MEASURE]: input.measure[id] } : {}),
  }));
  if (!rows.length) return { bars: [] };
  const grouped = new Map(
    calculateGroupedAggregate(
      rows,
      spec,
      input.rawInputs,
      input.exclusionReasons
    ).rows.map((row) => [categoryKey(row.groupValue), row])
  );
  const total = summarizeGroup(
    rows,
    spec,
    input.rawInputs,
    input.exclusionReasons
  );
  const groups = orderSteps(
    input,
    [...grouped.values()].map((row) => row.groupValue),
    true
  );
  const start =
    input.startValue === undefined
      ? undefined
      : ({
          key: "start",
          kind: "start",
          value: undefined,
          label: input.labels[0],
          amount: input.startValue,
          from: 0,
          to: input.startValue,
          states: undefined,
        } satisfies WaterfallBar);
  return {
    bars: stackBars(
      groups,
      Boolean(input.parent),
      start,
      (key) => {
        const row = grouped.get(key)!;
        return {
          amount: row.value ?? 0,
          states: undefined,
          rows: {
            value: row.value,
            rowCount: row.rowCount,
            contributors: row.contributors,
          },
        };
      },
      (running) => ({
        key: "end",
        kind: "end",
        value: undefined,
        label: input.labels[1],
        amount: running,
        from: 0,
        to: running,
        states: undefined,
        rows: total,
      })
    ),
  };
}
