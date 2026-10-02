import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ActionTooltip } from "@/components/ui/tooltip";
import MultiSelect, { Option } from "@/components/ui/multi-select";
import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { useColumnNames } from "../PivotTable/useColumnNames";
import { DataTableSettings } from "./definition";

export function DataTableSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<DataTableSettings>) {
  const availableFields = useColumnNames();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Columns</Label>
        <MultiSelect
          options={availableFields.map((f) => ({
            label: f,
            value: f,
          }))}
          value={settings.columns.map((col) => ({
            label: col.field,
            value: col.field,
          }))}
          onChange={(values: Option[]) =>
            onSettingsChange({
              ...settings,
              columns: values.map(
                (v) =>
                  settings.columns.find(
                    (column) => column.field === v.value
                  ) ?? {
                    id: v.value,
                    field: v.value,
                  }
              ),
            })
          }
        />
      </div>

      <ActionTooltip content="Draws each field’s distribution under its column name. Click or drag a distribution to filter the column.">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="showDistributions">Distributions in headers</Label>
          <Switch
            id="showDistributions"
            checked={Boolean(settings.showDistributions)}
            onCheckedChange={(showDistributions) =>
              onSettingsChange({ ...settings, showDistributions })
            }
          />
        </div>
      </ActionTooltip>

      <div className="space-y-2">
        <Label>Global Search</Label>
        <Input
          placeholder="Search all columns..."
          value={settings.globalSearch}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              globalSearch: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}
