import { useId, useMemo, useRef, useState } from "react";
import { scaleUtc } from "d3-scale";
import { useColorScales } from "@/hooks/useColorScales";
import { useBrush } from "@/hooks/useBrush";
import { useThemeColors } from "@/hooks/useDisplayColorScales";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps, datum } from "@/types/ChartTypes";
import type { ValueFilter } from "@/types/FilterTypes";
import { ChartMessage, NO_MATCHING_ROWS } from "../ChartMessage";
import { ChartReadout } from "../ChartReadout";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
  STATUS_LINE_HEIGHT,
} from "../ChartStatusLine";
import {
  useChartTrace,
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import {
  timelineWindow,
  withTimelineWindow,
  type TimelineSettings,
} from "./definition";
import type { TimelineTrace } from "./TimelineTraceBody";
import {
  overlapsWindow,
  planTimeline,
  timelineDuration,
  timelineTime,
  type TimelineInterval,
} from "./timelinePlan";

const HOUR = 3_600_000;
const AXIS_HEIGHT = 20;
const LEGEND_HEIGHT = 20;
const CHAR = 6.2;

export function Timeline({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<TimelineSettings>) {
  const owner = useId();
  const api = useChartTraceApi();
  const trace = useChartTrace();
  const revision = useTraceRevision(settings);
  const liveIds = useGetLiveIds(settings, facetIds);
  const allIds = useGetAllIds(settings);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const nonce = useDataLayer((state) => state.nonce);
  const updateChart = useDataLayer((state) => state.updateChart);
  const { getColorForValue } = useColorScales();
  const themeColors = useThemeColors();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const { field, startField, endField, colorField, colorScaleId } = settings;
  const setupMessage =
    !field || !startField || !endField
      ? "Choose the lane, start, and end fields in chart settings."
      : undefined;

  const plan = useMemo(() => {
    void nonce;
    if (setupMessage) return undefined;
    return planTimeline({
      ids: liveIds,
      allIds,
      lane: getColumnData(field),
      start: getColumnData(startField),
      end: getColumnData(endField),
    });
  }, [
    setupMessage,
    liveIds,
    allIds,
    field,
    startField,
    endField,
    getColumnData,
    nonce,
  ]);

  const colors = useMemo(() => {
    void nonce;
    if (!colorField) return undefined;
    const data = getColumnData(colorField);
    // Categories keep their order of first appearance, as color slots.
    const order = new Map<string, number>();
    for (const id of allIds) {
      const key = categoryKey(categoryValue(data[id]));
      if (!order.has(key)) order.set(key, order.size);
    }
    return { data, order };
  }, [colorField, allIds, getColumnData, nonce]);
  const colorOf = (id: number) => {
    if (!colors) return themeColors.mark;
    const value = colors.data[id];
    if (colorScaleId)
      return getColorForValue(colorScaleId, value, themeColors.mark);
    const slot = colors.order.get(categoryKey(categoryValue(value))) ?? 0;
    return (
      themeColors.categorical[slot % themeColors.categorical.length] ??
      themeColors.mark
    );
  };

  const window = timelineWindow(settings);
  const idFilter = settings.filters.find(
    (filter): filter is ValueFilter =>
      filter.type === "value" && filter.field === "__ID"
  );
  const laneLabel = getFieldLabel(field);

  const source = useMemo((): TraceSource => {
    const currentRevision = `${revision}:${field}:${startField}:${endField}:${plan?.intervals.length}`;
    const find = (id: string) =>
      plan?.intervals.find((item) => String(item.id) === id);
    return {
      role: "chart",
      revision: currentRevision,
      resolve: (kind, id) => {
        if (kind !== "timeline-interval" || !plan) return;
        const interval = find(id);
        if (!interval) return;
        const lane = plan.lanes.find((item) => item.key === interval.laneKey)!;
        const result: TimelineTrace = {
          kind: "timeline-interval",
          id,
          revision: currentRevision,
          interval,
          laneLabel,
          lane: lane.label,
          startField: getFieldLabel(startField),
          endField: getFieldLabel(endField),
          rawStart: getColumnData(startField)[interval.id],
          rawEnd: getColumnData(endField)[interval.id],
          window,
        };
        return result;
      },
      findRow: (row) =>
        plan?.intervals.some((item) => item.id === row)
          ? { kind: "timeline-interval", id: String(row) }
          : undefined,
      targets: () =>
        (plan?.intervals ?? []).map((item) => ({
          kind: "timeline-interval",
          id: String(item.id),
          label: `${plan!.lanes.find((lane) => lane.key === item.laneKey)?.label}: ${timelineTime(item.start)}`,
        })),
    };
    // The window and labels follow settings, which the revision tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    plan,
    revision,
    field,
    startField,
    endField,
    laneLabel,
    window?.min,
    window?.max,
  ]);
  useTraceSource(owner, source);
  const inspect = (id: number) =>
    api?.inspect(owner, "timeline-interval", String(id));
  const traced =
    trace?.selection?.owner === owner ? Number(trace.selection.id) : undefined;

  const labelWidth = Math.round(Math.min(120, Math.max(56, width * 0.16)));
  const margin = {
    top: colorField ? LEGEND_HEIGHT + 4 : 6,
    left: 8 + labelWidth + 8,
    right: 14,
    bottom: AXIS_HEIGHT + STATUS_LINE_HEIGHT + 6,
  };
  const innerWidth = Math.max(40, width - margin.left - margin.right);
  const innerHeight = Math.max(20, height - margin.top - margin.bottom);
  const x = scaleUtc()
    .domain(plan?.domain ?? [0, 1])
    .range([0, innerWidth]);

  const brush = useBrush({
    svgRef,
    marginLeft: margin.left,
    marginTop: margin.top,
    innerWidth,
    innerHeight,
    mode: plan?.domain ? "horizontal" : "none",
    defaultExtent: window
      ? [
          [Math.max(0, x(window.min)), 0],
          [Math.min(innerWidth, x(window.max)), innerHeight],
        ]
      : null,
    onBrushChange: (extent) => {
      if (!extent) {
        updateChart(settings.id, {
          filters: withTimelineWindow(settings, undefined),
        });
        return;
      }
      // Whole hours read well in filter chips.
      const round = (time: number) => Math.round(time / HOUR) * HOUR;
      const min = round(x.invert(extent[0][0]).getTime());
      const max = round(x.invert(extent[1][0]).getTime());
      updateChart(settings.id, {
        filters: withTimelineWindow(settings, {
          min,
          max: Math.max(max, min + HOUR),
        }),
      });
    },
    // Bars select themselves on click; anything else is empty space.
    onPlotClick: (_, event) =>
      Boolean((event.target as Element).closest?.("[data-interval]")),
    onDeadClick: () => {
      if (settings.filters.length) updateChart(settings.id, { filters: [] });
    },
  });

  if (setupMessage) {
    return (
      <ChartMessage width={width} height={height}>
        {setupMessage}
      </ChartMessage>
    );
  }
  if (!plan?.domain || plan.lanes.length === 0) {
    return (
      <ChartMessage width={width} height={height}>
        {allIds.length > 0
          ? "No row has a lane and a readable start."
          : NO_MATCHING_ROWS}
      </ChartMessage>
    );
  }

  const laneHeight = innerHeight / plan.lanes.length;
  const barHeight = Math.max(3, Math.min(18, laneHeight * 0.66));
  const laneIndex = new Map(plan.lanes.map((lane, index) => [lane.key, index]));
  const ticks = x.ticks(Math.max(2, Math.floor(innerWidth / 90)));
  const tickFormat = x.tickFormat();
  const selectedIds = new Set(idFilter?.values ?? []);
  const isSelected = (item: TimelineInterval) =>
    (!window ||
      overlapsWindow(item.start, item.open ? undefined : item.end, window)) &&
    (!idFilter || selectedIds.has(item.id));
  const hasSelection = Boolean(window || idFilter);
  const select = (item: TimelineInterval) => {
    const rest = settings.filters.filter((filter) => filter !== idFilter);
    const same = idFilter?.values.length === 1 && selectedIds.has(item.id);
    updateChart(settings.id, {
      filters: same
        ? rest
        : [...rest, { type: "value", field: "__ID", values: [item.id] }],
    });
  };

  const hoveredItem =
    hovered === null
      ? undefined
      : plan.intervals.find((item) => item.id === hovered);
  const selectedCount = hasSelection
    ? plan.intervals.filter(isSelected).length
    : 0;
  const openCount = plan.intervals.filter((item) => item.open).length;
  const statusParts = [
    hasSelection
      ? `${selectedCount.toLocaleString()} of ${plan.intervals.length.toLocaleString()} rows selected`
      : `${plan.intervals.length.toLocaleString()} rows in ${plan.lanes.length} lanes`,
    window && `${timelineTime(window.min)} to ${timelineTime(window.max)}`,
    openCount > 0 && `${openCount} with no end`,
    ...plan.excluded.map(
      (item) => `${item.count.toLocaleString()} ${item.reason} left out`
    ),
  ];
  const statusHint =
    !hasSelection &&
    !facetIds &&
    width >= STATUS_HINT_MIN_WIDTH &&
    "Drag across time to select · click a bar";
  const legend = colors
    ? [...colors.order.keys()].slice(0, 8).map((key) => {
        const id = allIds.find(
          (row) => categoryKey(categoryValue(colors.data[row])) === key
        )!;
        return {
          key,
          label: categoryLabel(categoryValue(colors.data[id])),
          color: colorOf(id),
        };
      })
    : [];

  return (
    <div
      className="relative"
      style={{ width, height }}
      onPointerLeave={() => setHovered(null)}
    >
      {hoveredItem && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          <span className="eda-readout-item">
            <span>{laneLabel}</span>
            <b>{plan.lanes[laneIndex.get(hoveredItem.laneKey)!]!.label}</b>
          </span>
          <span className="eda-readout-item">
            <span>Start</span>
            <b>{timelineTime(hoveredItem.start)}</b>
          </span>
          <span className="eda-readout-item">
            <span>End</span>
            <b>{hoveredItem.open ? "No end" : timelineTime(hoveredItem.end)}</b>
          </span>
          {!hoveredItem.open && (
            <span className="eda-readout-item">
              <span>Length</span>
              <b>{timelineDuration(hoveredItem.end - hoveredItem.start)}</b>
            </span>
          )}
          {colorField && (
            <span className="eda-readout-item">
              <span>{getFieldLabel(colorField)}</span>
              <b>
                {categoryLabel(
                  categoryValue(colors!.data[hoveredItem.id] as datum)
                )}
              </b>
            </span>
          )}
        </ChartReadout>
      )}
      {legend.length > 0 && (
        <div
          className="absolute flex items-center gap-3 overflow-hidden whitespace-nowrap text-[11px] text-muted-foreground"
          style={{
            top: 0,
            left: margin.left,
            right: margin.right,
            height: LEGEND_HEIGHT,
          }}
          aria-label={`${getFieldLabel(colorField!)} legend`}
        >
          {legend.map((item) => (
            <span key={item.key} className="inline-flex items-center gap-1">
              <span
                className="inline-block size-2.5 rounded-sm"
                style={{ background: item.color }}
                aria-hidden="true"
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="block select-none"
        role="group"
        aria-label={`${laneLabel} timeline`}
        tabIndex={0}
        style={{ cursor: brush.getCursor(), touchAction: "none" }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && window) {
            event.stopPropagation();
            brush.clear();
          }
        }}
        onPointerDownCapture={(event) => {
          if (!event.altKey) brush.handlePointerDown(event);
        }}
        onPointerMoveCapture={brush.handlePointerMove}
        onPointerUpCapture={brush.handlePointerUp}
        onPointerCancel={brush.cancel}
        onLostPointerCapture={brush.cancel}
      >
        <g pointerEvents="none" fontSize={11}>
          {plan.lanes.map((lane, index) => (
            <g key={lane.key}>
              {index % 2 === 0 && (
                <rect
                  x={margin.left}
                  y={margin.top + index * laneHeight}
                  width={innerWidth}
                  height={laneHeight}
                  fill="var(--muted)"
                  opacity={0.45}
                />
              )}
              {laneHeight >= 9 && (
                <text
                  x={8 + labelWidth}
                  y={margin.top + index * laneHeight + laneHeight / 2}
                  textAnchor="end"
                  dominantBaseline="central"
                  className="fill-foreground"
                  fontSize={Math.min(11, laneHeight - 1)}
                >
                  {lane.label.length * CHAR > labelWidth
                    ? `${lane.label.slice(0, Math.max(2, Math.floor(labelWidth / CHAR) - 1))}…`
                    : lane.label}
                </text>
              )}
            </g>
          ))}
          {ticks.map((tick) => (
            <g
              key={tick.getTime()}
              transform={`translate(${margin.left + x(tick)},0)`}
            >
              <line
                y1={margin.top}
                y2={margin.top + innerHeight}
                stroke="var(--border)"
              />
              <text
                y={margin.top + innerHeight + 14}
                textAnchor="middle"
                className="fill-muted-foreground"
              >
                {tickFormat(tick)}
              </text>
            </g>
          ))}
        </g>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {brush.renderBrush}
          {plan.intervals.map((item) => {
            const lane = laneIndex.get(item.laneKey)!;
            const x0 = x(item.start);
            const w = Math.max(2, x(item.end) - x0);
            const y = lane * laneHeight + (laneHeight - barHeight) / 2;
            const selected = isSelected(item);
            const emphasis = hovered === item.id || traced === item.id;
            const color = colorOf(item.id);
            return (
              <rect
                key={item.id}
                data-interval={item.id}
                x={x0}
                y={y}
                width={w}
                height={barHeight}
                rx={Math.min(3, barHeight / 3)}
                fill={color}
                fillOpacity={
                  hasSelection && !selected ? 0.18 : item.open ? 0.45 : 0.82
                }
                stroke={
                  emphasis || (idFilter && selected)
                    ? "var(--foreground)"
                    : item.open
                      ? color
                      : "none"
                }
                strokeWidth={emphasis || (idFilter && selected) ? 1.5 : 1}
                strokeDasharray={item.open && !emphasis ? "3 2" : undefined}
                className="chart-mark cursor-pointer outline-none"
                role="button"
                tabIndex={-1}
                aria-pressed={Boolean(idFilter && selected)}
                aria-label={`${plan.lanes[lane]!.label}: ${timelineTime(item.start)} to ${item.open ? "no end" : timelineTime(item.end)}`}
                onPointerEnter={() => setHovered(item.id)}
                onPointerLeave={() =>
                  setHovered((id) => (id === item.id ? null : id))
                }
                onClick={(event) => {
                  event.stopPropagation();
                  if (event.altKey) inspect(item.id);
                  else select(item);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (event.altKey) inspect(item.id);
                    else select(item);
                  }
                }}
              />
            );
          })}
        </g>
      </svg>
      <ChartStatusLine
        parts={statusParts}
        hint={statusHint}
        left={8}
        right={margin.right}
        bottom={4}
      />
    </div>
  );
}
