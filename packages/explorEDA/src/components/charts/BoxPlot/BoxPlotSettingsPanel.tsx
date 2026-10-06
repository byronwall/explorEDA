import { ActionTooltip } from "@/components/ui/tooltip";
import { ComboBox } from "@/components/ComboBox";
import { FieldSelector } from "@/components/FieldSelector";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useColorScales } from "@/hooks/useColorScales";
import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { BoxPlotSettings } from "./definition";
import { ColorScaleControl } from "@/components/colorScales/ColorScaleControl";

export function BoxPlotSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<BoxPlotSettings>) {
  const { getOrCreateScaleForField } = useColorScales();

  return (
    <div className="space-y-2.5">
      <div className="eda-setting-grid">
        <Label>Numeric field</Label>
        <FieldSelector
          label=""
          placeholder="Numeric field"
          value={settings.field}
          onChange={(value) => onSettingsChange({ ...settings, field: value })}
        />
      </div>

      <div className="eda-setting-grid">
        <Label htmlFor="colorField">Group by</Label>
        <FieldSelector
          label=""
          placeholder="Group by"
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
        {settings.colorScaleId && (
          <div className="col-start-2 -mt-2">
            <ColorScaleControl scaleId={settings.colorScaleId} />
          </div>
        )}
      </div>

      <div className="eda-setting-grid">
        <Label htmlFor="whiskerType">Whisker Type</Label>
        <ComboBox
          aria-label="Whisker type"
          value={settings.whiskerType}
          options={["tukey", "minmax", "stdDev"]}
          onChange={(value) =>
            onSettingsChange({
              ...settings,
              whiskerType: value as BoxPlotSettings["whiskerType"],
            })
          }
          placeholder="Select whisker type"
          optionToString={(option) => option}
        />
      </div>

      <div className="eda-setting-grid">
        <Label htmlFor="showOutliers">Show Outliers</Label>
        <ActionTooltip content="Show values beyond the whiskers as separate points.">
          <span className="inline-flex w-fit">
            <Switch
              id="showOutliers"
              checked={settings.showOutliers}
              onCheckedChange={(checked) =>
                onSettingsChange({ ...settings, showOutliers: checked })
              }
            />
          </span>
        </ActionTooltip>
      </div>

      <div className="eda-setting-grid">
        <Label htmlFor="sortBy">Sort By</Label>
        <ComboBox
          aria-label="Sort by"
          value={settings.sortBy}
          options={["median", "label"]}
          onChange={(value) =>
            onSettingsChange({
              ...settings,
              sortBy: value as BoxPlotSettings["sortBy"],
            })
          }
          placeholder="Select sorting method"
          optionToString={(option) => option}
        />
      </div>

      <div className="eda-setting-grid">
        <Label htmlFor="distribution-display">Display</Label>
        <ActionTooltip content="Box shows quartiles and whiskers. Violin adds a density shape around the box.">
          <select
            id="distribution-display"
            className="h-9 min-w-0 rounded border border-input bg-background px-2 text-sm"
            value={settings.violinOverlay ? "violin" : "box"}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                violinOverlay: event.target.value === "violin",
              })
            }
          >
            <option value="box">Box</option>
            <option value="violin">Violin</option>
          </select>
        </ActionTooltip>
        <Label htmlFor="distribution-observations">Observations</Label>
        <ActionTooltip content="Show individual numeric values over the summary. The first 300 valid source rows per group are shown.">
          <span className="inline-flex w-fit">
            <Switch
              id="distribution-observations"
              checked={settings.showObservations ?? false}
              onCheckedChange={(showObservations) =>
                onSettingsChange({ ...settings, showObservations })
              }
            />
          </span>
        </ActionTooltip>
      </div>

      {settings.violinOverlay && (
        <>
          <div className="eda-setting-grid">
            <Label htmlFor="autoBandwidth">Auto Bandwidth</Label>
            <ActionTooltip content="Use the group spread and row count to choose density smoothing.">
              <span className="inline-flex w-fit">
                <Switch
                  id="autoBandwidth"
                  checked={settings.autoBandwidth}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ ...settings, autoBandwidth: checked })
                  }
                />
              </span>
            </ActionTooltip>
          </div>
          {!settings.autoBandwidth && (
            <div className="eda-setting-grid">
              <Label htmlFor="violinBandwidth">Bandwidth</Label>
              <input
                type="number"
                id="violinBandwidth"
                min="0.1"
                max="1"
                step="0.1"
                value={settings.violinBandwidth}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    violinBandwidth: parseFloat(e.target.value),
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
