import { finiteNumber } from "@/lib/numeric";
import { FieldSelector } from "@/components/FieldSelector";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ActionTooltip } from "@/components/ui/tooltip";
import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { BarChartSettings } from "./definition";
import { ONCE_PER_HELP, type AggregateAggregation } from "@/lib/aggregates";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useMemo, useState } from "react";
import { ColorScaleControl } from "@/components/colorScales/ColorScaleControl";

function getAggregateName(
  aggregation: AggregateAggregation,
  groupField: string,
  measureField?: string,
  entityField?: string
) {
  if (aggregation === "count") {
    return `Count${entityField ? ` distinct ${entityField}` : ""} by ${groupField}`;
  }
  return `${aggregation === "sum" ? "Sum" : "Average"} of ${measureField ?? ""}${entityField ? ` once per ${entityField}` : ""} by ${groupField}`;
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
      if (values.some((value) => finiteNumber(value) !== undefined)) {
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
  const stacked = Boolean(
    settings.seriesField &&
      settings.seriesLayout &&
      settings.seriesLayout !== "grouped"
  );
  const seriesControl = (
    <>
      <Label>Split by</Label>
      <FieldSelector
        label=""
        placeholder="Series field"
        value={settings.seriesField ?? ""}
        allowClear
        fields={fieldNames.filter(
          (field) => field !== (aggregate?.groupField ?? settings.field)
        )}
        onChange={(field) =>
          onSettingsChange({
            ...settings,
            seriesField: field || undefined,
            colorField: field || undefined,
            colorScaleId: field ? getOrCreateScaleForField(field) : undefined,
            filters: settings.filters.filter(
              (filter) => filter.field !== settings.seriesField
            ),
          })
        }
      />
      {settings.seriesField && (
        <>
          <Label htmlFor="bar-series-layout">Display</Label>
          <ActionTooltip content="Grouped compares separate values. Stacked adds series. 100% shows each series as a share of its category total.">
            <select
              id="bar-series-layout"
              className="h-9 rounded-md border-input bg-background px-2 text-sm"
              value={settings.seriesLayout ?? "grouped"}
              onChange={(event) =>
                onSettingsChange({
                  ...settings,
                  seriesLayout: event.target
                    .value as BarChartSettings["seriesLayout"],
                  yAxisLabel: "",
                  yAxis: { ...settings.yAxis, scaleType: "linear" },
                })
              }
            >
              <option value="grouped">Grouped</option>
              <option
                value="stacked"
                disabled={aggregate?.aggregation === "average"}
              >
                Stacked
              </option>
              <option
                value="percent"
                disabled={aggregate?.aggregation === "average"}
              >
                100%
              </option>
            </select>
          </ActionTooltip>
          <p className="col-span-2 text-xs text-muted-foreground">
            {aggregate?.aggregation === "average"
              ? "Choose count or sum to stack series. Compare averages side by side."
              : settings.seriesLayout === "percent"
                ? "Each category totals 100%. Shares use its nonnegative series totals after other chart filters."
                : settings.seriesLayout === "stacked"
                  ? "Series add within each category. Positive and negative totals stack separately from zero."
                  : "Compare series side by side. Stacked adds their values; 100% compares their shares."}
          </p>
        </>
      )}
    </>
  );

  const orderControl = (
    <>
      <Label htmlFor="bar-category-order">Order</Label>
      <ActionTooltip content="Data order keeps categories in the order rows first show them. A to Z sorts by label, with numbers in numeric order.">
        <select
          id="bar-category-order"
          className="h-9 rounded-md border-input bg-background px-2 text-sm"
          value={settings.categoryOrder ?? "data"}
          onChange={(event) =>
            onSettingsChange({
              ...settings,
              categoryOrder: event.target.value as "data" | "label",
            })
          }
        >
          <option value="data">Data order</option>
          <option value="label">A to Z</option>
        </select>
      </ActionTooltip>
    </>
  );

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
          next.measureField,
          next.entityField
        );
        updateAggregate(settings.aggregateId!, { ...updates, name });
        onSettingsChange({
          ...settings,
          field:
            next.aggregation === "count"
              ? next.groupField
              : (next.measureField ?? next.groupField),
          ...(settings.title === aggregate.name ? { title: name } : {}),
          ...(next.aggregation !== aggregate.aggregation ||
          next.measureField !== aggregate.measureField
            ? { yAxisLabel: "" }
            : {}),
          // A new group field makes the old group selection meaningless.
          ...(next.groupField !== aggregate.groupField
            ? {
                filters: settings.filters.filter(
                  (filter) =>
                    filter.type !== "value" ||
                    filter.field !== aggregate.groupField
                ),
              }
            : {}),
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
      <div className="space-y-2.5">
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="eda-setting-grid">
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
            {!settings.seriesField && (
              <option value="category">Category counts / bins</option>
            )}
            <option value="count">Count rows</option>
            <option value="sum" disabled={!measureFields.length}>
              Sum
            </option>
            <option value="average" disabled={!measureFields.length || stacked}>
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
          {orderControl}
          {seriesControl}
          {settings.colorScaleId && (
            <div className="col-start-2">
              <ColorScaleControl scaleId={settings.colorScaleId} />
            </div>
          )}
        </div>
        {settings.seriesField && (
          <p className="text-xs text-muted-foreground">
            Select a bar to filter its category and series.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="eda-setting-grid">
        {!settings.seriesField && (
          <>
            <Label htmlFor="bar-data-mode">Data mode</Label>
            <ActionTooltip content="Histogram groups numeric values into intervals. Category count gives each distinct value its own bar.">
              <select
                id="bar-data-mode"
                className="h-9 min-w-0 rounded border border-input bg-background px-2 text-sm"
                value={
                  !settings.forceString &&
                  measureFields.includes(settings.field)
                    ? "histogram"
                    : "category"
                }
                onChange={(event) =>
                  onSettingsChange({
                    ...settings,
                    forceString: event.target.value === "category",
                    field:
                      event.target.value === "histogram" &&
                      !measureFields.includes(settings.field)
                        ? measureFields[0]!
                        : settings.field,
                  })
                }
              >
                <option value="histogram" disabled={!measureFields.length}>
                  Histogram
                </option>
                <option value="category">Category count</option>
              </select>
            </ActionTooltip>
          </>
        )}
        <Label>
          {!settings.forceString && measureFields.includes(settings.field)
            ? "Numeric field"
            : "Group by"}
        </Label>
        <FieldSelector
          label=""
          placeholder="Chart field"
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
          <option value="average" disabled={!measureFields.length || stacked}>
            Average
          </option>
        </select>

        {(settings.seriesField ||
          settings.forceString ||
          !measureFields.includes(settings.field)) &&
          orderControl}
        {seriesControl}
        {settings.colorScaleId && (
          <div className="col-start-2">
            <ColorScaleControl scaleId={settings.colorScaleId} />
          </div>
        )}
        {!settings.seriesField &&
          !settings.forceString &&
          measureFields.includes(settings.field) && (
            <>
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
            </>
          )}
        {!settings.seriesField && (
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
        )}
      </div>
      {settings.seriesField && (
        <p className="text-xs text-muted-foreground">
          Group values are categories. Select a bar to filter its category and
          series.
        </p>
      )}
    </div>
  );
}
