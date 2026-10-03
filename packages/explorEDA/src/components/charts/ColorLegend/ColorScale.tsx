import { categoryIncludes, categoryKey, categoryLabel } from "@/lib/categories";
import { ColorScaleType } from "@/types/ColorScaleTypes";
import { datum } from "@/types/ChartTypes";
import { planNumericalLegend } from "@/lib/colorScaleMath";

interface ColorScaleProps {
  scale: ColorScaleType;
  width: number;
  wrap: boolean;
  numericalBreakpoints: number;
  getColorForValue: (scaleId: string, value: datum) => string;
  counts: Map<string, number>;
  countWidth: number;
  categories: datum[];
  selected: datum[];
  onToggle: (value: datum) => void;
  onTrace?: (value?: datum) => void;
  traceId?: string;
  formatValue?: (value: datum) => string;
  numericalPlan?: ReturnType<typeof planNumericalLegend>;
  /** A list gives each value a row with its share of the rows on show. */
  layout?: "row" | "list";
}

export function ColorScale({
  scale,
  width,
  wrap,
  numericalBreakpoints,
  getColorForValue,
  counts,
  countWidth,
  selected,
  categories,
  onToggle,
  onTrace,
  traceId,
  formatValue = categoryLabel,
  numericalPlan,
  layout = "row",
}: ColorScaleProps) {
  if (scale.type === "numerical") {
    const plan =
      numericalPlan ??
      planNumericalLegend(
        scale,
        width,
        numericalBreakpoints,
        formatValue,
        (value) => getColorForValue(scale.id, value)
      );
    const content = (
      <>
        <div
          className="eda-legend-ramp"
          role="img"
          aria-label={`${scale.name}: ${formatValue(scale.min)} to ${formatValue(scale.max)}`}
          style={{ background: plan.background }}
        />
        <div className="eda-legend-ticks">
          {plan.stops.map(({ label }, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      </>
    );
    return onTrace ? (
      <button
        type="button"
        className="eda-legend-numeric eda-legend-trace-target"
        aria-label={`Alt-click to trace ${scale.name} color scale`}
        aria-pressed={traceId === "scale"}
        onClick={(event) => {
          if (event.altKey) onTrace();
        }}
      >
        {content}
      </button>
    ) : (
      <div className="eda-legend-numeric">{content}</div>
    );
  }

  const list = layout === "list";
  let total = 0;
  let most = 0;
  counts.forEach((count) => {
    total += count;
    most = Math.max(most, count);
  });
  return (
    <div
      className={`eda-legend-items ${wrap ? "is-wrapped" : ""} ${list ? "is-list" : ""}`}
    >
      {categories.map((value) => {
        const active = categoryIncludes(selected, value);
        const count = counts.get(categoryKey(value)) ?? 0;
        const share = total > 0 ? count / total : 0;
        return (
          <button
            key={categoryKey(value)}
            type="button"
            className="eda-legend-item"
            aria-label={`Filter ${scale.name} by ${formatValue(value)}, ${count.toLocaleString()} rows${onTrace ? "; Alt-click to trace color" : ""}`}
            aria-pressed={active}
            data-trace-selected={Boolean(
              onTrace && traceId === categoryKey(value)
            )}
            data-dimmed={(selected.length > 0 && !active) || count === 0}
            onClick={(event) => {
              if (event.altKey && onTrace) onTrace(value);
              else onToggle(value);
            }}
          >
            <span
              className="eda-legend-swatch"
              style={{ background: getColorForValue(scale.id, value) }}
              aria-hidden="true"
            />
            <span className="eda-legend-value">{formatValue(value)}</span>
            {list && (
              <span className="eda-legend-share" aria-hidden="true">
                <span
                  style={{
                    // The most common value fills the track; text gives the share.
                    width: `${most > 0 ? (count / most) * 100 : 0}%`,
                    background: getColorForValue(scale.id, value),
                  }}
                />
              </span>
            )}
            <span
              className="eda-legend-count"
              style={{ width: `${countWidth}ch` }}
            >
              {count.toLocaleString()}
            </span>
            {list && (
              <span className="eda-legend-percent">
                {share > 0 && share < 0.01
                  ? "<1%"
                  : `${Math.round(share * 100)}%`}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
