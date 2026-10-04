import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Check, ChevronRight, Copy } from "lucide-react";
import { toast } from "sonner";
import { getChartDefinition } from "@/charts/registry";
import {
  getChartFields,
  getChartTitle,
} from "@/components/charts/chartAccessibility";
import type { AggregateSpec } from "@/lib/aggregates";
import type { CalculationDefinition } from "@/lib/calculations/CalculationState";
import {
  displayRoundsValue,
  formatFieldBounds,
  formatFieldValue,
  getFieldName,
} from "@/lib/fieldSettings";
import { cn } from "@/lib/utils";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import type { ColorScaleType } from "@/types/ColorScaleTypes";
import {
  formatFilterLabel,
  isActiveFilter,
  type FieldFormatting,
} from "./ActiveFilterStatus";
import { FieldMetadata, resolveFieldProfile } from "./FieldMetadata";
import { Button } from "./ui/button";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { ActionTooltip } from "./ui/tooltip";

const OMITTED = new Set(["id", "type", "title", "layout", "filters"]);

function label(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

/** JSON for display and copy. Maps become plain objects so nothing is lost. */
function toJson(value: unknown) {
  return JSON.stringify(
    value,
    (_key, item) =>
      item instanceof Map ? Object.fromEntries(item.entries()) : item,
    2
  );
}

function placement(chart: ChartSettings) {
  const { x, y, w, h } = chart.layout;
  return `x ${x} · y ${y} · ${w} × ${h}`;
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

function isEmpty(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0) ||
    (value instanceof Map && value.size === 0)
  );
}

function None() {
  return <span className="font-sans text-muted-foreground">None</span>;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Map)
  );
}

function Value({ value }: { value: unknown }) {
  if (isEmpty(value)) return <None />;
  if (typeof value === "boolean") {
    return (
      <span className={value ? undefined : "text-muted-foreground"}>
        {String(value)}
      </span>
    );
  }
  if (typeof value === "number" || typeof value === "string") {
    return <span className="break-words tabular-nums">{String(value)}</span>;
  }
  if (value instanceof Map) {
    return <Value value={Object.fromEntries(value.entries())} />;
  }
  if (Array.isArray(value)) {
    if (value.every((item) => !isPlainObject(item) && !Array.isArray(item))) {
      return (
        <span className="break-words">{value.map(String).join(", ")}</span>
      );
    }
    return (
      <ol className="grid gap-1.5">
        {value.map((item, index) => (
          <li key={index} className="grid gap-1">
            <span className="font-sans text-[11px] text-muted-foreground">
              Item {index + 1}
            </span>
            <Value value={item} />
          </li>
        ))}
      </ol>
    );
  }
  if (isPlainObject(value)) {
    return <SettingsList value={value} nested />;
  }
  return <span>{String(value)}</span>;
}

/** Saved settings as labeled rows: names on the left, values in mono. */
function SettingsList({
  value,
  nested = false,
}: {
  value: Record<string, unknown>;
  nested?: boolean;
}) {
  const entries = Object.entries(value);
  if (!entries.length) return <None />;
  return (
    <dl
      className={cn(
        "grid text-xs",
        nested
          ? "gap-1 border-l-2 border-border pl-2.5"
          : "divide-y divide-border rounded-md border border-border bg-background"
      )}
    >
      {entries.map(([key, item]) => {
        const block = isPlainObject(item) && !isEmpty(item);
        return (
          <div
            key={key}
            className={cn(
              "grid min-w-0 gap-x-3 gap-y-1",
              nested ? "" : "px-3 py-2",
              block
                ? "grid-cols-1"
                : "grid-cols-[minmax(6rem,38%)_minmax(0,1fr)]"
            )}
          >
            <dt className="min-w-0 truncate text-muted-foreground">
              {label(key)}
            </dt>
            <dd className="min-w-0 font-mono text-foreground">
              <Value value={item} />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function SectionHeading({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-2 flex min-h-7 items-center justify-between gap-2">
      <h4 className="text-xs font-semibold text-foreground">{children}</h4>
      {aside}
    </div>
  );
}

function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "warning" | "muted";
  className?: string;
}) {
  return (
    <li
      className={cn(
        "inline-flex h-7 max-w-full min-w-0 items-center gap-1.5 rounded-md border px-2 text-xs",
        tone === "warning"
          ? "border-warning/50 bg-warning/10 text-warning"
          : "border-border bg-background",
        tone === "muted" && "text-muted-foreground",
        className
      )}
    >
      {children}
    </li>
  );
}

function CopyJsonButton({ json, name }: { json: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
      aria-label={copied ? `${name} JSON copied` : `Copy ${name} JSON`}
      tooltip="Copy this chart's saved settings, including layout and filters, as JSON"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(json);
          setCopied(true);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setCopied(false), 1600);
        } catch {
          toast.error("Could not copy the chart JSON");
        }
      }}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? "Copied" : "Copy JSON"}
    </Button>
  );
}

const VIEW_OPTIONS = [
  {
    value: "list",
    text: "List",
    tooltip: "Show settings as labeled values, without layout and filters",
  },
  {
    value: "json",
    text: "JSON",
    tooltip:
      "Show the exact saved chart object, including id, layout, and filters",
  },
] as const;

type SettingsView = (typeof VIEW_OPTIONS)[number]["value"];

/** A thumbnail of the grid with every chart, and the inspected one marked. */
function LayoutMap({
  charts,
  selectedId,
  columns,
}: {
  charts: ChartSettings[];
  selectedId: string;
  columns: number;
}) {
  const rows = Math.max(1, ...charts.map((c) => c.layout.y + c.layout.h));
  const cols = Math.max(columns, ...charts.map((c) => c.layout.x + c.layout.w));
  const rowHeight = Math.max(2, Math.min(6, 88 / rows));
  return (
    <div
      aria-hidden="true"
      className="grid w-full gap-px rounded-md border border-border bg-muted/40 p-1"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
      }}
    >
      {charts.map((chart) => (
        <span
          key={chart.id}
          className={cn(
            "rounded-[2px]",
            chart.id === selectedId
              ? "bg-primary shadow-sm"
              : "bg-muted-foreground/20"
          )}
          style={{
            gridColumn: `${chart.layout.x + 1} / span ${chart.layout.w}`,
            gridRow: `${chart.layout.y + 1} / span ${chart.layout.h}`,
          }}
        />
      ))}
    </div>
  );
}

export function ChartSpecPanel() {
  const charts = useDataLayer((state) => state.charts);
  const calculations = useDataLayer((state) => state.calculations);
  const colorScales = useDataLayer((state) => state.colorScales);
  const aggregates = useDataLayer((state) => state.aggregates);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const columnCount = useDataLayer((state) => state.gridSettings.columnCount);
  const [selectedId, setSelectedId] = useState<string>();
  const selected = charts.find((chart) => chart.id === selectedId) ?? charts[0];

  return (
    <div className="@container">
      <header className="mb-3">
        <h2 className="text-[15px] font-semibold">Chart spec</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          What each chart saves: its fields, place in the grid, filters, and
          settings. Edit a chart from its Chart details.
        </p>
      </header>
      {charts.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          There are no charts in this workspace. Add a chart to inspect its
          settings here.
        </p>
      ) : (
        <div className="grid gap-3 @xl:grid-cols-[minmax(11rem,15rem)_minmax(0,1fr)] @xl:items-start">
          <nav
            aria-label="Charts"
            className="min-w-0 @xl:sticky @xl:top-0 @xl:max-h-[calc(100vh-10rem)] @xl:overflow-y-auto"
          >
            <h3 className="mb-2 flex items-baseline gap-1.5 text-xs font-semibold">
              Charts
              <span className="font-normal text-muted-foreground tabular-nums">
                {charts.length}
              </span>
            </h3>
            <ul className="gap-1.5 @max-xl:-mx-0.5 @max-xl:flex @max-xl:snap-x @max-xl:overflow-x-auto @max-xl:px-0.5 @max-xl:pb-1 @xl:grid">
              {charts.map((chart) => {
                const definition = getChartDefinition(chart.type);
                const Icon = definition.icon;
                const current = selected?.id === chart.id;
                return (
                  <li
                    key={chart.id}
                    className="@max-xl:w-56 @max-xl:shrink-0 @max-xl:snap-start"
                  >
                    <button
                      type="button"
                      className={cn(
                        "flex w-full min-w-0 items-center gap-2.5 rounded-md border px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        current
                          ? "border-primary/50 bg-primary/5"
                          : "border-transparent hover:bg-accent"
                      )}
                      aria-current={current ? "true" : undefined}
                      onClick={() => setSelectedId(chart.id)}
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-md border",
                          current
                            ? "border-primary/30 bg-background text-primary"
                            : "border-border bg-muted/50 text-muted-foreground"
                        )}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">
                          {getChartTitle(chart, getFieldLabel)}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {definition.name}
                          <span aria-hidden="true"> · </span>
                          <span className="sr-only">, </span>
                          <span className="font-mono">{placement(chart)}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {selected && (
            <ChartDetails
              key={selected.id}
              chart={selected}
              charts={charts}
              columnCount={columnCount}
              getFieldLabel={getFieldLabel}
              calculations={calculations}
              colorScales={colorScales}
              aggregates={aggregates}
              availableFields={getColumnNames()}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ChartDetails({
  chart,
  charts,
  columnCount,
  getFieldLabel,
  calculations,
  colorScales,
  aggregates,
  availableFields,
}: {
  chart: ChartSettings;
  charts: ChartSettings[];
  columnCount: number;
  getFieldLabel: (field: string) => string;
  calculations: CalculationDefinition[];
  colorScales: ColorScaleType[];
  aggregates: AggregateSpec[];
  availableFields: string[];
}) {
  const [view, setView] = useState<SettingsView>("list");
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const definition = getChartDefinition(chart.type);
  const Icon = definition.icon;
  const title = getChartTitle(chart, getFieldLabel);

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
  const isMissing = (field: string) =>
    field !== "__ID" &&
    !availableFields.includes(field) &&
    !calculationByName.has(field);
  const missingFields = settingFields.filter(isMissing);
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
  const referenceCount =
    referencedCalculations.length +
    missingFields.length +
    referencedScales.length +
    (aggregateId ? 1 : 0);

  const formatting: FieldFormatting = {
    name: (field) => getFieldName(field, fieldSettings[field]),
    bounds: (field, min, max) =>
      formatFieldBounds(field, min, max, fieldSettings[field]),
    value: (field, value) =>
      formatFieldValue(field, value, fieldSettings[field]),
    rounds: (field, value) => displayRoundsValue(value, fieldSettings[field]),
  };
  const { x, y, w, h } = chart.layout;

  return (
    <section
      aria-label="Chart details"
      className="min-w-0 overflow-hidden rounded-lg border border-border bg-card"
    >
      <header className="flex items-start gap-3 border-b border-border px-4 py-3">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border border-border bg-muted/50 text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-semibold leading-snug">
            {title}
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span>{definition.name}</span>
            <span aria-hidden="true">·</span>
            <code className="font-mono text-[11px]">{chart.type}</code>
          </p>
        </div>
      </header>

      <div className="grid gap-5 px-4 py-4">
        <section aria-label="Layout" className="min-w-0">
          <SectionHeading>Layout</SectionHeading>
          <div className="grid items-center gap-3 @md:grid-cols-[minmax(0,1fr)_auto]">
            <LayoutMap
              charts={charts}
              selectedId={chart.id}
              columns={columnCount}
            />
            <dl className="grid grid-cols-4 gap-1.5 text-center @md:w-56">
              {(
                [
                  ["x", x, "Column"],
                  ["y", y, "Row"],
                  ["w", w, "Width"],
                  ["h", h, "Height"],
                ] as const
              ).map(([key, number, name]) => (
                <div
                  key={key}
                  className="rounded-md border border-border bg-background px-1 py-1.5"
                >
                  <dt className="text-[10px] text-muted-foreground">{name}</dt>
                  <dd className="font-mono text-sm tabular-nums">{number}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="sr-only">
            Column {x}, row {y}; {w} columns wide, {h} rows high
          </p>
        </section>

        <section aria-label="Fields" className="min-w-0">
          <SectionHeading>
            Fields{" "}
            <span className="font-normal text-muted-foreground tabular-nums">
              {settingFields.length}
            </span>
          </SectionHeading>
          {settingFields.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {settingFields.map((field) =>
                isMissing(field) ? (
                  <Chip key={field} tone="warning">
                    <AlertTriangle
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="truncate font-medium">{field}</span>
                    <span className="sr-only">(missing)</span>
                  </Chip>
                ) : (
                  <Chip key={field}>
                    <FieldMetadata
                      compact
                      profile={resolveFieldProfile(
                        field,
                        fieldProfiles,
                        getColumnData
                      )}
                      label={getFieldLabel(field)}
                    />
                    {calculationByName.has(field) && (
                      <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">
                        calc
                      </span>
                    )}
                  </Chip>
                )
              )}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              This chart uses no fields.
            </p>
          )}
        </section>

        <section aria-label="Filters" className="min-w-0">
          <SectionHeading>
            Filters{" "}
            <span className="font-normal text-muted-foreground tabular-nums">
              {chart.filters.length}
            </span>
          </SectionHeading>
          {chart.filters.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {chart.filters.map((filter, index) => {
                const active = isActiveFilter(filter);
                return (
                  <Chip key={index} tone={active ? "neutral" : "muted"}>
                    <span className="truncate">
                      {formatFilterLabel(filter, formatting)}
                    </span>
                    {!active && <span className="shrink-0">· empty</span>}
                  </Chip>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              No filters. Brush or click this chart to add one.
            </p>
          )}
        </section>

        <section aria-label="Settings" className="min-w-0">
          <SectionHeading
            aside={
              <div className="flex items-center gap-1">
                <ToggleGroup
                  type="single"
                  size="sm"
                  variant="outline"
                  value={view}
                  onValueChange={(next) =>
                    next && setView(next as SettingsView)
                  }
                  aria-label="Settings view"
                >
                  {VIEW_OPTIONS.map((option) => (
                    <ActionTooltip
                      key={option.value}
                      content={option.tooltip}
                      side="bottom"
                    >
                      <span className="inline-flex">
                        <ToggleGroupItem
                          value={option.value}
                          aria-label={`${option.text} view`}
                          className="h-7 px-2.5 text-[11px]"
                        >
                          {option.text}
                        </ToggleGroupItem>
                      </span>
                    </ActionTooltip>
                  ))}
                </ToggleGroup>
                <CopyJsonButton json={toJson(chart)} name={title} />
              </div>
            }
          >
            Settings
          </SectionHeading>
          {view === "list" ? (
            <SettingsList value={settings} />
          ) : (
            <pre
              aria-label={`${title} JSON`}
              tabIndex={0}
              className="max-h-[28rem] overflow-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <code>{toJson(chart)}</code>
            </pre>
          )}
        </section>

        {referenceCount > 0 && (
          <section aria-label="Referenced definitions" className="min-w-0">
            <SectionHeading>
              Referenced definitions{" "}
              <span className="font-normal text-muted-foreground tabular-nums">
                {referenceCount}
              </span>
            </SectionHeading>
            <div className="grid gap-1.5">
              {referencedCalculations.map((calculation) => (
                <Reference
                  key={calculation.resultColumnName}
                  kind="Calculation"
                  name={getFieldLabel(calculation.resultColumnName)}
                >
                  <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 px-2.5 py-2 font-mono text-xs">
                    <code>{calculation.expression.rawInput}</code>
                  </pre>
                  <p className="mb-1 mt-2.5 text-[11px] text-muted-foreground">
                    Dependencies
                  </p>
                  {calculation.expression.dependencies.length ? (
                    <ul className="flex flex-wrap gap-1">
                      {calculation.expression.dependencies.map((field) => (
                        <Chip key={field} className="h-6 font-mono">
                          {getFieldLabel(field)}
                        </Chip>
                      ))}
                    </ul>
                  ) : (
                    <None />
                  )}
                </Reference>
              ))}
              {missingFields.map((field) => (
                <Reference key={field} kind="Missing field" name={field} />
              ))}
              {referencedScales.map((scale, index) => (
                <Reference
                  key={scale?.id ?? `missing-${index}`}
                  kind="Color scale"
                  name={scale ? scale.name : String(chart.colorScaleId)}
                  missing={!scale}
                >
                  {scale && <ScaleDetails scale={scale} />}
                </Reference>
              ))}
              {aggregateId && (
                <Reference
                  kind="Grouped summary"
                  name={aggregate?.name ?? String(aggregateId)}
                  missing={!aggregate}
                >
                  {aggregate && (
                    <SettingsList
                      value={Object.fromEntries(
                        Object.entries(aggregate).filter(
                          ([key]) => key !== "id"
                        )
                      )}
                    />
                  )}
                </Reference>
              )}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

/** Drops options a scale leaves at their defaults. */
const definedOnly = (value: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined)
  );

function ScaleDetails({ scale }: { scale: ColorScaleType }) {
  if (scale.type === "numerical") {
    return (
      <SettingsList
        value={definedOnly({
          type: scale.type,
          sourceField: scale.sourceField,
          palette: scale.palette,
          min: scale.min,
          max: scale.max,
          midpoint: scale.midpoint,
          reverse: scale.reverse,
          transform: scale.transform,
          steps: scale.steps,
        })}
      />
    );
  }
  const entries = Array.from(scale.mapping.entries());
  return (
    <div className="grid gap-2">
      <SettingsList
        value={definedOnly({
          type: scale.type,
          sourceField: scale.sourceField,
          palette: scale.paletteId,
          order: scale.order,
          overflow: scale.overflow,
        })}
      />
      {entries.length > 0 && (
        <ul className="flex flex-wrap gap-1">
          {entries.map(([value, color]) => (
            <Chip key={value} className="h-6">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full border border-border"
                style={{ background: color }}
              />
              <span className="truncate">{value}</span>
              <code className="font-mono text-[10px] text-muted-foreground">
                {color}
              </code>
            </Chip>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * A definition the chart depends on, collapsed to one line. A reference whose
 * definition no longer exists says so instead of opening empty.
 */
function Reference({
  kind,
  name,
  missing,
  children,
}: {
  kind: string;
  name: string;
  missing?: boolean;
  children?: ReactNode;
}) {
  const unavailable = missing || !children;
  return (
    <details
      className={cn(
        "group rounded-md border bg-background",
        unavailable ? "border-warning/50" : "border-border"
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-2.5 py-2 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
        />
        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
            unavailable
              ? "bg-warning/10 text-warning"
              : "bg-muted text-muted-foreground"
          )}
        >
          {kind}
          <span className="sr-only">: </span>
        </span>
        <span className="min-w-0 truncate font-medium">{name}</span>
        {unavailable && (
          <AlertTriangle
            aria-hidden="true"
            className="ml-auto size-3.5 shrink-0 text-warning"
          />
        )}
      </summary>
      <div className="border-t border-border px-2.5 py-2.5">
        {unavailable ? (
          <p className="text-xs text-muted-foreground">
            This chart references a definition that is not available.
          </p>
        ) : (
          children
        )}
      </div>
    </details>
  );
}
