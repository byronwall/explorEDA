import { isAdditiveSpec } from "@/lib/aggregates";
import { ValueDisplayControls } from "../ValueDisplayControls";
import { FieldSelector } from "@/components/FieldSelector";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ActionTooltip } from "@/components/ui/tooltip";
import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { BarChartSettings } from "./definition";
import { ONCE_PER_HELP, type AggregateAggregation } from "@/lib/aggregates";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useState } from "react";
import { useMeasureFields } from "../aggregateFields";
import { ColorScaleControl } from "@/components/colorScales/ColorScaleControl";
import {
  HistogramSettingsSection,
  SpecSettingsSection,
} from "./HistogramSettings";

export function BarChartSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<BarChartSettings>) {
  const { getOrCreateScaleForField } = useColorScales();
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const aggregate = useDataLayer((state) =>
    settings.aggregateId ? state.getAggregate(settings.aggregateId) : undefined
  );
  const additive = !aggregate || isAdditiveSpec(aggregate);
  const addAggregate = useDataLayer((state) => state.addAggregate);
  const updateAggregate = useDataLayer((state) => state.updateAggregate);
  const {
    fieldNames,
    measureFields,
    defaultMeasure,
    defaultDenominator,
    aggregateName,
  } = useMeasureFields(aggregate?.measureField);
  // Series bars and engineering histograms keep their own value display.
  const valueControls = !settings.seriesField && (
    <ValueDisplayControls
      id="bar-value"
      settings={settings}
      shareable={additive && !settings.histogram}
      onChange={(updates) =>
        onSettingsChange({ ...settings, ...updates, yAxisLabel: "" })
      }
    />
  );
  const [error, setError] = useState<string>();
  const stacked = Boolean(
    settings.seriesField &&
      settings.seriesLayout &&
      settings.seriesLayout !== "grouped"
  );
  // A series makes the field a category, so a histogram splits into panels
  // instead and keeps its bins.
  const histogramMode =
    !aggregate &&
    !settings.seriesField &&
    !settings.forceString &&
    measureFields.includes(settings.field);
  const groupLabel = getFieldLabel(aggregate?.groupField ?? settings.field);
  const seriesControl = histogramMode ? (
    <>
      <Label>Split by</Label>
      <ActionTooltip content="A histogram splits into one panel per value, so each keeps its bins">
        <div className="min-w-0">
          <FieldSelector
            label=""
            placeholder="Panel field"
            value={settings.facet?.enabled ? settings.facet.rowVariable : ""}
            allowClear
            fields={fieldNames.filter((field) => field !== settings.field)}
            onChange={(field) =>
              onSettingsChange({
                ...settings,
                facet: field
                  ? {
                      enabled: true,
                      type: "wrap",
                      rowVariable: field,
                      columnCount: 2,
                    }
                  : { ...settings.facet, enabled: false },
              })
            }
          />
        </div>
      </ActionTooltip>
    </>
  ) : (
    <>
      <Label>Split by</Label>
      <ActionTooltip
        content={`Adds a bar for each value of this field inside each ${groupLabel}, colored by it`}
      >
        <div className="min-w-0">
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
                colorScaleId: field
                  ? getOrCreateScaleForField(field)
                  : undefined,
                filters: settings.filters.filter(
                  (filter) => filter.field !== settings.seriesField
                ),
              })
            }
          />
        </div>
      </ActionTooltip>
      {settings.seriesField && (
        <>
          <Label htmlFor="bar-series-layout">Display</Label>
          <ActionTooltip
            content={`Grouped puts series side by side. Stacked adds them up. 100% shows each series as a share of its ${groupLabel} total.`}
          >
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
              <option value="stacked" disabled={!additive}>
                Stacked
              </option>
              <option value="percent" disabled={!additive}>
                100% within each {groupLabel}
              </option>
            </select>
          </ActionTooltip>
          <p className="col-span-2 text-xs text-muted-foreground">
            {!additive
              ? "Choose count or sum to stack series. Compare the bars side by side."
              : settings.seriesLayout === "percent"
                ? "Each category totals 100%. Shares use its nonnegative series totals after other filters."
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
      <ActionTooltip content="Data order keeps categories in the order rows first show them. A to Z sorts by label, with numbers in numeric order. Largest first sorts by each bar's value over all rows; binned bars keep their numeric order.">
        <select
          id="bar-category-order"
          className="h-9 rounded-md border-input bg-background px-2 text-sm"
          value={settings.categoryOrder ?? "data"}
          onChange={(event) =>
            onSettingsChange({
              ...settings,
              categoryOrder: event.target.value as "data" | "label" | "value",
            })
          }
        >
          <option value="data">Data order</option>
          <option value="label">A to Z</option>
          <option value="value">Largest first</option>
        </select>
      </ActionTooltip>
    </>
  );

  const createAggregate = (choice: AggregateAggregation | "rate") => {
    const aggregation = choice === "rate" ? "sum" : choice;
    const measureField = defaultMeasure;
    const denominatorField =
      choice === "rate" ? defaultDenominator(measureField) : undefined;
    if (aggregation !== "count" && !measureField) {
      setError("Sum, average, and rate need a numeric measure field.");
      return;
    }
    try {
      const aggregate = addAggregate({
        name: aggregateName(
          aggregation,
          settings.field,
          measureField,
          undefined,
          denominatorField
        ),
        groupField: settings.field,
        aggregation,
        ...(aggregation === "count" ? {} : { measureField }),
        ...(denominatorField ? { denominatorField } : {}),
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
        const name = aggregateName(
          next.aggregation,
          next.groupField,
          next.measureField,
          next.entityField,
          next.denominatorField
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
          next.measureField !== aggregate.measureField ||
          next.denominatorField !== aggregate.denominatorField
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
          <ActionTooltip content="What each bar measures. Rate divides the sum of one field by the sum of another in each group, such as completions ÷ attempts; it never averages row ratios.">
            <select
              id="bar-operation"
              className="h-9 rounded-md border-input bg-background px-2 text-sm"
              value={
                aggregate.denominatorField ? "rate" : aggregate.aggregation
              }
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
                const value = event.target.value;
                const measureField = aggregate.measureField ?? defaultMeasure;
                updateDefinition({
                  aggregation: (value === "rate"
                    ? "sum"
                    : value) as typeof aggregate.aggregation,
                  ...(value !== "count" ? { measureField } : {}),
                  denominatorField:
                    value === "rate"
                      ? defaultDenominator(measureField)
                      : undefined,
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
              <option
                value="average"
                disabled={!measureFields.length || stacked}
              >
                Average
              </option>
              <option value="rate" disabled={!measureFields.length || stacked}>
                Rate (sum ÷ sum)
              </option>
            </select>
          </ActionTooltip>

          {aggregate.aggregation !== "count" && (
            <>
              <Label>{aggregate.denominatorField ? "Sum of" : "Measure"}</Label>
              <FieldSelector
                label=""
                placeholder="Measure"
                value={aggregate.measureField ?? ""}
                fields={measureFields}
                related="number"
                onChange={(value) => updateDefinition({ measureField: value })}
              />
            </>
          )}
          {aggregate.denominatorField && (
            <>
              <Label>Divided by</Label>
              <FieldSelector
                label=""
                placeholder="Denominator"
                value={aggregate.denominatorField}
                fields={measureFields}
                related="number"
                onChange={(value) =>
                  updateDefinition({ denominatorField: value })
                }
              />
            </>
          )}
          {valueControls}
          <Label>Once per</Label>
          <ActionTooltip content={ONCE_PER_HELP}>
            <FieldSelector
              label=""
              placeholder="Every row counts"
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
            <ActionTooltip content="Histogram groups a numeric field into intervals. Category count gives each distinct value its own bar. Operation sets what each bar measures.">
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
                        ? defaultMeasure!
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
          onChange={(value) =>
            onSettingsChange({
              ...settings,
              field: value,
              // Bins, limits, and a selection are in the old field's units.
              ...(settings.histogram && value !== settings.field
                ? {
                    histogram: undefined,
                    filters: settings.filters.filter(
                      (filter) => filter.field !== settings.field
                    ),
                    xAxis: { ...settings.xAxis, limits: undefined },
                  }
                : {}),
            })
          }
        />

        <Label htmlFor="bar-operation">Operation</Label>
        <ActionTooltip content="What each bar measures: its number of rows, the sum or average of a numeric field, or a rate that divides one sum by another">
          <select
            id="bar-operation"
            className="h-9 rounded-md border-input bg-background px-2 text-sm"
            defaultValue="category"
            onChange={(event) => {
              if (event.target.value !== "category") {
                createAggregate(
                  event.target.value as AggregateAggregation | "rate"
                );
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
            <option value="rate" disabled={!measureFields.length || stacked}>
              Rate (sum ÷ sum)
            </option>
          </select>
        </ActionTooltip>
        {valueControls}

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
              <ActionTooltip content="Gives each category its own color from a shared scale. Split by adds bars per value instead.">
                <Label htmlFor="colorField">Use as color field</Label>
              </ActionTooltip>
            </div>
          </div>
        )}
      </div>
      {histogramMode && settings.facet?.enabled && (
        <p className="text-xs text-muted-foreground">
          Each value of {getFieldLabel(settings.facet.rowVariable)} gets its own
          histogram panel on the grid.
        </p>
      )}
      {settings.seriesField && (
        <p className="text-xs text-muted-foreground">
          Group values are categories. Select a bar to filter its category and
          series.
        </p>
      )}
      {!settings.seriesField &&
        !settings.forceString &&
        measureFields.includes(settings.field) && (
          <>
            <HistogramSettingsSection
              settings={settings}
              onSettingsChange={onSettingsChange}
            />
            <SpecSettingsSection
              settings={settings}
              onSettingsChange={onSettingsChange}
            />
          </>
        )}
    </div>
  );
}
