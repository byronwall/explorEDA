import { useId, useMemo, useRef, useState } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
import { ChartMessage, NO_MATCHING_ROWS } from "../ChartMessage";
import { ChartReadout } from "../ChartReadout";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
  STATUS_LINE_HEIGHT,
} from "../ChartStatusLine";
import { HeatLegend } from "../HeatLegend";
import { isEmptyPlotTarget } from "../emptyPlotClick";
import { heatFill, heatText, type HeatScale } from "../heatScale";
import {
  useChartTrace,
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import { retentionSelectionFilter, type RetentionSettings } from "./definition";
import type { RetentionTrace } from "./RetentionTraceBody";
import {
  planRetention,
  type RetentionCell,
  type RetentionCohort,
  type RetentionPeriod,
} from "./retentionPlan";

const LEGEND_HEIGHT = 26;
const HEADER_HEIGHT = 18;
const MIN_ROW = 11;
const MAX_ROW = 26;
/** Shares always span 0 to 100%, so a color means the same rate anywhere. */
const SCALE: HeatScale = { kind: "sequential", domain: [0, 1] };

export const retentionPercent = (rate: number) =>
  rate.toLocaleString("en-US", { style: "percent", maximumFractionDigits: 0 });

const PERIOD_NAMES: Record<RetentionPeriod, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
};

export function cohortLabel(start: number, period: RetentionPeriod) {
  return new Date(start).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    ...(period === "month" ? { year: "numeric" } : { day: "numeric" }),
  });
}

export function Retention({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<RetentionSettings>) {
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
  const [hovered, setHovered] = useState<string | null>(null);
  const refs = useRef(new Map<string, SVGRectElement>());
  const patternId = `${useId()}-partial`;

  const {
    entityField,
    timeField,
    field,
    entryEvent,
    activityEvents,
    period,
    periods,
  } = settings;
  const setupMessage =
    !entityField || !timeField
      ? "Choose the entity and time fields in chart settings."
      : (entryEvent !== undefined || activityEvents?.length) && !field
        ? "Choose the event field in chart settings, or count every event."
        : undefined;

  const plan = useMemo(() => {
    void nonce;
    if (setupMessage) return undefined;
    return planRetention({
      ids: liveIds,
      allIds,
      entity: getColumnData(entityField),
      time: getColumnData(timeField),
      event: field ? getColumnData(field) : undefined,
      entryEvent,
      activityEvents,
      period,
      periods: Math.max(1, periods),
    });
  }, [
    setupMessage,
    liveIds,
    allIds,
    entityField,
    timeField,
    field,
    entryEvent,
    activityEvents,
    period,
    periods,
    getColumnData,
    nonce,
  ]);

  const entityLabel = getFieldLabel(entityField);
  const periodName = PERIOD_NAMES[period];
  const findCell = (id: string) => {
    for (const cohort of plan?.cohorts ?? []) {
      const cell = cohort.cells.find((item) => item.id === id);
      if (cell) return { cohort, cell };
    }
    return undefined;
  };

  const source = useMemo((): TraceSource => {
    const currentRevision = `${revision}:${period}:${periods}:${String(entryEvent)}:${(activityEvents ?? []).map(String).join("|")}:${plan?.cohorts.length}`;
    return {
      role: "chart",
      revision: currentRevision,
      resolve: (kind, id) => {
        if (kind !== "retention-cell") return;
        const found = findCell(id);
        if (!found) return;
        const result: RetentionTrace = {
          kind: "retention-cell",
          id,
          revision: currentRevision,
          cohortLabel: cohortLabel(found.cohort.start, period),
          cohortSize: found.cohort.size,
          cell: found.cell,
          periodName,
          entityLabel,
          entryText:
            entryEvent === undefined
              ? "its first event"
              : `its first ${String(entryEvent)} event`,
          activityText: activityEvents?.length
            ? activityEvents.map(String).join(", ")
            : "any event",
          lastTime: plan?.lastTime,
          excluded: plan?.excluded ?? [],
        };
        return result;
      },
      findRow: (row) => {
        for (const cohort of plan?.cohorts ?? []) {
          const cell = cohort.cells.find((item) => item.rows.includes(row));
          if (cell) return { kind: "retention-cell", id: cell.id };
        }
        return undefined;
      },
      targets: () =>
        (plan?.cohorts ?? []).flatMap((cohort) =>
          cohort.cells
            .filter((cell) => cell.observed)
            .map((cell) => ({
              kind: "retention-cell",
              id: cell.id,
              label: `${cohortLabel(cohort.start, period)}, ${periodName} ${cell.period}`,
            }))
        ),
    };
    // findCell reads the plan, which the dependencies cover.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    plan,
    revision,
    period,
    periods,
    entryEvent,
    activityEvents,
    entityLabel,
  ]);
  useTraceSource(owner, source);
  const inspect = (id: string) => api?.inspect(owner, "retention-cell", id);
  const traced =
    trace?.selection?.owner === owner ? trace.selection.id : undefined;

  if (setupMessage) {
    return (
      <ChartMessage width={width} height={height}>
        {setupMessage}
      </ChartMessage>
    );
  }
  if (!plan || plan.cohorts.length === 0) {
    return (
      <ChartMessage width={width} height={height}>
        {liveIds.length > 0
          ? "No entity has an entry event with a readable time."
          : NO_MATCHING_ROWS}
      </ChartMessage>
    );
  }

  const selection = retentionSelectionFilter(settings);
  const selectedId = selection ? settings.selectedCell : undefined;
  const select = (cell: RetentionCell) => {
    const rest = settings.filters.filter((filter) => filter !== selection);
    if (selectedId === cell.id || cell.active === 0) {
      updateChart(settings.id, { filters: rest, selectedCell: undefined });
      return;
    }
    updateChart(settings.id, {
      filters: [
        ...rest,
        { type: "value", field: entityField, values: [...cell.entities] },
      ],
      selectedCell: cell.id,
    });
  };

  const labelWidth = period === "month" ? 64 : 52;
  const sizeWidth = 44;
  const left = 8 + labelWidth + sizeWidth + 4;
  const top = LEGEND_HEIGHT + HEADER_HEIGHT;
  const bottom = STATUS_LINE_HEIGHT + 6;
  const plotWidth = Math.max(40, width - left - 10);
  const cellWidth = plotWidth / plan.summary.length;
  // The newest cohorts show when there are more than fit.
  const room = height - top - bottom - 4;
  const fit = Math.max(1, Math.floor(room / MIN_ROW) - 1);
  const cohorts = plan.cohorts.slice(-fit);
  const rowHeight = Math.min(MAX_ROW, room / (cohorts.length + 1.4));
  const summaryY = top + cohorts.length * rowHeight + rowHeight * 0.4;
  const showText = cellWidth >= 30 && rowHeight >= 13;
  const headerText = (index: number) =>
    cellWidth >= 58 ? `${periodName} ${index}` : String(index);

  const cellAt = (cohort: RetentionCohort, cell: RetentionCell, y: number) => {
    const x = left + cell.period * cellWidth;
    if (!cell.observed) return null;
    const isSelected = selectedId === cell.id;
    const isTraced = traced === cell.id;
    const dimmed = selectedId !== undefined && !isSelected;
    const label = `${cohortLabel(cohort.start, period)} cohort, ${periodName} ${cell.period}: ${retentionPercent(cell.rate)}, ${cell.active.toLocaleString()} of ${cohort.size.toLocaleString()}${cell.partial ? ", partial period" : ""}`;
    return (
      <g key={cell.id} opacity={dimmed ? 0.35 : 1}>
        <rect
          x={x + 1}
          y={y + 1}
          width={Math.max(0, cellWidth - 2)}
          height={Math.max(0, rowHeight - 2)}
          rx={2}
          style={{ fill: heatFill(cell.rate, "sequential") }}
          pointerEvents="none"
        />
        {cell.partial && (
          <rect
            x={x + 1}
            y={y + 1}
            width={Math.max(0, cellWidth - 2)}
            height={Math.max(0, rowHeight - 2)}
            rx={2}
            fill={`url(#${patternId})`}
            pointerEvents="none"
          />
        )}
        {showText && (
          <text
            x={x + cellWidth / 2}
            y={y + rowHeight / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.min(11, rowHeight - 3)}
            style={{ fill: heatText(cell.rate) }}
            pointerEvents="none"
          >
            {retentionPercent(cell.rate)}
          </text>
        )}
        <rect
          ref={(element) => {
            if (element) refs.current.set(cell.id, element);
            else refs.current.delete(cell.id);
          }}
          x={x + 0.5}
          y={y + 0.5}
          width={Math.max(0, cellWidth - 1)}
          height={Math.max(0, rowHeight - 1)}
          rx={2}
          fill="transparent"
          stroke={
            isSelected || isTraced || hovered === cell.id
              ? "var(--foreground)"
              : "none"
          }
          strokeWidth={isSelected || isTraced ? 1.5 : 1}
          className="chart-mark cursor-pointer outline-none"
          role="button"
          tabIndex={
            cell.id === (selectedId ?? cohorts[0]!.cells[0]!.id) ? 0 : -1
          }
          aria-pressed={isSelected}
          aria-label={label}
          onPointerEnter={() => setHovered(cell.id)}
          onPointerLeave={() =>
            setHovered((id) => (id === cell.id ? null : id))
          }
          onFocus={() => setHovered(cell.id)}
          onClick={(event) => {
            event.stopPropagation();
            if (event.altKey) inspect(cell.id);
            else select(cell);
          }}
          onKeyDown={(event) => {
            const moves: Record<string, [number, number]> = {
              ArrowLeft: [0, -1],
              ArrowRight: [0, 1],
              ArrowUp: [-1, 0],
              ArrowDown: [1, 0],
            };
            const move = moves[event.key];
            if (move) {
              event.preventDefault();
              const row = cohorts.indexOf(cohort) + move[0];
              const target = cohorts[row]?.cells[cell.period + move[1]];
              if (target?.observed) refs.current.get(target.id)?.focus();
            } else if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              if (event.altKey) inspect(cell.id);
              else select(cell);
            }
          }}
        />
      </g>
    );
  };

  const hoveredCell = hovered ? findCell(hovered) : undefined;
  const hidden = plan.cohorts.length - cohorts.length;
  const selectedCell = selectedId ? findCell(selectedId) : undefined;
  const statusParts = [
    `${plan.entities.toLocaleString()} entered in ${plan.cohorts.length} ${plan.cohorts.length === 1 ? "cohort" : "cohorts"}`,
    selectedCell &&
      `${selectedCell.cell.active.toLocaleString()} selected: ${cohortLabel(selectedCell.cohort.start, period)}, ${periodName} ${selectedCell.cell.period}`,
    hidden > 0 && `newest ${cohorts.length} of ${plan.cohorts.length} shown`,
    ...plan.excluded.map(
      (item) => `${item.count.toLocaleString()} ${item.reason}`
    ),
  ];
  const statusHint =
    !selectedCell &&
    !facetIds &&
    width >= STATUS_HINT_MIN_WIDTH &&
    "Click a cell to select who was active";

  return (
    <div
      className="relative select-none"
      style={{ width, height }}
      onPointerLeave={() => setHovered(null)}
    >
      {hoveredCell && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          <span className="eda-readout-item">
            <span>Cohort</span>
            <b>{cohortLabel(hoveredCell.cohort.start, period)}</b>
          </span>
          <span className="eda-readout-item">
            <span>{periodName}</span>
            <b>{hoveredCell.cell.period}</b>
          </span>
          <span className="eda-readout-item">
            <span>Active</span>
            <b>
              {hoveredCell.cell.active.toLocaleString()} of{" "}
              {hoveredCell.cohort.size.toLocaleString()}
            </b>
          </span>
          <span className="eda-readout-item">
            <span>Rate</span>
            <b>
              {retentionPercent(hoveredCell.cell.rate)}
              {hoveredCell.cell.partial ? " (partial)" : ""}
            </b>
          </span>
        </ChartReadout>
      )}
      <div
        className="absolute flex items-center gap-3"
        style={{ top: 0, left: 8, right: 10, height: LEGEND_HEIGHT - 6 }}
      >
        <HeatLegend
          scale={SCALE}
          metricLabel={`Share of cohort active`}
          format={retentionPercent}
          hasEmpty={false}
          hasInvalid={false}
        />
        <span className="ml-auto flex-none text-[11px] text-muted-foreground">
          {periodName}s after entry
        </span>
      </div>
      <svg
        width={width}
        height={height}
        className="block"
        role="group"
        aria-label={`Retention of ${entityLabel} by ${periodName.toLowerCase()} cohort`}
        onClick={(event) => {
          if (
            !event.altKey &&
            settings.filters.length > 0 &&
            isEmptyPlotTarget(event.target)
          )
            updateChart(settings.id, { filters: [], selectedCell: undefined });
        }}
      >
        <defs>
          <pattern
            id={patternId}
            width={6}
            height={6}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={6}
              stroke="var(--background)"
              strokeWidth={1.4}
              opacity={0.6}
            />
          </pattern>
        </defs>
        <g className="fill-muted-foreground" fontSize={11} pointerEvents="none">
          <text x={8} y={LEGEND_HEIGHT + 12}>
            Cohort
          </text>
          <text
            x={8 + labelWidth + sizeWidth}
            y={LEGEND_HEIGHT + 12}
            textAnchor="end"
          >
            Size
          </text>
          {plan.summary.map((cell) => (
            <text
              key={cell.period}
              x={left + cell.period * cellWidth + cellWidth / 2}
              y={LEGEND_HEIGHT + 12}
              textAnchor="middle"
            >
              {headerText(cell.period)}
            </text>
          ))}
        </g>
        {cohorts.map((cohort, index) => {
          const y = top + index * rowHeight;
          return (
            <g key={cohort.key}>
              {rowHeight >= MIN_ROW && (
                <g
                  fontSize={Math.min(11, rowHeight - 2)}
                  pointerEvents="none"
                  dominantBaseline="central"
                >
                  <text x={8} y={y + rowHeight / 2} className="fill-foreground">
                    {cohortLabel(cohort.start, period)}
                  </text>
                  <text
                    x={8 + labelWidth + sizeWidth}
                    y={y + rowHeight / 2}
                    textAnchor="end"
                    className="fill-muted-foreground"
                  >
                    {cohort.size.toLocaleString()}
                  </text>
                </g>
              )}
              {cohort.cells.map((cell) => cellAt(cohort, cell, y))}
            </g>
          );
        })}
        <g pointerEvents="none" dominantBaseline="central">
          <text
            x={8}
            y={summaryY + rowHeight / 2}
            fontSize={11}
            fontWeight={600}
            className="fill-foreground"
          >
            All
          </text>
          {plan.summary.map((cell) =>
            cell.size > 0 ? (
              <g key={cell.period}>
                <rect
                  x={left + cell.period * cellWidth + 1}
                  y={summaryY + 1}
                  width={Math.max(0, cellWidth - 2)}
                  height={Math.max(0, rowHeight - 2)}
                  rx={2}
                  style={{ fill: heatFill(cell.rate, "sequential") }}
                  stroke="var(--foreground)"
                  strokeOpacity={0.35}
                />
                {showText && (
                  <text
                    x={left + cell.period * cellWidth + cellWidth / 2}
                    y={summaryY + rowHeight / 2}
                    textAnchor="middle"
                    fontSize={Math.min(11, rowHeight - 3)}
                    fontWeight={600}
                    style={{ fill: heatText(cell.rate) }}
                  >
                    {retentionPercent(cell.rate)}
                  </text>
                )}
              </g>
            ) : null
          )}
        </g>
      </svg>
      <ChartStatusLine
        parts={statusParts}
        hint={statusHint}
        left={8}
        right={10}
        bottom={4}
      />
    </div>
  );
}
