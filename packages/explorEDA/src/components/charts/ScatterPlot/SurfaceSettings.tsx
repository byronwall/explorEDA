import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ActionTooltip } from "@/components/ui/tooltip";
import type { ScatterPlotSettings } from "./definition";
import { DEFAULT_HEX_COLUMNS } from "./hexPlan";
import { DEFAULT_BANDWIDTH_SCALE, DEFAULT_CONTOUR_LEVELS } from "./contourPlan";

function Toggle({
  id,
  label,
  help,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  help: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="col-start-2 flex items-center gap-2">
      <ActionTooltip content={help}>
        <span className="inline-flex w-fit">
          <Switch id={id} checked={checked} onCheckedChange={onChange} />
        </span>
      </ActionTooltip>
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}

/** Hexagon size or density smoothing, levels, and overlays. */
export function SurfaceSettings({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ScatterPlotSettings>) {
  if (settings.display === "hexbin") {
    const hexbin = settings.hexbin ?? {};
    const update = (next: Partial<typeof hexbin>) =>
      onSettingsChange({ ...settings, hexbin: { ...hexbin, ...next } });
    return (
      <>
        <Label htmlFor="hex-columns">Hexagon columns</Label>
        <ActionTooltip content="Number of hexagons across the full-source X range, from 5 to 60. More columns make smaller hexagons. A row's hexagon stays fixed while filtering and resizing.">
          <Input
            id="hex-columns"
            type="number"
            min={5}
            max={60}
            step={1}
            value={hexbin.columns ?? DEFAULT_HEX_COLUMNS}
            onChange={(event) => {
              const columns = Number(event.target.value);
              if (Number.isInteger(columns) && columns >= 5 && columns <= 60)
                update({ columns });
            }}
          />
        </ActionTooltip>
        <Label htmlFor="hex-color-max">Color maximum</Label>
        <ActionTooltip content="Leave empty to use the largest full-source hexagon count, shared across facets. A fixed maximum saturates the color above that count.">
          <Input
            id="hex-color-max"
            type="number"
            min={1}
            step={1}
            placeholder="Full source"
            value={hexbin.colorMax ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              const colorMax = value === "" ? undefined : Number(value);
              if (
                colorMax === undefined ||
                (Number.isFinite(colorMax) && colorMax >= 1)
              )
                update({ colorMax });
            }}
          />
        </ActionTooltip>
        <Toggle
          id="hex-points"
          label="Show points"
          help="Draws each row as a small point in its color group over the hexagons."
          checked={Boolean(hexbin.showPoints)}
          onChange={(checked) => update({ showPoints: checked || undefined })}
        />
      </>
    );
  }
  const contour = settings.contour ?? {};
  const update = (next: Partial<typeof contour>) =>
    onSettingsChange({ ...settings, contour: { ...contour, ...next } });
  return (
    <>
      <Label htmlFor="contour-bandwidth">Bandwidth</Label>
      <ActionTooltip content="Multiplies Scott's rule bandwidth, from 0.25 to 4. Smaller values follow the rows closely; larger values smooth more.">
        <Input
          id="contour-bandwidth"
          type="number"
          min={0.25}
          max={4}
          step={0.25}
          value={contour.bandwidth ?? DEFAULT_BANDWIDTH_SCALE}
          onChange={(event) => {
            const bandwidth = Number(event.target.value);
            if (bandwidth >= 0.25 && bandwidth <= 4) update({ bandwidth });
          }}
        />
      </ActionTooltip>
      <Label htmlFor="contour-levels">Levels</Label>
      <ActionTooltip content="Number of density thresholds, from 2 to 12, in equal steps of each panel's peak density.">
        <Input
          id="contour-levels"
          type="number"
          min={2}
          max={12}
          step={1}
          value={contour.levels ?? DEFAULT_CONTOUR_LEVELS}
          onChange={(event) => {
            const levels = Number(event.target.value);
            if (Number.isInteger(levels) && levels >= 2 && levels <= 12)
              update({ levels });
          }}
        />
      </ActionTooltip>
      <Toggle
        id="contour-fill"
        label="Filled regions"
        help="Shades each region where the density reaches a level. Gray shades keep density apart from group colors."
        checked={contour.fill !== false}
        onChange={(checked) => update({ fill: checked ? undefined : false })}
      />
      <Toggle
        id="contour-lines"
        label="Contour lines"
        help="Outlines each density level."
        checked={contour.lines !== false}
        onChange={(checked) => update({ lines: checked ? undefined : false })}
      />
      <Toggle
        id="contour-points"
        label="Show points"
        help="Draws each row as a small point in its color group over the density."
        checked={contour.showPoints !== false}
        onChange={(checked) =>
          update({ showPoints: checked ? undefined : false })
        }
      />
    </>
  );
}
