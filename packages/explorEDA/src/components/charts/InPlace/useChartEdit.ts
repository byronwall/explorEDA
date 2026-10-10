import { useCallback, useEffect, useRef } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";

/**
 * One in-place edit of a chart's settings. Changes apply immediately through
 * `updateChart`, the same path the settings popover uses, but the host hears
 * about them once, when the edit ends. A typed title or a dragged axis is
 * therefore one undo step. `cancel` restores the values the edit started
 * with, so an abandoned edit leaves no step at all.
 */
export function useChartEdit(chartId: string) {
  const updateChart = useDataLayer((state) => state.updateChart);
  const holdStateChanges = useDataLayer((state) => state.holdStateChanges);
  const charts = useDataLayer((state) => state.charts);
  const chartsRef = useRef(charts);
  chartsRef.current = charts;
  const session = useRef<{
    release: () => void;
    original: Partial<ChartSettings>;
  } | null>(null);

  const finish = useCallback(() => {
    session.current?.release();
    session.current = null;
  }, []);

  // An unmounted editor must not hold the host's changes forever.
  useEffect(() => finish, [finish]);

  const begin = useCallback(() => {
    if (session.current) return;
    session.current = { release: holdStateChanges(), original: {} };
  }, [holdStateChanges]);

  const apply = useCallback(
    (updates: Partial<ChartSettings>) => {
      begin();
      const chart = chartsRef.current.find((item) => item.id === chartId);
      const original = session.current!.original;
      for (const key of Object.keys(updates) as (keyof ChartSettings)[]) {
        if (!(key in original))
          Object.assign(original, { [key]: chart?.[key] });
      }
      updateChart(chartId, updates);
    },
    [begin, chartId, updateChart]
  );

  const cancel = useCallback(() => {
    const original = session.current?.original;
    if (original && Object.keys(original).length)
      updateChart(chartId, original);
    finish();
  }, [chartId, finish, updateChart]);

  return { begin, apply, commit: finish, cancel };
}
