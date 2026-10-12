import { useId, useMemo, useState } from "react";
import { FieldSelector } from "@/components/FieldSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  regionGeometryProblems,
  regionGeometrySize,
  type RegionGeometry,
} from "@/lib/geometryAssets";
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
    [errors, setErrors] = useState<string[]>([]);
  const importGeometry = (text: string, source: string, name: string) => {
    let geometry: unknown;
    try {
      geometry = JSON.parse(text);
    } catch (error) {
      setErrors([
        `Not valid JSON: ${error instanceof Error ? error.message : "could not parse"}`,
      ]);
      return;
    }
    const problems = regionGeometryProblems(geometry);
    if (problems.length) {
      setErrors(problems);
      return;
    }
    const asset = {
      id: crypto.randomUUID(),
      name: name.trim() || "Regions",
      source,
      geometry: geometry as RegionGeometry,
    };
    // Assign first, so a failed assignment never leaves an orphaned asset.
    try {
      onSettingsChange({
        ...settings,
        geometryAssetId: asset.id,
        featureKey: "",
        view: undefined,
        filters: [],
      });
    } catch (error) {
      setErrors([
        `Could not use this geometry: ${error instanceof Error ? error.message : "the chart rejected it"}`,
      ]);
      return;
    }
    addAsset(asset);
    setErrors([]);
    setJson("");
  };
  const size = asset && regionGeometrySize(asset.geometry);
  // Row keys that match a feature key's text but not its type.
  const typeMismatches = useMemo(() => {
    const byText = new Map(
      plan.regions
        .filter((region) => region.key !== undefined)
        .map((region) => [String(region.key), region.key])
    );
    return plan.unmatched.flatMap((row) => {
      const feature = byText.get(String(row.key));
      return row.key != null && feature !== undefined
        ? [{ key: row.key, feature }]
        : [];
    });
  }, [plan]);
  const unmatchedSamples = [
    ...new Map(
      plan.unmatched.map((row) => [`${typeof row.key}:${String(row.key)}`, row])
    ).values(),
  ].slice(0, 4);
  return (
    <div className="space-y-2">
      <div className="eda-setting-grid">
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
        {size && (
          <p className="col-start-2 text-xs text-muted-foreground">
            {size.features.toLocaleString()}{" "}
            {size.features === 1 ? "feature" : "features"} ·{" "}
            {size.vertices.toLocaleString()} vertices · {asset.source}
          </p>
        )}
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
                  setErrors(["Could not read this file."]);
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
      {errors.length > 0 && (
        <div role="alert" className="text-xs text-destructive">
          <p>Nothing was imported.</p>
          <ul className="list-disc pl-4">
            {errors.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="eda-setting-grid">
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
            {unmatchedSamples.length > 0 && (
              <p>
                Unmatched row keys:{" "}
                {unmatchedSamples
                  .map((row) =>
                    row.key == null
                      ? "missing"
                      : `${displayAggregateValue(row.key)} (${typeof row.key})`
                  )
                  .join(", ")}
                {plan.unmatched.length > unmatchedSamples.length && ", …"}
              </p>
            )}
            {typeMismatches.length > 0 && (
              <p className="text-warning">
                {typeMismatches.length}{" "}
                {typeMismatches.length === 1 ? "row matches" : "rows match"} a
                feature key only as text, such as{" "}
                {displayAggregateValue(typeMismatches[0]!.key)} (
                {typeof typeMismatches[0]!.key}) and{" "}
                {displayAggregateValue(typeMismatches[0]!.feature)} (
                {typeof typeMismatches[0]!.feature}). Keys must match in type
                too; convert the field&apos;s type to join them.
              </p>
            )}
            <p>
              Features with one key form one region. Alt-click outside the
              regions on the map to see every unmatched row and feature.
            </p>
          </div>
        </details>
      )}
    </div>
  );
}
