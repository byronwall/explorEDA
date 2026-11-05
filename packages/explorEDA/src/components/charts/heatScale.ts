/**
 * The color scale shared by the heatmap and the calendar heatmap. Fills mix
 * theme tokens, so the strongest cell stands out in light and dark themes
 * alike, and both charts read the same value the same way.
 */
export interface HeatScale {
  kind: "sequential" | "diverging";
  domain: [number, number];
}

/** Fixed color ends and a transform, in the measure's units. */
export interface HeatDomain {
  min?: number;
  max?: number;
  /** Square root, signed around 0, so small values spread apart. */
  transform?: "sqrt";
}

/**
 * Plans the scale over the values on show, diverging around 0 when they cross
 * it. A fixed end replaces the shown extreme on its side, so a value keeps its
 * color whatever the filters show; values past an end take the end's color.
 * A diverging scale stretches each side to its own end, so the legend shows
 * the real ends.
 */
export function planHeatScale(
  values: number[],
  fixed: HeatDomain = {}
): HeatScale & {
  /** Where a value sits: 0 to 1, or -1 to 1 on a diverging scale. */
  position: (value: number) => number;
  transform?: "sqrt";
  /** Which ends came from settings rather than the values. */
  fixed: { min: boolean; max: boolean };
} {
  const lowEnd = fixed.min ?? (values.length ? Math.min(...values) : 0);
  const highEnd = fixed.max ?? (values.length ? Math.max(...values) : 0);
  // A fixed end past the shown values on the wrong side still bounds them.
  const low = Math.min(lowEnd, highEnd);
  const high = Math.max(lowEnd, highEnd);
  const diverging = low < 0 && high > 0;
  const t = (value: number) =>
    fixed.transform === "sqrt"
      ? Math.sign(value) * Math.sqrt(Math.abs(value))
      : value;
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));
  return {
    kind: diverging ? "diverging" : "sequential",
    domain: [low, high],
    transform: fixed.transform,
    fixed: { min: fixed.min !== undefined, max: fixed.max !== undefined },
    position: (raw) => {
      const value = clamp(raw, low, high);
      if (diverging)
        return value < 0 ? -(t(value) / t(low)) : t(value) / t(high);
      return high === low ? 0.6 : (t(value) - t(low)) / (t(high) - t(low));
    },
  };
}

const percent = (position: number) =>
  `${Math.round(Math.abs(position) * 100)}%`;

/** The cell fill for a scale position. */
export function heatFill(position: number, kind: HeatScale["kind"]) {
  if (kind === "diverging") {
    const end = position < 0 ? "--eda-heat-negative" : "--eda-heat-high";
    return `color-mix(in oklab, var(${end}) ${percent(position)}, var(--eda-heat-mid))`;
  }
  return `color-mix(in oklab, var(--eda-heat-high) ${percent(position)}, var(--eda-heat-low))`;
}

/** Text that stays readable on the fill at a scale position. */
export function heatText(position: number) {
  return Math.abs(position) > 0.55
    ? "var(--eda-heat-text-strong)"
    : "var(--eda-heat-text-weak)";
}

/** The legend ramp's CSS background. */
export function heatRamp(kind: HeatScale["kind"]) {
  return kind === "diverging"
    ? "linear-gradient(in oklab to right, var(--eda-heat-negative), var(--eda-heat-mid), var(--eda-heat-high))"
    : "linear-gradient(in oklab to right, var(--eda-heat-low), var(--eda-heat-high))";
}

const round = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 3 });

/** States how a fill was chosen, for a trace. */
export function describeHeatPosition(
  position: number,
  scale: HeatScale & { transform?: "sqrt" }
) {
  const [low, high] = scale.domain;
  const how = scale.transform === "sqrt" ? " on a square-root scale" : "";
  return (
    describePlain(position, { kind: scale.kind, domain: [low, high] }) + how
  );
}

function describePlain(position: number, scale: HeatScale) {
  const [low, high] = scale.domain;
  if (scale.kind === "diverging") {
    return `${percent(position)} of the way from 0 to ${round(position < 0 ? low : high)} on a diverging scale`;
  }
  return `${percent(position)} of the way from ${round(low)} to ${round(high)}`;
}
