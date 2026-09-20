import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { ThreeDScatterSettings } from "./types";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NumericInputEnter } from "@/components/NumericInputEnter";
import { FieldSelector } from "@/components/FieldSelector";
import { useColorScales } from "@/hooks/useColorScales";

export function ThreeDScatterSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ThreeDScatterSettings>) {
  const { getOrCreateScaleForField } = useColorScales();
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

        <Label>Z Field</Label>
        <FieldSelector
          label=""
          value={settings.zField}
          onChange={(value) => onSettingsChange({ ...settings, zField: value })}
        />

        <Label>Size Field</Label>
        <FieldSelector
          label=""
          value={settings.sizeField ?? ""}
          allowClear
          onChange={(value) =>
            onSettingsChange({
              ...settings,
              sizeField: value || undefined,
            })
          }
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

        <Label>Point Size</Label>
        <NumericInputEnter
          value={settings.pointSize}
          onChange={(value) =>
            onSettingsChange({ ...settings, pointSize: value })
          }
          min={0.01}
          max={10}
          stepSmall={0.1}
          stepMedium={0.5}
          stepLarge={1}
        />

        <Label>Point Opacity</Label>
        <NumericInputEnter
          value={settings.pointOpacity}
          onChange={(value) =>
            onSettingsChange({ ...settings, pointOpacity: value })
          }
          min={0}
          max={1}
          stepSmall={0.1}
          stepMedium={0.2}
          stepLarge={0.3}
        />

        <div className="col-start-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="showGrid"
              checked={settings.showGrid}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  showGrid: checked,
                })
              }
            />
            <Label htmlFor="showGrid">Show Grid</Label>
          </div>
        </div>

        <div className="col-start-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="showAxes"
              checked={settings.showAxes}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  showAxes: checked,
                })
              }
            />
            <Label htmlFor="showAxes">Show Axes</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
