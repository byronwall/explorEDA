import { useId, useMemo, useState } from "react";
import { FieldSelector } from "@/components/FieldSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { isRegionGeometry } from "@/lib/geometryAssets";
import { displayAggregateValue } from "@/lib/aggregates";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import type { MapSettings } from "./definition";
import { planRegionMap } from "./regionMapPlan";
import { useMapData } from "./useMapData";

const selectClass =
  "h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm";
export function RegionMapSettings({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<MapSettings>) {
  const id = useId();
  const assets = useDataLayer((state) => state.geometryAssets);
  const addAsset = useDataLayer((state) => state.addGeometryAsset);
  const asset = assets.find((item) => item.id === settings.geometryAssetId);
  const { snapshot } = useMapData(settings);
  const plan = useMemo(
    () =>
      planRegionMap(
        settings,
        { ...snapshot, chartIds: snapshot.allIds },
        asset,
        500,
        300
      ),
    [settings, snapshot, asset]
  );
  const properties = [
    ...new Set(
      asset?.geometry.features.flatMap((feature) =>
        Object.keys(feature.properties ?? {})
      ) ?? []
    ),
  ];
  const [json, setJson] = useState(""),
    [name, setName] = useState("Regions"),
    [error, setError] = useState("");
  const importGeometry = (text: string, source: string, name: string) => {
    try {
      const geometry: unknown = JSON.parse(text);
      if (!isRegionGeometry(geometry))
        throw new Error(
          "Use a FeatureCollection of Polygon or MultiPolygon features. Coordinates must be WGS 84 degrees with closed rings."
        );
      const asset = {
        id: crypto.randomUUID(),
        name: name.trim() || "Regions",
        source,
        geometry,
      };
      addAsset(asset);
      onSettingsChange({
        ...settings,
        geometryAssetId: asset.id,
        featureKey: "",
        view: undefined,
        filters: [],
      });
      setError("");
      setJson("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not read the GeoJSON."
      );
    }
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[110px_1fr] items-center gap-3">
        <Label htmlFor={`${id}-asset`}>Geometry</Label>
        <select
          id={`${id}-asset`}
          className={selectClass}
          value={settings.geometryAssetId ?? ""}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              geometryAssetId: e.target.value,
              featureKey: "",
              view: undefined,
              filters: [],
            })
          }
        >
          <option value="">Choose geometry</option>
          {assets.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <details>
        <summary className="cursor-pointer text-sm">Import GeoJSON</summary>
        <div className="mt-2 space-y-2">
          <Label htmlFor={`${id}-file`}>GeoJSON file</Label>
          <Input
            id={`${id}-file`}
            type="file"
            accept=".geojson,.json,application/geo+json,application/json"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) {
                try {
                  importGeometry(await file.text(), file.name, file.name);
                } catch {
                  setError("Could not read this file.");
                }
              }
              event.target.value = "";
            }}
          />
          <Label htmlFor={`${id}-name`}>Geometry name</Label>
          <Input
            id={`${id}-name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Label htmlFor={`${id}-json`}>Paste GeoJSON</Label>
          <textarea
            id={`${id}-json`}
            className="h-28 w-full rounded border border-input bg-background p-2 font-mono text-xs"
            value={json}
            onChange={(event) => setJson(event.target.value)}
          />
          <Button
            size="sm"
            disabled={!json.trim()}
            onClick={() => importGeometry(json, "Pasted GeoJSON", name)}
          >
            Import geometry
          </Button>
          <p className="text-xs text-muted-foreground">
            Geometry is saved once in the analysis and can be used by several
            maps.
          </p>
        </div>
      </details>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <div className="grid grid-cols-[110px_1fr] items-center gap-3">
        <Label>Region key</Label>
        <FieldSelector
          label=""
          placeholder="Region key field"
          value={settings.regionField ?? ""}
          onChange={(regionField) =>
            onSettingsChange({ ...settings, regionField, filters: [] })
          }
        />
        <Label htmlFor={`${id}-key`}>Feature key</Label>
        <ActionTooltip content="Match a GeoJSON property or feature ID to the row key. Keys must have the same value and type; no text conversion is applied.">
          <select
            id={`${id}-key`}
            className={selectClass}
            value={settings.featureKey ?? ""}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                featureKey: e.target.value,
                filters: [],
              })
            }
          >
            <option value="">Choose a key</option>
            <option value="@id">Feature ID</option>
            {properties.map((property) => (
              <option value={property} key={property}>
                {property}
              </option>
            ))}
          </select>
        </ActionTooltip>
        <Label htmlFor={`${id}-operation`}>Operation</Label>
        <select
          id={`${id}-operation`}
          className={selectClass}
          value={settings.aggregation ?? "count"}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              aggregation: e.target.value as MapSettings["aggregation"],
            })
          }
        >
          <option value="count">Count rows</option>
          <option value="sum">Sum</option>
          <option value="average">Average</option>
        </select>
        {settings.aggregation !== "count" && (
          <>
            <Label>Measure</Label>
            <FieldSelector
              label=""
              placeholder="Measure field"
              value={settings.measureField ?? ""}
              onChange={(measureField) =>
                onSettingsChange({ ...settings, measureField })
              }
            />
          </>
        )}
        <Label htmlFor={`${id}-outline`}>Outline width</Label>
        <Input
          id={`${id}-outline`}
          type="number"
          min={0}
          max={4}
          step={0.5}
          value={settings.outlineWidth ?? 1}
          onChange={(e) => {
            const outlineWidth = Number(e.target.value);
            if (outlineWidth >= 0 && outlineWidth <= 4)
              onSettingsChange({ ...settings, outlineWidth });
          }}
        />
        <Label htmlFor={`${id}-labels`}>Region labels</Label>
        <ActionTooltip content="Show the joined region key at each visible region's center. Turn labels off when regions are small or overlap.">
          <input
            id={`${id}-labels`}
            className="justify-self-start"
            type="checkbox"
            checked={settings.showRegionLabels ?? false}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                showRegionLabels: e.target.checked,
              })
            }
          />
        </ActionTooltip>
      </div>
      {asset && settings.featureKey && settings.regionField && (
        <details open>
          <summary className="cursor-pointer text-sm">
            Join preview · all source rows
          </summary>
          <div className="mt-2 space-y-2 text-xs">
            <p>
              Exact value and type. Unmatched rows: {plan.unmatched.length} ·
              Unmatched regions:{" "}
              {plan.regions.filter((region) => !region.sourceIds.length).length}{" "}
              · Duplicate feature keys:{" "}
              {
                plan.regions.filter((region) => region.features.length > 1)
                  .length
              }
              .
            </p>
            <div className="overflow-auto rounded border border-border">
              <table className="w-full text-left">
                <caption className="px-2 py-1 text-left">
                  First {Math.min(6, plan.regions.length)} of{" "}
                  {plan.regions.length} region keys
                </caption>
                <thead>
                  <tr>
                    <th className="px-2 py-1">Feature key</th>
                    <th className="px-2 py-1 text-right">Features</th>
                    <th className="px-2 py-1 text-right">Rows</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.regions.slice(0, 6).map((region) => (
                    <tr key={region.id} className="border-t border-border">
                      <td className="px-2 py-1">
                        {displayAggregateValue(region.key)} ({typeof region.key}
                        )
                      </td>
                      <td className="px-2 py-1 text-right">
                        {region.features.length}
                      </td>
                      <td className="px-2 py-1 text-right">
                        {region.sourceIds.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Features with one key form one region. Inspect joins on the map to
              see every unmatched row and feature.
            </p>
          </div>
        </details>
      )}
    </div>
  );
}
