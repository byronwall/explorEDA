import {
  categoryEqual,
  categoryIncludes,
  categoryKey,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import { hasFieldDisplayFormat } from "@/lib/fieldSettings";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { ChartSettings, datum } from "@/types/ChartTypes";
import { ValueFilter } from "@/types/FilterTypes";
import { useMemo } from "react";
import { useColorScales } from "@/hooks/useColorScales";
import { useGetLiveIds } from "../useGetLiveData";
import { ColorScale } from "./ColorScale";

interface ChartColorLegendProps {
  settings: ChartSettings;
  width: number;
}

export function ChartColorLegend({ settings, width }: ChartColorLegendProps) {
  if (!settings.colorField || !settings.colorScaleId) return null;

  return <ChartColorLegendBody settings={settings} width={width} />;
}

function ChartColorLegendBody({ settings, width }: ChartColorLegendProps) {
  const field = settings.colorField!;
  const scaleId = settings.colorScaleId!;
  const { colorScales, getColorForValue } = useColorScales();
  const scale = colorScales.find((item) => item.id === scaleId);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const updateChart = useDataLayer((state) => state.updateChart);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const liveIds = useGetLiveIds(settings);

  const values = getColumnData(field);
  const categories = useMemo(
    () => [
      ...new Map(
        Object.values(values).map((value) => [
          categoryKey(value),
          categoryValue(value),
        ])
      ).values(),
    ],
    [values]
  );
  const counts = useMemo(() => {
    const next = new Map<string, number>();
    liveIds.forEach((id) => {
      const key = categoryKey(values[id]);
      next.set(key, (next.get(key) ?? 0) + 1);
    });
    return next;
  }, [liveIds, values]);
  const selected = settings.filters
    .filter(
      (filter): filter is ValueFilter =>
        filter.type === "value" && filter.field === field
    )
    .flatMap((filter) => filter.values.map(categoryValue));

  if (!scale) return null;
  // Subscribe to fieldSettings so provider-stable label getters rerender after edits.
  void fieldSettings[field];
  const formatValue = (value: datum) =>
    hasFieldDisplayFormat(fieldSettings[field])
      ? formatFieldValue(field, value)
      : categoryLabel(value);
  const colorScale = (
    <ColorScale
      scale={scale}
      width={Math.max(1, width - 24)}
      wrap
      numericalBreakpoints={5}
      getColorForValue={getColorForValue}
      counts={counts}
      categories={categories}
      countWidth={liveIds.length.toLocaleString().length}
      selected={selected}
      formatValue={formatValue}
      onToggle={(value) => {
        const nextValues = categoryIncludes(selected, value)
          ? selected.filter((item) => !categoryEqual(item, value))
          : [...selected, value];
        const filters = settings.filters.filter(
          (filter) => filter.field !== field
        );
        if (nextValues.length)
          filters.push({ type: "value", field, values: nextValues });
        updateChart(settings.id, { filters });
      }}
    />
  );

  return (
    <div
      className="eda-chart-color-legend"
      aria-label={`${getFieldLabel(field)} color legend`}
    >
      <span className="eda-legend-field">{getFieldLabel(field)}</span>
      {categories.length > 8 ? (
        <details className="eda-legend-disclosure">
          <summary>Show {categories.length} values</summary>
          <div className="eda-legend-disclosure-content">{colorScale}</div>
        </details>
      ) : (
        colorScale
      )}
    </div>
  );
}
