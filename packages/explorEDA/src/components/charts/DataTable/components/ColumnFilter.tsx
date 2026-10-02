import {
  categoryEqual,
  categoryIncludes,
  categoryKey,
  categoryLabel,
} from "@/lib/categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FieldProfile } from "@/lib/fieldProfiles";
import type { datum } from "@/types/ChartTypes";
import type { Filter, TextFilter } from "@/types/FilterTypes";
import { FilterX } from "lucide-react";
import isEqual from "react-fast-compare";
import { Slider } from "@/components/ui/slider";
import {
  summarizeField,
  type SparkFilter,
} from "@/components/SummaryTable/components/FieldDistribution";

const MAX_VALUE_FILTER_OPTIONS = 10;

interface ColumnFilterProps {
  columnId: string;
  columnLabel: string;
  profile: FieldProfile;
  filter?: Filter;
  onChange: (columnId: string, filter?: Filter) => void;
  onClear: () => void;
  local?: boolean;
  /**
   * The field's profile over the rows this table can show. Number and date
   * fields draw it as a histogram that filters on click or drag, and number
   * fields add a range slider under it.
   */
  distribution?: FieldProfile;
  /** Formats the distribution's values like the column's cells. */
  format?: (value: unknown) => string;
  /**
   * Inside a settings panel: the field name is the group's legend, the
   * control fills the panel, and Clear shows only while a filter is set.
   */
  embedded?: boolean;
  /** Always list values to check, for charts that filter by category. */
  valuesOnly?: boolean;
}

/** A slider step that gives about 200 stops, or whole numbers for integers. */
function sliderStep(min: number, max: number) {
  if (Number.isInteger(min) && Number.isInteger(max) && max - min <= 1000) {
    return 1;
  }
  return 10 ** Math.floor(Math.log10((max - min) / 200));
}

/** A bound as typed text, without the float tail of a bin's open edge. */
const boundText = (value: number | undefined) =>
  value === undefined ? "" : String(Number(value.toPrecision(12)));

/** Rounds a slider value to its step, without floating-point tails. */
function roundToStep(value: number, step: number) {
  const digits = Math.max(0, -Math.floor(Math.log10(step)));
  return Number(value.toFixed(Math.min(100, digits)));
}

export function ColumnFilter({
  columnId,
  columnLabel,
  profile,
  filter,
  onChange,
  onClear,
  local = false,
  distribution,
  format = String,
  embedded = false,
  valuesOnly = false,
}: ColumnFilterProps) {
  const updateRange = (
    type: "range" | "date-range",
    key: "min" | "max",
    raw: string
  ) => {
    const current =
      filter?.type === type ? filter : { type, field: profile.name };
    const value = raw === "" ? undefined : type === "range" ? Number(raw) : raw;
    if (value !== undefined && type === "range" && !Number.isFinite(value)) {
      return;
    }
    const next = { ...current, [key]: value } as Filter;
    if (
      (next.type === "range" || next.type === "date-range") &&
      next.min === undefined &&
      next.max === undefined
    ) {
      onChange(columnId);
    } else {
      onChange(columnId, next);
    }
  };

  const updateValues = (value: datum, checked: boolean) => {
    const selected = filter?.type === "value" ? filter.values : [];
    const next = checked
      ? [...selected, value]
      : selected.filter((item) => !categoryEqual(item, value));
    onChange(
      columnId,
      next.length > 0
        ? { type: "value", field: profile.name, values: next }
        : undefined
    );
  };

  const textFilter: TextFilter =
    filter?.type === "text"
      ? filter
      : { type: "text", field: profile.name, operator: "contains", value: "" };
  const rangeFilter = filter?.type === "range" ? filter : undefined;
  const dateFilter = filter?.type === "date-range" ? filter : undefined;
  const lowCardinality =
    valuesOnly ||
    profile.dataType === "boolean" ||
    (profile.dataType === "categorical" &&
      profile.uniqueCount <= MAX_VALUE_FILTER_OPTIONS);
  const updateText = (next: TextFilter) =>
    onChange(columnId, next.value === "" ? undefined : next);
  // "Only missing" keeps the rows with no value, whatever the field type.
  const missingOnly =
    filter?.type === "value" &&
    filter.values.length === 1 &&
    filter.values[0] == null;
  const missingCount = `${profile.nullCount.toLocaleString()} ${
    profile.nullCount === 1 ? "row" : "rows"
  }`;

  // Checked values stay listed even when the profile has no such category.
  const listed = (profile.categories?.distribution ?? []).map(
    ({ value }) => value as datum
  );
  const valueOptions = [
    ...listed,
    ...(filter?.type === "value" ? filter.values : []).filter(
      (value) => value != null && !categoryIncludes(listed, value)
    ),
  ];
  const ranged =
    !lowCardinality &&
    (profile.dataType === "numeric" || profile.dataType === "datetime");
  // A mark filters to its rows; the same mark again clears the filter.
  const summary =
    ranged && distribution
      ? summarizeField(
          distribution,
          format,
          columnLabel,
          (spark: SparkFilter) => {
            const next = { ...spark, field: profile.name } as Filter;
            onChange(columnId, isEqual(filter, next) ? undefined : next);
          },
          filter
        )
      : undefined;
  const stats =
    profile.dataType === "numeric" ? distribution?.statistics : undefined;
  const slider =
    stats && stats.max > stats.min
      ? { ...stats, step: sliderStep(stats.min, stats.max) }
      : undefined;
  const clamp = (value: number | undefined, fallback: number) =>
    slider
      ? Math.min(slider.max, Math.max(slider.min, value ?? fallback))
      : fallback;
  const histogram = summary && (
    <div className="eda-filter-dist">
      <div className="eda-filter-dist-plot">
        {summary.graphic}
        <span className="sr-only">{summary.description}</span>
      </div>
      {slider && (
        <Slider
          className="eda-filter-slider"
          min={slider.min}
          max={slider.max}
          step={slider.step}
          minStepsBetweenThumbs={0}
          disabled={missingOnly}
          thumbLabels={[
            `Lower bound of ${columnLabel}`,
            `Upper bound of ${columnLabel}`,
          ]}
          value={[
            clamp(rangeFilter?.min, slider.min),
            clamp(rangeFilter?.max, slider.max),
          ]}
          onValueChange={([low, high]) => {
            // A thumb at the end of the track leaves that side open.
            const min =
              low === undefined || low <= slider.min
                ? undefined
                : roundToStep(low, slider.step);
            const max =
              high === undefined || high >= slider.max
                ? undefined
                : roundToStep(high, slider.step);
            onChange(
              columnId,
              min === undefined && max === undefined
                ? undefined
                : { type: "range", field: profile.name, min, max }
            );
          }}
        />
      )}
      <div className="eda-filter-dist-ends" aria-hidden="true">
        <span>{summary.low}</span>
        <span>{summary.high}</span>
      </div>
    </div>
  );

  const Group = embedded ? "fieldset" : "div";
  return (
    <Group
      className={
        embedded
          ? "eda-chart-filter-field"
          : "grid w-64 max-w-full gap-3 text-sm"
      }
      onClick={(event) => event.stopPropagation()}
    >
      {embedded ? (
        <legend>{columnLabel}</legend>
      ) : (
        <div>
          <h3 className="font-semibold">Filter {columnLabel}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {local
              ? "Filters only this table."
              : "Filters all charts and rows."}{" "}
            Changes apply immediately.
          </p>
        </div>
      )}
      {lowCardinality ? (
        <div className="flex max-h-56 flex-col gap-2 overflow-auto py-1">
          {valueOptions.map((value) => {
            const label = categoryLabel(value);
            return (
              <label
                key={categoryKey(value)}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={
                    filter?.type === "value" &&
                    categoryIncludes(filter.values, value)
                  }
                  onChange={(event) =>
                    updateValues(value, event.currentTarget.checked)
                  }
                />
                {label}
              </label>
            );
          })}
          {profile.nullCount > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={
                  filter?.type === "value" &&
                  filter.values.some((item) => item == null)
                }
                onChange={(event) =>
                  updateValues(null, event.currentTarget.checked)
                }
              />
              <span className="eda-null" aria-hidden="true">
                null
              </span>
              <span className="text-muted-foreground">
                Missing · {missingCount}
              </span>
            </label>
          )}
        </div>
      ) : profile.dataType === "numeric" ? (
        <fieldset
          className="m-0 grid min-w-0 gap-3 border-0 p-0 disabled:opacity-50"
          disabled={missingOnly}
        >
          {histogram}
          <label className="grid gap-1 text-xs">
            Minimum (inclusive)
            <Input
              type="number"
              aria-label={`Minimum ${columnLabel}`}
              placeholder="Min"
              value={boundText(rangeFilter?.min)}
              onChange={(event) =>
                updateRange("range", "min", event.target.value)
              }
              className="h-8 w-full"
            />
          </label>
          <label className="grid gap-1 text-xs">
            Maximum (inclusive)
            <Input
              type="number"
              aria-label={`Maximum ${columnLabel}`}
              placeholder="Max"
              value={boundText(rangeFilter?.max)}
              onChange={(event) =>
                updateRange("range", "max", event.target.value)
              }
              className="h-8 w-full"
            />
          </label>
        </fieldset>
      ) : profile.dataType === "datetime" ? (
        <fieldset
          className="m-0 grid min-w-0 gap-3 border-0 p-0 disabled:opacity-50"
          disabled={missingOnly}
        >
          {histogram}
          <label className="grid gap-1 text-xs">
            From (inclusive)
            <Input
              type="date"
              aria-label={`Start date ${columnLabel}`}
              value={dateFilter?.min ?? ""}
              onInput={(event) =>
                updateRange("date-range", "min", event.currentTarget.value)
              }
              className="h-8 w-full"
            />
          </label>
          <label className="grid gap-1 text-xs">
            Through (inclusive)
            <Input
              type="date"
              aria-label={`End date ${columnLabel}`}
              value={dateFilter?.max ?? ""}
              onInput={(event) =>
                updateRange("date-range", "max", event.currentTarget.value)
              }
              className="h-8 w-full"
            />
          </label>
        </fieldset>
      ) : (
        <fieldset
          className="m-0 grid min-w-0 gap-3 border-0 p-0 disabled:opacity-50"
          disabled={missingOnly}
        >
          <label className="grid gap-1 text-xs">
            Match
            <select
              aria-label={`Text operator ${columnLabel}`}
              value={textFilter.operator}
              onChange={(event) =>
                updateText({
                  ...textFilter,
                  operator: event.target.value as TextFilter["operator"],
                })
              }
              className="h-8 rounded-md border bg-transparent px-2 text-sm"
            >
              <option value="contains">Contains</option>
              <option value="equals">Equals</option>
              <option value="startsWith">Starts with</option>
              <option value="endsWith">Ends with</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs">
            Text
            <Input
              aria-label={`Filter text ${columnLabel}`}
              placeholder={`Filter ${columnLabel}...`}
              value={textFilter.value}
              onChange={(event) =>
                updateText({ ...textFilter, value: event.target.value })
              }
              className="h-8 w-full"
            />
          </label>
        </fieldset>
      )}
      {!lowCardinality && (
        <label className="flex items-center gap-2 border-t border-border pt-3 text-sm has-[:disabled]:opacity-60">
          <input
            type="checkbox"
            checked={missingOnly}
            disabled={profile.nullCount === 0 && !missingOnly}
            onChange={(event) =>
              onChange(
                columnId,
                event.currentTarget.checked
                  ? { type: "value", field: profile.name, values: [null] }
                  : undefined
              )
            }
          />
          <span>
            Only missing values{" "}
            <span className="text-muted-foreground">
              {profile.nullCount > 0 ? `· ${missingCount}` : "· none"}
            </span>
          </span>
        </label>
      )}
      {(!embedded || filter) && (
        <Button
          variant="ghost"
          size="sm"
          className="justify-self-start"
          aria-label={`Clear filter for ${columnLabel}`}
          onClick={onClear}
        >
          <FilterX className="h-4 w-4" /> Clear filter
        </Button>
      )}
      {lowCardinality && valueOptions.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Select on the chart to filter this field.
        </p>
      )}
    </Group>
  );
}
