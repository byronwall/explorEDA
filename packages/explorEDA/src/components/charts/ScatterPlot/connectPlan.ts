import { finiteNumber, isMissingValue, timestampOf } from "@/lib/valueParsing";
import type { IdType } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import type { ScatterPlotSettings } from "./definition";
import { display, type ScatterPlan, type ScatterSnapshot } from "./scatterPlan";

/** Why an in-order row is not on its path. */
export type ConnectionGap = "filtered" | "unplotted";

/** One source row on a path, in path order. */
export interface ConnectionRow {
  sourceId: IdType;
  order: datum;
  x: datum;
  y: datum;
  /** Drawn, or the reason it breaks the path here. */
  state: "drawn" | ConnectionGap;
}

export interface ConnectionSegment {
  from: IdType;
  to: IdType;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** The start point's color, so a color field carries along the path. */
  color: string;
  /** Either end fails this chart's own selection. */
  dimmed: boolean;
}

export interface ConnectionLabel {
  x: number;
  y: number;
  /** The point it names; a moved label draws a leader back to it. */
  pointX: number;
  pointY: number;
  text: string;
  anchor: "start" | "end";
  color: string;
}

export interface ConnectionPath {
  id: string;
  /** The group value, or undefined for the single path. */
  group: datum;
  label: string;
  rows: ConnectionRow[];
  segments: ConnectionSegment[];
  /** Runs of two or more drawn rows; a gap row ends one. */
  runs: number;
  labels: ConnectionLabel[];
  /** One path string for the hit target and hover outline. */
  d: string;
}

export interface ConnectionPlan {
  orderField?: string;
  groupField?: string;
  paths: ConnectionPath[];
  /** Rows with no order value, which take no place on any path. */
  unordered: IdType[];
}

/** Gap between stacked path labels, in pixels. */
const LABEL_SPACING = 12;
/** Space between a point and its label. */
const LABEL_OFFSET = 10;
/** Estimated label glyph width, for the room labels need. */
export const LABEL_CHAR_WIDTH = 6.2;
/** The most room labels take from each side of the plot. */
const MAX_LABEL_SHARE = 0.3;

type OrderKey = { rank: 0 | 1; value: number | string };

function orderKey(value: datum): OrderKey | undefined {
  if (isMissingValue(value)) return undefined;
  const number = finiteNumber(value) ?? timestampOf(value);
  if (number !== undefined) return { rank: 0, value: number };
  return { rank: 1, value: String(value) };
}

function compareKeys(a: OrderKey, b: OrderKey) {
  if (a.rank !== b.rank) return a.rank - b.rank;
  return typeof a.value === "number" && typeof b.value === "number"
    ? a.value - b.value
    : String(a.value).localeCompare(String(b.value), undefined, {
        numeric: true,
      });
}

/** Rows in this panel's population, the base every path is cut from. */
function panelIds(snapshot: ScatterSnapshot) {
  if (!snapshot.facetIds?.length) return snapshot.allIds;
  const facet = new Set(snapshot.facetIds);
  return snapshot.allIds.filter((id) => facet.has(id));
}

/** The text each path label shows, for sizing the room labels need. */
export function connectionLabelTexts(
  settings: ScatterPlotSettings,
  snapshot: ScatterSnapshot
) {
  const field = settings.connect?.groupField;
  if (!settings.connect?.labels || !field || !snapshot.groupData) return [];
  const texts = new Set<string>();
  for (const id of panelIds(snapshot)) {
    const value = snapshot.groupData[id];
    if (!isMissingValue(value))
      texts.add(display(field, value, snapshot.fieldSettings));
  }
  return [...texts];
}

/** Pixels to keep free at each end of the X range for path labels. */
export function connectionLabelRoom(
  settings: ScatterPlotSettings,
  snapshot: ScatterSnapshot,
  plotWidth: number
) {
  const texts = connectionLabelTexts(settings, snapshot);
  if (!texts.length) return { start: 0, end: 0 };
  const widest = Math.max(...texts.map((text) => text.length));
  const room = Math.min(
    plotWidth * MAX_LABEL_SHARE,
    widest * LABEL_CHAR_WIDTH + LABEL_OFFSET + 2
  );
  return {
    start: settings.connect?.labels === "both" ? room : 0,
    end: room,
  };
}

/** Moves labels apart vertically so none overlap, keeping their order. */
function dodge(labels: ConnectionLabel[], height: number) {
  const sorted = [...labels].sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i++) {
    const min = sorted[i - 1]!.y + LABEL_SPACING;
    if (sorted[i]!.y < min) sorted[i]!.y = min;
  }
  // Push back up from the bottom edge.
  const overflow = sorted.length ? sorted.at(-1)!.y - height : 0;
  if (overflow > 0) {
    sorted.at(-1)!.y -= overflow;
    for (let i = sorted.length - 2; i >= 0; i--) {
      const max = sorted[i + 1]!.y - LABEL_SPACING;
      if (sorted[i]!.y > max) sorted[i]!.y = max;
    }
  }
}

/**
 * Orders each group's rows and joins consecutive drawn points. The order runs
 * over every row in the panel, not only the drawn ones, so a row removed by a
 * filter or left off for an invalid value breaks the path where it would sit.
 */
export function planConnections(
  settings: ScatterPlotSettings,
  snapshot: ScatterSnapshot,
  plan: ScatterPlan
): ConnectionPlan | undefined {
  const connect = settings.connect;
  if (!connect || (settings.display && settings.display !== "points"))
    return undefined;
  const drawn = new Map(plan.points.map((point) => [point.sourceId, point]));
  const live = new Set(snapshot.chartIds);
  const orderData = connect.orderField ? snapshot.orderData : undefined;
  const groupData = connect.groupField ? snapshot.groupData : undefined;
  const groups = new Map<string, { value: datum; ids: IdType[] }>();
  const unordered: IdType[] = [];
  const keys = new Map<IdType, OrderKey>();
  for (const id of panelIds(snapshot)) {
    const key = orderData ? orderKey(orderData[id]) : { rank: 0, value: id };
    if (!key) {
      unordered.push(id);
      continue;
    }
    keys.set(id as IdType, key as OrderKey);
    const value = groupData ? groupData[id] : undefined;
    const name =
      groupData && !isMissingValue(value)
        ? display(connect.groupField!, value, snapshot.fieldSettings)
        : "";
    const group = groups.get(name) ?? { value, ids: [] };
    group.ids.push(id);
    groups.set(name, group);
  }
  const labelSide = connect.labels;
  const labels: ConnectionLabel[] = [];
  const startLabels: ConnectionLabel[] = [];
  const paths = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([name, group]): ConnectionPath => {
      const ids = group.ids.sort(
        (a, b) => compareKeys(keys.get(a)!, keys.get(b)!) || a - b
      );
      const rows = ids.map(
        (sourceId): ConnectionRow => ({
          sourceId,
          order: orderData ? orderData[sourceId] : sourceId,
          x: snapshot.xData[sourceId],
          y: snapshot.yData[sourceId],
          state: drawn.has(sourceId)
            ? "drawn"
            : live.has(sourceId)
              ? "unplotted"
              : "filtered",
        })
      );
      const segments: ConnectionSegment[] = [];
      let runs = 0;
      let runLength = 0;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i]!.state !== "drawn") {
          runLength = 0;
          continue;
        }
        runLength++;
        if (runLength === 2) runs++;
        if (runLength < 2) continue;
        const a = drawn.get(rows[i - 1]!.sourceId)!;
        const b = drawn.get(rows[i]!.sourceId)!;
        segments.push({
          from: a.sourceId,
          to: b.sourceId,
          x1: a.x,
          y1: a.y,
          x2: b.x,
          y2: b.y,
          color: a.mappedColor,
          dimmed: !a.passesOwnFilter || !b.passesOwnFilter,
        });
      }
      const label = name || plan.yDisplay;
      const shown = rows.filter((row) => row.state === "drawn");
      const pathLabels: ConnectionLabel[] = [];
      if (labelSide && groupData && shown.length) {
        const last = drawn.get(shown.at(-1)!.sourceId)!;
        pathLabels.push({
          x: last.x + LABEL_OFFSET,
          y: last.y,
          pointX: last.x,
          pointY: last.y,
          text: name,
          anchor: "start",
          color: last.mappedColor,
        });
        if (labelSide === "both" && shown.length > 1) {
          const first = drawn.get(shown[0]!.sourceId)!;
          pathLabels.push({
            x: first.x - LABEL_OFFSET,
            y: first.y,
            pointX: first.x,
            pointY: first.y,
            text: name,
            anchor: "end",
            color: first.mappedColor,
          });
        }
      }
      for (const item of pathLabels)
        (item.anchor === "start" ? labels : startLabels).push(item);
      return {
        id: `${settings.id}:path:${name}`,
        group: group.value,
        label,
        rows,
        segments,
        runs,
        labels: pathLabels,
        d: segments
          .map(
            (segment, i) =>
              `${
                i > 0 && segments[i - 1]!.to === segment.from
                  ? ""
                  : `M${segment.x1},${segment.y1}`
              }L${segment.x2},${segment.y2}`
          )
          .join(""),
      };
    });
  dodge(labels, plan.plotHeight);
  dodge(startLabels, plan.plotHeight);
  return {
    orderField: connect.orderField,
    groupField: connect.groupField,
    paths,
    unordered,
  };
}

/** "1 segment", "3 segments": the count a path's name reports. */
export function segmentCount(path: ConnectionPath) {
  const count = path.segments.length;
  return `${count.toLocaleString()} ${count === 1 ? "segment" : "segments"}`;
}
