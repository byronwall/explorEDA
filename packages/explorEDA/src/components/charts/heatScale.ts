/**
 * The color scale shared by the heatmap and the calendar heatmap. Fills mix
 * theme tokens, so the strongest cell stands out in light and dark themes
 * alike, and both charts read the same value the same way.
 */
export interface HeatScale {
  kind: "sequential" | "diverging";
  domain: [number, number];
}

/** Plans the scale over the values on show: diverging around 0 when they cross it. */
export function planHeatScale(values: number[]): HeatScale & {
  /** Where a value sits: 0 to 1, or -1 to 1 on a diverging scale. */
  position: (value: number) => number;
} {
  const low = values.length ? Math.min(...values) : 0;
  const high = values.length ? Math.max(...values) : 0;
  const diverging = low < 0 && high > 0;
  const span = Math.max(Math.abs(low), Math.abs(high)) || 1;
  return {
    kind: diverging ? "diverging" : "sequential",
    domain: [low, high],
    position: (value) =>
      diverging
        ? Math.max(-1, Math.min(1, value / span))
        : high === low
          ? 0.6
          : (value - low) / (high - low),
  };
}

const percent = (position: number) => `${Math.round(Math.abs(position) * 100)}%`;

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
export function describeHeatPosition(position: number, scale: HeatScale) {
  const [low, high] = scale.domain;
  if (scale.kind === "diverging") {
    const span = Math.max(Math.abs(low), Math.abs(high));
    return `${percent(position)} of the way from 0 to ${round(position < 0 ? -span : span)} on a diverging scale`;
  }
  return `${percent(position)} of the way from ${round(low)} to ${round(high)}`;
}
