import type { ChartSettings, ScaleTo } from "@/types/ChartTypes";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { ActionTooltip } from "../ui/tooltip";
import { useGetAllIds, useGetLiveIds } from "./useGetLiveData";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

/** Chart types whose scales can fit the filtered rows instead of all rows. */
export const SCALE_TO_TYPES = new Set<ChartSettings["type"]>([
  "heatmap",
  "calendar",
  "pivot",
]);

export const scaleToOf = (settings: ChartSettings): ScaleTo =>
  settings.scaleTo ?? "all";

const OPTIONS: { value: ScaleTo; label: string; tooltip: string }[] = [
  {
    value: "all",
    label: "All rows",
    tooltip:
      "Lengths and colors stay the same while other charts filter, so one value always reads the same",
  },
  {
    value: "filtered",
    label: "Filtered rows",
    tooltip:
      "Fit this chart's scales to the rows other charts leave, to see detail in a small selection",
  },
];

/** The settings control: which rows set this chart's scales. */
export function ScaleToSetting({
  settings,
  onSettingChange,
}: {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}) {
  if (!SCALE_TO_TYPES.has(settings.type)) return null;
  return (
    <section className="eda-chart-rows" aria-label="Scale to">
      <h3 className="text-xs font-semibold">Scale to</h3>
      <p className="-mt-1 text-xs text-muted-foreground">
        Which rows set this chart's lengths and colors.
      </p>
      <ToggleGroup
        type="single"
        value={scaleToOf(settings)}
        onValueChange={(value) => {
          if (value)
            onSettingChange("scaleTo", value === "all" ? undefined : value);
        }}
        aria-label="Scale to"
        variant="outline"
        size="sm"
        className="grid w-full grid-cols-2"
      >
        {OPTIONS.map((option) => (
          <ActionTooltip key={option.value} content={option.tooltip}>
            <ToggleGroupItem
              value={option.value}
              aria-label={option.label}
              className="w-full min-w-0 px-1 text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary"
            >
              {option.label}
            </ToggleGroupItem>
          </ActionTooltip>
        ))}
      </ToggleGroup>
    </section>
  );
}

/**
 * A chip that switches the scale in one click. It shows only while other
 * charts filter this one, which is the only time the choice changes anything.
 */
export function ScaleToChip({
  settings,
  onChange,
}: {
  settings: ChartSettings;
  onChange: (scaleTo: ScaleTo | undefined) => void;
}) {
  const scaleTo = scaleToOf(settings);
  const next = scaleTo === "all" ? "filtered" : "all";
  return (
    <ActionTooltip
      content={
        scaleTo === "all"
          ? "Scales hold at all rows while other charts filter. Click to fit them to the filtered rows."
          : "Scales fit the filtered rows. Click to hold them at all rows."
      }
    >
      <button
        type="button"
        className="eda-scale-chip"
        data-export="omit"
        data-scale-to={scaleTo}
        aria-pressed={scaleTo === "filtered"}
        aria-label={
          scaleTo === "all"
            ? "Scale: all rows. Fit to filtered rows"
            : "Scale: filtered rows. Hold at all rows"
        }
        onClick={() => onChange(next === "all" ? undefined : next)}
      >
        Scale: {scaleTo === "all" ? "all rows" : "filtered rows"}
      </button>
    </ActionTooltip>
  );
}

/** Places the chip under the chart while other charts filter it. */
export function ScaleToChipSlot({ settings }: { settings: ChartSettings }) {
  const updateChart = useDataLayer((state) => state.updateChart);
  const liveCount = useGetLiveIds(settings).length;
  const allCount = useGetAllIds(settings).length;
  if (liveCount >= allCount) return null;
  return (
    <div className="eda-scale-chip-slot">
      <ScaleToChip
        settings={settings}
        onChange={(scaleTo) => updateChart(settings.id, { scaleTo })}
      />
    </div>
  );
}
