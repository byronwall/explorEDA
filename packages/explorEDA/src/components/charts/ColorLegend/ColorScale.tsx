import { ColorScaleType } from "@/types/ColorScaleTypes";

import { getContrastTextColor } from "./getContrastTextColor";

interface ColorScaleProps {
  scale: ColorScaleType;
  wrap: boolean;
  numericalBreakpoints?: number;
  getColorForValue: (scaleId: string, value: number) => string;
}
export function ColorScale({
  scale,
  wrap,
  numericalBreakpoints = 5,
  getColorForValue,
}: ColorScaleProps) {
  if (!scale?.palette) {
    return <div className="h-8 rounded-md bg-muted">Invalid color scale</div>;
  }

  if (scale.type === "numerical") {
    // Create discrete colors based on breakpoints
    const steps = numericalBreakpoints;
    const min = scale.min;
    const max = scale.max;
    const range = max - min;
    const stepSize = range / (steps - 1);

    const breakpoints = Array.from({ length: steps }, (_, i) => {
      const value = min + i * stepSize;
      return {
        value,
        color: getColorForValue(scale.id, value),
      };
    });

    return (
      <div className="rounded-md">
        <div className={`flex h-full ${wrap ? "flex-wrap" : ""}`}>
          {breakpoints.map(({ value, color }, i) => (
            <div
              key={i}
              className="h-8 flex items-center justify-center"
              style={{
                backgroundColor: color,
                color: getContrastTextColor(color),
                flexBasis: wrap ? "20%" : `${100 / steps}%`,
              }}
            >
              <span className="text-xs truncate px-1">
                {value.toLocaleString(undefined, {
                  maximumFractionDigits: 1,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md">
      <div className={`flex h-full ${wrap ? "flex-wrap" : ""}`}>
        {Array.from(scale.mapping.entries()).map(([value, color], i) => (
          <div
            key={i}
            className="h-8 flex items-center justify-center"
            style={{
              backgroundColor: color,
              color: getContrastTextColor(color),
              flexBasis: wrap ? "20%" : "auto",
              flexGrow: wrap ? 0 : 1,
            }}
          >
            <span className="text-xs truncate px-1">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
