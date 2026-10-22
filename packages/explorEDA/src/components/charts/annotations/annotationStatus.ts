import { useEffect, useSyncExternalStore } from "react";
import {
  intervalEvidenceText,
  type AnnotationStatus,
  type ProjectedAnnotation,
} from "@/lib/annotations/resolve";

/**
 * What each drawn panel of a chart did with its annotations, so the Notes
 * list can say "Outside the view" or "Not on this chart". Statuses are
 * transient: they describe the current draw and are never saved.
 */
type PanelStatuses = Map<string, AnnotationStatus>;
/** What a drawn annotation read, such as an interval's rows and runs. */
type PanelDetails = Map<string, string>;

const panels = new Map<string, Map<string, PanelStatuses>>();
const panelDetails = new Map<string, Map<string, PanelDetails>>();
const listeners = new Set<() => void>();
const snapshots = new Map<string, Record<string, AnnotationStatus>>();

function notify(chartId: string) {
  snapshots.delete(chartId);
  detailSnapshots.delete(chartId);
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
  "empty",
  // Another panel's own status wins over "not my panel".
  "elsewhere",
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
  const detailKey = projected
    .flatMap((item) =>
      item.status === "shown" && "evidence" in item
        ? [
            `${item.annotation.id}\u0000${intervalEvidenceText(item.evidence, item.runs.length)}`,
          ]
        : []
    )
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
    const details: PanelDetails = new Map(
      detailKey
        ? detailKey.split("\u0001").map((entry) => {
            const [id, text] = entry.split("\u0000");
            return [id!, text!];
          })
        : []
    );
    let chart = panels.get(chartId);
    if (!chart) panels.set(chartId, (chart = new Map()));
    chart.set(panelId, statuses);
    let chartDetails = panelDetails.get(chartId);
    if (!chartDetails) panelDetails.set(chartId, (chartDetails = new Map()));
    chartDetails.set(panelId, details);
    notify(chartId);
    return () => {
      chart.delete(panelId);
      if (!chart.size) panels.delete(chartId);
      chartDetails.delete(panelId);
      if (!chartDetails.size) panelDetails.delete(chartId);
      notify(chartId);
    };
  }, [chartId, panelId, key, detailKey]);
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

const detailSnapshots = new Map<string, Record<string, string>>();
const NO_DETAILS: Record<string, string> = {};

function mergedDetails(chartId: string) {
  const cached = detailSnapshots.get(chartId);
  if (cached) return cached;
  // Facet panels each report their own; the list joins them in panel order.
  const result: Record<string, string> = {};
  for (const details of panelDetails.get(chartId)?.values() ?? [])
    for (const [id, text] of details)
      result[id] = result[id] ? `${result[id]}; ${text}` : text;
  detailSnapshots.set(chartId, result);
  return result;
}

/** What each drawn annotation read, by annotation id, for the Notes list. */
export function useAnnotationDetails(chartId: string) {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => (panelDetails.has(chartId) ? mergedDetails(chartId) : NO_DETAILS),
    () => NO_DETAILS
  );
}
