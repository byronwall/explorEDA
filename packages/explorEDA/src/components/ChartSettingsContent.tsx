import {
  chartFilterFields,
  FiltersSettingsTab,
} from "./settings/FiltersSettingsTab";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { ChartSettings } from "@/types/ChartTypes";
import { mergeWithDefaultSettings } from "@/utils/defaultSettings";
import { useEffect, useRef, useState } from "react";
import { AdvancedSettingsTab } from "./settings/AdvancedSettingsTab";
import { AxisSettingsTab } from "./settings/AxisSettingsTab";
import { FacetSettingsTab } from "./settings/FacetSettingsTab";
import { LabelsSettingsTab } from "./settings/LabelsSettingsTab";
import { MainSettingsTab } from "./settings/MainSettingsTab";
import { TabContainer } from "./settings/TabContainer";
import { Button } from "./ui/button";
import { RegressionSettings } from "./charts/ScatterPlot/RegressionSettings";
import type { ScatterPlotSettings } from "./charts/ScatterPlot/definition";

interface ChartSettingsContentProps {
  settings: ChartSettings;
}

export function ChartSettingsContent({ settings }: ChartSettingsContentProps) {
  // Local state for settings
  const [localSettings, setLocalSettings] = useState<ChartSettings>(
    mergeWithDefaultSettings(settings)
  );

  const resetValues = useRef<Partial<ChartSettings>>({});
  const updateChart = useDataLayer((s) => s.updateChart);
  const aggregate = useDataLayer((state) =>
    settings.type === "bar" && settings.aggregateId
      ? state.getAggregate(settings.aggregateId)
      : undefined
  );
  const resetAggregate = useRef(aggregate);
  const updateAggregate = useDataLayer((state) => state.updateAggregate);

  // Update local settings when prop changes
  useEffect(() => {
    setLocalSettings(mergeWithDefaultSettings(settings));
  }, [settings]);

  const handleSettingsChange = (updates: Partial<ChartSettings>) => {
    for (const key of Object.keys(updates) as (keyof ChartSettings)[]) {
      if (!(key in resetValues.current)) {
        Object.assign(resetValues.current, { [key]: settings[key] });
      }
    }
    const next = mergeWithDefaultSettings({
      ...localSettings,
      ...updates,
      id: settings.id,
      layout: settings.layout,
    } as ChartSettings);
    setLocalSettings(next);
    if (
      !next.filters.some(
        (filter) =>
          (filter.type === "range" || filter.type === "date-range") &&
          filter.min !== undefined &&
          filter.max !== undefined &&
          filter.min > filter.max
      )
    ) {
      updateChart(settings.id, {
        ...next,
        id: settings.id,
        layout: settings.layout,
      });
    }
  };

  const handleSettingChange = (key: string, value: unknown) =>
    handleSettingsChange({ [key]: value });

  const hasAxes = ["row", "bar", "scatter", "line", "boxplot"].includes(
    localSettings.type
  );
  const hasFitTab =
    localSettings.type === "scatter" && localSettings.display !== "density";
  const tabs = [
    { value: "main", label: "Data" },
    ...(hasFitTab ? [{ value: "fit", label: "Fit" }] : []),
    ...(localSettings.type === "map"
      ? [{ value: "facet", label: "Facets" }]
      : []),
    ...(hasAxes
      ? [
          { value: "facet", label: "Facets" },
          { value: "axis", label: "Axes" },
        ]
      : []),
    ...(chartFilterFields(localSettings, aggregate).length > 0
      ? [{ value: "filters", label: "Filters" }]
      : []),
    { value: "labels", label: "Labels" },
    ...(hasAxes ? [{ value: "advanced", label: "Spacing" }] : []),
  ];
  const invalidRange = localSettings.filters.some(
    (filter) =>
      (filter.type === "range" || filter.type === "date-range") &&
      filter.min !== undefined &&
      filter.max !== undefined &&
      filter.min > filter.max
  );
  const aggregateDirty =
    resetAggregate.current &&
    JSON.stringify(aggregate) !== JSON.stringify(resetAggregate.current);
  const dirty =
    aggregateDirty ||
    Object.entries(resetValues.current).some(
      ([key, value]) =>
        JSON.stringify(localSettings[key as keyof ChartSettings]) !==
        JSON.stringify(value)
    );

  return (
    <div className="eda-settings space-y-3">
      <div className="space-y-1 pb-2">
        <h4 className="text-base font-semibold">Chart settings</h4>
        <p className="text-xs text-muted-foreground">
          Changes update the chart immediately.
        </p>
      </div>
      <TabContainer
        key={localSettings.type}
        tabs={tabs}
      >
        {{
          filters: (
            <FiltersSettingsTab
              settings={localSettings}
              onSettingChange={handleSettingChange}
            />
          ),
          main: (
            <MainSettingsTab
              settings={localSettings}
              onSettingsChange={handleSettingsChange}
              showRegression={localSettings.type !== "scatter"}
            />
          ),
          fit: hasFitTab ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Fit each color group using the rows that pass other chart
                filters.
              </p>
              <div className="grid grid-cols-[120px_1fr] items-center gap-x-4 gap-y-3">
                <RegressionSettings
                  settings={localSettings as ScatterPlotSettings}
                  onSettingsChange={handleSettingsChange}
                />
              </div>
            </div>
          ) : null,
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
          onClick={() => {
            if (resetAggregate.current)
              updateAggregate(
                resetAggregate.current.id,
                resetAggregate.current
              );
            const next = {
              ...settings,
              ...resetValues.current,
            } as ChartSettings;
            resetValues.current = {};
            setLocalSettings(mergeWithDefaultSettings(next));
            updateChart(settings.id, next);
          }}
        >
          Reset changes
        </Button>
        <span className="text-xs text-muted-foreground">Live preview</span>
      </div>
    </div>
  );
}
