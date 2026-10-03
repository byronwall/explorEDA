import { AggregateContributorTable } from "../BarChart/GroupedAggregateInspector";
import {
  showTraceValue,
  TraceReadout,
  TraceSection,
  TraceSwatch,
} from "../ChartTraceDetails";
import type { SankeyLink, SankeyNode } from "./sankeyPlan";
import type {
  SankeyLinkTrace,
  SankeyNodeTrace,
  SankeyTrace,
} from "./sankeyTrace";

const round = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });
const share = (value: number) =>
  value.toLocaleString("en-US", { style: "percent", maximumFractionDigits: 1 });

function Contributors({
  id,
  item,
}: {
  id: string;
  item: SankeyNode | SankeyLink;
}) {
  const used = item.contributors.filter(
    (contributor) => contributor.included
  ).length;
  const left = item.contributors.length - used;
  return (
    <TraceSection heading="Rows">
      <TraceReadout label="Rows">
        {item.contributors.length.toLocaleString()} rows
        {left > 0 && ` · ${left} left out of the width`}
      </TraceReadout>
      <AggregateContributorTable
        row={{
          id,
          groupValue: undefined,
          groupLabel: "",
          value: item.weight,
          rowCount: item.rowCount,
          contributors: item.contributors,
        }}
      />
    </TraceSection>
  );
}

function NodeBody({ trace }: { trace: SankeyNodeTrace }) {
  const { node } = trace;
  const difference = node.inWeight - node.outWeight;
  return (
    <div className="space-y-2" aria-label="Sankey node trace">
      <TraceSection heading={`${trace.stageLabel} · ${node.label}`}>
        <TraceReadout label="Stage">
          {node.stage + 1} of {trace.stageCount} · field {node.field}
        </TraceReadout>
        <TraceReadout label="Values">
          {node.kind === "other"
            ? `Other groups ${node.members.length}: ${node.members.slice(0, 12).map(showTraceValue).join(", ")}${node.members.length > 12 ? ", …" : ""}`
            : node.kind === "missing"
              ? "Rows with no value for this stage"
              : showTraceValue(node.members[0])}
        </TraceReadout>
        <TraceReadout label={trace.metricLabel}>
          {round(node.weight)} {trace.unit}
        </TraceReadout>
        {trace.hasSelection && (
          <TraceReadout label="Selected">
            {round(node.selectedWeight)} (
            {node.weight ? share(node.selectedWeight / node.weight) : "0%"})
          </TraceReadout>
        )}
      </TraceSection>
      <TraceSection heading="Flow balance">
        <TraceReadout label="In">
          {node.stage === 0
            ? "First stage"
            : `${round(node.inWeight)} from ${trace.incoming.length} links`}
        </TraceReadout>
        <TraceReadout label="Out">
          {node.stage === trace.stageCount - 1
            ? "Last stage"
            : `${round(node.outWeight)} into ${trace.outgoing.length} links`}
        </TraceReadout>
        {node.stage > 0 && node.stage < trace.stageCount - 1 && (
          <TraceReadout label="Check">
            {difference === 0
              ? "In equals out: every row passes through"
              : `In and out differ by ${round(difference)}`}
          </TraceReadout>
        )}
        <TraceReadout label="Height">
          {round(node.height)} px = {round(node.weight)} × {round(trace.scale)}{" "}
          px per unit
        </TraceReadout>
        <TraceReadout label="Fill">
          <TraceSwatch color={node.color} /> {node.color}
        </TraceReadout>
      </TraceSection>
      <Contributors id={node.id} item={node} />
      <TraceSection muted>
        <div>{trace.scopeNote}</div>
        <div>Selecting this node saves {node.field} as one of its values.</div>
      </TraceSection>
    </div>
  );
}

function LinkBody({ trace }: { trace: SankeyLinkTrace }) {
  const { link } = trace;
  return (
    <div className="space-y-2" aria-label="Sankey link trace">
      <TraceSection heading={`${link.source.label} → ${link.target.label}`}>
        <TraceReadout label={trace.sourceLabel}>
          {link.source.label}
        </TraceReadout>
        <TraceReadout label={trace.targetLabel}>
          {link.target.label}
        </TraceReadout>
        <TraceReadout label={trace.metricLabel}>
          {round(link.weight)} {trace.unit}
        </TraceReadout>
        <TraceReadout label="Share">
          {share(trace.shareOfSource)} of what leaves {link.source.label} ·{" "}
          {share(trace.shareOfTarget)} of what reaches {link.target.label}
        </TraceReadout>
        {trace.hasSelection && (
          <TraceReadout label="Selected">
            {round(link.selectedWeight)} (
            {link.weight ? share(link.selectedWeight / link.weight) : "0%"})
          </TraceReadout>
        )}
      </TraceSection>
      <TraceSection heading="Rendered band">
        <TraceReadout label="Width">
          {round(link.thickness)} px = {round(link.weight)} ×{" "}
          {round(trace.scale)} px per unit
        </TraceReadout>
        <TraceReadout label="Ends">
          y {round(link.sy)} px at {link.source.label}, y {round(link.ty)} px at{" "}
          {link.target.label}
        </TraceReadout>
        {link.segments.map((segment) => (
          <TraceReadout key={segment.key} label="Color band">
            <TraceSwatch color={segment.color} /> {round(segment.weight)}{" "}
            {trace.unit}
          </TraceReadout>
        ))}
      </TraceSection>
      <Contributors id={link.id} item={link} />
      <TraceSection muted>
        <div>{trace.scopeNote}</div>
        <div>
          Selecting this link saves one value filter on each of its two stages,
          so linked views show exactly these rows.
        </div>
      </TraceSection>
    </div>
  );
}

export function SankeyTraceBody({ trace }: { trace: SankeyTrace }) {
  return trace.kind === "sankey-node" ? (
    <NodeBody trace={trace} />
  ) : (
    <LinkBody trace={trace} />
  );
}
