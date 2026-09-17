import { scaleLinear, scaleSymlog, type ScaleLinear } from "d3-scale";
import type { AxisSettings } from "@/types/ChartTypes";

export function numericScale(axis?: AxisSettings): ScaleLinear<number, number> {
  return (
    axis?.scaleType === "symlog" ? scaleSymlog() : scaleLinear()
  ) as ScaleLinear<number, number>;
}
