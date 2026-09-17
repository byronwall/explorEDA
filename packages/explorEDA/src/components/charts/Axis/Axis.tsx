import { ScaleBand, ScaleLinear } from "d3-scale";

type Scale = ScaleLinear<number, number> | ScaleBand<string>;

export function formatTick(value: string | number) {
  if (typeof value === "string") return value;
  return new Intl.NumberFormat("en-US", {
    notation: Math.abs(value) >= 10000 ? "compact" : "standard",
    maximumFractionDigits: Math.abs(value) < 1 ? 3 : 2,
  }).format(value);
}

interface AxisProps {
  scale: Scale;
  transform: string;
  tickCount?: number;
  axisLabel?: string;
  labelOffset?: number;
}

export function XAxis({
  scale,
  transform,
  tickCount = 5,
  axisLabel,
  labelOffset = 40,
}: AxisProps) {
  const [start = 0, end = 0] = scale.range();
  const ticks =
    "ticks" in scale
      ? scale.ticks(
          Math.max(2, Math.min(tickCount, Math.floor((end - start) / 65)))
        )
      : scale.domain();
  const labelWidth =
    "bandwidth" in scale ? Math.max(3, Math.floor(scale.step() / 7)) : 20;
  return (
    <g
      transform={transform}
      className="fill-muted-foreground"
      pointerEvents="none"
    >
      <line x1={start} x2={end} y1={0} y2={0} className="stroke-border" />
      {ticks.map((tick, i) => {
        const x =
          "bandwidth" in scale
            ? (scale(String(tick)) ?? 0) + scale.bandwidth() / 2
            : scale(Number(tick));
        const text = formatTick(tick);
        return (
          <g key={i} transform={`translate(${x},0)`}>
            <line y2={4} className="stroke-border" />
            <text y={17} textAnchor="middle" fontSize={10}>
              <title>{text}</title>
              {text.length > labelWidth
                ? `${text.slice(0, labelWidth - 1)}…`
                : text}
            </text>
          </g>
        );
      })}
      {axisLabel && (
        <text
          x={(start + end) / 2}
          y={labelOffset}
          textAnchor="middle"
          fontSize={11}
        >
          {axisLabel}
        </text>
      )}
    </g>
  );
}

export function YAxis({
  scale,
  transform,
  tickCount = 5,
  axisLabel,
  labelOffset = 48,
}: AxisProps) {
  const [start = 0, end = 0] = scale.range();
  const ticks =
    "ticks" in scale
      ? scale.ticks(
          Math.max(
            2,
            Math.min(tickCount, Math.floor(Math.abs(end - start) / 38))
          )
        )
      : scale.domain();
  return (
    <g
      transform={transform}
      className="fill-muted-foreground"
      pointerEvents="none"
    >
      {ticks.map((tick, i) => {
        const y =
          "bandwidth" in scale
            ? (scale(String(tick)) ?? 0) + scale.bandwidth() / 2
            : scale(Number(tick));
        const text = formatTick(tick);
        const maxChars = Math.max(5, Math.floor((labelOffset - 4) / 6));
        return (
          <text key={i} x={-9} y={y} dy=".32em" textAnchor="end" fontSize={10}>
            <title>{text}</title>
            {text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text}
          </text>
        );
      })}
      {axisLabel && !("bandwidth" in scale) && (
        <text
          transform="rotate(-90)"
          x={-(start + end) / 2}
          y={-labelOffset}
          textAnchor="middle"
          fontSize={11}
        >
          {axisLabel}
        </text>
      )}
    </g>
  );
}
