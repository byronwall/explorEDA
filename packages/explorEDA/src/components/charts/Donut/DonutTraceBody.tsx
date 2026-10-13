import { AggregateContributorTable } from "../BarChart/GroupedAggregateInspector";
import { TraceReadout, TraceSection } from "../ChartTraceDetails";
import type { DonutSlice } from "./donutPlan";

export interface DonutTrace {
  kind: "donut-slice";
  id: string;
  revision: string;
  owner: string;
  chartId: string;
  slice: DonutSlice;
  fieldLabel: string;
  /** Such as Sum of Revenue or Count of rows. */
  measure: string;
  amountText: string;
  totalText: string;
  shareText: string;
  /** Formats a member's amount. */
  memberTexts: string[];
  showInputs: boolean;
}

export function DonutTraceBody({ trace }: { trace: DonutTrace }) {
  const { slice } = trace;
  return (
    <div className="space-y-2" aria-label="Donut trace">
      <TraceSection heading={slice.label}>
        <TraceReadout label={trace.fieldLabel}>{slice.label}</TraceReadout>
        <TraceReadout label="Value">{trace.amountText}</TraceReadout>
        <TraceReadout label="Share">{trace.shareText}</TraceReadout>
        <TraceReadout label="Calculation">
          {trace.amountText} ÷ {trace.totalText}, the whole of the filtered
          rows.
        </TraceReadout>
        <TraceReadout label="Measure">{trace.measure}</TraceReadout>
      </TraceSection>
      {slice.members && (
        <TraceSection heading="Categories in Other">
          <ul className="space-y-0.5">
            {slice.members.map((member, index) => (
              <li key={index} className="flex justify-between gap-4">
                <span>{member.label}</span>
                <span className="tabular-nums">{trace.memberTexts[index]}</span>
              </li>
            ))}
          </ul>
        </TraceSection>
      )}
      <TraceSection heading="Contributors">
        {slice.row.contributors.length > 0 ? (
          <AggregateContributorTable
            showInputs={trace.showInputs}
            row={{
              id: slice.key,
              groupValue: slice.value,
              groupLabel: slice.label,
              value: slice.row.value,
              rowCount: slice.row.rowCount,
              contributors: slice.row.contributors,
            }}
          />
        ) : (
          <p className="text-muted-foreground">There are no rows here.</p>
        )}
      </TraceSection>
      <TraceSection muted>
        The whole is every row that passes the other charts&apos; filters.
      </TraceSection>
    </div>
  );
}
