import { chartRegistry, useChartDefinition } from "@/charts/registry";
import { ChartSettings } from "@/types/ChartTypes";
import { ComboBox } from "../ComboBox";
import { Label } from "../ui/label";

interface MainSettingsTabProps {
  settings: ChartSettings;
  onSettingsChange: (settings: Partial<ChartSettings>) => void;
}

export function MainSettingsTab({
  settings,
  onSettingsChange,
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
          id="chartType"
          aria-label="Chart type"
          value={chartDefinition}
          options={chartTypes}
          onChange={(option) => {
            if (option) {
              const newSettings = option.createDefaultSettings(
                settings.layout,
                settings.field
              );
              onSettingsChange(newSettings);
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

      <SettingsPanel settings={settings} onSettingsChange={onSettingsChange} />
    </div>
  );
}
