import { chartRegistry, useChartDefinition } from "@/charts/registry";
import { ChartSettings } from "@/types/ChartTypes";
import { ComboBox } from "../ComboBox";
import { Label } from "../ui/label";

interface MainSettingsTabProps {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}

export function MainSettingsTab({
  settings,
  onSettingChange,
}: MainSettingsTabProps) {
  const chartDefinition = useChartDefinition(settings.type);
  const chartTypes = chartRegistry.getAll();

  // this magic flies in the right settings for the chart type
  const SettingsPanel = chartDefinition.settingsPanel;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label htmlFor="chartType">Chart Type</Label>
        <ComboBox
          value={chartDefinition}
          options={chartTypes}
          onChange={(option) => {
            if (option) {
              const newSettings = option.createDefaultSettings(
                settings.layout,
                settings.field
              );
              Object.entries(newSettings).forEach(([key, value]) => {
                onSettingChange(key, value);
              });
            }
          }}
          optionToNode={(option) => {
            const Icon = option.icon;
            return (
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{option.name}</span>
              </div>
            );
          }}
          optionToString={(option) => option.name}
          placeholder="Select chart type"
        />
      </div>

      <SettingsPanel
        settings={settings}
        onSettingsChange={(newSettings) => {
          Object.entries(newSettings).forEach(([key, value]) => {
            onSettingChange(key, value);
          });
        }}
      />
    </div>
  );
}
