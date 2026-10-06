import { useMemo } from "react";
import { useDataLayer, type IdType } from "@/providers/DataLayerProvider";
import type { ScatterPlotSettings } from "./definition";
import type { ScatterSnapshot } from "./scatterPlan";

/** One data snapshot serves points, bubbles, and density bins. */
export function useScatterData(
  settings: ScatterPlotSettings,
  facetIds?: IdType[]
) {
  const data = useDataLayer((state) => state.data);
  const rawData = useDataLayer((state) => state.rawData);
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const manager = useDataLayer((state) => state.calculationManager);
  const calculations = useDataLayer((state) => state.calculations);
  const nonce = useDataLayer((state) => state.nonce);
  const chartItems = useDataLayer((state) => state.liveItems[settings.id]);
  const crossfilter = useDataLayer((state) => state.crossfilterWrapper);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const colorScale = useDataLayer((state) =>
    state.colorScales.find((item) => item.id === settings.colorScaleId)
  );
  const updateChart = useDataLayer((state) => state.updateChart);
  const fieldLabel = useDataLayer((state) => state.getFieldLabel);
  const getFieldLabel = (field: string) =>
    fieldLabel ? fieldLabel(field) : field;
  const allIds = useMemo(() => data.map((row) => row.__ID), [data]);

  const snapshot = useMemo((): ScatterSnapshot => {
    // Chart and global filter populations come from the same store update.
    const chartIds =
      chartItems?.items
        .filter((item) => item.value > 0)
        .map((item) => item.key) ?? [];
    // The data layer replaces cached columns after edits; old maps stay stable.
    const column = (field: string | undefined) =>
      field ? getColumnData(field) : {};
    const profileType = (field: string) =>
      profiles.find((profile) => profile.name === field)?.dataType;
    return {
      revision: `${nonce}:${chartItems?.nonce ?? 0}`,
      allIds,
      chartIds,
      filteredIds: crossfilter.getFilteredRowIds(),
      facetIds: facetIds?.slice(),
      xData: column(settings.xField),
      yData: column(settings.yField),
      colorData: column(settings.colorField),
      sizeData: column(settings.sizeField),
      entityData: column(settings.entityField),
      xType: profileType(settings.xField),
      yType: profileType(settings.yField),
      facetRowData: settings.facet.enabled
        ? column(settings.facet.rowVariable)
        : undefined,
      facetColumnData:
        settings.facet.enabled && settings.facet.type === "grid"
          ? column(settings.facet.columnVariable)
          : undefined,
      fieldSettings: Object.fromEntries(
        Object.entries(fieldSettings).map(([field, value]) => [
          field,
          { ...value },
        ])
      ),
      colorScale:
        colorScale?.type === "categorical"
          ? {
              ...colorScale,
              mapping: new Map(colorScale.mapping),
              palette: [...colorScale.palette],
            }
          : colorScale && { ...colorScale },
      calculatedFields: calculations.map((calc) => calc.resultColumnName),
      pixelRatio:
        typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
    };
  }, [
    allIds,
    chartItems,
    crossfilter,
    getColumnData,
    profiles,
    fieldSettings,
    colorScale,
    calculations,
    nonce,
    settings.xField,
    settings.yField,
    settings.colorField,
    settings.sizeField,
    settings.entityField,
    settings.facet,
    facetIds,
  ]);

  return {
    snapshot,
    data,
    rawData,
    profiles,
    manager,
    updateChart,
    getFieldLabel,
  };
}
