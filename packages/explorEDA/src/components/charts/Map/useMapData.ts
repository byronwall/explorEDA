import { useDisplayColorScale } from "@/hooks/useDisplayColorScales";
import { useMemo } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { convertFieldValue } from "@/lib/fieldSettings";
import type { RowCalculationTrace } from "@/lib/calculations/CalculationState";
import type { ChartTraceField } from "../ChartTraceDetails";
import type { MapSettings } from "./definition";
import type { MapSnapshot } from "./pointMapPlan";
import { useGetAllIds } from "../useGetLiveData";

function inputFields(trace: RowCalculationTrace): string[] {
  const calculated = new Set(trace.dependencies.map((item) => item.field));
  return [
    ...new Set([
      ...trace.inputs
        .filter((item) => !calculated.has(item.field))
        .map((item) => item.field),
      ...trace.dependencies.flatMap(inputFields),
    ]),
  ];
}
export function useMapData(settings: MapSettings, facetIds?: number[]) {
  const data = useDataLayer((state) => state.data);
  const raw = useDataLayer((state) => state.rawData);
  const live = useDataLayer((state) => state.liveItems[settings.id]);
  const nonce = useDataLayer((state) => state.nonce);
  const crossfilter = useDataLayer((state) => state.crossfilterWrapper);
  const allIds = useGetAllIds(settings);
  const column = useDataLayer((state) => state.getColumnData);
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const formats = useDataLayer((state) => state.fieldSettings);
  const manager = useDataLayer((state) => state.calculationManager);
  const colorScale = useDisplayColorScale(settings.colorScaleId);
  const updateChart = useDataLayer((state) => state.updateChart);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const snapshot = useMemo(
    (): MapSnapshot => ({
      revision: `${nonce}:${live?.nonce ?? 0}`,
      allIds,
      chartIds:
        live?.items.filter((row) => row.value > 0).map((row) => row.key) ??
        crossfilter.getChartFilteredRowIds(settings),
      filteredIds: crossfilter.getChartFilteredRowIds(settings),
      facetIds,
      columns: Object.fromEntries(
        [
          settings.latitudeField,
          settings.longitudeField,
          settings.labelField,
          settings.colorField,
          settings.sizeField,
          settings.regionField,
          settings.measureField,
        ]
          .filter((field): field is string => Boolean(field))
          .map((field) => [field, column(field)])
      ),
      colorScale,
    }),
    [
      allIds,
      live,
      nonce,
      crossfilter,
      column,
      facetIds,
      settings.latitudeField,
      settings.longitudeField,
      settings.labelField,
      settings.colorField,
      settings.sizeField,
      settings.regionField,
      settings.measureField,
      colorScale,
    ]
  );
  const traceField = (field: string, id: number): ChartTraceField => {
    const prepare = (name: string) => {
      const source = raw[id]?.[name];
      const format = formats[name] ?? {};
      const type =
        format.type ??
        profiles.find((profile) => profile.name === name)?.dataType ??
        "categorical";
      return {
        field: name,
        raw: source,
        prepared: column(name)[id],
        conversion: { error: convertFieldValue(source, type, format).error },
      };
    };
    const calculation = manager.traceRow(field, id);
    return {
      ...prepare(field),
      calculation,
      sources: calculation ? inputFields(calculation).map(prepare) : [],
    };
  };
  return { snapshot, updateChart, getFieldLabel, traceField };
}
