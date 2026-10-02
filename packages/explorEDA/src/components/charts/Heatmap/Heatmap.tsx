import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
import { interpolateBlues, interpolateRdBu } from "d3-scale-chromatic";
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
import type { HeatmapSettings } from "./definition";
import {
  LEGEND_HEIGHT,
  planHeatmap,
  toggleCellFilters,
  type HeatmapCell,
  type HeatmapPlan,
} from "./heatmapPlan";
import {
  findHeatmapTraceRow,
  heatmapTraceTargets,
  resolveHeatmapTrace,
} from "./heatmapTrace";

const truncate = (text: string, width: number) => {
  const max = Math.max(1, Math.floor(width / 6.5));
  return text.length > max ? `${text.slice(0, Math.max(1, max - 1))}…` : text;
};

function Legend({ plan, gradientId }: { plan: HeatmapPlan; gradientId: string }) {
  const [low, high] = plan.scale.domain;
  const stops = Array.from({ length: 9 }, (_, index) => index / 8);
  const span = Math.max(Math.abs(low), Math.abs(high)) || 1;
  const color = (t: number) =>
    plan.scale.kind === "diverging"
      ? interpolateRdBu(0.5 + (-span + t * 2 * span) / (2 * span))
      : interpolateBlues(0.12 + t * 0.8);
  const format = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const lowLabel = format(plan.scale.kind === "diverging" ? -span : low);
  const highLabel = format(plan.scale.kind === "diverging" ? span : high);
  const barWidth = Math.min(120, Math.max(60, plan.width * 0.25));
  const scaleWidth = (lowLabel.length + highLabel.length) * 6.5 + barWidth + 12;
  // Start over the cells, or further left when the scale would not fit there.
  const left = Math.max(
    8,
    Math.min(plan.margin.left, plan.width - plan.margin.right - scaleWidth)
  );
  const room = plan.width - plan.margin.right - left;
  let x = 0;
  return (
    <g
      transform={`translate(${left},${plan.margin.top - LEGEND_HEIGHT + 6})`}
      className="fill-muted-foreground"
      fontSize={11}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId}>
          {stops.map((t) => (
            <stop key={t} offset={`${t * 100}%`} stopColor={color(t)} />
          ))}
        </linearGradient>
      </defs>
      <text x={x} y={10}>
        {lowLabel}
      </text>
      {(() => {
        x += lowLabel.length * 6.5 + 6;
        const bar = (
          <rect
            x={x}
            y={1}
            width={barWidth}
            height={11}
            rx={2}
            fill={`url(#${gradientId})`}
          />
        );
        x += barWidth + 6;
        return bar;
      })()}
      <text x={x} y={10}>
        {highLabel}
      </text>
      {(() => {
        x += highLabel.length * 6.5 + 14;
        const items = [];
        if (plan.hasEmpty && x + 70 < room) {
          items.push(
            <g key="empty" transform={`translate(${x},0)`}>
              <rect
                x={0.5}
                y={1.5}
                width={11}
                height={10}
                fill="none"
                stroke="var(--border)"
                strokeDasharray="2 2"
              />
              <text x={16} y={10}>
                No rows
              </text>
            </g>
          );
          x += 70;
        }
        if (plan.hasInvalid && x + 110 < room) {
          items.push(
            <g key="invalid" transform={`translate(${x},0)`}>
              <rect
                x={0.5}
                y={1.5}
                width={11}
                height={10}
                fill={`url(#${gradientId}-hatch)`}
                stroke="var(--border)"
              />
              <text x={16} y={10}>
                No valid values
              </text>
            </g>
          );
        }
        return items;
      })()}
    </g>
  );
}

function Readout({ cell, plan }: { cell: HeatmapCell; plan: HeatmapPlan }) {
  const excluded = cell.contributors.filter((item) => !item.included).length;
  return (
    <div
      className="pointer-events-none absolute right-2 top-2 max-w-[min(18rem,80%)] rounded border border-border bg-card/95 px-2 py-1 text-xs text-card-foreground shadow-sm"
      role="status"
    >
      <div>
        {plan.rowFieldLabel}: {cell.row.label} · {plan.columnFieldLabel}:{" "}
        {cell.column.label}
      </div>
      <div>
        {plan.metricLabel}: {cell.valueText}
        {cell.rowCount > 0 &&
          ` · ${cell.rowCount.toLocaleString()} rows${excluded ? `, ${excluded} without a valid value` : ""}`}
      </div>
      {cell.state !== "empty" && (
        <div className="text-muted-foreground">
          Click to select · Alt-click to inspect
        </div>
      )}
    </div>
  );
}

export function Heatmap({ settings, width, height, facetIds }: BaseChartProps<HeatmapSettings>) {
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const formatFieldValue = useDataLayer((s) => s.formatFieldValue);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const updateChart = useDataLayer((s) => s.updateChart);
  const liveIds = useGetLiveIds(settings, facetIds);
  const allIds = useGetAllIds();
  const rowData = useGetColumnData(settings.field);
  const columnData = useGetColumnData(settings.columnField);
  const measureData = useGetColumnData(
    settings.aggregation === "count" ? undefined : settings.measureField
  );
  const revision = useTraceRevision(settings);
  const trace = useChartTrace();
  const traceApi = useChartTraceApi();
  const owner = useId();
  const gradientId = `${useId().replace(/:/g, "")}-heat`;
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const cellRefs = useRef(new Map<string, SVGRectElement>());

  const plan = useMemo(
    () =>
      planHeatmap({
        settings,
        width,
        height,
        snapshot: { revision, allIds, liveIds, rowData, columnData, measureData },
        getFieldLabel,
        formatFieldValue,
      }),
    // Label and format getters are stable; field settings carry their changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, width, height, revision, allIds, liveIds, rowData, columnData, measureData, fieldSettings]
  );

  const source = useMemo(
    (): TraceSource => ({
      role: "chart",
      revision: plan.revision,
      resolve: (kind, id) => resolveHeatmapTrace(plan, kind, id),
      findRow: (id) => findHeatmapTraceRow(plan, id),
      targets: () => heatmapTraceTargets(plan),
    }),
    [plan]
  );
  useTraceSource(owner, source);
  const inspect = useCallback(
    (id: string) => traceApi?.inspect(owner, "cell", id),
    [owner, traceApi]
  );
  const traced = trace?.selection?.owner === owner ? trace.selection.id : undefined;

  const select = (cell: HeatmapCell) => {
    if (cell.state === "empty") {return;}
    updateChart(settings.id, { filters: toggleCellFilters(settings, plan, cell) });
  };

  if (!settings.field || !settings.columnField || settings.field === settings.columnField) {
    return (
      <div className="flex items-center justify-center p-4 text-center text-sm text-muted-foreground" style={{ width, height }}>
        Choose two different fields for the rows and columns in chart settings.
      </div>
    );
  }
  if (plan.rows.length === 0 || plan.columns.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ width, height }}>
        No rows to display
      </div>
    );
  }

  const columnCount = plan.columns.length;
  const tabStop =
    (focused && plan.cells.some((cell) => cell.id === focused) ? focused : undefined) ??
    plan.cells.find((cell) => cell.selected)?.id ??
    plan.cells[0]?.id;
  const moveFocus = (index: number, key: string) => {
    const row = Math.floor(index / columnCount);
    const column = index % columnCount;
    const next =
      key === "ArrowRight" ? index + (column < columnCount - 1 ? 1 : 0)
      : key === "ArrowLeft" ? index - (column > 0 ? 1 : 0)
      : key === "ArrowDown" ? index + (row < plan.rows.length - 1 ? columnCount : 0)
      : key === "ArrowUp" ? index - (row > 0 ? columnCount : 0)
      : index;
    const id = plan.cells[next]?.id;
    if (!id) {return;}
    setFocused(id);
    setHovered(id);
    cellRefs.current.get(id)?.focus();
  };
  const hoveredCell = plan.cells.find((cell) => cell.id === hovered);
  const omittedText = [
    plan.omitted.rows > 0 && `${plan.rows.length} of ${plan.rows.length + plan.omitted.rows} ${plan.rowFieldLabel}`,
    plan.omitted.columns > 0 && `${plan.columns.length} of ${plan.columns.length + plan.omitted.columns} ${plan.columnFieldLabel}`,
  ].filter(Boolean);

  return (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height} className="block select-none overflow-visible">
        <defs>
          <pattern id={`${gradientId}-hatch`} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={6} stroke="var(--muted-foreground)" strokeWidth={1.2} opacity={0.55} />
          </pattern>
        </defs>
        <Legend plan={plan} gradientId={gradientId} />
        <g transform={`translate(${plan.margin.left},${plan.margin.top})`}>
          <g className="fill-muted-foreground" fontSize={11} aria-hidden="true">
            {plan.rows.map((row) => (
              <text key={row.key} x={-8} y={row.position + plan.cellHeight / 2} textAnchor="end" dominantBaseline="middle">
                {truncate(row.label, plan.margin.left - 12)}
              </text>
            ))}
            {plan.columns.map((column) => {
              const x = column.position + plan.cellWidth / 2;
              const y = plan.plotHeight + 14;
              return plan.rotateColumnLabels ? (
                <text key={column.key} x={x} y={y} textAnchor="end" transform={`rotate(-40 ${x} ${y})`}>
                  {truncate(column.label, 140)}
                </text>
              ) : (
                <text key={column.key} x={x} y={y} textAnchor="middle">
                  {column.label}
                </text>
              );
            })}
          </g>
          <g role="group" aria-label={`${plan.metricLabel} by ${plan.rowFieldLabel} and ${plan.columnFieldLabel}`}>
            {plan.cells.map((cell, index) => {
              const isTraced = traced === cell.id;
              const dimmed = cell.selected === false;
              return (
                <g key={cell.id}>
                  <rect
                    ref={(node) => {
                      if (node) {cellRefs.current.set(cell.id, node);}
                      else {cellRefs.current.delete(cell.id);}
                    }}
                    data-plan-id={cell.id}
                    x={cell.x + 1}
                    y={cell.y + 1}
                    width={Math.max(0, cell.width - 2)}
                    height={Math.max(0, cell.height - 2)}
                    rx={2}
                    role="button"
                    tabIndex={cell.id === tabStop ? 0 : -1}
                    aria-label={`${cell.row.label}, ${cell.column.label}: ${cell.valueText}`}
                    aria-pressed={cell.selected === true}
                    aria-disabled={cell.state === "empty" || undefined}
                    className={`chart-mark ${cell.state === "empty" ? "" : "cursor-pointer"}`}
                    fill={cell.state === "invalid" ? `url(#${gradientId}-hatch)` : cell.fill}
                    stroke={
                      isTraced || cell.selected
                        ? "var(--foreground)"
                        : cell.state === "value" ? "none" : "var(--border)"
                    }
                    strokeWidth={isTraced || cell.selected ? 2 : 1}
                    strokeDasharray={cell.state === "empty" && !cell.selected ? "3 3" : undefined}
                    opacity={dimmed ? 0.3 : 1}
                    onPointerEnter={() => setHovered(cell.id)}
                    onPointerLeave={() => setHovered((id) => (id === cell.id ? null : id))}
                    onFocus={() => {
                      setFocused(cell.id);
                    }}
                    onBlur={() => setHovered((id) => (id === cell.id ? null : id))}
                    onClick={(event) => {
                      if (event.altKey) {
                        event.preventDefault();
                        inspect(cell.id);
                      } else {select(cell);}
                    }}
                    onKeyDown={(event) => {
                      if (event.key.startsWith("Arrow")) {
                        event.preventDefault();
                        moveFocus(index, event.key);
                      } else if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (event.altKey && event.key === "Enter") {inspect(cell.id);}
                        else {select(cell);}
                      }
                    }}
                  />
                  {plan.showValues && cell.state === "value" && (
                    <text
                      x={cell.x + cell.width / 2}
                      y={cell.y + cell.height / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={11}
                      fill={cell.textFill}
                      opacity={dimmed ? 0.4 : 1}
                      pointerEvents="none"
                      aria-hidden="true"
                    >
                      {cell.valueText}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </g>
        {omittedText.length > 0 && (
          <text x={width - plan.margin.right} y={height - 4} textAnchor="end" fontSize={11} className="fill-muted-foreground">
            Top {omittedText.join(" · ")} by rows
          </text>
        )}
      </svg>
      {hoveredCell && <Readout cell={hoveredCell} plan={plan} />}
    </div>
  );
}
