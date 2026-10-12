import { useDataLayer } from "@/providers/DataLayerProvider";
import { useBoundaryAsset } from "@/lib/boundaries/registry";
import type { MapSettings } from "./definition";

/** The chart's geometry: an imported asset or supplied boundaries. */
export function useRegionAsset(settings: Pick<MapSettings, "geometryAssetId">) {
  const imported = useDataLayer((state) =>
    state.geometryAssets.find((asset) => asset.id === settings.geometryAssetId)
  );
  const boundary = useBoundaryAsset(settings.geometryAssetId);
  return {
    asset:
      imported ?? (boundary.status === "ready" ? boundary.asset : undefined),
    boundary,
  };
}
