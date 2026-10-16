import {
  showTraceValue,
  TraceReadout,
  TraceSection,
} from "../ChartTraceDetails";
import {
  overlapsWindow,
  timelineDuration,
  timelineTime,
  type TimelineInterval,
  type TimelineWindow,
} from "./timelinePlan";
import type { datum } from "@/types/ChartTypes";

export interface TimelineTrace {
  kind: "timeline-interval";
  id: string;
  revision: string;
  interval: TimelineInterval;
  laneLabel: string;
  lane: string;
  startField: string;
  endField: string;
  rawStart: datum;
  rawEnd: datum;
  window?: TimelineWindow;
}

export function TimelineTraceBody({ trace }: { trace: TimelineTrace }) {
  const { interval, window } = trace;
  const inWindow =
    window &&
    overlapsWindow(
      interval.start,
      interval.open ? undefined : interval.end,
      window
    );
  return (
    <div className="space-y-2" aria-label="Timeline trace">
      <TraceSection heading={`${trace.lane} · source row ${interval.id + 1}`}>
        <TraceReadout label={trace.laneLabel}>{trace.lane}</TraceReadout>
        <TraceReadout label="Start">
          {timelineTime(interval.start)} UTC, from {trace.startField} ={" "}
          {showTraceValue(trace.rawStart)}
        </TraceReadout>
        <TraceReadout label="End">
          {interval.open
            ? `No end: ${trace.endField} is blank, so the bar runs to the last time in the data, ${timelineTime(interval.end)}.`
            : `${timelineTime(interval.end)} UTC, from ${trace.endField} = ${showTraceValue(trace.rawEnd)}`}
        </TraceReadout>
        {!interval.open && (
          <TraceReadout label="Length">
            {timelineDuration(interval.end - interval.start)}
          </TraceReadout>
        )}
      </TraceSection>
      {window && (
        <TraceSection heading="Selected window">
          <TraceReadout label="Window">
            {timelineTime(window.min)} to {timelineTime(window.max)}
          </TraceReadout>
          <TraceReadout label="Overlaps">
            {inWindow
              ? "Yes: it starts by the window's end and ends at or after its start."
              : "No: it ends before the window starts or starts after it ends."}
          </TraceReadout>
        </TraceSection>
      )}
      <TraceSection muted>
        A window keeps every row that overlaps it, including rows with no end
        that started by the window&apos;s end. Clicking a bar selects just its
        row.
      </TraceSection>
    </div>
  );
}
