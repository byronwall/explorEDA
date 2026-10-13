import { MapToolbar } from "./MapToolbar";
import { useEffect, useId, useMemo, useRef, useState } from "react";
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
import {
  mapPaths,
  mapProjection,
  WORLD_VIEW,
  wrapLongitude,
} from "./mapGeometry";
import { useStreetMapEngine } from "./mapEngine";
import {
  type MapPoint,
  mapPointFilters,
  planPointMap,
  pointMapHeight,
} from "./pointMapPlan";
import {
  isStreetView,
  OUTLINE_MAX_ZOOM,
  STREET_FIT_ZOOM,
  STREET_MAX_ZOOM,
  streetProjection,
  viewZoom,
} from "./streetCamera";
import { StreetBasemap } from "./StreetBasemap";
import { downloadMapPng } from "./mapImage";
import {
  CLUSTER_THRESHOLD,
  clusterPoints,
  type MapCluster,
} from "./pointClusters";
import { useRegionAsset } from "./useRegionAsset";
import { regionGeometry } from "./regionGeometry";
import { geoPath } from "d3-geo";

// Stable empties keep the drawn layer memoized across gesture frames.
const NONE: MapPoint[] = [];
const NO_CLUSTERS: MapCluster[] = [];
/** Point labels stay readable up to this many drawn points. */
const MAX_LABELS = 150;
import { useMapData } from "./useMapData";

export function PointMap({
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
  const api = useChartTraceApi();
  const trace = useChartTrace();
  const [activeId, setActiveId] = useState<number>();
  const [draftView, setDraftView] = useState<MapView>();
  const markRefs = useRef(new Map<string, SVGCircleElement>());
  const [focusKey, setFocusKey] = useState<string>();
  const [activeCluster, setActiveCluster] = useState<MapCluster>();
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<
    | {
        x: number;
        y: number;
        view: MapView;
        moved: boolean;
        next?: MapView;
      }
    | undefined
  >(undefined);
  const suppressClick = useRef(false);
  const engine = useStreetMapEngine();
  const dark = useDataLayer((state) => state.darkMode ?? false);
  const [failedEngine, setFailedEngine] = useState<typeof engine>();
  const mapHeight = pointMapHeight(settings, height);
  // The saved view decides the basemap, so a gesture never swaps it mid-drag.
  const basemap = settings.basemap ?? "auto";
  const street =
    Boolean(engine) &&
    basemap === "auto" &&
    isStreetView(
      settings.view ?? WORLD_VIEW,
      settings.projection,
      width,
      mapHeight
    );
  const streetFailed = street && failedEngine === engine;
  const maxZoom = engine
    ? viewZoom(STREET_MAX_ZOOM, settings.projection, width, mapHeight)
    : OUTLINE_MAX_ZOOM;
  // Fit stops at neighborhood scale, so one site still shows its streets.
  const fitZoom = engine
    ? viewZoom(STREET_FIT_ZOOM, settings.projection, width, mapHeight)
    : 32;
  // The plan follows the saved view. During a pan or zoom gesture the drawn
  // marks move by a transform instead, so thousands of points stay smooth;
  // the plan catches up when the gesture ends.
  const plan = useMemo(
    () => planPointMap(settings, snapshot, width, height, street),
    [settings, snapshot, width, height, street]
  );
  const gestureTransform = useMemo(() => {
    if (!draftView) return undefined;
    const next = street
      ? streetProjection(draftView, settings.projection, width, plan.mapHeight)
      : mapProjection(settings.projection, draftView, width, plan.mapHeight);
    const scale = next.scale() / plan.projection.scale();
    const from = plan.projection(plan.view.center);
    const to = next(plan.view.center);
    if (!from || !to || ![...from, ...to, scale].every(Number.isFinite))
      return undefined;
    return `translate(${to[0] - scale * from[0]},${to[1] - scale * from[1]}) scale(${scale})`;
  }, [draftView, street, settings.projection, width, plan]);
  useEffect(() => setDraftView(undefined), [street]);
  const paths = useMemo(() => mapPaths(plan.projection), [plan.projection]);
  const source: TraceSource = {
    role: "chart",
    revision: plan.revision,
    resolve: (kind, id) => {
      if (kind === "map-point") {
        const point = plan.rows.find((row) => row.sourceId === Number(id));
        if (!point) return undefined;
        const fields = [
          ...new Set(
            [
              settings.longitudeField,
              settings.latitudeField,
              settings.labelField,
              settings.colorField,
              settings.sizeField,
            ].filter((field): field is string => Boolean(field))
          ),
        ].map((field) => traceField(field, point.sourceId));
        return {
          kind,
          id,
          revision: plan.revision,
          plan,
          settings,
          point,
          fields,
        };
      }
      if (
        kind === "map-background" ||
        kind === "map-exclusions" ||
        kind === "map-offscreen"
      )
        return { kind, id, revision: plan.revision, plan, settings };
      return undefined;
    },
    findRow: (id) =>
      plan.rows.some((row) => row.sourceId === id)
        ? { kind: "map-point", id: String(id) }
        : undefined,
    targets: () => [
      {
        kind: "map-background",
        id: "land",
        label: "Land outline and projection",
      },
      ...(plan.excluded.length
        ? [
            {
              kind: "map-exclusions",
              id: "excluded",
              label: `Omitted source rows (${plan.excluded.length})`,
            },
          ]
        : []),
      ...(plan.offscreen.length
        ? [
            {
              kind: "map-offscreen",
              id: "offscreen",
              label: `Rows outside the view (${plan.offscreen.length})`,
            },
          ]
        : []),
    ],
  };
  // Trace registration changes only when its plan or source data changes.
  const stableSource = useMemo(() => source, [plan, settings, snapshot]);
  useTraceSource(owner, stableSource);
  const inspect = (id: number) => api?.inspect(owner, "map-point", String(id));
  const change = (updates: Partial<MapSettings>) =>
    onSettingsChange
      ? onSettingsChange(updates)
      : updateChart(settings.id, updates);
  const saveView = (view: MapView) => change({ view });
  const reference = useRegionAsset({
    geometryAssetId: settings.referenceAssetId,
  }).asset;
  const referencePath = useMemo(
    () =>
      reference
        ? (geoPath(plan.projection)(regionGeometry(reference.geometry)) ?? "")
        : "",
    [reference, plan.projection]
  );
  const showMarks = settings.showMarks ?? true;
  const select = (id: number) =>
    onSettingsChange
      ? inspect(id)
      : updateChart(settings.id, { filters: mapPointFilters(settings, id) });
  // A preview edits a draft, so it never clears the saved chart's filters.
  const clearFilters = () => {
    if (!onSettingsChange && settings.filters.length)
      updateChart(settings.id, { filters: [] });
  };
  const active = plan.points.find((point) => point.sourceId === activeId);
  const tracedId =
    trace?.selection?.owner === owner && trace.trace?.kind === "map-point"
      ? trace.trace.point?.sourceId
      : undefined;
  // Crowded maps group nearby points; zooming in splits the groups.
  const grouped = useMemo(
    () =>
      showMarks &&
      settings.clusterPoints === true &&
      plan.points.length > CLUSTER_THRESHOLD
        ? clusterPoints(plan.points)
        : undefined,
    [plan.points, showMarks, settings.clusterPoints]
  );
  const drawnPoints = showMarks ? (grouped?.singles ?? plan.points) : NONE;
  const clusters = grouped?.clusters ?? NO_CLUSTERS;
  const selectRows = (ids: number[]) => {
    if (onSettingsChange) return inspect(ids[0]!);
    const current = settings.filters[0];
    const same =
      settings.filters.length === 1 &&
      current?.type === "value" &&
      current.field === "__ID" &&
      current.values.length === ids.length &&
      ids.every((id, index) => current.values[index] === id);
    updateChart(settings.id, {
      filters: same ? [] : [{ type: "value", field: "__ID", values: ids }],
    });
  };
  // Arrow keys walk points, then groups; one of them holds the tab stop.
  const order = [
    ...[...drawnPoints]
      .sort((a, b) => a.sourceId - b.sourceId)
      .map((point) => `p:${point.sourceId}`),
    ...[...clusters]
      .sort((a, b) => a.sourceIds[0]! - b.sourceIds[0]!)
      .map((cluster) => `c:${cluster.id}`),
  ];
  const tabStop = focusKey && order.includes(focusKey) ? focusKey : order[0];
  const navigate = (key: string, event: React.KeyboardEvent) => {
    if (
      !event.key.startsWith("Arrow") &&
      event.key !== "Home" &&
      event.key !== "End"
    )
      return false;
    event.preventDefault();
    event.stopPropagation();
    const index = order.indexOf(key);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? order.length - 1
          : (index +
              (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) +
              order.length) %
            order.length;
    const nextKey = order[next];
    if (nextKey) markRefs.current.get(nextKey)?.focus();
    return true;
  };
  // Drawn once per plan or interaction state; gesture frames only move it.
  const layers = useMemo(
    () => (
      <>
        {(!street || streetFailed) && basemap !== "none" && (
          <>
            <path
              d={paths.outline}
              fill="var(--background)"
              stroke="var(--border)"
            />
            <path
              d={paths.land}
              fill="var(--muted)"
              stroke="var(--muted-foreground)"
              strokeOpacity={0.3}
              strokeWidth={0.6}
            />
            {!street && (
              <path
                d={paths.grid}
                fill="none"
                stroke="var(--border)"
                strokeOpacity={0.5}
                strokeWidth={0.5}
              />
            )}
          </>
        )}
        {referencePath && (
          <path
            d={referencePath}
            fill="none"
            stroke="var(--foreground)"
            strokeOpacity={0.45}
            strokeWidth={1}
            className="pointer-events-none"
            aria-hidden="true"
          />
        )}
        {drawnPoints.map((point) => {
          const selected = plan.hasSelection && point.matching;
          const emphasized =
            selected ||
            point.sourceId === activeId ||
            point.sourceId === tracedId;
          return (
            <circle
              key={point.sourceId}
              ref={(node) => {
                if (node) markRefs.current.set(`p:${point.sourceId}`, node);
                else markRefs.current.delete(`p:${point.sourceId}`);
              }}
              cx={point.x}
              cy={point.y}
              r={point.radius}
              fill={
                settings.sizeField && point.value === 0 ? "none" : point.color
              }
              fillOpacity={
                settings.pointOpacity *
                (plan.hasSelection && !point.matching ? 0.2 : 1)
              }
              stroke={emphasized ? "var(--foreground)" : point.color}
              strokeWidth={emphasized ? 2.5 : 1}
              strokeOpacity={plan.hasSelection && !point.matching ? 0.2 : 1}
              role="button"
              className="chart-mark cursor-pointer"
              style={{ pointerEvents: "auto" }}
              tabIndex={`p:${point.sourceId}` === tabStop ? 0 : -1}
              aria-label={`${point.label}; row ${point.sourceId}; latitude ${point.latitude}°; longitude ${point.longitude}°`}
              aria-pressed={selected}
              onPointerEnter={() => {
                if (!drag.current?.moved) setActiveId(point.sourceId);
              }}
              onPointerLeave={() => setActiveId(undefined)}
              onFocus={() => {
                setActiveId(point.sourceId);
                setFocusKey(`p:${point.sourceId}`);
              }}
              onClick={(event) => {
                event.stopPropagation();
                if (suppressClick.current) return;
                if (event.altKey) inspect(point.sourceId);
                else select(point.sourceId);
              }}
              onKeyDown={(event) => {
                if (navigate(`p:${point.sourceId}`, event)) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  if (event.altKey) inspect(point.sourceId);
                  else select(point.sourceId);
                }
              }}
            />
          );
        })}
        {clusters.map((cluster) => {
          const key = `c:${cluster.id}`;
          const count = cluster.sourceIds.length;
          const dim = plan.hasSelection && !cluster.matching;
          return (
            <g key={key}>
              <circle
                ref={(node) => {
                  if (node) markRefs.current.set(key, node);
                  else markRefs.current.delete(key);
                }}
                cx={cluster.x}
                cy={cluster.y}
                r={cluster.radius}
                fill={cluster.color}
                fillOpacity={settings.pointOpacity * (dim ? 0.2 : 0.85)}
                stroke={
                  activeCluster?.id === cluster.id
                    ? "var(--foreground)"
                    : cluster.color
                }
                strokeWidth={activeCluster?.id === cluster.id ? 2.5 : 1}
                strokeOpacity={dim ? 0.2 : 1}
                role="button"
                className="chart-mark cursor-pointer"
                style={{ pointerEvents: "auto" }}
                tabIndex={key === tabStop ? 0 : -1}
                aria-label={`${count} rows grouped near ${cluster.label}. Zoom in to split them.`}
                aria-pressed={plan.hasSelection && cluster.matching}
                onPointerEnter={() => setActiveCluster(cluster)}
                onPointerLeave={() => setActiveCluster(undefined)}
                onFocus={() => {
                  setActiveCluster(cluster);
                  setFocusKey(key);
                }}
                onBlur={() => setActiveCluster(undefined)}
                onClick={(event) => {
                  event.stopPropagation();
                  if (suppressClick.current) return;
                  if (event.altKey) inspect(cluster.sourceIds[0]!);
                  else selectRows(cluster.sourceIds);
                }}
                onKeyDown={(event) => {
                  if (navigate(key, event)) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    if (event.altKey) inspect(cluster.sourceIds[0]!);
                    else selectRows(cluster.sourceIds);
                  }
                }}
              />
              <text
                x={cluster.x}
                y={cluster.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight={600}
                fill="var(--foreground)"
                stroke="var(--background)"
                strokeWidth={2.5}
                paintOrder="stroke"
                className="pointer-events-none"
                aria-hidden="true"
              >
                {count.toLocaleString()}
              </text>
            </g>
          );
        })}
        {(settings.showLabels &&
        settings.labelField &&
        drawnPoints.length <= MAX_LABELS
          ? drawnPoints
          : []
        ).map((point) => (
          <text
            key={point.sourceId}
            x={point.x! + point.radius + 3}
            y={point.y!}
            dominantBaseline="middle"
            fontSize={11}
            fill="var(--foreground)"
            stroke="var(--background)"
            strokeWidth={3}
            paintOrder="stroke"
            className="pointer-events-none"
            aria-hidden="true"
          >
            {point.label}
          </text>
        ))}
      </>
    ),
    // Handlers read the same settings, plan, and callbacks listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      plan,
      paths,
      street,
      streetFailed,
      basemap,
      referencePath,
      drawnPoints,
      clusters,
      activeId,
      tracedId,
      tabStop,
      activeCluster,
      settings,
      onSettingsChange,
      updateChart,
      api,
    ]
  );
  return (
    <div style={{ width, height }} className="relative flex flex-col">
      <div
        ref={frame}
        className="relative shrink-0"
        style={{ width, height: plan.mapHeight }}
      >
        {street && engine && !streetFailed && (
          <StreetBasemap
            engine={engine}
            view={settings.view ?? WORLD_VIEW}
            projection={settings.projection}
            width={width}
            height={plan.mapHeight}
            dark={dark}
            onMove={setDraftView}
            onMoveEnd={(view) => {
              saveView(view);
              setDraftView(undefined);
            }}
            onBackgroundClick={(altKey) => {
              if (altKey) api?.inspect(owner, "map-background", "land");
              else clearFilters();
            }}
            onFailure={() => setFailedEngine(engine)}
          />
        )}
        <svg
          width={width}
          height={plan.mapHeight}
          className="relative block touch-none select-none rounded"
          role="group"
          aria-label="Point map"
          aria-description={
            onSettingsChange
              ? "Drag to pan. Click a point or press Enter to inspect its source row. Arrow keys move between visible points."
              : "Drag to pan. Click a point or press Enter to select its source row. Arrow keys move between visible points. Alt-Enter inspects. Click empty map space or press Escape to clear the selection."
          }
          style={
            street && !streetFailed ? { pointerEvents: "none" } : undefined
          }
          onPointerDown={(event) => {
            if (event.button !== 0 || (street && !streetFailed)) return;
            suppressClick.current = false;
            drag.current = {
              x: event.clientX,
              y: event.clientY,
              view: plan.view,
              moved: false,
            };
          }}
          onPointerMove={(event) => {
            const start = drag.current;
            if (!start) return;
            const dx = event.clientX - start.x,
              dy = event.clientY - start.y;
            if (!start.moved && Math.hypot(dx, dy) < 4) return;
            start.moved = true;
            suppressClick.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            const projection = street
              ? streetProjection(
                  start.view,
                  settings.projection,
                  width,
                  plan.mapHeight
                )
              : mapProjection(
                  settings.projection,
                  start.view,
                  width,
                  plan.mapHeight
                );
            const center = projection.invert!([
              width / 2 - dx,
              plan.mapHeight / 2 - dy,
            ]);
            if (!center || !center.every(Number.isFinite)) return;
            start.next = {
              ...start.view,
              center: [
                wrapLongitude(center[0]),
                Math.max(-90, Math.min(90, center[1])),
              ],
            };
            setDraftView(start.next);
          }}
          onPointerUp={(event) => {
            const start = drag.current;
            drag.current = undefined;
            if (start?.moved && start.next) saveView(start.next);
            setDraftView(undefined);
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => {
            drag.current = undefined;
            setDraftView(undefined);
          }}
          onClick={(event) => {
            if (suppressClick.current) return;
            if (event.altKey) api?.inspect(owner, "map-background", "land");
            else clearFilters();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              clearFilters();
            }
          }}
        >
          <defs>
            <clipPath id={`${owner}-map-clip`}>
              <rect width={width} height={plan.mapHeight} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${owner}-map-clip)`}>
            <g transform={gestureTransform}>{layers}</g>
          </g>
        </svg>
      </div>
      {streetFailed && (
        <div
          className="pointer-events-none absolute left-2 top-2 rounded bg-background/90 px-2 py-1 text-xs text-muted-foreground"
          role="status"
        >
          Street map unavailable. Showing the outline map.
        </div>
      )}
      {(!plan.configured || !plan.points.length) && (
        <div
          className="pointer-events-none absolute inset-x-4 top-3 rounded bg-background/90 p-2 text-center text-sm"
          role="status"
        >
          {!plan.configured
            ? "Choose latitude and longitude fields"
            : !plan.scopeCount
              ? "No rows match the current filters"
              : plan.offscreen.length
                ? "Points are outside this view. Choose Fit data."
                : "No valid coordinates to draw. Inspect omitted rows."}
        </div>
      )}
      <MapToolbar
        settings={settings}
        plan={plan}
        owner={owner}
        getFieldLabel={getFieldLabel}
        maxZoom={maxZoom}
        fitZoom={fitZoom}
        onViewChange={saveView}
        onSettingsChange={change}
        onExport={() =>
          frame.current &&
          downloadMapPng(frame.current, settings.title || "map")
        }
      />
      {activeCluster && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          <span className="eda-readout-item">
            <span>Group near {activeCluster.label}</span>
            <b>{activeCluster.sourceIds.length.toLocaleString()} rows</b>
          </span>
        </ChartReadout>
      )}
      {active && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          <span className="eda-readout-item">
            <span>{active.label}</span>
            <b>
              {active.latitude?.toFixed(2)}°, {active.longitude?.toFixed(2)}°
            </b>
          </span>
        </ChartReadout>
      )}
    </div>
  );
}
