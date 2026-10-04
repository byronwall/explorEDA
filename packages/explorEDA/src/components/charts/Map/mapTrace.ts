import type { ChartTraceField } from "../ChartTraceDetails";
import type { MapSettings } from "./definition";
import type { MapPoint, PointMapPlan } from "./pointMapPlan";

export interface MapTrace {
  kind: "map-point" | "map-exclusions" | "map-offscreen" | "map-background";
  id: string;
  revision: string;
  plan: PointMapPlan;
  settings: MapSettings;
  point?: MapPoint;
  fields?: ChartTraceField[];
}
