import type { TraceTarget } from "../trace/traceTypes";
import type { CalendarDay, CalendarPlan } from "./calendarPlan";

export interface CalendarTrace {
  kind: "day";
  id: string;
  revision: string;
  day: CalendarDay;
  fieldLabel: string;
  metricLabel: string;
  scale: CalendarPlan["scale"];
  omitted: CalendarPlan["omitted"];
  scopeNote: string;
}

/** Explains one planned day. Returns undefined when the plan no longer draws it. */
export function resolveCalendarTrace(
  plan: CalendarPlan,
  kind: string,
  id: string
): CalendarTrace | undefined {
  if (kind !== "day") {return undefined;}
  const day = plan.days.find((item) => item.id === id);
  return (
    day && {
      kind: "day",
      id,
      revision: plan.revision,
      day,
      fieldLabel: plan.fieldLabel,
      metricLabel: plan.metricLabel,
      scale: plan.scale,
      omitted: plan.omitted,
      scopeNote: plan.scopeNote,
    }
  );
}

export function calendarTraceTargets(plan: CalendarPlan): TraceTarget[] {
  return plan.days
    .filter((day) => day.state !== "empty")
    .map((day) => ({ kind: "day", id: day.id, label: `Day: ${day.label}` }));
}

export function findCalendarTraceRow(plan: CalendarPlan, id: number) {
  const day = plan.days.find((item) =>
    item.contributors.some((contributor) => contributor.sourceId === id)
  );
  return day && { kind: "day", id: day.id };
}
