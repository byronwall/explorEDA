import { ChartSettings } from "@/types/ChartTypes";
import { RangeFilter } from "@/types/FilterTypes";
import { Input } from "../ui/input";

export function SelectionSettingsTab({
  settings,
  onSettingChange,
}: {
  settings: ChartSettings;
  onSettingChange: (key: string, value: unknown) => void;
}) {
  const fields =
    settings.type === "scatter"
      ? [settings.xField, settings.yField]
      : settings.type === "line"
        ? [settings.xField]
        : [settings.field];
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Set a precise numeric range, or drag on the chart. Empty bounds include
        all values.
      </p>
      {fields.filter(Boolean).map((field) => {
        const filter = settings.filters.find(
          (item): item is RangeFilter =>
            item.field === field && item.type === "range"
        );
        const change = (bound: "min" | "max", raw: string) => {
          const updated: RangeFilter = {
            ...filter,
            type: "range",
            field,
            [bound]: raw === "" ? undefined : Number(raw),
          };
          onSettingChange("filters", [
            ...settings.filters.filter((item) => item.field !== field),
            ...(updated.min === undefined && updated.max === undefined
              ? []
              : [updated]),
          ]);
        };
        return (
          <fieldset key={field} className="space-y-3 rounded-md border p-3">
            <legend className="px-1 text-sm font-medium">{field}</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span>Minimum</span>
                <Input
                  type="number"
                  step="any"
                  placeholder="No minimum"
                  value={filter?.min ?? ""}
                  onChange={(event) => change("min", event.target.value)}
                />
              </label>
              <label className="space-y-1">
                <span>Maximum</span>
                <Input
                  type="number"
                  step="any"
                  placeholder="No maximum"
                  value={filter?.max ?? ""}
                  onChange={(event) => change("max", event.target.value)}
                />
              </label>
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
