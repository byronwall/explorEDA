import { useId, useMemo, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
import { ChartReadout } from "../ChartReadout";
import {
  useChartTrace,
  useChartTraceApi,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import type { MapSettings, MapView } from "./definition";
import { mapPaths, WORLD_VIEW } from "./mapGeometry";
import { fitRegionGeometry } from "./regionGeometry";
import { planRegionMap, regionFilters, regionMapHeight } from "./regionMapPlan";
import { useMapData } from "./useMapData";
import { useMapPan } from "./useMapPan";

export function RegionMap({
  settings,
  width,
  height,
  facetIds,
  onSettingsChange,
}: BaseChartProps<MapSettings>) {
  const owner = useId();
  const { snapshot, updateChart, getFieldLabel, traceField } = useMapData(
    settings,
    facetIds
  );
  const asset = useDataLayer((state) =>
    state.geometryAssets.find((asset) => asset.id === settings.geometryAssetId)
  );
  const api = useChartTraceApi(),
    trace = useChartTrace();
  const [activeId, setActiveId] = useState<string>();
  const refs = useRef(new Map<string, SVGPathElement>());
  const saveView = (view: MapView) =>
    onSettingsChange
      ? onSettingsChange({ view })
      : updateChart(settings.id, { view });
  const { draftView, events, suppressClick } = useMapPan(
    settings,
    width,
    regionMapHeight(width, height),
    saveView
  );
  const plan = useMemo(
    () =>
      planRegionMap(
        draftView ? { ...settings, view: draftView } : settings,
        snapshot,
        asset,
        width,
        height
      ),
    [settings, snapshot, asset, width, height, draftView]
  );
  const paths = useMemo(() => mapPaths(plan.projection), [plan.projection]);
  const source = useMemo(
    (): TraceSource => ({
      role: "chart",
      revision: plan.revision,
      resolve: (kind, id) => {
        if (kind === "map-joins")
          return { kind, id, revision: plan.revision, plan, settings };
        if (kind !== "map-region" && kind !== "map-region-row")
          return undefined;
        const row =
          kind === "map-region-row"
            ? plan.rows.find((row) => row.sourceId === Number(id))
            : undefined;
        const region = plan.regions.find(
          (region) => region.id === (row?.regionId ?? id)
        );
        if (!row && !region) return undefined;
        const fields = row
          ? [settings.regionField, settings.measureField]
              .filter((field): field is string => Boolean(field))
              .map((field) => traceField(field, row.sourceId))
          : undefined;
        return {
          kind,
          id,
          revision: plan.revision,
          plan,
          settings,
          row,
          fields,
          region: region && {
            ...region,
            contributors: region.contributors.map((item) => {
              const field = settings.measureField
                ? traceField(settings.measureField, item.sourceId)
                : undefined;
              return {
                ...item,
                rawInput: field?.raw,
                exclusionReason: item.included
                  ? undefined
                  : (field?.conversion?.error ?? item.exclusionReason),
              };
            }),
          },
        };
      },
      findRow: (id) =>
        plan.rows.some((row) => row.sourceId === id)
          ? { kind: "map-region-row", id: String(id) }
          : undefined,
      targets: () => [
        {
          kind: "map-joins",
          id: "joins",
          label: "Region joins and unmatched rows",
        },
        ...plan.regions.map((region) => ({
          kind: "map-region",
          id: region.id,
          label: region.label,
        })),
      ],
    }),
    [plan, settings, snapshot]
  );
  useTraceSource(owner, source);
  const active =
    plan.regions.find((region) => region.id === activeId) ??
    plan.regions.find((region) => region.selected) ??
    plan.regions[0];
  const inspect = (id: string) => api?.inspect(owner, "map-region", id);
  const select = (region: typeof active) => {
    if (!region) return;
    if (onSettingsChange || !region.rowCount || region.key === undefined)
      inspect(region.id);
    else
      updateChart(settings.id, {
        filters: regionFilters(settings, region, facetIds),
      });
  };
  const drawn = plan.regions.filter((region) => Boolean(region.path));
  const traced =
    trace?.selection?.owner === owner && trace.trace && "region" in trace.trace
      ? trace.trace.region?.id
      : undefined;
  const metricLabel =
    settings.aggregation === "count"
      ? "Row count"
      : `${settings.aggregation === "average" ? "Average" : "Sum"} of ${getFieldLabel(settings.measureField ?? "")}`;
  const format = (value: number) =>
    value.toLocaleString(undefined, { maximumFractionDigits: 3 });
  return (
    <div className="relative flex flex-col" style={{ width, height }}>
      <svg
        width={width}
        height={plan.mapHeight}
        className="block shrink-0 touch-none select-none rounded"
        role="group"
        aria-label="Region map"
        aria-description="Drag to pan. Arrow keys move between regions. Enter selects joined rows. Alt-Enter inspects. Regions with no rows open inspection. Alt-click outside the regions to trace joins. Escape clears selection."
        {...events}
        onClick={(event) => {
          if (event.altKey && !suppressClick.current)
            api?.inspect(owner, "map-joins", "joins");
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            if (!onSettingsChange) updateChart(settings.id, { filters: [] });
          }
        }}
      >
        <defs>
          <clipPath id={`${owner}-clip`}>
            <rect width={width} height={plan.mapHeight} />
          </clipPath>
          <pattern
            id={`${owner}-empty`}
            width={7}
            height={7}
            patternUnits="userSpaceOnUse"
          >
            <rect width={7} height={7} fill="var(--background)" />
            <path
              d="M0,7L7,0"
              stroke="var(--muted-foreground)"
              strokeOpacity={0.4}
            />
          </pattern>
          <pattern
            id={`${owner}-invalid`}
            width={7}
            height={7}
            patternUnits="userSpaceOnUse"
          >
            <rect width={7} height={7} fill="var(--muted)" />
            <path d="M0,0L7,7M0,7L7,0" stroke="var(--warning)" />
          </pattern>
        </defs>
        <g clipPath={`url(#${owner}-clip)`}>
          <path
            d={paths.outline}
            fill="var(--background)"
            stroke="var(--border)"
          />
          <path
            d={paths.land}
            fill="var(--muted)"
            stroke="var(--border)"
            strokeWidth={0.5}
          />
          {drawn.map((region) => (
            <g key={region.id}>
              <path
                ref={(node) => {
                  if (node) refs.current.set(region.id, node);
                  else refs.current.delete(region.id);
                }}
                d={region.path}
                fill={
                  region.state === "value"
                    ? region.fill
                    : `url(#${owner}-${region.state})`
                }
                fillOpacity={plan.hasSelection && !region.selected ? 0.35 : 1}
                stroke={
                  region.selected ||
                  region.id === activeId ||
                  region.id === traced
                    ? "var(--foreground)"
                    : "var(--muted-foreground)"
                }
                strokeWidth={
                  region.selected ||
                  region.id === activeId ||
                  region.id === traced
                    ? Math.max(2, settings.outlineWidth ?? 1)
                    : (settings.outlineWidth ?? 1)
                }
                role="button"
                className="chart-mark cursor-pointer"
                tabIndex={
                  region.id ===
                  (drawn.some((item) => item.id === activeId)
                    ? activeId
                    : drawn[0]?.id)
                    ? 0
                    : -1
                }
                aria-label={`${region.label}; ${region.state === "value" ? `${metricLabel}: ${format(region.value!)}` : region.state === "empty" ? "No rows" : "No valid measure"}; ${region.rowCount} ${region.rowCount === 1 ? "row" : "rows"}`}
                aria-pressed={region.selected}
                onFocus={() => setActiveId(region.id)}
                onPointerEnter={() => {
                  setActiveId(region.id);
                }}
                onPointerLeave={() => setActiveId(undefined)}
                onClick={(event) => {
                  event.stopPropagation();
                  if (suppressClick.current) return;
                  if (event.altKey) inspect(region.id);
                  else select(region);
                }}
                onKeyDown={(event) => {
                  if (
                    event.key.startsWith("Arrow") ||
                    event.key === "Home" ||
                    event.key === "End"
                  ) {
                    event.preventDefault();
                    event.stopPropagation();
                    const index = drawn.findIndex(
                      (item) => item.id === region.id
                    );
                    const next =
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? drawn.length - 1
                          : (index +
                              (["ArrowLeft", "ArrowUp"].includes(event.key)
                                ? -1
                                : 1) +
                              drawn.length) %
                            drawn.length;
                    refs.current.get(drawn[next]!.id)?.focus();
                  } else if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    if (event.altKey) inspect(region.id);
                    else select(region);
                  }
                }}
              />
              {settings.showRegionLabels &&
                region.centroid.every(Number.isFinite) && (
                  <text
                    x={region.centroid[0]}
                    y={region.centroid[1]}
                    className="pointer-events-none"
                    textAnchor="middle"
                    fontSize={11}
                    fill="var(--foreground)"
                    stroke="var(--background)"
                    strokeWidth={3}
                    paintOrder="stroke"
                    aria-hidden="true"
                  >
                    {region.label}
                  </text>
                )}
            </g>
          ))}
        </g>
      </svg>
      {!plan.configured && (
        <p
          role="status"
          className="pointer-events-none absolute inset-x-3 top-3 rounded bg-background/90 p-2 text-center text-sm"
        >
          Choose geometry, both join keys, and a metric.
        </p>
      )}
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          aria-label="Zoom in"
          tooltip="Magnify the map without changing selected rows."
          disabled={plan.view.zoom >= 64}
          onClick={() =>
            saveView({ ...plan.view, zoom: Math.min(64, plan.view.zoom * 1.5) })
          }
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          aria-label="Zoom out"
          tooltip="Show more geography without changing selected rows."
          disabled={plan.view.zoom <= 1}
          onClick={() =>
            saveView({ ...plan.view, zoom: Math.max(1, plan.view.zoom / 1.5) })
          }
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-1 text-xs"
          disabled={!plan.geometry}
          tooltip="Fit every feature in this geometry source. Filters and facets keep the same view."
          onClick={() =>
            plan.geometry &&
            saveView(
              fitRegionGeometry(
                plan.geometry,
                settings.projection,
                width,
                plan.mapHeight
              )
            )
          }
        >
          Fit geometry
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-1 text-xs"
          onClick={() => saveView(WORLD_VIEW)}
        >
          Reset view
        </Button>
      </div>
      <div
        className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
        aria-label="Region metric legend"
      >
        <span>{metricLabel}</span>
        <span>{format(plan.domain[0])}</span>
        <svg width={70} height={10} aria-hidden="true">
          {Array.from({ length: 35 }, (_, i) => (
            <rect
              key={i}
              x={i * 2}
              width={2.1}
              height={10}
              fill={plan.color(
                plan.domain[0] + ((plan.domain[1] - plan.domain[0]) * i) / 34
              )}
            />
          ))}
        </svg>
        <span>{format(plan.domain[1])}</span>
        <span className="inline-flex items-center gap-1">
          <svg width={10} height={10} aria-hidden="true">
            <rect width={10} height={10} fill={`url(#${owner}-empty)`} />
          </svg>
          No rows
        </span>
        <span className="inline-flex items-center gap-1">
          <svg width={10} height={10} aria-hidden="true">
            <rect width={10} height={10} fill={`url(#${owner}-invalid)`} />
          </svg>
          Invalid measure
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {plan.regions.length} {plan.regions.length === 1 ? "region" : "regions"}{" "}
        · {plan.unmatched.length} unmatched{" "}
        {plan.unmatched.length === 1 ? "row" : "rows"}
      </p>
      {activeId && active && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          <span className="eda-readout-item">
            <span>{active.label}</span>
            <b>
              {active.state === "value"
                ? format(active.value!)
                : active.state === "empty"
                  ? "No rows"
                  : "Invalid measure"}
            </b>
          </span>
        </ChartReadout>
      )}
    </div>
  );
}
