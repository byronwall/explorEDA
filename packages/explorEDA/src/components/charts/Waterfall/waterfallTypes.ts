import type { BaseChartSettings } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";

/**
 * One end of a bridge: a measure over the rows that pass its conditions,
 * such as `sum(amount) where scenario = Plan`, or `sum(plan)` over every row.
 */
export interface WaterfallState {
  label: string;
  /** Overrides the chart's measure, for data that keeps each state in its own column. */
  measureField?: string;
  /** Rows this state counts. Empty counts every row. */
  filters: Filter[];
}

export type WaterfallMode = "bridge" | "accumulate";

/** Only additive reductions, so the start plus every step equals the end. */
export type WaterfallAggregation = "sum" | "count";

export interface WaterfallSettings extends BaseChartSettings {
  type: "waterfall";
  /**
   * `field` is the step field. A bridge shows each category's change
   * between two states, in data order. A running total adds each category's
   * signed measure in sequence: numbers and dates in order, others as they
   * first appear.
   */
  mode: WaterfallMode;
  aggregation: WaterfallAggregation;
  measureField?: string;
  /**
   * The start state and the end state, in that order. A running total uses
   * only their labels.
   */
  states: WaterfallState[];
  /** A running total's starting value, drawn as the first bar. */
  startValue?: number;
  /** Groups steps and closes each group with a subtotal. */
  parentField?: string;
}

/** The measure a state reduces, or none for a count. */
export function stateMeasureField(
  settings: Pick<WaterfallSettings, "aggregation" | "measureField" | "mode">,
  state: WaterfallState | undefined
): string | undefined {
  if (settings.aggregation === "count") return undefined;
  if (settings.mode === "accumulate") return settings.measureField || undefined;
  return state?.measureField || settings.measureField || undefined;
}
