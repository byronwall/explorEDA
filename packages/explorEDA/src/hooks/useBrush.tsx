import { PointerEvent, RefObject, useRef, useState } from "react";
import {
  boxGrips,
  dragSpan,
  gripCursor,
  gripsResize,
  spanGrip,
  type Grip,
} from "./brushSpan";

type Extent = [[number, number], [number, number]];
type Point = [number, number];
interface Options {
  svgRef: RefObject<SVGSVGElement | null>;
  marginLeft: number;
  marginTop: number;
  innerWidth: number;
  innerHeight: number;
  mode: "horizontal" | "2d" | "none";
  onBrushChange?: (extent: Extent | null) => void;
  onPlotClick?: (point: Point, event: PointerEvent<SVGSVGElement>) => boolean;
  defaultExtent?: Extent | null;
  /**
   * A plain click that the chart did not select from. `inside` is true when it
   * landed inside the current selection. Without it, a click outside the
   * selection clears the brush.
   */
  onDeadClick?: (inside: boolean) => void;
}
interface Gesture {
  start: Point;
  original: Extent;
  grips: [Grip, Grip];
  moved: boolean;
}

export function useBrush({
  svgRef,
  marginLeft,
  marginTop,
  innerWidth,
  innerHeight,
  mode,
  onBrushChange,
  onPlotClick,
  defaultExtent,
  onDeadClick,
}: Options) {
  const gesture = useRef<Gesture | null>(null);
  const wasDrag = useRef(false);
  const draftRef = useRef<Extent | null>(null);
  const [draft, setDraft] = useState<Extent | null>(null);
  // Move on the body, resize on edges and corners, crosshair elsewhere.
  const [hoverCursor, setHoverCursor] = useState("");
  // External selections only supply the resting state. They never interrupt a gesture.
  const extent = draft ?? defaultExtent;
  const position = (event: PointerEvent): Point => {
    const rect = svgRef.current!.getBoundingClientRect();
    return [
      event.clientX - rect.left - marginLeft,
      event.clientY - rect.top - marginTop,
    ];
  };
  // What a press at this point does to the current selection. A horizontal
  // brush spans the plot's height, so only its x edges resize.
  const gripsAt = ([x, y]: Point): [Grip, Grip] => {
    if (!extent) return ["draw", mode === "2d" ? "draw" : "hold"];
    if (mode === "2d") return boxGrips(extent, [x, y]);
    return [spanGrip([extent[0][0], extent[1][0]], x), "hold"];
  };
  const cancel = () => {
    gesture.current = null;
    draftRef.current = null;
    setDraft(null);
  };
  const clear = () => {
    cancel();
    onBrushChange?.(null);
  };

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    wasDrag.current = false;
    if (mode === "none" || event.button !== 0 || !svgRef.current) return;
    // A marker drawn over the plot is a control, not a place to brush.
    if ((event.target as Element).closest?.("[data-axis-hidden]")) return;
    // So is an annotation label, which drags on its own.
    if ((event.target as Element).closest?.("[data-annotation-handle]")) return;
    const [x, y] = position(event);
    if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) return;
    event.stopPropagation();
    // A press focuses the chart for Escape, but shows no keyboard focus.
    // TS's FocusOptions lacks focusVisible, which Chrome and Firefox read.
    event.currentTarget.focus({
      preventScroll: true,
      focusVisible: false,
    } as FocusOptions);
    const grips = gripsAt([x, y]);
    const top = mode === "horizontal" ? 0 : y;
    const bottom = mode === "horizontal" ? innerHeight : y;
    gesture.current = {
      start: [x, y],
      original:
        extent && grips[0] !== "draw"
          ? extent
          : [
              [x, top],
              [x, bottom],
            ],
      grips,
      moved: false,
    };
    setHoverCursor(gripCursor(...grips));
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const active = gesture.current;
    if (!svgRef.current || mode === "none") return;
    if (!active) {
      // Without a gesture, the cursor shows what a press here would do.
      if (event.buttons) return;
      const [x, y] = position(event);
      const inPlot = x >= 0 && x <= innerWidth && y >= 0 && y <= innerHeight;
      setHoverCursor(inPlot ? gripCursor(...gripsAt([x, y])) : "");
      return;
    }
    const raw = position(event);
    if (
      !active.moved &&
      Math.hypot(raw[0] - active.start[0], raw[1] - active.start[1]) < 3
    )
      return;
    // Capture only a confirmed drag so clicks on marks keep their original target.
    if (!active.moved) event.currentTarget.setPointerCapture?.(event.pointerId);
    active.moved = true;
    wasDrag.current = true;
    event.preventDefault();
    const [[x0, y0], [x1, y1]] = active.original;
    const [left, right] = dragSpan(
      active.grips[0],
      [x0, x1],
      active.start[0],
      raw[0],
      innerWidth
    );
    const [top, bottom] = dragSpan(
      active.grips[1],
      [y0, y1],
      active.start[1],
      raw[1],
      innerHeight
    );
    const next: Extent = [
      [left, top],
      [right, bottom],
    ];
    draftRef.current = next;
    setDraft(next);
  };

  const handlePointerUp = (event: PointerEvent<SVGSVGElement>) => {
    const active = gesture.current;
    if (!active) return;
    const next = draftRef.current;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    cancel();
    if (!active.moved) {
      // A click outside the selection clears it unless the chart selects what
      // was clicked. A click inside may also narrow it to what was clicked.
      // A click on an edge does nothing.
      if (gripsResize(...active.grips)) return;
      const inside = active.grips[0] !== "draw";
      const handled = onPlotClick?.(active.start, event) ?? false;
      if (handled) return;
      if (onDeadClick) onDeadClick(inside);
      else if (!inside) onBrushChange?.(null);
      return;
    }
    if (
      next &&
      next[1][0] - next[0][0] >= 3 &&
      (mode === "horizontal" || next[1][1] - next[0][1] >= 3)
    )
      onBrushChange?.(next);
    else onBrushChange?.(null);
  };

  // The brush's shapes set no cursor of their own; they inherit getCursor().
  const renderBrush =
    extent && mode !== "none" ? (
      <g className="eda-brush">
        <rect
          x={extent[0][0]}
          y={extent[0][1]}
          width={Math.max(0, extent[1][0] - extent[0][0])}
          height={Math.max(0, extent[1][1] - extent[0][1])}
          fill="var(--primary)"
          fillOpacity={0.09}
          stroke="var(--primary)"
          strokeWidth={1.25}
        />
        {[extent[0][0], extent[1][0]].map((x, index) => (
          <rect
            key={index}
            x={x - 2}
            y={(extent[0][1] + extent[1][1]) / 2 - 8}
            width={4}
            height={16}
            rx={2}
            fill="var(--primary)"
          />
        ))}
        {mode === "2d" &&
          [extent[0][1], extent[1][1]].map((y, index) => (
            <rect
              key={index}
              x={(extent[0][0] + extent[1][0]) / 2 - 8}
              y={y - 2}
              width={16}
              height={4}
              rx={2}
              fill="var(--primary)"
            />
          ))}
      </g>
    ) : null;
  return {
    extent,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    cancel,
    clear,
    wasDrag,
    renderBrush,
    getCursor: () => (mode === "none" ? "default" : hoverCursor || "crosshair"),
  };
}
