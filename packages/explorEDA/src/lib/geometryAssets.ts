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
const MAX_PROBLEMS = 5;

/** Why a position is unusable, or undefined when it is a WGS 84 point. */
function positionProblem(value: unknown) {
  if (!Array.isArray(value) || value.length < 2)
    return "is not a [longitude, latitude] pair";
  if (!value.every((part) => typeof part === "number" && Number.isFinite(part)))
    return "has a value that is not a finite number";
  if (Math.abs(value[0]) > 180)
    return `has longitude ${value[0]}, outside −180 to 180. Coordinates must be WGS 84 degrees`;
  if (Math.abs(value[1]) > 90)
    return `has latitude ${value[1]}, outside −90 to 90. Coordinates must be WGS 84 degrees`;
  return undefined;
}
function ringProblem(value: unknown, where: string) {
  if (!Array.isArray(value)) return `${where} is not a list of points`;
  for (let index = 0; index < value.length; index++) {
    const problem = positionProblem(value[index]);
    if (problem) return `${where}, point ${index} ${problem}`;
  }
  if (value.length < 4)
    return `${where} has ${value.length} points; a ring needs at least 4`;
  const first = value[0] as number[],
    last = value.at(-1) as number[];
  if (
    first.length !== last.length ||
    !first.every((part, index) => part === last[index])
  )
    return `${where} is not closed: its last point must repeat its first`;
  return undefined;
}
function polygonProblem(value: unknown, where: string) {
  if (!Array.isArray(value) || !value.length) return `${where} has no rings`;
  for (let index = 0; index < value.length; index++) {
    const problem = ringProblem(value[index], `${where}, ring ${index}`);
    if (problem) return problem;
  }
  return undefined;
}
function featureProblem(feature: unknown, index: number) {
  const name =
    record(feature) && feature.id !== undefined && feature.id !== null
      ? `Feature ${index} (${JSON.stringify(feature.id)})`
      : `Feature ${index}`;
  if (!record(feature) || feature.type !== "Feature")
    return `${name} is not a GeoJSON Feature`;
  if (!(feature.properties === null || record(feature.properties)))
    return `${name} has properties that are not an object`;
  if (
    feature.id !== undefined &&
    typeof feature.id !== "string" &&
    !(typeof feature.id === "number" && Number.isFinite(feature.id))
  )
    return `${name} has an ID that is not a string or number`;
  const geometry = feature.geometry;
  if (!record(geometry)) return `${name} has no geometry`;
  if (geometry.type === "Polygon")
    return polygonProblem(geometry.coordinates, name);
  if (geometry.type === "MultiPolygon") {
    if (!Array.isArray(geometry.coordinates) || !geometry.coordinates.length)
      return `${name} has no polygons`;
    for (let part = 0; part < geometry.coordinates.length; part++) {
      const problem = polygonProblem(
        geometry.coordinates[part],
        `${name}, polygon ${part}`
      );
      if (problem) return problem;
    }
    return undefined;
  }
  return `${name} is a ${String(geometry.type)}; use Polygon or MultiPolygon`;
}

/**
 * The first few reasons a value is not a usable region FeatureCollection,
 * each naming the feature, ring, and point. Empty when it is usable.
 */
export function regionGeometryProblems(value: unknown): string[] {
  if (!record(value) || value.type !== "FeatureCollection")
    return [
      record(value) && typeof value.type === "string"
        ? `This is a ${value.type}; use a FeatureCollection of Polygon or MultiPolygon features`
        : "Use a GeoJSON FeatureCollection of Polygon or MultiPolygon features",
    ];
  if (!Array.isArray(value.features) || !value.features.length)
    return ["The FeatureCollection has no features"];
  const problems: string[] = [];
  value.features.forEach((feature, index) => {
    const problem = featureProblem(feature, index);
    if (problem) problems.push(problem);
  });
  if (problems.length > MAX_PROBLEMS)
    return [
      ...problems.slice(0, MAX_PROBLEMS),
      `${problems.length - MAX_PROBLEMS} more features have problems`,
    ];
  return problems;
}

export function isRegionGeometry(value: unknown): value is RegionGeometry {
  return regionGeometryProblems(value).length === 0;
}

/** Feature and vertex counts, shown before and after an import. */
export function regionGeometrySize(geometry: RegionGeometry) {
  let vertices = 0;
  for (const feature of geometry.features) {
    const polygons =
      feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;
    for (const polygon of polygons)
      for (const ring of polygon) vertices += ring.length;
  }
  return { features: geometry.features.length, vertices };
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
