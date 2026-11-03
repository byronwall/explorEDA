import { getChartDefinition } from "@/charts/registry";
import { isActiveFilter } from "@/components/ActiveFilterStatus";
import { applyFilter } from "@/hooks/applyFilter";
import {
  rowMatchesSearch,
  type DataTableRow,
} from "@/components/charts/DataTable/filteredRows";
import type { IdType } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import type { datum, Filter } from "@/types/FilterTypes";

/** One stored filter that a user can remove to bring rows back. */
export type Restriction =
  | { kind: "workspace"; field: string; filter: Filter }
  | { kind: "chart"; chartId: string; index: number; filter: Filter }
  | { kind: "rows-filter"; index: number; filter: Filter }
  | { kind: "rows-search"; text: string };

export type RecoveryOption = {
  key: string;
  restriction: Restriction;
  /** Rows that pass every other restriction once this one is removed. */
  ids: IdType[];
  /**
   * False when removing it would also drop rows its chart keeps now. Such a
   * removal is not a plain relaxation, so it is never offered.
   */
  relaxes: boolean;
};

type FieldGetter = (field: string) => Record<IdType, datum>;

type Owner = {
  test: (id: IdType) => boolean;
  restrictions: {
    restriction: Restriction;
    relaxed: (id: IdType) => boolean;
  }[];
};

export function restrictionKey(restriction: Restriction) {
  switch (restriction.kind) {
    case "workspace":
      return `workspace:${restriction.field}`;
    case "chart":
      return `chart:${restriction.chartId}:${restriction.index}`;
    case "rows-filter":
      return `rows:${restriction.index}`;
    case "rows-search":
      return "rows:search";
  }
}

/** The Rows view's own filters and search, applied after the workspace's. */
export type RowsRestrictions = {
  filters: readonly Filter[];
  search: string;
  /** The row as the Rows table reads it, with calculated fields. */
  row: (id: IdType) => DataTableRow | undefined;
};

/** Each Rows filter, and the search, narrows on its own. */
function rowsOwners(rows: RowsRestrictions, fieldGetter: FieldGetter) {
  const owners: Owner[] = rows.filters.map((filter, index) => {
    const values = fieldGetter(filter.field);
    return {
      test: (id) => applyFilter(values[id], filter),
      restrictions: isActiveFilter(filter)
        ? [
            {
              restriction: { kind: "rows-filter", index, filter },
              relaxed: always,
            },
          ]
        : [],
    };
  });
  const search = rows.search.toLowerCase();
  if (search) {
    owners.push({
      test: (id) => {
        const row = rows.row(id);
        return row !== undefined && rowMatchesSearch(row, search);
      },
      restrictions: [
        {
          restriction: { kind: "rows-search", text: rows.search },
          relaxed: always,
        },
      ],
    });
  }
  return owners;
}

/** How many rows the Rows table shows: the workspace's, then its own. */
export function countRows(
  workspaceIds: readonly IdType[],
  rows: RowsRestrictions,
  fieldGetter: FieldGetter
) {
  const owners = rowsOwners(rows, fieldGetter);
  return workspaceIds.filter((id) => owners.every((owner) => owner.test(id)))
    .length;
}

const always = () => true;

/**
 * Each place that narrows the workspace, with the filters it holds. A chart
 * narrows by its whole compiled filter set, so removing one of its filters
 * recompiles the chart without it rather than dropping one test.
 */
function workspaceOwners(
  charts: readonly ChartSettings[],
  workspaceFilters: readonly Filter[],
  fieldGetter: FieldGetter,
  localSelections: boolean
): Owner[] {
  const owners: Owner[] = [];
  for (const filter of workspaceFilters) {
    const values = fieldGetter(filter.field);
    owners.push({
      test: (id) => applyFilter(values[id], filter),
      restrictions: isActiveFilter(filter)
        ? [
            {
              restriction: { kind: "workspace", field: filter.field, filter },
              relaxed: always,
            },
          ]
        : [],
    });
  }
  // With local selections a chart's filters never narrow other charts.
  if (localSelections) return owners;
  for (const chart of charts) {
    if (chart.filters.length === 0) continue;
    const definition = getChartDefinition(chart.type);
    owners.push({
      test: definition.getFilterFunction(chart, fieldGetter),
      restrictions: chart.filters.flatMap((filter, index) =>
        isActiveFilter(filter)
          ? [
              {
                restriction: {
                  kind: "chart" as const,
                  chartId: chart.id,
                  index,
                  filter,
                },
                relaxed: definition.getFilterFunction(
                  {
                    ...chart,
                    filters: chart.filters.filter((_, i) => i !== index),
                  },
                  fieldGetter
                ),
              },
            ]
          : []
      ),
    });
  }
  return owners;
}

/**
 * For each restriction, the exact rows that come back when only it is
 * removed. It reads the columns and compiles filters on its own; the live
 * crossfilter, settings, and history never change.
 */
export function findRecoveryOptions({
  ids,
  charts,
  workspaceFilters,
  fieldGetter,
  localSelections = false,
  rows,
}: {
  ids: readonly IdType[];
  charts: readonly ChartSettings[];
  workspaceFilters: readonly Filter[];
  fieldGetter: FieldGetter;
  localSelections?: boolean;
  /** Counts the Rows table's result instead of the workspace's. */
  rows?: RowsRestrictions;
}): RecoveryOption[] {
  const owners = [
    ...workspaceOwners(charts, workspaceFilters, fieldGetter, localSelections),
    ...(rows ? rowsOwners(rows, fieldGetter) : []),
  ];
  // A row can come back only if exactly one owner rejects it now.
  const onlyFailure = new Map<Owner, IdType[]>();
  const passing: IdType[] = [];
  for (const id of ids) {
    let failed: Owner | undefined;
    let failures = 0;
    for (const owner of owners) {
      if (owner.test(id)) continue;
      failed = owner;
      failures += 1;
      if (failures > 1) break;
    }
    if (failures === 0) passing.push(id);
    else if (failures === 1 && failed) {
      const list = onlyFailure.get(failed);
      if (list) list.push(id);
      else onlyFailure.set(failed, [id]);
    }
  }
  return owners.flatMap((owner) => {
    const candidates = onlyFailure.get(owner) ?? [];
    return owner.restrictions.map(({ restriction, relaxed }) => {
      const relaxes =
        relaxed === always || ids.every((id) => !owner.test(id) || relaxed(id));
      return {
        key: restrictionKey(restriction),
        restriction,
        ids: relaxes ? [...passing, ...candidates.filter(relaxed)] : [],
        relaxes,
      };
    });
  });
}

function filterOf(restriction: Restriction) {
  return restriction.kind === "rows-search" ? undefined : restriction.filter;
}

/** Whether no single value can pass both filters on the same field. */
function excludes(a: Filter, b: Filter) {
  if (a.field !== b.field) return false;
  if (a.type === "value" && b.type === "value") {
    const kept = new Set(a.values.map(String));
    return !b.values.some((value) => kept.has(String(value)));
  }
  if (a.type === "range" && b.type === "range") {
    return (
      (a.max !== undefined && b.min !== undefined && a.max < b.min) ||
      (b.max !== undefined && a.min !== undefined && b.max < a.min)
    );
  }
  return false;
}

/**
 * The first pair of restrictions that rule each other out on one field,
 * such as Region: West in the workspace and Region: East in a chart. It
 * names the cause when the cause is that plain.
 */
export function findConflict(
  restrictions: readonly Restriction[]
): [Restriction, Restriction] | undefined {
  for (let i = 0; i < restrictions.length; i++) {
    const a = filterOf(restrictions[i]!);
    if (!a) continue;
    for (let j = i + 1; j < restrictions.length; j++) {
      const b = filterOf(restrictions[j]!);
      if (b && excludes(a, b)) return [restrictions[i]!, restrictions[j]!];
    }
  }
  return undefined;
}
