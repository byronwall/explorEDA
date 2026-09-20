import { FieldSelector } from "@/components/FieldSelector";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { BarChartSettings } from "./definition";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useMemo, useState } from "react";

export function BarChartSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<BarChartSettings>) {
  const { getOrCreateScaleForField } = useColorScales();
  const aggregate = useDataLayer((state) =>
    settings.aggregateId ? state.getAggregate(settings.aggregateId) : undefined
  );
  const updateAggregate = useDataLayer((state) => state.updateAggregate);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const calculations = useDataLayer((state) => state.calculations);
  const fieldNames = useMemo(() => {
    void calculations;
    return getColumnNames();
  }, [getColumnNames, calculations]);
  const [error, setError] = useState<string>();

  if (settings.aggregateId) {
    if (!aggregate) {
      return (
        <p className="text-sm text-destructive">Grouped summary not found.</p>
      );
    }
    const updateDefinition = (updates: Partial<typeof aggregate>) => {
      try {
        updateAggregate(settings.aggregateId!, updates);
        setError(undefined);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not update grouped summary"
        );
      }
    };
    return (
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          This bar reads a named grouped result. It is read-only and uses the
          current source filter scope.
        </p>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <Label>Group by</Label>
          <FieldSelector
            label=""
            value={aggregate.groupField}
            onChange={(value) => updateDefinition({ groupField: value })}
          />

          <Label>Aggregation</Label>
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={aggregate.aggregation}
            onChange={(event) =>
              updateDefinition({
                aggregation: event.target.value as typeof aggregate.aggregation,
                ...(event.target.value !== "count" && !aggregate.measureField
                  ? { measureField: fieldNames[0] }
                  : {}),
              })
            }
          >
            <option value="count">Count rows</option>
            <option value="sum">Sum</option>
            <option value="average">Average</option>
          </select>

          {aggregate.aggregation !== "count" && (
            <>
              <Label>Measure</Label>
              <FieldSelector
                label=""
                value={aggregate.measureField ?? ""}
                onChange={(value) => updateDefinition({ measureField: value })}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label>Field</Label>
        <FieldSelector
          label=""
          value={settings.field}
          onChange={(value) => onSettingsChange({ ...settings, field: value })}
        />

        <Label>Bins · {settings.binCount ?? 10}</Label>
        <Slider
          aria-label="Histogram bin count"
          value={[settings.binCount ?? 10]}
          min={2}
          max={50}
          step={1}
          onValueChange={([value]) =>
            onSettingsChange({ ...settings, binCount: value })
          }
        />

        <div className="col-start-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="forceString"
              checked={settings.forceString}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  forceString: checked,
                })
              }
            />
            <Label htmlFor="forceString">Treat values as categories</Label>
          </div>
        </div>

        <div className="col-start-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="colorField"
              checked={settings.field === settings.colorField}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  colorField: checked ? settings.field : undefined,
                  colorScaleId:
                    checked && settings.field
                      ? getOrCreateScaleForField(settings.field)
                      : undefined,
                })
              }
            />
            <Label htmlFor="colorField">Use as color field</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
