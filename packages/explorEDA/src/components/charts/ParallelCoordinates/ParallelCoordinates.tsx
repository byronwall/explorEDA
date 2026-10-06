import { detectColumnType } from "@/components/SummaryTable/utils/dataTypeDetection";
import { Button } from "@/components/ui/button";
import { ChartStatusLine, STATUS_HINT_MIN_WIDTH } from "../ChartStatusLine";
import { ChartMessage } from "../ChartMessage";
import { ActionTooltip } from "@/components/ui/tooltip";
import { categoryKey, categoryValue } from "@/lib/categories";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps, datum } from "@/types/ChartTypes";
import { ArrowDownUp, X } from "lucide-react";
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
import { ChartReadout } from "../ChartReadout";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import type { ParallelCoordinatesSettings } from "./definition";
import {
  brushToFilter,
  findNearestLine,
  moveAxis,
  planParallelCoordinates,
  toggleAxisCategory,
  withAxisFilter,
  type ParallelAxis,
  type ParallelAxisKind,
  type ParallelLine,
  type ParallelPlan,
  type ParallelSnapshot,
} from "./parallelPlan";
import {
  findParallelTraceRow,
  parallelTraceTargets,
  resolveParallelTrace,
} from "./parallelTrace";

type DragMode = "new" | "move" | "top" | "bottom";
interface BrushDrag {
  axis: number;
  mode: DragMode;
  start: number;
  origin: { y0: number; y1: number };
  y0: number;
  y1: number;
  moved: boolean;
}

const HEADER_WIDTH = 150;
const EDGE = 5;

const truncate = (text: string, pixels: number) => {
  const max = Math.max(2, Math.floor(pixels / 6));
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

function contextStroke(element: HTMLElement) {
  const value = getComputedStyle(element)
    .getPropertyValue("--muted-foreground")
    .trim();
  return value || "#8a94a3";
}

/** Points for one line in plot coordinates. */
const linePoints = (plan: ParallelPlan, line: ParallelLine) =>
  plan.axes.map((axis, index) => `${axis.x},${line.ys[index]}`).join(" ");

function HoverReadout({
  line,
  plan,
  snapshot,
  format,
  colorLabel,
}: {
  line: ParallelLine;
  plan: ParallelPlan;
  snapshot: ParallelSnapshot;
  format: (field: string, value: datum) => string;
  colorLabel?: { label: string; value: string };
}) {
  const items: [string, string][] = [];
  if (colorLabel) {
    items.push([colorLabel.label, colorLabel.value]);
  }
  for (const axis of plan.axes) {
    items.push([
      axis.label,
      format(axis.field, snapshot.columns[axis.field]?.[line.id]),
    ]);
  }
  items.push(["Row", line.id.toLocaleString()]);
  if (plan.hasSelection && !line.selected) {
    items.push(["Selection", "Outside"]);
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

export function ParallelCoordinates({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<ParallelCoordinatesSettings>) {
  const getColumnData = useDataLayer((s) => s.getColumnData);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const formatFieldValue = useDataLayer((s) => s.formatFieldValue);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const profiles = useDataLayer((s) => s.fieldProfiles);
  const nonce = useDataLayer((s) => s.nonce);
  const updateChart = useDataLayer((s) => s.updateChart);
  const colorScale = useDataLayer((s) =>
    s.colorScales.find((item) => item.id === settings.colorScaleId)
  );
  const liveIds = useGetLiveIds(settings, facetIds);
  const allIds = useGetAllIds();
  const revision = useTraceRevision(settings);
  const trace = useChartTrace();
  const traceApi = useChartTraceApi();
  const owner = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [drag, setDrag] = useState<BrushDrag | null>(null);
  const [reorder, setReorder] = useState<{ index: number; dx: number } | null>(
    null
  );
  const reorderStart = useRef<{
    index: number;
    x: number;
    moved: boolean;
  } | null>(null);
  const frame = useRef(0);

  const fieldKey = [
    ...settings.axes.map((axis) => axis.field),
    ...settings.filters.map((filter) => filter.field),
  ].join("\u0000");
  const snapshot = useMemo((): ParallelSnapshot => {
    const fields = [...new Set(fieldKey.split("\u0000").filter(Boolean))];
    const columns: ParallelSnapshot["columns"] = {};
    const kinds: Record<string, ParallelAxisKind> = {};
    for (const field of fields) {
      columns[field] = getColumnData(field);
      const type =
        profiles.find((profile) => profile.name === field)?.dataType ??
        detectColumnType(columns[field]!);
      kinds[field] = type === "numeric" ? "numeric" : "categorical";
    }
    return {
      revision,
      allIds,
      liveIds,
      columns,
      kinds,
      colorData: settings.colorField
        ? getColumnData(settings.colorField)
        : undefined,
      colorScale,
    };
    // The nonce carries data edits; column maps are replaced when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fieldKey,
    revision,
    allIds,
    liveIds,
    profiles,
    nonce,
    settings.colorField,
    colorScale,
    getColumnData,
  ]);

  const plan = useMemo(
    () =>
      planParallelCoordinates({
        settings,
        width,
        height,
        snapshot,
        getFieldLabel,
        formatFieldValue,
      }),
    // Field settings carry label and format changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, width, height, snapshot, fieldSettings]
  );

  const source = useMemo(
    (): TraceSource => ({
      role: "chart",
      chartId: settings.id,
      revision: plan.revision,
      resolve: (kind, id) =>
        resolveParallelTrace(plan, snapshot, settings.colorField, kind, id),
      findRow: (id) => findParallelTraceRow(plan, id),
      targets: () => parallelTraceTargets(plan),
    }),
    [plan, snapshot, settings.colorField]
  );
  useTraceSource(owner, source);
  const inspect = useCallback(
    (kind: string, id: string) => traceApi?.inspect(owner, kind, id),
    [owner, traceApi]
  );
  const tracedRow =
    trace?.selection?.owner === owner && trace.selection.kind === "polyline"
      ? Number(trace.selection.id.replace("row:", ""))
      : undefined;
  const tracedAxis =
    trace?.selection?.owner === owner && trace.selection.kind === "pc-axis"
      ? trace.selection.id
      : undefined;

  // Lines live on a canvas; the hovered and traced lines are drawn in SVG above.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }
    const dpr =
      typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.translate(plan.margin.left, plan.margin.top);
    ctx.lineJoin = "round";
    const draw = (line: ParallelLine) => {
      ctx.beginPath();
      plan.axes.forEach((axis, index) => {
        if (index === 0) {
          ctx.moveTo(axis.x, line.ys[index]!);
        } else {
          ctx.lineTo(axis.x, line.ys[index]!);
        }
      });
      ctx.stroke();
    };
    if (plan.hasSelection) {
      ctx.strokeStyle = contextStroke(canvas);
      ctx.globalAlpha = Math.min(0.22, plan.lineOpacity * 0.4);
      ctx.lineWidth = Math.max(0.75, plan.lineWidth * 0.8);
      for (const line of plan.lines) {
        if (!line.selected) {
          draw(line);
        }
      }
    }
    ctx.globalAlpha = plan.lineOpacity;
    ctx.lineWidth = plan.lineWidth;
    // Group by color so each stroke style is set once.
    const byColor = new Map<string, ParallelLine[]>();
    for (const line of plan.lines) {
      if (!line.selected) {
        continue;
      }
      const group = byColor.get(line.color);
      if (group) {
        group.push(line);
      } else {
        byColor.set(line.color, [line]);
      }
    }
    for (const [color, lines] of byColor) {
      ctx.strokeStyle = color;
      for (const line of lines) {
        draw(line);
      }
    }
  }, [plan, width, height]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const commitFilter = useCallback(
    (field: string, filter: ReturnType<typeof brushToFilter>) => {
      updateChart(settings.id, {
        filters: withAxisFilter(settings.filters, field, filter),
      });
    },
    [settings.filters, settings.id, updateChart]
  );
  const scheduleCommit = (axis: ParallelAxis, y0: number, y1: number) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() =>
      commitFilter(axis.field, brushToFilter(axis, plan.plotHeight, y0, y1))
    );
  };

  const plotY = (event: { clientY: number }) => {
    const bounds = svgRef.current!.getBoundingClientRect();
    return event.clientY - bounds.top - plan.margin.top;
  };
  const plotX = (event: { clientX: number }) => {
    const bounds = svgRef.current!.getBoundingClientRect();
    return event.clientX - bounds.left - plan.margin.left;
  };
  const clampY = (y: number) => Math.max(0, Math.min(plan.plotHeight, y));

  const startBrush = (
    event: PointerEvent<SVGRectElement>,
    axis: ParallelAxis
  ) => {
    if (event.button !== 0) {
      return;
    }
    if (event.altKey) {
      inspect("pc-axis", axis.id);
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const y = clampY(plotY(event));
    const brush = axis.brush;
    const mode: DragMode =
      brush && axis.kind === "numeric" && Math.abs(y - brush.y0) <= EDGE
        ? "top"
        : brush && axis.kind === "numeric" && Math.abs(y - brush.y1) <= EDGE
          ? "bottom"
          : brush && y > brush.y0 && y < brush.y1
            ? "move"
            : "new";
    const origin = brush ? { y0: brush.y0, y1: brush.y1 } : { y0: y, y1: y };
    setHovered(null);
    setDrag({
      axis: axis.index,
      mode,
      start: y,
      origin,
      y0: origin.y0,
      y1: origin.y1,
      moved: false,
    });
  };
  const moveBrush = (
    event: PointerEvent<SVGRectElement>,
    axis: ParallelAxis
  ) => {
    if (!drag || drag.axis !== axis.index) {
      return;
    }
    const y = clampY(plotY(event));
    const delta = y - drag.start;
    let { y0, y1 } = drag.origin;
    if (drag.mode === "new") {
      y0 = Math.min(drag.start, y);
      y1 = Math.max(drag.start, y);
    } else if (drag.mode === "move") {
      const shift = Math.max(-y0, Math.min(plan.plotHeight - y1, delta));
      y0 += shift;
      y1 += shift;
    } else if (drag.mode === "top") {
      y0 = Math.min(y, y1);
      y1 = Math.max(y, y1);
    } else {
      y1 = Math.max(y, y0);
      y0 = Math.min(y, y0);
    }
    const moved = drag.moved || Math.abs(delta) > 2;
    setDrag({ ...drag, y0, y1, moved });
    if (moved && y1 - y0 > 1) {
      scheduleCommit(axis, y0, y1);
    }
  };
  const endBrush = (axis: ParallelAxis) => {
    if (!drag || drag.axis !== axis.index) {
      return;
    }
    cancelAnimationFrame(frame.current);
    if (!drag.moved) {
      // A click on an empty part of the axis clears its selection.
      if (drag.mode === "new" && axis.brush) {
        commitFilter(axis.field, undefined);
      }
    } else {
      commitFilter(
        axis.field,
        brushToFilter(axis, plan.plotHeight, drag.y0, drag.y1)
      );
    }
    setDrag(null);
  };

  const brushKey = (
    event: KeyboardEvent<SVGRectElement>,
    axis: ParallelAxis
  ) => {
    if (event.altKey && event.key === "Enter") {
      event.preventDefault();
      inspect("pc-axis", axis.id);
      return;
    }
    const step =
      axis.kind === "categorical" ? axis.bandHeight : plan.plotHeight * 0.05;
    const brush = axis.brush;
    const apply = (y0: number, y1: number) => {
      event.preventDefault();
      commitFilter(
        axis.field,
        brushToFilter(axis, plan.plotHeight, clampY(y0), clampY(y1))
      );
    };
    if (!brush) {
      if (event.key === "Enter" || event.key === " ") {
        const middle = plan.plotHeight / 2;
        const half =
          axis.kind === "categorical"
            ? axis.bandHeight / 2
            : plan.plotHeight / 6;
        apply(middle - half, middle + half);
      }
      return;
    }
    const { y0, y1 } = brush;
    if (
      event.key === "Delete" ||
      event.key === "Backspace" ||
      event.key === "Escape"
    ) {
      event.preventDefault();
      event.stopPropagation();
      commitFilter(axis.field, undefined);
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const sign = event.key === "ArrowUp" ? -1 : 1;
      if (event.shiftKey) {
        // Shift+Up grows the selection; Shift+Down shrinks it.
        const grow = (-sign * step) / 2;
        if (y1 - y0 + grow * 2 >= 2) {
          apply(y0 - grow, y1 + grow);
        } else {
          event.preventDefault();
        }
      } else {
        const shift = Math.max(
          -y0,
          Math.min(plan.plotHeight - y1, sign * step)
        );
        apply(y0 + shift, y1 + shift);
      }
    }
  };

  const updateAxes = (axes: ParallelCoordinatesSettings["axes"]) =>
    updateChart(settings.id, { axes });
  const axisSettingsIndex = (axis: ParallelAxis) =>
    settings.axes.findIndex((item) => item.field === axis.field);
  const spacing =
    plan.axes.length > 1
      ? plan.plotWidth / (plan.axes.length - 1)
      : plan.plotWidth;
  const dropIndex = reorder
    ? Math.max(
        0,
        Math.min(
          plan.axes.length - 1,
          Math.round(
            (plan.axes[reorder.index]!.x + reorder.dx) / Math.max(1, spacing)
          )
        )
      )
    : undefined;

  if (settings.axes.filter((axis) => axis.field).length < 2) {
    return (
      <ChartMessage width={width} height={height}>
        Choose at least two fields for the axes in chart settings.
      </ChartMessage>
    );
  }

  const format = (field: string, value: datum) =>
    value == null || value === ""
      ? "(missing)"
      : formatFieldValue(field, value);
  const hoveredLine =
    hovered === null
      ? undefined
      : plan.lines.find((line) => line.id === hovered);
  const tracedLine =
    tracedRow === undefined
      ? undefined
      : plan.lines.find((line) => line.id === tracedRow);
  // Values sit beside the dots of one line, so a reading never needs the readout.
  const labeledLine = hoveredLine ?? tracedLine;
  const lineCategory = (axis: ParallelAxis) =>
    labeledLine &&
    categoryKey(categoryValue(snapshot.columns[axis.field]?.[labeledLine.id]));
  const headerWidth = Math.min(HEADER_WIDTH, Math.max(56, spacing - 8));
  const narrow = width < STATUS_HINT_MIN_WIDTH;
  const statusParts = [
    plan.hasSelection
      ? `${plan.selectedCount.toLocaleString()} of ${plan.lines.length.toLocaleString()} ${narrow ? "selected" : "lines selected"}`
      : `${plan.lines.length.toLocaleString()} lines`,
    plan.omittedIds.length > 0 &&
      (narrow
        ? `${plan.omittedIds.length.toLocaleString()} incomplete rows hidden`
        : `${plan.omittedIds.length.toLocaleString()} rows missing an axis value are not drawn`),
    ...plan.rejected.map(
      (item) => `${item.label} has ${item.count} values, too many for an axis`
    ),
  ];
  const statusHint =
    !plan.hasSelection &&
    !narrow &&
    !facetIds &&
    (plan.axes.some((axis) => axis.kind === "categorical")
      ? "Drag along an axis or click a value to select"
      : "Drag along an axis to select a range");

  return (
    <div
      className="relative select-none"
      style={{ width, height }}
      onPointerLeave={() => setHovered(null)}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        style={{ width, height }}
        aria-hidden="true"
      />
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="absolute inset-0 block overflow-visible"
        role="group"
        aria-label={`Parallel coordinates across ${plan.axes.map((axis) => axis.label).join(", ")}`}
      >
        <g transform={`translate(${plan.margin.left},${plan.margin.top})`}>
          <rect
            x={-8}
            y={-4}
            width={plan.plotWidth + 16}
            height={plan.plotHeight + 8}
            fill="transparent"
            className={hoveredLine ? "cursor-pointer" : undefined}
            onPointerMove={(event) => {
              if (event.buttons || drag) {
                return;
              }
              const x = plotX(event);
              const line = findNearestLine(plan, x, plotY(event));
              setHovered(line?.id ?? null);
            }}
            onClick={(event) => {
              const line = findNearestLine(plan, plotX(event), plotY(event));
              if (line) {
                inspect("polyline", `row:${line.id}`);
              }
            }}
          />
          {(tracedLine || hoveredLine) && (
            <g pointerEvents="none" aria-hidden="true">
              {[tracedLine, hoveredLine]
                .filter(
                  (line, index, list): line is ParallelLine =>
                    Boolean(line) && list.indexOf(line) === index
                )
                .map((line) => (
                  <g key={line.id}>
                    <polyline
                      points={linePoints(plan, line)}
                      fill="none"
                      stroke="var(--background)"
                      strokeWidth={plan.lineWidth + 4}
                      strokeLinejoin="round"
                    />
                    <polyline
                      points={linePoints(plan, line)}
                      fill="none"
                      stroke={line.color}
                      strokeWidth={plan.lineWidth + 1.5}
                      strokeLinejoin="round"
                    />
                    {plan.axes.map((axis, index) => (
                      <circle
                        key={axis.id}
                        cx={axis.x}
                        cy={line.ys[index]}
                        r={3}
                        fill={line.color}
                        stroke="var(--background)"
                        strokeWidth={1.5}
                      />
                    ))}
                    {line === labeledLine &&
                      plan.axes.map((axis, index) => {
                        if (axis.kind !== "numeric") {
                          return null;
                        }
                        const last = index === plan.axes.length - 1;
                        return (
                          <text
                            key={`${axis.id}-value`}
                            className="eda-pc-value"
                            x={axis.x + (last ? -8 : 8)}
                            y={line.ys[index]}
                            textAnchor={last ? "end" : "start"}
                            dominantBaseline="central"
                          >
                            {format(
                              axis.field,
                              snapshot.columns[axis.field]?.[line.id]
                            )}
                          </text>
                        );
                      })}
                  </g>
                ))}
            </g>
          )}
          {dropIndex !== undefined &&
            reorder &&
            dropIndex !== reorder.index && (
              <line
                x1={plan.axes[dropIndex]!.x}
                x2={plan.axes[dropIndex]!.x}
                y1={-6}
                y2={plan.plotHeight + 6}
                stroke="var(--primary)"
                strokeWidth={2}
                strokeDasharray="4 3"
                aria-hidden="true"
              />
            )}
          {plan.axes.map((axis) => {
            const active = drag?.axis === axis.index ? drag : undefined;
            const extent = active
              ? { y0: active.y0, y1: active.y1 }
              : axis.brush;
            const showExtent =
              extent && (!active || active.moved || active.mode !== "new");
            const labelRoom = Math.min(90, spacing * 0.42);
            const isTraced = tracedAxis === axis.id;
            return (
              <g
                key={axis.id}
                transform={`translate(${axis.x + (reorder?.index === axis.index ? reorder.dx : 0)},0)`}
                data-plan-id={axis.id}
              >
                <line
                  y1={0}
                  y2={plan.plotHeight}
                  stroke="var(--foreground)"
                  strokeOpacity={isTraced ? 0.9 : 0.45}
                  strokeWidth={isTraced ? 2 : 1}
                />
                <g
                  className="fill-muted-foreground"
                  fontSize={10}
                  aria-hidden="true"
                >
                  {axis.kind === "numeric" &&
                    axis.ticks.map((tick, index) => (
                      <g
                        key={`${tick.label}-${index}`}
                        transform={`translate(0,${tick.y})`}
                      >
                        <line
                          x1={-4}
                          x2={0}
                          stroke="var(--foreground)"
                          strokeOpacity={0.45}
                        />
                        <text
                          x={-6}
                          dominantBaseline="middle"
                          textAnchor="end"
                          paintOrder="stroke"
                          stroke="var(--background)"
                          strokeWidth={3}
                          strokeLinejoin="round"
                        >
                          {tick.label}
                        </text>
                      </g>
                    ))}
                </g>
                {showExtent && extent && (
                  <g pointerEvents="none">
                    <rect
                      x={-8}
                      y={extent.y0}
                      width={16}
                      height={Math.max(2, extent.y1 - extent.y0)}
                      rx={3}
                      fill="var(--primary)"
                      fillOpacity={0.16}
                      stroke="var(--primary)"
                      strokeWidth={1.5}
                    />
                    {[extent.y0, extent.y1].map((y, index) => (
                      <line
                        key={index}
                        x1={-5}
                        x2={5}
                        y1={y}
                        y2={y}
                        stroke="var(--primary)"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                    ))}
                    {!active && axis.brush && axis.kind === "numeric" && (
                      <text
                        x={axis.index === plan.axes.length - 1 ? -11 : 11}
                        textAnchor={
                          axis.index === plan.axes.length - 1 ? "end" : "start"
                        }
                        y={Math.max(9, axis.brush.y0 + 1)}
                        dominantBaseline="hanging"
                        fontSize={10}
                        fontWeight={600}
                        className="fill-foreground"
                        paintOrder="stroke"
                        stroke="var(--background)"
                        strokeWidth={3}
                        strokeLinejoin="round"
                      >
                        {truncate(axis.brush.text, Math.max(60, spacing * 0.5))}
                      </text>
                    )}
                  </g>
                )}
                <rect
                  x={-12}
                  y={-4}
                  width={24}
                  height={plan.plotHeight + 8}
                  fill="transparent"
                  className="cursor-crosshair outline-none focus-visible:stroke-[var(--ring)]"
                  strokeWidth={2}
                  rx={4}
                  tabIndex={0}
                  role="group"
                  aria-label={`${axis.label} axis. ${
                    axis.brush
                      ? `Selected ${axis.brush.text}.`
                      : "No selection."
                  } Drag to select a range.`}
                  aria-description={
                    axis.brush
                      ? "Arrow keys move the selection, Shift with Up or Down grows or shrinks it, Delete clears it. Alt-Enter traces the axis."
                      : "Enter selects the middle of the axis. Alt-Enter traces the axis."
                  }
                  onPointerDown={(event) => startBrush(event, axis)}
                  onPointerMove={(event) => moveBrush(event, axis)}
                  onPointerUp={() => endBrush(axis)}
                  onPointerCancel={() => setDrag(null)}
                  onPointerEnter={() => setHovered(null)}
                  onKeyDown={(event) => brushKey(event, axis)}
                />
                {axis.kind === "categorical" && (
                  <g fontSize={10} aria-hidden="true">
                    {axis.categories.map((category) => {
                      const text = truncate(category.label, labelRoom);
                      // Bold text runs wider, so selected pills get more room.
                      const pill =
                        text.length * (category.selected ? 6.2 : 5.6) + 10;
                      const onLine = lineCategory(axis) === category.key;
                      return (
                        <g
                          key={category.key}
                          className="eda-pc-pill"
                          data-selected={category.selected || undefined}
                          data-on-line={onLine || undefined}
                          transform={`translate(${axis.index === plan.axes.length - 1 ? -pill - 6 : 6},${category.center})`}
                          onPointerEnter={() => setHovered(null)}
                          onClick={(event) =>
                            updateChart(settings.id, {
                              filters: toggleAxisCategory(
                                settings.filters,
                                axis,
                                category,
                                event.shiftKey || event.metaKey || event.ctrlKey
                              ),
                            })
                          }
                        >
                          <rect y={-8} width={pill} height={16} rx={8} />
                          <text
                            x={pill / 2}
                            dominantBaseline="central"
                            textAnchor="middle"
                          >
                            {text}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      {plan.axes.map((axis) => {
        const index = axisSettingsIndex(axis);
        const left =
          plan.margin.left +
          axis.x +
          (reorder?.index === axis.index ? reorder.dx : 0) -
          headerWidth / 2;
        return (
          <div
            key={axis.id}
            className="absolute flex flex-col items-center gap-0.5"
            style={{ left, top: settings.margin.top, width: headerWidth }}
          >
            <ActionTooltip
              content={
                <>
                  {axis.label}
                  <br />
                  Drag sideways to reorder, or press Shift with Left or Right.
                  Alt-click to trace this axis.
                </>
              }
            >
              <button
                type="button"
                className={`max-w-full truncate rounded px-1 text-xs font-semibold leading-5 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring ${
                  reorder?.index === axis.index
                    ? "cursor-grabbing bg-accent"
                    : "cursor-grab"
                }`}
                aria-label={`${axis.label}, axis ${axis.index + 1} of ${plan.axes.length}`}
                aria-keyshortcuts="Shift+ArrowLeft Shift+ArrowRight"
                onPointerDown={(event) => {
                  if (event.button !== 0 || event.altKey) {
                    return;
                  }
                  event.currentTarget.setPointerCapture?.(event.pointerId);
                  reorderStart.current = {
                    index: axis.index,
                    x: event.clientX,
                    moved: false,
                  };
                }}
                onPointerMove={(event) => {
                  const start = reorderStart.current;
                  if (!start || start.index !== axis.index) {
                    return;
                  }
                  const dx = event.clientX - start.x;
                  if (!start.moved && Math.abs(dx) < 4) {
                    return;
                  }
                  start.moved = true;
                  setReorder({ index: axis.index, dx });
                }}
                onPointerUp={() => {
                  const start = reorderStart.current;
                  reorderStart.current = null;
                  if (start?.moved && dropIndex !== undefined) {
                    updateAxes(moveAxis(settings.axes, index, dropIndex));
                  }
                  setReorder(null);
                }}
                onPointerCancel={() => {
                  reorderStart.current = null;
                  setReorder(null);
                }}
                onClick={(event) => {
                  if (event.altKey) {
                    inspect("pc-axis", axis.id);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.altKey && event.key === "Enter") {
                    event.preventDefault();
                    inspect("pc-axis", axis.id);
                  } else if (
                    event.shiftKey &&
                    (event.key === "ArrowLeft" || event.key === "ArrowRight")
                  ) {
                    event.preventDefault();
                    const target = index + (event.key === "ArrowLeft" ? -1 : 1);
                    updateAxes(moveAxis(settings.axes, index, target));
                    // The header remounts at its new place; keep focus on it.
                    const doc = event.currentTarget.ownerDocument;
                    const selector = `[data-axis-header="${CSS.escape(`${settings.id}:${axis.field}`)}"]`;
                    requestAnimationFrame(() =>
                      doc.querySelector<HTMLElement>(selector)?.focus()
                    );
                  }
                }}
                data-axis-header={`${settings.id}:${axis.field}`}
              >
                {truncate(axis.label, headerWidth - 8)}
              </button>
            </ActionTooltip>
            <div className="flex h-5 items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className={`size-5 ${axis.inverted ? "text-primary" : "text-muted-foreground"}`}
                aria-label={`Flip ${axis.label}`}
                aria-pressed={axis.inverted}
                tooltip={
                  axis.inverted
                    ? "High values are at the bottom. Click to put them back on top. Selections stay the same."
                    : "Flip this axis so high values sit at the bottom. Flipping can untangle crossing lines; selections stay the same."
                }
                onClick={() =>
                  updateAxes(
                    settings.axes.map((item, position) =>
                      position === index
                        ? { ...item, inverted: !item.inverted }
                        : item
                    )
                  )
                }
              >
                <ArrowDownUp className="size-3" />
              </Button>
              {axis.brush && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-muted-foreground"
                  aria-label={`Clear ${axis.label} selection`}
                  tooltip={`Clear the ${axis.label} selection (${axis.matching?.toLocaleString() ?? 0} rows in range).`}
                  onClick={() => commitFilter(axis.field, undefined)}
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
      <ChartStatusLine
        parts={statusParts}
        hint={statusHint}
        left={settings.margin.left}
        right={settings.margin.right}
        bottom={settings.margin.bottom}
      />
      {hoveredLine && !drag && !reorder && (
        <HoverReadout
          line={hoveredLine}
          plan={plan}
          snapshot={snapshot}
          format={format}
          colorLabel={
            settings.colorField
              ? {
                  label: getFieldLabel(settings.colorField),
                  value: format(
                    settings.colorField,
                    snapshot.colorData?.[hoveredLine.id]
                  ),
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
