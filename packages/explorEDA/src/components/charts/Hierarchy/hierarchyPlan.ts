import { applyFilter } from "@/hooks/applyFilter";
import type { AggregateContributor } from "@/lib/aggregates";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import { defaultCategoricalColors, makeColorScale } from "@/lib/colorScaleMath";
import type { ThemeColors } from "@/lib/themePalettes";
import {
  isMissingValue,
  numericExclusionReason,
  parseNumber,
} from "@/lib/valueParsing";
import type { datum } from "@/types/ChartTypes";
import type { ColorScaleType } from "@/types/ColorScaleTypes";
import type { Filter, ValueFilter } from "@/types/FilterTypes";
import type { HierarchySettings } from "./definition";

export interface HierarchySnapshot {
  revision: string;
  /** Rows after other filters. */
  liveIds: number[];
  levelData: Record<string, Record<number, datum>>;
  measureData: Record<number, datum>;
  /** A workspace color scale for the first level, when one exists. */
  colorScale?: ColorScaleType;
  themeColors?: ThemeColors;
}

export interface HierarchyNode {
  /** The full path, so equal labels under different parents stay apart. */
  id: string;
  /** 0 for the whole; 1 for the first level. */
  depth: number;
  /** The level field this node splits on; empty for the whole. */
  field: string;
  label: string;
  kind: "root" | "value" | "missing" | "other";
  /** This node's value on its level; null for Other. */
  value: datum;
  /** Values on its level this node stands for. Other lists every member. */
  members: datum[];
  /** Values along the levels from the first down to this node. */
  path: datum[];
  parentId?: string;
  /** Every child, for zoom and totals. */
  children: HierarchyNode[];
  /** The children drawn: the largest few, then one Other for the rest. */
  shown: HierarchyNode[];
  /** Metric over the node's rows. */
  weight: number;
  /** The part of `weight` that passes this chart's selection. */
  selectedWeight: number;
  rowCount: number;
  color: string;
  /** True when every level filter down to this node includes its path. */
  selected: boolean;
  contributors: AggregateContributor[];
}

export interface HierarchyPlan {
  revision: string;
  root: HierarchyNode;
  /** Every node below the whole, parents before children. */
  nodes: HierarchyNode[];
  levelLabels: string[];
  metricLabel: string;
  unit: string;
  hasSelection: boolean;
  /** Live rows left out because a level value is missing. */
  incompleteCount: number;
  /** Rows on a path whose measure could not be used, by reason. */
  excluded: { reason: string; count: number }[];
  liveCount: number;
  scopeNote: string;
}

export interface HierarchyPlanInput {
  settings: HierarchySettings;
  snapshot: HierarchySnapshot;
  getFieldLabel: (field: string) => string;
  formatFieldValue?: (field: string, value: datum) => string;
  unit?: string;
}

const ONE_COLOR = "#3479a8";
const MISSING_COLOR = "#8a94a3";
export const DEFAULT_MAX_CHILDREN = 8;

/**
 * Folds all but the largest `limit` children into one Other node. Missing
 * stays its own node. Folding a single child hides it without saving room,
 * so Other always holds at least two.
 */
function foldChildren(node: HierarchyNode, limit: number) {
  const values = node.children.filter(
    (child) => child.kind !== "missing" && child.weight > 0
  );
  const missing = node.children.filter(
    (child) => child.kind === "missing" && child.weight > 0
  );
  if (values.length <= limit + 1) {
    node.shown = [...values, ...missing];
    return;
  }
  const rest = values.slice(limit);
  const other: HierarchyNode = {
    ...newNode(
      node,
      rest[0]!.field,
      "other",
      `Other (${rest.length})`,
      "other",
      null
    ),
    members: rest.map((child) => child.value),
    weight: rest.reduce((sum, child) => sum + child.weight, 0),
    selectedWeight: rest.reduce((sum, child) => sum + child.selectedWeight, 0),
    rowCount: rest.reduce((sum, child) => sum + child.rowCount, 0),
    contributors: rest.flatMap((child) => child.contributors),
    color: MISSING_COLOR,
  };
  node.shown = [...values.slice(0, limit), other, ...missing];
}

function measureReason(value: datum) {
  const reason = numericExclusionReason(value);
  if (reason) {
    return reason;
  }
  return Number(value) < 0 ? "Negative values cannot be a size" : undefined;
}

function newNode(
  parent: HierarchyNode | undefined,
  field: string,
  key: string,
  label: string,
  kind: HierarchyNode["kind"],
  value: datum
): HierarchyNode {
  return {
    id: parent ? `${parent.id}/${key}` : "root",
    depth: parent ? parent.depth + 1 : 0,
    field,
    label,
    kind,
    value,
    members: [value],
    path: parent ? [...parent.path, value] : [],
    parentId: parent?.id,
    children: [],
    shown: [],
    weight: 0,
    selectedWeight: 0,
    rowCount: 0,
    color: ONE_COLOR,
    selected: false,
    contributors: [],
  };
}

export function planHierarchy({
  settings,
  snapshot,
  getFieldLabel,
  formatFieldValue,
  unit = "rows",
}: HierarchyPlanInput): HierarchyPlan {
  const levels = settings.levels.filter(Boolean);
  const sum = settings.aggregation === "sum" && Boolean(settings.measureField);
  const showMissing = settings.missingLevels === "show";
  const label = (field: string, value: datum) =>
    value == null
      ? "(missing)"
      : formatFieldValue && typeof value !== "string"
        ? formatFieldValue(field, value)
        : categoryLabel(value);

  const root = newNode(undefined, "", "", "All", "root", null);
  const byId = new Map<string, HierarchyNode>([[root.id, root]]);
  const ownFilters = settings.filters.map((filter) => ({
    filter,
    data: snapshot.levelData[filter.field] ?? {},
  }));
  const hasSelection = ownFilters.length > 0;
  const excludedReasons = new Map<string, number>();
  let incompleteCount = 0;

  for (const id of snapshot.liveIds) {
    const path: HierarchyNode[] = [root];
    for (const field of levels) {
      const raw = snapshot.levelData[field]?.[id];
      const missing = isMissingValue(raw);
      if (missing && !showMissing) {
        break;
      }
      const value = missing ? null : categoryValue(raw);
      const key = missing ? "missing" : categoryKey(value);
      const parent = path[path.length - 1]!;
      const nodeId = `${parent.id}/${key}`;
      let node = byId.get(nodeId);
      if (!node) {
        node = newNode(
          parent,
          field,
          key,
          missing ? "(missing)" : label(field, value),
          missing ? "missing" : "value",
          value
        );
        byId.set(nodeId, node);
        parent.children.push(node);
      }
      path.push(node);
    }
    if (path.length <= levels.length) {
      incompleteCount += 1;
      continue;
    }
    const input = sum ? snapshot.measureData[id] : undefined;
    const reason = sum ? measureReason(input) : undefined;
    if (reason) {
      excludedReasons.set(reason, (excludedReasons.get(reason) ?? 0) + 1);
    }
    const weight = reason ? 0 : sum ? parseNumber(input) : 1;
    const selected =
      hasSelection &&
      ownFilters.every(({ filter, data }) => applyFilter(data[id], filter));
    const contributor: AggregateContributor = {
      sourceId: id,
      input: sum ? input : 1,
      included: !reason,
      exclusionReason: reason,
    };
    for (const node of path) {
      node.weight += weight;
      node.rowCount += 1;
      node.contributors.push(contributor);
      if (selected) {
        node.selectedWeight += weight;
      }
    }
  }

  // Largest first within each parent; ties and empty sizes by label.
  const order = (node: HierarchyNode) => {
    node.children.sort(
      (a, b) =>
        Number(a.kind === "missing") - Number(b.kind === "missing") ||
        b.weight - a.weight ||
        a.label.localeCompare(b.label, undefined, { numeric: true })
    );
    foldChildren(
      node,
      Math.max(1, settings.maxChildren ?? DEFAULT_MAX_CHILDREN)
    );
    node.children.forEach(order);
  };
  order(root);

  // Colors: each first-level branch gets one color that its descendants share.
  const resolve = snapshot.colorScale
    ? makeColorScale(snapshot.colorScale)
    : null;
  const palette = snapshot.themeColors?.categorical ?? defaultCategoricalColors;
  root.color = snapshot.themeColors?.mark ?? ONE_COLOR;
  const colorBy = settings.colorBy ?? "branch";
  const one = snapshot.themeColors?.mark ?? ONE_COLOR;
  root.children.forEach((branch, index) => {
    let color = palette[index % palette.length]!;
    if (colorBy === "none") {
      color = one;
    } else if (branch.kind === "missing") {
      color = MISSING_COLOR;
    } else if (resolve) {
      try {
        color = resolve(branch.value);
      } catch {
        // Keep the palette color.
      }
    }
    const paint = (node: HierarchyNode) => {
      node.color =
        node.kind === "missing" || node.kind === "other"
          ? MISSING_COLOR
          : colorBy === "level"
            ? palette[(node.depth - 1) % palette.length]!
            : color;
      node.children.forEach(paint);
      node.shown.forEach((child) => {
        if (child.kind === "other") paint(child);
      });
    };
    paint(branch);
  });

  const nodes: HierarchyNode[] = [];
  const visit = (node: HierarchyNode) => {
    const others = node.shown.filter((child) => child.kind === "other");
    for (const child of [...node.children, ...others]) {
      child.selected = isNodeSelected(settings.filters, child, levels);
      nodes.push(child);
    }
    node.children.forEach(visit);
  };
  visit(root);

  const measureLabel = settings.measureField
    ? getFieldLabel(settings.measureField)
    : "";
  return {
    revision: snapshot.revision,
    root,
    nodes,
    levelLabels: levels.map(getFieldLabel),
    metricLabel: sum ? `Sum of ${measureLabel}` : "Row count",
    unit: sum ? measureLabel : unit,
    hasSelection,
    incompleteCount,
    excluded: [...excludedReasons].map(([reason, count]) => ({
      reason,
      count,
    })),
    liveCount: snapshot.liveIds.length,
    scopeNote:
      "Rows after other filters. Each row is one path, so it counts once at every level.",
  };
}

export interface FocusResolution {
  /** The node drawn as the whole: the focus, or its deepest ancestor with rows. */
  node: HierarchyNode;
  /** Nodes from the first level down to `node`, for breadcrumbs. */
  trail: HierarchyNode[];
  /** Labels of focus values that no longer have rows, below `node`. */
  missing: string[];
}

const keyOf = (value: datum) =>
  value == null ? "missing" : categoryKey(categoryValue(value));

/**
 * Finds the zoomed branch by its values, level by level. A value without
 * rows stops the walk; the rest of the path is kept as missing crumbs so the
 * view returns when the rows do.
 */
export function resolveFocus(
  root: HierarchyNode,
  focus: datum[] | undefined
): FocusResolution {
  const trail: HierarchyNode[] = [];
  let node = root;
  const values = focus ?? [];
  let index = 0;
  for (; index < values.length; index += 1) {
    const key = keyOf(values[index]!);
    const child = node.children.find((item) => item.id === `${node.id}/${key}`);
    // Only a parent can be zoomed into; a leaf has nothing inside it.
    if (!child || child.weight <= 0 || !child.children.length) {
      break;
    }
    trail.push(child);
    node = child;
  }
  return {
    node,
    trail,
    missing: values
      .slice(index)
      .map((value) => (value == null ? "(missing)" : categoryLabel(value))),
  };
}

/**
 * What survives a change of levels. A selection and a zoom are both paths, so
 * each keeps only the part whose levels stay in place. The zoom never
 * reaches the last level, which has nothing inside it.
 */
export function keepForLevels(
  settings: Pick<HierarchySettings, "levels" | "filters" | "focus">,
  levels: string[]
): Pick<HierarchySettings, "filters" | "focus"> {
  const changed = levels.findIndex(
    (field, index) => settings.levels[index] !== field
  );
  const same = changed === -1 ? levels.length : changed;
  const kept = new Set(levels.slice(0, same));
  const focus = (settings.focus ?? []).slice(
    0,
    Math.min(same, levels.length - 1)
  );
  return {
    filters: settings.filters.filter((filter) => kept.has(filter.field)),
    focus: focus.length ? focus : undefined,
  };
}

/** True when a node can fill the chart: it has children to show. */
export function isZoomable(node: HierarchyNode) {
  return (
    node.kind !== "root" && node.children.some((child) => child.weight > 0)
  );
}

/** Each node's share of its parent and of the whole. */
export function shareOf(part: number, whole: number) {
  return whole > 0 ? part / whole : 0;
}

function levelFilter(filters: Filter[], field: string) {
  return filters.find(
    (filter): filter is ValueFilter =>
      filter.type === "value" && filter.field === field
  );
}

const sameKey = (a: datum, b: datum) =>
  categoryKey(categoryValue(a)) === categoryKey(categoryValue(b));

/** True when a level filter holds exactly this one value. */
function isOnly(filter: ValueFilter | undefined, value: datum) {
  return (
    filter !== undefined &&
    filter.values.length === 1 &&
    sameKey(filter.values[0]!, value)
  );
}

/** The values a node needs on each level down to its own. */
function valuesByLevel(node: HierarchyNode): datum[][] {
  return node.path.map((value, index) =>
    index === node.path.length - 1 ? node.members : [value]
  );
}

function isNodeSelected(
  filters: Filter[],
  node: HierarchyNode,
  levels: string[]
) {
  return valuesByLevel(node).every((values, index) => {
    const filter = levelFilter(filters, levels[index]!);
    return (
      filter !== undefined &&
      values.every((value) => applyFilter(value, filter))
    );
  });
}

/** The filters with every level filter removed; other fields stay. */
function withoutLevels(filters: Filter[], levels: string[]) {
  return filters.filter((filter) => !levels.includes(filter.field));
}

/** One value filter per level down to the node: exactly its branch. */
function branchFilters(node: HierarchyNode, levels: string[]): Filter[] {
  return valuesByLevel(node).map((values, index) => ({
    type: "value",
    field: levels[index]!,
    values: [...values],
  }));
}

const sameSet = (a: datum[], b: datum[]) =>
  a.length === b.length &&
  a.every((value) => b.some((item) => sameKey(item, value)));

/** True when the filters select exactly this node's branch and nothing else. */
function isExactBranch(
  filters: Filter[],
  node: HierarchyNode,
  levels: string[]
) {
  const levelFilters = filters.filter((filter) =>
    levels.includes(filter.field)
  );
  return (
    levelFilters.length === node.path.length &&
    valuesByLevel(node).every((values, index) => {
      const filter = levelFilter(filters, levels[index]!);
      return filter !== undefined && sameSet(filter.values, values);
    })
  );
}

export type ToggleResult =
  | { ok: true; filters: Filter[] }
  | { ok: false; reason: string };

/**
 * Selects a node's branch, or clears it when it is already the selection.
 * With `add`, toggles the node among selected siblings under the same parent;
 * a node elsewhere is refused, since independent level filters would also
 * select the pairs in between.
 */
export function toggleBranch(
  filters: Filter[],
  node: HierarchyNode,
  levels: string[],
  add = false
): ToggleResult {
  const rest = withoutLevels(filters, levels);
  const hasLevelFilter = filters.some((filter) =>
    levels.includes(filter.field)
  );
  if (add && hasLevelFilter) {
    const depth = node.path.length;
    const parentPath = node.path.slice(0, -1);
    const deeper = filters.some(
      (filter) => levels.indexOf(filter.field) >= depth
    );
    const sameParent =
      !deeper &&
      parentPath.every((value, index) =>
        isOnly(levelFilter(filters, levels[index]!), value)
      );
    const current = levelFilter(filters, levels[depth - 1]!);
    if (!sameParent) {
      return {
        ok: false,
        reason: "Shift-click adds values under the same parent only.",
      };
    }
    if (!current) {
      // The parent is selected; start a selection among its children.
      return { ok: true, filters: [...rest, ...branchFilters(node, levels)] };
    }
    const inCurrent = (value: datum) =>
      current.values.some((item) => sameKey(item, value));
    const has = node.members.every(inCurrent);
    const values = has
      ? current.values.filter(
          (value) => !node.members.some((member) => sameKey(member, value))
        )
      : [
          ...current.values,
          ...node.members.filter((value) => !inCurrent(value)),
        ];
    if (!values.length) {
      // Removing the last sibling leaves the parent selected.
      return {
        ok: true,
        filters: filters.filter((filter) => filter !== current),
      };
    }
    return {
      ok: true,
      filters: filters.map((filter) =>
        filter === current ? { ...current, values } : filter
      ),
    };
  }
  if (isExactBranch(filters, node, levels)) {
    return { ok: true, filters: rest };
  }
  return { ok: true, filters: [...rest, ...branchFilters(node, levels)] };
}
