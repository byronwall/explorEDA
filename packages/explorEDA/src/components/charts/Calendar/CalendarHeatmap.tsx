import { Button } from "@/components/ui/button";
import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
} from "../ChartStatusLine";
import { ChartMessage } from "../ChartMessage";
import type { BaseChartProps } from "@/types/ChartTypes";
import { formatFieldValue as formatValue } from "@/lib/fieldSettings";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { ChartReadout } from "../ChartReadout";
import { HeatLegend } from "../HeatLegend";
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
  extendDayFilter,
  HEADER_HEIGHT,
  planCalendar,
  toggleDayFilter,
  toggleDayRange,
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

/** The hovered day's values, one line in the panel header. */
function Readout({ day, plan }: { day: CalendarDay; plan: CalendarPlan }) {
  const excluded = day.contributors.filter((item) => !item.included).length;
  const items: [string, string][] = [
    [plan.fieldLabel, day.label],
    [plan.metricLabel, day.valueText],
  ];
  if (day.rowCount > 0) {
    items.push([
      "Rows",
      `${day.rowCount.toLocaleString()}${excluded ? ` (${excluded.toLocaleString()} without a value)` : ""}`,
    ]);
  }
  return (
    <ChartReadout fallbackClassName="eda-chart-readout-inline">
      {items.map(([name, value]) => (
        <span key={name} className="eda-readout-item">
          <span>{name}</span>
          <b>{value}</b>
        </span>
      ))}
    </ChartReadout>
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
  const measureField =
    settings.aggregation === "count" ? undefined : settings.measureField;
  const measureData = useGetColumnData(measureField);
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
      <ChartMessage width={width} height={height}>
        Choose a date field in chart settings.
      </ChartMessage>
    );
  }
  if (plan.years.length === 0) {
    return (
      <ChartMessage width={width} height={height}>
        {plan.fieldLabel} has no readable dates.
      </ChartMessage>
    );
  }

  // Shift stretches the selection over a run of days.
  const select = (day: CalendarDay, extend = false) => {
    if (day.state === "empty" && !extend) {return;}
    updateChart(settings.id, {
      filters: extend
        ? extendDayFilter(settings, plan, day)
        : toggleDayFilter(settings, plan, day),
    });
  };
  const selectRange = (min: string, max: string) =>
    updateChart(settings.id, { filters: toggleDayRange(settings, plan, min, max) });
  const formatLegend = (value: number) =>
    measureField
      ? formatValue(measureField, value, fieldSettings[measureField], { compact: true })
      : formatValue("", value, {}, { compact: true });
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
  const periodRange = isYear
    ? [`${plan.year}-01-01`, `${plan.year}-12-31`]
    : [
        new Date(Date.UTC(plan.year, plan.month, 1)).toISOString().slice(0, 10),
        new Date(Date.UTC(plan.year, plan.month + 1, 0)).toISOString().slice(0, 10),
      ];
  const isRange = (min: string, max: string) =>
    plan.selection?.min === min && plan.selection?.max === max;

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
  const singleSelection = plan.days.filter((day) => day.selected).length === 1;
  const hoveredDay = plan.days.find((day) => day.id === hovered);
  const selectedDays = plan.days.filter((day) => day.selected);
  const rowsIn = (days: CalendarDay[]) =>
    days.reduce((total, day) => total + day.rowCount, 0);
  const selection = plan.selection;
  const selectionText = selection
    ? selection.min && selection.max
      ? selection.min === selection.max
        ? selection.min
        : `${selection.min} to ${selection.max}`
      : selection.min
        ? `from ${selection.min}`
        : `through ${selection.max}`
    : "";
  const statusParts = [
    // Counts lead, so a narrow chart that cuts the line keeps them.
    selectionText &&
      `${rowsIn(selectedDays).toLocaleString()} of ${rowsIn(plan.days).toLocaleString()} rows in ${period} selected: ${selectionText}`,
    plan.omitted.invalidDates > 0 && `${plan.omitted.invalidDates.toLocaleString()} rows have no readable date`,
    plan.omitted.otherYears > 0 && `${plan.omitted.otherYears.toLocaleString()} rows fall in other years`,
  ];
  const statusHint =
    !selectionText &&
    !facetIds &&
    width >= STATUS_HINT_MIN_WIDTH &&
    "Click a day to select, Shift-click to extend";
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
          <Button
            variant="ghost"
            size="sm"
            className="h-7 min-w-12 px-1.5 text-sm font-medium tabular-nums"
            aria-live="polite"
            aria-pressed={isRange(periodRange[0]!, periodRange[1]!)}
            tooltip={`Select every day in ${period}. Click again to clear.`}
            onClick={() => selectRange(periodRange[0]!, periodRange[1]!)}
          >
            {period}
          </Button>
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
        <HeatLegend
          scale={plan.scale}
          metricLabel={plan.metricLabel}
          format={formatLegend}
          hasEmpty={plan.hasEmpty}
          hasInvalid={plan.hasInvalid}
        />
      </div>
      <svg width={width} height={height} className="block select-none">
        <defs>
          <pattern id={`${baseId}-hatch`} width={5} height={5} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={5} stroke="var(--muted-foreground)" strokeWidth={1.2} opacity={0.55} />
          </pattern>
        </defs>
        <g transform={`translate(${plan.margin.left},${plan.margin.top})`}>
          <g className="fill-muted-foreground" fontSize={10} aria-hidden="true">
            {/* A click on a month name selects the whole month. */}
            {plan.monthLabels.map((label) => (
              <text
                key={label.label}
                className="eda-heat-label"
                data-selected={isRange(label.first, label.last)}
                x={label.x}
                y={-5}
                onClick={() => selectRange(label.first, label.last)}
              >
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
              // One selected day is outlined; a larger selection reads from the dimming.
              const active = traced === day.id || (day.selected && singleSelection);
              const dimmed = day.selected === false;
              const isHovered = hovered === day.id;
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
                    className={`chart-mark eda-heat-cell ${day.state === "empty" ? "" : "cursor-pointer"}`}
                    style={{
                      fill: day.state === "invalid" ? `url(#${baseId}-hatch)` : day.fill,
                      stroke:
                        active || (isHovered && day.state !== "empty")
                          ? "var(--foreground)"
                          : day.state === "value" ? "none" : "var(--border)",
                    }}
                    strokeWidth={active ? 2 : isHovered ? 1.5 : 1}
                    strokeDasharray={day.state === "empty" && !active ? "2 2" : undefined}
                    opacity={dimmed && !isHovered ? 0.3 : 1}
                    onPointerEnter={() => setHovered(day.id)}
                    onPointerLeave={() => setHovered((id) => (id === day.id ? null : id))}
                    onFocus={() => setFocused(day.id)}
                    onBlur={() => setHovered((id) => (id === day.id ? null : id))}
                    onClick={(event) => {
                      if (event.altKey) {
                        event.preventDefault();
                        inspect(day.id);
                      } else {select(day, event.shiftKey);}
                    }}
                    onKeyDown={(event) => {
                      if (event.key.startsWith("Arrow")) {
                        event.preventDefault();
                        moveFocus(index, event.key);
                      } else if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (event.altKey && event.key === "Enter") {inspect(day.id);}
                        else {select(day, event.shiftKey);}
                      }
                    }}
                  />
                  {showDayNumbers && (
                    <text
                      x={day.x + 5}
                      y={day.y + 13}
                      fontSize={10}
                      style={day.state === "value" ? { fill: day.textFill } : undefined}
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
          <path
            d={plan.monthBoundaries.join("")}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeOpacity={0.35}
            strokeWidth={1}
            pointerEvents="none"
            aria-hidden="true"
          />
        </g>
      </svg>
      <ChartStatusLine
        parts={statusParts}
        hint={statusHint}
        left={plan.margin.left - (isYear ? 34 : 0)}
        right={plan.margin.right}
      />
      {hoveredDay && <Readout day={hoveredDay} plan={plan} />}
    </div>
  );
}
