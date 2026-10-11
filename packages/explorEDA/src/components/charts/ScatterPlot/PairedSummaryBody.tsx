import { TraceReadout, TraceSection } from "../ChartTraceDetails";
import type { PairedStats, PairedSummaryPlan } from "./pairedSummary";

const show = (value: number | undefined) =>
  value === undefined ? "undefined" : String(Number(value.toPrecision(4)));

function Stats({
  stats,
  xLabel,
  yLabel,
}: {
  stats: PairedStats;
  xLabel: string;
  yLabel: string;
}) {
  return (
    <TraceSection
      heading={stats.kind === "pooled" ? "All rows, pooled" : stats.label}
    >
      <TraceReadout label="Pairs">
        {stats.pairs.toLocaleString()} of {stats.eligible.toLocaleString()}
        {stats.missingX + stats.missingY > 0 &&
          ` · ${[
            stats.missingX && `${stats.missingX} without ${xLabel}`,
            stats.missingY && `${stats.missingY} without ${yLabel}`,
          ]
            .filter(Boolean)
            .join(", ")}`}
      </TraceReadout>
      <TraceReadout label={`${xLabel} mean ± SD`}>
        {show(stats.meanX)} ± {show(stats.sdX)}
      </TraceReadout>
      <TraceReadout label={`${yLabel} mean ± SD`}>
        {show(stats.meanY)} ± {show(stats.sdY)}
      </TraceReadout>
      {stats.covariance && (
        <div className="space-y-0.5">
          <div className="text-muted-foreground">Sample covariance</div>
          <table className="w-full table-fixed text-right font-mono tabular-nums">
            <thead className="text-muted-foreground">
              <tr>
                <th className="w-1/4" aria-label="Field" />
                <th className="truncate font-normal">X</th>
                <th className="truncate font-normal">Y</th>
              </tr>
            </thead>
            <tbody>
              {stats.covariance.map((row, i) => (
                <tr key={i}>
                  <th className="text-left font-normal text-muted-foreground">
                    {i ? "Y" : "X"}
                  </th>
                  {row.map((value, j) => (
                    <td key={j}>{show(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <TraceReadout label="Pearson r">{show(stats.r)}</TraceReadout>
      {stats.note && <p className="text-muted-foreground">{stats.note}</p>}
    </TraceSection>
  );
}

/** Means, spreads, covariance, and correlation for the analysis population. */
export function PairedSummaryBody({
  trace,
}: {
  trace: {
    summary: PairedSummaryPlan;
    xLabel: string;
    yLabel: string;
  };
}) {
  const { summary, xLabel, yLabel } = trace;
  return (
    <div className="space-y-3 text-xs" aria-label="Paired summary">
      <div className="eda-trace-subject">
        <span className="font-semibold">Paired summary</span>
        {summary.facet && (
          <span className="text-muted-foreground">{summary.facet}</span>
        )}
      </div>
      <p className="text-muted-foreground">
        X is {xLabel}; Y is {yLabel}. Rows
        {summary.facet ? " in this facet" : ""} that pass the other filters and
        have numeric values for both. Selecting points on this chart does not
        change these numbers. Spread and covariance divide by n − 1.
      </p>
      {summary.notice && <p>{summary.notice}</p>}
      {summary.pooled && (
        <Stats stats={summary.pooled} xLabel={xLabel} yLabel={yLabel} />
      )}
      {summary.groups.map((stats) => (
        <Stats key={stats.id} stats={stats} xLabel={xLabel} yLabel={yLabel} />
      ))}
    </div>
  );
}
