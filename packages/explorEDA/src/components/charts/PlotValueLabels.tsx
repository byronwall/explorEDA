/** Spreads labels apart vertically so none overlap, keeping their order. */
export function spreadLabels(
  ys: number[],
  gap: number,
  min: number,
  max: number
) {
  const order = ys.map((y, index) => ({ y, index })).sort((a, b) => a.y - b.y);
  order.forEach((item, i) => {
    item.y = Math.max(item.y, i ? order[i - 1]!.y + gap : min);
  });
  for (let i = order.length - 1; i >= 0; i--) {
    order[i]!.y = Math.min(
      order[i]!.y,
      i < order.length - 1 ? order[i + 1]!.y - gap : max
    );
  }
  const out = [...ys];
  order.forEach((item) => (out[item.index] = item.y));
  return out;
}

const pillWidth = (text: string) => text.length * 6.2 + 10;

/** Keeps a pill centered on x but inside the plot's width. */
export function pillX(x: number, text: string, plotWidth: number) {
  const half = pillWidth(text) / 2;
  return Math.max(half - 4, Math.min(plotWidth - half + 4, x));
}

/** A value on the x axis under the crosshair or a span edge, in a dark pill. */
export function AxisValuePill({
  x,
  y,
  text,
}: {
  x: number;
  y: number;
  text: string;
}) {
  const width = pillWidth(text);
  return (
    <g transform={`translate(${x},${y})`} className="eda-ecdf-axis-value">
      <rect x={-width / 2} y={-1} width={width} height={16} rx={3} />
      <text y={11} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}
