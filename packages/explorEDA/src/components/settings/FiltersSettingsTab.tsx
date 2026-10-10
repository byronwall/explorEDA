import { useState } from "react";
import { FieldSelector } from "@/components/FieldSelector";
import { ColumnFilter } from "@/components/charts/DataTable/components/ColumnFilter";
import { resolveFieldProfile } from "@/components/FieldMetadata";
import { useFilteredFieldProfiles } from "@/hooks/useFilteredFieldProfiles";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings, datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";

/** A field a chart can filter on, and how the chart reads that filter. */
export type ChartFilterField = {
  field: string;
  /** Charts that filter by category keep only value filters. */
  valuesOnly?: boolean;
};

/**
 * The fields a chart filters on: the ones its marks select, then any other
 * field that already has a filter, so every filter on the chart is editable.
 */
export function chartFilterFields(
  settings: ChartSettings,
  aggregate?: { groupField?: string; measureField?: string }
): ChartFilterField[] {
  const own: ChartFilterField[] = (() => {
    switch (settings.type) {
      case "map":
        return settings.mode === "region"
          ? [{ field: settings.regionField ?? "" }]
          : [
              { field: settings.latitudeField },
              { field: settings.longitudeField },
            ];
      case "scatter":
        return [{ field: settings.xField }, { field: settings.yField }];
      case "line":
        return [
          { field: settings.xField },
          ...(settings.time?.splitField
            ? [{ field: settings.time.splitField, valuesOnly: true }]
            : []),
        ];
      case "bar":
        if (settings.seriesField)
          return [
            {
              field: aggregate?.groupField ?? settings.field,
              valuesOnly: true,
            },
            { field: settings.seriesField, valuesOnly: true },
          ].filter(
            (item, index, items) =>
              items.findIndex((other) => other.field === item.field) === index
          );
        return [
          {
            field:
              (aggregate
                ? (aggregate.measureField ?? aggregate.groupField)
                : settings.field) ?? "",
          },
        ];
      case "row":
        return [{ field: settings.field, valuesOnly: true }];
      case "boxplot":
        return [{ field: settings.colorField ?? "" }];
      case "pivot":
        return [...settings.rowFields, settings.columnField].map((field) => ({
          field,
          valuesOnly: true,
        }));
      case "color-legend":
        return settings.fields.map((field) => ({ field, valuesOnly: true }));
      default:
        return [];
    }
  })().filter((item) => Boolean(item.field));
  const seen = new Set(own.map((item) => item.field));
  const rest = settings.filters
    .map((filter) => filter.field)
    .filter((field) => !seen.has(field) && seen.add(field))
    .map((field) => ({ field }));
  return [...own, ...rest];
}

/** A field's filter. Several value filters on one field read as one set. */
function filterFor(filters: Filter[], field: string): Filter | undefined {
  const matches = filters.filter((filter) => filter.field === field);
  if (matches.length > 1 && matches.every((item) => item.type === "value")) {
    return {
      type: "value",
      field,
      values: matches.flatMap((item) =>
        item.type === "value" ? item.values : []
      ),
    };
  }
  return matches[0];
}

/**
 * Manual controls for every filter a chart sets on the other views. Each
 * field gets the control its type needs, with its distribution, so a filter
 * can be set, changed, or cleared without selecting on the chart.
 */
export function FiltersSettingsTab({
  settings,
  onSettingChange,
}: {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}) {
  const aggregate = useDataLayer((state) =>
    settings.type === "bar" && settings.aggregateId
      ? state.getAggregate(settings.aggregateId)
      : undefined
  );
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const fields = chartFilterFields(settings, aggregate);
  // The chart ignores its own filters, so each field keeps its full shape.
  const scoped = useFilteredFieldProfiles(
    settings,
    true,
    fields.map(({ field }) => field)
  );
  const setFilter = (field: string, filter?: Filter) =>
    onSettingChange("filters", [
      ...settings.filters.filter((item) => item.field !== field),
      ...(filter ? [filter] : []),
    ]);

  const chartRows = (
    <ChartRowsFilters settings={settings} onSettingChange={onSettingChange} />
  );

  if (fields.length === 0) {
    return (
      <div className="eda-chart-filters">
        <p className="text-xs text-muted-foreground">
          This chart sets no filters on the other views.
        </p>
        {chartRows}
      </div>
    );
  }

  return (
    <div className="eda-chart-filters">
      <p className="text-xs text-muted-foreground">
        Set the filters this chart applies to other charts, or select on the
        chart.
      </p>
      {fields.map(({ field, valuesOnly }) => {
        const profile = resolveFieldProfile(
          field,
          fieldProfiles ?? [],
          getColumnData
        );
        if (!profile) return null;
        return (
          <ColumnFilter
            key={field}
            embedded
            valuesOnly={valuesOnly}
            columnId={field}
            columnLabel={getFieldLabel(field)}
            profile={profile}
            distribution={scoped.find((item) => item.name === field)}
            format={(value) => formatFieldValue(field, value as datum)}
            filter={filterFor(settings.filters, field)}
            onChange={(_id, filter) => setFilter(field, filter)}
            onClear={() => setFilter(field)}
          />
        );
      })}
      {chartRows}
    </div>
  );
}

/**
 * Filters that limit only the rows this chart draws. They never reach other
 * charts, and clearing the workspace's filters keeps them.
 */
function ChartRowsFilters({
  settings,
  onSettingChange,
}: {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}) {
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const [adding, setAdding] = useState<string[]>([]);
  const localFilters = settings.localFilters ?? [];
  const fields = [
    ...new Set([
      ...localFilters.map((filter) => filter.field),
      ...adding.filter((field) => getColumnNames().includes(field)),
    ]),
  ];
  const setFilter = (field: string, filter?: Filter) => {
    const next = [
      ...localFilters.filter((item) => item.field !== field),
      ...(filter ? [filter] : []),
    ];
    onSettingChange("localFilters", next.length ? next : undefined);
    if (!filter) setAdding((current) => current.filter((f) => f !== field));
  };

  return (
    <section className="eda-chart-rows" aria-label="Chart rows">
      <h3 className="text-xs font-semibold">Chart rows</h3>
      <p className="-mt-1 text-xs text-muted-foreground">
        Limit the rows this chart draws. Other charts ignore these filters.
      </p>
      {fields.map((field) => {
        const profile = resolveFieldProfile(
          field,
          fieldProfiles ?? [],
          getColumnData
        );
        if (!profile) {
          return (
            <p key={field} className="text-xs text-destructive">
              {field} is not a field in this data, so the chart draws no rows.
            </p>
          );
        }
        return (
          <ColumnFilter
            key={field}
            embedded
            columnId={field}
            columnLabel={getFieldLabel(field)}
            profile={profile}
            format={(value) => formatFieldValue(field, value as datum)}
            filter={filterFor(localFilters, field)}
            onChange={(_id, filter) => setFilter(field, filter)}
            onClear={() => setFilter(field)}
          />
        );
      })}
      <FieldSelector
        label=""
        placeholder="Limit rows by a field"
        value=""
        fields={getColumnNames().filter((field) => !fields.includes(field))}
        onChange={(field) =>
          field && setAdding((current) => [...current, field])
        }
      />
    </section>
  );
}
