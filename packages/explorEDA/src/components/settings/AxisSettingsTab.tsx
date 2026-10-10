import { ChartSettings } from "@/types/ChartTypes";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { ActionTooltip } from "../ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { numericAxes } from "../charts/Axis/axisBounds";
import { AxisLimitFields } from "../charts/InPlace/AxisLimitFields";
import { resolveFieldProfile } from "../FieldMetadata";
import { useDataLayer } from "@/providers/DataLayerProvider";

interface Props {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}
export function AxisSettingsTab({ settings, onSettingChange }: Props) {
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const ranged = numericAxes(
    settings,
    (field) =>
      resolveFieldProfile(field, fieldProfiles ?? [], getColumnData)
        ?.dataType === "numeric"
  );
  const stacked =
    settings.type === "bar" &&
    settings.seriesField &&
    settings.seriesLayout &&
    settings.seriesLayout !== "grouped";
  const area =
    settings.type === "line" &&
    ["area", "stacked-area"].includes(settings.time?.display ?? "");
  const toggleClass =
    "w-full min-w-0 px-1 text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary";
  return (
    <div className="space-y-2">
      {(["x", "y"] as const).map((axis) => {
        const note =
          settings.type === "bar" && settings.seriesField && axis === "x"
            ? `Categories share one axis. Series ${stacked ? "stack" : "appear side by side"} within each category.`
            : (stacked || area) && axis === "y"
              ? `${area ? "Areas" : "Stacks"} use a linear scale so heights stay proportional.`
              : settings.type === "line" && settings.time && axis === "x"
                ? "Dates use a UTC calendar scale."
                : undefined;
        const axisSettings = settings[`${axis}Axis`];
        const update = (next: object) =>
          onSettingChange(`${axis}Axis`, { ...axisSettings, ...next });
        const hasTicks = !(
          settings.type === "line" &&
          settings.time &&
          axis === "x"
        );
        return (
          <section
            key={axis}
            aria-label={axis === "x" ? "Horizontal axis" : "Vertical axis"}
            className="eda-setting-section"
          >
            <h5>{axis === "x" ? "Horizontal axis" : "Vertical axis"}</h5>
            {note && <p className="eda-setting-note">{note}</p>}
            <div className="eda-setting-grid">
              {!note && (
                <>
                  <span className="eda-setting-label">Scale</span>
                  <ToggleGroup
                    type="single"
                    value={
                      axisSettings?.scaleType === "symlog" ? "symlog" : "linear"
                    }
                    onValueChange={(scaleType) => {
                      if (scaleType) update({ scaleType });
                    }}
                    aria-label={`${axis.toUpperCase()} numeric scale`}
                    variant="outline"
                    size="sm"
                    className="grid w-full grid-cols-2"
                  >
                    <ActionTooltip content="Use evenly spaced values. This is the standard scale for most charts.">
                      <ToggleGroupItem
                        value="linear"
                        aria-label="Linear"
                        className={toggleClass}
                      >
                        Linear
                      </ToggleGroupItem>
                    </ActionTooltip>
                    <ActionTooltip content="Symmetric log: show detail across large ranges while keeping zero and negative values.">
                      <ToggleGroupItem
                        value="symlog"
                        aria-label="Symmetric log"
                        className={toggleClass}
                      >
                        Symlog
                      </ToggleGroupItem>
                    </ActionTooltip>
                  </ToggleGroup>
                </>
              )}
              {ranged[axis] && (
                <>
                  <ActionTooltip content="The values this axis shows. Leave a side blank to follow the data. Marks outside are hidden, not filtered.">
                    <span className="eda-setting-label">Range</span>
                  </ActionTooltip>
                  <AxisLimitFields
                    axisName={axis.toUpperCase()}
                    limits={axisSettings?.limits}
                    onChange={(limits) => update({ limits })}
                  />
                </>
              )}
              <AxisTextSize
                label="Tick text"
                ariaLabel={`${axis.toUpperCase()} tick text size`}
                value={axisSettings?.tickFontSize}
                sizes={[8, 10, 12]}
                effect="tick labels"
                className={toggleClass}
                onChange={(tickFontSize) => update({ tickFontSize })}
              />
              <AxisTextSize
                label="Axis label"
                ariaLabel={`${axis.toUpperCase()} axis label text size`}
                value={axisSettings?.labelFontSize}
                sizes={[9, 11, 13]}
                effect="axis title"
                className={toggleClass}
                onChange={(labelFontSize) => update({ labelFontSize })}
              />
              <span className="eda-setting-label">
                {hasTicks ? "Ticks" : "Grid lines"}
              </span>
              <div className="flex min-w-0 items-center gap-2">
                {hasTicks && (
                  <ActionTooltip content="About how many tick values the axis shows, from 2 to 12">
                    <Input
                      aria-label={`${axis.toUpperCase()} tick density`}
                      className="w-14"
                      type="number"
                      min={2}
                      max={12}
                      value={settings[`${axis}GridLines`] || 5}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        if (value >= 2 && value <= 12)
                          onSettingChange(`${axis}GridLines`, value);
                      }}
                    />
                  </ActionTooltip>
                )}
                <label className="ml-auto flex items-center gap-1.5">
                  {hasTicks && "Grid lines"}
                  <Switch
                    aria-label={`${axis.toUpperCase()} axis grid lines`}
                    checked={axisSettings?.grid ?? false}
                    onCheckedChange={(grid) => update({ grid })}
                  />
                </label>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function AxisTextSize({
  label,
  ariaLabel,
  value,
  sizes,
  effect,
  className,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  /** Undefined follows the workspace theme. */
  value: number | undefined;
  sizes: number[];
  effect: string;
  className: string;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <>
      <span className="eda-setting-label">{label}</span>
      <ToggleGroup
        type="single"
        value={value === undefined ? "theme" : String(value)}
        onValueChange={(size) => {
          if (size) onChange(size === "theme" ? undefined : Number(size));
        }}
        aria-label={ariaLabel}
        variant="outline"
        size="sm"
        className="grid w-full grid-cols-4"
      >
        <ActionTooltip
          content={`Follow the workspace theme's ${effect} size. Any other choice overrides the theme for this chart.`}
        >
          <ToggleGroupItem
            value="theme"
            aria-label="Theme"
            className={className}
          >
            Theme
          </ToggleGroupItem>
        </ActionTooltip>
        {sizes.map((size, index) => {
          const name = ["Small", "Medium", "Large"][index];
          return (
            <ActionTooltip
              key={size}
              content={`${name} ${effect}, at ${size} px, whatever the theme.`}
            >
              <ToggleGroupItem
                value={String(size)}
                aria-label={name}
                className={className}
              >
                {name}
              </ToggleGroupItem>
            </ActionTooltip>
          );
        })}
      </ToggleGroup>
    </>
  );
}
