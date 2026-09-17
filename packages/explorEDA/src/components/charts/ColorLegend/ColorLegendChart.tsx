import { useEffect, useMemo } from "react";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { ValueFilter } from "@/types/FilterTypes";
import { useGetLiveIds } from "../useGetLiveData";
import { ColorLegendSettings } from "./definition";
import { ColorScale } from "./ColorScale";

export function ColorLegendChart({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<ColorLegendSettings>) {
  const { colorScales, getOrCreateScaleForField, getColorForValue } =
    useColorScales();
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const updateChart = useDataLayer((state) => state.updateChart);
  const rowCount = useDataLayer((state) => state.data.length);
  const liveIds = useGetLiveIds(settings);

  useEffect(() => {
    for (const field of settings.fields) {
      if (!colorScales.some((scale) => scale.name === field))
        getOrCreateScaleForField(field);
    }
  }, [settings.fields, colorScales, getOrCreateScaleForField]);

  const fieldCounts = useMemo(() => {
    const facet = facetIds && new Set(facetIds);
    const ids = facet ? liveIds.filter((id) => facet.has(id)) : liveIds;
    return new Map(
      settings.fields.map((field) => {
        const values = getColumnData(field);
        const counts = new Map<string, number>();
        for (const id of ids) {
          if (values[id] == null) continue;
          const value = String(values[id]);
          counts.set(value, (counts.get(value) ?? 0) + 1);
        }
        return [field, counts];
      })
    );
  }, [settings.fields, liveIds, facetIds, getColumnData]);

  if (settings.fields.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full text-muted-foreground">
        Select a field to see a legend
      </div>
    );
  }

  return (
    <div className="eda-color-legend" style={{ width, height }}>
      {settings.fields.map((field) => {
        const scale = colorScales.find((scale) => scale.name === field);
        if (!scale) return null;
        const selected = settings.filters
          .filter(
            (filter): filter is ValueFilter =>
              filter.type === "value" && filter.field === field
          )
          .flatMap((filter) => filter.values.map(String));
        return (
          <section key={field} aria-label={field}>
            {settings.fields.length > 1 && (
              <div className="eda-legend-field">{field}</div>
            )}
            <ColorScale
              scale={scale}
              width={width - 24}
              wrap={settings.wrap}
              numericalBreakpoints={settings.numericalBreakpoints}
              getColorForValue={getColorForValue}
              counts={fieldCounts.get(field)!}
              countWidth={rowCount.toLocaleString().length}
              selected={selected}
              onToggle={(value) => {
                const values = selected.includes(value)
                  ? selected.filter((item) => item !== value)
                  : [...selected, value];
                const filters = settings.filters.filter(
                  (filter) => filter.field !== field
                );
                if (values.length)
                  filters.push({ type: "value", field, values });
                updateChart(settings.id, { filters });
              }}
            />
          </section>
        );
      })}
    </div>
  );
}
