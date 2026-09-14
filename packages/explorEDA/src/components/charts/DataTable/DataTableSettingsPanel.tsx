import { ComboBox } from "@/components/ComboBox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MultiSelect, { Option } from "@/components/ui/multi-select";
import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { useColumnNames } from "../PivotTable/useColumnNames";
import { DataTableSettings } from "./definition";

const PAGE_SIZE_OPTIONS = [
  { label: "10 rows", value: 10 },
  { label: "25 rows", value: 25 },
  { label: "50 rows", value: 50 },
  { label: "100 rows", value: 100 },
  ];

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
              columns: values.map((v) => ({
                id: v.value,
                field: v.value,
              })),
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Page Size</Label>
        <ComboBox
          options={PAGE_SIZE_OPTIONS}
          value={PAGE_SIZE_OPTIONS.find((o) => o.value === settings.pageSize)}
          onChange={(option) =>
            onSettingsChange({
              ...settings,
              pageSize: option?.value || 25,
            })
          }
          optionToString={(option) => option.label}
        />
      </div>

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
