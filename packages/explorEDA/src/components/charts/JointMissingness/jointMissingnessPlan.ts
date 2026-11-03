import { categoryKey, categoryLabel } from "@/lib/categories";
import { finiteNumber, isMissingValue } from "@/lib/valueParsing";
import type { IdType } from "@/providers/lib/dataLayerState";
import type { datum } from "@/types/ChartTypes";

export const MIN_MISSINGNESS_FIELDS = 2;
export const MAX_MISSINGNESS_FIELDS = 12;
/** Patterns per page. Counts and selections still use every row. */
export const PATTERN_PAGE_SIZE = 20;

type Columns = Record<string, Record<IdType, datum>>;

/** The saved form of a pattern: its missing fields, sorted and unique. */
export function canonicalPattern(missing: readonly string[]): string[] {
  return [...new Set(missing)].sort();
}

export function patternKey(missing: readonly string[]): string {
  return canonicalPattern(missing).join("\u001f");
}

export function missingPatternLabel(
  missing: readonly string[],
  name: (field: string) => string = (field) => field
) {
  return missing.length ? missing.map(name).join(" + ") : "All present";
}

export interface MissingPattern {
  key: string;
  /** Missing fields in the chart's field order. */
  missing: string[];
  ids: IdType[];
}

export interface PatternPlan {
  /** All present first, even at zero rows, then the rest by row count. */
  patterns: MissingPattern[];
  /** Missing rows of each chosen field, in field order. */
  fieldTotals: number[];
  total: number;
}

/** Each row's missing fields, in field order. */
function missingOf(fields: readonly string[], columns: Columns) {
  const lists = fields.map((field) => columns[field] ?? {});
  return (id: IdType) =>
    fields.filter((_, index) => isMissingValue(lists[index]![id]));
}

export function planPatterns({
  ids,
  fields,
  columns,
}: {
  ids: readonly IdType[];
  fields: readonly string[];
  columns: Columns;
}): PatternPlan {
  const missing = missingOf(fields, columns);
  const byKey = new Map<string, MissingPattern>();
  const fieldTotals = fields.map(() => 0);
  byKey.set("", { key: "", missing: [], ids: [] });
  for (const id of ids) {
    const fieldsMissing = missing(id);
    for (const field of fieldsMissing) fieldTotals[fields.indexOf(field)]!++;
    const key = patternKey(fieldsMissing);
    let pattern = byKey.get(key);
    if (!pattern) {
      pattern = { key, missing: fieldsMissing, ids: [] };
      byKey.set(key, pattern);
    }
    pattern.ids.push(id);
  }
  const [allPresent, ...rest] = byKey.values();
  rest.sort(
    (a, b) =>
      b.ids.length - a.ids.length ||
      a.missing.length - b.missing.length ||
      (a.key < b.key ? -1 : 1)
  );
  return { patterns: [allPresent!, ...rest], fieldTotals, total: ids.length };
}

/**
 * Tests whether a row's missing fields equal one of the patterns exactly. A
 * pattern that names a field outside `fields` matches no rows.
 */
export function patternMatcher(
  fields: readonly string[],
  columns: Columns,
  patterns: readonly (readonly string[])[]
): (id: IdType) => boolean {
  const chosen = new Set(fields);
  const keys = new Set(
    patterns
      .filter((pattern) => pattern.every((field) => chosen.has(field)))
      .map(patternKey)
  );
  const missing = missingOf(fields, columns);
  return (id) => keys.has(patternKey(missing(id)));
}

/** Adds or removes a pattern, keeping the saved order stable. */
export function togglePattern(
  patterns: readonly string[][],
  missing: readonly string[],
  add: boolean
): string[][] {
  const key = patternKey(missing);
  const has = patterns.some((pattern) => patternKey(pattern) === key);
  if (!add)
    return has && patterns.length === 1 ? [] : [canonicalPattern(missing)];
  return has
    ? patterns.filter((pattern) => patternKey(pattern) !== key)
    : [...patterns, canonicalPattern(missing)];
}

/**
 * Fields for a new chart: those with any missing values, most missing
 * first, up to the field limit. Fewer than two fills from the rest in order.
 */
export function defaultMissingnessFields(
  fields: readonly string[],
  missingCount: (field: string) => number
): string[] {
  const counted = fields.map((field) => ({ field, n: missingCount(field) }));
  const chosen = counted
    .filter((item) => item.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, MAX_MISSINGNESS_FIELDS)
    .map((item) => item.field);
  for (const { field } of counted) {
    if (chosen.length >= MIN_MISSINGNESS_FIELDS) break;
    if (!chosen.includes(field)) chosen.push(field);
  }
  return chosen;
}

/** Groups that get their own column; the rest share one remainder column. */
export const MAX_NAMED_GROUPS = 8;

export interface GroupColumn {
  key: string;
  /** The group's value; absent for the remainder column. */
  value?: datum;
  label: string;
  /** Rows of this group in the chart's scope. */
  total: number;
}

export interface GroupPlan {
  columns: GroupColumn[];
  /** Each row's column key. */
  columnOf: (id: IdType) => string;
}

const REMAINDER_KEY = "__remainder";

/**
 * Splits the scope by a group field: the most common groups first, missing
 * values (blank text included) as one group, and the rest in a remainder.
 */
export function planGroups(
  ids: readonly IdType[],
  group: Record<IdType, datum>
): GroupPlan {
  const valueOf = (id: IdType) =>
    isMissingValue(group[id]) ? null : group[id];
  const counts = new Map<string, { value: datum; total: number }>();
  for (const id of ids) {
    const value = valueOf(id);
    const key = categoryKey(value);
    const entry = counts.get(key);
    if (entry) entry.total++;
    else counts.set(key, { value, total: 1 });
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1].total - a[1].total);
  const named = sorted.slice(0, MAX_NAMED_GROUPS);
  const rest = sorted.slice(MAX_NAMED_GROUPS);
  const columns: GroupColumn[] = named.map(([key, entry]) => ({
    key,
    value: entry.value,
    label: categoryLabel(entry.value),
    total: entry.total,
  }));
  if (rest.length)
    columns.push({
      key: REMAINDER_KEY,
      label: `${rest.length} other groups`,
      total: rest.reduce((sum, [, entry]) => sum + entry.total, 0),
    });
  const namedKeys = new Set(named.map(([key]) => key));
  return {
    columns,
    columnOf: (id) => {
      const key = categoryKey(valueOf(id));
      return namedKeys.has(key) ? key : REMAINDER_KEY;
    },
  };
}

/** Rows of `ids` in each group column. */
export function countByGroup(
  ids: Iterable<IdType>,
  plan: GroupPlan
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const id of ids) {
    const key = plan.columnOf(id);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/** Which rows can feed a step that needs these inputs. */
export interface InputRule {
  /** Required fields, a subset of the chart's fields. */
  fields: string[];
  /** Present: none missing. Finite: each also reads as a finite number. */
  requirement: "present" | "finite";
}

/** Tests whether a row meets the rule; with no fields, every row does. */
export function inputTest(
  rule: InputRule,
  columns: Columns
): (id: IdType) => boolean {
  const lists = rule.fields.map((field) => columns[field] ?? {});
  return rule.requirement === "finite"
    ? (id) =>
        lists.every((list) => {
          const value = list[id];
          return (
            !isMissingValue(value) &&
            typeof value !== "boolean" &&
            finiteNumber(value) !== undefined
          );
        })
    : (id) => lists.every((list) => !isMissingValue(list[id]));
}
