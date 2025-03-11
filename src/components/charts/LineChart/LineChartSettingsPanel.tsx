import { FieldSelector } from "@/components/FieldSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { type ChartSettingsPanelProps } from "@/types/ChartTypes";
import { type FC } from "react";
import {
  type LineChartSettings,
  type SeriesSettings,
  DEFAULT_SERIES_SETTINGS,
} from "./definition";
import { LineSeriesSettings } from "./LineSeriesSettings";
import { ComboBox } from "@/components/ComboBox";
import MultiSelect, { type Option } from "@/components/ui/multi-select";
import { useColumnNames } from "@/components/charts/PivotTable/useColumnNames";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const LineChartSettingsPanel: FC<
  ChartSettingsPanelProps<LineChartSettings>
> = ({ settings, onSettingsChange }) => {
  const updateSettings = (updates: Partial<LineChartSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const updateStyles = (updates: Partial<LineChartSettings["styles"]>) => {
    updateSettings({
      styles: { ...settings.styles, ...updates },
    });
  };

  const updateSeriesSettings = (
    seriesName: string,
    seriesSettings: SeriesSettings
  ) => {
    updateSettings({
      seriesSettings: {
        ...settings.seriesSettings,
        [seriesName]: seriesSettings,
      },
    });
  };

  const availableFields = useColumnNames();

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldSelector
                label="X Field"
                value={settings.xField}
                onChange={(value) => updateSettings({ xField: value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Series Fields</Label>
              <MultiSelect
                options={availableFields.map((f) => ({
                  label: f,
                  value: f,
                }))}
                value={settings.seriesField.map((f) => ({
                  label: f,
                  value: f,
                }))}
                onChange={(values: Option[]) => {
                  const newSeriesFields = values.map((v) => v.value);
                  const newSeriesSettings = { ...settings.seriesSettings };

                  // Add default settings for new series
                  newSeriesFields.forEach((field) => {
                    if (!newSeriesSettings[field]) {
                      newSeriesSettings[field] = DEFAULT_SERIES_SETTINGS;
                    }
                  });

                  // Remove settings for removed series
                  Object.keys(newSeriesSettings).forEach((field) => {
                    if (!newSeriesFields.includes(field)) {
                      delete newSeriesSettings[field];
                    }
                  });

                  updateSettings({
                    seriesField: newSeriesFields,
                    seriesSettings: newSeriesSettings,
                  });
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="series">Series</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Line Style</Label>
                  <ComboBox
                    value={{
                      label:
                        settings.styles.curveType === "linear"
                          ? "Linear"
                          : settings.styles.curveType === "monotoneX"
                            ? "Smooth"
                            : "Step",
                      value: settings.styles.curveType,
                    }}
                    options={[
                      { label: "Linear", value: "linear" as const },
                      { label: "Smooth", value: "monotoneX" as const },
                      { label: "Step", value: "step" as const },
                    ]}
                    onChange={(option) =>
                      updateStyles({ curveType: option?.value ?? "linear" })
                    }
                    optionToString={(option) => option.label}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Show X Grid</Label>
                  <Switch
                    checked={settings.showXGrid}
                    onCheckedChange={(checked) =>
                      updateSettings({ showXGrid: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Show Y Grid</Label>
                  <Switch
                    checked={settings.showYGrid}
                    onCheckedChange={(checked) =>
                      updateSettings({ showYGrid: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label>Show Legend</Label>
                  <Switch
                    checked={settings.showLegend}
                    onCheckedChange={(checked) =>
                      updateSettings({ showLegend: checked })
                    }
                  />
                </div>

                {settings.showLegend && (
                  <div className="space-y-2">
                    <Label>Legend Position</Label>
                    <ComboBox
                      value={{
                        label:
                          settings.legendPosition.charAt(0).toUpperCase() +
                          settings.legendPosition.slice(1),
                        value: settings.legendPosition,
                      }}
                      options={[
                        { label: "Top", value: "top" as const },
                        { label: "Right", value: "right" as const },
                        { label: "Bottom", value: "bottom" as const },
                        { label: "Left", value: "left" as const },
                      ]}
                      onChange={(option) =>
                        updateSettings({
                          legendPosition: option?.value ?? "top",
                        })
                      }
                      optionToString={(option) => option.label}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="series">
          <div className="space-y-4">
            {settings.seriesField.map((field) => (
              <LineSeriesSettings
                key={field}
                seriesName={field}
                settings={
                  settings.seriesSettings[field] ?? DEFAULT_SERIES_SETTINGS
                }
                onSettingsChange={(newSettings) =>
                  updateSeriesSettings(field, newSettings)
                }
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
