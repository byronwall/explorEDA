import { FieldSelector } from "@/components/FieldSelector";
import { NumericInputEnter } from "@/components/NumericInputEnter";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ActionTooltip } from "@/components/ui/tooltip";
import type { AggregateAggregation } from "@/lib/aggregates";
import { finiteNumber } from "@/lib/valueParsing";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { useMemo } from "react";
import type { HeatmapSettings } from "./definition";

/** Drops a cell selection that names a field the chart no longer uses. */
function withoutStaleSelection(
  settings: HeatmapSettings,
  next: Partial<HeatmapSettings>
): HeatmapSettings {
  const merged = { ...settings, ...next };
  const fields = new Set([merged.field, merged.columnField]);
  return {
    ...merged,
    filters: merged.filters.filter(
      (filter) => filter.type !== "value" || fields.has(filter.field)
    ),
  };
}

export function HeatmapSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<HeatmapSettings>) {
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const calculations = useDataLayer((state) => state.calculations);
  const measureFields = useMemo(() => {
    void calculations;
    return getColumnNames().filter((field) =>
      Object.values(getColumnData(field)).some(
        (value) =>
          typeof value !== "boolean" && finiteNumber(value) !== undefined
      )
    );
  }, [calculations, getColumnData, getColumnNames]);
  const change = (next: Partial<HeatmapSettings>) =>
    onSettingsChange(withoutStaleSelection(settings, next));

  return (
    <div className="space-y-2.5">
      <div className="eda-setting-grid">
        <Label>Rows</Label>
        <FieldSelector
          label=""
          placeholder="Row field"
          value={settings.field}
          onChange={(value) => change({ field: value })}
        />

        <Label>Columns</Label>
        <FieldSelector
          label=""
          placeholder="Column field"
          value={settings.columnField}
          onChange={(value) => change({ columnField: value })}
        />
        {settings.field && settings.field === settings.columnField && (
          <p className="col-start-2 text-xs text-destructive" role="alert">
            Rows and columns need different fields.
          </p>
        )}

        <Label htmlFor="heatmap-metric">Metric</Label>
        <select
          id="heatmap-metric"
          className="h-9 rounded-md border-input bg-background px-2 text-sm"
          value={settings.aggregation}
          onChange={(event) => {
            const aggregation = event.target.value as AggregateAggregation;
            change({
              aggregation,
              ...(aggregation !== "count" && !settings.measureField
                ? { measureField: measureFields[0] }
                : {}),
            });
          }}
        >
          <option value="count">Count rows</option>
          <option value="sum" disabled={!measureFields.length}>
            Sum
          </option>
          <option value="average" disabled={!measureFields.length}>
            Average
          </option>
        </select>

        {settings.aggregation !== "count" && (
          <>
            <Label>Measure</Label>
            <FieldSelector
              label=""
              placeholder="Measure"
              value={settings.measureField ?? ""}
              fields={measureFields}
              onChange={(value) => change({ measureField: value })}
            />
          </>
        )}

        <ActionTooltip content="Each axis shows at most this many values, the ones with the most rows. Rows with other values are left out and counted below the chart.">
          <Label htmlFor="heatmap-limit">Values per axis</Label>
        </ActionTooltip>
        <NumericInputEnter
          id="heatmap-limit"
          value={settings.maxCategories}
          onChange={(value) => change({ maxCategories: Math.round(value) })}
          min={2}
          max={60}
          stepSmall={1}
          stepMedium={5}
          stepLarge={10}
          placeholder="Values per axis"
        />

        <Label>Order</Label>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={settings.sortBy}
          onValueChange={(next) =>
            next && change({ sortBy: next as HeatmapSettings["sortBy"] })
          }
          aria-label="Order"
          className="justify-start"
        >
          {(
            [
              [
                "count",
                "Most rows",
                "Put the values with the most rows first on each axis.",
              ],
              [
                "label",
                "A to Z",
                "Sort each axis by its value labels, numbers in numeric order.",
              ],
            ] as const
          ).map(([value, text, help]) => (
            <ActionTooltip key={value} content={help}>
              <span className="inline-flex">
                <ToggleGroupItem value={value} className="px-2">
                  {text}
                </ToggleGroupItem>
              </span>
            </ActionTooltip>
          ))}
        </ToggleGroup>

        <div className="col-start-2">
          <ActionTooltip content="Print each cell's value inside it when the cells are large enough to fit the text.">
            <div className="flex items-center space-x-2">
              <Switch
                id="heatmap-values"
                checked={settings.showValues}
                onCheckedChange={(checked) => change({ showValues: checked })}
              />
              <Label htmlFor="heatmap-values">Show values in cells</Label>
            </div>
          </ActionTooltip>
        </div>
      </div>
    </div>
  );
}
