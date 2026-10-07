import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import type { ScatterPlotSettings } from "./definition";

export const MIN_POINT_SIZE = 1;
export const MAX_POINT_SIZE = 12;

/** Parses the point size field; empty means automatic, invalid is ignored. */
export function parsePointSize(text: string): number | undefined | null {
  if (text.trim() === "") return undefined;
  const value = Number(text);
  return Number.isFinite(value) &&
    value >= MIN_POINT_SIZE &&
    value <= MAX_POINT_SIZE
    ? value
    : null;
}

/** Point radius in pixels, for points and for points over a density surface. */
export function PointSizeSetting({
  settings,
  onSettingsChange,
}: {
  settings: ScatterPlotSettings;
  onSettingsChange: (settings: ScatterPlotSettings) => void;
}) {
  return (
    <>
      <Label htmlFor="scatter-point-size">Point size</Label>
      <ActionTooltip content="Point radius in pixels, from 1 to 12. Leave empty for automatic: 3 px, or 2.5 and 2 px for more than 1,000 and 5,000 rows.">
        <Input
          id="scatter-point-size"
          type="number"
          min={MIN_POINT_SIZE}
          max={MAX_POINT_SIZE}
          step={0.5}
          placeholder="Auto"
          value={settings.pointSize ?? ""}
          onChange={(event) => {
            const pointSize = parsePointSize(event.target.value);
            if (pointSize !== null)
              onSettingsChange({ ...settings, pointSize });
          }}
        />
      </ActionTooltip>
    </>
  );
}
