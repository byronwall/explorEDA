import { useState } from "react";
import { getChartDefinition } from "@/charts/registry";
import {
  getChartFields,
  getChartTitle,
} from "@/components/charts/chartAccessibility";
import type { AggregateSpec } from "@/lib/aggregates";
import type { CalculationDefinition } from "@/lib/calculations/CalculationState";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import type { ColorScaleType } from "@/types/ColorScaleTypes";

const OMITTED = new Set(["id", "type", "title", "layout", "filters"]);

function label(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function referencedFields(
  chart: ChartSettings,
  aggregate: AggregateSpec | undefined,
  availableFields: string[]
) {
  const fields =
    chart.type === "summary" ? [...availableFields] : getChartFields(chart);
  if (chart.facet.enabled) {
    fields.push(chart.facet.rowVariable);
    if (chart.facet.type === "grid") fields.push(chart.facet.columnVariable);
  }
  fields.push(...chart.filters.map((filter) => filter.field));
  if (aggregate)
    fields.push(aggregate.groupField, aggregate.measureField ?? "");
  return [...new Set(fields.filter(Boolean))];
}

function Value({ value }: { value: unknown }) {
  if (value === undefined || value === null || value === "") {
    return <span className="text-muted-foreground">None</span>;
  }
  if (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return <span className="break-words">{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0)
      return <span className="text-muted-foreground">None</span>;
    return (
      <ul className="list-disc space-y-1 pl-4">
        {value.map((item, index) => (
          <li key={index}>
            <Value value={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (value instanceof Map) {
    return <Value value={Array.from(value.entries())} />;
  }
  if (typeof value === "object") {
    return (
      <dl className="grid gap-2">
        {Object.entries(value).map(([key, item]) => (
          <div key={key} className="grid gap-0.5">
            <dt className="text-muted-foreground">{label(key)}</dt>
            <dd>
              <Value value={item} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  return <span>{String(value)}</span>;
}

function Reference({ label, value }: { label: string; value: unknown }) {
  return (
    <details className="rounded-md border border-border px-3 py-2">
      <summary className="cursor-pointer font-medium">{label}</summary>
      {value === undefined ? (
        <p className="mt-2 text-muted-foreground">
          This chart references a definition that is not available.
        </p>
      ) : (
        <div className="mt-2 text-sm">
          <Value value={value} />
        </div>
      )}
    </details>
  );
}

export function ChartSpecPanel() {
  const charts = useDataLayer((state) => state.charts);
  const calculations = useDataLayer((state) => state.calculations);
  const colorScales = useDataLayer((state) => state.colorScales);
  const aggregates = useDataLayer((state) => state.aggregates);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const [selectedId, setSelectedId] = useState<string>();
  const selected = charts.find((chart) => chart.id === selectedId) ?? charts[0];

  return (
    <div className="grid h-full min-h-0 grid-cols-1 divide-y divide-border md:grid-cols-[minmax(10rem,0.8fr)_minmax(0,1.2fr)] md:divide-x md:divide-y-0">
      <section aria-label="Charts" className="min-h-0 overflow-auto p-3">
        <h2 className="mb-2 text-sm font-semibold">Charts ({charts.length})</h2>
        {charts.length ? (
          <ul className="grid gap-1">
            {charts.map((chart) => (
              <li key={chart.id}>
                <button
                  type="button"
                  className="w-full rounded-md border border-border px-3 py-2 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-current={selected?.id === chart.id ? "true" : undefined}
                  onClick={() => setSelectedId(chart.id)}
                >
                  <span className="block truncate font-medium">
                    {getChartTitle(chart, getFieldLabel)}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {getChartDefinition(chart.type).name} · x {chart.layout.x},
                    y {chart.layout.y}, {chart.layout.w} × {chart.layout.h}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            There are no charts in this workspace.
          </p>
        )}
      </section>

      {selected ? (
        <ChartDetails
          key={selected.id}
          chart={selected}
          getFieldLabel={getFieldLabel}
          calculations={calculations}
          colorScales={colorScales}
          aggregates={aggregates}
          availableFields={getColumnNames()}
        />
      ) : (
        <section aria-label="Chart details" className="p-4" />
      )}
    </div>
  );
}

function ChartDetails({
  chart,
  getFieldLabel,
  calculations,
  colorScales,
  aggregates,
  availableFields,
}: {
  chart: ChartSettings;
  getFieldLabel: (field: string) => string;
  calculations: CalculationDefinition[];
  colorScales: ColorScaleType[];
  aggregates: AggregateSpec[];
  availableFields: string[];
}) {
  const aggregateId = "aggregateId" in chart ? chart.aggregateId : undefined;
  const aggregate = aggregates.find((item) => item.id === aggregateId);
  const settingFields = referencedFields(chart, aggregate, availableFields);
  const settings = Object.fromEntries(
    Object.entries(chart).filter(([key]) => !OMITTED.has(key))
  );
  const calculationByName = new Map(
    calculations.map((item) => [item.resultColumnName, item])
  );
  const referencedCalculationNames = new Set<string>();
  const addCalculation = (name: string) => {
    const calculation = calculationByName.get(name);
    if (!calculation || referencedCalculationNames.has(name)) return;
    referencedCalculationNames.add(name);
    calculation.expression.dependencies.forEach(addCalculation);
  };
  settingFields.forEach(addCalculation);
  const referencedCalculations = [...referencedCalculationNames].map(
    (name) => calculationByName.get(name)!
  );
  const missingFields = settingFields.filter(
    (field) =>
      field !== "__ID" &&
      !availableFields.includes(field) &&
      !calculationByName.has(field)
  );
  const scaleIds = new Set<string>();
  if (chart.type === "color-legend" && chart.fields.length > 1) {
    chart.fields.forEach((field) => {
      const scale = colorScales.find((item) => item.sourceField === field);
      if (scale) scaleIds.add(scale.id);
    });
  } else if (chart.colorScaleId) {
    scaleIds.add(chart.colorScaleId);
  } else if (chart.type === "color-legend") {
    const scale = colorScales.find(
      (item) => item.sourceField === chart.fields[0]
    );
    if (scale) scaleIds.add(scale.id);
  }
  const referencedScales = [...scaleIds].map((id) =>
    colorScales.find((scale) => scale.id === id)
  );

  return (
    <section aria-label="Chart details" className="min-h-0 overflow-auto p-4">
      <h2 className="text-base font-semibold">
        {getChartTitle(chart, getFieldLabel)}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {getChartDefinition(chart.type).name}
      </p>
      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="font-medium">Fields</dt>
          <dd>
            {settingFields.length
              ? settingFields.map(getFieldLabel).join(", ")
              : "None"}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Layout</dt>
          <dd>
            Column {chart.layout.x}, row {chart.layout.y}; {chart.layout.w}{" "}
            columns wide, {chart.layout.h} rows high
          </dd>
        </div>
        <div>
          <dt className="font-medium">Filters</dt>
          <dd>
            <Value value={chart.filters} />
          </dd>
        </div>
        <div>
          <dt className="mb-1 font-medium">Settings</dt>
          <dd>
            <Value value={settings} />
          </dd>
        </div>
      </dl>
      {(referencedCalculations.length > 0 ||
        missingFields.length > 0 ||
        referencedScales.length > 0 ||
        aggregateId) && (
        <section
          className="mt-4 grid gap-2"
          aria-label="Referenced definitions"
        >
          <h3 className="text-sm font-semibold">Referenced definitions</h3>
          {referencedCalculations.map((calculation) => (
            <Reference
              key={calculation.resultColumnName}
              label={`Calculation: ${getFieldLabel(calculation.resultColumnName)}`}
              value={{
                expression: calculation.expression.rawInput,
                dependencies: calculation.expression.dependencies,
              }}
            />
          ))}
          {missingFields.map((field) => (
            <Reference
              key={field}
              label={`Missing field: ${field}`}
              value={undefined}
            />
          ))}
          {referencedScales.map((scale, index) => (
            <Reference
              key={scale?.id ?? `missing-${index}`}
              label={
                scale
                  ? `Color scale: ${scale.name}`
                  : `Color scale: ${chart.colorScaleId}`
              }
              value={scale}
            />
          ))}
          {aggregateId && (
            <Reference
              label={`Grouped summary: ${aggregate?.name ?? String(aggregateId)}`}
              value={aggregate}
            />
          )}
        </section>
      )}
    </section>
  );
}
