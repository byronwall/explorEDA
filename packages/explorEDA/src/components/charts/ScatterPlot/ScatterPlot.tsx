import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ScatterPlotSettings } from "./definition";
import { CalculatedFieldBadge } from "@/components/calculations/CalculatedFieldBadge";
import { ScatterSvg } from "./ScatterSvg";
import {
  findScatterTraceRow,
  resolveScatterTrace,
  scatterTraceTargets,
} from "./scatterTrace";
import {
  useChartTrace,
  useChartTraceApi,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import {
  brushFilters,
  planScatter,
  scatterHoverReadout,
  type Extent,
  type ScatterSnapshot,
} from "./scatterPlan";

interface ScatterPlotProps extends BaseChartProps {
  settings: ScatterPlotSettings;
}

export function ScatterPlot({
  settings,
  width,
  height,
  facetIds,
}: ScatterPlotProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const trace = useChartTrace();
  const traceApi = useChartTraceApi();
  const owner = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const data = useDataLayer((state) => state.data);
  const rawData = useDataLayer((state) => state.rawData);
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const manager = useDataLayer((state) => state.calculationManager);
  const calculations = useDataLayer((state) => state.calculations);
  const nonce = useDataLayer((state) => state.nonce);
  const chartItems = useDataLayer((state) => state.liveItems[settings.id]);
  const crossfilter = useDataLayer((state) => state.crossfilterWrapper);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const colorScale = useDataLayer((state) =>
    state.colorScales.find((item) => item.id === settings.colorScaleId)
  );
  const updateChart = useDataLayer((state) => state.updateChart);
  const allIds = useMemo(() => data.map((row) => row.__ID), [data]);

  const snapshot = useMemo((): ScatterSnapshot => {
    // Chart and global filter populations come from the same store update.
    const chartIds =
      chartItems?.items
        .filter((item) => item.value > 0)
        .map((item) => item.key) ?? [];
    // The data layer replaces cached columns after edits; old maps stay stable.
    const column = (field: string | undefined) =>
      field ? getColumnData(field) : {};
    return {
      revision: `${nonce}:${chartItems?.nonce ?? 0}`,
      allIds,
      chartIds,
      filteredIds: crossfilter.getFilteredRowIds(),
      facetIds: facetIds?.slice(),
      xData: column(settings.xField),
      yData: column(settings.yField),
      colorData: column(settings.colorField),
      facetRowData: settings.facet.enabled
        ? column(settings.facet.rowVariable)
        : undefined,
      facetColumnData:
        settings.facet.enabled && settings.facet.type === "grid"
          ? column(settings.facet.columnVariable)
          : undefined,
      fieldSettings: Object.fromEntries(
        Object.entries(fieldSettings).map(([field, value]) => [
          field,
          { ...value },
        ])
      ),
      colorScale:
        colorScale?.type === "categorical"
          ? {
              ...colorScale,
              mapping: new Map(colorScale.mapping),
              palette: [...colorScale.palette],
            }
          : colorScale && { ...colorScale },
      calculatedFields: calculations.map((calc) => calc.resultColumnName),
      pixelRatio:
        typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
    };
  }, [
    allIds,
    chartItems,
    crossfilter,
    getColumnData,
    fieldSettings,
    colorScale,
    calculations,
    nonce,
    settings.xField,
    settings.yField,
    settings.colorField,
    settings.facet,
    facetIds,
  ]);

  const plan = useMemo(
    () => planScatter(settings, snapshot, width, height),
    [settings, snapshot, width, height]
  );
  const source = useMemo(
    (): TraceSource => ({
      role: "chart",
      revision: plan.revision,
      resolve: (kind, id) =>
        resolveScatterTrace(
          { kind, id },
          plan,
          snapshot,
          settings,
          rawData,
          data,
          profiles,
          manager
        ),
      findRow: (id) => findScatterTraceRow(plan, id),
      targets: () => scatterTraceTargets(plan),
      legendItems:
        plan.legend?.type === "categorical" ? plan.legend.items : undefined,
    }),
    [plan, snapshot, settings, rawData, data, profiles, manager]
  );
  useTraceSource(owner, source);
  const choose = (kind: string, id: string) =>
    traceApi?.inspect(owner, kind, id);
  const activeSelection =
    trace?.selection?.owner === owner ? trace.selection : null;
  const pointAt = (x: number, y: number) => {
    let nearest: (typeof plan.points)[number] | undefined;
    let distance = 100;
    for (const point of plan.points) {
      const dx = point.x - x;
      const dy = point.y - y;
      const squared = dx * dx + dy * dy;
      if (squared < distance) {
        nearest = point;
        distance = squared;
      }
    }
    return nearest;
  };
  const hoveredPoint = plan.points.find((point) => point.id === hoveredId);
  const hoveredText =
    hoveredPoint && scatterHoverReadout(plan, snapshot, settings, hoveredPoint);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const dpr = plan.pixelRatio;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    ctx.translate(plan.margin.left, plan.margin.top);
    ctx.beginPath();
    ctx.rect(0, 0, plan.plotWidth, plan.plotHeight);
    ctx.clip();
    for (const point of plan.points) {
      ctx.fillStyle = point.color;
      ctx.globalAlpha = point.opacity;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [plan, width, height]);

  const handleBrushChange = useCallback(
    (extent: Extent | null) => {
      const filters = settings.filters.filter(
        (filter) =>
          filter.field !== settings.xField && filter.field !== settings.yField
      );
      if (extent) {
        const next = brushFilters(plan, extent);
        filters.push({
          type: "range",
          field: settings.xField,
          min: next.x[0],
          max: next.x[1],
        });
        filters.push({
          type: "range",
          field: settings.yField,
          min: next.y[0],
          max: next.y[1],
        });
      }
      updateChart(settings.id, { filters });
    },
    [plan, settings, updateChart]
  );

  return (
    <div
      style={{ width, height }}
      className="relative"
      onPointerLeave={() => setHoveredId(null)}
      onPointerDownCapture={() => setHoveredId(null)}
      onKeyDownCapture={(event) => {
        if (event.key === "Escape") {
          setHoveredId(null);
        }
      }}
      onPointerMove={(event) => {
        if (event.buttons) {
          return;
        }
        const bounds = event.currentTarget.getBoundingClientRect();
        const px = event.clientX - bounds.left - plan.margin.left;
        const py = event.clientY - bounds.top - plan.margin.top;
        if (px < 0 || px > plan.plotWidth || py < 0 || py > plan.plotHeight) {
          setHoveredId(null);
          return;
        }
        // ponytail: linear hit testing; use a spatial index if large point clouds need hover.
        setHoveredId(pointAt(px, py)?.id ?? null);
      }}
    >
      {plan.populations.facet > 0 ? (
        <>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ width, height }}
          />
          <ScatterSvg
            plan={plan}
            hoveredId={hoveredId}
            onBrushChange={handleBrushChange}
            onInspectPoint={(x, y) => {
              const point = pointAt(x, y);
              if (!point) return false;
              return Boolean(choose("point", point.id));
            }}
            onInspectGuide={(id) => choose("guide", id)}
            onInspectOverlay={(id) => choose("overlay", id)}
            selectedId={
              activeSelection?.kind === "guide" ? activeSelection.id : undefined
            }
          />
          {plan.calculatedBadges.map((badge) => (
            <span
              key={badge.id}
              className={`eda-scatter-axis-calc ${badge.rotation ? "eda-scatter-axis-calc-y" : ""}`}
              style={{ left: badge.x, top: badge.y }}
              onClickCapture={(event) => {
                if (!event.altKey) return;
                event.stopPropagation();
                choose("badge", badge.id);
              }}
            >
              <CalculatedFieldBadge
                field={badge.field}
                hoverOpen={false}
                side={badge.rotation ? "right" : "top"}
              />
            </span>
          ))}
          {hoveredPoint && (
            <div
              className="pointer-events-none absolute left-2 top-2 max-w-[min(16rem,70%)] rounded border border-border bg-card/95 px-2 py-1 text-xs text-card-foreground shadow-sm"
              role="status"
            >
              <div>
                {plan.xDisplay}: {hoveredText?.xText}
              </div>
              <div>
                {plan.yDisplay}: {hoveredText?.yText}
              </div>
              {settings.colorField && (
                <div>
                  Color · {settings.colorField}: {hoveredText?.colorText}
                </div>
              )}
              {settings.facet.enabled && (
                <div>
                  Facet {settings.facet.rowVariable}:{" "}
                  {hoveredText?.facetRowText}
                  {settings.facet.type === "grid" &&
                    ` · ${settings.facet.columnVariable}: ${hoveredText?.facetColumnText}`}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}
