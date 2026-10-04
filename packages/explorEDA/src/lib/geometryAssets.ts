import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";

export type RegionGeometry = FeatureCollection<Polygon | MultiPolygon>;
export interface GeometryAsset {
  id: string;
  name: string;
  source: string;
  geometry: RegionGeometry;
}

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const position = (value: unknown): value is number[] =>
  Array.isArray(value) &&
  value.length >= 2 &&
  value.every((part) => typeof part === "number" && Number.isFinite(part)) &&
  Math.abs(value[0]) <= 180 &&
  Math.abs(value[1]) <= 90;
const ring = (value: unknown) =>
  Array.isArray(value) &&
  value.length >= 4 &&
  value.every(position) &&
  value[0]!.length === value.at(-1)!.length &&
  value[0]!.every(
    (part: number, index: number) => part === value.at(-1)![index]
  );
const polygon = (value: unknown) =>
  Array.isArray(value) && value.length > 0 && value.every(ring);

export function isRegionGeometry(value: unknown): value is RegionGeometry {
  return (
    record(value) &&
    value.type === "FeatureCollection" &&
    Array.isArray(value.features) &&
    value.features.length > 0 &&
    value.features.every((feature) => {
      if (
        !record(feature) ||
        feature.type !== "Feature" ||
        !(feature.properties === null || record(feature.properties)) ||
        (feature.id !== undefined &&
          typeof feature.id !== "string" &&
          !(typeof feature.id === "number" && Number.isFinite(feature.id))) ||
        !record(feature.geometry)
      )
        return false;
      const geometry = feature.geometry;
      return geometry.type === "Polygon"
        ? polygon(geometry.coordinates)
        : geometry.type === "MultiPolygon" &&
            Array.isArray(geometry.coordinates) &&
            geometry.coordinates.length > 0 &&
            geometry.coordinates.every(polygon);
    })
  );
}

export function isGeometryAsset(value: unknown): value is GeometryAsset {
  return (
    record(value) &&
    typeof value.id === "string" &&
    Boolean(value.id) &&
    typeof value.name === "string" &&
    typeof value.source === "string" &&
    isRegionGeometry(value.geometry)
  );
}
