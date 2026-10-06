import { ChartSettings } from "@/types/ChartTypes";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { ActionTooltip } from "../ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

interface Props {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}
export function AxisSettingsTab({ settings, onSettingChange }: Props) {
  const stacked =
    settings.type === "bar" &&
    settings.seriesField &&
    settings.seriesLayout &&
    settings.seriesLayout !== "grouped";
  const area =
    settings.type === "line" &&
    ["area", "stacked-area"].includes(settings.time?.display ?? "");
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Symmetric log reveals detail across large ranges and keeps zero and
        negative values. Category axes retain their order.
      </p>
      {(["x", "y"] as const).map((axis) => (
        <fieldset
          key={axis}
          className="space-y-2 rounded-md border border-border p-3"
        >
          <legend className="px-1 text-sm font-medium">
            {axis === "x" ? "Horizontal axis" : "Vertical axis"}
          </legend>
          {settings.type === "bar" && settings.seriesField && axis === "x" ? (
            <p className="text-xs text-muted-foreground">
              Categories share one axis. Series{" "}
              {stacked ? "stack" : "appear side by side"} within each category.
            </p>
          ) : null}
          {(stacked || area) && axis === "y" ? (
            <p className="text-xs text-muted-foreground">
              {area ? "Areas" : "Stacks"} use a linear scale so heights stay
              proportional.
            </p>
          ) : settings.type === "line" && settings.time && axis === "x" ? (
            <p className="text-xs text-muted-foreground">
              Dates use a UTC calendar scale.
            </p>
          ) : !(
              settings.type === "bar" &&
              settings.seriesField &&
              axis === "x"
            ) ? (
            <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-2">
              <span className="text-sm">Numeric scale</span>
              <ToggleGroup
                type="single"
                value={
                  settings[`${axis}Axis`]?.scaleType === "symlog"
                    ? "symlog"
                    : "linear"
                }
                onValueChange={(scaleType) => {
                  if (scaleType)
                    onSettingChange(`${axis}Axis`, {
                      ...settings[`${axis}Axis`],
                      scaleType,
                    });
                }}
                aria-label={`${axis.toUpperCase()} numeric scale`}
                variant="outline"
                size="sm"
                className="grid grid-cols-2"
              >
                <ActionTooltip content="Use evenly spaced values. This is the standard scale for most charts.">
                  <ToggleGroupItem
                    value="linear"
                    className="w-full text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary"
                  >
                    Linear
                  </ToggleGroupItem>
                </ActionTooltip>
                <ActionTooltip content="Show detail across large ranges while retaining zero and negative values.">
                  <ToggleGroupItem
                    value="symlog"
                    className="w-full text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary"
                  >
                    Symmetric log
                  </ToggleGroupItem>
                </ActionTooltip>
              </ToggleGroup>
            </div>
          ) : null}
          <label className="flex items-center justify-between gap-4">
            Grid lines
            <Switch
              aria-label={`${axis.toUpperCase()} axis grid lines`}
              checked={settings[`${axis}Axis`]?.grid ?? false}
              onCheckedChange={(grid) =>
                onSettingChange(`${axis}Axis`, {
                  ...settings[`${axis}Axis`],
                  grid,
                })
              }
            />
          </label>
          <AxisTextSize
            label="Tick text"
            ariaLabel={`${axis.toUpperCase()} tick text size`}
            value={settings[`${axis}Axis`]?.tickFontSize ?? 10}
            sizes={[8, 10, 12]}
            effect="tick labels"
            onChange={(tickFontSize) =>
              onSettingChange(`${axis}Axis`, {
                ...settings[`${axis}Axis`],
                tickFontSize,
              })
            }
          />
          <AxisTextSize
            label="Axis label"
            ariaLabel={`${axis.toUpperCase()} axis label text size`}
            value={settings[`${axis}Axis`]?.labelFontSize ?? 11}
            sizes={[9, 11, 13]}
            effect="axis title"
            onChange={(labelFontSize) =>
              onSettingChange(`${axis}Axis`, {
                ...settings[`${axis}Axis`],
                labelFontSize,
              })
            }
          />
          {!(settings.type === "line" && settings.time && axis === "x") && (
            <label className="flex items-center justify-between gap-4">
              Tick density
              <Input
                className="w-24"
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
            </label>
          )}
        </fieldset>
      ))}
    </div>
  );
}

function AxisTextSize({
  label,
  ariaLabel,
  value,
  sizes,
  effect,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  value: number;
  sizes: number[];
  effect: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-2">
      <span className="text-sm">{label}</span>
      <ToggleGroup
        type="single"
        value={String(value)}
        onValueChange={(size) => size && onChange(Number(size))}
        aria-label={ariaLabel}
        variant="outline"
        size="sm"
        className="grid grid-cols-3"
      >
        {sizes.map((size, index) => {
          const name = ["Small", "Default", "Large"][index];
          return (
            <ActionTooltip
              key={size}
              content={`${name} ${effect}, at ${size} px.`}
            >
              <ToggleGroupItem
                value={String(size)}
                className="w-full text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary"
              >
                {name}
              </ToggleGroupItem>
            </ActionTooltip>
          );
        })}
      </ToggleGroup>
    </div>
  );
}
