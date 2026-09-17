import { FieldSelector } from "@/components/FieldSelector";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { BarChartSettings } from "./definition";
import { useColorScales } from "@/hooks/useColorScales";

export function BarChartSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<BarChartSettings>) {
  const { getOrCreateScaleForField } = useColorScales();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label>Field</Label>
        <FieldSelector
          label=""
          value={settings.field}
          onChange={(value) => onSettingsChange({ ...settings, field: value })}
        />

        <Label>Bins · {settings.binCount ?? 10}</Label>
        <Slider
          aria-label="Histogram bin count"
          value={[settings.binCount ?? 10]}
          min={2}
          max={50}
          step={1}
          onValueChange={([value]) =>
            onSettingsChange({ ...settings, binCount: value })
          }
        />

        <div className="col-start-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="forceString"
              checked={settings.forceString}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  forceString: checked,
                })
              }
            />
            <Label htmlFor="forceString">Treat values as categories</Label>
          </div>
        </div>

        <div className="col-start-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="colorField"
              checked={settings.field === settings.colorField}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  colorField: checked ? settings.field : undefined,
                  colorScaleId:
                    checked && settings.field
                      ? getOrCreateScaleForField(settings.field)
                      : undefined,
                })
              }
            />
            <Label htmlFor="colorField">Use as color field</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
