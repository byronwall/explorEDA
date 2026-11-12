/**
 * Shared brush math. Every brush works the same way along each axis: a press
 * on an edge resizes that edge, a press inside moves the whole span, and a
 * press outside draws a new one.
 */

/** What a press does to a span along one axis. `hold` leaves it as it was. */
export type Grip = "draw" | "move" | "start" | "end" | "hold";
export type Span = [number, number];

/** How near an edge, in pixels, a press must land to resize it. */
export const GRIP_SLOP = 6;

/** What a press at `p` does to the span [a, b]. */
export function spanGrip([a, b]: Span, p: number, slop = GRIP_SLOP): Grip {
  if (p < a - slop || p > b + slop) return "draw";
  if (Math.abs(p - a) < slop) return "start";
  if (Math.abs(p - b) < slop) return "end";
  return "move";
}

/** The span after a drag from `from` to `to`, kept inside [0, max]. */
export function dragSpan(
  grip: Grip,
  [a, b]: Span,
  from: number,
  to: number,
  max: number
): Span {
  const at = Math.max(0, Math.min(to, max));
  if (grip === "move") {
    const left = Math.max(0, Math.min(a + at - from, max - (b - a)));
    return [left, left + b - a];
  }
  if (grip === "start") return [Math.min(at, b), Math.max(at, b)];
  if (grip === "end") return [Math.min(a, at), Math.max(a, at)];
  if (grip === "draw") return [Math.min(from, at), Math.max(from, at)];
  return [a, b];
}

/** The grips for a press on a box: edges and corners resize, inside moves. */
export function boxGrips(
  [[x0, y0], [x1, y1]]: [Span, Span],
  [x, y]: Span
): [Grip, Grip] {
  const gx = spanGrip([x0, x1], x);
  const gy = spanGrip([y0, y1], y);
  if (gx === "draw" || gy === "draw") return ["draw", "draw"];
  if (gx === "move" && gy === "move") return ["move", "move"];
  return [gx === "move" ? "hold" : gx, gy === "move" ? "hold" : gy];
}

const isEdge = (grip: Grip) => grip === "start" || grip === "end";

/**
 * The cursor for a press with these grips, or "" where the press would draw,
 * so the chart's own cursor shows there.
 */
export function gripCursor(gx: Grip, gy: Grip = "hold"): string {
  if (isEdge(gx) && isEdge(gy))
    return gx === gy ? "nwse-resize" : "nesw-resize";
  if (isEdge(gx)) return "ew-resize";
  if (isEdge(gy)) return "ns-resize";
  if (gx === "move" || gy === "move") return "move";
  return "";
}

/** True when a press on these grips resizes the span. */
export const gripsResize = (...grips: Grip[]) => grips.some(isEdge);
