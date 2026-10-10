import { useMemo } from "react";
import {
  buildFieldProfile,
  buildValuesProfile,
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
  enabled = true,
  /**
   * Profiles only these fields, such as a table's columns. Profiles cost a
   * pass over every filtered row, so a view that shows a few fields names them.
   */
  fields?: readonly string[]
): FieldProfile[] {
  const sourceProfiles = useDataLayer((state) => state.fieldProfiles);
  const data = useDataLayer((state) => state.data);
  const calculations = useDataLayer((state) => state.calculations);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const crossfilterWrapper = useDataLayer((state) => state.crossfilterWrapper);
  const liveItems = useDataLayer((state) => state.liveItems);
  // Whether any chart exists; the list itself changes on every edit.
  const hasCharts = useDataLayer((state) => state.charts.length > 0);
  const ownId = own?.id;
  const ownFilters = own?.filters;
  // Callers often build the list inline, so compare its contents.
  const fieldKey = fields?.join("\u0000");

  // A calculated field's type comes from all of its values, so filters
  // don't change it.
  const calculatedProfiles = useMemo(() => {
    if (!enabled) return [];
    void data;
    void fieldSettings;
    const wanted =
      fieldKey === undefined ? undefined : fieldKey.split("\u0000");
    return calculations
      .filter(
        (calculation) =>
          !wanted || wanted.includes(calculation.resultColumnName)
      )
      .map((calculation) =>
        buildFieldProfile(
          calculation.resultColumnName,
          getColumnData(calculation.resultColumnName)
        )
      );
  }, [enabled, calculations, getColumnData, data, fieldSettings, fieldKey]);

  return useMemo(() => {
    if (!enabled) return [];
    // liveItems and fieldSettings change when filters or conversions change
    // the values these profiles describe.
    void fieldSettings;
    const wanted =
      fieldKey === undefined ? undefined : new Set(fieldKey.split("\u0000"));
    let filteredRows = data;
    if (hasCharts) {
      const filteredIds = new Set(crossfilterWrapper.getFilteredRowIds());
      filteredRows = data.filter((row) => filteredIds.has(row.__ID));
    }

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
      empty: FieldProfile
    ) => {
      const rows = rowsFor(name);
      if (rows.length === 0) return emptyFieldProfile(empty);
      return buildValuesProfile(name, rows.map(value), empty.dataType);
    };

    const source = sourceProfiles
      .filter((profile) => !wanted || wanted.has(profile.name))
      .map((profile) =>
        profileFrom(profile.name, (row) => row[profile.name] as datum, profile)
      );
    const calculated = calculatedProfiles.map((profile) => {
      const allColumnData = getColumnData(profile.name);
      return profileFrom(
        profile.name,
        (row) => allColumnData[row.__ID],
        profile
      );
    });

    return [...source, ...calculated];
  }, [
    sourceProfiles,
    data,
    calculatedProfiles,
    getColumnData,
    crossfilterWrapper,
    hasCharts,
    liveItems,
    fieldSettings,
    ownId,
    ownFilters,
    enabled,
    fieldKey,
  ]);
}

/** Rows that pass every chart filter. */
export function useFilteredRowCount(): number {
  const data = useDataLayer((state) => state.data);
  const crossfilterWrapper = useDataLayer((state) => state.crossfilterWrapper);
  const liveItems = useDataLayer((state) => state.liveItems);
  // Whether any chart exists; the list itself changes on every edit.
  const hasCharts = useDataLayer((state) => state.charts.length > 0);
  return useMemo(() => {
    void liveItems;
    return hasCharts
      ? crossfilterWrapper.getFilteredRowCount()
      : data.length;
  }, [data, crossfilterWrapper, liveItems, hasCharts]);
}
