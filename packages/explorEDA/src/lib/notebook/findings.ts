/**
 * Live notebook findings: named values that follow one chart's own
 * selection. The notebook text declares them on `finding` lines; prose shows
 * one with `{{name}}` and opens its records with `[text](#finding:name)`.
 *
 * Each value and its records come from one set of input rows. A finding
 * that names a chart reads, in order: the source rows; the rows that pass
 * the workspace filters and the chart's own `where.` filters (eligible);
 * the eligible rows the chart's selection keeps (selected); then the
 * finding's own `where.` filters. Without a chart, a finding reads every
 * source row and no filter but its own.
 */
import { applyFilter } from "@/hooks/applyFilter";
import type { AggregateAggregation } from "@/lib/aggregates";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import {
  planMetricCard,
  type MetricCardPlan,
} from "@/components/charts/MetricCard/metricCardPlan";

/** A finding's name, as written after `@` and inside `{{ }}`. */
export const FINDING_NAME = /^[A-Za-z_][\w-]*$/;

export interface FindingDefinition {
  id: string;
  aggregation: AggregateAggregation;
  /** The measured field; absent for a count. */
  field?: string;
  /** The chart whose selection the finding follows; absent reads every row. */
  chart?: string;
  /** "eligible" ignores the chart's selection but keeps its filters. */
  population?: "eligible";
  /** The finding's own conditions, applied after the chart's. */
  filters?: Filter[];
  /** Decimal places; absent uses the field's format. */
  digits?: number;
}

/** Why a finding has no value. Each one reads differently in prose. */
export type FindingUnavailable =
  /** No rows reached a numeric measure. */
  | "empty"
  /** Rows reached it, but none held a valid number. */
  | "invalid"
  /** The prose names a finding the text does not declare. */
  | "missing"
  /** The calculation gave an infinite or undefined number. */
  | "nonfinite";

export interface FindingResult {
  id: string;
  /** Changes whenever the input rows or definition change. */
  revision: string;
  value?: number;
  /** The value as prose shows it, or why there is none. */
  text: string;
  unavailable?: FindingUnavailable;
  /** The rows the reducer read, after every filter. */
  ids: number[];
  /** The calculation and its contributors, as a metric card traces them. */
  plan?: MetricCardPlan;
  /** Which rows the finding reads, in words. */
  scope: string;
}

/** What evaluation reads from the workspace. */
export interface FindingContext {
  /** Every source row. */
  allIds: number[];
  /** A chart's eligible rows; undefined when there is no such chart. */
  eligible: (chart: string) => number[] | undefined;
  /** A chart's own selection test. */
  selection: (chart: string) => ((id: number) => boolean) | undefined;
  /** A chart's title, for the scope note. */
  chartLabel?: (chart: string) => string;
  column: (field: string) => Record<number, datum>;
  /** Each row's raw input and conversion problem, for the records view. */
  measureInputs?: (
    field: string | undefined,
    ids: number[]
  ) => {
    rawInputs: Record<number, datum>;
    exclusionReasons: Record<number, string>;
  };
  label: (field: string) => string;
  format: (field: string, value: datum) => string;
  /** The data's own revision, such as the provider's nonce. */
  revision: string;
}

export const UNAVAILABLE_TEXT: Record<FindingUnavailable, string> = {
  empty: "no rows",
  invalid: "no valid values",
  missing: "unknown finding",
  nonfinite: "not a finite number",
};

/** A short, stable fingerprint of a list of row ids. */
function idsKey(ids: readonly number[]) {
  let hash = 0;
  for (const id of ids) hash = (hash * 31 + id + 1) | 0;
  return `${ids.length}.${hash >>> 0}`;
}

export function formatDigits(value: number, digits: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function unavailable(
  id: string,
  reason: FindingUnavailable,
  revision: string,
  scope: string,
  extra: Partial<FindingResult> = {}
): FindingResult {
  return {
    id,
    revision,
    text: UNAVAILABLE_TEXT[reason],
    unavailable: reason,
    ids: [],
    scope,
    ...extra,
  };
}

/** Evaluates one finding against the workspace as it is now. */
export function evaluateFinding(
  definition: FindingDefinition,
  context: FindingContext
): FindingResult {
  const { id, chart, field } = definition;
  const chartName = chart ? (context.chartLabel?.(chart) ?? chart) : "";
  const where = definition.filters?.length
    ? `, where ${definition.filters.map((filter) => context.label(filter.field)).join(" and ")} match`
    : "";
  const scope = !chart
    ? `Every source row${where}. Chart selections and workspace filters do not change it.`
    : definition.population === "eligible"
      ? `Every row ${chartName} can show${where}, whatever it selects.`
      : `The rows ${chartName} selects${where}. Other charts do not change it.`;
  const base = chart ? context.eligible(chart) : context.allIds;
  if (!base) {
    return unavailable(id, "missing", `${context.revision}:missing`, scope);
  }
  const selected =
    chart && definition.population !== "eligible"
      ? base.filter(context.selection(chart) ?? (() => true))
      : base;
  // Look each column up once; the test runs once per row.
  const conditions = (definition.filters ?? []).map((filter) => ({
    filter,
    values: context.column(filter.field),
  }));
  const ids = conditions.length
    ? selected.filter((row) =>
        conditions.every(({ filter, values }) =>
          applyFilter(values[row], filter)
        )
      )
    : selected;
  const measureField = definition.aggregation === "count" ? undefined : field;
  const revision = `${context.revision}:${JSON.stringify(definition)}:${idsKey(ids)}`;
  const plan = planMetricCard(
    { aggregation: definition.aggregation, measureField },
    {
      revision,
      liveIds: ids,
      measureData: measureField ? context.column(measureField) : {},
      ...context.measureInputs?.(measureField, ids),
    },
    context.label,
    context.format
  );
  plan.scopeNote = scope;
  if (definition.aggregation === "count") {
    // A count of no rows is zero, not missing.
    const value = plan.rowCount;
    return {
      id,
      revision,
      value,
      text:
        definition.digits === undefined
          ? value.toLocaleString("en-US")
          : formatDigits(value, definition.digits),
      ids,
      plan: { ...plan, state: "value", value, valueText: String(value) },
      scope,
    };
  }
  if (plan.state === "empty")
    return unavailable(id, "empty", revision, scope, { ids, plan });
  if (plan.state === "invalid")
    return unavailable(id, "invalid", revision, scope, { ids, plan });
  const value = plan.value!;
  if (!Number.isFinite(value))
    return unavailable(id, "nonfinite", revision, scope, { ids, plan });
  return {
    id,
    revision,
    value,
    text:
      definition.digits === undefined
        ? plan.valueText
        : formatDigits(value, definition.digits),
    ids,
    plan,
    scope,
  };
}

/** Every finding's result, by name. */
export function evaluateFindings(
  definitions: readonly FindingDefinition[],
  context: FindingContext
): Map<string, FindingResult> {
  return new Map(
    definitions.map((definition) => [
      definition.id,
      evaluateFinding(definition, context),
    ])
  );
}

/** The result prose shows for a name, including one the text never declares. */
export function findingFor(
  results: ReadonlyMap<string, FindingResult>,
  id: string
): FindingResult {
  return (
    results.get(id) ??
    unavailable(id, "missing", "missing", `No finding is named ${id}.`)
  );
}
