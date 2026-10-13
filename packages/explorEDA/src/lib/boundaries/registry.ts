import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { GeometryAsset, RegionGeometry } from "@/lib/geometryAssets";
import { BUILT_IN_BOUNDARIES } from "./builtIn";

/** Geometry the app supplies, loaded only when a map uses it. */
export interface BoundarySet {
  /** Stable ID. Charts save it as `geometryAssetId: "boundary:<id>"`. */
  id: string;
  name: string;
  /** Publisher, release, and terms. */
  source: string;
  level: "country" | "state" | "county" | "region";
  /** Where the set applies: "world", or the ISO alpha-3 code it covers. */
  coverage: string;
  /** Feature properties that hold join keys, best first. */
  keys: { property: string; label: string }[];
  load: () => Promise<RegionGeometry>;
}

export const BOUNDARY_PREFIX = "boundary:";
export const boundaryAssetId = (id: string) => `${BOUNDARY_PREFIX}${id}`;
export const boundaryIdOf = (assetId: string | undefined) =>
  assetId?.startsWith(BOUNDARY_PREFIX)
    ? assetId.slice(BOUNDARY_PREFIX.length)
    : undefined;

let sets: BoundarySet[] = BUILT_IN_BOUNDARIES;
const listeners = new Set<() => void>();
const loaded = new Map<string, Promise<RegionGeometry>>();
const notify = () => listeners.forEach((listener) => listener());

/**
 * Adds boundaries every region map can choose, such as a country's
 * provinces. A set with a built-in ID replaces it.
 */
export function registerBoundarySet(set: BoundarySet) {
  sets = [...sets.filter((item) => item.id !== set.id), set];
  loaded.delete(set.id);
  notify();
  return () => {
    sets = sets.filter((item) => item !== set);
    loaded.delete(set.id);
    notify();
  };
}

export const listBoundarySets = () => sets;
export const findBoundarySet = (id: string | undefined) =>
  id === undefined ? undefined : sets.find((set) => set.id === id);

/** Loads a set once and reuses it. */
export function loadBoundarySet(id: string) {
  const set = findBoundarySet(id);
  if (!set) return Promise.reject(new Error(`No boundary set ${id}`));
  let promise = loaded.get(id);
  if (!promise) {
    promise = set.load();
    loaded.set(id, promise);
    promise.catch(() => loaded.delete(id));
  }
  return promise;
}

export function useBoundarySets() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => sets,
    () => sets
  );
}

export type BoundaryState =
  | { status: "none" }
  | { status: "missing"; id: string }
  | { status: "loading"; set: BoundarySet }
  | { status: "error"; set: BoundarySet; message: string }
  | { status: "ready"; set: BoundarySet; asset: GeometryAsset };

/** A chart's supplied boundaries as a geometry asset, once loaded. */
export function useBoundaryAsset(assetId: string | undefined): BoundaryState {
  const id = boundaryIdOf(assetId);
  const all = useBoundarySets();
  const set = id === undefined ? undefined : all.find((item) => item.id === id);
  const [result, setResult] = useState<{
    set: BoundarySet;
    geometry?: RegionGeometry;
    message?: string;
  }>();
  useEffect(() => {
    if (!set) return;
    let current = true;
    loadBoundarySet(set.id).then(
      (geometry) => current && setResult({ set, geometry }),
      (error: unknown) =>
        current &&
        setResult({
          set,
          message: error instanceof Error ? error.message : String(error),
        })
    );
    return () => {
      current = false;
    };
  }, [set]);
  return useMemo((): BoundaryState => {
    if (id === undefined) return { status: "none" };
    if (!set) return { status: "missing", id };
    if (result?.set !== set) return { status: "loading", set };
    if (result.message !== undefined)
      return { status: "error", set, message: result.message };
    return {
      status: "ready",
      set,
      asset: {
        id: assetId!,
        name: set.name,
        source: set.source,
        geometry: result.geometry!,
      },
    };
  }, [id, set, result, assetId]);
}
