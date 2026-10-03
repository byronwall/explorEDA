import { Button } from "@/components/ui/button";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
import { interpolateBlues, interpolateRdBu } from "d3-scale-chromatic";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import {
  useChartTrace,
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import { useGetColumnData } from "../useGetColumnData";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import {
  HEADER_HEIGHT,
  planCalendar,
  toggleDayFilter,
  type CalendarDay,
  type CalendarPlan,
} from "./calendarPlan";
import {
  calendarTraceTargets,
  findCalendarTraceRow,
  resolveCalendarTrace,
} from "./calendarTrace";
import type { CalendarSettings } from "./definition";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function Legend({ plan, id }: { plan: CalendarPlan; id: string }) {
  const [low, high] = plan.scale.domain;
  const span = Math.max(Math.abs(low), Math.abs(high)) || 1;
  const color = (t: number) =>
    plan.scale.kind === "diverging"
      ? interpolateRdBu(t)
      : interpolateBlues(0.12 + t * 0.8);
  const format = (value: number) =>
    value.toLocaleString("en-US", {
      maximumFractionDigits: Math.abs(value) >= 10_000 ? 1 : 2,
      notation: Math.abs(value) >= 10_000 ? "compact" : "standard",
    });
  const lowText = format(plan.scale.kind === "diverging" ? -span : low);
  const highText = format(plan.scale.kind === "diverging" ? span : high);
  return (
    <div className="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap text-[11px] text-muted-foreground" aria-hidden="true">
      <span>{lowText}</span>
      <svg width={72} height={10}>
        <defs>
          <linearGradient id={id}>
            {Array.from({ length: 9 }, (_, i) => i / 8).map((t) => (
              <stop key={t} offset={`${t * 100}%`} stopColor={color(t)} />
            ))}
          </linearGradient>
        </defs>
        <rect width={72} height={10} rx={2} fill={`url(#${id})`} />
      </svg>
      <span>{highText}</span>
      {plan.hasEmpty && (
        <span className="ml-2 hidden items-center gap-1 sm:inline-flex">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px] border border-dashed border-border" />
          No rows
        </span>
      )}
    </div>
  );
}

function Readout({ day, plan }: { day: CalendarDay; plan: CalendarPlan }) {
  const excluded = day.contributors.filter((item) => !item.included).length;
  return (
    <div
      className="pointer-events-none absolute bottom-1 right-2 max-w-[min(18rem,80%)] rounded border border-border bg-card/95 px-2 py-1 text-xs text-card-foreground shadow-sm"
      role="status"
    >
      <div>{day.label}</div>
      <div>
        {plan.metricLabel}: {day.valueText}
        {day.rowCount > 0 &&
          ` · ${day.rowCount.toLocaleString()} rows${excluded ? `, ${excluded} without a valid value` : ""}`}
      </div>
      {day.state !== "empty" && (
        <div className="text-muted-foreground">Click to select · Alt-click to inspect</div>
      )}
    </div>
  );
}

export function CalendarHeatmap({ settings, width, height, facetIds }: BaseChartProps<CalendarSettings>) {
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const formatFieldValue = useDataLayer((s) => s.formatFieldValue);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const updateChart = useDataLayer((s) => s.updateChart);
  const liveIds = useGetLiveIds(settings, facetIds);
  const allIds = useGetAllIds();
  const dateData = useGetColumnData(settings.field);
  const measureData = useGetColumnData(
    settings.aggregation === "count" ? undefined : settings.measureField
  );
  const revision = useTraceRevision(settings);
  const trace = useChartTrace();
  const traceApi = useChartTraceApi();
  const owner = useId();
  const baseId = useId().replace(/:/g, "");
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const cellRefs = useRef(new Map<string, SVGRectElement>());

  const plan = useMemo(
    () =>
      planCalendar({
        settings,
        width,
        height,
        month,
        snapshot: { revision, allIds, liveIds, dateData, measureData },
        getFieldLabel,
        formatFieldValue,
      }),
    // Label and format getters are stable; field settings carry their changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, width, height, month, revision, allIds, liveIds, dateData, measureData, fieldSettings]
  );

  const source = useMemo(
    (): TraceSource => ({
      role: "chart",
      revision: plan.revision,
      resolve: (kind, id) => resolveCalendarTrace(plan, kind, id),
      findRow: (id) => findCalendarTraceRow(plan, id),
      targets: () => calendarTraceTargets(plan),
    }),
    [plan]
  );
  useTraceSource(owner, source);
  const inspect = useCallback(
    (id: string) => traceApi?.inspect(owner, "day", id),
    [owner, traceApi]
  );
  const traced = trace?.selection?.owner === owner ? trace.selection.id : undefined;

  if (!settings.field) {
    return (
      <div className="flex items-center justify-center p-4 text-center text-sm text-muted-foreground" style={{ width, height }}>
        Choose a date field in chart settings.
      </div>
    );
  }
  if (plan.years.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-center text-sm text-muted-foreground" style={{ width, height }}>
        {plan.fieldLabel} has no readable dates.
      </div>
    );
  }

  const select = (day: CalendarDay) => {
    if (day.state === "empty") {return;}
    updateChart(settings.id, { filters: toggleDayFilter(settings, plan, day) });
  };
  const yearIndex = plan.years.indexOf(plan.year);
  const isYear = plan.view === "year";
  const step = (direction: -1 | 1) => {
    if (isYear) {
      const next = plan.years[yearIndex + direction];
      if (next !== undefined) {updateChart(settings.id, { year: next } as Partial<CalendarSettings>);}
      return;
    }
    const next = plan.month + direction;
    if (next >= 0 && next <= 11) {setMonth(next);}
    else {
      const year = plan.years[yearIndex + direction];
      if (year === undefined) {return;}
      updateChart(settings.id, { year } as Partial<CalendarSettings>);
      setMonth(direction === 1 ? 0 : 11);
    }
  };
  const canStep = (direction: -1 | 1) =>
    isYear
      ? plan.years[yearIndex + direction] !== undefined
      : (direction === -1 ? plan.month > 0 : plan.month < 11) ||
        plan.years[yearIndex + direction] !== undefined;
  const period = isYear ? String(plan.year) : `${MONTH_NAMES[plan.month]} ${plan.year}`;
  const unit = isYear ? "year" : "month";

  const tabStop =
    (focused && plan.days.some((day) => day.id === focused) ? focused : undefined) ??
    plan.days.find((day) => day.selected)?.id ??
    plan.days.find((day) => day.state !== "empty")?.id ??
    plan.days[0]?.id;
  // Arrow keys move by day along the reading direction and by week across it.
  const moveFocus = (index: number, key: string) => {
    const byDay = isYear ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"];
    const forward = key === "ArrowDown" || key === "ArrowRight";
    const delta = (byDay.includes(key) ? 1 : 7) * (forward ? 1 : -1);
    const next = plan.days[index + delta];
    if (!next) {return;}
    setFocused(next.id);
    setHovered(next.id);
    cellRefs.current.get(next.id)?.focus();
  };
  const hoveredDay = plan.days.find((day) => day.id === hovered);
  const footnote = [
    plan.omitted.invalidDates > 0 && `${plan.omitted.invalidDates.toLocaleString()} rows have no readable date`,
    plan.omitted.otherYears > 0 && `${plan.omitted.otherYears.toLocaleString()} rows fall in other years`,
  ].filter(Boolean).join(" · ");
  const showDayNumbers = !isYear && plan.days[0]!.height >= 18;

  return (
    <div className="relative" style={{ width, height }}>
      <div
        className="absolute flex items-center gap-3"
        style={{ left: plan.margin.left - (isYear ? 34 : 0), top: 2, height: HEADER_HEIGHT - 4, right: plan.margin.right }}
      >
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={`Previous ${unit}`}
            tooltip={`Show the previous ${unit}`}
            disabled={!canStep(-1)}
            onClick={() => step(-1)}
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-12 whitespace-nowrap text-center text-sm font-medium tabular-nums" aria-live="polite">
            {period}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={`Next ${unit}`}
            tooltip={`Show the next ${unit}`}
            disabled={!canStep(1)}
            onClick={() => step(1)}
          >
            <ChevronRight />
          </Button>
        </div>
        <Legend plan={plan} id={`${baseId}-calendar`} />
      </div>
      <svg width={width} height={height} className="block select-none">
        <defs>
          <pattern id={`${baseId}-hatch`} width={5} height={5} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={5} stroke="var(--muted-foreground)" strokeWidth={1.2} opacity={0.55} />
          </pattern>
        </defs>
        <g transform={`translate(${plan.margin.left},${plan.margin.top})`}>
          <g className="fill-muted-foreground" fontSize={10} aria-hidden="true">
            {plan.monthLabels.map((label) => (
              <text key={label.label} x={label.x} y={-5}>
                {label.label}
              </text>
            ))}
            {plan.weekdayLabels.map((label) =>
              isYear ? (
                <text key={label.label} x={-6} y={label.position} textAnchor="end" dominantBaseline="middle">
                  {label.label}
                </text>
              ) : (
                <text key={label.label} x={label.position} y={-5} textAnchor="middle">
                  {label.label}
                </text>
              )
            )}
          </g>
          <g role="group" aria-label={`${plan.metricLabel} by day of ${plan.fieldLabel}, ${period}`}>
            {plan.days.map((day, index) => {
              const active = traced === day.id || day.selected;
              const dimmed = day.selected === false;
              return (
                <g key={day.id}>
                  <rect
                    ref={(node) => {
                      if (node) {cellRefs.current.set(day.id, node);}
                      else {cellRefs.current.delete(day.id);}
                    }}
                    data-plan-id={day.id}
                    x={day.x + 1}
                    y={day.y + 1}
                    width={Math.max(0, day.size - 2)}
                    height={Math.max(0, day.height - 2)}
                    rx={2}
                    role="button"
                    tabIndex={day.id === tabStop ? 0 : -1}
                    aria-label={`${day.label}: ${day.valueText}`}
                    aria-pressed={day.selected === true}
                    aria-disabled={day.state === "empty" || undefined}
                    className={`chart-mark ${day.state === "empty" ? "" : "cursor-pointer"}`}
                    fill={day.state === "invalid" ? `url(#${baseId}-hatch)` : day.fill}
                    stroke={active ? "var(--foreground)" : day.state === "value" ? "none" : "var(--border)"}
                    strokeWidth={active ? 2 : 1}
                    strokeDasharray={day.state === "empty" && !active ? "2 2" : undefined}
                    opacity={dimmed ? 0.3 : 1}
                    onPointerEnter={() => setHovered(day.id)}
                    onPointerLeave={() => setHovered((id) => (id === day.id ? null : id))}
                    onFocus={() => setFocused(day.id)}
                    onBlur={() => setHovered((id) => (id === day.id ? null : id))}
                    onClick={(event) => {
                      if (event.altKey) {
                        event.preventDefault();
                        inspect(day.id);
                      } else {select(day);}
                    }}
                    onKeyDown={(event) => {
                      if (event.key.startsWith("Arrow")) {
                        event.preventDefault();
                        moveFocus(index, event.key);
                      } else if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (event.altKey && event.key === "Enter") {inspect(day.id);}
                        else {select(day);}
                      }
                    }}
                  />
                  {showDayNumbers && (
                    <text
                      x={day.x + 5}
                      y={day.y + 13}
                      fontSize={10}
                      fill={day.textFill}
                      className={day.state === "value" ? undefined : "fill-muted-foreground"}
                      opacity={dimmed ? 0.4 : 1}
                      pointerEvents="none"
                      aria-hidden="true"
                    >
                      {day.dayOfMonth}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </g>
        {footnote && (
          <text x={plan.margin.left - (isYear ? 34 : 0)} y={height - 4} fontSize={11} className="fill-muted-foreground">
            {footnote}
          </text>
        )}
      </svg>
      {hoveredDay && <Readout day={hoveredDay} plan={plan} />}
    </div>
  );
}
