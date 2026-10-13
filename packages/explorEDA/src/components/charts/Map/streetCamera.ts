import { geoMercator } from "d3-geo";
import type { MapSettings, MapView } from "./definition";
import { mapProjection } from "./mapGeometry";

/**
 * A map view's zoom is relative to the fitted world map. Street views keep
 * that meaning: pixels per degree of longitude at the equator match on both
 * sides of the handoff, so a saved view opens at the same scale either way.
 */
export const STREET_MIN_ZOOM = 3;
export const STREET_MAX_ZOOM = 18;
export const STREET_FIT_ZOOM = 14;
/** World-view zoom limit without a street engine. */
export const OUTLINE_MAX_ZOOM = 64;
/** Saved zoom limit: street level on a very wide chart. */
export const SAVED_MAX_ZOOM = 2 ** 20;
const TILE = 512;

function pixelsPerDegree(
  type: MapSettings["projection"],
  width: number,
  height: number
) {
  const world = mapProjection(type, { center: [0, 0], zoom: 1 }, width, height);
  return Math.abs(world([0.5, 0])![0] - world([-0.5, 0])![0]);
}
const mercatorScale = (
  view: MapView,
  type: MapSettings["projection"],
  width: number,
  height: number
) => (view.zoom * pixelsPerDegree(type, width, height) * 180) / Math.PI;

/** The MapLibre zoom that shows a map view at the same scale. */
export function streetZoom(
  view: MapView,
  type: MapSettings["projection"],
  width: number,
  height: number
) {
  return Math.log2(
    (mercatorScale(view, type, width, height) * 2 * Math.PI) / TILE
  );
}

/** The map-view zoom for a MapLibre zoom. */
export function viewZoom(
  zoom: number,
  type: MapSettings["projection"],
  width: number,
  height: number
) {
  return (
    (TILE * 2 ** zoom) /
    (2 * Math.PI) /
    ((pixelsPerDegree(type, width, height) * 180) / Math.PI)
  );
}

export function isStreetView(
  view: MapView,
  type: MapSettings["projection"],
  width: number,
  height: number
) {
  return streetZoom(view, type, width, height) >= STREET_MIN_ZOOM - 1e-9;
}

/** Web Mercator matching MapLibre's camera, for marks drawn over its tiles. */
export function streetProjection(
  view: MapView,
  type: MapSettings["projection"],
  width: number,
  height: number
) {
  return geoMercator()
    .rotate([-view.center[0], 0])
    .center([0, Math.max(-85, Math.min(85, view.center[1]))])
    .scale(mercatorScale(view, type, width, height))
    .translate([width / 2, height / 2])
    .clipExtent([
      [0, 0],
      [width, height],
    ]);
}
