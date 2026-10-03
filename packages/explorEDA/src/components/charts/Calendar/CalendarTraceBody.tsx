import { describeHeatPosition } from "../heatScale";
import { AggregateContributorTable } from "../BarChart/GroupedAggregateInspector";
import { TraceMarkGeometry, TraceReadout, TraceSection } from "../ChartTraceDetails";
import type { CalendarTrace } from "./calendarTrace";

export function CalendarTraceBody({ trace }: { trace: CalendarTrace }) {
  const { day, scale, omitted } = trace;
  const included = day.contributors.filter((item) => item.included).length;
  const excluded = day.contributors.length - included;
  const end = new Date(day.start + 86_400_000).toISOString();
  return (
    <div className="space-y-2" aria-label="Calendar day trace">
      <TraceSection heading={`Day · ${day.label}`}>
        <TraceReadout label="Interval">
          {new Date(day.start).toISOString()} up to {end} (UTC)
        </TraceReadout>
        <TraceReadout label="Date field">{trace.fieldLabel}</TraceReadout>
        <TraceReadout label="Metric">{trace.metricLabel}</TraceReadout>
        <TraceReadout label="Result">{day.valueText}</TraceReadout>
      </TraceSection>
      <TraceSection heading="Rendered day">
        <TraceMarkGeometry label="Cell geometry" geometry={{ ...day, width: day.size }} />
        <TraceReadout label="Fill">
          {day.state === "value" ? (
            <>
              <span className="inline-block h-3 w-3 align-middle" style={{ background: day.fill }} />{" "}
              {describeHeatPosition(day.position, scale)}
            </>
          ) : (
            "No fill; the day has no valid value"
          )}
        </TraceReadout>
        <TraceReadout label="Color domain">{scale.population}</TraceReadout>
      </TraceSection>
      <TraceSection heading="Contributors">
        <TraceReadout label="Rows">
          {included} of {day.contributors.length} used
          {excluded > 0 && ` · ${excluded} excluded`}
        </TraceReadout>
        {day.contributors.length > 0 && (
          <AggregateContributorTable
            row={{
              id: day.id,
              groupValue: day.day,
              groupLabel: day.label,
              value: day.value,
              rowCount: day.rowCount,
              contributors: day.contributors,
            }}
          />
        )}
      </TraceSection>
      <TraceSection muted>
        <div>{trace.scopeNote}</div>
        {omitted.invalidDates > 0 && (
          <div>{omitted.invalidDates} rows have no readable date and are not drawn.</div>
        )}
      </TraceSection>
    </div>
  );
}
