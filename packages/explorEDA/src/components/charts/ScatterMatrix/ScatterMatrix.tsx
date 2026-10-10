import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps, datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { ChartMessage } from "../ChartMessage";
import { ChartReadout } from "../ChartReadout";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
  STATUS_LINE_HEIGHT,
} from "../ChartStatusLine";
import { useTraceRevision } from "../trace/ChartTraceScope";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import { MIN_MATRIX_FIELDS, type ScatterMatrixSettings } from "./definition";
import {
  BOTTOM_TICKS,
  brushFilters,
  cellPoint,
  filterOffsets,
  MATRIX_CONTEXT_COLOR,
  MATRIX_POINT_COLOR,
  nearestRow,
  offsetFilter,
  planScatterMatrix,
  replaceSelection,
  STRIP_SIZE,
  type MatrixBar,
  type MatrixCell,
  type MatrixPlan,
  type MatrixSnapshot,
} from "./matrixPlan";

interface Drag {
  cell: string;
  start: [number, number];
  end: [number, number];
  moved: boolean;
}

const truncate = (text: string, pixels: number) => {
  const max = Math.max(2, Math.floor(pixels / 6.5));
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

/** Point cells draw on one canvas: gray context first, the selection on top. */
function drawPoints(
  canvas: HTMLCanvasElement,
  plan: MatrixPlan,
  width: number,
  height: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const r = plan.pointRadius;
  const size = plan.cellSize;
  const draw = (cell: MatrixCell, selected: boolean) => {
    const xs = plan.fields[cell.column]!.offset;
    const ys = plan.fields[cell.row]!.offset;
    ctx.beginPath();
    for (let i = 0; i < plan.liveIds.length; i++) {
      if (Boolean(plan.selected[i]) !== selected) continue;
      const x = xs[i]!;
      const y = ys[i]!;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const px = cell.x + x;
      const py = cell.y + size - y;
      ctx.moveTo(px + r, py);
      ctx.arc(px, py, r, 0, Math.PI * 2);
    }
    ctx.fill();
  };
  const cells = plan.cells.filter((cell) => cell.kind === "points");
  for (const pass of plan.hasSelection ? [false, true] : [true]) {
    ctx.fillStyle = pass ? MATRIX_POINT_COLOR : MATRIX_CONTEXT_COLOR;
    ctx.globalAlpha = pass ? plan.pointOpacity : plan.dimmedOpacity;
    for (const cell of cells) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(cell.x, cell.y, size, size);
      ctx.clip();
      draw(cell, pass);
      ctx.restore();
    }
  }
}

export function ScatterMatrix({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<ScatterMatrixSettings>) {
  const getColumnData = useDataLayer((s) => s.getColumnData);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const formatFieldValue = useDataLayer((s) => s.formatFieldValue);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const profiles = useDataLayer((s) => s.fieldProfiles);
  const nonce = useDataLayer((s) => s.nonce);
  const updateChart = useDataLayer((s) => s.updateChart);
  const liveIds = useGetLiveIds(settings, facetIds);
  const allIds = useGetAllIds(settings);
  const revision = useTraceRevision(settings);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hovered, setHovered] = useState<{
    cell: string;
    index: number;
  } | null>(null);
  const [focused, setFocused] = useState(false);

  // The status line sits under the scrolling plot, so it never scrolls away.
  const plotHeight = Math.max(1, height - STATUS_LINE_HEIGHT);
  const fieldKey = [
    ...settings.fields,
    ...settings.filters.map((filter) => filter.field),
  ].join("\u0000");
  const snapshot = useMemo((): MatrixSnapshot => {
    const fields = [
      ...new Set(
        fieldKey.split("\u0000").filter((field) => field && field !== "__ID")
      ),
    ];
    const columns: MatrixSnapshot["columns"] = {};
    const types: MatrixSnapshot["types"] = {};
    for (const field of fields) {
      columns[field] = getColumnData(field);
      types[field] = profiles.find(
        (profile) => profile.name === field
      )?.dataType;
    }
    return {
      allIds: allIds as number[],
      liveIds: liveIds as number[],
      columns,
      types,
    };
    // The nonce carries data edits; column maps are replaced when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldKey, allIds, liveIds, profiles, nonce, revision, getColumnData]);

  const plan = useMemo(
    () =>
      planScatterMatrix({
        settings,
        snapshot,
        width,
        height: plotHeight,
        getFieldLabel,
      }),
    // Field settings carry label changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, snapshot, width, plotHeight, fieldSettings]
  );

  useEffect(() => {
    if (canvasRef.current)
      drawPoints(
        canvasRef.current,
        plan,
        plan.contentWidth,
        plan.contentHeight
      );
  }, [plan]);

  const setFilters = useCallback(
    (next: Filter[]) =>
      updateChart(settings.id, { filters: replaceSelection(settings, next) }),
    [settings, updateChart]
  );

  if (settings.fields.filter(Boolean).length < MIN_MATRIX_FIELDS) {
    return (
      <ChartMessage width={width} height={height}>
        Choose at least two fields in chart settings.
      </ChartMessage>
    );
  }

  const size = plan.cellSize;
  const last = plan.cells[plan.cells.length - 1]!;
  const right = last.x + size;
  const bottom = last.y + size;
  const format = (field: string, value: datum) =>
    value == null || value === ""
      ? "(missing)"
      : formatFieldValue(field, value);

  const local = (event: PointerEvent<SVGRectElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const clamp = (value: number) => Math.max(0, Math.min(size, value));
    return [
      clamp(event.clientX - bounds.left),
      clamp(event.clientY - bounds.top),
    ] as [number, number];
  };

  const startDrag = (event: PointerEvent<SVGRectElement>, cell: MatrixCell) => {
    if (event.button !== 0 || event.altKey) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = local(event);
    setHovered(null);
    setDrag({ cell: cell.id, start: point, end: point, moved: false });
  };
  const moveDrag = (event: PointerEvent<SVGRectElement>, cell: MatrixCell) => {
    if (drag?.cell === cell.id) {
      const end = local(event);
      const moved =
        drag.moved ||
        Math.abs(end[0] - drag.start[0]) + Math.abs(end[1] - drag.start[1]) > 3;
      setDrag({ ...drag, end, moved });
      return;
    }
    if (event.buttons || cell.kind !== "points") return;
    const [x, y] = local(event);
    const index = nearestRow(plan, cell, x, y);
    setHovered(index === undefined ? null : { cell: cell.id, index });
  };
  const endDrag = (cell: MatrixCell) => {
    if (drag?.cell !== cell.id) return;
    setDrag(null);
    const field = plan.fields[cell.column]!;
    if (drag.moved) {
      setFilters(
        cell.row === cell.column
          ? [offsetFilter(field, [drag.start[0], drag.end[0]])]
          : brushFilters(plan, cell, drag.start, drag.end)
      );
      return;
    }
    // A click selects the mark under it, or clears the selection on empty space.
    const [x, y] = drag.start;
    if (cell.kind === "points") {
      const index = nearestRow(plan, cell, x, y);
      if (index !== undefined) {
        const id = plan.liveIds[index]!;
        const only = settings.filters.find((filter) => filter.field === "__ID");
        setFilters(
          only?.type === "value" &&
            only.values.length === 1 &&
            only.values[0] === id
            ? []
            : [{ type: "value", field: "__ID", values: [id] }]
        );
        return;
      }
    }
    if (cell.bars) {
      const height = size - 2;
      const bar = cell.bars.find(
        (item) =>
          x >= Math.min(item.start, item.end) &&
          x <= Math.max(item.start, item.end) &&
          y >= size - (item.total / cell.maxBar!) * height - 2
      );
      if (bar) {
        const current = settings.filters.find((f) => f.field === field.field);
        setFilters(
          JSON.stringify(current) === JSON.stringify(bar.filter)
            ? []
            : [bar.filter]
        );
        return;
      }
    }
    setFilters([]);
  };

  // A region shows in point cells whose two fields both carry a filter, and
  // on the diagonal of each filtered field.
  const selectionRect = (cell: MatrixCell) => {
    if (cell.kind === "blank" || cell.kind === "label") return undefined;
    const xSpan = filterOffsets(plan.fields[cell.column]!, settings.filters);
    if (cell.row === cell.column) {
      return xSpan
        ? { x: xSpan[0], y: 0, w: xSpan[1] - xSpan[0], h: size }
        : undefined;
    }
    if (cell.kind !== "points" || !xSpan) return undefined;
    const ySpan = filterOffsets(plan.fields[cell.row]!, settings.filters);
    if (!ySpan) return undefined;
    return {
      x: xSpan[0],
      y: size - ySpan[1],
      w: xSpan[1] - xSpan[0],
      h: ySpan[1] - ySpan[0],
    };
  };

  const hoveredCell =
    hovered && plan.cells.find((cell) => cell.id === hovered.cell);
  const hoveredId = hovered ? plan.liveIds[hovered.index] : undefined;
  const narrow = width < STATUS_HINT_MIN_WIDTH;
  const rows = plan.liveIds.length.toLocaleString();
  const fewest = Math.min(...plan.cells.map((cell) => cell.n));
  const statusParts = [
    plan.hasSelection
      ? `${plan.selectedCount.toLocaleString()} of ${rows} ${narrow ? "selected" : "rows selected"}`
      : `${rows} rows`,
    fewest < plan.liveIds.length &&
      (narrow
        ? `up to ${(plan.liveIds.length - fewest).toLocaleString()} missing`
        : `up to ${(plan.liveIds.length - fewest).toLocaleString()} rows missing a value per cell`),
  ];
  const statusHint =
    focused &&
    !narrow &&
    !facetIds &&
    (plan.hasSelection
      ? "Drag in a cell for a new selection, click empty space to clear"
      : "Drag in a cell to select, click a bar to select its values");

  return (
    <div
      className="relative select-none"
      style={{ width, height }}
      onPointerEnter={() => setFocused(true)}
      onPointerLeave={() => {
        setFocused(false);
        setHovered(null);
      }}
    >
      <div className="overflow-auto" style={{ width, height: plotHeight }}>
        <div
          className="relative"
          style={{ width: plan.contentWidth, height: plan.contentHeight }}
        >
          <svg
            width={plan.contentWidth}
            height={plan.contentHeight}
            className="absolute inset-0 block"
            aria-hidden="true"
          >
            {plan.cells.map((cell) => (
              <rect
                key={`bg-${cell.id}`}
                x={cell.x}
                y={cell.y}
                width={size}
                height={size}
                className="eda-matrix-cell"
                data-kind={cell.kind}
              />
            ))}
          </svg>
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0"
            style={{ width: plan.contentWidth, height: plan.contentHeight }}
            aria-hidden="true"
          />
          <svg
            width={plan.contentWidth}
            height={plan.contentHeight}
            className="absolute inset-0 block"
            role="group"
            aria-label={`Scatter matrix of ${plan.fields.map((field) => field.label).join(", ")}`}
          >
            {plan.fields.map((field) => {
              const column = plan.cells[field.index]!;
              const row = plan.cells[field.index * plan.fields.length]!;
              return (
                <g key={field.field} className="eda-matrix-axis" fontSize={10}>
                  <rect
                    x={column.x}
                    y={column.y - STRIP_SIZE}
                    width={size}
                    height={STRIP_SIZE - 3}
                    className="eda-matrix-strip"
                  />
                  <text
                    x={column.x + size / 2}
                    y={column.y - STRIP_SIZE / 2 - 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-foreground"
                    fontSize={11}
                    fontWeight={600}
                  >
                    {truncate(field.label, size - 6)}
                  </text>
                  <rect
                    x={right + 3}
                    y={row.y}
                    width={STRIP_SIZE - 3}
                    height={size}
                    className="eda-matrix-strip"
                  />
                  <text
                    transform={`translate(${right + 3 + (STRIP_SIZE - 3) / 2},${row.y + size / 2}) rotate(90)`}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-foreground"
                    fontSize={11}
                    fontWeight={600}
                  >
                    {truncate(field.label, size - 6)}
                  </text>
                  {field.ticks.map((tick, index) => (
                    <g key={`x-${index}`} className="fill-muted-foreground">
                      <line
                        x1={column.x + tick.offset}
                        x2={column.x + tick.offset}
                        y1={bottom}
                        y2={bottom + 3}
                        stroke="currentColor"
                        className="text-muted-foreground"
                      />
                      <text
                        x={column.x + tick.offset}
                        y={bottom + 5}
                        textAnchor="middle"
                        dominantBaseline="hanging"
                      >
                        {truncate(
                          tick.label,
                          Math.max(30, size / field.ticks.length)
                        )}
                      </text>
                    </g>
                  ))}
                  {field.ticks.map((tick, index) => (
                    <g key={`y-${index}`} className="fill-muted-foreground">
                      <line
                        x1={row.x - 3}
                        x2={row.x}
                        y1={row.y + size - tick.offset}
                        y2={row.y + size - tick.offset}
                        stroke="currentColor"
                        className="text-muted-foreground"
                      />
                      <text
                        x={row.x - 5}
                        y={row.y + size - tick.offset}
                        textAnchor="end"
                        dominantBaseline="central"
                      >
                        {truncate(tick.label, BOTTOM_TICKS * 2 - 4)}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })}
            {plan.cells.map((cell) => (
              <MatrixCellMarks
                key={cell.id}
                cell={cell}
                plan={plan}
                label={plan.fields[cell.column]!.label}
                liveCount={plan.liveIds.length}
              />
            ))}
            {plan.cells.map((cell) => {
              const active =
                drag?.cell === cell.id && drag.moved ? drag : undefined;
              const diagonal = cell.row === cell.column;
              const rect = active
                ? {
                    x: Math.min(active.start[0], active.end[0]),
                    y: diagonal ? 0 : Math.min(active.start[1], active.end[1]),
                    w: Math.abs(active.end[0] - active.start[0]),
                    h: diagonal
                      ? size
                      : Math.abs(active.end[1] - active.start[1]),
                  }
                : selectionRect(cell);
              return (
                rect && (
                  <rect
                    key={`sel-${cell.id}`}
                    x={cell.x + rect.x}
                    y={cell.y + rect.y}
                    width={Math.max(1, rect.w)}
                    height={Math.max(1, rect.h)}
                    fill="var(--primary)"
                    fillOpacity={0.08}
                    stroke="var(--primary)"
                    strokeWidth={1.25}
                    pointerEvents="none"
                  />
                )
              );
            })}
            {hoveredId !== undefined &&
              plan.cells
                .filter((cell) => cell.kind === "points")
                .map((cell) => {
                  const point = cellPoint(plan, cell, hovered!.index);
                  if (!Number.isFinite(point.x) || !Number.isFinite(point.y))
                    return null;
                  return (
                    <circle
                      key={`hover-${cell.id}`}
                      cx={cell.x + point.x}
                      cy={cell.y + point.y}
                      r={plan.pointRadius + 3}
                      fill="none"
                      stroke="var(--foreground)"
                      strokeWidth={1.5}
                      pointerEvents="none"
                    />
                  );
                })}
            {plan.cells.map((cell) =>
              cell.kind === "blank" ||
              cell.kind === "label" ||
              cell.kind === "correlation" ? null : (
                <rect
                  key={`hit-${cell.id}`}
                  x={cell.x}
                  y={cell.y}
                  width={size}
                  height={size}
                  fill="transparent"
                  className={
                    hoveredCell?.id === cell.id
                      ? "cursor-pointer"
                      : "cursor-crosshair"
                  }
                  data-cell={cell.id}
                  onPointerDown={(event) => startDrag(event, cell)}
                  onPointerMove={(event) => moveDrag(event, cell)}
                  onPointerUp={() => endDrag(cell)}
                  onPointerCancel={() => setDrag(null)}
                />
              )
            )}
          </svg>
        </div>
      </div>
      <ChartStatusLine
        parts={statusParts}
        hint={statusHint}
        left={settings.margin.left + 4}
        right={settings.margin.right}
        bottom={settings.margin.bottom}
      />
      {hoveredCell && hoveredId !== undefined && !drag && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          {[
            plan.fields[hoveredCell.column]!,
            plan.fields[hoveredCell.row]!,
          ].map((field) => (
            <span key={field.field} className="eda-readout-item">
              <span>{field.label}</span>
              <b>
                {format(
                  field.field,
                  snapshot.columns[field.field]?.[hoveredId]
                )}
              </b>
            </span>
          ))}
          <span className="eda-readout-item">
            <span>Row</span>
            <b>{hoveredId.toLocaleString()}</b>
          </span>
        </ChartReadout>
      )}
    </div>
  );
}

function MatrixCellMarks({
  cell,
  plan,
  label,
  liveCount,
}: {
  cell: MatrixCell;
  plan: MatrixPlan;
  label: string;
  liveCount: number;
}) {
  const size = plan.cellSize;
  // Small gaps are noted in the status line; larger ones label the cell.
  const reduced = cell.n < liveCount * 0.98;
  const count = reduced && (
    <text
      x={cell.x + size - 4}
      y={cell.y + size - 4}
      textAnchor="end"
      fontSize={9}
      className="fill-muted-foreground"
    >
      n={cell.n.toLocaleString()}
    </text>
  );
  if (cell.kind === "correlation") {
    const fontSize = Math.max(11, Math.min(20, size / 7));
    return (
      <g pointerEvents="none">
        <text
          x={cell.x + size / 2}
          y={cell.y + size / 2 - fontSize * 0.4}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize * 0.6}
          className="fill-muted-foreground"
        >
          Corr
        </text>
        <text
          x={cell.x + size / 2}
          y={cell.y + size / 2 + fontSize * 0.45}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={600}
          className="fill-foreground"
        >
          {cell.r === undefined ? "—" : cell.r.toFixed(2)}
        </text>
        {count}
      </g>
    );
  }
  if (cell.kind === "label") {
    return (
      <text
        x={cell.x + size / 2}
        y={cell.y + size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
        className="fill-foreground"
        pointerEvents="none"
      >
        {truncate(label, size - 8)}
      </text>
    );
  }
  if (cell.bars) {
    return (
      <g pointerEvents="none">
        {cell.bars.map((bar) => (
          <DiagonalBar key={bar.id} bar={bar} cell={cell} plan={plan} />
        ))}
        {count}
      </g>
    );
  }
  return count || null;
}

function DiagonalBar({
  bar,
  cell,
  plan,
}: {
  bar: MatrixBar;
  cell: MatrixCell;
  plan: MatrixPlan;
}) {
  const size = plan.cellSize;
  const scale = (size - 4) / cell.maxBar!;
  const x = cell.x + Math.min(bar.start, bar.end) + 0.5;
  const w = Math.max(1, Math.abs(bar.end - bar.start) - 1);
  const base = cell.y + size;
  const total = bar.total * scale;
  // The selected share stacks at the base, the rest above it in gray.
  const selected = (plan.hasSelection ? bar.selected : bar.total) * scale;
  return (
    <>
      {plan.hasSelection && (
        <rect
          x={x}
          y={base - total}
          width={w}
          height={total}
          fill={MATRIX_CONTEXT_COLOR}
          fillOpacity={0.45}
        />
      )}
      <rect
        x={x}
        y={base - selected}
        width={w}
        height={selected}
        fill={MATRIX_POINT_COLOR}
        fillOpacity={0.85}
      />
    </>
  );
}
