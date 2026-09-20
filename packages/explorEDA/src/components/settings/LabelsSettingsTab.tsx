import { ChartSettings } from "@/types/ChartTypes";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface LabelsSettingsTabProps {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}

export function LabelsSettingsTab({
  settings,
  onSettingChange,
}: LabelsSettingsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        <Label htmlFor="chart-title">Chart title</Label>
        <Input
          id="chart-title"
          value={settings.title || ""}
          onChange={(e) => onSettingChange("title", e.target.value)}
          placeholder="Enter chart title"
        />

        {["row", "bar", "scatter", "line", "boxplot"].includes(
          settings.type
        ) && (
          <>
            <Label htmlFor="chart-x-label">X axis & units</Label>
            <Input
              id="chart-x-label"
              value={settings.xAxisLabel || ""}
              onChange={(e) => onSettingChange("xAxisLabel", e.target.value)}
              placeholder="Enter X axis label"
            />

            <Label htmlFor="chart-y-label">Y axis & units</Label>
            <Input
              id="chart-y-label"
              value={settings.yAxisLabel || ""}
              onChange={(e) => onSettingChange("yAxisLabel", e.target.value)}
              placeholder="Enter Y axis label"
            />
            <p className="col-start-2 text-xs text-muted-foreground">
              Leave an axis label blank to inherit the field label. Text here
              always stays local to this chart.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
