import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
  STATUS_LINE_HEIGHT,
} from "../ChartStatusLine";
import { ChartMessage, NO_MATCHING_ROWS } from "../ChartMessage";
import { formatFieldValue as formatValue } from "@/lib/fieldSettings";
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
import type { HeatmapSettings } from "./definition";
import {
  LEGEND_HEIGHT,
  planHeatmap,
  toggleAxisFilters,
  toggleCellFilters,
  type HeatmapCategory,
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

/** The hovered cell's values, one line in the panel header. */
function Readout({ cell, plan }: { cell: HeatmapCell; plan: HeatmapPlan }) {
  const excluded = cell.contributors.filter((item) => !item.included).length;
  const items: [string, string][] = [
    [plan.rowFieldLabel, cell.row.label],
    [plan.columnFieldLabel, cell.column.label],
    [plan.metricLabel, cell.valueText],
  ];
  if (cell.rowCount > 0) {
    items.push([
      "Rows",
      `${cell.rowCount.toLocaleString()}${excluded ? ` (${excluded.toLocaleString()} without a value)` : ""}`,
    ]);
  }
  if (cell.share !== undefined) {
    items.push([plan.shareLabel, formatShare(cell.share)]);
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

const formatShare = (share: number) =>
  share > 0 && share < 0.001
    ? "<0.1%"
    : share.toLocaleString("en-US", {
        style: "percent",
        maximumFractionDigits: share < 0.1 ? 1 : 0,
      });

export function Heatmap({ settings, width, height, facetIds }: BaseChartProps<HeatmapSettings>) {
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const formatFieldValue = useDataLayer((s) => s.formatFieldValue);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const updateChart = useDataLayer((s) => s.updateChart);
  const liveIds = useGetLiveIds(settings, facetIds);
  const allIds = useGetAllIds();
  const rowData = useGetColumnData(settings.field);
  const columnData = useGetColumnData(settings.columnField);
  const measureField =
    settings.aggregation === "count" ? undefined : settings.measureField;
  const measureData = useGetColumnData(measureField);
  const revision = useTraceRevision(settings);
  const trace = useChartTrace();
  const traceApi = useChartTraceApi();
  const owner = useId();
  const hatchId = `${useId().replace(/:/g, "")}-hatch`;
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
  const selectAxis = (axis: "row" | "column", category: HeatmapCategory) =>
    updateChart(settings.id, {
      filters: toggleAxisFilters(settings, plan, axis, category),
    });
  const formatLegend = (value: number) =>
    measureField
      ? formatValue(measureField, value, fieldSettings[measureField], { compact: true })
      : formatValue("", value, {}, { compact: true });

  if (!settings.field || !settings.columnField || settings.field === settings.columnField) {
    return (
      <ChartMessage width={width} height={height}>
        Choose two different fields for the rows and columns in chart settings.
      </ChartMessage>
    );
  }
  if (plan.rows.length === 0 || plan.columns.length === 0) {
    return (
      <ChartMessage width={width} height={height}>
        {allIds.length > 0 ? NO_MATCHING_ROWS : "No rows to show."}
      </ChartMessage>
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
  const singleSelection = plan.cells.filter((cell) => cell.selected).length === 1;
  const hoveredCell = plan.cells.find((cell) => cell.id === hovered);
  const omittedText = [
    plan.omitted.rows > 0 && `${plan.rows.length} of ${plan.rows.length + plan.omitted.rows} ${plan.rowFieldLabel}`,
    plan.omitted.columns > 0 && `${plan.columns.length} of ${plan.columns.length + plan.omitted.columns} ${plan.columnFieldLabel}`,
  ].filter(Boolean);
  const rowsIn = (cells: HeatmapCell[]) =>
    cells.reduce((total, cell) => total + cell.rowCount, 0);
  const selectedCells = plan.cells.filter((cell) => cell.selected);
  const { rows: selectedRowKeys, columns: selectedColumnKeys } = plan.selectedKeys;
  const listNames = (names: string[]) =>
    names.length > 3
      ? `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`
      : names.join(", ");
  const selectionText =
    selectedCells.length === 0
      ? ""
      : selectedRowKeys && !selectedColumnKeys
        ? listNames(plan.rows.filter((row) => selectedRowKeys.has(row.key)).map((row) => row.label))
        : selectedColumnKeys && !selectedRowKeys
          ? listNames(plan.columns.filter((column) => selectedColumnKeys.has(column.key)).map((column) => column.label))
          : selectedCells.length === 1
            ? `${selectedCells[0]!.row.label}, ${selectedCells[0]!.column.label}`
            : `${selectedCells.length} cells`;
  const statusParts = [
    // Counts lead, so a narrow chart that cuts the line keeps them.
    selectionText &&
      `${rowsIn(selectedCells).toLocaleString()} of ${rowsIn(plan.cells).toLocaleString()} rows selected: ${selectionText}`,
  ];
  const statusHint =
    !selectionText &&
    !facetIds &&
    width >= STATUS_HINT_MIN_WIDTH &&
    "Click a cell or label to select · Alt-click to inspect";
  const bandTop = plan.margin.top - LEGEND_HEIGHT;
  // The column labels end 16px above the bottom margin; their field name fills that gap.
  const columnTitleTop = height - settings.margin.bottom - 16 - STATUS_LINE_HEIGHT;

  return (
    <div className="relative" style={{ width, height }}>
      {/* Field names title the axes; the legend names the metric. */}
      <div
        className="absolute flex items-center gap-3"
        style={{ top: bandTop, left: 8, right: plan.margin.right, height: LEGEND_HEIGHT - 6 }}
      >
        <span
          className="eda-heat-axis-title flex-none text-right"
          style={{ width: plan.margin.left - 16 }}
        >
          {plan.rowFieldLabel}
        </span>
        <HeatLegend
          scale={plan.scale}
          metricLabel={plan.metricLabel}
          format={formatLegend}
          hasEmpty={plan.hasEmpty}
          hasInvalid={plan.hasInvalid}
        />
        {omittedText.length > 0 && (
          <span className="min-w-0 max-w-[40%] flex-none truncate text-[11px] text-muted-foreground">
            Top {omittedText.join(" · ")}
          </span>
        )}
      </div>
      <span
        className="eda-heat-axis-title absolute text-center"
        style={{ top: columnTitleTop, left: plan.margin.left, width: plan.plotWidth }}
      >
        {plan.columnFieldLabel}
      </span>
      <svg width={width} height={height} className="block select-none overflow-visible">
        <defs>
          <pattern id={hatchId} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={6} stroke="var(--muted-foreground)" strokeWidth={1.2} opacity={0.55} />
          </pattern>
        </defs>
        <g transform={`translate(${plan.margin.left},${plan.margin.top})`}>
          {/* A click on a label selects its whole row or column. */}
          <g className="fill-muted-foreground" fontSize={11} aria-hidden="true">
            {plan.rows.map((row) => (
              <text
                key={row.key}
                className="eda-heat-label"
                data-selected={plan.selectedKeys.rows?.has(row.key) && !plan.selectedKeys.columns}
                x={-8}
                y={row.position + plan.cellHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                onClick={() => selectAxis("row", row)}
              >
                {truncate(row.label, plan.margin.left - 12)}
              </text>
            ))}
            {plan.columns.map((column) => {
              const x = column.position + plan.cellWidth / 2;
              const y = plan.plotHeight + 14;
              const selected =
                plan.selectedKeys.columns?.has(column.key) && !plan.selectedKeys.rows;
              return plan.rotateColumnLabels ? (
                <text
                  key={column.key}
                  className="eda-heat-label"
                  data-selected={selected}
                  x={x}
                  y={y}
                  textAnchor="end"
                  transform={`rotate(-40 ${x} ${y})`}
                  onClick={() => selectAxis("column", column)}
                >
                  {truncate(column.label, 140)}
                </text>
              ) : (
                <text
                  key={column.key}
                  className="eda-heat-label"
                  data-selected={selected}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  onClick={() => selectAxis("column", column)}
                >
                  {column.label}
                </text>
              );
            })}
          </g>
          <g role="group" aria-label={`${plan.metricLabel} by ${plan.rowFieldLabel} and ${plan.columnFieldLabel}`}>
            {plan.cells.map((cell, index) => {
              // One selected cell is outlined; a larger selection reads from the dimming.
              const active = traced === cell.id || (cell.selected && singleSelection);
              const dimmed = cell.selected === false;
              const isHovered = hovered === cell.id;
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
                    className={`chart-mark eda-heat-cell ${cell.state === "empty" ? "" : "cursor-pointer"}`}
                    style={{
                      fill: cell.state === "invalid" ? `url(#${hatchId})` : cell.fill,
                      stroke:
                        active || (isHovered && cell.state !== "empty")
                          ? "var(--foreground)"
                          : cell.state === "value" ? "none" : "var(--border)",
                    }}
                    strokeWidth={active ? 2 : isHovered ? 1.5 : 1}
                    strokeDasharray={cell.state === "empty" && !active ? "3 3" : undefined}
                    opacity={dimmed && !isHovered ? 0.3 : 1}
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
                      style={{ fill: cell.textFill, fontVariantNumeric: "tabular-nums" }}
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
      </svg>
      {hoveredCell && <Readout cell={hoveredCell} plan={plan} />}
      <ChartStatusLine
        parts={statusParts}
        hint={statusHint}
        left={plan.margin.left}
        right={plan.margin.right}
      />
    </div>
  );
}
