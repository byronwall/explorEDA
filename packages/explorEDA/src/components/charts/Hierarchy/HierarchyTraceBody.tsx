import { AggregateContributorTable } from "../BarChart/GroupedAggregateInspector";
import {
  showTraceValue,
  TraceReadout,
  TraceSection,
  TraceSwatch,
} from "../ChartTraceDetails";
import type { HierarchyTrace } from "./hierarchyTrace";

const round = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });
const share = (part: number, whole: number) =>
  (whole > 0 ? part / whole : 0).toLocaleString("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  });

export function HierarchyTraceBody({ trace }: { trace: HierarchyTrace }) {
  const { node, parent, root } = trace;
  const used = node.contributors.filter((item) => item.included).length;
  const left = node.contributors.length - used;
  const childSum = node.children.reduce((sum, child) => sum + child.weight, 0);
  return (
    <div className="space-y-2" aria-label="Hierarchy node trace">
      <TraceSection heading={trace.path.join(" › ")}>
        <TraceReadout label="Level">
          {node.depth} of {trace.levelLabels.length} · field {node.field}
        </TraceReadout>
        <TraceReadout label="Values">
          {node.kind === "other"
            ? `Other groups ${node.members.length}: ${node.members
                .slice(0, 12)
                .map(showTraceValue)
                .join(", ")}${node.members.length > 12 ? ", …" : ""}`
            : node.kind === "missing"
              ? "Rows with no value for this level"
              : showTraceValue(node.value)}
        </TraceReadout>
        <TraceReadout label={trace.metricLabel}>
          {round(node.weight)} {trace.unit}
        </TraceReadout>
        {parent.depth > 0 && (
          <TraceReadout label={`Of ${parent.label}`}>
            {share(node.weight, parent.weight)}
          </TraceReadout>
        )}
        <TraceReadout label="Of all">
          {share(node.weight, root.weight)}
        </TraceReadout>
        {trace.hasSelection && (
          <TraceReadout label="Selected">
            {round(node.selectedWeight)} (
            {share(node.selectedWeight, node.weight)})
          </TraceReadout>
        )}
      </TraceSection>
      <TraceSection heading="Totals">
        {node.children.length > 0 ? (
          <TraceReadout label="Check">
            {childSum === node.weight
              ? `Equals the sum of its ${node.children.length} children`
              : `Children sum to ${round(childSum)}`}
          </TraceReadout>
        ) : (
          <TraceReadout label="Check">
            {node.kind === "other"
              ? "Sum of the values it groups"
              : "Last level: sum of its rows"}
          </TraceReadout>
        )}
        <TraceReadout label="Fill">
          <TraceSwatch color={node.color} /> {node.color}
        </TraceReadout>
      </TraceSection>
      <TraceSection heading="Rows">
        <TraceReadout label="Rows">
          {node.contributors.length.toLocaleString()} rows
          {left > 0 && ` · ${left} left out of the size`}
        </TraceReadout>
        <AggregateContributorTable
          row={{
            id: node.id,
            groupValue: undefined,
            groupLabel: "",
            value: node.weight,
            rowCount: node.rowCount,
            contributors: node.contributors,
          }}
        />
      </TraceSection>
      <TraceSection muted>
        <div>{trace.scopeNote}</div>
        <div>
          Selecting this box saves one value filter per level down to{" "}
          {node.field}.
        </div>
      </TraceSection>
    </div>
  );
}
