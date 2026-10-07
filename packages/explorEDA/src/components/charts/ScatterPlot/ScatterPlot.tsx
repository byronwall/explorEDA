import type { BaseChartProps } from "@/types/ChartTypes";
import { ChartMessage, NO_MATCHING_ROWS } from "../ChartMessage";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ScatterPlotSettings } from "./definition";
import { CalculatedFieldBadge } from "@/components/calculations/CalculatedFieldBadge";
import { ScatterSvg } from "./ScatterSvg";
import { BubbleLegend } from "./BubbleLegend";
import { DensityScatter } from "./DensityScatter";
import { FitLabels } from "./FitLabels";
import { useScatterFits } from "./useScatterFits";
import { hexBinFilters, planHexbins, type HexTrace } from "./hexPlan";
import { planContours, type ContourTrace } from "./contourPlan";
import { SurfaceLayer, SurfaceLegend } from "./SurfaceLayer";
import { STATUS_LINE_HEIGHT } from "../ChartStatusLine";
import { buildScale } from "../Axis/axisPlan";
import {
  marginalBinFilters,
  planMarginals,
  type MarginalTrace,
} from "./marginalPlan";
import { useScatterData } from "./useScatterData";
import { ChartReadout } from "../ChartReadout";
import { ChartStatusLine, STATUS_HINT_MIN_WIDTH } from "../ChartStatusLine";
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
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import {
  BADGE_GAP,
  brushFilters,
  planScatter,
  scatterHoverReadout,
  scatterPointAt,
  type Extent,
} from "./scatterPlan";

interface ScatterPlotProps extends BaseChartProps<ScatterPlotSettings> {
  settings: ScatterPlotSettings;
}

/** Points, hexagons, and smoothed density share one chart; rectangles have their own. */
export function ScatterPlot(props: ScatterPlotProps) {
  return props.settings.display === "density" ? (
    <DensityScatter {...props} />
  ) : (
    <ScatterPoints {...props} />
  );
}

function ScatterPoints({
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
  const {
    snapshot,
    data,
    rawData,
    profiles,
    manager,
    updateChart,
    getFieldLabel,
  } = useScatterData(settings, facetIds);

  const plan = useMemo(
    () =>
      planScatter(
        // Bubble sizes do not apply under a density surface.
        settings.display === "hexbin" || settings.display === "contour"
          ? { ...settings, sizeField: undefined }
          : settings,
        snapshot,
        width,
        height
      ),
    [settings, snapshot, width, height]
  );
  const fits = useScatterFits(settings, snapshot, plan);
  const marginals = useMemo(
    () => planMarginals(settings, plan),
    [settings, plan]
  );
  const [hoveredMarginalId, setHoveredMarginalId] = useState<string>();
  const hex = useMemo(
    () => planHexbins(settings, snapshot, plan),
    [settings, snapshot, plan]
  );
  const contour = useMemo(() => planContours(settings, plan), [settings, plan]);
  const surfaceMode = Boolean(hex || contour);
  const showSurfacePoints = hex
    ? Boolean(settings.hexbin?.showPoints)
    : settings.contour?.showPoints !== false;
  const [hoveredMarkId, setHoveredMarkId] = useState<string>();
  const [hoverDensity, setHoverDensity] = useState<number>();
  const resolveSurface = (
    kind: string,
    id: string
  ): HexTrace | ContourTrace | undefined => {
    if (kind === "hex-bin" && hex) {
      const bin = hex.bins.find((item) => item.id === id);
      if (!bin) return undefined;
      const invert = (descriptor: typeof plan.xScale, px: number) =>
        (
          buildScale(descriptor) as unknown as { invert: (v: number) => number }
        ).invert(px);
      return {
        kind: "hex-bin",
        id,
        revision: plan.revision,
        bin,
        hex,
        xLabel: plan.xDisplay,
        yLabel: plan.yDisplay,
        center: [invert(plan.xScale, bin.cx), invert(plan.yScale, bin.cy)],
      };
    }
    if (kind === "contour-level" && contour) {
      const level = contour.levels.find((item) => item.id === id);
      return level
        ? {
            kind: "contour-level",
            id,
            revision: plan.revision,
            level,
            contour,
            xLabel: plan.xDisplay,
            yLabel: plan.yDisplay,
          }
        : undefined;
    }
    return undefined;
  };
  const [activeFitId, setActiveFitId] = useState<string>();
  const resolveMarginal = (
    kind: string,
    id: string
  ): MarginalTrace | undefined => {
    const bin =
      kind === "marginal-bin"
        ? marginals?.bins.find((item) => item.id === id)
        : undefined;
    return bin && marginals
      ? { kind: "marginal-bin", id, revision: plan.revision, bin, marginals }
      : undefined;
  };
  const source = useMemo(
    (): TraceSource => ({
      role: "chart",
      revision: plan.revision,
      resolve: (kind, id) =>
        fits.resolve(kind, id) ??
        resolveMarginal(kind, id) ??
        resolveSurface(kind, id) ??
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
      findRow: (id) => {
        const bin = hex?.bins.find((item) => item.sourceIds.includes(id));
        return bin
          ? { kind: "hex-bin", id: bin.id }
          : findScatterTraceRow(plan, id);
      },
      targets: () => [
        ...fits.targets(),
        ...(hex?.bins.map((bin) => ({
          kind: "hex-bin",
          id: bin.id,
          label: `Hexagon: ${bin.rowIds.length} rows`,
        })) ?? []),
        ...(contour?.levels.map((level) => ({
          kind: "contour-level",
          id: level.id,
          label: `Density level ${level.index + 1}: ${Math.round(level.coverage * 100)}% of rows`,
        })) ?? []),
        ...(marginals?.bins.map((bin) => ({
          kind: "marginal-bin",
          id: bin.id,
          label: `${bin.label} histogram: ${bin.sourceIds.length} rows`,
        })) ?? []),
        ...scatterTraceTargets(plan),
      ],
      legendItems:
        plan.legend?.type === "categorical" ? plan.legend.items : undefined,
    }),
    [
      plan,
      snapshot,
      settings,
      rawData,
      data,
      profiles,
      manager,
      fits,
      marginals,
    ]
  );
  useTraceSource(owner, source);
  const choose = (kind: string, id: string) =>
    traceApi?.inspect(owner, kind, id);
  const activeSelection =
    trace?.selection?.owner === owner ? trace.selection : null;
  const pointAt = (x: number, y: number) => scatterPointAt(plan, x, y);
  const selectPoint = (id: string) => {
    const point = plan.points.find((point) => point.id === id);
    if (!point) return;
    const selected =
      settings.filters.length === 1 &&
      settings.filters[0]?.type === "value" &&
      settings.filters[0].field === "__ID" &&
      settings.filters[0].values[0] === point.sourceId;
    updateChart(settings.id, {
      filters: selected
        ? []
        : [{ type: "value", field: "__ID", values: [point.sourceId] }],
    });
  };
  const hoveredPoint = plan.points.find((point) => point.id === hoveredId);
  const hoveredHex = hex?.bins.find((bin) => bin.id === hoveredMarkId);
  const hoveredMarginal = marginals?.bins.find(
    (bin) => bin.id === hoveredMarginalId
  );
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
    // Density surfaces and bubbles draw after the grid in SVG.
    if (surfaceMode || plan.size) return;
    for (const point of plan.points) {
      ctx.fillStyle = point.color;
      ctx.globalAlpha = point.opacity;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      if (plan.size && point.sizeValue === 0) {
        ctx.strokeStyle = point.color;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else ctx.fill();
    }
  }, [plan, width, height, surfaceMode]);

  // Title glyph widths vary by font, so move each badge to the rendered end.
  const rootRef = useRef<HTMLDivElement>(null);
  const [badgeAnchors, setBadgeAnchors] = useState<
    Record<string, { x: number; y: number }>
  >({});
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const origin = root.getBoundingClientRect();
    const next: Record<string, { x: number; y: number }> = {};
    for (const badge of plan.calculatedBadges) {
      const axis = badge.rotation ? "y" : "x";
      const box = root
        .querySelector(`[data-plan-id="${axis}:label"] text`)
        ?.getBoundingClientRect();
      if (!box?.width || !box.height) continue;
      next[badge.id] = badge.rotation
        ? {
            x: box.left + box.width / 2 - origin.left,
            y: box.top - origin.top - BADGE_GAP,
          }
        : {
            x: box.right - origin.left + BADGE_GAP,
            y: box.top + box.height / 2 - origin.top,
          };
    }
    setBadgeAnchors(next);
  }, [plan]);

  const brushed = plan.brushExtent
    ? plan.points.filter((point) => point.passesOwnFilter).length
    : 0;
  const showHints = width >= STATUS_HINT_MIN_WIDTH && !facetIds;
  const statusParts = facetIds
    ? []
    : [
        plan.brushExtent &&
          `${brushed.toLocaleString()} of ${plan.points.length.toLocaleString()} points selected`,
      ];
  const statusHint =
    showHints &&
    (plan.brushExtent
      ? "Drag the edges to adjust, Esc to clear"
      : hex
        ? "Click a hexagon to select its rows, Alt-click to trace it"
        : contour
          ? "Drag to select a region, Alt-click a density region to trace it"
          : fits.marks.length
            ? "Drag to select a region, Alt-click a point or fit line to trace it"
            : "Drag to select a region, Alt-click a point to trace it");

  const handleBrushChange = useCallback(
    (extent: Extent | null) => {
      const filters = settings.filters.filter(
        (filter) =>
          filter.field !== settings.xField &&
          filter.field !== settings.yField &&
          filter.field !== "__ID" &&
          (!settings.sizeField || filter.field !== settings.sizeField)
      );
      if (extent) {
        filters.push(...brushFilters(plan, extent));
      }
      updateChart(settings.id, { filters });
    },
    [plan, settings, updateChart]
  );

  return (
    <div
      ref={rootRef}
      style={{ width, height }}
      className="relative"
      onPointerLeave={() => {
        setHoveredId(null);
        setHoveredMarkId(undefined);
        setHoverDensity(undefined);
      }}
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
        if (hex) {
          setHoveredMarkId(hex.hexAt(px, py)?.id);
          setHoveredId(
            showSurfacePoints ? (pointAt(px, py)?.id ?? null) : null
          );
          return;
        }
        if (contour) setHoverDensity(contour.densityAt(px, py));
        if (surfaceMode && !showSurfacePoints) return;
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
            hoveredId={
              hoveredId ??
              (activeSelection?.kind === "point" ? activeSelection.id : null)
            }
            onHoverPoint={setHoveredId}
            onActivatePoint={(id, inspect) =>
              inspect ? choose("point", id) : selectPoint(id)
            }
            onSelectPoint={(x, y) => {
              const point = pointAt(x, y);
              if (!point) return false;
              selectPoint(point.id);
              return true;
            }}
            onBrushChange={handleBrushChange}
            onClearPlot={() => {
              if (settings.filters.length)
                updateChart(settings.id, { filters: [] });
            }}
            onInspectPoint={(x, y) => {
              if (surfaceMode && !showSurfacePoints) return false;
              const point = pointAt(x, y);
              if (!point) return false;
              return Boolean(choose("point", point.id));
            }}
            fitMarks={fits.marks}
            bubblePoints={plan.size ? plan.points : undefined}
            surface={
              surfaceMode && (
                <SurfaceLayer
                  plan={plan}
                  hex={hex}
                  contour={contour}
                  showPoints={showSurfacePoints}
                  activeId={
                    hoveredMarkId ??
                    (activeSelection?.kind === "hex-bin" ||
                    activeSelection?.kind === "contour-level"
                      ? activeSelection.id
                      : undefined)
                  }
                />
              )
            }
            markFirst={Boolean(hex)}
            onMark={(id, inspect) => {
              if (hex) {
                const bin = hex.bins.find((item) => item.id === id);
                if (!bin) return false;
                if (inspect) choose("hex-bin", id);
                else
                  updateChart(settings.id, {
                    filters: hexBinFilters(settings, bin),
                  });
                return true;
              }
              if (contour && inspect) {
                choose("contour-level", id);
                return true;
              }
              return false;
            }}
            marginals={marginals}
            activeMarginalId={
              hoveredMarginalId ??
              (activeSelection?.kind === "marginal-bin"
                ? activeSelection.id
                : undefined)
            }
            onHoverMarginal={setHoveredMarginalId}
            onMarginal={(id, inspect) => {
              const bin = marginals?.bins.find((item) => item.id === id);
              if (!bin) return;
              if (inspect) choose("marginal-bin", id);
              else
                updateChart(settings.id, {
                  filters: marginalBinFilters(settings, bin),
                });
            }}
            onMarginalBrush={(axis, bounds) => {
              const field = axis === "x" ? settings.xField : settings.yField;
              const filters = settings.filters.filter(
                (filter) => !(filter.field === field && filter.type === "range")
              );
              filters.push({
                type: "range",
                field,
                min: bounds[0],
                max: bounds[1],
              });
              updateChart(settings.id, { filters });
            }}
            activeFitId={activeFitId}
            onActiveFit={setActiveFitId}
            onInspectFit={(id) => choose("fit", id)}
            onInspectGuide={(id) => choose("guide", id)}
            onInspectOverlay={(id) => choose("overlay", id)}
            selectedId={
              activeSelection?.kind === "guide" ? activeSelection.id : undefined
            }
          />
          {(fits.plan || fits.summary) && (
            <FitLabels
              fits={fits.plan}
              summary={fits.summary}
              plan={plan}
              activeId={
                activeFitId ??
                (activeSelection?.kind === "fit"
                  ? activeSelection.id
                  : undefined)
              }
              onActive={setActiveFitId}
              onTrace={choose}
            />
          )}
          {plan.size && (
            <BubbleLegend
              size={plan.size}
              bottom={STATUS_LINE_HEIGHT + 2}
              exclusions={plan.exclusions.filter(
                (item) => item.reason === "invalid-size"
              )}
              onInspectExcluded={(id) => choose("excluded", String(id))}
            />
          )}
          {plan.calculatedBadges.map((badge) => (
            <span
              key={badge.id}
              className={`eda-scatter-axis-calc ${badge.rotation ? "eda-scatter-axis-calc-y" : ""}`}
              style={{
                left: badgeAnchors[badge.id]?.x ?? badge.x,
                top: badgeAnchors[badge.id]?.y ?? badge.y,
              }}
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
          <ChartStatusLine
            parts={statusParts}
            hint={statusHint}
            left={plan.margin.left}
            right={plan.margin.right + (plan.exclusions.length > 0 ? 26 : 0)}
          />
          {plan.exclusions.length > 0 && !plan.emptyMessage && (
            <div
              className="absolute"
              style={{ right: plan.margin.right, bottom: 0 }}
            >
              <ActionTooltip
                content={`${plan.exclusions.length.toLocaleString()} rows are left out because a plotted value is missing or invalid. Activate to inspect an example.`}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-5 text-warning"
                  aria-label={`${plan.exclusions.length.toLocaleString()} rows left out because a plotted value is missing or invalid. Inspect an example.`}
                  onClick={() =>
                    choose("excluded", String(plan.exclusions[0]!.sourceId))
                  }
                >
                  <TriangleAlert aria-hidden="true" className="size-3.5" />
                </Button>
              </ActionTooltip>
            </div>
          )}
          {plan.emptyMessage && (
            <div
              className="pointer-events-none absolute flex items-center justify-center p-3 text-center"
              style={{
                left: plan.margin.left,
                top: plan.margin.top,
                width: plan.plotWidth,
                height: plan.plotHeight,
              }}
            >
              <div
                className="max-w-[18rem] text-xs text-muted-foreground"
                role="status"
              >
                <div className="font-medium text-foreground">
                  No points to plot
                </div>
                {plan.emptyMessage}
              </div>
            </div>
          )}
          {surfaceMode && (
            <SurfaceLegend
              hex={hex}
              contour={contour}
              bottom={(facetIds ? 0 : STATUS_LINE_HEIGHT) + 2}
              left={plan.margin.left}
              right={plan.margin.right}
              compact={plan.plotWidth < 420}
            />
          )}
          {(hex?.notice || contour?.notice) && (
            <div
              className="pointer-events-none absolute flex items-center justify-center p-3 text-center text-sm text-muted-foreground"
              style={{
                left: plan.margin.left,
                top: plan.margin.top,
                width: Math.max(0, plan.plotWidth),
                height: Math.max(0, plan.plotHeight),
              }}
              role="status"
            >
              {hex?.notice ?? contour?.notice}
            </div>
          )}
          {!hoveredPoint && !hoveredMarginal && hoveredHex && (
            <ChartReadout fallbackClassName="eda-chart-readout-inline">
              <span className="eda-readout-item">
                <span>Hexagon</span>
                <b>
                  {hoveredHex.rowIds.length.toLocaleString()} rows
                  {settings.filters.length > 0 &&
                    ` · ${hoveredHex.matching.toLocaleString()} selected`}
                </b>
              </span>
            </ChartReadout>
          )}
          {!hoveredPoint &&
            !hoveredMarginal &&
            contour &&
            hoverDensity !== undefined && (
              <ChartReadout fallbackClassName="eda-chart-readout-inline">
                <span className="eda-readout-item">
                  <span>Smoothed density</span>
                  <b>{Number(hoverDensity.toPrecision(3))} rows per X×Y unit</b>
                </span>
              </ChartReadout>
            )}
          {hoveredMarginal && !hoveredPoint && (
            <ChartReadout fallbackClassName="eda-chart-readout-inline">
              <span className="eda-readout-item">
                <span>
                  {hoveredMarginal.label}{" "}
                  {hoveredMarginal.bounds
                    .map((value) => Number(value.toPrecision(4)))
                    .join(" to ")}
                </span>
                <b>
                  {hoveredMarginal.sourceIds.length.toLocaleString()} rows
                  {marginals?.split &&
                    ` · ${hoveredMarginal.selected.toLocaleString()} selected`}
                </b>
              </span>
            </ChartReadout>
          )}
          {hoveredPoint && (
            // The crosshair marks the point; its values read in one line
            // outside the plot.
            <ChartReadout fallbackClassName="eda-chart-readout-inline">
              {(
                [
                  [plan.xDisplay, hoveredText?.xText],
                  [plan.yDisplay, hoveredText?.yText],
                  settings.sizeField && [
                    getFieldLabel(settings.sizeField),
                    hoveredText?.sizeText,
                  ],
                  settings.colorField && [
                    getFieldLabel(settings.colorField),
                    hoveredText?.colorText,
                  ],
                  settings.facet.enabled && [
                    getFieldLabel(settings.facet.rowVariable),
                    hoveredText?.facetRowText,
                  ],
                  settings.facet.enabled &&
                    settings.facet.type === "grid" && [
                      getFieldLabel(settings.facet.columnVariable),
                      hoveredText?.facetColumnText,
                    ],
                ] as Array<false | "" | undefined | [string, string?]>
              )
                .filter(
                  (item, index, items) =>
                    item &&
                    items.findIndex(
                      (other) => other && other[0] === item[0]
                    ) === index
                )
                .map(
                  (item) =>
                    item && (
                      // Short of room, the name gives way before the value.
                      <span key={item[0]} className="eda-readout-item">
                        <span>{item[0]}</span>
                        <b>{item[1]}</b>
                      </span>
                    )
                )}
            </ChartReadout>
          )}
        </>
      ) : (
        <ChartMessage>
          {plan.populations.all > 0 ? NO_MATCHING_ROWS : "No rows to show."}
        </ChartMessage>
      )}
    </div>
  );
}
