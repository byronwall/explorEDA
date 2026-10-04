import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ActionTooltip } from "@/components/ui/tooltip";
import { FieldPicker } from "@/components/FieldList/FieldPicker";
import { pickColumns } from "./columnOps";
import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { DataTableSettings } from "./definition";

export function DataTableSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<DataTableSettings>) {
  return (
    <div className="space-y-4">
      <ActionTooltip content="Draws each field’s distribution under its column name. Click or drag a distribution to filter the column.">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="showDistributions">Distributions in headers</Label>
          <Switch
            id="showDistributions"
            checked={settings.showDistributions !== false}
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

      <FieldPicker
        heading="Columns"
        selected={settings.columns.map((column) => column.field)}
        onChange={(fields) =>
          onSettingsChange({
            ...settings,
            columns: pickColumns(settings.columns, fields),
          })
        }
      />
    </div>
  );
}
