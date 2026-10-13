import { createContext, useContext } from "react";

/** One chart's image actions, for menus drawn inside its panel. */
export interface ChartImageActions {
  copy: () => void;
  download: () => void;
  /** Why the chart cannot be exported, when it cannot. */
  reason?: string;
}

export const ChartImageContext = createContext<ChartImageActions | null>(null);

/** The image actions of the chart this component is drawn in, if any. */
export function useChartImageActions() {
  return useContext(ChartImageContext);
}
