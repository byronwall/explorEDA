import { useDataLayer } from "@/providers/DataLayerProvider";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

export function GridSettingsPanel() {
  const gridSettings = useDataLayer((s) => s.gridSettings);
  const updateGridSettings = useDataLayer((s) => s.updateGridSettings);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="grid-columns">Columns</Label>
        <Input
          id="grid-columns"
          type="number"
          value={gridSettings.columnCount}
          onChange={(e) => {
            if (e.target.value && e.target.validity.valid)
              updateGridSettings({ columnCount: e.target.valueAsNumber });
          }}
          min={1}
          max={24}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="grid-row-height">Row height (px)</Label>
        <Input
          id="grid-row-height"
          type="number"
          value={gridSettings.rowHeight}
          onChange={(e) => {
            if (e.target.value && e.target.validity.valid)
              updateGridSettings({ rowHeight: e.target.valueAsNumber });
          }}
          min={20}
          max={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="grid-padding">Outer spacing (px)</Label>
        <Input
          id="grid-padding"
          type="number"
          value={gridSettings.containerPadding}
          onChange={(e) => {
            if (e.target.value && e.target.validity.valid)
              updateGridSettings({ containerPadding: e.target.valueAsNumber });
          }}
          min={0}
          max={50}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="show-markers"
          checked={gridSettings.showBackgroundMarkers}
          onCheckedChange={(checked) =>
            updateGridSettings({ showBackgroundMarkers: checked })
          }
        />
        <Label htmlFor="show-markers">Show Grid Markers</Label>
      </div>
    </div>
  );
}
