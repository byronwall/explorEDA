import { FieldSelector } from "@/components/FieldSelector";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import type { TimelineSettings } from "./definition";

export function TimelineSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<TimelineSettings>) {
  // New fields change what the window and selection mean, so they clear.
  const change = (next: Partial<TimelineSettings>) =>
    onSettingsChange({ ...settings, filters: [], ...next });
  return (
    <div className="eda-setting-grid">
      <Label>Lanes</Label>
      <ActionTooltip content="Each value gets its own lane, such as a room, machine, or person.">
        <FieldSelector
          label=""
          placeholder="Lane field"
          value={settings.field}
          onChange={(field) => change({ field })}
        />
      </ActionTooltip>
      <Label>Start</Label>
      <ActionTooltip content="When each row begins. Times read as UTC.">
        <FieldSelector
          label=""
          placeholder="Start field"
          value={settings.startField}
          onChange={(startField) => change({ startField })}
        />
      </ActionTooltip>
      <Label>End</Label>
      <ActionTooltip content="When each row ends. A blank end has not ended: it runs to the last time in the data.">
        <FieldSelector
          label=""
          placeholder="End field"
          value={settings.endField}
          onChange={(endField) => change({ endField })}
        />
      </ActionTooltip>
      <Label>Color</Label>
      <ActionTooltip content="Optional. Colors bars by a category, such as status or team.">
        <FieldSelector
          label=""
          placeholder="One color"
          allowClear
          value={settings.colorField ?? ""}
          onChange={(colorField) =>
            onSettingsChange({
              ...settings,
              colorField: colorField || undefined,
              colorScaleId: undefined,
            })
          }
        />
      </ActionTooltip>
    </div>
  );
}
