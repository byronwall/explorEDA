import { ChartSettings } from "@/types/ChartTypes";
import { RotateCcw } from "lucide-react";
import { ComboBox } from "../ComboBox";
import { NumericInputEnter } from "../NumericInputEnter";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

interface AxisSettingsTabProps {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}

interface ScaleType {
  value: string;
  label: string;
}

const SCALE_TYPES: ScaleType[] = [
  { value: "linear", label: "Linear" },
  { value: "log", label: "Logarithmic" },
  { value: "time", label: "Time" },
  { value: "band", label: "Band" },
];

const DEFAULT_AXIS_SETTINGS = {
  scaleType: "linear",
  grid: false,
  min: 0,
  max: 100,
};

export function AxisSettingsTab({
  settings,
  onSettingChange,
}: AxisSettingsTabProps) {
  const handleAxisChange = (axis: "x" | "y", key: string, value: unknown) => {
    onSettingChange(`${axis}Axis`, {
      ...settings[`${axis}Axis`],
      [key]: value,
    });
  };

  const handleAxisReset = () => {
    onSettingChange("xAxis", DEFAULT_AXIS_SETTINGS);
    onSettingChange("yAxis", DEFAULT_AXIS_SETTINGS);
    onSettingChange("xGridLines", 5);
    onSettingChange("yGridLines", 5);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr_1fr] gap-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAxisReset}
          className="h-8 px-2"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
        <h4 className="font-medium text-sm text-center">X Axis</h4>
        <h4 className="font-medium text-sm text-center">Y Axis</h4>
      </div>

      <div className="grid grid-cols-[120px_1fr_1fr] gap-x-4 gap-y-6 items-center">
        <Label>Scale Type</Label>
        <ComboBox
          value={SCALE_TYPES.find(
            (option) => option.value === (settings.xAxis?.scaleType || "linear")
          )}
          options={SCALE_TYPES}
          onChange={(option) =>
            handleAxisChange("x", "scaleType", option?.value)
          }
          optionToString={(option) => option.label}
          placeholder="X Scale"
        />
        <ComboBox
          value={SCALE_TYPES.find(
            (option) => option.value === (settings.yAxis?.scaleType || "linear")
          )}
          options={SCALE_TYPES}
          onChange={(option) =>
            handleAxisChange("y", "scaleType", option?.value)
          }
          optionToString={(option) => option.label}
          placeholder="Y Scale"
        />

        <Label>Grid Lines</Label>
        <NumericInputEnter
          value={settings.xGridLines ?? 5}
          onChange={(value) => onSettingChange("xGridLines", value)}
          min={0}
          max={20}
          stepSmall={1}
          stepMedium={2}
          stepLarge={5}
          placeholder="X Grid Lines"
        />
        <NumericInputEnter
          value={settings.yGridLines ?? 5}
          onChange={(value) => onSettingChange("yGridLines", value)}
          min={0}
          max={20}
          stepSmall={1}
          stepMedium={2}
          stepLarge={5}
          placeholder="Y Grid Lines"
        />

        <Label>Domain Min</Label>
        <NumericInputEnter
          value={settings.xAxis?.min || 0}
          onChange={(value) => handleAxisChange("x", "min", value)}
          placeholder="X Min"
          min={-1000}
          max={1000}
          stepSmall={1}
          stepMedium={10}
          stepLarge={100}
        />
        <NumericInputEnter
          value={settings.yAxis?.min || 0}
          onChange={(value) => handleAxisChange("y", "min", value)}
          placeholder="Y Min"
          min={-1000}
          max={1000}
          stepSmall={1}
          stepMedium={10}
          stepLarge={100}
        />

        <Label>Domain Max</Label>
        <NumericInputEnter
          value={settings.xAxis?.max || 100}
          onChange={(value) => handleAxisChange("x", "max", value)}
          placeholder="X Max"
          min={-1000}
          max={1000}
          stepSmall={1}
          stepMedium={10}
          stepLarge={100}
        />
        <NumericInputEnter
          value={settings.yAxis?.max || 100}
          onChange={(value) => handleAxisChange("y", "max", value)}
          placeholder="Y Max"
          min={-1000}
          max={1000}
          stepSmall={1}
          stepMedium={10}
          stepLarge={100}
        />
      </div>
    </div>
  );
}
