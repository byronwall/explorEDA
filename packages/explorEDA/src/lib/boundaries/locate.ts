import { geoBounds, geoContains } from "d3-geo";
import type { RegionGeometry } from "@/lib/geometryAssets";
import { regionGeometry } from "@/components/charts/Map/regionGeometry";
import { findBoundarySet, loadBoundarySet } from "./registry";

type Properties = Record<string, unknown> | null;
/** Finds the feature that contains a point, testing only nearby features. */
export interface RegionLocator {
  locate(longitude: number, latitude: number): Properties | undefined;
}

type Ring = number[][];
/** Even-odd ray casting on longitude and latitude; holes cancel out. */
function planarContains(rings: Ring[], x: number, y: number) {
  let inside = false;
  for (const ring of rings)
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i] as [number, number];
      const [xj, yj] = ring[j] as [number, number];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
        inside = !inside;
    }
  return inside;
}

/**
 * A grid lists the features whose bounds touch each cell, so a lookup
 * tests a few nearby polygons. Ordinary features use a fast planar test;
 * ones that cross the date line or reach a pole use the spherical one.
 * Results are cached per coordinate.
 */
export function buildLocator(geometry: RegionGeometry): RegionLocator {
  const features = regionGeometry(geometry).features;
  const cell = features.length > 1000 ? 0.5 : 2;
  const cellOf = (value: number) => Math.floor(value / cell);
  const grid = new Map<string, number[]>();
  const add = (
    index: number,
    west: number,
    south: number,
    east: number,
    north: number
  ) => {
    for (let x = cellOf(west); x <= cellOf(east); x++)
      for (let y = cellOf(south); y <= cellOf(north); y++) {
        const key = `${x}:${y}`;
        const list = grid.get(key);
        if (list) list.push(index);
        else grid.set(key, [index]);
      }
  };
  const shapes = features.map((feature, index) => {
    const [[west, south], [east, north]] = geoBounds(feature);
    if (![west, south, east, north].every(Number.isFinite)) return undefined;
    // Bounds that cross the date line wrap: west is east of east.
    const spherical = west > east || south <= -89.9 || north >= 89.9;
    if (west <= east) add(index, west, south, east, north);
    else {
      add(index, west, south, 180, north);
      add(index, -180, south, east, north);
    }
    const rings =
      feature.geometry.type === "Polygon"
        ? feature.geometry.coordinates
        : feature.geometry.coordinates.flat();
    return { west, south, east, north, spherical, rings };
  });
  const contains = (index: number, x: number, y: number) => {
    const shape = shapes[index];
    if (!shape) return false;
    if (shape.spherical) return geoContains(features[index]!, [x, y]);
    return (
      x >= shape.west &&
      x <= shape.east &&
      y >= shape.south &&
      y <= shape.north &&
      planarContains(shape.rings, x, y)
    );
  };
  const cache = new Map<string, Properties | undefined>();
  return {
    locate(longitude, latitude) {
      const key = `${longitude},${latitude}`;
      if (cache.has(key)) return cache.get(key);
      const match = grid
        .get(`${cellOf(longitude)}:${cellOf(latitude)}`)
        ?.find((index) => contains(index, longitude, latitude));
      const result =
        match === undefined ? undefined : (features[match]!.properties ?? null);
      cache.set(key, result);
      return result;
    },
  };
}

const locators = new Map<string, RegionLocator>();
const loading = new Set<string>();
const listeners = new Set<() => void>();

/** A ready locator, or undefined while the set loads. Starts the load. */
export function getLocator(setId: string): RegionLocator | undefined {
  const ready = locators.get(setId);
  if (ready || !findBoundarySet(setId) || loading.has(setId)) return ready;
  loading.add(setId);
  void loadBoundarySet(setId)
    .then((geometry) => {
      locators.set(setId, buildLocator(geometry));
      listeners.forEach((listener) => listener());
    })
    .finally(() => loading.delete(setId));
  return undefined;
}

/** Runs when a locator finishes loading, so calculations can rerun. */
export function onLocatorReady(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Level names the region() calculation accepts, by boundary set. */
export const REGION_LEVELS: Record<string, string> = {
  country: "world-countries",
  "us-state": "us-states",
  "us-county": "us-counties",
};
