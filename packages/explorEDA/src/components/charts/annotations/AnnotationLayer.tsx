import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { useChartEdit } from "../InPlace/useChartEdit";
import type { ProjectedAnnotation } from "@/lib/annotations/resolve";
import {
  annotationLabel,
  type CalloutAnnotation,
  type ChartAnnotation,
} from "@/lib/annotations/types";

const LABEL_FONT_SIZE = 11;
/** A press must travel this far before it moves a label. */
const DRAG_THRESHOLD = 3;

function replaceAnnotation(
  annotations: ChartAnnotation[],
  next: ChartAnnotation
) {
  return annotations.map((item) => (item.id === next.id ? next : item));
}

/**
 * Saved callouts and reference lines over a chart's plot. Lines clip to the
 * plot; labels may sit in the margin. Dragging or arrow-nudging a label
 * changes only its offset, as one undo step, and Escape puts it back.
 */
export function AnnotationLayer({
  chartId,
  annotations,
  projected,
  plotWidth,
  plotHeight,
  clipPath,
}: {
  chartId: string;
  annotations: ChartAnnotation[];
  projected: ProjectedAnnotation[];
  plotWidth: number;
  plotHeight: number;
  clipPath: string;
}) {
  const edit = useChartEdit(chartId);
  const drag = useRef<{
    id: string;
    startX: number;
    startY: number;
    offset: CalloutAnnotation["offset"];
    moved: boolean;
  } | null>(null);
  const shown = projected.filter((item) => item.status === "shown");
  if (!shown.length) return null;

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
      <g clipPath={clipPath} pointerEvents="none">
        {shown.map((item) => {
          if (item.status !== "shown" || !("position" in item)) return null;
          const { annotation, position } = item;
          const color = annotation.color ?? "var(--foreground)";
          const vertical = annotation.axis === "x";
          return (
            <line
              key={annotation.id}
              data-annotation-id={annotation.id}
              x1={vertical ? position : 0}
              x2={vertical ? position : plotWidth}
              y1={vertical ? 0 : position}
              y2={vertical ? plotHeight : position}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray={
                annotation.lineStyle === "solid" ? undefined : "5 3"
              }
            />
          );
        })}
      </g>
      {shown.map((item) => {
        if (item.status !== "shown") return null;
        if ("position" in item) {
          const { annotation, position } = item;
          const text = annotation.label?.trim();
          if (!text) return null;
          const vertical = annotation.axis === "x";
          return (
            <text
              key={`${annotation.id}:label`}
              className="eda-annotation-label"
              x={vertical ? position + 4 : plotWidth - 4}
              y={vertical ? 10 : position - 4}
              textAnchor={vertical ? "start" : "end"}
              fontSize={LABEL_FONT_SIZE}
              fill={annotation.color ?? "var(--foreground)"}
              pointerEvents="none"
            >
              {text}
            </text>
          );
        }
        const { annotation, x, y } = item;
        const color = annotation.color ?? "var(--foreground)";
        const lx = x + annotation.offset.dx;
        const ly = y + annotation.offset.dy;
        const leader =
          annotation.leader !== false &&
          Math.hypot(annotation.offset.dx, annotation.offset.dy) > 10;
        const lines = annotation.text.split("\n");
        return (
          <g key={annotation.id} data-annotation-id={annotation.id}>
            <circle
              cx={x}
              cy={y}
              r={6}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              pointerEvents="none"
            />
            {leader && (
              <line
                x1={x}
                y1={y}
                x2={lx}
                y2={ly}
                stroke={color}
                strokeWidth={1}
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
