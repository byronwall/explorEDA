import { cellKey, dayOf } from "@/lib/annotations/cells";
import type { AnnotationFrame, PlottedRecord } from "@/lib/annotations/resolve";
import type { AnnotationKeyValue } from "@/lib/annotations/types";
import type { ChartAnnotationFrame } from "../annotations/ChartAnnotations";
import type { CalendarPlan } from "./calendarPlan";

/**
 * What a calendar offers annotations: callouts on a day, named by its date
 * as `on=date:2016-12-16` or `category=2016-12-16`. The grid has no value
 * axis, so lines and bands have no place on it.
 */
export function calendarAnnotationFrame(
  plan: CalendarPlan,
  dateField: string,
  facetKey?: string
): ChartAnnotationFrame {
  const plotWidth = Math.max(
    0,
    plan.width - plan.margin.left - plan.margin.right
  );
  const plotHeight = Math.max(
    0,
    plan.height - plan.margin.top - plan.margin.bottom
  );
  const days = new Map(plan.days.map((day) => [day.day, day]));
  const dayAt = (
    stored: AnnotationKeyValue
  ): PlottedRecord | "invalid" | "offscreen" => {
    const name = dayOf(stored);
    if (!name) return "invalid";
    const day = days.get(name);
    // A day outside the year or month on view has no cell now.
    if (!day) return "offscreen";
    return {
      x: day.x + day.size / 2,
      y: day.y + day.height / 2,
      selected: day.selected !== false,
    };
  };
  const cell: AnnotationFrame["cell"] = (attach) => {
    const key = cellKey(attach, [dateField]);
    if (!key) return "unsupported";
    return dayAt(key[0]!);
  };
  // The grid has no value axis, so lines and bands report unsupported.
  const band = (size: number) => ({
    type: "band" as const,
    domain: [],
    range: [0, size] as [number, number],
    padding: 0,
  });
  return {
    xScale: band(plotWidth),
    yScale: band(plotHeight),
    plotWidth,
    plotHeight,
    facetKey,
    category: ({ value }) => {
      const point = dayAt(value);
      return typeof point === "string" ? undefined : point;
    },
    cell,
  };
}
