import { applyFilter } from "@/hooks/applyFilter";
import type { AggregateContributor } from "@/lib/aggregates";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import { defaultCategoricalColors, makeColorScale } from "@/lib/colorScaleMath";
import { isMissingValue, numericExclusionReason } from "@/lib/numeric";
import type { datum } from "@/types/ChartTypes";
import type { ColorScaleType } from "@/types/ColorScaleTypes";
import type { Filter, ValueFilter } from "@/types/FilterTypes";
import type { SankeySettings } from "./definition";

export interface SankeySnapshot {
  revision: string;
  /** Every source row. Node ranking uses them so order holds while filtering. */
  allIds: number[];
  /** Rows after other charts' filters. */
  liveIds: number[];
  stageData: Record<string, Record<number, datum>>;
  measureData: Record<number, datum>;
  /** A workspace color scale for the first stage, when one exists. */
  colorScale?: ColorScaleType;
}

export interface SankeyNode {
  id: string;
  stage: number;
  field: string;
  key: string;
  label: string;
  /** Values this node stands for. Other lists every member it groups. */
  members: datum[];
  kind: "value" | "other" | "missing";
  /** Metric over drawn rows. */
  weight: number;
  /** The part of `weight` that passes this chart's selection. */
  selectedWeight: number;
  rowCount: number;
  inWeight: number;
  outWeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  /** True when the stage's filter includes this node; undefined without one. */
  selected: boolean | undefined;
  contributors: AggregateContributor[];
}

export interface SankeySegment {
  key: string;
  color: string;
  weight: number;
  selectedWeight: number;
  /** Offsets within the link band. */
  offset: number;
  thickness: number;
}

export interface SankeyLink {
  id: string;
  stage: number;
  source: SankeyNode;
  target: SankeyNode;
  weight: number;
  selectedWeight: number;
  rowCount: number;
  /** Top of the band at the source and target nodes. */
  sy: number;
  ty: number;
  thickness: number;
  segments: SankeySegment[];
  selected: boolean;
  contributors: AggregateContributor[];
}

export interface SankeyStage {
  index: number;
  field: string;
  label: string;
  x: number;
  nodes: SankeyNode[];
  /** Values folded into this stage's Other node. */
  otherCount: number;
}

export interface SankeyPlan {
  revision: string;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  plotWidth: number;
  plotHeight: number;
  nodeWidth: number;
  /** Pixels per unit of the metric. */
  scale: number;
  stages: SankeyStage[];
  nodes: SankeyNode[];
  links: SankeyLink[];
  metricLabel: string;
  unit: string;
  totalWeight: number;
  selectedWeight: number;
  hasSelection: boolean;
  /** Rows after other filters that this chart draws as complete paths. */
  drawnRows: number;
  /** Live rows left out because a stage value is missing. */
  incompleteIds: number[];
  /** Rows on a path whose measure could not be used, by reason. */
  excluded: { reason: string; count: number }[];
  liveCount: number;
  flowLegend: { key: string; label: string; color: string }[];
  scopeNote: string;
}

export interface SankeyPlanInput {
  settings: SankeySettings;
  width: number;
  height: number;
  snapshot: SankeySnapshot;
  getFieldLabel: (field: string) => string;
  formatFieldValue?: (field: string, value: datum) => string;
  unit?: string;
}

export const STAGE_HEADER_HEIGHT = 22;
export const STATUS_HEIGHT = 20;
const NODE_WIDTH = 12;
const OTHER_KEY = "__other__";
const ONE_COLOR = "#3479a8";

function measureReason(value: datum) {
  const reason = numericExclusionReason(value);
  if (reason) {
    return reason;
  }
  return Number(value) < 0 ? "Negative values cannot be a flow" : undefined;
}

export function planSankey({
  settings,
  width,
  height,
  snapshot,
  getFieldLabel,
  formatFieldValue,
  unit = "rows",
}: SankeyPlanInput): SankeyPlan {
  const stages = settings.stages.filter(Boolean);
  const sum = settings.aggregation === "sum" && Boolean(settings.measureField);
  const showMissing = settings.missingStages === "show";
  const label = (field: string, value: datum) =>
    value == null
      ? "(missing)"
      : formatFieldValue && typeof value !== "string"
        ? formatFieldValue(field, value)
        : categoryLabel(value);

  // Rank each stage's values over all rows; the top ones get their own node.
  const ranks = stages.map((field) => {
    const data = snapshot.stageData[field] ?? {};
    const counts = new Map<string, { value: datum; total: number }>();
    for (const id of snapshot.allIds) {
      const raw = data[id];
      if (isMissingValue(raw)) {
        continue;
      }
      const value = categoryValue(raw);
      const key = categoryKey(value);
      const item = counts.get(key);
      if (item) {
        item.total += 1;
      } else {
        counts.set(key, { value, total: 1 });
      }
    }
    const ranked = [...counts]
      .map(([key, item]) => ({ key, ...item, label: label(field, item.value) }))
      .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
    // Folding a single value into Other hides it without saving room.
    const limit = Math.max(1, settings.maxNodesPerStage);
    const shown = ranked.length > limit + 1 ? ranked.slice(0, limit) : ranked;
    const other = ranked.slice(shown.length);
    if (settings.nodeOrder === "label") {
      shown.sort((a, b) =>
        typeof a.value === "number" && typeof b.value === "number"
          ? a.value - b.value
          : a.label.localeCompare(b.label, undefined, { numeric: true })
      );
    }
    return {
      order: new Map(shown.map((item, index) => [item.key, index])),
      shown,
      other,
      otherKeys: new Set(other.map((item) => item.key)),
    };
  });

  const nodeMap = new Map<string, SankeyNode>();
  const linkMap = new Map<
    string,
    SankeyLink & { segmentMap: Map<string, SankeySegment> }
  >();
  const ownFilters = settings.filters.map((filter) => ({
    filter,
    data: snapshot.stageData[filter.field] ?? {},
  }));
  const hasSelection = ownFilters.length > 0;
  const incompleteIds: number[] = [];
  const excludedReasons = new Map<string, number>();
  let drawnRows = 0;
  let totalWeight = 0;
  let selectedWeight = 0;

  const nodeFor = (stage: number, raw: datum): SankeyNode | undefined => {
    const field = stages[stage]!;
    const rank = ranks[stage]!;
    let key: string;
    let kind: SankeyNode["kind"] = "value";
    if (isMissingValue(raw)) {
      if (!showMissing) {
        return undefined;
      }
      key = "__missing__";
      kind = "missing";
    } else {
      key = categoryKey(categoryValue(raw));
      if (rank.otherKeys.has(key)) {
        key = OTHER_KEY;
        kind = "other";
      }
    }
    const id = `node:${stage}:${key}`;
    let node = nodeMap.get(id);
    if (!node) {
      node = {
        id,
        stage,
        field,
        key,
        label:
          kind === "missing"
            ? "(missing)"
            : kind === "other"
              ? `Other (${rank.other.length})`
              : label(field, categoryValue(raw)),
        members:
          kind === "other"
            ? rank.other.map((item) => item.value)
            : kind === "missing"
              ? [null]
              : [categoryValue(raw)],
        kind,
        weight: 0,
        selectedWeight: 0,
        rowCount: 0,
        inWeight: 0,
        outWeight: 0,
        x: 0,
        y: 0,
        width: NODE_WIDTH,
        height: 0,
        color: ONE_COLOR,
        selected: undefined,
        contributors: [],
      };
      nodeMap.set(id, node);
    }
    return node;
  };

  for (const id of snapshot.liveIds) {
    const path: SankeyNode[] = [];
    for (let stage = 0; stage < stages.length; stage += 1) {
      const node = nodeFor(stage, snapshot.stageData[stages[stage]!]?.[id]);
      if (!node) {
        break;
      }
      path.push(node);
    }
    if (path.length < stages.length) {
      incompleteIds.push(id);
      continue;
    }
    drawnRows += 1;
    const input = sum ? snapshot.measureData[id] : undefined;
    const reason = sum ? measureReason(input) : undefined;
    if (reason) {
      excludedReasons.set(reason, (excludedReasons.get(reason) ?? 0) + 1);
    }
    const weight = reason ? 0 : sum ? Number(input) : 1;
    const selected =
      hasSelection &&
      ownFilters.every(({ filter, data }) => applyFilter(data[id], filter));
    const contributor: AggregateContributor = {
      sourceId: id,
      // A counted row adds exactly one to every node and link it passes.
      input: sum ? input : 1,
      included: !reason,
      exclusionReason: reason,
    };
    totalWeight += weight;
    if (selected) {
      selectedWeight += weight;
    }
    const colorKey = path[0]!.id;
    path.forEach((node, stage) => {
      node.weight += weight;
      node.rowCount += 1;
      node.contributors.push(contributor);
      if (selected) {
        node.selectedWeight += weight;
      }
      const next = path[stage + 1];
      if (!next) {
        return;
      }
      node.outWeight += weight;
      next.inWeight += weight;
      const linkId = `link:${stage}:${node.key}>${next.key}`;
      let link = linkMap.get(linkId);
      if (!link) {
        link = {
          id: linkId,
          stage,
          source: node,
          target: next,
          weight: 0,
          selectedWeight: 0,
          rowCount: 0,
          sy: 0,
          ty: 0,
          thickness: 0,
          segments: [],
          selected: false,
          contributors: [],
          segmentMap: new Map(),
        };
        linkMap.set(linkId, link);
      }
      link.weight += weight;
      link.rowCount += 1;
      link.contributors.push(contributor);
      if (selected) {
        link.selectedWeight += weight;
      }
      const segmentKey =
        settings.flowColor === "first"
          ? colorKey
          : settings.flowColor === "source"
            ? node.id
            : "all";
      let segment = link.segmentMap.get(segmentKey);
      if (!segment) {
        segment = {
          key: segmentKey,
          color: ONE_COLOR,
          weight: 0,
          selectedWeight: 0,
          offset: 0,
          thickness: 0,
        };
        link.segmentMap.set(segmentKey, segment);
      }
      segment.weight += weight;
      if (selected) {
        segment.selectedWeight += weight;
      }
    });
  }

  // Layout: stage columns left to right, nodes stacked by rank.
  const margin = {
    top: settings.margin.top + STAGE_HEADER_HEIGHT,
    right: settings.margin.right,
    bottom: settings.margin.bottom + STATUS_HEIGHT,
    left: settings.margin.left,
  };
  const plotWidth = Math.max(0, width - margin.left - margin.right);
  const plotHeight = Math.max(0, height - margin.top - margin.bottom);
  const columnGap =
    stages.length > 1 ? (plotWidth - NODE_WIDTH) / (stages.length - 1) : 0;
  const rankOf = (node: SankeyNode) =>
    node.kind === "value"
      ? (ranks[node.stage]!.order.get(node.key) ?? 0)
      : node.kind === "other"
        ? 1e6
        : 1e6 + 1;
  const stagePlans: SankeyStage[] = stages.map((field, index) => ({
    index,
    field,
    label: getFieldLabel(field),
    x: index * columnGap,
    nodes: [...nodeMap.values()]
      .filter((node) => node.stage === index && node.rowCount > 0)
      .sort((a, b) => rankOf(a) - rankOf(b)),
    otherCount: ranks[index]!.other.length,
  }));
  const padding = Math.max(2, Math.min(12, plotHeight * 0.04));
  const scale = Math.max(
    0,
    Math.min(
      ...stagePlans.map((stage) => {
        const weight = stage.nodes.reduce(
          (total, node) => total + node.weight,
          0
        );
        const room = plotHeight - padding * Math.max(0, stage.nodes.length - 1);
        return weight > 0 ? room / weight : Infinity;
      }),
      Infinity
    )
  );
  const k = Number.isFinite(scale) ? scale : 0;
  // A node with rows but no usable measure still needs a visible sliver.
  const minHeight = 1;
  for (const stage of stagePlans) {
    const used =
      stage.nodes.reduce(
        (total, node) => total + Math.max(minHeight, node.weight * k),
        0
      ) +
      padding * Math.max(0, stage.nodes.length - 1);
    let y = Math.max(0, (plotHeight - used) / 2);
    for (const node of stage.nodes) {
      node.x = stage.x;
      node.y = y;
      node.height = Math.max(minHeight, node.weight * k);
      y += node.height + padding;
    }
  }

  // Colors: a workspace scale for the first stage when present, else a palette by rank.
  const resolve = snapshot.colorScale
    ? makeColorScale(snapshot.colorScale)
    : null;
  const colorIndex = new Map<string, string>();
  for (const stage of stagePlans) {
    stage.nodes.forEach((node, index) => {
      let color =
        defaultCategoricalColors[index % defaultCategoricalColors.length]!;
      if (node.kind !== "value") {
        color = "#8a94a3";
      } else if (stage.index === 0 && resolve) {
        try {
          color = resolve(node.members[0]);
        } catch {
          // Keep the palette color.
        }
      }
      if (settings.flowColor === "none") {
        color = ONE_COLOR;
      }
      node.color = color;
      colorIndex.set(node.id, color);
    });
  }

  // Stack links at each node in the order of the node at their other end.
  const links = [...linkMap.values()].filter((link) => link.rowCount > 0);
  const outgoing = new Map<string, typeof links>();
  const incoming = new Map<string, typeof links>();
  for (const link of links) {
    (
      outgoing.get(link.source.id) ??
      outgoing.set(link.source.id, []).get(link.source.id)!
    ).push(link);
    (
      incoming.get(link.target.id) ??
      incoming.set(link.target.id, []).get(link.target.id)!
    ).push(link);
  }
  for (const node of nodeMap.values()) {
    let sy = node.y;
    for (const link of (outgoing.get(node.id) ?? []).sort(
      (a, b) => a.target.y - b.target.y
    )) {
      link.thickness = link.weight * k;
      link.sy = sy;
      sy += link.thickness;
    }
    let ty = node.y;
    for (const link of (incoming.get(node.id) ?? []).sort(
      (a, b) => a.source.y - b.source.y
    )) {
      link.ty = ty;
      ty += link.weight * k;
    }
  }
  const segmentOrder = (key: string) => nodeMap.get(key)?.y ?? 0;
  const filterFor = (field: string) =>
    settings.filters.find(
      (filter): filter is ValueFilter =>
        filter.type === "value" && filter.field === field
    );
  for (const node of nodeMap.values()) {
    const filter = filterFor(node.field);
    node.selected = filter
      ? node.members.some((member) => applyFilter(member, filter))
      : undefined;
  }
  const plannedLinks: SankeyLink[] = links.map(({ segmentMap, ...link }) => {
    let offset = 0;
    const segments = [...segmentMap.values()]
      .sort((a, b) => segmentOrder(a.key) - segmentOrder(b.key))
      .map((segment) => {
        const thickness = segment.weight * k;
        const planned = {
          ...segment,
          color: colorIndex.get(segment.key) ?? ONE_COLOR,
          offset,
          thickness,
        };
        offset += thickness;
        return planned;
      });
    return {
      ...link,
      segments,
      selected: Boolean(link.source.selected && link.target.selected),
    };
  });

  const measureLabel = settings.measureField
    ? getFieldLabel(settings.measureField)
    : "";
  const legendNodes = stagePlans[0]?.nodes ?? [];
  return {
    revision: snapshot.revision,
    width,
    height,
    margin,
    plotWidth,
    plotHeight,
    nodeWidth: NODE_WIDTH,
    scale: k,
    stages: stagePlans,
    nodes: stagePlans.flatMap((stage) => stage.nodes),
    links: plannedLinks,
    metricLabel: sum ? `Sum of ${measureLabel}` : "Row count",
    unit: sum ? measureLabel : unit,
    totalWeight,
    selectedWeight,
    hasSelection,
    drawnRows,
    incompleteIds,
    excluded: [...excludedReasons].map(([reason, count]) => ({
      reason,
      count,
    })),
    liveCount: snapshot.liveIds.length,
    flowLegend:
      settings.flowColor === "first"
        ? legendNodes.map((node) => ({
            key: node.id,
            label: node.label,
            color: node.color,
          }))
        : [],
    scopeNote:
      "Rows after other chart filters. Each row is one path, so it counts once at every stage.",
  };
}

const sameValues = (a: datum[], b: datum[]) =>
  a.length === b.length &&
  a.every((value) =>
    b.some(
      (other) =>
        categoryKey(categoryValue(other)) === categoryKey(categoryValue(value))
    )
  );

function fieldFilter(filters: Filter[], field: string) {
  return filters.find(
    (filter): filter is ValueFilter =>
      filter.type === "value" && filter.field === field
  );
}

function withoutField(filters: Filter[], field: string) {
  return filters.filter((filter) => filter.field !== field);
}

/**
 * Selects a node's values on its stage, or clears them when they are already
 * the stage's selection. With `add`, toggles the node within the stage's values.
 */
export function toggleNodeFilters(
  filters: Filter[],
  node: SankeyNode,
  add = false
): Filter[] {
  const current = fieldFilter(filters, node.field);
  const rest = withoutField(filters, node.field);
  if (add && current) {
    const has = node.members.every((member) => applyFilter(member, current));
    const values = has
      ? current.values.filter(
          (value) =>
            !node.members.some(
              (member) =>
                categoryKey(categoryValue(member)) ===
                categoryKey(categoryValue(value))
            )
        )
      : [...current.values, ...node.members];
    return values.length
      ? [...rest, { type: "value", field: node.field, values }]
      : rest;
  }
  if (current && sameValues(current.values, node.members)) {
    return rest;
  }
  return [
    ...rest,
    { type: "value", field: node.field, values: [...node.members] },
  ];
}

/** Selects exactly one link's two stage values, or clears them when already selected. */
export function toggleLinkFilters(
  filters: Filter[],
  link: SankeyLink
): Filter[] {
  const source = fieldFilter(filters, link.source.field);
  const target = fieldFilter(filters, link.target.field);
  const rest = withoutField(
    withoutField(filters, link.source.field),
    link.target.field
  );
  if (
    source &&
    target &&
    sameValues(source.values, link.source.members) &&
    sameValues(target.values, link.target.members)
  ) {
    return rest;
  }
  return [
    ...rest,
    {
      type: "value",
      field: link.source.field,
      values: [...link.source.members],
    },
    {
      type: "value",
      field: link.target.field,
      values: [...link.target.members],
    },
  ];
}

/** SVG path for a band between two nodes, from `y0` at the source to `y1` at the target. */
export function bandPath(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  thickness: number
) {
  const mid = (x0 + x1) / 2;
  const t = Math.max(0.5, thickness);
  return [
    `M${x0},${y0}`,
    `C${mid},${y0} ${mid},${y1} ${x1},${y1}`,
    `L${x1},${y1 + t}`,
    `C${mid},${y1 + t} ${mid},${y0 + t} ${x0},${y0 + t}`,
    "Z",
  ].join("");
}
