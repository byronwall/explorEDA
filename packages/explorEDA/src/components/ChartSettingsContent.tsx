import { SelectionSettingsTab } from "./settings/SelectionSettingsTab";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { ChartSettings } from "@/types/ChartTypes";
import { mergeWithDefaultSettings } from "@/utils/defaultSettings";
import { useEffect, useState } from "react";
import { AdvancedSettingsTab } from "./settings/AdvancedSettingsTab";
import { AxisSettingsTab } from "./settings/AxisSettingsTab";
import { FacetSettingsTab } from "./settings/FacetSettingsTab";
import { LabelsSettingsTab } from "./settings/LabelsSettingsTab";
import { MainSettingsTab } from "./settings/MainSettingsTab";
import { TabContainer } from "./settings/TabContainer";
import { Button } from "./ui/button";

interface ChartSettingsContentProps {
  settings: ChartSettings;
}

export function ChartSettingsContent({ settings }: ChartSettingsContentProps) {
  // Local state for settings
  const [localSettings, setLocalSettings] = useState<ChartSettings>(
    mergeWithDefaultSettings(settings)
  );

  const updateChart = useDataLayer((s) => s.updateChart);

  // Update local settings when prop changes
  useEffect(() => {
    setLocalSettings(mergeWithDefaultSettings(settings));
  }, [settings]);

  const handleSettingChange = (key: string, value: unknown) => {
    if (key === "id" || key === "layout") return;
    setLocalSettings((prev) => {
      const newSettings = {
        ...prev,
        [key]: value,
      };
      return mergeWithDefaultSettings(newSettings);
    });
  };

  const handleUpdate = () => {
    updateChart(settings.id, {
      ...localSettings,
      id: settings.id,
      layout: settings.layout,
    });
  };

  const hasAxes = ["row", "bar", "scatter", "line", "boxplot"].includes(
    localSettings.type
  );
  const tabs = [
    { value: "main", label: "Data" },
    ...(hasAxes
      ? [
          { value: "facet", label: "Facets" },
          { value: "axis", label: "Axes" },
        ]
      : []),
    ...(["scatter", "line", "bar"].includes(localSettings.type)
      ? [{ value: "selection", label: "Select" }]
      : []),
    { value: "labels", label: "Labels" },
    ...(hasAxes ? [{ value: "advanced", label: "Spacing" }] : []),
  ];
  const invalidRange = localSettings.filters.some(
    (filter) =>
      filter.type === "range" &&
      filter.min !== undefined &&
      filter.max !== undefined &&
      filter.min > filter.max
  );
  const dirty =
    JSON.stringify(localSettings) !==
    JSON.stringify(mergeWithDefaultSettings(settings));

  return (
    <div className="eda-settings space-y-3">
      <div className="space-y-1 pb-2">
        <h4 className="text-base font-semibold">Chart settings</h4>
        <p className="text-xs text-muted-foreground">
          Choose fields, tune the view, then apply your changes.
        </p>
      </div>
      <TabContainer tabs={tabs}>
        {{
          selection: (
            <SelectionSettingsTab
              settings={localSettings}
              onSettingChange={handleSettingChange}
            />
          ),
          main: (
            <MainSettingsTab
              settings={localSettings}
              onSettingChange={handleSettingChange}
            />
          ),
          facet: (
            <FacetSettingsTab
              settings={localSettings}
              onSettingChange={handleSettingChange}
            />
          ),
          axis: (
            <AxisSettingsTab
              settings={localSettings}
              onSettingChange={handleSettingChange}
            />
          ),
          labels: (
            <LabelsSettingsTab
              settings={localSettings}
              onSettingChange={handleSettingChange}
            />
          ),
          advanced: (
            <AdvancedSettingsTab
              settings={localSettings}
              onSettingChange={handleSettingChange}
            />
          ),
        }}
      </TabContainer>

      {invalidRange && (
        <p role="alert" className="text-xs text-destructive">
          The minimum must not exceed the maximum.
        </p>
      )}
      <div className="eda-settings-footer flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          disabled={!dirty}
          onClick={() => setLocalSettings(mergeWithDefaultSettings(settings))}
        >
          Reset changes
        </Button>
        <Button
          size="sm"
          disabled={!dirty || invalidRange}
          onClick={handleUpdate}
        >
          {dirty ? "Apply changes" : "Up to date"}
        </Button>
      </div>
    </div>
  );
}
