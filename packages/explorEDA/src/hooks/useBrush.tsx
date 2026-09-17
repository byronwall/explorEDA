import { PointerEvent, RefObject, useRef, useState } from "react";

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
  defaultExtent?: Extent | null;
}
interface Gesture {
  start: Point;
  original: Extent | null;
  kind: "draw" | "move" | "resize";
  edges: string;
  moved: boolean;
}
const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max));

export function useBrush({
  svgRef,
  marginLeft,
  marginTop,
  innerWidth,
  innerHeight,
  mode,
  onBrushChange,
  defaultExtent,
}: Options) {
  const gesture = useRef<Gesture | null>(null);
  const draftRef = useRef<Extent | null>(null);
  const [draft, setDraft] = useState<Extent | null>(null);
  // External selections only supply the resting state. They never interrupt a gesture.
  const extent = draft ?? defaultExtent;
  const position = (event: PointerEvent): Point => {
    const rect = svgRef.current!.getBoundingClientRect();
    return [
      event.clientX - rect.left - marginLeft,
      event.clientY - rect.top - marginTop,
    ];
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
    if (mode === "none" || event.button !== 0 || !svgRef.current) return;
    const [x, y] = position(event);
    if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) return;
    event.stopPropagation();
    event.currentTarget.focus({ preventScroll: true });
    let edges = "";
    let inside = false;
    if (extent) {
      const [[x0, y0], [x1, y1]] = extent;
      inside = x >= x0 - 6 && x <= x1 + 6 && y >= y0 - 6 && y <= y1 + 6;
      if (inside) {
        if (Math.abs(x - x0) < 6) edges += "l";
        else if (Math.abs(x - x1) < 6) edges += "r";
        if (mode === "2d") {
          if (Math.abs(y - y0) < 6) edges += "t";
          else if (Math.abs(y - y1) < 6) edges += "b";
        }
      }
    }
    gesture.current = {
      start: [x, y],
      original: extent ?? null,
      kind: edges ? "resize" : inside ? "move" : "draw",
      edges,
      moved: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const active = gesture.current;
    if (!active || !svgRef.current) return;
    const raw = position(event);
    if (
      !active.moved &&
      Math.hypot(raw[0] - active.start[0], raw[1] - active.start[1]) < 3
    )
      return;
    // Capture only a confirmed drag so clicks on marks keep their original target.
    if (!active.moved) event.currentTarget.setPointerCapture?.(event.pointerId);
    active.moved = true;
    event.preventDefault();
    const x = clamp(raw[0], innerWidth),
      y = clamp(raw[1], innerHeight);
    let next: Extent;
    if (active.kind === "move" && active.original) {
      const [[x0, y0], [x1, y1]] = active.original;
      const left = clamp(x0 + x - active.start[0], innerWidth - (x1 - x0));
      const top =
        mode === "horizontal"
          ? 0
          : clamp(y0 + y - active.start[1], innerHeight - (y1 - y0));
      next = [
        [left, top],
        [left + x1 - x0, top + y1 - y0],
      ];
    } else if (active.kind === "resize" && active.original) {
      const [[x0, y0], [x1, y1]] = active.original;
      const left = active.edges.includes("l") ? x : x0;
      const right = active.edges.includes("r") ? x : x1;
      const top = active.edges.includes("t") ? y : y0;
      const bottom = active.edges.includes("b") ? y : y1;
      next = [
        [Math.min(left, right), Math.min(top, bottom)],
        [Math.max(left, right), Math.max(top, bottom)],
      ];
    } else {
      next = [
        [
          Math.min(x, active.start[0]),
          mode === "horizontal" ? 0 : Math.min(y, active.start[1]),
        ],
        [
          Math.max(x, active.start[0]),
          mode === "horizontal" ? innerHeight : Math.max(y, active.start[1]),
        ],
      ];
    }
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
      if (active.kind === "draw") onBrushChange?.(null);
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
          style={{ cursor: "move" }}
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
            style={{ cursor: "ew-resize" }}
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
              style={{ cursor: "ns-resize" }}
            />
          ))}
      </g>
    ) : null;
  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    cancel,
    clear,
    renderBrush,
    getCursor: () => (mode === "none" ? "default" : "crosshair"),
  };
}
