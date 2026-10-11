import { ActionTooltip } from "@/components/ui/tooltip";
import { FieldSelector } from "@/components/FieldSelector";
import { NumericInputEnter } from "@/components/NumericInputEnter";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useColorScales } from "@/hooks/useColorScales";
import { ChartSettingsPanelProps, RowChartSettings } from "@/types/ChartTypes";
import { ColorScaleControl } from "@/components/colorScales/ColorScaleControl";
import { Input } from "@/components/ui/input";
import { ONCE_PER_HELP, type AggregateSpec } from "@/lib/aggregates";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useEffect, useState } from "react";
import { getAggregateName, useMeasureFields } from "../aggregateFields";

const SELECT_CLASS = "h-9 rounded-md border-input bg-background px-2 text-sm";

export function RowChartSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<RowChartSettings>) {
  const { getOrCreateScaleForField } = useColorScales();
  const aggregates = useDataLayer((state) => state.aggregates);
  const addAggregate = useDataLayer((state) => state.addAggregate);
  const updateAggregate = useDataLayer((state) => state.updateAggregate);
  const sharedWith = useDataLayer(
    (state) =>
      state.charts.filter(
        (chart) =>
          chart.id !== settings.id &&
          "aggregateId" in chart &&
          chart.aggregateId === settings.aggregateId
      ).length
  );
  const aggregate = settings.aggregateId
    ? aggregates.find((item) => item.id === settings.aggregateId)
    : undefined;
  const { measureFields } = useMeasureFields(aggregate?.measureField);
  const [error, setError] = useState<string>();
  const summaries = aggregates.filter(
    (item) => item.groupField === settings.field
  );

  // A summary's name titles the chart unless the title was edited.
  const applySummary = (next?: AggregateSpec) =>
    onSettingsChange({
      ...settings,
      aggregateId: next?.id,
      xAxisLabel: "",
      ...(!settings.title || settings.title === aggregate?.name
        ? { title: next?.name ?? "" }
        : {}),
    });
  const chooseMeasure = (value: string) => {
    setError(undefined);
    if (value === "new:sum" || value === "new:average") {
      const aggregation = value === "new:sum" ? "sum" : "average";
      const measureField = measureFields[0];
      try {
        applySummary(
          addAggregate({
            name: getAggregateName(aggregation, settings.field, measureField),
            groupField: settings.field,
            aggregation,
            measureField,
          })
        );
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Could not create summary"
        );
      }
      return;
    }
    applySummary(summaries.find((item) => item.id === value));
  };
  const updateDefinition = (updates: Partial<AggregateSpec>) => {
    if (!aggregate) return;
    try {
      const next = { ...aggregate, ...updates };
      const name = getAggregateName(
        next.aggregation,
        next.groupField,
        next.measureField,
        next.entityField
      );
      updateAggregate(aggregate.id, { ...updates, name });
      onSettingsChange({
        ...settings,
        xAxisLabel: "",
        ...(settings.title === aggregate.name ? { title: name } : {}),
      });
      setError(undefined);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not update summary"
      );
    }
  };

  return (
    <div className="space-y-2.5">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="eda-setting-grid">
        <Label>Data Field</Label>
        <FieldSelector
          label=""
          value={settings.field ?? ""}
          onChange={(value) =>
            // A summary groups one field, so a new field counts rows again.
            onSettingsChange({
              ...settings,
              field: value,
              aggregateId: undefined,
              ...(aggregate && settings.title === aggregate.name
                ? { title: "" }
                : {}),
            })
          }
        />

        <Label htmlFor="row-measure">Measure</Label>
        <ActionTooltip content="Count rows in each category, or rank a grouped summary of this field. A summary is shared, so other charts can show the same numbers.">
          <select
            id="row-measure"
            className={SELECT_CLASS}
            value={aggregate?.id ?? ""}
            disabled={!settings.field}
            onChange={(event) => chooseMeasure(event.target.value)}
          >
            <option value="">Count rows</option>
            {summaries.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
            <option value="new:sum" disabled={!measureFields.length}>
              New sum of a field…
            </option>
            <option value="new:average" disabled={!measureFields.length}>
              New average of a field…
            </option>
          </select>
        </ActionTooltip>

        {aggregate && (
          <>
            <Label htmlFor="row-operation">Operation</Label>
            <select
              id="row-operation"
              className={SELECT_CLASS}
              value={aggregate.aggregation}
              onChange={(event) =>
                updateDefinition({
                  aggregation: event.target
                    .value as AggregateSpec["aggregation"],
                  ...(event.target.value !== "count" && !aggregate.measureField
                    ? { measureField: measureFields[0] }
                    : {}),
                })
              }
            >
              <option value="count">Count rows</option>
              <option value="sum" disabled={!measureFields.length}>
                Sum
              </option>
              <option value="average" disabled={!measureFields.length}>
                Average
              </option>
            </select>
            {aggregate.aggregation !== "count" && (
              <>
                <Label>
                  {aggregate.aggregation === "sum" ? "Sum of" : "Average of"}
                </Label>
                <FieldSelector
                  label=""
                  placeholder="Measure"
                  value={aggregate.measureField ?? ""}
                  fields={measureFields}
                  onChange={(value) =>
                    updateDefinition({ measureField: value })
                  }
                />
              </>
            )}
            <Label>Once per</Label>
            <ActionTooltip content={ONCE_PER_HELP}>
              <FieldSelector
                label=""
                placeholder="Every row"
                value={aggregate.entityField ?? ""}
                allowClear
                onChange={(value) =>
                  updateDefinition({ entityField: value || undefined })
                }
              />
            </ActionTooltip>
            {sharedWith > 0 && (
              <p className="col-span-2 text-xs text-muted-foreground">
                {sharedWith === 1
                  ? "1 other chart uses this summary; changes here update it too."
                  : `${sharedWith} other charts use this summary; changes here update them too.`}
              </p>
            )}
          </>
        )}

        <Label htmlFor="row-top-n">Top N</Label>
        <ActionTooltip content="Show this many of the largest categories and gather the rest in Other, at every chart size. Leave empty to show as many as fit.">
          <span className="inline-flex w-fit">
            <TopNInput
              value={settings.topN}
              onChange={(topN) => onSettingsChange({ ...settings, topN })}
            />
          </span>
        </ActionTooltip>

        <Label htmlFor="minRowHeight">Min Row Height</Label>
        <NumericInputEnter
          id="minRowHeight"
          value={settings.minRowHeight || 30}
          onChange={(value) =>
            onSettingsChange({
              ...settings,
              minRowHeight: value,
              maxRowHeight: Math.max(value, settings.maxRowHeight),
            })
          }
          min={20}
          max={100}
          stepSmall={1}
          stepMedium={5}
          stepLarge={10}
          placeholder="Enter minimum row height"
        />

        <Label htmlFor="maxRowHeight">Max Row Height</Label>
        <NumericInputEnter
          id="maxRowHeight"
          value={settings.maxRowHeight || 50}
          onChange={(value) =>
            onSettingsChange({
              ...settings,
              maxRowHeight: value,
              minRowHeight: Math.min(value, settings.minRowHeight),
            })
          }
          min={30}
          max={200}
          stepSmall={1}
          stepMedium={10}
          stepLarge={20}
          placeholder="Enter maximum row height"
        />

        <div className="col-start-2">
          <div className="flex items-center space-x-2">
            <ActionTooltip content="Give each category its own color from a shared color scale.">
              <span className="inline-flex w-fit">
                <Switch
                  id="colorField"
                  checked={settings.field === settings.colorField}
                  onCheckedChange={(checked) => {
                    onSettingsChange({
                      ...settings,
                      colorField: checked ? settings.field : undefined,
                      colorScaleId:
                        checked && settings.field
                          ? getOrCreateScaleForField(settings.field)
                          : undefined,
                    });
                  }}
                />
              </span>
            </ActionTooltip>
            <Label htmlFor="colorField">Use as color field</Label>
          </div>
        </div>
        {settings.colorField && settings.colorScaleId && (
          <div className="col-start-2">
            <ColorScaleControl scaleId={settings.colorScaleId} />
          </div>
        )}
      </div>
    </div>
  );
}

/** A count that commits on Enter or blur; empty means fit the chart's height. */
function TopNInput({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  const [text, setText] = useState(value?.toString() ?? "");
  useEffect(() => setText(value?.toString() ?? ""), [value]);
  const commit = () => {
    const parsed = Number.parseInt(text, 10);
    const next = Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    setText(next?.toString() ?? "");
    if (next !== value) onChange(next);
  };
  return (
    <Input
      id="row-top-n"
      type="number"
      min={1}
      step={1}
      inputMode="numeric"
      placeholder="Fit"
      className="h-9 w-24"
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit();
      }}
    />
  );
}
