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
        <Label>Title Text</Label>
        <Input
          value={settings.title || ""}
          onChange={(e) => onSettingChange("title", e.target.value)}
          placeholder="Enter chart title"
        />

        <Label>X Axis Label</Label>
        <Input
          value={settings.xAxisLabel || ""}
          onChange={(e) => onSettingChange("xAxisLabel", e.target.value)}
          placeholder="Enter X axis label"
        />

        <Label>Y Axis Label</Label>
        <Input
          value={settings.yAxisLabel || ""}
          onChange={(e) => onSettingChange("yAxisLabel", e.target.value)}
          placeholder="Enter Y axis label"
        />
      </div>
    </div>
  );
}
