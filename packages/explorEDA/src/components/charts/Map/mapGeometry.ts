import {
  geoEqualEarth,
  geoEquirectangular,
  geoGraticule10,
  geoPath,
} from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land from "world-atlas/land-110m.json";
import type { MapSettings, MapView } from "./definition";

const topology = land as unknown as Topology<{ land: GeometryCollection }>;
export const worldLand = feature(topology, topology.objects.land);
export const graticule = geoGraticule10();
export const WORLD_VIEW: MapView = { center: [0, 0], zoom: 1 };
export const wrapLongitude = (longitude: number) =>
  ((((longitude + 180) % 360) + 360) % 360) - 180;
export const projectionLabel = (type: MapSettings["projection"]) =>
  type === "equal-earth" ? "Equal Earth" : "Equirectangular";

export function mapProjection(
  type: MapSettings["projection"],
  view: MapView,
  width: number,
  height: number
) {
  const projection =
    type === "equal-earth" ? geoEqualEarth() : geoEquirectangular();
  projection.fitExtent(
    [
      [12, 12],
      [Math.max(13, width - 12), Math.max(13, height - 12)],
    ],
    { type: "Sphere" }
  );
  const worldScale = projection.scale();
  return projection
    .rotate([-view.center[0], 0])
    .center([0, view.center[1]])
    .scale(worldScale * view.zoom)
    .translate([width / 2, height / 2])
    .clipExtent([
      [0, 0],
      [width, height],
    ]);
}

/** The smallest longitude arc fits nearby points on either side of 180°. */
export function fitMapCoordinates(
  coordinates: [number, number][],
  type: MapSettings["projection"],
  width: number,
  height: number
): MapView {
  if (!coordinates.length) return WORLD_VIEW;
  const longitudes = coordinates
    .map(([x]) => wrapLongitude(x))
    .sort((a, b) => a - b);
  let gap = -1;
  let start = longitudes[0]!;
  for (let i = 0; i < longitudes.length; i++) {
    const next =
      longitudes[(i + 1) % longitudes.length]! +
      (i === longitudes.length - 1 ? 360 : 0);
    if (next - longitudes[i]! > gap) {
      gap = next - longitudes[i]!;
      start = next;
    }
  }
  const longitude = wrapLongitude(start + (360 - gap) / 2);
  const projection = mapProjection(
    type,
    { center: [longitude, 0], zoom: 1 },
    width,
    height
  );
  const points = coordinates.map((point) => projection(point)!);
  const bounds = points.reduce(
    (b, [x, y]) => [
      Math.min(b[0]!, x),
      Math.max(b[1]!, x),
      Math.min(b[2]!, y),
      Math.max(b[3]!, y),
    ],
    [Infinity, -Infinity, Infinity, -Infinity]
  );
  const [minX, maxX, minY, maxY] = bounds as [number, number, number, number];
  const center = projection.invert!([(minX + maxX) / 2, (minY + maxY) / 2])!;
  // A single location gets a regional view, with enough room for its marker.
  const zoom = Math.min(
    32,
    Math.max(
      1,
      Math.min(
        Math.max(1, width - 64) / Math.max(1, maxX - minX),
        Math.max(1, height - 64) / Math.max(1, maxY - minY)
      )
    )
  );
  return {
    center: [wrapLongitude(center[0]), Math.max(-90, Math.min(90, center[1]))],
    zoom,
  };
}

export function mapPaths(projection: ReturnType<typeof mapProjection>) {
  const path = geoPath(projection);
  return {
    land: path(worldLand) ?? "",
    grid: path(graticule) ?? "",
    outline: path({ type: "Sphere" }) ?? "",
  };
}
