import { geoBounds, geoPath } from "d3-geo";
import type { Position } from "geojson";
import type { RegionGeometry } from "@/lib/geometryAssets";
import type { MapSettings, MapView } from "./definition";
import { mapProjection, WORLD_VIEW, wrapLongitude } from "./mapGeometry";

// GeoJSON uses the opposite ring direction from D3's spherical paths.
// Unwrap adjacent longitudes before checking the ring direction at the date line.
function orient(ring: Position[], clockwise: boolean) {
  let x = ring[0]![0]!,
    area = 0;
  for (let i = 1; i < ring.length; i++) {
    const next = x + wrapLongitude(ring[i]![0]! - ring[i - 1]![0]!);
    area += x * ring[i]![1]! - next * ring[i - 1]![1]!;
    x = next;
  }
  return area < 0 === clockwise ? ring : [...ring].reverse();
}
export function regionGeometry(geometry: RegionGeometry): RegionGeometry {
  const rings = (polygon: Position[][]) =>
    polygon.map((ring, i) => orient(ring, i === 0));
  return {
    ...geometry,
    features: geometry.features.map((feature) => ({
      ...feature,
      geometry:
        feature.geometry.type === "Polygon"
          ? {
              type: "Polygon",
              coordinates: rings(feature.geometry.coordinates),
            }
          : {
              type: "MultiPolygon",
              coordinates: feature.geometry.coordinates.map(rings),
            },
    })),
  };
}
export function fitRegionGeometry(
  geometry: RegionGeometry,
  type: MapSettings["projection"],
  width: number,
  height: number
): MapView {
  const [[west], [east]] = geoBounds(geometry);
  if (!Number.isFinite(west) || !Number.isFinite(east)) return WORLD_VIEW;
  const longitude = wrapLongitude(
    west + ((east < west ? east + 360 : east) - west) / 2
  );
  const projection = mapProjection(
    type,
    { center: [longitude, 0], zoom: 1 },
    width,
    height
  ).clipExtent(null);
  const [[x0, y0], [x1, y1]] = geoPath(projection).bounds(geometry);
  const center = projection.invert!([(x0 + x1) / 2, (y0 + y1) / 2]);
  if (!center?.every(Number.isFinite)) return WORLD_VIEW;
  return {
    center: [wrapLongitude(center[0]), Math.max(-90, Math.min(90, center[1]))],
    zoom: Math.max(
      1,
      Math.min(
        64,
        Math.max(1, width - 48) / Math.max(1, x1 - x0),
        Math.max(1, height - 48) / Math.max(1, y1 - y0)
      )
    ),
  };
}
