import { Vector3 } from "three";
import {
  DEFAULT_AXIS_SETTINGS,
  DEFAULT_CHART_SETTINGS,
} from "@/utils/defaultSettings";
import type { ThreeDScatterSettings } from "./types";

export const DEFAULT_3D_SCATTER_SETTINGS: Omit<ThreeDScatterSettings, "id"> = {
  ...DEFAULT_CHART_SETTINGS,
  type: "3d-scatter",
  xField: "",
  yField: "",
  zField: "",
  colorField: undefined,
  sizeField: undefined,
  cameraPosition: new Vector3(10, 10, 10),
  cameraTarget: new Vector3(0, 0, 0),
  pointSize: 0.1,
  pointOpacity: 0.8,
  showGrid: true,
  showAxes: true,
  xAxis: { ...DEFAULT_AXIS_SETTINGS, zoomLevel: 1 },
  yAxis: { ...DEFAULT_AXIS_SETTINGS, zoomLevel: 1 },
  zAxis: { ...DEFAULT_AXIS_SETTINGS, zoomLevel: 1 },
};
