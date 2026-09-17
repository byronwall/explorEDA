import { ChartSettings } from "@/types/ChartTypes";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

interface Props {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}
export function AxisSettingsTab({ settings, onSettingChange }: Props) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        Symmetric log reveals detail across large ranges and keeps zero and
        negative values. Category axes retain their order.
      </p>
      {(["x", "y"] as const).map((axis) => (
        <fieldset key={axis} className="space-y-3 rounded-md border p-3">
          <legend className="px-1 text-sm font-medium">
            {axis === "x" ? "Horizontal axis" : "Vertical axis"}
          </legend>
          <label className="flex items-center justify-between gap-4">
            Numeric scale
            <select
              className="h-8 rounded-md border bg-background px-2 text-xs"
              aria-label={`${axis.toUpperCase()} numeric scale`}
              value={
                settings[`${axis}Axis`]?.scaleType === "symlog"
                  ? "symlog"
                  : "linear"
              }
              onChange={(event) =>
                onSettingChange(`${axis}Axis`, {
                  ...settings[`${axis}Axis`],
                  scaleType: event.target.value,
                })
              }
            >
              <option value="linear">Linear</option>
              <option value="symlog">Symmetric log</option>
            </select>
          </label>
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
        </fieldset>
      ))}
      <p className="text-xs text-muted-foreground">
        Tick labels adapt to the available space. Use Labels to add units to
        each axis.
      </p>
    </div>
  );
}
