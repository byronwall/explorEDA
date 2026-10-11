import { scaleLinear, scaleLog, scaleSymlog, type ScaleLinear } from "d3-scale";
import type { AxisSettings } from "@/types/ChartTypes";

/** The scale an axis draws with. Log applies only where a chart allows it. */
export function numericScaleType(
  axis?: AxisSettings,
  allowLog = false
): "linear" | "symlog" | "log" {
  if (axis?.scaleType === "symlog") return "symlog";
  return allowLog && axis?.scaleType === "log" ? "log" : "linear";
}

/**
 * A numeric D3 scale for an axis. A saved `log` draws linear unless the
 * chart passes `allowLog`, so log never reaches a chart that cannot show it.
 */
export function numericScale(
  axis?: AxisSettings,
  allowLog = false
): ScaleLinear<number, number> {
  const type = numericScaleType(axis, allowLog);
  return (
    type === "symlog"
      ? scaleSymlog()
      : type === "log"
        ? scaleLog()
        : scaleLinear()
  ) as ScaleLinear<number, number>;
}
