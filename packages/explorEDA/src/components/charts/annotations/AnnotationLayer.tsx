import {
  useId,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useChartEdit } from "../InPlace/useChartEdit";
import type { ProjectedAnnotation } from "@/lib/annotations/resolve";
import {
  annotationLabel,
  type CalloutAnnotation,
  type ChartAnnotation,
} from "@/lib/annotations/types";
import { useReportAnnotationStatus } from "./annotationStatus";

const LABEL_FONT_SIZE = 11;
/** A press must travel this far before it moves a label. */
const DRAG_THRESHOLD = 3;
/** How far a bracket sits inside the plot edge. */
const BRACKET_INSET = 6;

type Shown<T extends ChartAnnotation["type"]> = Extract<
  ProjectedAnnotation,
  { status: "shown"; annotation: { type: T } }
>;

const colorOf = (annotation: ChartAnnotation) =>
  annotation.color ?? "var(--foreground)";

function replaceAnnotation(
  annotations: ChartAnnotation[],
  next: ChartAnnotation
) {
  return annotations.map((item) => (item.id === next.id ? next : item));
}

function Label({
  x,
  y,
  anchor = "start",
  color,
  children,
}: {
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  color: string;
  children: ReactNode;
}) {
  return (
    <text
      className="eda-annotation-label"
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={LABEL_FONT_SIZE}
      fill={color}
      pointerEvents="none"
    >
      {children}
    </text>
  );
}

/** Shaded spans, or brackets along the plot edge, under everything else. */
function Bands({
  bands,
  plotWidth,
  plotHeight,
  clipPath,
}: {
  bands: Shown<"band">[];
  plotWidth: number;
  plotHeight: number;
  clipPath: string;
}) {
  return (
    <>
      <g clipPath={clipPath} pointerEvents="none">
        {bands.map(({ annotation, start, end }) => {
          const color = colorOf(annotation);
          const vertical = annotation.axis === "x";
          if (annotation.display === "bracket") {
            const edge = vertical ? BRACKET_INSET : plotWidth - BRACKET_INSET;
            const tick = vertical ? 5 : -5;
            const d = vertical
              ? `M${start},${edge + tick}V${edge}H${end}V${edge + tick}`
              : `M${edge + tick},${start}H${edge}V${end}H${edge + tick}`;
            return (
              <path
                key={annotation.id}
                data-annotation-id={annotation.id}
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
              />
            );
          }
          return (
            <rect
              key={annotation.id}
              data-annotation-id={annotation.id}
              x={vertical ? start : 0}
              y={vertical ? 0 : start}
              width={vertical ? end - start : plotWidth}
              height={vertical ? plotHeight : end - start}
              fill={color}
              fillOpacity={0.09}
              stroke={color}
              strokeOpacity={0.35}
              strokeDasharray="3 3"
            />
          );
        })}
      </g>
      {bands.map(({ annotation, start, end }) => {
        const text = annotation.label?.trim();
        if (!text) return null;
        const vertical = annotation.axis === "x";
        const bracket = annotation.display === "bracket";
        return (
          <Label
            key={`${annotation.id}:label`}
            x={vertical ? (start + end) / 2 : plotWidth - 4}
            y={vertical ? (bracket ? BRACKET_INSET + 18 : 12) : start + 12}
            anchor={vertical ? "middle" : "end"}
            color={colorOf(annotation)}
          >
            {text}
          </Label>
        );
      })}
    </>
  );
}

/** Ribbons between supplied lower and upper bounds. */
function Intervals({
  intervals,
  clipPath,
}: {
  intervals: Shown<"interval">[];
  clipPath: string;
}) {
  return (
    <>
      <g clipPath={clipPath} pointerEvents="none">
        {intervals.map(({ annotation, points }) => {
          const upper = points.map((p) => `${p.x},${p.upper}`);
          const lower = points.map((p) => `${p.x},${p.lower}`).reverse();
          return (
            <path
              key={annotation.id}
              data-annotation-id={annotation.id}
              d={`M${[...upper, ...lower].join("L")}Z`}
              fill={colorOf(annotation)}
              fillOpacity={0.14}
              stroke={colorOf(annotation)}
              strokeOpacity={0.4}
              strokeWidth={1}
            />
          );
        })}
      </g>
      {intervals.map(({ annotation, points }) => {
        const last = points[points.length - 1]!;
        return (
          <Label
            key={`${annotation.id}:label`}
            x={last.x - 4}
            y={last.upper - 6}
            anchor="end"
            color={colorOf(annotation)}
          >
            {annotation.meaning}
          </Label>
        );
      })}
    </>
  );
}

function Rules({
  rules,
  plotWidth,
  plotHeight,
  clipPath,
}: {
  rules: Shown<"reference-line">[];
  plotWidth: number;
  plotHeight: number;
  clipPath: string;
}) {
  return (
    <>
      <g clipPath={clipPath} pointerEvents="none">
        {rules.map(({ annotation, position }) => {
          const vertical = annotation.axis === "x";
          return (
            <line
              key={annotation.id}
              data-annotation-id={annotation.id}
              x1={vertical ? position : 0}
              x2={vertical ? position : plotWidth}
              y1={vertical ? 0 : position}
              y2={vertical ? plotHeight : position}
              stroke={colorOf(annotation)}
              strokeWidth={1.5}
              strokeDasharray={
                annotation.lineStyle === "solid" ? undefined : "5 3"
              }
            />
          );
        })}
      </g>
      {rules.map(({ annotation, position }) => {
        const text = annotation.label?.trim();
        if (!text) return null;
        const vertical = annotation.axis === "x";
        return (
          <Label
            key={`${annotation.id}:label`}
            x={vertical ? position + 4 : plotWidth - 4}
            y={vertical ? 10 : position - 4}
            anchor={vertical ? "start" : "end"}
            color={colorOf(annotation)}
          >
            {text}
          </Label>
        );
      })}
    </>
  );
}

/**
 * Saved annotations over a chart's plot. Bands and lines clip to the plot;
 * labels may sit in the margin. Dragging or arrow-nudging a callout's label
 * changes only its offset, as one undo step, and Escape puts it back.
 */
export function AnnotationLayer({
  chartId,
  panelId,
  annotations,
  projected,
  plotWidth,
  plotHeight,
  clipPath,
}: {
  chartId: string;
  /** Tells facet panels apart when they report what they drew. */
  panelId?: string;
  annotations: ChartAnnotation[];
  projected: ProjectedAnnotation[];
  plotWidth: number;
  plotHeight: number;
  clipPath: string;
}) {
  const edit = useChartEdit(chartId);
  const ownId = useId();
  const arrowId = `${ownId}-arrow`;
  useReportAnnotationStatus(chartId, panelId ?? ownId, projected);
  const drag = useRef<{
    id: string;
    startX: number;
    startY: number;
    offset: CalloutAnnotation["offset"];
    moved: boolean;
  } | null>(null);
  const shown = projected.filter((item) => item.status === "shown");
  if (!shown.length) return null;
  const of = <T extends ChartAnnotation["type"]>(type: T) =>
    shown.filter((item) => item.annotation.type === type) as Shown<T>[];

  const setOffset = (
    callout: CalloutAnnotation,
    offset: CalloutAnnotation["offset"]
  ) =>
    edit.apply({
      annotations: replaceAnnotation(annotations, { ...callout, offset }),
    });

  const beginDrag = (
    event: PointerEvent<SVGGElement>,
    callout: CalloutAnnotation
  ) => {
    if (event.button !== 0 || event.altKey) return;
    event.stopPropagation();
    // Focus lets Escape cancel the drag.
    event.currentTarget.focus({ preventScroll: true });
    drag.current = {
      id: callout.id,
      startX: event.clientX,
      startY: event.clientY,
      offset: callout.offset,
      moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const moveDrag = (
    event: PointerEvent<SVGGElement>,
    callout: CalloutAnnotation
  ) => {
    const active = drag.current;
    if (!active || active.id !== callout.id) return;
    const dx = event.clientX - active.startX;
    const dy = event.clientY - active.startY;
    active.moved ||= Math.hypot(dx, dy) >= DRAG_THRESHOLD;
    if (!active.moved) return;
    setOffset(callout, {
      dx: Math.round(active.offset.dx + dx),
      dy: Math.round(active.offset.dy + dy),
    });
  };
  const endDrag = (event: PointerEvent<SVGGElement>) => {
    const active = drag.current;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (active?.moved) edit.commit();
  };
  const cancelDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    edit.cancel();
  };
  const nudge = (
    event: KeyboardEvent<SVGGElement>,
    callout: CalloutAnnotation
  ) => {
    if (event.key === "Escape") {
      if (drag.current) {
        event.stopPropagation();
        cancelDrag();
      }
      return;
    }
    const step = event.shiftKey ? 10 : 1;
    const move = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }[event.key];
    if (!move) return;
    event.preventDefault();
    event.stopPropagation();
    setOffset(callout, {
      dx: callout.offset.dx + move[0]!,
      dy: callout.offset.dy + move[1]!,
    });
  };

  return (
    <g className="eda-annotations">
      <Bands
        bands={of("band")}
        plotWidth={plotWidth}
        plotHeight={plotHeight}
        clipPath={clipPath}
      />
      <Intervals intervals={of("interval")} clipPath={clipPath} />
      <Rules
        rules={of("reference-line")}
        plotWidth={plotWidth}
        plotHeight={plotHeight}
        clipPath={clipPath}
      />
      {of("callout").map(({ annotation, x, y }) => {
        const color = colorOf(annotation);
        const lx = x + annotation.offset.dx;
        const ly = y + annotation.offset.dy;
        const leader =
          annotation.leader !== false &&
          Math.hypot(annotation.offset.dx, annotation.offset.dy) > 10;
        const lines = annotation.text.split("\n");
        return (
          <g key={annotation.id} data-annotation-id={annotation.id}>
            {annotation.arrow && (
              <defs>
                <marker
                  id={`${arrowId}-${annotation.id}`}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path d="M0,0L10,5L0,10z" fill={color} />
                </marker>
              </defs>
            )}
            {!annotation.arrow && (
              <circle
                cx={x}
                cy={y}
                r={6}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                pointerEvents="none"
              />
            )}
            {leader && (
              <line
                x1={lx}
                y1={ly}
                x2={x}
                y2={y}
                stroke={color}
                strokeWidth={annotation.arrow ? 1.5 : 1}
                markerEnd={
                  annotation.arrow
                    ? `url(#${arrowId}-${annotation.id})`
                    : undefined
                }
                pointerEvents="none"
              />
            )}
            <g
              data-annotation-handle={annotation.id}
              role="button"
              tabIndex={0}
              aria-label={`Callout: ${annotationLabel(annotation)}. Drag or use arrow keys to move the label.`}
              style={{ cursor: "move", outline: "none" }}
              onPointerDown={(event) => beginDrag(event, annotation)}
              onPointerMove={(event) => moveDrag(event, annotation)}
              onPointerUp={endDrag}
              onPointerCancel={cancelDrag}
              onKeyDown={(event) => nudge(event, annotation)}
              onKeyUp={(event) => {
                if (event.key.startsWith("Arrow")) edit.commit();
              }}
              onBlur={() => edit.commit()}
              onClick={(event) => event.stopPropagation()}
            >
              <text
                className="eda-annotation-label"
                x={lx}
                y={ly}
                fontSize={LABEL_FONT_SIZE}
                fontWeight={600}
                fill={color}
                textAnchor={annotation.offset.dx < 0 ? "end" : "start"}
                dominantBaseline="middle"
              >
                {lines.map((line, index) => (
                  <tspan key={index} x={lx} dy={index ? "1.2em" : undefined}>
                    {line || " "}
                  </tspan>
                ))}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}
