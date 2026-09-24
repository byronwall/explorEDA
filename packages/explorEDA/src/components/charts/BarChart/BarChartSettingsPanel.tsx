import { FieldSelector } from "@/components/FieldSelector";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { BarChartSettings } from "./definition";
import type { AggregateAggregation } from "@/lib/aggregates";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useMemo, useState } from "react";

function getAggregateName(
  aggregation: AggregateAggregation,
  groupField: string,
  measureField?: string
) {
  if (aggregation === "count") {
    return `Count by ${groupField}`;
  }
  return `${aggregation === "sum" ? "Sum" : "Average"} of ${measureField ?? ""} by ${groupField}`;
}

export function BarChartSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<BarChartSettings>) {
  const { getOrCreateScaleForField } = useColorScales();
  const aggregate = useDataLayer((state) =>
    settings.aggregateId ? state.getAggregate(settings.aggregateId) : undefined
  );
  const addAggregate = useDataLayer((state) => state.addAggregate);
  const updateAggregate = useDataLayer((state) => state.updateAggregate);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const calculations = useDataLayer((state) => state.calculations);
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const fieldNames = useMemo(() => {
    void calculations;
    return getColumnNames();
  }, [getColumnNames, calculations]);
  const measureFields = useMemo(() => {
    const numeric = fieldNames.filter((field) =>
      fieldProfiles.some(
        (profile) => profile.name === field && profile.dataType === "numeric"
      )
    );
    calculations.forEach((calculation) => {
      const values = Object.values(getColumnData(calculation.resultColumnName));
      if (
        values.some(
          (value) =>
            value !== null &&
            value !== undefined &&
            value !== "" &&
            typeof value !== "boolean" &&
            Number.isFinite(Number(value))
        )
      ) {
        numeric.push(calculation.resultColumnName);
      }
    });
    if (aggregate?.measureField && !numeric.includes(aggregate.measureField)) {
      numeric.unshift(aggregate.measureField);
    }
    return numeric;
  }, [
    aggregate?.measureField,
    calculations,
    fieldNames,
    fieldProfiles,
    getColumnData,
  ]);
  const [error, setError] = useState<string>();

  const createAggregate = (aggregation: AggregateAggregation) => {
    const measureField = measureFields[0];
    if (aggregation !== "count" && !measureField) {
      setError("Sum and average need a numeric measure field.");
      return;
    }
    try {
      const aggregate = addAggregate({
        name: getAggregateName(aggregation, settings.field, measureField),
        groupField: settings.field,
        aggregation,
        ...(aggregation === "count" ? {} : { measureField }),
      });
      onSettingsChange({
        ...settings,
        field: aggregate.measureField ?? aggregate.groupField,
        aggregateId: aggregate.id,
        title: aggregate.name,
        xAxisLabel: "",
        yAxisLabel: "",
      });
      setError(undefined);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not create grouped bar"
      );
    }
  };

  if (settings.aggregateId) {
    if (!aggregate) {
      return (
        <p className="text-sm text-destructive">Bar aggregation not found.</p>
      );
    }
    const updateDefinition = (updates: Partial<typeof aggregate>) => {
      try {
        const next = { ...aggregate, ...updates };
        const name = getAggregateName(
          next.aggregation,
          next.groupField,
          next.measureField
        );
        updateAggregate(settings.aggregateId!, { ...updates, name });
        onSettingsChange({
          ...settings,
          field:
            next.aggregation === "count"
              ? next.groupField
              : (next.measureField ?? next.groupField),
          ...(settings.title === aggregate.name ? { title: name } : {}),
        });
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
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <Label>Group by</Label>
          <FieldSelector
            label=""
            placeholder="Group by"
            value={aggregate.groupField}
            onChange={(value) => updateDefinition({ groupField: value })}
          />

          <Label htmlFor="bar-operation">Operation</Label>
          <select
            id="bar-operation"
            className="h-9 rounded-md border-input bg-background px-2 text-sm"
            value={aggregate.aggregation}
            onChange={(event) => {
              if (event.target.value === "category") {
                onSettingsChange({
                  ...settings,
                  field: aggregate.groupField,
                  aggregateId: undefined,
                  ...(settings.title === aggregate.name ? { title: "" } : {}),
                });
                return;
              }
              updateDefinition({
                aggregation: event.target.value as typeof aggregate.aggregation,
                ...(event.target.value !== "count" && !aggregate.measureField
                  ? { measureField: measureFields[0] }
                  : {}),
              });
            }}
          >
            <option value="category">Category counts / bins</option>
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
              <Label>Measure</Label>
              <FieldSelector
                label=""
                placeholder="Measure"
                value={aggregate.measureField ?? ""}
                fields={measureFields}
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
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label>Group by</Label>
        <FieldSelector
          label=""
          placeholder="Group by"
          value={settings.field}
          onChange={(value) => onSettingsChange({ ...settings, field: value })}
        />

        <Label htmlFor="bar-operation">Operation</Label>
        <select
          id="bar-operation"
          className="h-9 rounded-md border-input bg-background px-2 text-sm"
          defaultValue="category"
          onChange={(event) => {
            if (event.target.value !== "category") {
              createAggregate(event.target.value as AggregateAggregation);
            }
          }}
        >
          <option value="category">Count rows</option>
          <option value="sum" disabled={!measureFields.length}>
            Sum
          </option>
          <option value="average" disabled={!measureFields.length}>
            Average
          </option>
        </select>

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
