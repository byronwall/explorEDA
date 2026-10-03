import { useMemo } from "react";
import {
  buildFieldProfile,
  emptyFieldProfile,
  type FieldProfile,
} from "@/lib/fieldProfiles";
import { applyFilter } from "@/hooks/applyFilter";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings, datum } from "@/types/ChartTypes";

/**
 * Profiles for every source and calculated field, built from the rows that
 * pass the current chart filters. With no charts every row is in scope.
 * The summary table and the field list share this so their numbers agree.
 *
 * With `own`, the chart whose field filters a view sets, a field that chart
 * filters is profiled without its own filter, as crossfilter charts ignore
 * their own filter. Its distribution keeps its shape, and the filtered part
 * can be highlighted inside it. Every other field reads the filtered rows.
 */
export function useFilteredFieldProfiles(
  own?: ChartSettings,
  /** False skips the work and returns no profiles. */
  enabled = true
): FieldProfile[] {
  const sourceProfiles = useDataLayer((state) => state.fieldProfiles);
  const data = useDataLayer((state) => state.data);
  const calculations = useDataLayer((state) => state.calculations);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const crossfilterWrapper = useDataLayer((state) => state.crossfilterWrapper);
  const liveItems = useDataLayer((state) => state.liveItems);
  const chartState = useDataLayer((state) => state.charts);
  const ownId = own?.id;
  const ownFilters = own?.filters;

  return useMemo(() => {
    if (!enabled) return [];
    // liveItems and fieldSettings change when filters or conversions change
    // the values these profiles describe.
    void fieldSettings;
    const filteredIds = new Set(
      chartState.length
        ? crossfilterWrapper.getFilteredRowIds()
        : data.map((row) => row.__ID)
    );
    const filteredRows = data.filter((row) => filteredIds.has(row.__ID));

    // Rows that pass every filter except the ones `own` sets.
    const ownLive = ownId ? liveItems[ownId] : undefined;
    const ownFields = new Set(
      ownLive ? (ownFilters ?? []).map((filter) => filter.field) : []
    );
    const baseIds = ownLive
      ? new Set(
          ownLive.items.filter((item) => item.value > 0).map((item) => item.key)
        )
      : undefined;
    const rowsFor = (field: string) => {
      if (!baseIds || !ownFields.has(field)) return filteredRows;
      const others = (ownFilters ?? [])
        .filter((filter) => filter.field !== field)
        .map((filter) => {
          const values = getColumnData(filter.field);
          return (id: number) => applyFilter(values[id], filter);
        });
      return data.filter(
        (row) =>
          baseIds.has(row.__ID) && others.every((check) => check(row.__ID))
      );
    };

    const profileFrom = (
      name: string,
      value: (row: (typeof data)[number]) => datum,
      dataType: FieldProfile["dataType"],
      empty: FieldProfile
    ) => {
      const rows = rowsFor(name);
      if (rows.length === 0) return emptyFieldProfile(empty);
      const values = Object.fromEntries(
        rows.map((row) => [row.__ID, value(row)])
      ) as Record<number, datum>;
      return buildFieldProfile(name, values, dataType);
    };

    const source = sourceProfiles.map((profile) =>
      profileFrom(
        profile.name,
        (row) => row[profile.name] as datum,
        profile.dataType,
        profile
      )
    );
    const calculated = calculations.map((calculation) => {
      const allColumnData = getColumnData(calculation.resultColumnName);
      const profile = buildFieldProfile(
        calculation.resultColumnName,
        allColumnData
      );
      return profileFrom(
        calculation.resultColumnName,
        (row) => allColumnData[row.__ID],
        profile.dataType,
        profile
      );
    });

    return [...source, ...calculated];
  }, [
    sourceProfiles,
    data,
    calculations,
    getColumnData,
    crossfilterWrapper,
    chartState,
    liveItems,
    fieldSettings,
    ownId,
    ownFilters,
    enabled,
  ]);
}

/** Rows that pass every chart filter. */
export function useFilteredRowCount(): number {
  const data = useDataLayer((state) => state.data);
  const crossfilterWrapper = useDataLayer((state) => state.crossfilterWrapper);
  const liveItems = useDataLayer((state) => state.liveItems);
  const chartState = useDataLayer((state) => state.charts);
  return useMemo(() => {
    void liveItems;
    return chartState.length
      ? crossfilterWrapper.getFilteredRowCount()
      : data.length;
  }, [data, crossfilterWrapper, liveItems, chartState]);
}
