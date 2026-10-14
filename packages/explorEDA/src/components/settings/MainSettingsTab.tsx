import { chartRegistry, useChartDefinition } from "@/charts/registry";
import { ChartSettings } from "@/types/ChartTypes";
import { ComboBox } from "../ComboBox";
import { Label } from "../ui/label";
import { ScatterPlotSettingsPanel } from "../charts/ScatterPlot/ScatterPlotSettingsPanel";
import type { ScatterPlotSettings } from "../charts/ScatterPlot/definition";

interface MainSettingsTabProps {
  settings: ChartSettings;
  onSettingsChange: (settings: Partial<ChartSettings>) => void;
  showRegression?: boolean;
}

export function MainSettingsTab({
  settings,
  onSettingsChange,
  showRegression = true,
}: MainSettingsTabProps) {
  const chartDefinition = useChartDefinition(settings.type);
  const chartTypes = chartRegistry.getAll();

  // this magic flies in the right settings for the chart type
  const SettingsPanel = chartDefinition.settingsPanel;

  return (
    <div className="space-y-2.5">
      <div className="eda-setting-grid">
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
                mainField(settings)
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

      {settings.type === "scatter" ? (
        <ScatterPlotSettingsPanel
          settings={settings as ScatterPlotSettings}
          onSettingsChange={onSettingsChange}
          showRegression={showRegression}
        />
      ) : (
        <SettingsPanel
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      )}
    </div>
  );
}

/**
 * The field a chart is mostly about, which a new chart type starts from: its
 * field, or a table's first column, an x field, or its first series.
 */
function mainField(settings: ChartSettings): string {
  const record = settings as unknown as {
    field?: string;
    columns?: Array<{ field?: string }>;
    xField?: string;
    seriesField?: string[];
  };
  return (
    record.field ||
    record.columns?.[0]?.field ||
    record.xField ||
    record.seriesField?.[0] ||
    ""
  );
}
