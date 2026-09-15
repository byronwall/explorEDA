import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FieldProfile } from "@/lib/fieldProfiles";
import type { datum } from "@/types/ChartTypes";
import type { Filter, TextFilter } from "@/types/FilterTypes";
import { X } from "lucide-react";

const MAX_VALUE_FILTER_OPTIONS = 10;

interface ColumnFilterProps {
  columnId: string;
  columnLabel: string;
  profile: FieldProfile;
  filter?: Filter;
  onChange: (columnId: string, filter?: Filter) => void;
  onClear: () => void;
}

function optionValue(value: string, profile: FieldProfile): datum {
  return profile.dataType === "boolean" ? value === "true" : value;
}

export function ColumnFilter({
  columnId,
  columnLabel,
  profile,
  filter,
  onChange,
  onClear,
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
      : selected.filter(
          (item) => !(item == null && value == null) && item !== value
        );
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
      className="flex items-start gap-2"
      onClick={(event) => event.stopPropagation()}
    >
      {lowCardinality ? (
        <div className="flex flex-col gap-1 p-1">
          {Object.entries(profile.categories?.distribution ?? {}).map(
            ([label]) => {
              const value = optionValue(label, profile);
              return (
                <label key={label} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      filter?.type === "value" &&
                      filter.values.some((item) => item === value)
                    }
                    onChange={(event) =>
                      updateValues(value, event.currentTarget.checked)
                    }
                  />
                  {label}
                </label>
              );
            }
          )}
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
        <div className="flex gap-2">
          <Input
            type="number"
            aria-label={`Minimum ${columnLabel}`}
            placeholder="Min"
            value={rangeFilter?.min ?? ""}
            onChange={(event) =>
              updateRange("range", "min", event.target.value)
            }
            className="h-8 w-[100px]"
          />
          <Input
            type="number"
            aria-label={`Maximum ${columnLabel}`}
            placeholder="Max"
            value={rangeFilter?.max ?? ""}
            onChange={(event) =>
              updateRange("range", "max", event.target.value)
            }
            className="h-8 w-[100px]"
          />
        </div>
      ) : profile.dataType === "datetime" ? (
        <div className="flex gap-2">
          <Input
            type="date"
            aria-label={`Start date ${columnLabel}`}
            value={dateFilter?.min ?? ""}
            onInput={(event) =>
              updateRange("date-range", "min", event.currentTarget.value)
            }
            className="h-8 w-[140px]"
          />
          <Input
            type="date"
            aria-label={`End date ${columnLabel}`}
            value={dateFilter?.max ?? ""}
            onInput={(event) =>
              updateRange("date-range", "max", event.currentTarget.value)
            }
            className="h-8 w-[140px]"
          />
        </div>
      ) : (
        <>
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
          <Input
            placeholder={`Filter ${columnLabel}...`}
            value={textFilter.value}
            onChange={(event) =>
              updateText({ ...textFilter, value: event.target.value })
            }
            className="h-8 w-[200px]"
          />
        </>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label={`Clear filter for ${columnLabel}`}
        onClick={onClear}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
