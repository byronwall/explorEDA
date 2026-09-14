import { ChartSettings } from "@/types/ChartTypes";
import { Label } from "../ui/label";
import { NumericInputEnter } from "../NumericInputEnter";

interface AdvancedSettingsTabProps {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}

export function AdvancedSettingsTab({
  settings,
  onSettingChange,
}: AdvancedSettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* General Chart Settings */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm">General Settings</h3>

        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <Label htmlFor="margin">Chart Margin</Label>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-start-2">
              <NumericInputEnter
                value={settings.margin?.top || 20}
                onChange={(value) =>
                  onSettingChange("margin", {
                    ...settings.margin,
                    top: value,
                  })
                }
                min={0}
                max={100}
                stepSmall={1}
                stepMedium={5}
                stepLarge={10}
                placeholder="Top"
              />
            </div>
            <div className="col-start-1 row-start-2">
              <NumericInputEnter
                value={settings.margin?.left || 20}
                onChange={(value) =>
                  onSettingChange("margin", {
                    ...settings.margin,
                    left: value,
                  })
                }
                min={0}
                max={100}
                stepSmall={1}
                stepMedium={5}
                stepLarge={10}
                placeholder="Left"
              />
            </div>
            <div className="col-start-3 row-start-2">
              <NumericInputEnter
                value={settings.margin?.right || 20}
                onChange={(value) =>
                  onSettingChange("margin", {
                    ...settings.margin,
                    right: value,
                  })
                }
                min={0}
                max={100}
                stepSmall={1}
                stepMedium={5}
                stepLarge={10}
                placeholder="Right"
              />
            </div>
            <div className="col-start-2 row-start-3">
              <NumericInputEnter
                value={settings.margin?.bottom || 20}
                onChange={(value) =>
                  onSettingChange("margin", {
                    ...settings.margin,
                    bottom: value,
                  })
                }
                min={0}
                max={100}
                stepSmall={1}
                stepMedium={5}
                stepLarge={10}
                placeholder="Bottom"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
