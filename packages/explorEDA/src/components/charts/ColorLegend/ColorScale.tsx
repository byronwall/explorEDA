import { categoryIncludes, categoryKey, categoryLabel } from "@/lib/categories";
import { ColorScaleType } from "@/types/ColorScaleTypes";
import { datum } from "@/types/ChartTypes";

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
}: ColorScaleProps) {
  if (scale.type === "numerical") {
    const steps =
      scale.min === scale.max
        ? 1
        : Math.max(
            2,
            Math.min(Math.round(numericalBreakpoints), Math.floor(width / 56))
          );
    const stops = Array.from({ length: steps }, (_, index) => {
      const value =
        scale.min + ((scale.max - scale.min) * index) / Math.max(1, steps - 1);
      return { value, color: getColorForValue(scale.id, value) };
    });
    return (
      <div className="eda-legend-numeric">
        <div
          className="eda-legend-ramp"
          role="img"
          aria-label={`${scale.name}: ${scale.min} to ${scale.max}`}
          style={{
            background:
              steps === 1
                ? stops[0]!.color
                : `linear-gradient(to right, ${stops.map((stop) => stop.color).join(", ")})`,
          }}
        />
        <div className="eda-legend-ticks">
          {stops.map(({ value }, index) => (
            <span key={index}>
              {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`eda-legend-items ${wrap ? "is-wrapped" : ""}`}>
      {categories.map((value) => {
        const active = categoryIncludes(selected, value);
        const count = counts.get(categoryKey(value)) ?? 0;
        return (
          <button
            key={categoryKey(value)}
            type="button"
            className="eda-legend-item"
            aria-label={`Filter ${scale.name} by ${categoryLabel(value)}, ${count.toLocaleString()} rows`}
            aria-pressed={active}
            data-dimmed={(selected.length > 0 && !active) || count === 0}
            title={`${categoryLabel(value)} · ${count.toLocaleString()} rows · Click to ${active ? "remove" : "add"} filter`}
            onClick={() => onToggle(value)}
          >
            <span
              className="eda-legend-swatch"
              style={{ background: getColorForValue(scale.id, value) }}
              aria-hidden="true"
            />
            <span className="eda-legend-value">{categoryLabel(value)}</span>
            <span
              className="eda-legend-count"
              style={{ width: `${countWidth}ch` }}
            >
              {count.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
