import { ScaleBand, ScaleLinear } from "d3-scale";
import type { ChartGuide } from "../BaseChart";

type Scale = ScaleLinear<number, number> | ScaleBand<string>;
const GUIDE_DESCRIPTION = "Alt+Enter to inspect";

function spacedTicks(
  ticks: (string | number)[],
  position: (tick: string | number) => number,
  size: (tick: string | number) => number
) {
  let edge = -Infinity;
  return [...ticks]
    .sort((a, b) => position(a) - position(b))
    .filter((tick) => {
      const half = size(tick) / 2;
      if (position(tick) - half < edge + 8) return false;
      edge = position(tick) + half;
      return true;
    });
}

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
  tickFormatter?: (value: string | number) => string;
  onInspectGuide?: (guide: ChartGuide) => void;
}

export function XAxis({
  scale,
  transform,
  tickCount = 5,
  axisLabel,
  labelOffset = 40,
  tickFormatter = formatTick,
  onInspectGuide,
}: AxisProps) {
  const [start = 0, end = 0] = scale.range();
  const candidates =
    "ticks" in scale
      ? scale.ticks(
          Math.max(2, Math.min(tickCount, Math.floor((end - start) / 65)))
        )
      : scale.domain();
  const ticks =
    "ticks" in scale
      ? spacedTicks(
          candidates,
          (tick) => scale(Number(tick)),
          (tick) => tickFormatter(tick).length * 6
        )
      : candidates;
  const labelWidth =
    "bandwidth" in scale ? Math.max(3, Math.floor(scale.step() / 7)) : 20;
  return (
    <g
      transform={transform}
      className="fill-muted-foreground"
      pointerEvents={onInspectGuide ? "auto" : "none"}
    >
      <line
        x1={start}
        x2={end}
        y1={0}
        y2={0}
        className="stroke-border chart-guide"
        data-guide-id="x-axis"
        data-guide-axis="x"
        data-guide-role="axis"
        data-guide-x={0}
        data-guide-y={0}
        tabIndex={onInspectGuide ? 0 : undefined}
        role={onInspectGuide ? "button" : undefined}
        aria-label="Horizontal axis"
        aria-description={onInspectGuide ? GUIDE_DESCRIPTION : undefined}
      />
      {ticks.map((tick, i) => {
        const x =
          "bandwidth" in scale
            ? (scale(String(tick)) ?? 0) + scale.bandwidth() / 2
            : scale(Number(tick));
        const text = tickFormatter(tick);
        return (
          <g key={i} transform={`translate(${x},0)`}>
            <g
              data-guide-id={`x-tick:${String(tick)}`}
              data-guide-axis="x"
              data-guide-role="tick"
              data-guide-value={tick}
              data-guide-label={text}
              data-guide-x={x}
              data-guide-y={0}
              className="chart-guide"
              tabIndex={onInspectGuide ? 0 : undefined}
              role={onInspectGuide ? "button" : undefined}
              aria-label={`Horizontal tick ${text}`}
              aria-description={onInspectGuide ? GUIDE_DESCRIPTION : undefined}
            >
              <line y2={4} className="stroke-border" />
              <text y={17} textAnchor="middle" fontSize={10} aria-label={text}>
                {text.length > labelWidth
                  ? `${text.slice(0, labelWidth - 1)}…`
                  : text}
              </text>
            </g>
          </g>
        );
      })}
      {axisLabel && (
        <text
          x={(start + end) / 2}
          y={labelOffset}
          textAnchor="middle"
          fontSize={11}
          data-guide-id="x-label"
          data-guide-axis="x"
          data-guide-role="label"
          data-guide-label={axisLabel}
          data-guide-x={(start + end) / 2}
          data-guide-y={labelOffset}
          className="chart-guide"
          tabIndex={onInspectGuide ? 0 : undefined}
          role={onInspectGuide ? "button" : undefined}
          aria-label={`Horizontal axis label ${axisLabel}`}
          aria-description={onInspectGuide ? GUIDE_DESCRIPTION : undefined}
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
  tickFormatter = formatTick,
  onInspectGuide,
}: AxisProps) {
  const [start = 0, end = 0] = scale.range();
  const candidates =
    "ticks" in scale
      ? scale.ticks(
          Math.max(
            2,
            Math.min(tickCount, Math.floor(Math.abs(end - start) / 38))
          )
        )
      : scale.domain();
  const ticks =
    "ticks" in scale
      ? spacedTicks(
          candidates,
          (tick) => scale(Number(tick)),
          () => 12
        )
      : candidates;
  return (
    <g
      transform={transform}
      className="fill-muted-foreground"
      pointerEvents={onInspectGuide ? "auto" : "none"}
    >
      <line
        x1={0}
        x2={0}
        y1={start}
        y2={end}
        className="stroke-border chart-guide"
        data-guide-id="y-axis"
        data-guide-axis="y"
        data-guide-role="axis"
        data-guide-x={0}
        data-guide-y={end}
        tabIndex={onInspectGuide ? 0 : undefined}
        role={onInspectGuide ? "button" : undefined}
        aria-label="Vertical axis"
        aria-description={onInspectGuide ? GUIDE_DESCRIPTION : undefined}
      />
      {ticks.map((tick, i) => {
        const y =
          "bandwidth" in scale
            ? (scale(String(tick)) ?? 0) + scale.bandwidth() / 2
            : scale(Number(tick));
        const text = tickFormatter(tick);
        const maxChars = Math.max(5, Math.floor((labelOffset - 4) / 6));
        return (
          <g
            key={i}
            data-guide-id={`y-tick:${String(tick)}`}
            data-guide-axis="y"
            data-guide-role="tick"
            data-guide-value={tick}
            data-guide-label={text}
            data-guide-x={-9}
            data-guide-y={y}
            className="chart-guide"
            tabIndex={onInspectGuide ? 0 : undefined}
            role={onInspectGuide ? "button" : undefined}
            aria-label={`Vertical tick ${text}`}
            aria-description={onInspectGuide ? GUIDE_DESCRIPTION : undefined}
          >
            <text
              x={-9}
              y={y}
              dy=".32em"
              textAnchor="end"
              fontSize={10}
              aria-label={text}
            >
              {text.length > maxChars
                ? `${text.slice(0, maxChars - 1)}…`
                : text}
            </text>
          </g>
        );
      })}
      {axisLabel && !("bandwidth" in scale) && (
        <text
          transform="rotate(-90)"
          x={-(start + end) / 2}
          y={-labelOffset}
          textAnchor="middle"
          fontSize={11}
          data-guide-id="y-label"
          data-guide-axis="y"
          data-guide-role="label"
          data-guide-label={axisLabel}
          data-guide-x={-(start + end) / 2}
          data-guide-y={-labelOffset}
          className="chart-guide"
          tabIndex={onInspectGuide ? 0 : undefined}
          role={onInspectGuide ? "button" : undefined}
          aria-label={`Vertical axis label ${axisLabel}`}
          aria-description={onInspectGuide ? GUIDE_DESCRIPTION : undefined}
        >
          {axisLabel}
        </text>
      )}
    </g>
  );
}
