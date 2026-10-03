import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { ScatterPlotSettings } from "./definition";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldSelector } from "@/components/FieldSelector";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { ActionTooltip } from "@/components/ui/tooltip";

export function ScatterPlotSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ScatterPlotSettings>) {
  const { getOrCreateScaleForField } = useColorScales();
  const profiles = useDataLayer((s) => s.fieldProfiles);
  const calculations = useDataLayer((s) => s.calculations);
  const sizeFields = [
    ...new Set([
      ...profiles
        .filter((field) => field.dataType === "numeric")
        .map((field) => field.name),
      ...calculations.map((field) => field.resultColumnName),
      ...(settings.sizeField ? [settings.sizeField] : []),
    ]),
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label>X Field</Label>
        <FieldSelector
          label=""
          value={settings.xField}
          onChange={(value) => onSettingsChange({ ...settings, xField: value })}
        />

        <Label>Y Field</Label>
        <FieldSelector
          label=""
          value={settings.yField}
          onChange={(value) => onSettingsChange({ ...settings, yField: value })}
        />

        <Label>Color Field</Label>
        <FieldSelector
          label=""
          value={settings.colorField ?? ""}
          allowClear
          onChange={(value) =>
            onSettingsChange({
              ...settings,
              colorField: value || undefined,
              colorScaleId: value ? getOrCreateScaleForField(value) : undefined,
            })
          }
        />
        <Label>Size by</Label>
        <FieldSelector
          label=""
          placeholder="Size field"
          value={settings.sizeField ?? ""}
          fields={sizeFields}
          allowClear
          onChange={(value) =>
            onSettingsChange({ ...settings, sizeField: value || undefined })
          }
        />
        {settings.sizeField ? (
          <>
            <Label htmlFor="bubble-radius">Largest radius</Label>
            <ActionTooltip content="Radius in pixels for the largest source value. Bubble area stays proportional to value. Small panels reduce the radius to fit.">
              <Input
                id="bubble-radius"
                type="number"
                min={6}
                max={32}
                step={1}
                value={settings.maxBubbleRadius ?? 20}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (value >= 6 && value <= 32)
                    onSettingsChange({ ...settings, maxBubbleRadius: value });
                }}
              />
            </ActionTooltip>
          </>
        ) : (
          <>
            <Label htmlFor="scatter-point-size">Point size</Label>
            <Input
              id="scatter-point-size"
              type="number"
              min={1}
              max={12}
              step={0.5}
              value={settings.pointSize ?? 3}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (value >= 1 && value <= 12)
                  onSettingsChange({ ...settings, pointSize: value });
              }}
            />
          </>
        )}
        <Label htmlFor="scatter-opacity">Opacity</Label>
        <Input
          id="scatter-opacity"
          type="number"
          min={0.1}
          max={1}
          step={0.1}
          value={settings.pointOpacity ?? 0.7}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (value >= 0.1 && value <= 1)
              onSettingsChange({ ...settings, pointOpacity: value });
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {settings.sizeField
          ? "Bubble area represents a nonnegative value. The scale uses all source rows and stays fixed during filtering. Click a bubble to select its row. Drag a rectangle to select a range."
          : "Smaller, transparent points reveal overlap. Drag a rectangle to filter the other views."}
      </p>
    </div>
  );
}
