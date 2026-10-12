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

/** Only additive reductions, so the start plus every step equals the end. */
export type WaterfallAggregation = "sum" | "count";

export interface WaterfallSettings extends BaseChartSettings {
  type: "waterfall";
  /**
   * `field` is the step field: one step per category, ordered as the
   * categories first appear in the data.
   */
  mode: "bridge";
  aggregation: WaterfallAggregation;
  measureField?: string;
  /** The start state and the end state, in that order. */
  states: WaterfallState[];
  /** Groups steps and closes each group with a subtotal. */
  parentField?: string;
}

/** The measure a state reduces, or none for a count. */
export function stateMeasureField(
  settings: Pick<WaterfallSettings, "aggregation" | "measureField">,
  state: WaterfallState | undefined
): string | undefined {
  if (settings.aggregation === "count") return undefined;
  return state?.measureField || settings.measureField || undefined;
}
