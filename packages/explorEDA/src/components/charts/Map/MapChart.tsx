import type { BaseChartProps } from "@/types/ChartTypes";
import type { MapSettings } from "./definition";
import { PointMap } from "./PointMap";
import { RegionMap } from "./RegionMap";

export function MapChart(props: BaseChartProps<MapSettings>) {
  return props.settings.mode === "region" ? (
    <RegionMap {...props} />
  ) : (
    <PointMap {...props} />
  );
}
