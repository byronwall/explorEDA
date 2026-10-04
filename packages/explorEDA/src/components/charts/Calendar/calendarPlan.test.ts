import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  extendDayFilter,
  planCalendar,
  toggleDayFilter,
  toggleDayRange,
} from "./calendarPlan";
import { resolveCalendarTrace } from "./calendarTrace";
import { calendarDefinition, type CalendarSettings } from "./definition";

const dates: datum[] = [
  "2023-12-31T23:59:59.999Z",
  "2024-01-01",
  "2024-01-01T12:00:00",
  "2024-02-29",
  "2024-12-31",
  "bad",
];
const amounts: datum[] = [4, 10, "n/a", 0, -3, 1];

function settings(extra: Partial<CalendarSettings> = {}): CalendarSettings {
  return {
    ...calendarDefinition.createDefaultSettings({ x: 0, y: 0, w: 12, h: 4 }, "date"),
    id: "cal",
    ...extra,
  };
}

function plan(extra: Partial<CalendarSettings> = {}, width = 900, month?: number) {
  const column = (values: datum[]) => Object.fromEntries(values.map((v, id) => [id, v]));
  return planCalendar({
    settings: settings(extra),
    width,
    height: 260,
    month,
    snapshot: {
      revision: "r1",
      allIds: dates.map((_, id) => id),
      liveIds: dates.map((_, id) => id),
      dateData: column(dates),
      measureData: column(amounts),
    },
    getFieldLabel: (field) => field,
  });
}

const day = (result: ReturnType<typeof plan>, key: string) =>
  result.days.find((item) => item.day === key)!;

describe("planCalendar", () => {
  it("draws every UTC day of the latest year and reports rows it leaves out", () => {
    const result = plan();
    expect(result.view).toBe("year");
    expect(result.year).toBe(2024);
    expect(result.years).toEqual([2023, 2024]);
    expect(result.days).toHaveLength(366);
    expect(day(result, "2024-01-01")).toMatchObject({ state: "value", value: 2 });
    expect(day(result, "2024-01-02")).toMatchObject({ state: "empty", valueText: "No rows" });
    expect(result.omitted).toEqual({ invalidDates: 1, otherYears: 1 });
  });

  it("places days by week column and weekday row from the chosen week start", () => {
    // 1 January 2024 was a Monday.
    expect(day(plan(), "2024-01-01")).toMatchObject({ column: 0, row: 0 });
    expect(day(plan({ weekStart: "sunday" }), "2024-01-01")).toMatchObject({ column: 0, row: 1 });
    expect(day(plan(), "2024-01-08")).toMatchObject({ column: 1, row: 0 });
    expect(plan({ weekStart: "sunday" }).weekdayLabels.map((item) => item.label)).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  });

  it("keeps zero, invalid measures, and negative sums apart", () => {
    const result = plan({ aggregation: "sum", measureField: "amount" });
    expect(day(result, "2024-01-01")).toMatchObject({ state: "value", value: 10 });
    expect(day(result, "2024-02-29")).toMatchObject({ state: "value", value: 0 });
    expect(day(result, "2024-12-31").value).toBe(-3);
    expect(result.scale.kind).toBe("diverging");
    const invalid = plan({ aggregation: "average", measureField: "amount", year: 2023 });
    expect(day(invalid, "2023-12-31")).toMatchObject({ state: "value", value: 4 });
  });

  it("shows the saved year, and selects one day as a one-day date range", () => {
    const earlier = plan({ year: 2023 });
    expect(earlier.days).toHaveLength(365);
    const target = day(earlier, "2023-12-31");
    const filters = toggleDayFilter(settings({ year: 2023 }), earlier, target);
    expect(filters).toEqual([
      { type: "date-range", field: "date", min: "2023-12-31", max: "2023-12-31" },
    ]);
    const filter = calendarDefinition.getFilterFunction(settings({ filters }), () =>
      Object.fromEntries(dates.map((v, id) => [id, v]))
    );
    expect(dates.map((_, id) => id).filter(filter)).toEqual([0]);
    const selected = plan({ year: 2023, filters });
    expect(day(selected, "2023-12-31").selected).toBe(true);
    expect(day(selected, "2023-12-30").selected).toBe(false);
    expect(toggleDayFilter(settings({ filters }), selected, day(selected, "2023-12-31"))).toEqual([]);
  });

  it("switches to one month when a year would not fit", () => {
    const narrow = plan({}, 360);
    expect(narrow.view).toBe("month");
    expect(narrow.month).toBe(11);
    expect(narrow.days).toHaveLength(31);
    const february = plan({}, 360, 1);
    expect(february.days).toHaveLength(29);
    // 1 February 2024 was a Thursday: fourth column when weeks start on Monday.
    expect(day(february, "2024-02-01")).toMatchObject({ row: 0, column: 3 });
  });

  it("explains a day with its interval and contributors", () => {
    const result = plan();
    const trace = resolveCalendarTrace(result, "day", "day:2024-01-01");
    expect(trace?.day.contributors.map((item) => item.sourceId)).toEqual([1, 2]);
    expect(trace?.day.start).toBe(Date.UTC(2024, 0, 1));
  });

  it("stretches a selection with Shift and selects a whole month from its name", () => {
    const base = settings();
    const start = plan();
    const first = toggleDayFilter(base, start, day(start, "2024-02-29"));
    const selected = plan({ filters: first });
    expect(extendDayFilter({ ...base, filters: first }, selected, day(selected, "2024-01-01"))).toEqual([
      { type: "date-range", field: "date", min: "2024-01-01", max: "2024-02-29" },
    ]);
    // Without a selection, Shift selects the one day.
    expect(extendDayFilter(base, start, day(start, "2024-01-01"))).toEqual([
      { type: "date-range", field: "date", min: "2024-01-01", max: "2024-01-01" },
    ]);
    const february = start.monthLabels[1]!;
    expect(february).toMatchObject({ first: "2024-02-01", last: "2024-02-29" });
    const month = toggleDayRange(base, start, february.first, february.last);
    expect(toggleDayRange({ ...base, filters: month }, plan({ filters: month }), february.first, february.last)).toEqual([]);
  });

  it("draws a line between each pair of months in year view", () => {
    const result = plan();
    expect(result.monthBoundaries).toHaveLength(11);
    // 1 February 2024 was a Thursday, so February's edge steps across its first week.
    const cell = result.days[0]!;
    const column = day(result, "2024-02-01").column;
    expect(result.monthBoundaries[0]).toBe(
      `M${(column + 1) * cell.size},0V${3 * cell.height}H${column * cell.size}V${7 * cell.height}`
    );
    expect(plan({}, 360).monthBoundaries).toEqual([]);
  });
});
