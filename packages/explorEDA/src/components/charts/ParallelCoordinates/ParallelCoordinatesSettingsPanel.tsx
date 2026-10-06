import { FieldSelector } from "@/components/FieldSelector";
import { NumericInputEnter } from "@/components/NumericInputEnter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import type { RangeFilter } from "@/types/FilterTypes";
import { ArrowDownUp, ArrowLeft, ArrowRight, X } from "lucide-react";
import { useMemo } from "react";
import {
  MAX_PARALLEL_AXES,
  MIN_PARALLEL_AXES,
  type ParallelCoordinatesSettings,
} from "./definition";
import { MAX_AXIS_CATEGORIES, moveAxis, withAxisFilter } from "./parallelPlan";
import { ColorScaleControl } from "@/components/colorScales/ColorScaleControl";

export function ParallelCoordinatesSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ParallelCoordinatesSettings>) {
  const getColumnNames = useDataLayer((s) => s.getColumnNames);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const profiles = useDataLayer((s) => s.fieldProfiles);
  const calculations = useDataLayer((s) => s.calculations);
  const { getOrCreateScaleForField } = useColorScales();

  // Numeric fields and categories with few enough values to read as bands.
  const axisFields = useMemo(() => {
    void calculations;
    return getColumnNames().filter((name) => {
      const profile = profiles.find((item) => item.name === name);
      return (
        !profile ||
        profile.dataType === "numeric" ||
        profile.uniqueCount <= MAX_AXIS_CATEGORIES
      );
    });
  }, [calculations, getColumnNames, profiles]);
  const used = new Set(settings.axes.map((axis) => axis.field));

  const change = (next: Partial<ParallelCoordinatesSettings>) =>
    onSettingsChange({ ...settings, ...next });
  const setAxes = (axes: ParallelCoordinatesSettings["axes"]) => {
    const fields = new Set(axes.map((axis) => axis.field));
    // A removed axis takes its selection with it.
    change({
      axes,
      filters: settings.filters.filter(
        (filter) =>
          fields.has(filter.field) ||
          filter.field === settings.colorField ||
          (filter.type !== "range" && filter.type !== "value")
      ),
    });
  };
  const ranges = settings.filters.filter(
    (filter): filter is RangeFilter =>
      filter.type === "range" && used.has(filter.field)
  );

  return (
    <div className="space-y-2.5">
      <section className="space-y-2" aria-labelledby="pc-axes-heading">
        <div className="flex items-baseline justify-between">
          <h5 id="pc-axes-heading" className="text-sm font-medium">
            Axes, left to right
          </h5>
          <span className="text-xs text-muted-foreground">
            {settings.axes.length} of {MAX_PARALLEL_AXES}
          </span>
        </div>
        <ol className="space-y-1.5">
          {settings.axes.map((axis, index) => {
            const label = getFieldLabel(axis.field);
            return (
              <li
                key={`${axis.field}-${index}`}
                className="flex min-w-0 items-center gap-1"
              >
                <span className="w-4 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <FieldSelector
                    label=""
                    placeholder={`Axis ${index + 1}`}
                    value={axis.field}
                    fields={axisFields.filter(
                      (field) => field === axis.field || !used.has(field)
                    )}
                    onChange={(field) =>
                      setAxes(
                        settings.axes.map((item, position) =>
                          position === index ? { ...item, field } : item
                        )
                      )
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${label} left`}
                  tooltip="Move this axis one place left. Selections stay the same."
                  disabled={index === 0}
                  onClick={() =>
                    setAxes(moveAxis(settings.axes, index, index - 1))
                  }
                >
                  <ArrowLeft />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${label} right`}
                  tooltip="Move this axis one place right. Selections stay the same."
                  disabled={index === settings.axes.length - 1}
                  onClick={() =>
                    setAxes(moveAxis(settings.axes, index, index + 1))
                  }
                >
                  <ArrowRight />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`size-7 ${axis.inverted ? "text-primary" : ""}`}
                  aria-label={`Flip ${label}`}
                  aria-pressed={axis.inverted}
                  tooltip="Flip this axis so high values sit at the bottom. It changes the drawing only."
                  onClick={() =>
                    setAxes(
                      settings.axes.map((item, position) =>
                        position === index
                          ? { ...item, inverted: !item.inverted }
                          : item
                      )
                    )
                  }
                >
                  <ArrowDownUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Remove ${label}`}
                  tooltip="Remove this axis and its selection."
                  disabled={settings.axes.length <= MIN_PARALLEL_AXES}
                  onClick={() =>
                    setAxes(
                      settings.axes.filter((_, position) => position !== index)
                    )
                  }
                >
                  <X />
                </Button>
              </li>
            );
          })}
        </ol>
        {settings.axes.length < MAX_PARALLEL_AXES && (
          <FieldSelector
            label=""
            placeholder="Add an axis"
            value=""
            fields={axisFields.filter((field) => !used.has(field))}
            onChange={(field) =>
              field && setAxes([...settings.axes, { field, inverted: false }])
            }
          />
        )}
        <p className="text-xs text-muted-foreground">
          {`Numbers get their own scale. Category fields with up to ${MAX_AXIS_CATEGORIES} values become bands. You can also drag an axis name sideways in the chart.`}
        </p>
      </section>

      <div className="eda-setting-grid">
        <Label>Color</Label>
        <FieldSelector
          label=""
          placeholder="One color"
          value={settings.colorField ?? ""}
          allowClear
          onChange={(value) =>
            change({
              colorField: value || undefined,
              colorScaleId: value ? getOrCreateScaleForField(value) : undefined,
              filters: settings.colorField
                ? settings.filters.filter(
                    (filter) =>
                      filter.field !== settings.colorField ||
                      used.has(filter.field)
                  )
                : settings.filters,
            })
          }
        />
        {settings.colorScaleId && (
          <div className="col-start-2 -mt-2">
            <ColorScaleControl scaleId={settings.colorScaleId} />
          </div>
        )}

        <Label htmlFor="pc-opacity">Line opacity</Label>
        <NumericInputEnter
          id="pc-opacity"
          value={settings.lineOpacity}
          min={0.05}
          max={1}
          stepSmall={0.05}
          stepMedium={0.1}
          stepLarge={0.25}
          onChange={(value) =>
            change({ lineOpacity: Math.min(1, Math.max(0.05, value)) })
          }
        />

        <Label htmlFor="pc-width">Line width</Label>
        <NumericInputEnter
          id="pc-width"
          value={settings.lineWidth}
          min={0.5}
          max={4}
          stepSmall={0.25}
          stepMedium={0.5}
          stepLarge={1}
          onChange={(value) =>
            change({ lineWidth: Math.min(4, Math.max(0.5, value)) })
          }
        />
      </div>

      {ranges.length > 0 && (
        <section className="space-y-2" aria-labelledby="pc-selection-heading">
          <h5 id="pc-selection-heading" className="text-sm font-medium">
            Selected ranges
          </h5>
          <p className="text-xs text-muted-foreground">
            A row must fall inside every range. Bounds include their values.
          </p>
          {ranges.map((filter) => {
            const label = getFieldLabel(filter.field);
            const set = (bound: "min" | "max", value: number) =>
              change({
                filters: withAxisFilter(settings.filters, filter.field, {
                  ...filter,
                  [bound]: value,
                }),
              });
            return (
              <div
                key={filter.field}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-x-1.5 gap-y-1"
              >
                <span className="col-span-3 truncate text-sm">{label}</span>
                <Label htmlFor={`pc-min-${filter.field}`} className="sr-only">
                  {label} from
                </Label>
                <Label htmlFor={`pc-max-${filter.field}`} className="sr-only">
                  {label} to
                </Label>
                <NumericInputEnter
                  id={`pc-min-${filter.field}`}
                  value={filter.min ?? 0}
                  placeholder="From"
                  onChange={(value) => set("min", value)}
                  stepSmall={1}
                />
                <NumericInputEnter
                  id={`pc-max-${filter.field}`}
                  value={filter.max ?? 0}
                  placeholder="To"
                  onChange={(value) => set("max", value)}
                  stepSmall={1}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Clear ${label} range`}
                  tooltip="Clear this range."
                  onClick={() =>
                    change({
                      filters: withAxisFilter(
                        settings.filters,
                        filter.field,
                        undefined
                      ),
                    })
                  }
                >
                  <X />
                </Button>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
