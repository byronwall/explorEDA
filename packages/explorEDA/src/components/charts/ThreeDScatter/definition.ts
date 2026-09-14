import { ChartDefinition } from "@/types/ChartTypes";
import { DEFAULT_3D_SCATTER_SETTINGS } from "./defaultSettings";
import { Box } from "lucide-react";

import { ThreeDScatterChart } from "./ThreeDScatterChart";
import { ThreeDScatterSettingsPanel } from "./ThreeDScatterSettingsPanel";
import { ThreeDScatterSettings } from "./types";

export const threeDScatterDefinition: ChartDefinition<ThreeDScatterSettings> = {
  type: "3d-scatter",
  name: "3D Scatter Plot",
  description: "Display data as points in a 3D space",
  icon: Box,

  component: ThreeDScatterChart,
  settingsPanel: ThreeDScatterSettingsPanel,

  createDefaultSettings: (layout) => ({
    ...DEFAULT_3D_SCATTER_SETTINGS,
    id: crypto.randomUUID(),
    type: "3d-scatter",
    title: "3D Scatter Plot",
    layout,
    margin: { ...DEFAULT_3D_SCATTER_SETTINGS.margin },
    xField: "",
    yField: "",
    zField: "",
    colorField: undefined,
    sizeField: undefined,
    pointSize: 5,
    pointOpacity: 0.8,
    showGrid: true,
    showAxes: true,
    cameraPosition: DEFAULT_3D_SCATTER_SETTINGS.cameraPosition.clone(),
    cameraTarget: DEFAULT_3D_SCATTER_SETTINGS.cameraTarget.clone(),
    xAxis: { ...DEFAULT_3D_SCATTER_SETTINGS.xAxis, zoomLevel: 1 },
    yAxis: { ...DEFAULT_3D_SCATTER_SETTINGS.yAxis, zoomLevel: 1 },
    zAxis: { ...DEFAULT_3D_SCATTER_SETTINGS.zAxis, zoomLevel: 1 },
  }),

  validateSettings: (settings) => {
    return !!settings.xField && !!settings.yField && !!settings.zField;
  },

  getFilterFunction: () => () => true, // No filtering for 3D scatter
};
