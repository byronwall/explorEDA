import { finiteNumber } from "@/lib/numeric";
import { makeColorScale } from "@/lib/colorScaleMath";
import type { datum } from "@/types/ChartTypes";
import type { ColorScaleType } from "@/types/ColorScaleTypes";
import type { Filter } from "@/types/FilterTypes";
import type { MapSettings } from "./definition";
import { mapProjection, WORLD_VIEW } from "./mapGeometry";

export interface MapSnapshot {
  revision: string;
  allIds: number[];
  chartIds: number[];
  filteredIds: number[];
  facetIds?: number[];
  columns: Record<string, Record<number, datum>>;
  colorScale?: ColorScaleType;
}
export interface MapPoint {
  sourceId: number;
  label: string;
  latitude?: number;
  longitude?: number;
  value?: number;
  x?: number;
  y?: number;
  radius: number;
  color: string;
  inScope: boolean;
  matching: boolean;
  offscreen: boolean;
  reason?: string;
}
export const MAP_FOOTER = 64;
export function coordinateReason(
  latitude: number | undefined,
  longitude: number | undefined
) {
  if (latitude === undefined) return "Latitude is missing or not finite";
  if (longitude === undefined) return "Longitude is missing or not finite";
  if (latitude < -90 || latitude > 90) return "Latitude is outside −90 to 90°";
  if (longitude < -180 || longitude > 180)
    return "Longitude is outside −180 to 180°";
  return undefined;
}
export function planPointMap(
  settings: MapSettings,
  snapshot: MapSnapshot,
  width: number,
  height: number
) {
  const mapHeight = Math.max(
    40,
    height -
      MAP_FOOTER -
      (settings.sizeField ? settings.pointRadius * 2 + 12 : 0)
  );
  const view = settings.view ?? WORLD_VIEW;
  const projection = mapProjection(settings.projection, view, width, mapHeight);
  const get = (field: string | undefined, id: number) =>
    field ? snapshot.columns[field]?.[id] : undefined;
  const maxSize = settings.sizeField
    ? snapshot.allIds.reduce(
        (max, id) =>
          Math.max(max, finiteNumber(get(settings.sizeField, id)) ?? 0),
        0
      )
    : 0;
  const color = snapshot.colorScale
    ? makeColorScale(snapshot.colorScale)
    : undefined;
  const live = new Set(snapshot.chartIds),
    matching = new Set(snapshot.filteredIds);
  const facet = snapshot.facetIds ? new Set(snapshot.facetIds) : undefined;
  const coordinates: [number, number][] = [];
  const rows: MapPoint[] = [];
  for (const sourceId of snapshot.allIds) {
    const latitude = finiteNumber(get(settings.latitudeField, sourceId));
    const longitude = finiteNumber(get(settings.longitudeField, sourceId));
    let reason = coordinateReason(latitude, longitude);
    if (!reason) coordinates.push([longitude!, latitude!]);
    if (facet && !facet.has(sourceId)) continue;
    const value = finiteNumber(get(settings.sizeField, sourceId));
    if (!reason && settings.sizeField && (value === undefined || value < 0))
      reason = "Size is missing, invalid, or negative";
    const xy = reason ? undefined : projection([longitude!, latitude!]);
    const x = xy?.[0],
      y = xy?.[1];
    if (
      !reason &&
      (x === undefined ||
        y === undefined ||
        !Number.isFinite(x) ||
        !Number.isFinite(y))
    )
      reason = "No finite projected position";
    const label = get(settings.labelField, sourceId);
    rows.push({
      sourceId,
      label: label == null ? `Row ${sourceId}` : String(label),
      latitude,
      longitude,
      value,
      x,
      y,
      radius: settings.sizeField
        ? value === 0
          ? 2
          : maxSize > 0 && value !== undefined
            ? settings.pointRadius * Math.sqrt(value / maxSize)
            : 2
        : settings.pointRadius,
      color: color
        ? (color(get(settings.colorField, sourceId)) ??
          "var(--muted-foreground)")
        : "var(--primary)",
      inScope: live.has(sourceId),
      matching: matching.has(sourceId),
      offscreen: !reason && (x! < 0 || x! > width || y! < 0 || y! > mapHeight),
      reason,
    });
  }
  const scope = rows.filter((row) => row.inScope);
  const points = scope
    .filter((row) => !row.reason && !row.offscreen)
    .sort((a, b) => b.radius - a.radius || a.sourceId - b.sourceId);
  return {
    revision: snapshot.revision,
    rows,
    points,
    coordinates,
    view,
    projection,
    mapHeight,
    width,
    maxSize,
    excluded: scope.filter((row) => row.reason),
    offscreen: scope.filter((row) => row.offscreen),
    scopeCount: scope.length,
    hasSelection: settings.filters.length > 0,
    configured: Boolean(settings.latitudeField && settings.longitudeField),
  };
}
export type PointMapPlan = ReturnType<typeof planPointMap>;
export function mapPointFilters(
  settings: MapSettings,
  sourceId: number
): Filter[] {
  const selected =
    settings.filters.length === 1 &&
    settings.filters[0]?.type === "value" &&
    settings.filters[0].field === "__ID" &&
    settings.filters[0].values.length === 1 &&
    settings.filters[0].values[0] === sourceId;
  return selected ? [] : [{ type: "value", field: "__ID", values: [sourceId] }];
}
