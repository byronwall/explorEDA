import { useMemo, useSyncExternalStore } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { inferRegionField } from "@/lib/boundaries/infer";
import { getLocator, onLocatorReady } from "@/lib/boundaries/locate";
import {
  boundaryAssetId,
  boundaryIdOf,
  useBoundarySets,
} from "@/lib/boundaries/registry";
import type { MapSettings, MapView } from "./definition";

/** Zoom at which a map of one level shows the next finer level. */
const DETAIL_ZOOM: Record<string, number> = { country: 3.5, state: 9 };
const FINER = { country: "state", state: "county" } as const;
const SAMPLE = 2000;

let readyCount = 0;
const subscribe = (listener: () => void) =>
  onLocatorReady(() => {
    readyCount++;
    listener();
  });

/**
 * Zoomed into one country, a supplied-boundary map shows the next finer
 * level when the data has a column that joins to it, such as US states.
 */
export function useZoomDetail(settings: MapSettings, view: MapView) {
  const sets = useBoundarySets();
  const nonce = useDataLayer((state) => state.nonce);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const ready = useSyncExternalStore(
    subscribe,
    () => readyCount,
    () => readyCount
  );
  const current = sets.find(
    (set) => set.id === boundaryIdOf(settings.geometryAssetId)
  );
  const finer =
    current && current.level in FINER
      ? FINER[current.level as keyof typeof FINER]
      : undefined;
  // Each finer set's joining column, found once per data change.
  const matches = useMemo(() => {
    if (!finer) return [];
    const candidates = sets.filter((set) => set.level === finer);
    const fields = getColumnNames().map((field) => ({
      field,
      values: Object.values(getColumnData(field)).slice(0, SAMPLE),
    }));
    return candidates.flatMap((set) => {
      const match = inferRegionField(fields, [set.id]);
      return match ? [{ set, match }] : [];
    });
    // nonce marks data and calculation changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finer, sets, nonce, getColumnNames, getColumnData]);
  const [longitude, latitude] = view.center;
  const zoomed = Boolean(current) && view.zoom >= DETAIL_ZOOM[current!.level]!;
  return useMemo(() => {
    if (!current || !matches.length || !zoomed) return undefined;
    // The country under the map's center decides which finer set applies.
    const country = getLocator("world-countries")?.locate(longitude, latitude);
    const detail = matches.find(
      ({ set }) =>
        set.coverage === country?.iso_a3 ||
        (current.level !== "country" && set.coverage === current.coverage)
    );
    if (!detail) return undefined;
    return {
      name: detail.set.name,
      settings: {
        ...settings,
        geometryAssetId: boundaryAssetId(detail.set.id),
        regionField: detail.match.field,
        featureKey: detail.match.featureKey,
      },
    };
    // ready re-checks the center once the world locator loads.
  }, [current, matches, zoomed, longitude, latitude, settings, ready]);
}
