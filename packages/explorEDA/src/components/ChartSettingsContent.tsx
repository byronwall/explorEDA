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
    setLocalSettings((prev) => {
      const newSettings = {
        ...prev,
        [key]: value,
      };
      return mergeWithDefaultSettings(newSettings);
    });
  };

  const handleUpdate = () => {
    updateChart(settings.id, localSettings);
  };

  const tabs = [
    { value: "main", label: "Main" },
    { value: "facet", label: "Facet" },
    { value: "axis", label: "Axis" },
    { value: "labels", label: "Labels" },
    { value: "advanced", label: "Advanced" },
  ];

  return (
    <div className="space-y-4 max-h-[90vh] overflow-y-auto">
      <TabContainer tabs={tabs}>
        {{
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

      <Button className="w-full" onClick={handleUpdate}>
        Update Chart
      </Button>
    </div>
  );
}
