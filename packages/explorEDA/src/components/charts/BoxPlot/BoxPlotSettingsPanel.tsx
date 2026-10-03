import { ActionTooltip } from "@/components/ui/tooltip";
import { ComboBox } from "@/components/ComboBox";
import { FieldSelector } from "@/components/FieldSelector";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useColorScales } from "@/hooks/useColorScales";
import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { BoxPlotSettings } from "./definition";

export function BoxPlotSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<BoxPlotSettings>) {
  const { getOrCreateScaleForField } = useColorScales();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label>Numeric field</Label>
        <FieldSelector
          label=""
          placeholder="Numeric field"
          value={settings.field}
          onChange={(value) => onSettingsChange({ ...settings, field: value })}
        />
      </div>

      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
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
      </div>

      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label htmlFor="whiskerType">Whisker Type</Label>
        <ComboBox
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

      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label htmlFor="showOutliers">Show Outliers</Label>
        <ActionTooltip content="Show values beyond the whiskers as separate points.">
          <Switch
            id="showOutliers"
            checked={settings.showOutliers}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, showOutliers: checked })
            }
          />
        </ActionTooltip>
      </div>

      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label htmlFor="sortBy">Sort By</Label>
        <ComboBox
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

      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
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
        <ActionTooltip content="Show individual numeric values over the summary. The first 300 source rows per group are shown.">
          <Switch
            id="distribution-observations"
            checked={settings.showObservations ?? false}
            onCheckedChange={(showObservations) =>
              onSettingsChange({ ...settings, showObservations })
            }
          />
        </ActionTooltip>
      </div>

      {settings.violinOverlay && (
        <>
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <Label htmlFor="autoBandwidth">Auto Bandwidth</Label>
            <ActionTooltip content="Use the group spread and row count to choose density smoothing.">
              <Switch
                id="autoBandwidth"
                checked={settings.autoBandwidth}
                onCheckedChange={(checked) =>
                  onSettingsChange({ ...settings, autoBandwidth: checked })
                }
              />
            </ActionTooltip>
          </div>
          {!settings.autoBandwidth && (
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
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
