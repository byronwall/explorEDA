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
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
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
  const columnIsDate = useDataLayer(
    (state) =>
      state.fieldProfiles.find(
        (profile) => profile.name === settings.columnField
      )?.dataType === "datetime"
  );

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
          <Label htmlFor="heatmap-limit">Rows shown</Label>
        </ActionTooltip>
        <NumericInputEnter
          id="heatmap-limit"
          value={settings.maxCategories}
          onChange={(value) => change({ maxCategories: Math.round(value) })}
          min={2}
          max={MAX_VALUES}
          stepSmall={1}
          stepMedium={5}
          stepLarge={10}
          placeholder="Rows shown"
        />
        <ActionTooltip content="Columns shown, when it differs from rows. Binned dates keep the latest periods.">
          <Label htmlFor="heatmap-column-limit">Columns shown</Label>
        </ActionTooltip>
        <NumericInputEnter
          id="heatmap-column-limit"
          value={settings.maxColumns ?? settings.maxCategories}
          onChange={(value) => change({ maxColumns: Math.round(value) })}
          min={2}
          max={MAX_VALUES}
          stepSmall={1}
          stepMedium={5}
          stepLarge={10}
          placeholder="Columns shown"
        />

        {columnIsDate && (
          <>
            <ActionTooltip content="Groups the column dates into calendar periods, with a column for every period from the first to the last. A cell selects its rows by date range.">
              <Label htmlFor="heatmap-interval">Column dates</Label>
            </ActionTooltip>
            <select
              id="heatmap-interval"
              className="h-9 rounded-md border-input bg-background px-2 text-sm"
              value={settings.columnInterval ?? ""}
              onChange={(event) =>
                onSettingsChange({
                  ...settings,
                  columnInterval: (event.target.value ||
                    undefined) as HeatmapSettings["columnInterval"],
                  // A value selection and a date range don't mix.
                  filters: settings.filters.filter(
                    (filter) => filter.field !== settings.columnField
                  ),
                })
              }
            >
              <option value="">Each value</option>
              <option value="year">By year</option>
              <option value="month">By month</option>
              <option value="week">By week</option>
              <option value="day">By day</option>
            </select>
          </>
        )}

        <OrderToggle
          label="Order"
          value={settings.sortBy}
          onChange={(sortBy) => change({ sortBy })}
        />
        {!settings.columnInterval && (
          <OrderToggle
            label="Column order"
            value={settings.columnSortBy ?? settings.sortBy}
            onChange={(columnSortBy) => change({ columnSortBy })}
          />
        )}

        <ActionTooltip content="Fixed ends keep each value's color while filters change what shows. Values past an end take the end's color. A domain that crosses zero diverges around it. Empty uses the shown cells' range.">
          <Label>Color ends</Label>
        </ActionTooltip>
        <div className="grid grid-cols-2 gap-2">
          <OptionalNumber
            label="Color low end"
            placeholder="Auto low"
            value={settings.colorDomain?.min}
            onCommit={(min) =>
              change({
                colorDomain: cleanDomain({ ...settings.colorDomain, min }),
              })
            }
          />
          <OptionalNumber
            label="Color high end"
            placeholder="Auto high"
            value={settings.colorDomain?.max}
            onCommit={(max) =>
              change({
                colorDomain: cleanDomain({ ...settings.colorDomain, max }),
              })
            }
          />
        </div>
        <div className="col-start-2">
          <ActionTooltip content="Spreads small values apart: color follows the square root of the value, signed around zero. Zero stays the lowest color.">
            <div className="flex items-center space-x-2">
              <Switch
                id="heatmap-sqrt"
                checked={settings.colorDomain?.transform === "sqrt"}
                onCheckedChange={(checked) =>
                  change({
                    colorDomain: cleanDomain({
                      ...settings.colorDomain,
                      transform: checked ? "sqrt" : undefined,
                    }),
                  })
                }
              />
              <Label htmlFor="heatmap-sqrt">Square-root color</Label>
            </div>
          </ActionTooltip>
        </div>

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

/** The most values an axis can show. */
const MAX_VALUES = 200;

/** Drops an empty color domain, so "all automatic" saves as absent. */
function cleanDomain(
  domain: NonNullable<HeatmapSettings["colorDomain"]>
): HeatmapSettings["colorDomain"] {
  const entries = Object.entries(domain).filter(
    ([, value]) => value !== undefined
  );
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function OrderToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: HeatmapSettings["sortBy"];
  onChange: (value: HeatmapSettings["sortBy"]) => void;
}) {
  return (
    <>
      <Label>{label}</Label>
      <ToggleGroup
        type="single"
        size="sm"
        variant="outline"
        value={value}
        onValueChange={(next) =>
          next && onChange(next as HeatmapSettings["sortBy"])
        }
        aria-label={label}
        className="justify-start"
      >
        {(
          [
            ["count", "Most rows", "Put the values with the most rows first."],
            [
              "label",
              "A to Z",
              "Sort by value labels, numbers in numeric order.",
            ],
            ["data", "Data", "Keep the order values first appear in the data."],
          ] as const
        ).map(([item, text, help]) => (
          <ActionTooltip key={item} content={help}>
            <span className="inline-flex">
              <ToggleGroupItem value={item} className="px-2">
                {text}
              </ToggleGroupItem>
            </span>
          </ActionTooltip>
        ))}
      </ToggleGroup>
    </>
  );
}

/** A number that may be left blank; it commits on blur or Enter. */
function OptionalNumber({
  label,
  placeholder,
  value,
  onCommit,
}: {
  label: string;
  placeholder: string;
  value: number | undefined;
  onCommit: (value: number | undefined) => void;
}) {
  const [text, setText] = useState(value?.toString() ?? "");
  useEffect(() => setText(value?.toString() ?? ""), [value]);
  const commit = () => {
    const next = text.trim() === "" ? undefined : finiteNumber(text);
    if (text.trim() !== "" && next === undefined) {
      setText(value?.toString() ?? "");
      return;
    }
    if (next !== value) onCommit(next);
  };
  return (
    <Input
      type="number"
      aria-label={label}
      placeholder={placeholder}
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit();
      }}
    />
  );
}
