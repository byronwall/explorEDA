import { useBrush } from "@/hooks/useBrush";
import { useId, useMemo, useRef, useState } from "react";
import {
  planScatterOverlay,
  type Extent,
  type ScatterPlan,
  type SvgPrimitive,
} from "./scatterPlan";
import { findAxisGuide } from "../Axis/axisPlan";
import { PlannedAxes, PlannedGrid } from "../Axis/AxisLayer";
import type { FitMark } from "./fitPlan";
import type { MarginalPlan } from "./marginalPlan";

/** X and Y histograms in the margins; the selection's share reads darker. */
function MarginalBars({
  marginals,
  activeId,
  onHover,
}: {
  marginals: MarginalPlan;
  activeId?: string;
  onHover?: (id: string | undefined) => void;
}) {
  const interval = (bounds: [number, number]) =>
    bounds.map((value) => Number(value.toPrecision(4))).join(" to ");
  return (
    <g className="eda-marginals">
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
          >
            <rect
              x={bin.x}
              y={bin.y}
              width={bin.width}
              height={bin.height}
              fill={marginals.split ? "rgb(156 163 175)" : "#3479a8"}
              fillOpacity={marginals.split ? 0.45 : active ? 0.85 : 0.6}
              stroke={active ? "var(--foreground)" : "none"}
            />
            {marginals.split && bin.selected > 0 && (
              <rect
                {...share}
                fill="#3479a8"
                fillOpacity={active ? 0.95 : 0.8}
                pointerEvents="none"
              />
            )}
          </g>
        );
      })}
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
  marginals,
  activeMarginalId,
  onHoverMarginal,
  onMarginal,
  activeFitId,
  onActiveFit,
  onInspectFit,
}: {
  fitMarks?: FitMark[];
  marginals?: MarginalPlan;
  activeMarginalId?: string;
  onHoverMarginal?: (id: string | undefined) => void;
  onMarginal?: (id: string, inspect: boolean) => void;
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
  });
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
            brush.clear();
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
