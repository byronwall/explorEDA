import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps, datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  useChartTrace,
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import {
  cellKindName,
  cellMethods,
  METHOD_NAMES,
  METHOD_SYMBOLS,
  findMatrixTraceRow,
  matrixTraceTargets,
  resolveMatrixTrace,
} from "./matrixTrace";
import { ChartMessage } from "../ChartMessage";
import { ChartReadout } from "../ChartReadout";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import { drawMatrixPoints, toRgb, type Rgb } from "./matrixCanvas";
import { useThemeColors } from "@/hooks/useDisplayColorScales";
import type { MatrixBoxStats } from "./matrixCells";
import { MIN_MATRIX_FIELDS, type ScatterMatrixSettings } from "./definition";
import {
  BOTTOM_TICKS,
  brushFilters,
  cellPoint,
  filterOffsets,
  MATRIX_CONTEXT_COLOR,
  markFilters,
  nearestRow,
  offsetFilter,
  planMatrixLayout,
  planMatrixSelection,
  replaceSelection,
  sameSelection,
  withSelectedBars,
  STRIP_SIZE,
  type MatrixBar,
  type MatrixCell,
  type MatrixPlan,
  type MatrixSnapshot,
} from "./matrixPlan";
import {
  boxGrips,
  dragSpan,
  gripCursor,
  gripsResize,
  spanGrip,
  type Grip,
} from "@/hooks/brushSpan";

type Box = [[number, number], [number, number]];
interface Drag {
  cell: string;
  start: [number, number];
  /** What the press does along x and y: draw, move, or resize an edge. */
  grips: [Grip, Grip];
  /** The selection when the press began, in cell offsets. */
  original: Box;
  /** The selection the drag has made so far. */
  box: Box;
  moved: boolean;
}

const truncate = (text: string, pixels: number) => {
  const max = Math.max(2, Math.floor(pixels / 6.5));
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

/**
 * Above this many rows, a drag previews its selection inside the matrix and
 * filters linked charts once, on release. Below it, linked charts follow live.
 */
const LIVE_BRUSH_ROWS = 20_000;
const UPDATE_MARK = "eda-scatter-matrix-filter";
/** MATRIX_CONTEXT_COLOR as channels. */
const CONTEXT_RGB: Rgb = [156, 163, 175];
const UPDATE_MEASURE = "eda-scatter-matrix-update";

/** Keeps the same array while its contents are unchanged, so plans can be reused. */
function useStableIds(ids: number[]) {
  const ref = useRef(ids);
  const previous = ref.current;
  if (previous !== ids) {
    const same =
      previous.length === ids.length &&
      previous.every((id, index) => id === ids[index]);
    if (!same) {
      ref.current = ids;
    }
  }
  return ref.current;
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
  const colorScale = useDataLayer((s) =>
    settings.colorScaleId
      ? s.colorScales.find((item) => item.id === settings.colorScaleId)
      : undefined
  );
  // One-color marks take the theme's mark color, as the scatter plot does.
  const mark = useThemeColors().mark;
  const liveIds = useStableIds(useGetLiveIds(settings, facetIds) as number[]);
  const allIds = useStableIds(useGetAllIds(settings) as number[]);
  const contextRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);
  const [preview, setPreview] = useState<Filter[] | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hovered, setHovered] = useState<{
    cell: string;
    index: number;
  } | null>(null);
  const [hoverCell, setHoverCell] = useState<string | null>(null);
  const owner = useId();
  const revision = useTraceRevision(settings);
  const trace = useChartTrace();
  const traceApi = useChartTraceApi();

  const plotHeight = Math.max(1, height);
  // Brushes filter the matrix's own fields, so the key holds still while brushing.
  const fieldKey = [
    ...new Set([
      ...settings.fields,
      ...(settings.colorField ? [settings.colorField] : []),
      ...settings.filters.map((filter) => filter.field),
    ]),
  ]
    .sort()
    .join("\u0000");
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
    return { allIds, liveIds, columns, types, colorScale };
    // The nonce carries data edits; column maps are replaced when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldKey, allIds, liveIds, profiles, nonce, getColumnData, colorScale]);

  // Everything but the selection: a brush reuses it.
  const {
    fields,
    lower,
    upper,
    diagonal,
    margin,
    pointSize,
    pointOpacity,
    jitter,
    colorField,
    correlation,
  } = settings;
  const layout = useMemo(
    () =>
      planMatrixLayout({
        settings: {
          ...settings,
          fields,
          lower,
          upper,
          diagonal,
          margin,
          pointSize,
          pointOpacity,
          jitter,
          colorField,
          correlation,
        },
        snapshot,
        width,
        height: plotHeight,
        getFieldLabel,
      }),
    // Only these settings change the layout. Field settings carry labels.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      fields,
      lower,
      upper,
      diagonal,
      margin,
      pointSize,
      pointOpacity,
      jitter,
      colorField,
      correlation,
      snapshot,
      width,
      plotHeight,
      fieldSettings,
    ]
  );
  const filters = useMemo(
    () => (preview ? replaceSelection(settings, preview) : settings.filters),
    // replaceSelection reads only the fields and filters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [preview, settings.fields, settings.filters]
  );
  const plan = useMemo(
    () =>
      withSelectedBars(layout, planMatrixSelection(layout, filters, snapshot)),
    [layout, filters, snapshot]
  );

  // The gray context holds every row and changes only with the layout.
  useEffect(() => {
    if (contextRef.current) {
      drawMatrixPoints(
        contextRef.current,
        layout,
        CONTEXT_RGB,
        layout.dimmedOpacity
      );
    }
  }, [layout]);
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    drawMatrixPoints(
      canvasRef.current,
      plan,
      toRgb(mark),
      plan.pointOpacity,
      plan.hasSelection ? plan.selected : undefined,
      plan.groups && {
        rows: plan.groups.rows,
        colors: plan.groups.colors.map(toRgb),
      }
    );
    if (performance.getEntriesByName(UPDATE_MARK, "mark").length) {
      performance.measure(UPDATE_MEASURE, UPDATE_MARK);
      performance.clearMarks(UPDATE_MARK);
    }
  }, [plan, mark]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const source = useMemo(
    (): TraceSource => ({
      role: "chart",
      revision,
      resolve: (kind, id) =>
        resolveMatrixTrace(
          plan,
          snapshot,
          settings.filters,
          revision,
          kind,
          id
        ),
      findRow: (id) => findMatrixTraceRow(plan, id),
      targets: () => matrixTraceTargets(plan),
    }),
    [plan, snapshot, settings.filters, revision]
  );
  useTraceSource(owner, source);
  const inspect = useCallback(
    (kind: string, id: string) => traceApi?.inspect(owner, kind, id),
    [owner, traceApi]
  );
  const traced =
    trace?.selection?.owner === owner ? trace.selection : undefined;
  const tracedIndex =
    traced?.kind === "matrix-row"
      ? plan.liveIds.indexOf(Number(traced.id.replace("row:", "")))
      : -1;
  const tracedCell = traced?.kind === "matrix-cell" ? traced.id : undefined;

  const setFilters = useCallback(
    (next: Filter[]) => {
      cancelAnimationFrame(frame.current);
      performance.clearMarks(UPDATE_MARK);
      performance.mark(UPDATE_MARK);
      updateChart(settings.id, { filters: replaceSelection(settings, next) });
    },
    [settings, updateChart]
  );
  // While dragging, update at most once per frame: linked charts follow
  // live on smaller data, and the matrix previews alone on larger data.
  const live = liveIds.length <= LIVE_BRUSH_ROWS;
  const scheduleFilters = (next: Filter[]) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (live) {
        return setFilters(next);
      }
      performance.clearMarks(UPDATE_MARK);
      performance.mark(UPDATE_MARK);
      setPreview(next);
    });
  };

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
    if (event.button !== 0) {
      return;
    }
    // Alt-click traces the point under the pointer, or else the cell.
    if (event.altKey) {
      event.preventDefault();
      const [x, y] = local(event);
      const index =
        cell.kind === "points" ? nearestRow(plan, cell, x, y) : undefined;
      if (index !== undefined) {
        inspect("matrix-row", `row:${plan.liveIds[index]}`);
      } else {
        inspect("matrix-cell", cell.id);
      }
      return;
    }
    // Text and name cells hold no marks: a click there is empty space.
    if (cell.kind === "correlation" || cell.kind === "label") {
      if (settings.filters.length) {
        setFilters([]);
      }
      return;
    }
    event.preventDefault();
    // Keep keyboard focus on the cell, so Escape clears what the drag sets.
    // A press draws no focus ring: the brush alone marks the cell.
    event.currentTarget.focus({
      preventScroll: true,
      focusVisible: false,
    } as FocusOptions);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = local(event);
    const grips = gripsAt(cell, point);
    const diagonal = cell.row === cell.column;
    const selection = selectionBox(cell);
    setHovered(null);
    setDrag({
      cell: cell.id,
      start: point,
      grips,
      original: (grips[0] !== "draw" && selection) || [
        [point[0], diagonal ? 0 : point[1]],
        [point[0], diagonal ? size : point[1]],
      ],
      box: [point, point],
      moved: false,
    });
  };
  // The cell's selection as a box in cell offsets, if it shows one.
  const selectionBox = (cell: MatrixCell): Box | undefined => {
    const rect = selectionRect(cell);
    return (
      rect && [
        [rect.x, rect.y],
        [rect.x + rect.w, rect.y + rect.h],
      ]
    );
  };
  // Like every brush: edges resize, the body moves, outside draws anew.
  const gripsAt = (cell: MatrixCell, point: [number, number]) => {
    const box = selectionBox(cell);
    const diagonal = cell.row === cell.column;
    if (!box) {
      return ["draw", diagonal ? "hold" : "draw"] as [Grip, Grip];
    }
    return diagonal
      ? ([spanGrip([box[0][0], box[1][0]], point[0]), "hold"] as [Grip, Grip])
      : boxGrips(box, point);
  };
  const dragFilters = (cell: MatrixCell, current: Drag) => {
    const [[x0, y0], [x1, y1]] = current.box;
    const next =
      cell.row === cell.column
        ? [offsetFilter(plan.fields[cell.column]!, [x0, x1])]
        : brushFilters(plan, cell, [x0, y0], [x1, y1]);
    if (current.grips[0] === "draw") {
      return next;
    }
    // Moving or resizing keeps the selection on the matrix's other fields.
    const dragged = new Set(next.map((filter) => filter.field));
    return [
      ...settings.filters.filter(
        (filter) =>
          settings.fields.includes(filter.field) && !dragged.has(filter.field)
      ),
      ...next,
    ];
  };
  const moveDrag = (event: PointerEvent<SVGRectElement>, cell: MatrixCell) => {
    if (drag?.cell === cell.id) {
      const end = local(event);
      const moved =
        drag.moved ||
        Math.abs(end[0] - drag.start[0]) + Math.abs(end[1] - drag.start[1]) > 3;
      const [[x0, y0], [x1, y1]] = drag.original;
      const [left, right] = dragSpan(
        drag.grips[0],
        [x0, x1],
        drag.start[0],
        end[0],
        size
      );
      const [top, bottom] = dragSpan(
        drag.grips[1],
        [y0, y1],
        drag.start[1],
        end[1],
        size
      );
      const next: Drag = {
        ...drag,
        box: [
          [left, top],
          [right, bottom],
        ],
        moved,
      };
      setDrag(next);
      if (moved) {
        scheduleFilters(dragFilters(cell, next));
      }
      return;
    }
    if (event.buttons) {
      return;
    }
    // The cursor shows what a press here does to the cell's selection.
    if (cell.kind === "points" || cell.row === cell.column) {
      event.currentTarget.style.cursor = gripCursor(
        ...gripsAt(cell, local(event))
      );
    }
    setHoverCell(cell.id);
    if (cell.kind !== "points") {
      setHovered(null);
      return;
    }
    const [x, y] = local(event);
    const index = nearestRow(plan, cell, x, y);
    setHovered(index === undefined ? null : { cell: cell.id, index });
  };
  const endDrag = (cell: MatrixCell) => {
    if (drag?.cell !== cell.id) {
      return;
    }
    setDrag(null);
    if (drag.moved) {
      setPreview(null);
      setFilters(dragFilters(cell, drag));
      return;
    }
    // A click on a selection's edge leaves it as it is.
    if (gripsResize(...drag.grips)) {
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
    const mark = markFilters(plan, cell, x, y);
    if (mark) {
      setFilters(sameSelection(settings.filters, mark) ? [] : mark);
      return;
    }
    setFilters([]);
  };

  // A region shows in point cells whose two fields both carry a filter, and
  // on the diagonal of each filtered field.
  const selectionRect = (cell: MatrixCell) => {
    if (cell.kind === "blank" || cell.kind === "label") {
      return undefined;
    }
    const xSpan = filterOffsets(plan.fields[cell.column]!, settings.filters);
    if (cell.row === cell.column) {
      return xSpan
        ? { x: xSpan[0], y: 0, w: xSpan[1] - xSpan[0], h: size }
        : undefined;
    }
    if (cell.kind === "correlation" || !xSpan) {
      return undefined;
    }
    const ySpan = filterOffsets(plan.fields[cell.row]!, settings.filters);
    if (!ySpan) {
      return undefined;
    }
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

  const cellName = (cell: MatrixCell) =>
    cell.row === cell.column
      ? `${plan.fields[cell.column]!.label} distribution`
      : `${plan.fields[cell.column]!.label} by ${plan.fields[cell.row]!.label}`;
  const cellKey = (event: KeyboardEvent<SVGRectElement>, cell: MatrixCell) => {
    if (event.altKey && event.key === "Enter") {
      event.preventDefault();
      inspect("matrix-cell", cell.id);
    } else if (event.key === "Escape" && settings.filters.length) {
      event.preventDefault();
      event.stopPropagation();
      setFilters([]);
    }
  };

  return (
    <div
      className="relative select-none"
      style={{ width, height }}
      onPointerLeave={() => {
        setHovered(null);
        setHoverCell(null);
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
            ref={contextRef}
            className="pointer-events-none absolute inset-0"
            style={{
              width: plan.contentWidth,
              height: plan.contentHeight,
              visibility: plan.hasSelection ? "visible" : "hidden",
            }}
            aria-hidden="true"
          />
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
                          Math.max(30, size / field.ticks.length - 8)
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
              <CellTicks key={`ticks-${cell.id}`} cell={cell} plan={plan} />
            ))}
            {plan.cells.map((cell) => (
              <MatrixCellMarks
                key={cell.id}
                cell={cell}
                plan={plan}
                label={plan.fields[cell.column]!.label}
                mark={mark}
                liveCount={plan.liveIds.length}
              />
            ))}
            {plan.cells.map((cell) => {
              const active =
                drag?.cell === cell.id && drag.moved ? drag : undefined;
              const rect = active
                ? {
                    x: active.box[0][0],
                    y: active.box[0][1],
                    w: active.box[1][0] - active.box[0][0],
                    h: active.box[1][1] - active.box[0][1],
                  }
                : selectionRect(cell);
              if (!rect) {
                return null;
              }
              const x = cell.x + rect.x;
              const y = cell.y + rect.y;
              const w = Math.max(1, rect.w);
              const h = Math.max(1, rect.h);
              // Grips on each edge it can drag, as on the scatter plot's brush.
              const grips =
                cell.row === cell.column
                  ? [
                      [x - 2, y + h / 2 - 8, 4, 16],
                      [x + w - 2, y + h / 2 - 8, 4, 16],
                    ]
                  : [
                      [x - 2, y + h / 2 - 8, 4, 16],
                      [x + w - 2, y + h / 2 - 8, 4, 16],
                      [x + w / 2 - 8, y - 2, 16, 4],
                      [x + w / 2 - 8, y + h - 2, 16, 4],
                    ];
              return (
                <g key={`sel-${cell.id}`} pointerEvents="none">
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill="var(--primary)"
                    fillOpacity={0.09}
                    stroke="var(--primary)"
                    strokeWidth={1.25}
                  />
                  <g data-export="omit">
                    {grips.map(([gx, gy, gw, gh], index) => (
                      <rect
                        key={index}
                        x={gx}
                        y={gy}
                        width={gw}
                        height={gh}
                        rx={2}
                        fill="var(--primary)"
                      />
                    ))}
                  </g>
                </g>
              );
            })}
            {[
              tracedIndex >= 0 && { index: tracedIndex, traced: true },
              hovered && { index: hovered.index, traced: false },
            ].map(
              (ring) =>
                ring &&
                plan.cells
                  .filter((cell) => cell.kind === "points")
                  .map((cell) => {
                    const point = cellPoint(plan, cell, ring.index);
                    if (
                      !Number.isFinite(point.x) ||
                      !Number.isFinite(point.y)
                    ) {
                      return null;
                    }
                    return (
                      <circle
                        key={`${ring.traced ? "trace" : "hover"}-${cell.id}`}
                        cx={cell.x + point.x}
                        cy={cell.y + point.y}
                        r={plan.pointRadius + (ring.traced ? 4 : 3)}
                        fill="none"
                        stroke={
                          ring.traced ? "var(--primary)" : "var(--foreground)"
                        }
                        strokeWidth={ring.traced ? 2 : 1.5}
                        pointerEvents="none"
                      />
                    );
                  })
            )}
            {tracedCell &&
              plan.cells
                .filter((cell) => cell.id === tracedCell)
                .map((cell) => (
                  <rect
                    key="traced-cell"
                    x={cell.x - 1.5}
                    y={cell.y - 1.5}
                    width={size + 3}
                    height={size + 3}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    rx={2}
                    pointerEvents="none"
                  />
                ))}
            {plan.cells.map((cell) =>
              cell.kind === "blank" ? null : (
                <rect
                  key={`hit-${cell.id}`}
                  tabIndex={0}
                  role="img"
                  aria-label={`${cellName(cell)}: ${cellKindName(cell)}, ${cell.n.toLocaleString()} rows`}
                  aria-description="Alt-Enter traces this cell. Escape clears the matrix's selection."
                  onKeyDown={(event) => cellKey(event, cell)}
                  x={cell.x}
                  y={cell.y}
                  width={size}
                  height={size}
                  fill="transparent"
                  className={`outline-none focus-visible:stroke-[var(--ring)] ${
                    hoveredCell?.id === cell.id
                      ? "cursor-pointer"
                      : cell.kind === "correlation" || cell.kind === "label"
                        ? "cursor-default"
                        : "cursor-crosshair"
                  }`}
                  strokeWidth={2}
                  data-cell={cell.id}
                  onPointerDown={(event) => startDrag(event, cell)}
                  onPointerMove={(event) => moveDrag(event, cell)}
                  onPointerUp={() => endDrag(cell)}
                  onPointerCancel={() => {
                    cancelAnimationFrame(frame.current);
                    setPreview(null);
                    setDrag(null);
                  }}
                />
              )
            )}
          </svg>
        </div>
      </div>
      {!hovered && !drag && hoverCell && (
        <CellReadout
          cell={plan.cells.find((cell) => cell.id === hoverCell)}
          plan={plan}
          name={cellName}
        />
      )}
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

/**
 * Short ticks inside each plotted cell's bottom and left edges, at the outer
 * axes' tick values, so a cell far from the axes can still be read without
 * grid lines. A diagonal cell's height is a count, so it ticks x only.
 */
function CellTicks({ cell, plan }: { cell: MatrixCell; plan: MatrixPlan }) {
  if (
    cell.kind === "blank" ||
    cell.kind === "label" ||
    cell.kind === "correlation"
  ) {
    return null;
  }
  const size = plan.cellSize;
  const bottom = cell.y + size;
  const xTicks = plan.fields[cell.column]!.ticks;
  const yTicks = cell.row === cell.column ? [] : plan.fields[cell.row]!.ticks;
  return (
    <g
      className="text-muted-foreground"
      stroke="currentColor"
      strokeOpacity={0.6}
      pointerEvents="none"
    >
      {xTicks.map((tick, index) => (
        <line
          key={`x-${index}`}
          x1={cell.x + tick.offset}
          x2={cell.x + tick.offset}
          y1={bottom}
          y2={bottom - 4}
        />
      ))}
      {yTicks.map((tick, index) => (
        <line
          key={`y-${index}`}
          x1={cell.x}
          x2={cell.x + 4}
          y1={bottom - tick.offset}
          y2={bottom - tick.offset}
        />
      ))}
    </g>
  );
}

function MatrixCellMarks({
  cell,
  plan,
  label,
  mark,
  liveCount,
}: {
  cell: MatrixCell;
  plan: MatrixPlan;
  label: string;
  /** The color of one-color marks. */
  mark: string;
  liveCount: number;
}) {
  const size = plan.cellSize;
  // Larger gaps label the cell.
  // Both methods always name their rows, so two numbers never stand alone.
  const reduced = cell.n < liveCount * 0.98 || cellMethods(cell).length > 1;
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
    return (
      <g pointerEvents="none">
        <CorrelationCell cell={cell} plan={plan} />
        {count}
      </g>
    );
  }
  if (cell.density) {
    return (
      <g pointerEvents="none">
        <DensityCell cell={cell} plan={plan} mark={mark} />
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
  if (cell.boxes) {
    return (
      <g pointerEvents="none">
        <BoxCell cell={cell} plan={plan} mark={mark} />
        {count}
      </g>
    );
  }
  if (cell.pairs) {
    return (
      <g pointerEvents="none">
        <PairCell cell={cell} plan={plan} mark={mark} />
        {count}
      </g>
    );
  }
  if (cell.bars) {
    return (
      <g pointerEvents="none">
        {cell.bars.map((bar) => (
          <DiagonalBar
            key={bar.id}
            bar={bar}
            cell={cell}
            plan={plan}
            mark={mark}
          />
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
  mark,
}: {
  bar: MatrixBar;
  cell: MatrixCell;
  plan: MatrixPlan;
  mark: string;
}) {
  const size = plan.cellSize;
  const scale = (size - 4) / cell.maxBar!;
  const x = cell.x + Math.min(bar.start, bar.end) + 0.5;
  const w = Math.max(1, Math.abs(bar.end - bar.start) - 1);
  const base = cell.y + size;
  const total = bar.total * scale;
  // The selected share stacks at the base, the rest above it in gray.
  const selected = (plan.hasSelection ? bar.selected : bar.total) * scale;
  const groups = plan.groups;
  if (groups && bar.groups) {
    let top = base;
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
        {bar.groups.map((count, group) => {
          if (!count) {
            return null;
          }
          const height = count * scale;
          top -= height;
          return (
            <rect
              key={group}
              x={x}
              y={top}
              width={w}
              height={height}
              fill={groups.colors[group]}
            />
          );
        })}
      </>
    );
  }
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
      <rect x={x} y={base - selected} width={w} height={selected} fill={mark} />
    </>
  );
}

/**
 * One box per category, drawn as the box plot draws it: the box spans the
 * quartiles in its category's color, a white median sits on a dark halo, and
 * capped whiskers reach the furthest values within 1.5 IQR. Boxes take the
 * color field's colors when they split by it, and the mark color otherwise.
 * With a selection, a gray box summarizes every row, as gray points do, and a
 * narrower colored box the selected rows.
 */
function BoxCell({
  cell,
  plan,
  mark,
}: {
  cell: MatrixCell;
  plan: MatrixPlan;
  mark: string;
}) {
  const size = plan.cellSize;
  const boxes = cell.boxes!;
  const bandField = plan.fields[boxes.horizontal ? cell.row : cell.column]!;
  const valueField = plan.fields[boxes.horizontal ? cell.column : cell.row]!;
  const bandAxis = bandField.axis;
  const valueAxis = valueField.axis;
  if (bandAxis.kind !== "band" || valueAxis.kind !== "numeric") {
    return null;
  }
  const groups =
    plan.groups?.field === bandField.field ? plan.groups : undefined;
  const colorOf = (label: string) => {
    const group = groups ? groups.labels.indexOf(label) : -1;
    return group >= 0 ? groups!.colors[group]! : mark;
  };
  const bandwidth = bandAxis.scale.bandwidth();
  // Map (band offset, value) to cell pixels for either orientation.
  const point = (along: number, value: number) => {
    const across = valueAxis.scale(value);
    return boxes.horizontal
      ? { x: cell.x + across, y: cell.y + size - along }
      : { x: cell.x + along, y: cell.y + size - across };
  };
  const line = (
    along0: number,
    value0: number,
    along1: number,
    value1: number
  ) => {
    const a = point(along0, value0);
    const b = point(along1, value1);
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  };
  const draw = (
    key: string,
    center: number,
    width: number,
    stats: MatrixBoxStats,
    color: string,
    context: boolean
  ) => {
    const half = width / 2;
    const a = point(center - half, stats.q1);
    const b = point(center + half, stats.q3);
    const median = line(
      center - half,
      stats.median,
      center + half,
      stats.median
    );
    const cap = width / 4;
    return (
      <g key={key} opacity={context ? 0.45 : 1}>
        <g stroke={color} strokeWidth={1}>
          <line {...line(center, stats.low, center, stats.q1)} />
          <line {...line(center, stats.q3, center, stats.high)} />
          <line {...line(center - cap, stats.low, center + cap, stats.low)} />
          <line {...line(center - cap, stats.high, center + cap, stats.high)} />
        </g>
        <rect
          x={Math.min(a.x, b.x)}
          y={Math.min(a.y, b.y)}
          width={Math.max(1, Math.abs(b.x - a.x))}
          height={Math.max(1, Math.abs(b.y - a.y))}
          rx={2}
          fill={color}
          stroke={context ? color : "var(--eda-box-stroke)"}
          strokeWidth={1}
        />
        {!context && (
          <>
            {/* A dark halo keeps the median readable on light and dark fills. */}
            <line {...median} stroke="rgb(0 0 0 / 0.55)" strokeWidth={4} />
            <line {...median} stroke="white" strokeWidth={2} />
          </>
        )}
      </g>
    );
  };
  return (
    <>
      {boxes.groups.map((group, index) => {
        const label = bandField.bands!.labels[group.band]!;
        const center = (bandAxis.scale(label) ?? 0) + bandwidth / 2;
        const width = Math.min(bandwidth * 0.7, 28);
        const color = colorOf(label);
        if (!plan.hasSelection) {
          return draw(
            group.band.toString(),
            center,
            width,
            group.stats,
            color,
            false
          );
        }
        const selected = boxes.selected?.[index];
        return (
          <g key={group.band}>
            {draw(
              "all",
              center,
              width,
              group.stats,
              MATRIX_CONTEXT_COLOR,
              true
            )}
            {selected &&
              draw("selected", center, width * 0.6, selected, color, false)}
          </g>
        );
      })}
    </>
  );
}

/**
 * Tiles: a square per pair of categories, its area by count. Shares: a bar per
 * pair, its length the share of the column category's rows. With a selection,
 * the selected count fills inside the gray total.
 */
function PairCell({
  cell,
  plan,
  mark,
}: {
  cell: MatrixCell;
  plan: MatrixPlan;
  mark: string;
}) {
  const size = plan.cellSize;
  const pairs = cell.pairs!;
  const column = plan.fields[cell.column]!;
  const row = plan.fields[cell.row]!;
  if (column.axis.kind !== "band" || row.axis.kind !== "band") {
    return null;
  }
  const xAxis = column.axis;
  const yAxis = row.axis;
  const xWidth = xAxis.scale.bandwidth();
  const yWidth = yAxis.scale.bandwidth();
  const marks = [];
  for (let a = 0; a < pairs.columns; a++) {
    const x0 = cell.x + (xAxis.scale(column.bands!.labels[a]!) ?? 0);
    for (let b = 0; b < pairs.rows; b++) {
      const total = pairs.total[a * pairs.rows + b]!;
      if (!total) {
        continue;
      }
      const selected = plan.hasSelection
        ? cell.pairSelected![a * pairs.rows + b]!
        : total;
      const yCenter =
        cell.y +
        size -
        ((yAxis.scale(row.bands!.labels[b]!) ?? 0) + yWidth / 2);
      if (cell.kind === "tiles") {
        const side = Math.min(xWidth, yWidth);
        const outer = side * Math.sqrt(total / pairs.max);
        const inner = side * Math.sqrt(selected / pairs.max);
        const xCenter = x0 + xWidth / 2;
        marks.push(
          <g key={`${a}:${b}`}>
            {plan.hasSelection && (
              <rect
                x={xCenter - outer / 2}
                y={yCenter - outer / 2}
                width={outer}
                height={outer}
                fill={MATRIX_CONTEXT_COLOR}
                fillOpacity={0.45}
              />
            )}
            {inner > 0 && (
              <rect
                x={xCenter - inner / 2}
                y={yCenter - inner / 2}
                width={inner}
                height={inner}
                fill={mark}
              />
            )}
          </g>
        );
      } else {
        const share = pairs.columnTotal[a] ? total / pairs.columnTotal[a]! : 0;
        const selectedShare = pairs.columnTotal[a]
          ? selected / pairs.columnTotal[a]!
          : 0;
        const height = Math.max(2, Math.min(yWidth * 0.75, 18));
        marks.push(
          <g key={`${a}:${b}`}>
            {plan.hasSelection && (
              <rect
                x={x0}
                y={yCenter - height / 2}
                width={Math.max(1, xWidth * share)}
                height={height}
                fill={MATRIX_CONTEXT_COLOR}
                fillOpacity={0.45}
              />
            )}
            {selectedShare > 0 && (
              <rect
                x={x0}
                y={yCenter - height / 2}
                width={Math.max(1, xWidth * selectedShare)}
                height={height}
                fill={mark}
              />
            )}
          </g>
        );
      }
    }
  }
  return <>{marks}</>;
}

const formatR = (r: number | undefined) =>
  r === undefined ? "—" : (Math.abs(r) < 0.005 ? 0 : r).toFixed(2);

/**
 * The correlation for the pair with its method's symbol, then one line per
 * color group in its color, as many as fit the cell.
 */
function CorrelationCell({
  cell,
  plan,
}: {
  cell: MatrixCell;
  plan: MatrixPlan;
}) {
  const size = plan.cellSize;
  const fontSize = Math.max(11, Math.min(20, size / 7));
  const methods = cellMethods(cell);
  if (methods.length > 1) {
    return <BothCorrelations cell={cell} plan={plan} fontSize={fontSize} />;
  }
  const method = methods[0] ?? "pearson";
  const symbol = METHOD_SYMBOLS[method];
  const groups = plan.groups && cell.groupCorrelation ? plan.groups : undefined;
  const lineHeight = Math.max(10, Math.min(14, size / 9));
  const room = groups
    ? Math.max(0, Math.floor((size - fontSize * 2.4) / lineHeight))
    : 0;
  const shown = groups
    ? groups.labels
        .map((label, group) => ({
          label,
          group,
          r: cell.groupCorrelation![group]![method]?.value,
        }))
        .filter((item) => item.r !== undefined)
        .slice(0, room)
    : [];
  const blockHeight = fontSize * 1.9 + shown.length * lineHeight;
  const top = cell.y + (size - blockHeight) / 2;
  return (
    <>
      <text
        x={cell.x + size / 2}
        y={top + fontSize * 0.35}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize * 0.6}
        className="fill-muted-foreground"
        // Screen readers hear the method; Alt-click shows it in the trace.
        aria-label={`${METHOD_NAMES[method]} correlation`}
      >
        Correlation
      </text>
      <text
        x={cell.x + size / 2}
        y={top + fontSize * 1.2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        className="fill-foreground"
      >
        <tspan fontStyle="italic" className="fill-muted-foreground">
          {symbol}
        </tspan>{" "}
        <tspan fontWeight={600}>
          {formatR(cell.correlation?.[method]?.value)}
        </tspan>
      </text>
      {shown.map((item, index) => (
        <text
          key={item.group}
          x={cell.x + size / 2}
          y={top + fontSize * 1.9 + (index + 0.5) * lineHeight}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={lineHeight * 0.82}
          fill={groups!.colors[item.group]}
        >
          {`${truncate(item.label, size * 0.6)}: ${formatR(item.r)}`}
        </text>
      ))}
    </>
  );
}

/**
 * r above ρ, each with its symbol. Groups would not fit beside two numbers,
 * so the cell counts them and the trace lists each.
 */
function BothCorrelations({
  cell,
  plan,
  fontSize,
}: {
  cell: MatrixCell;
  plan: MatrixPlan;
  fontSize: number;
}) {
  const size = plan.cellSize;
  const size2 = fontSize * 0.9;
  const groups = plan.groups && cell.groupCorrelation ? plan.groups : undefined;
  const lines = cellMethods(cell);
  const top = cell.y + size / 2 - size2 * (groups ? 1.4 : 0.9);
  return (
    <>
      {lines.map((method, index) => (
        <text
          key={method}
          x={cell.x + size / 2}
          y={top + size2 * 0.5 + index * size2 * 1.25}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size2}
          className="fill-foreground"
        >
          <tspan fontStyle="italic" className="fill-muted-foreground">
            {METHOD_SYMBOLS[method]}
          </tspan>{" "}
          <tspan fontWeight={600}>
            {formatR(cell.correlation?.[method]?.value)}
          </tspan>
        </text>
      ))}
      {groups && (
        <text
          x={cell.x + size / 2}
          y={top + size2 * 3}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9}
          className="fill-muted-foreground"
        >
          {`${groups.labels.length} groups in trace`}
        </text>
      )}
    </>
  );
}

/** A smoothed curve as a closed area along the cell's bottom edge. */
function areaPath(
  cell: MatrixCell,
  size: number,
  centers: Float64Array,
  curve: Float64Array,
  scale: number
) {
  const base = cell.y + size;
  let path = `M${cell.x + centers[0]!},${base}`;
  for (let bin = 0; bin < curve.length; bin++) {
    path += `L${cell.x + centers[bin]!},${base - curve[bin]! * scale}`;
  }
  return `${path}L${cell.x + centers[centers.length - 1]!},${base}Z`;
}

/**
 * Kernel density of the diagonal field, scaled to counts. With a selection,
 * the gray curve holds every row and the colored curve the selection, so its
 * area shows the selected share. With a color field, each group's curve
 * overlaps the others.
 */
function DensityCell({
  cell,
  plan,
  mark,
}: {
  cell: MatrixCell;
  plan: MatrixPlan;
  mark: string;
}) {
  const size = plan.cellSize;
  const density = cell.density!;
  const scale = (size - 6) / Math.max(1e-9, density.max);
  const groups = plan.groups;
  return (
    <>
      {plan.hasSelection && (
        <path
          d={areaPath(cell, size, density.centers, density.total, scale)}
          fill={MATRIX_CONTEXT_COLOR}
          fillOpacity={0.4}
        />
      )}
      {groups && density.groups ? (
        density.groups.map((curve, group) => (
          <path
            key={group}
            d={areaPath(cell, size, density.centers, curve, scale)}
            fill={groups.colors[group]}
            fillOpacity={0.35}
            stroke={groups.colors[group]}
            strokeWidth={1}
          />
        ))
      ) : (
        <path
          d={areaPath(
            cell,
            size,
            density.centers,
            plan.hasSelection && density.selected
              ? density.selected
              : density.total,
            scale
          )}
          fill={mark}
          fillOpacity={0.55}
          stroke={mark}
          strokeWidth={1}
        />
      )}
    </>
  );
}

/** The hovered cell's name, rows, and any field that leaves rows out. */
function CellReadout({
  cell,
  plan,
  name,
}: {
  cell: MatrixCell | undefined;
  plan: MatrixPlan;
  name: (cell: MatrixCell) => string;
}) {
  if (!cell || cell.kind === "blank") {
    return null;
  }
  const live = plan.liveIds.length;
  const fields =
    cell.row === cell.column
      ? [plan.fields[cell.column]!]
      : [plan.fields[cell.column]!, plan.fields[cell.row]!];
  return (
    <ChartReadout fallbackClassName="eda-chart-readout-inline">
      <span className="eda-readout-item">
        <span>{name(cell)}</span>
        <b>{cellKindName(cell)}</b>
      </span>
      <span className="eda-readout-item">
        <span>Rows</span>
        <b>
          {cell.n.toLocaleString()} of {live.toLocaleString()}
        </b>
      </span>
      {fields
        .filter((field) => field.valid < live)
        .map((field) => (
          <span key={field.field} className="eda-readout-item">
            <span>Missing {field.label}</span>
            <b>{(live - field.valid).toLocaleString()}</b>
          </span>
        ))}
    </ChartReadout>
  );
}
