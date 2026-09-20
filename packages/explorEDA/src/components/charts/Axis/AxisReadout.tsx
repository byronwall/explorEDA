import { formatTick } from "./Axis";

interface AxisReadoutProps {
  x: number;
  y: number;
  xValue: number;
  yValue: number;
  width: number;
  height: number;
  color: string;
  label: string;
  rightAxis?: boolean;
  radius?: number;
  xFormatter?: (value: number) => string;
  yFormatter?: (value: number) => string;
}

export function AxisReadout({
  x,
  y,
  xValue,
  yValue,
  width,
  height,
  color,
  label,
  rightAxis = false,
  radius = 4,
  xFormatter = formatTick,
  yFormatter = formatTick,
}: AxisReadoutProps) {
  if (![x, y, xValue, yValue].every(Number.isFinite)) return null;
  const xText = xFormatter(xValue);
  const yText = yFormatter(yValue);
  const xLabelWidth = xText.length * 6 + 12;
  const yLabelWidth = yText.length * 6 + 12;
  const labelX = Math.max(
    xLabelWidth / 2,
    Math.min(width - xLabelWidth / 2, x)
  );
  const edge = rightAxis ? width : 0;

  return (
    <g
      className="eda-axis-readout"
      pointerEvents="none"
      role="img"
      aria-label={label}
    >
      <g
        stroke={color}
        strokeOpacity={0.4}
        strokeWidth={1}
        strokeDasharray="2 3"
      >
        <line x1={x} x2={x} y1={y} y2={height + 3} />
        <line x1={x} x2={edge} y1={y} y2={y} />
      </g>
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill="var(--card)"
        stroke={color}
        strokeWidth={1.5}
      />
      <circle cx={x} cy={y} r={2} fill={color} />
      <g fill="var(--card)">
        <rect
          x={labelX - xLabelWidth / 2}
          y={height + 5}
          width={xLabelWidth}
          height={20}
        />
        <rect
          x={rightAxis ? edge + 3 : -yLabelWidth - 3}
          y={y - 10}
          width={yLabelWidth}
          height={20}
        />
      </g>
      <g fill={color} fontSize={10} fontWeight={600}>
        <text x={labelX} y={height + 18} textAnchor="middle">
          {xText}
        </text>
        <text
          x={rightAxis ? edge + 8 : -8}
          y={y}
          dy=".32em"
          textAnchor={rightAxis ? "start" : "end"}
        >
          {yText}
        </text>
      </g>
    </g>
  );
}
