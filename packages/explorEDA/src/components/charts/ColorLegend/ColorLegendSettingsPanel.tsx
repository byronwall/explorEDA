import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { ColorLegendSettings } from "./definition";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MultiSelect, { Option } from "@/components/ui/multi-select";
import { useColumnNames } from "@/components/charts/PivotTable/useColumnNames";
import { NumericInputEnter } from "@/components/NumericInputEnter";

export function ColorLegendSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ColorLegendSettings>) {
  const availableFields = useColumnNames();

  const fieldOptions = availableFields.map((f) => ({
    label: f,
    value: f,
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Fields to Show</Label>
        <div className="max-w-[400px]">
          <MultiSelect
            options={fieldOptions}
            value={settings.fields.map((f) => ({
              label: f,
              value: f,
            }))}
            onChange={(values: Option[]) =>
              onSettingsChange({
                ...settings,
                fields: values.map((v) => v.value),
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Numeric scale labels</Label>
        <NumericInputEnter
          value={settings.numericalBreakpoints}
          onChange={(value) =>
            onSettingsChange({
              ...settings,
              numericalBreakpoints: value,
            })
          }
          min={2}
          max={20}
          stepSmall={1}
          stepMedium={2}
          stepLarge={5}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="wrap"
          checked={settings.wrap}
          onCheckedChange={(checked) =>
            onSettingsChange({ ...settings, wrap: checked })
          }
        />
        <Label htmlFor="wrap">Wrap categories</Label>
      </div>
    </div>
  );
}
