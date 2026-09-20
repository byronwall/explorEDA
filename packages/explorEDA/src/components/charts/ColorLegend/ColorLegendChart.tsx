import {
  categoryEqual,
  categoryIncludes,
  categoryKey,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import { hasFieldDisplayFormat } from "@/lib/fieldSettings";
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
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const liveIds = useGetLiveIds(settings);

  useEffect(() => {
    for (const field of settings.fields) {
      if (
        settings.fields.length === 1 &&
        settings.colorScaleId &&
        colorScales.some((item) => item.id === settings.colorScaleId)
      ) {
        continue;
      }
      const scale = colorScales.find((item) => item.sourceField === field);
      const scaleId = scale?.id ?? getOrCreateScaleForField(field);
      if (
        settings.fields.length === 1 &&
        settings.colorScaleId !== scaleId &&
        colorScales.some((item) => item.id === scaleId)
      ) {
        updateChart(settings.id, { colorScaleId: scaleId });
      }
    }
  }, [
    settings.fields,
    settings.colorScaleId,
    colorScales,
    getOrCreateScaleForField,
    updateChart,
  ]);

  const fieldCounts = useMemo(() => {
    const facet = facetIds && new Set(facetIds);
    const ids = facet ? liveIds.filter((id) => facet.has(id)) : liveIds;
    return new Map(
      settings.fields.map((field) => {
        const values = getColumnData(field);
        const counts = new Map<string, number>();
        for (const id of ids) {
          const value = categoryKey(values[id]);
          counts.set(value, (counts.get(value) ?? 0) + 1);
        }
        return [field, counts];
      })
    );
  }, [settings.fields, liveIds, facetIds, getColumnData]);

  if (settings.fields.length === 0) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-1 text-center text-muted-foreground"
        aria-label="Color legend"
      >
        <h3 className="text-sm font-medium text-foreground">Color legend</h3>
        <p className="text-xs">Open chart settings and select a field.</p>
      </div>
    );
  }

  return (
    <div className="eda-color-legend" style={{ width, height }}>
      {settings.fields.map((field) => {
        void fieldSettings[field];
        const scale =
          settings.fields.length === 1 && settings.colorScaleId
            ? colorScales.find((item) => item.id === settings.colorScaleId)
            : colorScales.find((item) => item.sourceField === field);
        if (!scale) return null;
        const selected = settings.filters
          .filter(
            (filter): filter is ValueFilter =>
              filter.type === "value" && filter.field === field
          )
          .flatMap((filter) => filter.values.map(categoryValue));
        return (
          <section key={field} aria-label={getFieldLabel(field)}>
            {settings.fields.length > 1 && (
              <div className="eda-legend-field">{getFieldLabel(field)}</div>
            )}
            <ColorScale
              scale={scale}
              width={width - 24}
              wrap={settings.wrap}
              numericalBreakpoints={settings.numericalBreakpoints}
              getColorForValue={getColorForValue}
              counts={fieldCounts.get(field)!}
              categories={[
                ...new Map(
                  Object.values(getColumnData(field)).map((value) => [
                    categoryKey(value),
                    categoryValue(value),
                  ])
                ).values(),
              ]}
              countWidth={rowCount.toLocaleString().length}
              selected={selected}
              formatValue={(value) =>
                hasFieldDisplayFormat(fieldSettings[field])
                  ? formatFieldValue(field, value)
                  : categoryLabel(value)
              }
              onToggle={(value) => {
                const values = categoryIncludes(selected, value)
                  ? selected.filter((item) => !categoryEqual(item, value))
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
