import type { TraceTarget } from "../trace/traceTypes";
import type { HierarchyNode, HierarchyPlan } from "./hierarchyPlan";

export interface HierarchyNodeTrace {
  kind: "hierarchy-node";
  id: string;
  revision: string;
  node: HierarchyNode;
  /** Labels from the first level down to the node. */
  path: string[];
  levelLabels: string[];
  parent: HierarchyNode;
  root: HierarchyNode;
  metricLabel: string;
  unit: string;
  hasSelection: boolean;
  scopeNote: string;
}

export type HierarchyTrace = HierarchyNodeTrace;

function ancestry(plan: HierarchyPlan, node: HierarchyNode) {
  const byId = new Map(plan.nodes.map((item) => [item.id, item]));
  const chain: HierarchyNode[] = [];
  let current: HierarchyNode | undefined = node;
  while (current && current.depth > 0) {
    chain.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return chain;
}

export function resolveHierarchyTrace(
  plan: HierarchyPlan,
  kind: string,
  id: string
): HierarchyTrace | undefined {
  if (kind !== "hierarchy-node") return undefined;
  const node = plan.nodes.find((item) => item.id === id);
  if (!node) return undefined;
  const chain = ancestry(plan, node);
  const parent = chain.length > 1 ? chain[chain.length - 2]! : plan.root;
  return {
    kind,
    id,
    revision: plan.revision,
    node,
    path: chain.map((item) => item.label),
    levelLabels: plan.levelLabels,
    parent,
    root: plan.root,
    metricLabel: plan.metricLabel,
    unit: plan.unit,
    hasSelection: plan.hasSelection,
    scopeNote: plan.scopeNote,
  };
}

export function hierarchyTraceTargets(plan: HierarchyPlan): TraceTarget[] {
  return plan.nodes.map((node) => ({
    kind: "hierarchy-node",
    id: node.id,
    label: `Node: ${ancestry(plan, node)
      .map((item) => item.label)
      .join(" › ")}`,
  }));
}

/** The deepest drawn node a source row counts in. */
export function findHierarchyTraceRow(plan: HierarchyPlan, id: number) {
  let found: HierarchyNode | undefined;
  for (const node of plan.nodes) {
    if (
      (!found || node.depth >= found.depth) &&
      node.contributors.some((contributor) => contributor.sourceId === id)
    ) {
      found = node;
    }
  }
  return found && { kind: "hierarchy-node", id: found.id };
}
