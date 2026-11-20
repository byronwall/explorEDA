import { chartRegistry } from "@/charts/registry";
import { useEffect, useState } from "react";
import type { ChartType } from "@/types/ChartTypes";
import { CHART_IMPORTS } from "./imports";

/**
 * How a standalone chart gets a type it has not registered. `exploreda/chart`
 * fills these in so each type's code loads the first time a chart of that
 * type draws; `exploreda/chart-core` leaves them empty, so a host registers
 * types itself with `registerCharts`.
 */
export const typeLoading: {
  /** Loads and registers one type. */
  load?: (type: ChartType) => Promise<void>;
  /** Loads and registers every type, for settings and Dashboard text. */
  loadAll?: () => Promise<void>;
} = {};

/** Whether every chart type is registered, however it got there. */
export function allRegistered() {
  return Object.keys(CHART_IMPORTS).every((type) =>
    chartRegistry.has(type as ChartType)
  );
}

/** Whether `type` can draw now, or is on its way. */
export function typeStatus(type: string): "ready" | "loading" | "missing" {
  if (chartRegistry.has(type as ChartType)) return "ready";
  return typeLoading.load && type in CHART_IMPORTS ? "loading" : "missing";
}

/**
 * Loads every type while `active`, so a settings panel can offer them all
 * in its Chart Type list. Re-renders once they arrive.
 */
export function useAllTypes(active = true) {
  const [, setArrived] = useState(false);
  useEffect(() => {
    if (!active || !typeLoading.loadAll || allRegistered()) return;
    let live = true;
    void typeLoading.loadAll().then(() => live && setArrived(true));
    return () => {
      live = false;
    };
  }, [active]);
}
