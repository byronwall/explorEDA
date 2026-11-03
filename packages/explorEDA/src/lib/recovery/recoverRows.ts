import { getChartDefinition } from "@/charts/registry";
import { isActiveFilter } from "@/components/ActiveFilterStatus";
import { applyFilter } from "@/hooks/applyFilter";
import type { IdType } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import type { datum, Filter } from "@/types/FilterTypes";

/** One stored filter that a user can remove to bring rows back. */
export type Restriction =
  | { kind: "workspace"; field: string; filter: Filter }
  | { kind: "chart"; chartId: string; index: number; filter: Filter };

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
  return restriction.kind === "workspace"
    ? `workspace:${restriction.field}`
    : `chart:${restriction.chartId}:${restriction.index}`;
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
}: {
  ids: readonly IdType[];
  charts: readonly ChartSettings[];
  workspaceFilters: readonly Filter[];
  fieldGetter: FieldGetter;
  localSelections?: boolean;
}): RecoveryOption[] {
  const owners = workspaceOwners(
    charts,
    workspaceFilters,
    fieldGetter,
    localSelections
  );
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
