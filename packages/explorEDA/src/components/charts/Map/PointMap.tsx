import { MapToolbar } from "./MapToolbar";
import { useId, useMemo, useRef, useState } from "react";
import type { BaseChartProps } from "@/types/ChartTypes";
import { ChartReadout } from "../ChartReadout";
import {
  useChartTrace,
  useChartTraceApi,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import type { MapSettings, MapView } from "./definition";
import { mapPaths, mapProjection, wrapLongitude } from "./mapGeometry";
import { mapPointFilters, planPointMap } from "./pointMapPlan";
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
  const pointRefs = useRef(new Map<number, SVGCircleElement>());
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
  const plan = useMemo(
    () =>
      planPointMap(
        draftView ? { ...settings, view: draftView } : settings,
        snapshot,
        width,
        height
      ),
    [settings, snapshot, width, height, draftView]
  );
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
  const saveView = (view: MapView) =>
    onSettingsChange
      ? onSettingsChange({ view })
      : updateChart(settings.id, { view });
  const select = (id: number) =>
    onSettingsChange
      ? inspect(id)
      : updateChart(settings.id, { filters: mapPointFilters(settings, id) });
  const active = plan.points.find((point) => point.sourceId === activeId);
  const tracedId =
    trace?.selection?.owner === owner && trace.trace?.kind === "map-point"
      ? trace.trace.point?.sourceId
      : undefined;
  const keyboardPoints = [...plan.points].sort(
    (a, b) => a.sourceId - b.sourceId
  );
  const tabStop =
    activeId !== undefined &&
    plan.points.some((point) => point.sourceId === activeId)
      ? activeId
      : keyboardPoints[0]?.sourceId;
  return (
    <div style={{ width, height }} className="relative flex flex-col">
      <svg
        width={width}
        height={plan.mapHeight}
        className="block shrink-0 touch-none select-none rounded"
        role="group"
        aria-label="Point map"
        aria-description={
          onSettingsChange
            ? "Drag to pan. Click a point or press Enter to inspect its source row. Arrow keys move between visible points."
            : "Drag to pan. Click a point or press Enter to select its source row. Arrow keys move between visible points. Alt-Enter inspects. Escape clears selection."
        }
        onPointerDown={(event) => {
          if (event.button !== 0) return;
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
          const projection = mapProjection(
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
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            updateChart(settings.id, { filters: [] });
          }
        }}
      >
        <defs>
          <clipPath id={`${owner}-map-clip`}>
            <rect width={width} height={plan.mapHeight} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${owner}-map-clip)`}>
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
          <path
            d={paths.grid}
            fill="none"
            stroke="var(--border)"
            strokeOpacity={0.5}
            strokeWidth={0.5}
          />
          {plan.points.map((point) => {
            const selected = plan.hasSelection && point.matching;
            const emphasized =
              selected ||
              point.sourceId === activeId ||
              point.sourceId === tracedId;
            return (
              <circle
                key={point.sourceId}
                ref={(node) => {
                  if (node) pointRefs.current.set(point.sourceId, node);
                  else pointRefs.current.delete(point.sourceId);
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
                tabIndex={point.sourceId === tabStop ? 0 : -1}
                aria-label={`${point.label}; row ${point.sourceId}; latitude ${point.latitude}°; longitude ${point.longitude}°`}
                aria-pressed={selected}
                onPointerEnter={() => {
                  if (!drag.current?.moved) setActiveId(point.sourceId);
                }}
                onPointerLeave={() => setActiveId(undefined)}
                onFocus={() => setActiveId(point.sourceId)}
                onClick={(event) => {
                  event.stopPropagation();
                  if (suppressClick.current) return;
                  if (event.altKey) inspect(point.sourceId);
                  else select(point.sourceId);
                }}
                onKeyDown={(event) => {
                  if (
                    event.key.startsWith("Arrow") ||
                    event.key === "Home" ||
                    event.key === "End"
                  ) {
                    event.preventDefault();
                    event.stopPropagation();
                    const index = keyboardPoints.findIndex(
                      (row) => row.sourceId === point.sourceId
                    );
                    const next =
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? keyboardPoints.length - 1
                          : (index +
                              (["ArrowLeft", "ArrowUp"].includes(event.key)
                                ? -1
                                : 1) +
                              keyboardPoints.length) %
                            keyboardPoints.length;
                    const id = keyboardPoints[next]?.sourceId;
                    if (id !== undefined) {
                      setActiveId(id);
                      pointRefs.current.get(id)?.focus();
                    }
                  } else if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    if (event.altKey) inspect(point.sourceId);
                    else select(point.sourceId);
                  }
                }}
              />
            );
          })}
        </g>
      </svg>
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
        activeId={activeId}
        owner={owner}
        getFieldLabel={getFieldLabel}
        onViewChange={saveView}
      />
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
