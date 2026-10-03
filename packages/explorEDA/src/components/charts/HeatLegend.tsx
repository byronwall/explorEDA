import { heatRamp, type HeatScale } from "./heatScale";

/** Names the metric, shows the scale's ends, and keys the cells without a color. */
export function HeatLegend({
  scale,
  metricLabel,
  format,
  hasEmpty,
  hasInvalid,
}: {
  scale: HeatScale;
  metricLabel: string;
  format: (value: number) => string;
  hasEmpty: boolean;
  hasInvalid: boolean;
}) {
  const [low, high] = scale.domain;
  const span = Math.max(Math.abs(low), Math.abs(high));
  return (
    <div className="eda-heat-legend">
      <span className="eda-heat-legend-metric">{metricLabel}</span>
      <span className="eda-heat-legend-scale">
        <span>{format(scale.kind === "diverging" ? -span : low)}</span>
        <span
          className="eda-heat-legend-ramp"
          style={{ background: heatRamp(scale.kind) }}
        />
        <span>{format(scale.kind === "diverging" ? span : high)}</span>
      </span>
      {hasEmpty && (
        <span className="eda-heat-legend-key">
          <span className="eda-heat-swatch" data-state="empty" />
          No rows
        </span>
      )}
      {hasInvalid && (
        <span className="eda-heat-legend-key">
          <span className="eda-heat-swatch" data-state="invalid" />
          No valid values
        </span>
      )}
    </div>
  );
}
