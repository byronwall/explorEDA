import { useThemeColors } from "@/hooks/useDisplayColorScales";
import { useBrush } from "@/hooks/useBrush";
import {
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  planScatterOverlay,
  type Extent,
  type ScatterPlan,
  type SvgPrimitive,
} from "./scatterPlan";
import { findAxisGuide } from "../Axis/axisPlan";
import { PlannedAxes, PlannedGrid } from "../Axis/AxisLayer";
import type { FitMark } from "./fitPlan";
import {
  MARGINAL_GAP,
  MARGINAL_SIZE,
  MARGINAL_UNSELECTED,
  type MarginalPlan,
} from "./marginalPlan";

/**
 * X and Y histograms in the margins. They stack by the points' color
 * categories, and rows outside the selection read gray, as their points do.
 */
function MarginalBars({
  marginals,
  activeId,
  onHover,
  margin,
  plotWidth,
  plotHeight,
  onBrush,
}: {
  marginals: MarginalPlan;
  activeId?: string;
  onHover?: (id: string | undefined) => void;
  margin: { left: number; top: number };
  plotWidth: number;
  plotHeight: number;
  onBrush?: (axis: "x" | "y", bounds: [number, number]) => void;
}) {
  const { mark } = useThemeColors();
  const drag = useRef<{
    axis: "x" | "y";
    start: number;
    current: number;
    moved: boolean;
  } | null>(null);
  const didBrush = useRef(false);
  const [preview, setPreview] = useState<{
    axis: "x" | "y";
    start: number;
    current: number;
  } | null>(null);
  const position = (event: ReactPointerEvent<SVGElement>, axis: "x" | "y") => {
    const rect = event.currentTarget.ownerSVGElement!.getBoundingClientRect();
    return axis === "x"
      ? event.clientX - rect.left - margin.left
      : event.clientY - rect.top - margin.top;
  };
  const beginBrush = (
    event: ReactPointerEvent<SVGElement>,
    axis: "x" | "y"
  ) => {
    if (event.button !== 0 || !onBrush) return;
    event.stopPropagation();
    const start = position(event, axis);
    drag.current = { axis, start, current: start, moved: false };
    didBrush.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const moveBrush = (event: ReactPointerEvent<SVGElement>) => {
    const active = drag.current;
    if (!active) return;
    active.current = position(event, active.axis);
    active.moved ||= Math.abs(active.current - active.start) >= 3;
    if (active.moved) {
      event.preventDefault();
      setPreview({
        axis: active.axis,
        start: active.start,
        current: active.current,
      });
    }
  };
  const endBrush = (event: ReactPointerEvent<SVGElement>) => {
    const active = drag.current;
    if (!active) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (!active.moved) return;
    setPreview(null);
    didBrush.current = true;
    const bins = marginals.bins
      .filter((bin) => bin.axis === active.axis)
      .sort((a, b) => a.bounds[0] - b.bounds[0]);
    const center = (bin: (typeof bins)[number]) =>
      active.axis === "x" ? bin.x + bin.width / 2 : bin.y + bin.height / 2;
    const nearest = (value: number) =>
      bins.reduce<(typeof bins)[number] | undefined>(
        (best, bin) =>
          !best ||
          Math.abs(center(bin) - value) < Math.abs(center(best) - value)
            ? bin
            : best,
        undefined
      );
    const first = nearest(active.start);
    const last = nearest(active.current);
    if (first && last) {
      const low = Math.min(bins.indexOf(first), bins.indexOf(last));
      const high = Math.max(bins.indexOf(first), bins.indexOf(last));
      onBrush?.(active.axis, [bins[low]!.bounds[0], bins[high]!.bounds[1]]);
    }
  };
  const cancelBrush = () => {
    drag.current = null;
    setPreview(null);
  };
  const finishClick = (event: MouseEvent<SVGElement>) => {
    if (!didBrush.current) return;
    event.preventDefault();
    event.stopPropagation();
    didBrush.current = false;
  };
  const interval = (bounds: [number, number]) =>
    bounds.map((value) => Number(value.toPrecision(4))).join(" to ");
  return (
    <g className="eda-marginals">
      {onBrush && marginals.bins.some((bin) => bin.axis === "x") && (
        <rect
          x={0}
          y={-MARGINAL_GAP - MARGINAL_SIZE}
          width={plotWidth}
          height={MARGINAL_SIZE}
          fill="transparent"
          pointerEvents="all"
          aria-hidden="true"
          data-marginal-band
          onPointerDown={(event) => beginBrush(event, "x")}
          onPointerMove={moveBrush}
          onPointerUp={endBrush}
          onPointerCancel={cancelBrush}
          onLostPointerCapture={cancelBrush}
          onClickCapture={finishClick}
        />
      )}
      {onBrush && marginals.bins.some((bin) => bin.axis === "y") && (
        <rect
          x={plotWidth + MARGINAL_GAP}
          y={0}
          width={MARGINAL_SIZE}
          height={plotHeight}
          fill="transparent"
          pointerEvents="all"
          aria-hidden="true"
          data-marginal-band
          onPointerDown={(event) => beginBrush(event, "y")}
          onPointerMove={moveBrush}
          onPointerUp={endBrush}
          onPointerCancel={cancelBrush}
          onLostPointerCapture={cancelBrush}
          onClickCapture={finishClick}
        />
      )}
      {marginals.bins.map((bin) => {
        const active = bin.id === activeId;
        const share =
          bin.axis === "x"
            ? {
                x: bin.x,
                width: bin.width,
                y: bin.y + bin.height - bin.selectedLength,
                height: bin.selectedLength,
              }
            : {
                x: bin.x,
                width: bin.selectedLength,
                y: bin.y,
                height: bin.height,
              };
        return (
          <g
            key={bin.id}
            data-marginal-id={bin.id}
            role="button"
            tabIndex={-1}
            aria-label={`${bin.label} ${interval(bin.bounds)}: ${bin.sourceIds.length} rows${marginals.split ? `, ${bin.selected} selected` : ""}`}
            className="cursor-pointer"
            onPointerEnter={() => onHover?.(bin.id)}
            onPointerLeave={() => onHover?.(undefined)}
            onPointerDown={(event) => beginBrush(event, bin.axis)}
            onPointerMove={moveBrush}
            onPointerUp={endBrush}
            onPointerCancel={cancelBrush}
            onLostPointerCapture={cancelBrush}
            onClickCapture={finishClick}
          >
            <rect
              x={bin.x}
              y={bin.y}
              width={bin.width}
              height={bin.height}
              fill={
                bin.segments
                  ? "transparent"
                  : marginals.split
                    ? MARGINAL_UNSELECTED
                    : "var(--eda-count)"
              }
              fillOpacity={marginals.split ? 0.45 : active ? 0.85 : 0.6}
              stroke={active && !bin.segments ? "var(--foreground)" : "none"}
            />
            {bin.segments?.map((segment) => (
              <rect
                key={segment.key}
                x={segment.x}
                y={segment.y}
                width={segment.width}
                height={segment.height}
                fill={segment.color}
                fillOpacity={segment.selected ? (active ? 0.95 : 0.8) : 0.45}
                pointerEvents="none"
              />
            ))}
            {bin.segments && active && (
              <rect
                x={bin.x}
                y={bin.y}
                width={bin.width}
                height={bin.height}
                fill="none"
                stroke="var(--foreground)"
                pointerEvents="none"
              />
            )}
            {!bin.segments && marginals.split && bin.selected > 0 && (
              <rect
                {...share}
                fill={mark}
                fillOpacity={active ? 0.95 : 0.8}
                pointerEvents="none"
              />
            )}
          </g>
        );
      })}
      {preview &&
        (preview.axis === "x" ? (
          <rect
            x={Math.min(preview.start, preview.current)}
            y={-MARGINAL_GAP - MARGINAL_SIZE}
            width={Math.abs(preview.current - preview.start)}
            height={MARGINAL_SIZE}
            fill="var(--primary)"
            fillOpacity={0.16}
            stroke="var(--primary)"
            pointerEvents="none"
          />
        ) : (
          <rect
            x={plotWidth + MARGINAL_GAP}
            y={Math.min(preview.start, preview.current)}
            width={MARGINAL_SIZE}
            height={Math.abs(preview.current - preview.start)}
            fill="var(--primary)"
            fillOpacity={0.16}
            stroke="var(--primary)"
            pointerEvents="none"
          />
        ))}
    </g>
  );
}

/** Fitted curves over the points, with a halo so they read over dense clouds. */
export function FitCurves({
  marks,
  activeId,
}: {
  marks: FitMark[];
  activeId?: string;
}) {
  return (
    <g className="eda-fit-curves">
      {marks.map((mark) => (
        <g
          key={mark.id}
          data-fit-id={mark.id}
          role="img"
          aria-label={mark.label}
        >
          <path
            d={mark.path}
            fill="none"
            stroke="var(--background)"
            strokeOpacity={0.75}
            strokeWidth={mark.id === activeId ? 6 : 4.5}
            strokeLinecap="round"
            pointerEvents="none"
          />
          <path
            d={mark.path}
            fill="none"
            stroke={mark.color}
            strokeWidth={mark.id === activeId ? 3 : 2}
            strokeDasharray={mark.dashed ? "6 4" : undefined}
            strokeLinecap="round"
            pointerEvents="none"
          />
          <path
            d={mark.path}
            fill="none"
            stroke="transparent"
            strokeWidth={10}
            pointerEvents="stroke"
          />
        </g>
      ))}
    </g>
  );
}

function Primitive({
  item,
  selected,
}: {
  item: SvgPrimitive;
  selected: boolean;
}) {
  if (item.kind === "line") {
    const { kind, id, hitStrokeWidth, ...props } = item;
    void kind;
    const hasHitTarget = hitStrokeWidth !== undefined;
    const line = (
      <line
        data-plan-id={id}
        {...props}
        style={selected ? { stroke: "var(--primary)" } : undefined}
        strokeOpacity={selected ? 1 : item.strokeOpacity}
        strokeWidth={selected ? 2.5 : item.strokeWidth}
        pointerEvents={hasHitTarget ? "none" : undefined}
      />
    );
    return hasHitTarget ? (
      <g>
        {line}
        <line
          data-plan-id={id}
          x1={item.x1}
          y1={item.y1}
          x2={item.x2}
          y2={item.y2}
          stroke="transparent"
          strokeWidth={hitStrokeWidth}
          pointerEvents="stroke"
        />
      </g>
    ) : (
      line
    );
  }
  if (item.kind === "rect") {
    const { kind, id, cursor, ...props } = item;
    void kind;
    return <rect data-plan-id={id} {...props} style={{ cursor }} />;
  }
  if (item.kind === "circle") {
    const { kind, id, ...props } = item;
    void kind;
    return <circle data-plan-id={id} {...props} />;
  }
  const { kind, id, title, text, ...props } = item;
  void kind;
  return (
    <text
      data-plan-id={id}
      {...props}
      aria-label={title}
      fill={selected ? "var(--primary)" : item.fill}
      textDecoration={selected ? "underline" : undefined}
    >
      {text}
    </text>
  );
}

function Primitives({
  items,
  selectedId,
}: {
  items: SvgPrimitive[];
  selectedId?: string;
}) {
  return items.map((item) => (
    <Primitive key={item.id} item={item} selected={item.id === selectedId} />
  ));
}

export function ScatterSvg({
  plan,
  hoveredId,
  onBrushChange,
  onInspectPoint,
  onInspectGuide,
  onInspectOverlay,
  selectedId,
  onHoverPoint,
  onActivatePoint,
  onSelectPoint,
  fitMarks = [],
  bubblePoints,
  surface,
  onMark,
  markFirst = false,
  marginals,
  activeMarginalId,
  onHoverMarginal,
  onMarginal,
  onMarginalBrush,
  onClearPlot,
  activeFitId,
  onActiveFit,
  onInspectFit,
}: {
  fitMarks?: FitMark[];
  bubblePoints?: ScatterPlan["points"];
  /** A density surface drawn under the fits, such as hexagons or contours. */
  surface?: ReactNode;
  /** A click on a surface mark; returns false to fall through. */
  onMark?: (id: string, inspect: boolean) => boolean;
  /** Hexagons take clicks before points; contours only where no point is near. */
  markFirst?: boolean;
  marginals?: MarginalPlan;
  activeMarginalId?: string;
  onHoverMarginal?: (id: string | undefined) => void;
  onMarginal?: (id: string, inspect: boolean) => void;
  onMarginalBrush?: (axis: "x" | "y", bounds: [number, number]) => void;
  /**
   * A plain click on empty space, in the plot or a marginal band. The chart
   * clears its filters. Without it, the plot clears only the brush.
   */
  onClearPlot?: () => void;
  activeFitId?: string;
  onActiveFit?: (id: string | undefined) => void;
  onInspectFit?: (id: string) => void;
  plan: ScatterPlan;
  hoveredId: string | null;
  onBrushChange: (extent: Extent | null) => void;
  onInspectPoint: (x: number, y: number) => boolean;
  onInspectGuide: (id: string) => void;
  onInspectOverlay: (id: string) => void;
  selectedId?: string;
  onHoverPoint?: (id: string) => void;
  onActivatePoint?: (id: string, inspect: boolean) => void;
  onSelectPoint?: (x: number, y: number) => boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const altAtDown = useRef(false);
  const [hoveredGuideId, setHoveredGuideId] = useState<string | null>(null);
  const [altHover, setAltHover] = useState(false);
  const chartId = useId();
  const brush = useBrush({
    svgRef,
    marginLeft: plan.margin.left,
    marginTop: plan.margin.top,
    innerWidth: plan.plotWidth,
    innerHeight: plan.plotHeight,
    mode: "2d",
    onBrushChange,
    onPlotClick: (_, event) =>
      event.altKey || altAtDown.current || Boolean(plan.size),
    defaultExtent: plan.brushExtent,
    onDeadClick: (inside) => {
      if (inside) return;
      if (onClearPlot) onClearPlot();
      else onBrushChange(null);
    },
  });
  const clearPlot = () => {
    if (onClearPlot) {
      brush.cancel();
      onClearPlot();
    } else brush.clear();
  };
  const overlay = planScatterOverlay(plan, brush.extent ?? null, hoveredId);
  const keyboardPoints = useMemo(
    () =>
      plan.size ? [...plan.points].sort((a, b) => a.sourceId - b.sourceId) : [],
    [plan]
  );
  const active =
    keyboardPoints.find((point) => point.id === hoveredId) ?? keyboardPoints[0];

  if (plan.width < 1 || plan.height < 1) {
    return null;
  }

  return (
    <svg
      ref={svgRef}
      width={plan.width}
      height={plan.height}
      role="group"
      aria-label={plan.title}
      aria-describedby={`${chartId}-description`}
      aria-description={
        plan.size
          ? "Arrow keys move between bubbles. Enter selects the source row. Alt-Enter inspects it. Escape clears the selection."
          : undefined
      }
      className="absolute select-none"
      style={{
        cursor:
          altHover && (hoveredId || hoveredGuideId || activeFitId)
            ? "pointer"
            : brush.getCursor(),
        touchAction: "none",
      }}
      tabIndex={0}
      onFocus={(event) => {
        if (event.target === event.currentTarget && active)
          onHoverPoint?.(active.id);
      }}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && active && plan.size) {
          const index = keyboardPoints.indexOf(active);
          if (
            [
              "ArrowRight",
              "ArrowDown",
              "ArrowLeft",
              "ArrowUp",
              "Home",
              "End",
            ].includes(event.key)
          ) {
            event.preventDefault();
            event.stopPropagation();
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? keyboardPoints.length - 1
                  : (index +
                      (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) +
                      keyboardPoints.length) %
                    keyboardPoints.length;
            onHoverPoint?.(keyboardPoints[next]!.id);
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            onActivatePoint?.(active.id, event.altKey);
            return;
          }
        }
        const id = (event.target as Element)
          .closest("[data-plan-id]")
          ?.getAttribute("data-plan-id");
        if (
          event.altKey &&
          event.key === "Enter" &&
          id &&
          findAxisGuide(plan.axes, id)
        ) {
          event.preventDefault();
          event.stopPropagation();
          onInspectGuide(id);
          return;
        }
        if (event.key === "Escape") {
          event.stopPropagation();
          brush.clear();
        }
      }}
      onPointerDownCapture={(event) => {
        altAtDown.current = event.altKey;
        brush.handlePointerDown(event);
      }}
      onPointerMoveCapture={(event) => {
        brush.handlePointerMove(event);
        setAltHover(event.altKey);
        const id = (event.target as Element)
          .closest("[data-plan-id]")
          ?.getAttribute("data-plan-id");
        setHoveredGuideId(
          event.altKey && id && findAxisGuide(plan.axes, id) ? id : null
        );
        if (fitMarks.length && !event.buttons)
          onActiveFit?.(
            (event.target as Element)
              .closest("[data-fit-id]")
              ?.getAttribute("data-fit-id") ?? undefined
          );
      }}
      onPointerLeave={() => {
        setHoveredGuideId(null);
        if (fitMarks.length) onActiveFit?.(undefined);
        setAltHover(false);
      }}
      onPointerUpCapture={brush.handlePointerUp}
      onPointerCancel={brush.cancel}
      onLostPointerCapture={brush.cancel}
      onClick={(event) => {
        const marginalId = (event.target as Element)
          .closest("[data-marginal-id]")
          ?.getAttribute("data-marginal-id");
        if (marginalId && onMarginal) {
          onMarginal(marginalId, event.altKey);
          return;
        }
        // A click in a marginal band that misses every bin is a dead click.
        if (
          !event.altKey &&
          (event.target as Element).closest("[data-marginal-band]")
        ) {
          clearPlot();
          return;
        }
        const markId = (event.target as Element)
          .closest("[data-mark-id]")
          ?.getAttribute("data-mark-id");
        const tryMark = () =>
          Boolean(
            markId && !brush.wasDrag.current && onMark?.(markId, event.altKey)
          );
        if (markFirst && tryMark()) return;
        if (brush.wasDrag.current || (!event.altKey && !plan.size)) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left - plan.margin.left;
        const y = event.clientY - rect.top - plan.margin.top;
        if (!event.altKey) {
          if (
            x >= 0 &&
            x <= plan.plotWidth &&
            y >= 0 &&
            y <= plan.plotHeight &&
            !onSelectPoint?.(x, y)
          )
            clearPlot();
          return;
        }
        const fitId = (event.target as Element)
          .closest("[data-fit-id]")
          ?.getAttribute("data-fit-id");
        if (fitId && onInspectFit) {
          onInspectFit(fitId);
          return;
        }
        if (
          x >= 0 &&
          x <= plan.plotWidth &&
          y >= 0 &&
          y <= plan.plotHeight &&
          onInspectPoint(x, y)
        )
          return;
        if (!markFirst && tryMark()) return;
        const id = (event.target as Element)
          .closest("[data-plan-id]")
          ?.getAttribute("data-plan-id");
        if (id && findAxisGuide(plan.axes, id)) {
          onInspectGuide(id);
          return;
        }
        if (id && overlay.brush.some((item) => item.id === id)) {
          onInspectOverlay(id);
        }
      }}
    >
      <desc id={`${chartId}-description`}>{plan.description}</desc>
      <defs>
        <clipPath id={`${chartId}-plot`}>
          <rect width={plan.clipWidth} height={plan.clipHeight} />
        </clipPath>
      </defs>
      <g transform={`translate(${plan.margin.left},${plan.margin.top})`}>
        <g clipPath={`url(#${chartId}-plot)`}>
          <PlannedGrid
            plan={plan.axes}
            interactive
            activeId={hoveredGuideId ?? selectedId}
          />
        </g>
        {surface && <g clipPath={`url(#${chartId}-plot)`}>{surface}</g>}
        {bubblePoints && (
          <g
            className="eda-scatter-bubbles"
            clipPath={`url(#${chartId}-plot)`}
            pointerEvents="none"
          >
            {bubblePoints.map((point) => (
              <circle
                key={point.id}
                cx={point.x}
                cy={point.y}
                r={point.radius}
                fill={point.sizeValue === 0 ? "none" : point.color}
                opacity={point.opacity}
                stroke={point.sizeValue === 0 ? point.color : "none"}
                strokeWidth={point.sizeValue === 0 ? 1 : undefined}
              />
            ))}
          </g>
        )}
        {fitMarks.length > 0 && (
          <g clipPath={`url(#${chartId}-plot)`}>
            <FitCurves marks={fitMarks} activeId={activeFitId} />
          </g>
        )}
        <g className="eda-brush" clipPath={`url(#${chartId}-plot)`}>
          <Primitives items={overlay.brush} />
        </g>
        {marginals && (
          <MarginalBars
            marginals={marginals}
            activeId={activeMarginalId}
            onHover={onHoverMarginal}
            margin={{ left: plan.margin.left, top: plan.margin.top }}
            plotWidth={plan.plotWidth}
            plotHeight={plan.plotHeight}
            onBrush={onMarginalBrush}
          />
        )}
        <PlannedAxes
          plan={plan.axes}
          interactive
          activeId={hoveredGuideId ?? selectedId}
        />
        <g
          className="eda-axis-readout"
          role={overlay.readoutLabel ? "img" : undefined}
          aria-label={overlay.readoutLabel}
          pointerEvents="none"
        >
          <Primitives items={overlay.readout} />
        </g>
      </g>
    </svg>
  );
}
