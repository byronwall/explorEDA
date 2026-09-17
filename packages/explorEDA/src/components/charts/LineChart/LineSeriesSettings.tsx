import { NumericInputEnter } from "@/components/NumericInputEnter";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useId } from "react";
import { type SeriesSettings } from "./definition";

interface LineSeriesSettingsProps {
  seriesName: string;
  settings: SeriesSettings;
  onSettingsChange: (settings: SeriesSettings) => void;
}

export function LineSeriesSettings({
  seriesName,
  settings,
  onSettingsChange,
}: LineSeriesSettingsProps) {
  const id = useId();
  const update = (next: Partial<SeriesSettings>) =>
    onSettingsChange({ ...settings, ...next });
  const numericFields = [
    { key: "lineWidth", label: "Line width", min: 1, max: 10, step: 0.5 },
    { key: "lineOpacity", label: "Line opacity", min: 0, max: 1, step: 0.1 },
    ...(settings.showPoints
      ? [
          { key: "pointSize", label: "Point size", min: 1, max: 20, step: 1 },
          {
            key: "pointOpacity",
            label: "Point opacity",
            min: 0,
            max: 1,
            step: 0.1,
          },
        ]
      : []),
  ] as const;
  return (
    <fieldset className="space-y-3 border-t border-border pt-3">
      <legend className="px-1 text-sm font-semibold">{seriesName}</legend>
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-2">
          <Switch
            id={`${id}-points`}
            aria-label={`${seriesName} points`}
            checked={settings.showPoints}
            onCheckedChange={(showPoints) => update({ showPoints })}
          />
          <Label htmlFor={`${id}-points`}>Show points</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id={`${id}-axis`}
            aria-label={`${seriesName} right axis`}
            checked={settings.useRightAxis}
            onCheckedChange={(useRightAxis) => update({ useRightAxis })}
          />
          <Label htmlFor={`${id}-axis`}>Right axis</Label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor={`${id}-color`}>Color</Label>
          <input
            id={`${id}-color`}
            aria-label={`${seriesName} color`}
            type="color"
            value={settings.lineColor ?? "#3479a8"}
            onChange={(event) => update({ lineColor: event.target.value })}
            className="h-8 w-full rounded border"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${id}-style`}>Line style</Label>
          <select
            id={`${id}-style`}
            value={settings.lineStyle}
            onChange={(event) =>
              update({
                lineStyle: event.target.value as SeriesSettings["lineStyle"],
              })
            }
            className="h-8 w-full rounded border bg-background px-2 text-sm"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>
        {numericFields.map(({ key, label, min, max, step }) => (
          <div key={key} className="space-y-1">
            <Label htmlFor={`${id}-${key}`}>{label}</Label>
            <NumericInputEnter
              id={`${id}-${key}`}
              value={settings[key as keyof SeriesSettings] as number}
              onChange={(value) => update({ [key]: value })}
              min={min}
              max={max}
              stepSmall={step}
              className="h-8"
            />
          </div>
        ))}
      </div>
    </fieldset>
  );
}
