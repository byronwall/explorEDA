import { useEffect, useSyncExternalStore } from "react";
import type {
  AnnotationStatus,
  ProjectedAnnotation,
} from "@/lib/annotations/resolve";

/**
 * What each drawn panel of a chart did with its annotations, so the Notes
 * list can say "Outside the view" or "Not on this chart". Statuses are
 * transient: they describe the current draw and are never saved.
 */
type PanelStatuses = Map<string, AnnotationStatus>;

const panels = new Map<string, Map<string, PanelStatuses>>();
const listeners = new Set<() => void>();
const snapshots = new Map<string, Record<string, AnnotationStatus>>();

function notify(chartId: string) {
  snapshots.delete(chartId);
  for (const listener of listeners) listener();
}

/** Ranks panel results: one shown panel is enough to call it shown. */
const RANK: AnnotationStatus[] = [
  "shown",
  "offscreen",
  "filtered",
  "hidden",
  "unsupported",
  "missing",
  "ambiguous",
  "invalid",
];

function merged(chartId: string) {
  const cached = snapshots.get(chartId);
  if (cached) return cached;
  const result: Record<string, AnnotationStatus> = {};
  for (const statuses of panels.get(chartId)?.values() ?? []) {
    for (const [id, status] of statuses) {
      const current = result[id];
      if (!current || RANK.indexOf(status) < RANK.indexOf(current))
        result[id] = status;
    }
  }
  snapshots.set(chartId, result);
  return result;
}

/** A panel reports its projected annotations while it is mounted. */
export function useReportAnnotationStatus(
  chartId: string,
  panelId: string,
  projected: ProjectedAnnotation[]
) {
  // Redraws that change no status report nothing.
  const key = projected
    .map((item) => `${item.annotation.id}\u0000${item.status}`)
    .join("\u0001");
  useEffect(() => {
    const statuses: PanelStatuses = new Map(
      key
        ? key.split("\u0001").map((entry) => {
            const [id, status] = entry.split("\u0000");
            return [id!, status as AnnotationStatus];
          })
        : []
    );
    let chart = panels.get(chartId);
    if (!chart) panels.set(chartId, (chart = new Map()));
    chart.set(panelId, statuses);
    notify(chartId);
    return () => {
      chart.delete(panelId);
      if (!chart.size) panels.delete(chartId);
      notify(chartId);
    };
  }, [chartId, panelId, key]);
}

const EMPTY: Record<string, AnnotationStatus> = {};

/** Statuses the chart's drawn panels report, by annotation id. */
export function useAnnotationStatuses(chartId: string) {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => (panels.has(chartId) ? merged(chartId) : EMPTY),
    () => EMPTY
  );
}
