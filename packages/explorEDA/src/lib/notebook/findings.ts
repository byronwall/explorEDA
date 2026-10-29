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
import { getChartDefinition } from "@/charts/registry";
import { restrictToPopulation } from "@/lib/chartPopulation";
import type { ChartSettings, datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import {
  planMetricCard,
  type MetricCardPlan,
} from "@/components/charts/MetricCard/metricCardPlan";

/** A finding's name, as written after `@` and inside `{{ }}`. */
export const FINDING_NAME = /^[A-Za-z_][\w-]*$/;

/** A summary of rows: a count, sum, average, minimum, or maximum. */
export interface MetricFinding {
  id: string;
  kind?: undefined;
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

/**
 * A comparison of two summaries, by name. A share divides one row count by
 * another whose rows include it; a difference subtracts two summaries of
 * one field, the same way, from the same chart.
 */
export interface ComparisonFinding {
  id: string;
  kind: "share" | "difference";
  /** The numerator and denominator, or the two sides of the difference. */
  of: [string, string];
  /** Decimal places: of the percent for a share. */
  digits?: number;
}

export type FindingDefinition = MetricFinding | ComparisonFinding;

/**
 * Why a comparison's two operands can't be compared, or undefined when they
 * can. Partitions (`where.`) may differ; what they summarize may not.
 */
export function comparisonProblem(
  kind: ComparisonFinding["kind"],
  [a, b]: [MetricFinding, MetricFinding]
): string | undefined {
  if (kind === "share") {
    if (a.aggregation !== "count" || b.aggregation !== "count")
      return "A share divides two counts";
    // The denominator's rows must hold the numerator's.
    if (b.chart && b.chart !== a.chart)
      return `@${b.id} follows another chart, so it can't hold @${a.id}'s rows`;
    if (b.chart && b.population !== "eligible" && a.population === "eligible")
      return `@${b.id} keeps only the selection, so it can't hold @${a.id}'s rows`;
    return undefined;
  }
  if (
    a.aggregation !== b.aggregation ||
    a.field !== b.field ||
    a.chart !== b.chart ||
    a.population !== b.population
  )
    return "A difference compares one summary of one field, from the same chart and rows";
  return undefined;
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
  | "nonfinite"
  /** A share's numerator has rows its denominator does not. */
  | "outside";

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
  /** A comparison's kind, with its two operands and their own records. */
  kind?: ComparisonFinding["kind"];
  operands?: [FindingResult, FindingResult];
  /** How a comparison was worked out, such as "80 − 75". */
  calculation?: string;
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
  outside: "not part of its whole",
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
  definition: MetricFinding,
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
    const text =
      definition.digits === undefined
        ? value.toLocaleString("en-US")
        : formatDigits(value, definition.digits);
    return {
      id,
      revision,
      value,
      text,
      ids,
      plan: { ...plan, state: "value", value, valueText: text },
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
  const text =
    definition.digits === undefined
      ? plan.valueText
      : formatDigits(value, definition.digits);
  return {
    id,
    revision,
    value,
    text,
    ids,
    plan: { ...plan, valueText: text },
    scope,
  };
}

/** Every finding's result, by name. */
export function evaluateFindings(
  definitions: readonly FindingDefinition[],
  context: FindingContext
): Map<string, FindingResult> {
  const results = new Map<string, FindingResult>();
  for (const definition of definitions)
    if (!definition.kind)
      results.set(definition.id, evaluateFinding(definition, context));
  // Comparisons read their operands' results, so the two can never come
  // from different rows or moments.
  for (const definition of definitions)
    if (definition.kind)
      results.set(definition.id, compareFindings(definition, results));
  return results;
}

const MINUS = "\u2212";

function signed(value: number, text: string) {
  return value > 0 ? `+${text}` : value < 0 ? `${MINUS}${text}` : text;
}

/** A share or difference from its operands' unrounded values. */
export function compareFindings(
  definition: ComparisonFinding,
  results: ReadonlyMap<string, FindingResult>
): FindingResult {
  const { id, kind, digits } = definition;
  const [a, b] = definition.of.map((name) => findingFor(results, name)) as [
    FindingResult,
    FindingResult,
  ];
  const revision = `${kind}:${a.revision}|${b.revision}`;
  const scope =
    kind === "share"
      ? `@${a.id} as a share of @${b.id}.`
      : `@${a.id} minus @${b.id}.`;
  const base: Omit<FindingResult, "text"> = {
    id,
    kind,
    revision,
    ids: [],
    scope,
    operands: [a, b],
  };
  const blocked = a.unavailable ? a : b.unavailable ? b : undefined;
  if (blocked)
    return {
      ...base,
      text: blocked.text,
      unavailable: blocked.unavailable,
      calculation: `@${blocked.id} has no value: ${blocked.text}.`,
    };
  if (kind === "share") {
    if (b.value === 0)
      return {
        ...base,
        text: UNAVAILABLE_TEXT.empty,
        unavailable: "empty",
        calculation: `@${b.id} counts no rows, so there is nothing to share.`,
      };
    // A count's rows must sit inside the count it is a share of.
    const whole = new Set(b.ids);
    if (!a.ids.every((row) => whole.has(row)))
      return {
        ...base,
        text: UNAVAILABLE_TEXT.outside,
        unavailable: "outside",
        calculation: `Some of @${a.id}'s rows are not among @${b.id}'s.`,
      };
    const value = a.value! / b.value!;
    return {
      ...base,
      value,
      text: `${formatDigits(value * 100, digits ?? 0)}%`,
      calculation: `${a.text} ÷ ${b.text}`,
    };
  }
  const value = a.value! - b.value!;
  if (!Number.isFinite(value))
    return {
      ...base,
      text: UNAVAILABLE_TEXT.nonfinite,
      unavailable: "nonfinite",
    };
  return {
    ...base,
    value,
    text: signed(
      value,
      digits === undefined
        ? Math.abs(value).toLocaleString("en-US")
        : formatDigits(Math.abs(value), digits)
    ),
    calculation: `${a.text} ${MINUS} ${b.text}`,
  };
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

/**
 * Every finding's value as a notebook first shows it, from saved settings
 * and source rows, without a workspace: the charts' saved selections and
 * the workspace filters apply. It reads source fields only, so a finding
 * that measures or filters on a calculation has no values here.
 */
export function evaluateNotebookFindings(
  settings: SavedDataStructure,
  rows: readonly Record<string, datum>[]
): Map<string, FindingResult> {
  const columns = new Map<string, Record<number, datum>>();
  const column = (field: string) => {
    let values = columns.get(field);
    if (!values) {
      values = Object.fromEntries(rows.map((row, id) => [id, row[field]]));
      columns.set(field, values);
    }
    return values;
  };
  const allIds = rows.map((_, id) => id);
  const workspace = (settings.workspaceFilters ?? []).map((filter) => ({
    filter,
    values: column(filter.field),
  }));
  const shown = allIds.filter((id) =>
    workspace.every(({ filter, values }) => applyFilter(values[id], filter))
  );
  const byId = new Map(settings.charts.map((chart) => [chart.id, chart]));
  return evaluateFindings(settings.findings ?? [], {
    allIds,
    eligible: (id) => {
      const chart = byId.get(id);
      return chart
        ? restrictToPopulation(shown, chart as ChartSettings, column)
        : undefined;
    },
    selection: (id) => {
      const chart = byId.get(id) as ChartSettings | undefined;
      return chart
        ? getChartDefinition(chart.type).getFilterFunction(chart, column)
        : undefined;
    },
    column,
    label: (field) => field,
    format: (_field, value) =>
      typeof value === "number" ? value.toLocaleString("en-US") : String(value),
    revision: "rest",
  });
}
