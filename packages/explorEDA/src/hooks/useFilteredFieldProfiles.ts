import { useMemo } from "react";
import {
  buildFieldProfile,
  emptyFieldProfile,
  type FieldProfile,
} from "@/lib/fieldProfiles";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";

/**
 * Profiles for every source and calculated field, built from the rows that
 * pass the current chart filters. With no charts every row is in scope.
 * The summary table and the field list share this so their numbers agree.
 */
export function useFilteredFieldProfiles(): FieldProfile[] {
  const sourceProfiles = useDataLayer((state) => state.fieldProfiles);
  const data = useDataLayer((state) => state.data);
  const calculations = useDataLayer((state) => state.calculations);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const crossfilterWrapper = useDataLayer((state) => state.crossfilterWrapper);
  const liveItems = useDataLayer((state) => state.liveItems);
  const chartState = useDataLayer((state) => state.charts);

  return useMemo(() => {
    // liveItems and fieldSettings change when filters or conversions change
    // the values these profiles describe.
    void liveItems;
    void fieldSettings;
    const filteredIds = new Set(
      chartState.length
        ? crossfilterWrapper.getFilteredRowIds()
        : data.map((row) => row.__ID)
    );
    const filteredRows = data.filter((row) => filteredIds.has(row.__ID));
    const profileColumn = (name: string) =>
      Object.fromEntries(
        filteredRows.map((row) => [row.__ID, row[name]])
      ) as Record<number, datum>;

    const source = sourceProfiles.map((profile) =>
      filteredRows.length === 0
        ? emptyFieldProfile(profile)
        : buildFieldProfile(
            profile.name,
            profileColumn(profile.name),
            profile.dataType
          )
    );
    const calculated = calculations.map((calculation) => {
      const allColumnData = getColumnData(calculation.resultColumnName);
      const filteredColumnData = Object.fromEntries(
        filteredRows.map((row) => [row.__ID, allColumnData[row.__ID]])
      ) as Record<number, datum>;
      const profile = buildFieldProfile(
        calculation.resultColumnName,
        allColumnData
      );
      return filteredRows.length === 0
        ? emptyFieldProfile(profile)
        : buildFieldProfile(
            calculation.resultColumnName,
            filteredColumnData,
            profile.dataType
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
  ]);
}
