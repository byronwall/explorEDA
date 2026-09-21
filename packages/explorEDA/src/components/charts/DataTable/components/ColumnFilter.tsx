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

const MAX_VALUE_FILTER_OPTIONS = 10;

interface ColumnFilterProps {
  columnId: string;
  columnLabel: string;
  profile: FieldProfile;
  filter?: Filter;
  onChange: (columnId: string, filter?: Filter) => void;
  onClear: () => void;
  local?: boolean;
}

export function ColumnFilter({
  columnId,
  columnLabel,
  profile,
  filter,
  onChange,
  onClear,
  local = false,
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
    profile.dataType === "boolean" ||
    (profile.dataType === "categorical" &&
      profile.uniqueCount <= MAX_VALUE_FILTER_OPTIONS);
  const updateText = (next: TextFilter) =>
    onChange(columnId, next.value === "" ? undefined : next);

  return (
    <div
      className="grid w-64 max-w-full gap-3 text-sm"
      onClick={(event) => event.stopPropagation()}
    >
      <div>
        <h3 className="font-semibold">Filter {columnLabel}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {local ? "Filters only this table." : "Filters all charts and rows."}{" "}
          Changes apply immediately.
        </p>
      </div>
      {lowCardinality ? (
        <div className="flex max-h-56 flex-col gap-2 overflow-auto py-1">
          {(profile.categories?.distribution ?? []).map(({ value }) => {
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
              Missing
            </label>
          )}
        </div>
      ) : profile.dataType === "numeric" ? (
        <div className="grid gap-3">
          <label className="grid gap-1 text-xs">
            Minimum (inclusive)
            <Input
              type="number"
              aria-label={`Minimum ${columnLabel}`}
              placeholder="Min"
              value={rangeFilter?.min ?? ""}
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
              value={rangeFilter?.max ?? ""}
              onChange={(event) =>
                updateRange("range", "max", event.target.value)
              }
              className="h-8 w-full"
            />
          </label>
        </div>
      ) : profile.dataType === "datetime" ? (
        <div className="grid gap-3">
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
        </div>
      ) : (
        <>
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
        </>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="justify-self-start"
        aria-label={`Clear filter for ${columnLabel}`}
        onClick={onClear}
      >
        <FilterX className="h-4 w-4" /> Clear filter
      </Button>
    </div>
  );
}
