/** How close to an axis end, in pixels, a press stretches that end instead of panning. */
export const END_ZONE = 16;
/** The least distance, in pixels, a stretched end keeps from the fixed one. */
const MIN_SPAN_PX = 12;

export type AxisDragMode = "pan" | "min" | "max";

type Transform = { to: (v: number) => number; from: (v: number) => number };

const LINEAR: Transform = { to: (v) => v, from: (v) => v };
// d3's symlog transform with its default constant of 1.
const SYMLOG: Transform = {
  to: (v) => Math.sign(v) * Math.log1p(Math.abs(v)),
  from: (v) => Math.sign(v) * Math.expm1(Math.abs(v)),
};

export interface AxisDragInput {
  /** The domain drawn when the drag began. */
  domain: [number, number];
  /** Pixel positions of the domain's ends, as the scale's range lists them. */
  range: [number, number];
  scaleType: string;
  mode: AxisDragMode;
  /** Pointer position along the axis, in plot pixels, at the press. */
  start: number;
  /** Pointer position along the axis now. */
  current: number;
}

/** Which gesture a press at `at` starts: near an end stretches it. */
export function axisDragMode(
  range: [number, number],
  at: number
): AxisDragMode {
  if (Math.abs(at - range[0]) <= END_ZONE) return "min";
  if (Math.abs(at - range[1]) <= END_ZONE) return "max";
  return "pan";
}

/**
 * The domain an axis drag shows. Panning moves the whole range with the
 * pointer. Stretching keeps the far end fixed and keeps the value under the
 * pointer under it, as if the axis were a ruler pulled by that tick:
 * pulling an end out zooms in, and pushing it toward the middle zooms out. Symlog
 * axes move in their drawn space. Returns undefined when the pointer would
 * fold the axis onto its fixed end.
 */
export function dragDomain({
  domain,
  range,
  scaleType,
  mode,
  start,
  current,
}: AxisDragInput): [number, number] | undefined {
  const { to, from } = scaleType === "symlog" ? SYMLOG : LINEAR;
  const [t0, t1] = [to(domain[0]), to(domain[1])];
  const [r0, r1] = range;
  if (t1 === t0 || r1 === r0) return undefined;
  // Pixels per drawn unit, signed by the axis direction.
  const k = (r1 - r0) / (t1 - t0);
  const delta = current - start;
  if (mode === "pan") {
    const shift = delta / k;
    return round(
      [from(t0 - shift), from(t1 - shift)],
      domain,
      range,
      scaleType
    );
  }
  const grabbed =
    (mode === "max" ? t0 : t1) + (start - (mode === "max" ? r0 : r1)) / k;
  const fixedPx = mode === "max" ? r0 : r1;
  const fixedT = mode === "max" ? t0 : t1;
  const reach = start + delta - fixedPx;
  // The grabbed value must stay on its own side of the fixed end.
  if (
    Math.sign(reach) !== Math.sign(start - fixedPx) ||
    Math.abs(reach) < MIN_SPAN_PX
  )
    return undefined;
  const next = reach / (grabbed - fixedT);
  const span = (r1 - r0) / next;
  return round(
    mode === "max" ? [from(t0), from(t0 + span)] : [from(t1 - span), from(t1)],
    domain,
    range,
    scaleType
  );
}

/**
 * Rounds dragged bounds to what one pixel can show, so a dragged limit
 * saves as 1,250 rather than 1,249.8734.
 */
function round(
  [low, high]: [number, number],
  domain: [number, number],
  range: [number, number],
  scaleType: string
): [number, number] {
  // A symlog pixel spans very different values near zero and far from it.
  if (scaleType === "symlog")
    return [low, high].map((value) => Number(value.toPrecision(3))) as [
      number,
      number,
    ];
  const perPixel =
    Math.abs(domain[1] - domain[0]) /
    Math.max(1, Math.abs(range[1] - range[0]));
  const step = 10 ** Math.floor(Math.log10(perPixel || 1));
  const snap = (value: number) =>
    Number((Math.round(value / step) * step).toPrecision(12));
  return [snap(low), snap(high)];
}
