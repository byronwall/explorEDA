import type { ChartTraceField } from "../ChartTraceDetails";
import type { MapSettings } from "./definition";
import type { MapRegion, RegionMapPlan } from "./regionMapPlan";

export interface RegionTrace {
  kind: "map-region" | "map-region-row" | "map-joins";
  id: string;
  revision: string;
  plan: RegionMapPlan;
  settings: MapSettings;
  region?: MapRegion;
  row?: RegionMapPlan["rows"][number];
  fields?: ChartTraceField[];
}
