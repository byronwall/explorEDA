import { geoPath } from "d3-geo";
import { interpolateBlues, interpolateRdBu } from "d3-scale-chromatic";
import { categoryKey, categoryLabel, categoryIncludes } from "@/lib/categories";
import { summarizeGroup } from "@/lib/aggregates";
import type { GeometryAsset, RegionGeometry } from "@/lib/geometryAssets";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import type { MapSettings } from "./definition";
import type { MapSnapshot } from "./pointMapPlan";
import { mapProjection, WORLD_VIEW } from "./mapGeometry";
import { regionGeometry } from "./regionGeometry";

export const regionKey = (value: unknown): value is string | number | boolean =>
  typeof value === "string" ||
  typeof value === "boolean" ||
  (typeof value === "number" && Number.isFinite(value));
export function featureValue(
  feature: RegionGeometry["features"][number],
  key: string | undefined
): datum {
  const value =
    key === "@id" ? feature.id : key ? feature.properties?.[key] : undefined;
  return regionKey(value) ? value : undefined;
}
export function planRegionMap(
  settings: MapSettings,
  snapshot: MapSnapshot,
  asset: GeometryAsset | undefined,
  width: number,
  height: number
) {
  const mapHeight = Math.max(40, height - 96);
  const view = settings.view ?? WORLD_VIEW;
  const projection = mapProjection(settings.projection, view, width, mapHeight);
  const geometry = asset ? regionGeometry(asset.geometry) : undefined;
  const path = geoPath(projection);
  const groups = new Map<
    string,
    { id: string; key: datum; features: number[] }
  >();
  geometry?.features.forEach((feature, index) => {
    const key = featureValue(feature, settings.featureKey);
    const id = key === undefined ? `feature:${index}` : categoryKey(key);
    const group = groups.get(id);
    if (group) group.features.push(index);
    else groups.set(id, { id, key, features: [index] });
  });
  const scope = new Set(snapshot.chartIds),
    facet = snapshot.facetIds ? new Set(snapshot.facetIds) : undefined;
  const keys = snapshot.columns[settings.regionField ?? ""] ?? {};
  const measures = snapshot.columns[settings.measureField ?? ""] ?? {};
  const rows = snapshot.allIds.map((sourceId) => {
    const key = keys[sourceId];
    const id = regionKey(key) ? categoryKey(key) : undefined;
    return {
      sourceId,
      key,
      regionId: id && groups.has(id) ? id : undefined,
      reason: !regionKey(key)
        ? "Missing or invalid region key"
        : !groups.has(id!)
          ? "No matching feature key"
          : undefined,
      inScope: scope.has(sourceId) && (!facet || facet.has(sourceId)),
    };
  });
  const byRegion = new Map<string, typeof rows>();
  for (const row of rows)
    if (row.regionId) {
      const existing = byRegion.get(row.regionId);
      if (existing) existing.push(row);
      else byRegion.set(row.regionId, [row]);
    }
  const spec = {
    aggregation: settings.aggregation ?? "count",
    measureField: settings.measureField,
  };
  const summarize = (ids: number[]) =>
    summarizeGroup(
      ids.map((__ID) => ({
        __ID,
        [settings.measureField ?? ""]: measures[__ID],
      })),
      spec,
      measures
    );
  const regions = [...groups.values()].map((group) => {
    const source = byRegion.get(group.id) ?? [];
    const matching = source.filter((row) => row.inScope);
    const summary = summarize(matching.map((row) => row.sourceId));
    const shapes: RegionGeometry = {
      type: "FeatureCollection",
      features: group.features.map((index) => geometry!.features[index]!),
    };
    const d = path(shapes) ?? "",
      centroid = path.centroid(shapes);
    return {
      ...group,
      ...summary,
      label:
        group.key === undefined
          ? `Feature ${group.features[0]} (no key)`
          : categoryLabel(group.key),
      sourceIds: source
        .filter((row) => !facet || facet.has(row.sourceId))
        .map((row) => row.sourceId),
      state: !summary.rowCount
        ? ("empty" as const)
        : summary.value === undefined || !Number.isFinite(summary.value)
          ? ("invalid" as const)
          : ("value" as const),
      path: d,
      centroid,
      bounds: path.bounds(shapes),
      area: path.area(shapes),
      selected:
        (!facet ||
          settings.filters.every(
            (filter) =>
              filter.field !== "__ID" ||
              filter.type !== "value" ||
              filter.values.some(
                (id) => typeof id === "number" && facet.has(id)
              )
          )) &&
        settings.filters.some(
          (filter) =>
            filter.type === "value" &&
            filter.field === settings.regionField &&
            categoryIncludes(filter.values, group.key)
        ),
    };
  });
  // Bounds cover every possible filtered subset, including signed sums and facets.
  const values: number[] = [];
  for (const source of byRegion.values()) {
    if (spec.aggregation === "count") {
      values.push(source.length);
      continue;
    }
    const inputs = summarize(source.map((row) => row.sourceId))
      .contributors.filter((item) => item.included)
      .map((item) => Number(item.input));
    if (spec.aggregation === "sum")
      values.push(
        inputs.reduce((sum, value) => sum + Math.max(0, value), 0),
        inputs.reduce((sum, value) => sum + Math.min(0, value), 0)
      );
    else
      values.push(
        inputs.reduce((min, value) => Math.min(min, value), Infinity),
        inputs.reduce((max, value) => Math.max(max, value), -Infinity)
      );
  }
  const finiteValues = values.filter(Number.isFinite);
  const min = finiteValues.reduce((a, b) => Math.min(a, b), 0),
    max = finiteValues.reduce((a, b) => Math.max(a, b), 0);
  const limit = Math.max(Math.abs(min), Math.abs(max));
  const domain: [number, number] = min < 0 ? [-limit, limit] : [0, max];
  const color = (value: number) =>
    min < 0
      ? interpolateRdBu((value / (limit || 1) + 1) / 2)
      : interpolateBlues(value / (max || 1));
  return {
    revision: snapshot.revision,
    asset,
    geometry,
    projection,
    view,
    width,
    mapHeight,
    regions: regions.map((region) => ({
      ...region,
      fill: region.state === "value" ? color(region.value!) : "var(--muted)",
    })),
    rows: rows.filter((row) => !facet || facet.has(row.sourceId)),
    unmatched:
      asset && settings.regionField && settings.featureKey
        ? rows.filter((row) => row.inScope && row.reason)
        : [],
    domain,
    color,
    scaleKind: min < 0 ? "diverging" : "sequential",
    hasSelection: settings.filters.length > 0,
    configured: Boolean(
      asset &&
        settings.regionField &&
        settings.featureKey &&
        (spec.aggregation === "count" || settings.measureField)
    ),
  };
}
export type RegionMapPlan = ReturnType<typeof planRegionMap>;
export type MapRegion = RegionMapPlan["regions"][number];
export function regionFilters(
  settings: MapSettings,
  region: MapRegion,
  facetIds?: number[]
): Filter[] {
  if (!region.sourceIds.length || region.key === undefined)
    return settings.filters;
  if (region.selected) return [];
  return [
    { type: "value", field: settings.regionField!, values: [region.key] },
    ...(facetIds
      ? [{ type: "value" as const, field: "__ID", values: facetIds }]
      : []),
  ];
}
