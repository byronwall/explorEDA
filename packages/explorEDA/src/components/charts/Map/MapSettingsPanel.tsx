import { RegionMapSettings } from "./RegionMapSettings";
import { FieldSelector } from "@/components/FieldSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import { useColorScales } from "@/hooks/useColorScales";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import type { MapSettings } from "./definition";
import { WORLD_VIEW } from "./mapGeometry";

export function MapSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<MapSettings>) {
  const { getOrCreateScaleForField } = useColorScales();
  const view = settings.view ?? WORLD_VIEW;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[110px_1fr] items-center gap-3">
        <Label htmlFor={`map-mode-${settings.id}`}>Map mode</Label>
        <ActionTooltip content="Points use coordinates from each row. Regions join rows to polygon keys and summarize a measure.">
          <select
            id={`map-mode-${settings.id}`}
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm"
            value={settings.mode}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                mode: e.target.value as MapSettings["mode"],
                aggregation: settings.aggregation ?? "count",
                geometryAssetId: settings.geometryAssetId ?? "",
                regionField: settings.regionField ?? "",
                featureKey: settings.featureKey ?? "",
                showRegionLabels: settings.showRegionLabels ?? false,
                outlineWidth: settings.outlineWidth ?? 1,
                filters: [],
                view: undefined,
                colorField: undefined,
                colorScaleId: undefined,
              })
            }
          >
            <option value="point">Point</option>
            <option value="region">Region</option>
          </select>
        </ActionTooltip>
      </div>
      {settings.mode === "region" && (
        <RegionMapSettings
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      )}
      <div className="grid grid-cols-[110px_1fr] items-center gap-3">
        {settings.mode === "point" && (
          <>
            <Label>Latitude (°)</Label>
            <FieldSelector
              label=""
              placeholder="Latitude field"
              value={settings.latitudeField}
              onChange={(value) =>
                onSettingsChange({ ...settings, latitudeField: value })
              }
            />
            <Label>Longitude (°)</Label>
            <FieldSelector
              label=""
              placeholder="Longitude field"
              value={settings.longitudeField}
              onChange={(value) =>
                onSettingsChange({ ...settings, longitudeField: value })
              }
            />
            <Label>Point label</Label>
            <FieldSelector
              label=""
              placeholder="Point label field"
              allowClear
              value={settings.labelField ?? ""}
              onChange={(value) =>
                onSettingsChange({
                  ...settings,
                  labelField: value || undefined,
                })
              }
            />
            <Label>Color by</Label>
            <FieldSelector
              label=""
              placeholder="Color field"
              allowClear
              value={settings.colorField ?? ""}
              onChange={(value) =>
                onSettingsChange({
                  ...settings,
                  colorField: value || undefined,
                  colorScaleId: value
                    ? getOrCreateScaleForField(value)
                    : undefined,
                })
              }
            />
            <Label>Size by</Label>
            <FieldSelector
              label=""
              placeholder="Size field"
              allowClear
              value={settings.sizeField ?? ""}
              onChange={(value) =>
                onSettingsChange({ ...settings, sizeField: value || undefined })
              }
            />
            <Label htmlFor={`map-radius-${settings.id}`}>
              {settings.sizeField ? "Largest radius" : "Point radius"}
            </Label>
            <ActionTooltip
              content={
                settings.sizeField
                  ? "Bubble area is proportional to a nonnegative size. This radius represents the largest value in all source rows. Zero is hollow."
                  : "Point radius in pixels. Use small points and lower opacity to show overlap."
              }
            >
              <Input
                id={`map-radius-${settings.id}`}
                type="number"
                min={2}
                max={32}
                value={settings.pointRadius}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 2 && value <= 32)
                    onSettingsChange({ ...settings, pointRadius: value });
                }}
              />
            </ActionTooltip>
            <Label htmlFor={`map-opacity-${settings.id}`}>Opacity</Label>
            <Input
              id={`map-opacity-${settings.id}`}
              type="number"
              min={0.1}
              max={1}
              step={0.1}
              value={settings.pointOpacity}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0.1 && value <= 1)
                  onSettingsChange({ ...settings, pointOpacity: value });
              }}
            />
          </>
        )}
        <Label htmlFor={`map-projection-${settings.id}`}>Projection</Label>
        <ActionTooltip content="Equal Earth preserves relative geographic areas. Equirectangular places longitude and latitude on straight, equally spaced lines.">
          <select
            id={`map-projection-${settings.id}`}
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm"
            value={settings.projection}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                projection: e.target.value as MapSettings["projection"],
              })
            }
          >
            <option value="equal-earth">Equal Earth</option>
            <option value="equirectangular">Equirectangular</option>
          </select>
        </ActionTooltip>
      </div>
      <p className="text-xs text-muted-foreground">
        {settings.mode === "point"
          ? "Use WGS 84 decimal degrees: latitude −90 to 90, longitude −180 to 180. Click a point to select its row. Drag to pan."
          : "Click a region to select its joined rows. Inspect a region to see its metric and source records. Drag to pan."}
      </p>
      <details>
        <summary className="cursor-pointer text-sm">Map view</summary>
        <div className="mt-3 grid grid-cols-[110px_1fr] items-center gap-3">
          {([0, 1] as const).map((axis) => (
            <div className="contents" key={axis}>
              <Label htmlFor={`map-center-${axis}-${settings.id}`}>
                Center {axis === 0 ? "longitude" : "latitude"}
              </Label>
              <Input
                id={`map-center-${axis}-${settings.id}`}
                type="number"
                min={axis === 0 ? -180 : -90}
                max={axis === 0 ? 180 : 90}
                step={1}
                value={Number(view.center[axis].toFixed(5))}
                onChange={(e) => {
                  const value = Number(e.target.value),
                    limit = axis === 0 ? 180 : 90;
                  if (Number.isFinite(value) && Math.abs(value) <= limit) {
                    const center: [number, number] = [...view.center];
                    center[axis] = value;
                    onSettingsChange({
                      ...settings,
                      view: { ...view, center },
                    });
                  }
                }}
              />
            </div>
          ))}
          <Label htmlFor={`map-zoom-${settings.id}`}>Zoom</Label>
          <ActionTooltip content="Magnification relative to the world view. This geographic view is saved and refits when the chart is resized.">
            <Input
              id={`map-zoom-${settings.id}`}
              type="number"
              min={1}
              max={64}
              step={0.5}
              value={Number(view.zoom.toFixed(3))}
              onChange={(e) => {
                const zoom = Number(e.target.value);
                if (zoom >= 1 && zoom <= 64)
                  onSettingsChange({ ...settings, view: { ...view, zoom } });
              }}
            />
          </ActionTooltip>
        </div>
      </details>
    </div>
  );
}
