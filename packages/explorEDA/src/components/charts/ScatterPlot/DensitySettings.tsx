import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import type { ScatterPlotSettings } from "./definition";

export function DensitySettings({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ScatterPlotSettings>) {
  return (
    <>
      {(["x", "y"] as const).map((axis) => {
        const key = axis === "x" ? "xBins" : "yBins";
        return (
          <div key={axis} className="contents">
            <Label htmlFor={`density-${axis}-bins`}>
              {axis.toUpperCase()} bins
            </Label>
            <ActionTooltip content="Number of equal numeric intervals across the full-source axis domain. Bin edges stay fixed during filtering and resizing.">
              <Input
                id={`density-${axis}-bins`}
                type="number"
                min={2}
                max={60}
                step={1}
                value={settings.density?.[key] ?? (axis === "x" ? 20 : 16)}
                onChange={(event) => {
                  const count = Number(event.target.value);
                  if (Number.isInteger(count) && count >= 2 && count <= 60)
                    onSettingsChange({
                      ...settings,
                      density: { ...settings.density, [key]: count },
                    });
                }}
              />
            </ActionTooltip>
          </div>
        );
      })}
      <Label htmlFor="density-color-max">Color maximum</Label>
      <ActionTooltip content="Leave empty to use the largest full-source bin count, shared across facets. A fixed maximum saturates the color above that count.">
        <Input
          id="density-color-max"
          type="number"
          min={1}
          step={1}
          placeholder="Full source"
          value={settings.density?.colorMax ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            const colorMax = value === "" ? undefined : Number(value);
            if (
              colorMax === undefined ||
              (Number.isFinite(colorMax) && colorMax >= 1)
            )
              onSettingsChange({
                ...settings,
                density: { ...settings.density, colorMax },
              });
          }}
        />
      </ActionTooltip>
    </>
  );
}
