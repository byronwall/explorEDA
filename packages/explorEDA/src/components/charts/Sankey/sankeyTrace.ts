import type { TraceTarget } from "../trace/traceTypes";
import type { SankeyLink, SankeyNode, SankeyPlan } from "./sankeyPlan";

interface SankeyTraceBase {
  id: string;
  revision: string;
  metricLabel: string;
  unit: string;
  scale: number;
  hasSelection: boolean;
  scopeNote: string;
}

export interface SankeyNodeTrace extends SankeyTraceBase {
  kind: "sankey-node";
  node: SankeyNode;
  stageLabel: string;
  stageCount: number;
  incoming: SankeyLink[];
  outgoing: SankeyLink[];
}

export interface SankeyLinkTrace extends SankeyTraceBase {
  kind: "sankey-link";
  link: SankeyLink;
  sourceLabel: string;
  targetLabel: string;
  /** Share of the source node's outflow and the target node's inflow. */
  shareOfSource: number;
  shareOfTarget: number;
}

export type SankeyTrace = SankeyNodeTrace | SankeyLinkTrace;

export function resolveSankeyTrace(
  plan: SankeyPlan,
  kind: string,
  id: string
): SankeyTrace | undefined {
  const base = {
    id,
    revision: plan.revision,
    metricLabel: plan.metricLabel,
    unit: plan.unit,
    scale: plan.scale,
    hasSelection: plan.hasSelection,
    scopeNote: plan.scopeNote,
  };
  if (kind === "sankey-node") {
    const node = plan.nodes.find((item) => item.id === id);
    return (
      node && {
        ...base,
        kind,
        node,
        stageLabel: plan.stages[node.stage]!.label,
        stageCount: plan.stages.length,
        incoming: plan.links.filter((link) => link.target.id === id),
        outgoing: plan.links.filter((link) => link.source.id === id),
      }
    );
  }
  if (kind === "sankey-link") {
    const link = plan.links.find((item) => item.id === id);
    return (
      link && {
        ...base,
        kind,
        link,
        sourceLabel: plan.stages[link.stage]!.label,
        targetLabel: plan.stages[link.stage + 1]!.label,
        shareOfSource: link.source.outWeight
          ? link.weight / link.source.outWeight
          : 0,
        shareOfTarget: link.target.inWeight
          ? link.weight / link.target.inWeight
          : 0,
      }
    );
  }
  return undefined;
}

export function sankeyTraceTargets(plan: SankeyPlan): TraceTarget[] {
  return [
    ...plan.nodes.map((node) => ({
      kind: "sankey-node",
      id: node.id,
      label: `Node: ${plan.stages[node.stage]!.label} = ${node.label}`,
    })),
    ...plan.links.map((link) => ({
      kind: "sankey-link",
      id: link.id,
      label: `Link: ${link.source.label} → ${link.target.label}`,
    })),
  ];
}

/** The first link a source row flows through, or its node when there is only one stage. */
export function findSankeyTraceRow(plan: SankeyPlan, id: number) {
  const link = plan.links.find((item) =>
    item.contributors.some((contributor) => contributor.sourceId === id)
  );
  return link && { kind: "sankey-link", id: link.id };
}
