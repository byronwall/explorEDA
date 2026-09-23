import { useBrush } from "@/hooks/useBrush";
import { useId, useRef, useState } from "react";
import {
  planScatterOverlay,
  type Extent,
  type ScatterPlan,
  type SvgPrimitive,
} from "./scatterPlan";

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
}: {
  plan: ScatterPlan;
  hoveredId: string | null;
  onBrushChange: (extent: Extent | null) => void;
  onInspectPoint: (x: number, y: number) => boolean;
  onInspectGuide: (id: string) => void;
  onInspectOverlay: (id: string) => void;
  selectedId?: string;
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
    onPlotClick: (_, event) => event.altKey || altAtDown.current,
    defaultExtent: plan.brushExtent,
  });
  const overlay = planScatterOverlay(plan, brush.extent ?? null, hoveredId);

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
      className="absolute select-none"
      style={{
        cursor:
          altHover && (hoveredId || hoveredGuideId)
            ? "pointer"
            : brush.getCursor(),
        touchAction: "none",
      }}
      tabIndex={0}
      onKeyDown={(event) => {
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
          event.altKey && id && plan.guideDetails[id] ? id : null
        );
      }}
      onPointerLeave={() => {
        setHoveredGuideId(null);
        setAltHover(false);
      }}
      onPointerUpCapture={brush.handlePointerUp}
      onPointerCancel={brush.cancel}
      onLostPointerCapture={brush.cancel}
      onClick={(event) => {
        if (!event.altKey || brush.wasDrag.current) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left - plan.margin.left;
        const y = event.clientY - rect.top - plan.margin.top;
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
        if (id && plan.guideDetails[id]) {
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
          <Primitives
            items={plan.grid}
            selectedId={hoveredGuideId ?? selectedId}
          />
        </g>
        <g className="eda-brush" clipPath={`url(#${chartId}-plot)`}>
          <Primitives items={overlay.brush} />
        </g>
        <g>
          <Primitives
            items={plan.axes}
            selectedId={hoveredGuideId ?? selectedId}
          />
        </g>
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
