import type { SavedDataStructure } from "exploreda";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.userAgent);
/** The platform's command key, as shortcut hints write it. */
export const MOD_KEY = isMac ? "⌘" : "Ctrl+";
import {
  HISTORY_LIMIT,
  type ChangeLabel,
  type HistoryEntry,
  type SavedView,
  type SavedViewsSession,
} from "./savedViewsSession";

export const SHARED_KEYS = [
  "calculations",
  "colorScales",
  "fieldSettings",
  "aggregates",
  "geometryAssets",
] as const;

type SavedChart = SavedDataStructure["charts"][number];
type SavedFilter = SavedChart["filters"][number];

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function snapshot(tabs: SavedView[]) {
  return clone(tabs);
}

function signatures(tabs: SavedView[]) {
  const shared = JSON.stringify(
    tabs.map(
      ({ settings }) =>
        settings &&
        Object.fromEntries(
          SHARED_KEYS.map((key) => [
            key,
            key === "fieldSettings"
              ? (settings[key] ?? {})
              : (settings[key] ?? []),
          ])
        )
    )
  );
  const filters = JSON.stringify(
    tabs.map(({ id, settings }) => ({
      id,
      charts: settings?.charts
        .filter((chart) => chart.filters.length > 0)
        .map(({ id: chartId, filters }) => ({ id: chartId, filters })),
      rows: {
        filters: settings?.rowsSettings?.filters ?? [],
        globalSearch: settings?.rowsSettings?.globalSearch ?? "",
      },
    }))
  );
  const views = JSON.stringify(
    tabs.map(({ id, name, settings }) => {
      if (!settings) {
        return { id, name };
      }
      const { charts, rowsSettings, ...rest } = settings;
      // Metadata changes on every save, and shared keys have their own signature.
      for (const key of ["metadata", ...SHARED_KEYS] as const) {
        delete (rest as Partial<SavedDataStructure>)[key];
      }
      const rowsView = rowsSettings && {
        ...rowsSettings,
        filters: undefined,
        globalSearch: undefined,
      };
      return {
        id,
        name,
        rest,
        rowsView,
        charts: charts.map((chart) => ({ ...chart, filters: undefined })),
      };
    })
  );
  return { shared, filters, views };
}

export function classifyChange(
  before: SavedView[],
  after: SavedView[]
): ChangeLabel | undefined {
  const previous = signatures(before);
  const next = signatures(after);
  const sharedChanged = previous.shared !== next.shared;
  const filtersChanged = previous.filters !== next.filters;
  const viewsChanged = previous.views !== next.views;
  if (!sharedChanged && !filtersChanged && !viewsChanged) {
    return undefined;
  }
  if (sharedChanged) {
    return "Shared";
  }
  if (filtersChanged && viewsChanged) {
    return "Both";
  }
  if (filtersChanged) {
    return "Filter";
  }
  return "View";
}

/**
 * Records `tabs` as the next checkpoint after the current one. A checkpoint
 * that matches the current one is skipped unless `label` forces it.
 */
export function pushCheckpoint(
  session: SavedViewsSession,
  tabs: SavedView[],
  label = classifyChange(session.tabs, tabs),
  note?: Pick<HistoryEntry, "action" | "restoredFrom">
): SavedViewsSession {
  if (!label) {
    return { ...session, tabs };
  }
  const parent = session.path[session.cursor];
  const entry: HistoryEntry = {
    at: new Date().toISOString(),
    label,
    tabs: snapshot(tabs),
    parent,
  };
  if (note?.action) {
    entry.action = note.action;
  }
  if (note?.restoredFrom) {
    entry.restoredFrom = note.restoredFrom;
  }
  const history = [...session.history, entry];
  const path = [
    ...session.path.slice(0, session.cursor + 1),
    history.length - 1,
  ];
  let keptHistory = history;
  let keptPath = path;
  if (history.length > HISTORY_LIMIT) {
    const drop = history.length - HISTORY_LIMIT;
    keptHistory = history.slice(drop).map((kept) => {
      if (kept.parent === undefined) {
        return kept;
      }
      const { parent: oldParent, ...rest } = kept;
      return oldParent >= drop ? { ...rest, parent: oldParent - drop } : rest;
    });
    keptPath = path
      .filter((index) => index >= drop)
      .map((index) => index - drop);
  }
  return {
    ...session,
    tabs,
    history: keptHistory,
    path: keptPath,
    cursor: keptPath.length - 1,
  };
}

/** The checkpoint an entry changed, inferred for sessions saved before it was stored. */
export function parentOf(
  session: Pick<SavedViewsSession, "history" | "path">,
  index: number
): number | undefined {
  const entry = session.history[index];
  if (!entry) {
    return undefined;
  }
  if (entry.parent !== undefined) {
    return entry.parent;
  }
  if (index === 0) {
    return undefined;
  }
  const position = session.path.indexOf(index);
  if (position > 0) {
    return session.path[position - 1];
  }
  if (position === 0) {
    return undefined;
  }
  return index - 1;
}

// ---------------------------------------------------------------------------
// Change descriptions

export type ChangeKind =
  | "view"
  | "chart-add"
  | "chart-remove"
  | "chart-edit"
  | "layout"
  | "filter"
  | "rows"
  | "shared";

export type HistoryChange = {
  kind: ChangeKind;
  /** One short sentence, such as Filtered “Revenue”. */
  text: string;
  /** The view it applies to. Shared changes apply to every view. */
  view?: string;
  before?: string;
  after?: string;
};

const quote = (text: string) => `“${text}”`;

const CHART_TYPE_NAMES: Record<string, string> = {
  bar: "Bar chart",
  row: "Row chart",
  scatter: "Scatter plot",
  "3d-scatter": "3D scatter",
  "pivot-table": "Pivot table",
  "summary-table": "Summary table",
  "data-table": "Data table",
  markdown: "Note",
  "box-plot": "Box plot",
  line: "Line chart",
  sankey: "Sankey",
  "parallel-coordinates": "Parallel coordinates",
  calendar: "Calendar",
};

function typeName(type: string | undefined) {
  if (!type) {
    return "Chart";
  }
  return (
    CHART_TYPE_NAMES[type] ??
    type.replace(/[-_]+/g, " ").replace(/^\w/, (letter) => letter.toUpperCase())
  );
}

export function chartName(chart: SavedChart) {
  if (chart.title?.trim()) {
    return chart.title.trim();
  }
  const field = (chart as { field?: string }).field;
  return field ? `${typeName(chart.type)} of ${field}` : typeName(chart.type);
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? value.toLocaleString()
      : value.toLocaleString(undefined, { maximumFractionDigits: 3 });
  }
  return String(value);
}

function formatBounds(min: unknown, max: unknown) {
  const hasMin = min !== undefined && min !== null;
  const hasMax = max !== undefined && max !== null;
  if (hasMin && hasMax) {
    return `${formatValue(min)} – ${formatValue(max)}`;
  }
  if (hasMin) {
    return `≥ ${formatValue(min)}`;
  }
  if (hasMax) {
    return `≤ ${formatValue(max)}`;
  }
  return "any value";
}

const TEXT_OPERATORS: Record<string, string> = {
  contains: "contains",
  equals: "is",
  startsWith: "starts with",
  endsWith: "ends with",
};

export function describeFilter(filter: SavedFilter) {
  switch (filter.type) {
    case "value": {
      const shown = filter.values.slice(0, 3).map(formatValue).join(", ");
      const more =
        filter.values.length > 3 ? ` +${filter.values.length - 3} more` : "";
      return `${filter.field} is ${shown}${more}`;
    }
    case "range":
    case "date-range":
      return `${filter.field} ${formatBounds(filter.min, filter.max)}`;
    case "text":
      return `${filter.field} ${TEXT_OPERATORS[filter.operator] ?? filter.operator} ${quote(filter.value)}`;
    default:
      return (filter as { field?: string }).field ?? "filter";
  }
}

function describeFilters(filters: SavedFilter[]) {
  return filters.length ? filters.map(describeFilter).join("; ") : undefined;
}

function same(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const CHART_SETTING_NAMES: Record<string, string> = {
  title: "title",
  type: "chart type",
  field: "field",
  colorField: "color field",
  colorScaleId: "color scale",
  facet: "facets",
  xAxis: "x axis",
  yAxis: "y axis",
  xAxisLabel: "x axis label",
  yAxisLabel: "y axis label",
  margin: "margins",
};

function changedChartSettings(before: SavedChart, after: SavedChart) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const names: string[] = [];
  for (const key of keys) {
    if (key === "filters" || key === "layout" || key === "id") {
      continue;
    }
    if (
      same(
        (before as Record<string, unknown>)[key],
        (after as Record<string, unknown>)[key]
      )
    ) {
      continue;
    }
    const name =
      CHART_SETTING_NAMES[key] ??
      key.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
    if (!names.includes(name)) {
      names.push(name);
    }
  }
  return names;
}

function describeChartChanges(
  before: SavedChart[],
  after: SavedChart[],
  view: string
): HistoryChange[] {
  const changes: HistoryChange[] = [];
  const previous = new Map(before.map((chart) => [chart.id, chart]));
  const next = new Map(after.map((chart) => [chart.id, chart]));
  const arranged: string[] = [];

  for (const chart of after) {
    const old = previous.get(chart.id);
    if (!old) {
      changes.push({
        kind: "chart-add",
        text: `Added ${quote(chartName(chart))}`,
        after: typeName(chart.type),
        view,
      });
      continue;
    }
    const name = chartName(chart);
    if (!same(old.filters, chart.filters)) {
      const oldText = describeFilters(old.filters);
      const newText = describeFilters(chart.filters);
      changes.push({
        kind: "filter",
        text: !oldText
          ? `Filtered ${quote(name)}`
          : !newText
            ? `Cleared filters on ${quote(name)}`
            : `Changed the filter on ${quote(name)}`,
        before: oldText,
        after: newText,
        view,
      });
    }
    const edited = changedChartSettings(old, chart);
    if (edited.length) {
      const renamed = old.title !== chart.title && old.title?.trim();
      changes.push({
        kind: "chart-edit",
        text: renamed
          ? `Renamed ${quote(old.title.trim())} to ${quote(name)}`
          : `Edited ${quote(name)}`,
        after: edited.join(", "),
        view,
      });
    }
    if (!same(old.layout, chart.layout)) {
      arranged.push(name);
    }
  }
  for (const chart of before) {
    if (next.has(chart.id)) {
      continue;
    }
    changes.push({
      kind: "chart-remove",
      text: `Removed ${quote(chartName(chart))}`,
      before: typeName(chart.type),
      view,
    });
  }
  // Placing or removing a chart moves its neighbors; only report a layout
  // change when it stands on its own.
  const placed = changes.some(
    (change) => change.kind === "chart-add" || change.kind === "chart-remove"
  );
  if (arranged.length && !placed) {
    changes.push({
      kind: "layout",
      text:
        arranged.length === 1
          ? `Moved or resized ${quote(arranged[0]!)}`
          : `Moved or resized ${arranged.length} charts`,
      after: arranged.length > 1 ? arranged.join(", ") : undefined,
      view,
    });
  }
  return changes;
}

function describeRowsChanges(
  before: SavedDataStructure["rowsSettings"],
  after: SavedDataStructure["rowsSettings"],
  view: string
): HistoryChange[] {
  const changes: HistoryChange[] = [];
  const oldFilters = before?.filters ?? [];
  const newFilters = after?.filters ?? [];
  if (!same(oldFilters, newFilters)) {
    const oldText = describeFilters(oldFilters);
    const newText = describeFilters(newFilters);
    changes.push({
      kind: "filter",
      text: !oldText
        ? "Filtered Rows"
        : !newText
          ? "Cleared Rows filters"
          : "Changed a Rows filter",
      before: oldText,
      after: newText,
      view,
    });
  }
  const oldSearch = before?.globalSearch ?? "";
  const newSearch = after?.globalSearch ?? "";
  if (oldSearch !== newSearch) {
    changes.push({
      kind: "filter",
      text: newSearch
        ? `Searched Rows for ${quote(newSearch)}`
        : "Cleared the Rows search",
      before: oldSearch ? quote(oldSearch) : undefined,
      after: newSearch ? quote(newSearch) : undefined,
      view,
    });
  }
  if (before && after) {
    if (
      before.sortBy !== after.sortBy ||
      before.sortDirection !== after.sortDirection
    ) {
      changes.push({
        kind: "rows",
        text: after.sortBy
          ? `Sorted Rows by ${after.sortBy}`
          : "Cleared the Rows sort",
        after: after.sortBy
          ? after.sortDirection === "desc"
            ? "descending"
            : "ascending"
          : undefined,
        view,
      });
    }
    if (!same(before.columns, after.columns)) {
      changes.push({ kind: "rows", text: "Changed Rows columns", view });
    }
  }
  return changes;
}

function describeNamedList<T>(
  before: T[] | undefined,
  after: T[] | undefined,
  nameOf: (item: T) => string,
  noun: string,
  valueOf?: (item: T) => string
): HistoryChange[] {
  const changes: HistoryChange[] = [];
  const previous = new Map((before ?? []).map((item) => [nameOf(item), item]));
  const next = new Map((after ?? []).map((item) => [nameOf(item), item]));
  for (const [name, item] of next) {
    const old = previous.get(name);
    if (!old) {
      changes.push({
        kind: "shared",
        text: `Added ${noun} ${quote(name)}`,
        after: valueOf?.(item),
      });
    } else if (!same(old, item)) {
      changes.push({
        kind: "shared",
        text: `Edited ${noun} ${quote(name)}`,
        before: valueOf?.(old),
        after: valueOf?.(item),
      });
    }
  }
  for (const [name, item] of previous) {
    if (next.has(name)) {
      continue;
    }
    changes.push({
      kind: "shared",
      text: `Removed ${noun} ${quote(name)}`,
      before: valueOf?.(item),
    });
  }
  return changes;
}

function describeSharedChanges(
  before: SavedDataStructure,
  after: SavedDataStructure
): HistoryChange[] {
  const changes = [
    ...describeNamedList(
      before.calculations,
      after.calculations,
      (calculation) => calculation.resultColumnName,
      "calculation",
      (calculation) => calculation.expression
    ),
    ...describeNamedList(
      before.colorScales,
      after.colorScales,
      (scale) => scale.name ?? scale.id,
      "color scale"
    ),
  ];
  const oldFields = before.fieldSettings ?? {};
  const newFields = after.fieldSettings ?? {};
  const fields = [
    ...new Set([...Object.keys(oldFields), ...Object.keys(newFields)]),
  ].filter((field) => !same(oldFields[field], newFields[field]));
  if (fields.length) {
    changes.push({
      kind: "shared",
      text:
        fields.length === 1
          ? `Changed field settings for ${fields[0]}`
          : `Changed settings for ${fields.length} fields`,
      after: fields.length > 1 ? fields.join(", ") : undefined,
    });
  }
  if (!same(before.aggregates ?? [], after.aggregates ?? [])) {
    changes.push({ kind: "shared", text: "Changed grouped summaries" });
  }
  if (!same(before.geometryAssets ?? [], after.geometryAssets ?? [])) {
    changes.push({ kind: "shared", text: "Changed map shapes" });
  }
  return changes;
}

/** Lists what changed from `before` to `after` in plain words. */
export function describeChanges(
  before: SavedView[] | undefined,
  after: SavedView[]
): HistoryChange[] {
  if (!before) {
    return [
      {
        kind: "view",
        text:
          after.length === 1
            ? `Opened ${quote(after[0]!.name)}`
            : `Opened ${after.length} views`,
        after:
          after.length === 1
            ? undefined
            : after.map((tab) => tab.name).join(", "),
      },
    ];
  }
  const changes: HistoryChange[] = [];
  const previous = new Map(before.map((tab) => [tab.id, tab]));
  const next = new Map(after.map((tab) => [tab.id, tab]));

  for (const tab of after) {
    const old = previous.get(tab.id);
    if (!old) {
      const charts = tab.settings?.charts.length ?? 0;
      changes.push({
        kind: "view",
        text: `Created view ${quote(tab.name)}`,
        after: charts
          ? `${charts} chart${charts === 1 ? "" : "s"}`
          : "No charts yet",
        view: tab.name,
      });
      continue;
    }
    if (old.name !== tab.name) {
      changes.push({
        kind: "view",
        text: `Renamed view ${quote(old.name)} to ${quote(tab.name)}`,
        before: old.name,
        after: tab.name,
        view: tab.name,
      });
    }
    // A view without settings has not been opened yet; it gains defaults
    // without a user edit.
    if (!old.settings || !tab.settings) {
      continue;
    }
    changes.push(
      ...describeChartChanges(
        old.settings.charts,
        tab.settings.charts,
        tab.name
      ),
      ...describeRowsChanges(
        old.settings.rowsSettings,
        tab.settings.rowsSettings,
        tab.name
      )
    );
    if (!same(old.settings.gridSettings, tab.settings.gridSettings)) {
      changes.push({ kind: "view", text: "Changed the grid", view: tab.name });
    }
  }
  for (const tab of before) {
    if (next.has(tab.id)) {
      continue;
    }
    changes.push({
      kind: "view",
      text: `Deleted view ${quote(tab.name)}`,
      before: tab.name,
    });
  }
  const order = (tabs: SavedView[]) =>
    tabs
      .filter((tab) => previous.has(tab.id) && next.has(tab.id))
      .map((tab) => tab.id)
      .join();
  if (order(before) !== order(after)) {
    changes.push({ kind: "view", text: "Reordered views" });
  }

  // Shared definitions match in every view, so compare one view that has them.
  const sharedBefore = before.find((tab) => tab.settings)?.settings;
  const sharedAfter = after.find(
    (tab) => tab.settings && previous.get(tab.id)?.settings
  )?.settings;
  if (sharedBefore && sharedAfter) {
    changes.push(...describeSharedChanges(sharedBefore, sharedAfter));
  }
  return changes;
}

export type DescribedEntry = {
  index: number;
  entry: HistoryEntry;
  parent: number | undefined;
  headline: string;
  /** One line under the headline: the first change's values, or the change itself. */
  detail?: string;
  /** Changes beyond the ones the headline and detail cover. */
  more: number;
  changes: HistoryChange[];
};

/** The most useful single line of detail for a change. */
export function changeDetail(change: HistoryChange | undefined) {
  if (!change) {
    return undefined;
  }
  if (change.before && change.after) {
    return `${change.before} → ${change.after}`;
  }
  if (change.after) {
    return change.after;
  }
  if (change.before) {
    return `was ${change.before}`;
  }
  return undefined;
}

export function formatClock(at: string, withSeconds = false) {
  return new Date(at).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
  });
}

const describedCache = new WeakMap<HistoryEntry, DescribedEntry>();

const LABEL_FALLBACK: Record<ChangeLabel, string> = {
  View: "Changed the view",
  Filter: "Changed filters",
  Both: "Changed the view and filters",
  Shared: "Changed shared settings",
};

export function describeEntry(
  session: Pick<SavedViewsSession, "history" | "path">,
  index: number
): DescribedEntry {
  const entry = session.history[index]!;
  const parent = parentOf(session, index);
  const cached = describedCache.get(entry);
  if (cached && cached.index === index && cached.parent === parent) {
    return cached;
  }
  const before =
    parent === undefined ? undefined : session.history[parent]?.tabs;
  const changes = describeChanges(before, entry.tabs);
  const first = changes[0];
  let headline = entry.action ?? first?.text ?? LABEL_FALLBACK[entry.label];
  let detail = changeDetail(first);
  if (entry.restoredFrom) {
    // A restore can change many things; the first one becomes the detail.
    headline = `Restored the version from ${formatClock(entry.restoredFrom)}`;
    detail = first?.text;
  }
  const described: DescribedEntry = {
    index,
    entry,
    parent,
    headline,
    detail,
    more: Math.max(0, changes.length - 1),
    changes,
  };
  describedCache.set(entry, described);
  return described;
}

export const LABEL_NAMES: Record<ChangeLabel, string> = {
  View: "View",
  Filter: "Filter",
  Both: "View + filter",
  Shared: "Shared",
};

// ---------------------------------------------------------------------------
// Timeline layout

export type TimelineState = "past" | "current" | "future" | "branch";

/** One vertical piece of a lane in a row, relative to the station. */
export type RailSegment = {
  lane: number;
  /** Covers the row from its top edge down to the station. */
  above: boolean;
  /** Covers the row from the station down to its bottom edge. */
  below: boolean;
  state: TimelineState;
};

/** A line that leaves `fromLane` at the row's top and curves into the station. */
export type RailMerge = { fromLane: number; state: TimelineState };

export type TimelineRow = {
  index: number;
  lane: number;
  state: TimelineState;
  segments: RailSegment[];
  merges: RailMerge[];
};

/** The most branch lanes the rail draws; older branches share the last. */
export const MAX_LANES = 4;

/**
 * Lays the history out as a subway map, newest at the top. The current path
 * runs straight down lane 0. Checkpoints that an edit after Undo replaced
 * branch off to the right.
 */
export function buildTimeline(
  session: Pick<SavedViewsSession, "history" | "path" | "cursor">
): TimelineRow[] {
  const count = session.history.length;
  const pathPosition = new Map(
    session.path.map((index, position) => [index, position])
  );
  const stateOf = (index: number): TimelineState => {
    const position = pathPosition.get(index);
    if (position === undefined) {
      return "branch";
    }
    if (position < session.cursor) {
      return "past";
    }
    if (position === session.cursor) {
      return "current";
    }
    return "future";
  };
  const parents = Array.from({ length: count }, (_, index) =>
    parentOf(session, index)
  );
  const lanes = new Array<number>(count).fill(0);
  // Each lane's occupied spans, as chronological index intervals.
  const occupied: Array<Array<[number, number]>> = [[]];
  const isFree = (lane: number, from: number, to: number) =>
    !(occupied[lane] ?? []).some(([start, end]) => start <= to && from <= end);
  const occupy = (lane: number, from: number, to: number) => {
    (occupied[lane] ??= []).push([from, to]);
  };
  const continued = new Set<number>();

  for (let index = 0; index < count; index += 1) {
    if (pathPosition.has(index)) {
      continue;
    }
    const parent = parents[index];
    const from = parent ?? index;
    let lane = 0;
    if (
      parent !== undefined &&
      !pathPosition.has(parent) &&
      !continued.has(parent) &&
      isFree(lanes[parent]!, parent + 1, index)
    ) {
      lane = lanes[parent]!;
      continued.add(parent);
    } else {
      lane = 1;
      while (lane < MAX_LANES && !isFree(lane, from, index)) {
        lane += 1;
      }
    }
    lanes[index] = lane;
    occupy(lane, from, index);
  }

  const segments = Array.from({ length: count }, () => [] as RailSegment[]);
  const merges = Array.from({ length: count }, () => [] as RailMerge[]);
  const addSegment = (
    row: number,
    lane: number,
    part: "above" | "below" | "both",
    state: TimelineState
  ) => {
    const list = segments[row]!;
    let segment = list.find(
      (candidate) => candidate.lane === lane && candidate.state === state
    );
    if (!segment) {
      segment = { lane, above: false, below: false, state };
      list.push(segment);
    }
    if (part !== "below") {
      segment.above = true;
    }
    if (part !== "above") {
      segment.below = true;
    }
  };

  // Rows run newest first, so a child sits above its parent.
  for (let index = 0; index < count; index += 1) {
    const parent = parents[index];
    if (parent === undefined || parent >= index) {
      continue;
    }
    const lane = lanes[index]!;
    const state = stateOf(index);
    addSegment(index, lane, "below", state);
    for (let between = parent + 1; between < index; between += 1) {
      addSegment(between, lane, "both", state);
    }
    if (lanes[parent] === lane) {
      addSegment(parent, lane, "above", state);
    } else {
      merges[parent]!.push({ fromLane: lane, state });
    }
  }

  const rows: TimelineRow[] = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    rows.push({
      index,
      lane: lanes[index]!,
      state: stateOf(index),
      segments: segments[index]!,
      merges: merges[index]!,
    });
  }
  return rows;
}

/** Counts views, charts, and active filters in a checkpoint. */
export function summarizeTabs(tabs: SavedView[]) {
  let charts = 0;
  let filters = 0;
  for (const tab of tabs) {
    charts += tab.settings?.charts.length ?? 0;
    filters +=
      (tab.settings?.charts.reduce(
        (total, chart) => total + chart.filters.length,
        0
      ) ?? 0) +
      (tab.settings?.rowsSettings?.filters.length ?? 0) +
      (tab.settings?.rowsSettings?.globalSearch ? 1 : 0);
  }
  return { views: tabs.length, charts, filters };
}
