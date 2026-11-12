import { useThemeColors } from "@/hooks/useDisplayColorScales";
import { useDisplayColorScale } from "@/hooks/useDisplayColorScales";
import { useAxisTypography } from "../chartTypography";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
import { ChartMessage, NO_MATCHING_ROWS } from "../ChartMessage";
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  useChartTrace,
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import { useGetColumnData } from "../useGetColumnData";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import { ChartReadout } from "../ChartReadout";
import {
  annotationSlot,
  type ChartAnnotationFrame,
} from "../annotations/ChartAnnotations";
import {
  AxisValuePill as AxisValue,
  pillX,
  spreadLabels as spread,
} from "../PlotValueLabels";
import type { EcdfSettings } from "./definition";
import {
  countInRange,
  planEcdf,
  shareAt,
  snapToValue,
  thresholdFilter,
  type EcdfPlan,
  type EcdfSnapshot,
} from "./ecdfPlan";
import {
  ecdfStepId,
  ecdfTraceTargets,
  findEcdfTraceRow,
  resolveEcdfTrace,
} from "./ecdfTrace";
import {
  dragSpan,
  gripCursor,
  gripsResize,
  spanGrip,
  type Grip,
} from "@/hooks/brushSpan";

const pct = (share: number) =>
  share.toLocaleString("en-US", { style: "percent", maximumFractionDigits: 1 });

type ReadoutRow = {
  key: string;
  label: string;
  color: string;
  share: number;
  count: number;
  total: number;
};

/** The hovered value or dragged span, then each curve's share, in the panel header. */
function Readout({
  label,
  value,
  rows,
}: {
  label: string;
  value: string;
  rows: ReadoutRow[];
}) {
  return (
    <ChartReadout fallbackClassName="eda-chart-readout-inline">
      <span className="eda-readout-item">
        <span>{label}</span>
        <b>{value}</b>
      </span>
      {rows.map((row) => (
        <span key={row.key} className="eda-readout-item">
          <span>{row.label}</span>
          <b>
            {pct(row.share)} ({row.count.toLocaleString()}/
            {row.total.toLocaleString()})
          </b>
        </span>
      ))}
    </ChartReadout>
  );
}

export function EcdfChart({
  settings,
  width,
  height,
  facetIds,
  facetKey,
}: BaseChartProps<EcdfSettings>) {
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const formatFieldValue = useDataLayer((s) => s.formatFieldValue);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const updateChart = useDataLayer((s) => s.updateChart);
  const colorScale = useDisplayColorScale(settings.colorScaleId);
  const liveIds = useGetLiveIds(settings, facetIds);
  const allIds = useGetAllIds(settings);
  const values = useGetColumnData(settings.field);
  const groupData = useGetColumnData(settings.colorField);
  const revision = useTraceRevision(settings);
  const trace = useChartTrace();
  const traceApi = useChartTraceApi();
  const owner = useId();
  const typography = useAxisTypography();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focusValue, setFocusValue] = useState<number | null>(null);
  const [drag, setDrag] = useState<{
    /** Draw a new span, move the selection, or resize one of its ends. */
    grip: Grip;
    /** Where the press began, in plot pixels. */
    at: number;
    /** The selection's ends in pixels when the press began. */
    origin: [number, number];
    /** Which ends are open, as in a threshold; a move keeps them open. */
    open: [boolean, boolean];
    /** Where the pointer is now, in plot pixels. */
    x: number;
    moved: boolean;
  } | null>(null);

  const themeColors = useThemeColors();
  const snapshot = useMemo(
    (): EcdfSnapshot => ({
      revision,
      allIds,
      liveIds,
      values,
      groupData: settings.colorField ? groupData : undefined,
      colorScale,
      themeColors,
    }),
    [
      revision,
      allIds,
      liveIds,
      values,
      groupData,
      settings.colorField,
      colorScale,
      themeColors,
    ]
  );
  const plan = useMemo(
    () =>
      planEcdf({
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
      revision: plan.revision,
      resolve: (kind, id) => resolveEcdfTrace(plan, kind, id),
      findRow: (id) => findEcdfTraceRow(plan, id),
      targets: () => ecdfTraceTargets(plan),
    }),
    [plan]
  );
  useTraceSource(owner, source);
  const annotationFrame = useMemo((): ChartAnnotationFrame | undefined => {
    if (!settings.annotations?.length) return undefined;
    // A facet's calculations read only that facet's rows.
    const facet = facetIds && new Set(facetIds);
    return {
      xScale: plan.xScale,
      yScale: plan.yScale,
      plotWidth: plan.plotWidth,
      plotHeight: plan.plotHeight,
      marks: {
        paths: plan.curves.map((curve) => curve.path),
        points: plan.curves.flatMap((curve) =>
          curve.quantiles.map(({ px, py }) => ({ x: px, y: py, r: 4 }))
        ),
      },
      xField: settings.field,
      facetKey,
      population: {
        all: facet ? allIds.filter((id) => facet.has(id)) : allIds,
        filtered: liveIds,
      },
    };
  }, [
    settings.annotations,
    settings.field,
    plan,
    facetIds,
    facetKey,
    allIds,
    liveIds,
  ]);
  const clipId = `${owner.replace(/:/g, "")}-plot`;
  const inspect = useCallback(
    (kind: string, id: string) => traceApi?.inspect(owner, kind, id),
    [owner, traceApi]
  );
  const traced =
    trace?.selection?.owner === owner && trace.selection.kind === "ecdf-step"
      ? resolveEcdfTrace(plan, "ecdf-step", trace.selection.id)
      : undefined;

  if (!settings.field) {
    return (
      <ChartMessage width={width} height={height}>
        Choose a numeric field in chart settings.
      </ChartMessage>
    );
  }
  if (plan.validCount === 0) {
    return (
      <ChartMessage width={width} height={height}>
        {plan.liveCount > 0
          ? `No numeric values in ${plan.fieldLabel} for these rows.`
          : NO_MATCHING_ROWS}
      </ChartMessage>
    );
  }

  const format = (value: number) => formatFieldValue(settings.field, value);
  const comparator = plan.direction === "below" ? "≤" : "≥";
  const plotX = (clientX: number) =>
    clientX - svgRef.current!.getBoundingClientRect().left - plan.margin.left;
  const plotY = (clientY: number) =>
    clientY - svgRef.current!.getBoundingClientRect().top - plan.margin.top;
  const commit = (from: number | undefined, to?: number) => {
    const rest = settings.filters.filter(
      (filter) => !(filter.type === "range" && filter.field === settings.field)
    );
    updateChart(settings.id, {
      filters:
        from === undefined
          ? rest
          : [
              ...rest,
              thresholdFilter(settings.field, settings.direction, from, to),
            ],
    });
  };
  const sameThreshold = (value: number) => {
    const filter = plan.selection?.filter;
    return (
      filter &&
      (plan.direction === "below"
        ? filter.max === value && filter.min === undefined
        : filter.min === value && filter.max === undefined)
    );
  };
  const nearestCurve = (value: number, y?: number) => {
    const visible = plan.curves.filter((curve) => curve.count > 0);
    if (y === undefined) {
      return visible[0];
    }
    return visible.reduce((best, curve) =>
      Math.abs(plan.py(shareAt(curve, value, plan.direction)) - y) <
      Math.abs(plan.py(shareAt(best, value, plan.direction)) - y)
        ? curve
        : best
    );
  };
  const traceAt = (value: number, y?: number) => {
    const curve = nearestCurve(value, y);
    if (curve) {
      inspect("ecdf-step", ecdfStepId(curve, value));
    }
  };

  const handleKey = (event: KeyboardEvent) => {
    const index = Math.max(
      0,
      plan.values.indexOf(
        focusValue ?? hovered ?? plan.selection?.filter.max ?? plan.values[0]!
      )
    );
    const step = event.shiftKey ? 10 : 1;
    const go = (next: number) => {
      event.preventDefault();
      const value =
        plan.values[Math.max(0, Math.min(plan.values.length - 1, next))]!;
      setFocusValue(value);
      setHovered(value);
    };
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      go(index + step);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      go(index - step);
    } else if (event.key === "Home") {
      go(0);
    } else if (event.key === "End") {
      go(plan.values.length - 1);
    } else if (event.key === "Enter" && event.altKey) {
      event.preventDefault();
      traceAt(plan.values[index]!);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const value = plan.values[index]!;
      commit(sameThreshold(value) ? undefined : value);
    } else if (
      (event.key === "Delete" ||
        event.key === "Backspace" ||
        event.key === "Escape") &&
      plan.selection
    ) {
      event.preventDefault();
      event.stopPropagation();
      commit(undefined);
    }
  };

  // Like every brush: an edge resizes, the body moves, outside draws a span.
  // An open end sits at the plot's edge and has nothing to resize.
  const gripAt = (x: number): Grip => {
    const selection = plan.selection;
    if (!selection) {
      return "draw";
    }
    const grip = spanGrip([selection.x0, selection.x1], x);
    return (grip === "start" && selection.filter.min === undefined) ||
      (grip === "end" && selection.filter.max === undefined)
      ? "move"
      : grip;
  };
  // The values the drag has reached so far; an open end stays undefined.
  const dragEnds = (current: NonNullable<typeof drag>) => {
    // A threshold's origin is its one bound, so any press on it moves it.
    const threshold = current.open[0] || current.open[1];
    const [a, b] = dragSpan(
      threshold ? "move" : current.grip,
      current.origin,
      current.at,
      current.x,
      plan.plotWidth
    );
    return [
      current.open[0] ? undefined : snapToValue(plan, a),
      current.open[1] ? undefined : snapToValue(plan, b),
    ] as const;
  };
  const hoverValue = drag ? (snapToValue(plan, drag.x) ?? null) : hovered;
  const ends = drag?.moved ? dragEnds(drag) : undefined;
  const dragRange = ends && ends[0] !== ends[1] ? ends : undefined;
  const rangeText = (low?: number, high?: number) =>
    low !== undefined && high !== undefined
      ? `${format(low)} to ${format(high)}`
      : low !== undefined
        ? `≥ ${format(low)}`
        : `≤ ${format(high!)}`;
  // Rows read top to bottom in the order the curves stack at the value.
  const readoutRows = (
    share: (curve: EcdfPlan["curves"][number]) => number,
    count: (curve: EcdfPlan["curves"][number]) => number
  ): ReadoutRow[] =>
    plan.curves
      .filter((curve) => curve.count > 0)
      .map((curve) => ({
        key: curve.key,
        // One curve has no group to name, so its share reads as Share.
        label: plan.curves.length === 1 ? "Share" : curve.label,
        color: curve.color,
        share: share(curve),
        count: count(curve),
        total: curve.count,
      }))
      .sort((a, b) => b.share - a.share);
  const spanRows = (min?: number, max?: number) =>
    readoutRows(
      (curve) => countInRange(curve, min, max) / curve.count,
      (curve) => countInRange(curve, min, max)
    );
  let readout: { label: string; value: string; rows: ReadoutRow[] } | undefined;
  if (dragRange) {
    readout = {
      label: plan.fieldLabel,
      value: rangeText(dragRange[0], dragRange[1]),
      rows: spanRows(dragRange[0], dragRange[1]),
    };
  } else if (hoverValue !== null) {
    readout = {
      label: plan.fieldLabel,
      value: `${comparator} ${format(hoverValue)}`,
      rows: readoutRows(
        (curve) => shareAt(curve, hoverValue, plan.direction),
        (curve) =>
          Math.round(shareAt(curve, hoverValue, plan.direction) * curve.count)
      ),
    };
  }
  // Each curve's share beside its dot, so a clipped header loses nothing.
  const hoverDots =
    hoverValue !== null && !dragRange
      ? plan.curves
          .filter((curve) => curve.count)
          .map((curve) => {
            const share = shareAt(curve, hoverValue, plan.direction);
            return { curve, share, y: plan.py(share) };
          })
      : [];
  // Curves that meet at the value share one label.
  const hoverLabels = hoverDots.filter(
    (dot, index) =>
      hoverDots.findIndex((other) => pct(other.share) === pct(dot.share)) ===
      index
  );
  const labelYs = spread(
    hoverLabels.map((dot) => dot.y),
    13,
    6,
    plan.plotHeight - 6
  );
  const hoverX = hoverValue === null ? 0 : plan.px(hoverValue);
  const labelsLeft = hoverX > plan.plotWidth - 56;
  const axisValueX = (x: number, text: string) =>
    pillX(x, text, plan.plotWidth);

  const selection = dragRange
    ? {
        x0: dragRange[0] === undefined ? 0 : plan.px(dragRange[0]),
        x1: dragRange[1] === undefined ? plan.plotWidth : plan.px(dragRange[1]),
      }
    : plan.selection;

  return (
    <div className="relative select-none" style={{ width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="block overflow-visible"
      >
        <defs>
          <clipPath id={clipId}>
            <rect width={plan.plotWidth} height={plan.plotHeight} />
          </clipPath>
        </defs>
        <g transform={`translate(${plan.margin.left},${plan.margin.top})`}>
          <g aria-hidden="true">
            {plan.yTicks.map((tick) => (
              <g key={tick.label}>
                <line
                  x1={0}
                  x2={plan.plotWidth}
                  y1={tick.y}
                  y2={tick.y}
                  stroke="var(--border)"
                  strokeDasharray={
                    tick.label === "0%" || tick.label === "100%"
                      ? undefined
                      : "2 3"
                  }
                />
                <text
                  x={-6}
                  y={tick.y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={typography.tickSize}
                  className="eda-axis-text fill-muted-foreground"
                  data-role="tick"
                >
                  {tick.label}
                </text>
              </g>
            ))}
            {plan.xTicks.map((tick, index) => (
              <g
                key={`${tick.label}-${index}`}
                transform={`translate(${tick.x},${plan.plotHeight})`}
              >
                <line y2={4} stroke="var(--foreground)" strokeOpacity={0.45} />
                <text
                  y={5 + typography.tickSize}
                  textAnchor="middle"
                  fontSize={typography.tickSize}
                  className="eda-axis-text fill-muted-foreground"
                  data-role="tick"
                >
                  {tick.label}
                </text>
              </g>
            ))}
            <text
              x={plan.plotWidth / 2}
              y={plan.plotHeight + 32}
              textAnchor="middle"
              fontSize={typography.labelSize}
              className="eda-axis-text fill-foreground"
              data-role="label"
            >
              {plan.fieldLabel}
              {plan.log ? " · log scale" : ""}
            </text>
            <text
              transform={`translate(${-34},${plan.plotHeight / 2}) rotate(-90)`}
              textAnchor="middle"
              fontSize={typography.labelSize}
              className="eda-axis-text fill-foreground"
              data-role="label"
            >
              {plan.direction === "below"
                ? "Share at or below"
                : "Share at or above"}
            </text>
          </g>
          {selection && (
            <g pointerEvents="none" aria-hidden="true">
              <rect
                x={Math.min(selection.x0, selection.x1)}
                y={0}
                width={Math.max(1, Math.abs(selection.x1 - selection.x0))}
                height={plan.plotHeight}
                fill="var(--primary)"
                fillOpacity={0.08}
              />
              {[selection.x0, selection.x1]
                .filter((x) => x > 0.5 && x < plan.plotWidth - 0.5)
                .map((x, index) => (
                  <line
                    key={index}
                    x1={x}
                    x2={x}
                    y1={0}
                    y2={plan.plotHeight}
                    stroke="var(--primary)"
                    strokeWidth={1.5}
                  />
                ))}
            </g>
          )}
          {plan.curves.some((curve) => curve.quantiles.length) && (
            <g pointerEvents="none" aria-hidden="true">
              {[0.5, 0.9].map((level) => (
                <text
                  key={level}
                  x={plan.plotWidth + 6}
                  y={plan.py(level)}
                  dominantBaseline="middle"
                  fontSize={10}
                  className="fill-muted-foreground"
                >
                  {level === 0.5
                    ? "median"
                    : plan.direction === "below"
                      ? "p90"
                      : "p10"}
                </text>
              ))}
            </g>
          )}
          <g fill="none" pointerEvents="none" aria-hidden="true">
            {plan.curves.map((curve) => (
              <path
                key={curve.key}
                d={curve.path}
                stroke={curve.color}
                strokeWidth={curve.overall && plan.curves.length > 1 ? 1.5 : 2}
                strokeDasharray={
                  curve.overall && plan.curves.length > 1 ? "5 3" : undefined
                }
                strokeLinejoin="round"
              />
            ))}
            {plan.curves.flatMap((curve) =>
              curve.quantiles.map((quantile) => (
                <circle
                  key={`${curve.key}-${quantile.level}`}
                  cx={quantile.px}
                  cy={quantile.py}
                  r={3}
                  fill="var(--background)"
                  stroke={curve.color}
                  strokeWidth={1.5}
                />
              ))
            )}
          </g>
          {hoverValue !== null && (
            <g pointerEvents="none" aria-hidden="true">
              {!dragRange && (
                <line
                  x1={hoverX}
                  x2={hoverX}
                  y1={0}
                  y2={plan.plotHeight}
                  stroke="var(--foreground)"
                  strokeOpacity={0.4}
                  strokeDasharray="3 3"
                />
              )}
              {hoverDots.map(({ curve, y }) => (
                <circle
                  key={curve.key}
                  cx={hoverX}
                  cy={y}
                  r={3.5}
                  fill={curve.color}
                  stroke="var(--background)"
                  strokeWidth={1.5}
                />
              ))}
              {hoverLabels.map(({ curve, share }, index) => (
                <text
                  key={curve.key}
                  x={hoverX + (labelsLeft ? -8 : 8)}
                  y={labelYs[index]}
                  textAnchor={labelsLeft ? "end" : "start"}
                  dominantBaseline="middle"
                  className="eda-ecdf-value"
                >
                  {pct(share)}
                </text>
              ))}
              {!dragRange && (
                <AxisValue
                  x={axisValueX(hoverX, format(hoverValue))}
                  y={plan.plotHeight + 3}
                  text={format(hoverValue)}
                />
              )}
            </g>
          )}
          {dragRange && (
            <g pointerEvents="none" aria-hidden="true">
              {dragRange.map(
                (value, index) =>
                  value !== undefined && (
                    <AxisValue
                      key={index}
                      x={axisValueX(plan.px(value), format(value))}
                      y={plan.plotHeight + 3}
                      text={format(value)}
                    />
                  )
              )}
            </g>
          )}
          {traced && (
            <circle
              cx={traced.position.x}
              cy={traced.position.y}
              r={6}
              fill="none"
              stroke="var(--foreground)"
              strokeWidth={2}
              pointerEvents="none"
              data-plan-id={traced.id}
            />
          )}
          <rect
            x={0}
            y={0}
            width={plan.plotWidth}
            height={plan.plotHeight}
            fill="transparent"
            className="cursor-crosshair outline-none focus-visible:stroke-[var(--ring)]"
            strokeWidth={2}
            tabIndex={0}
            role="slider"
            aria-label={`${plan.fieldLabel} threshold`}
            aria-valuemin={plan.values[0]}
            aria-valuemax={plan.values[plan.values.length - 1]}
            aria-valuenow={focusValue ?? undefined}
            aria-valuetext={
              focusValue === null
                ? "No value chosen"
                : `${comparator} ${format(focusValue)}: ${plan.curves
                    .filter((curve) => curve.count)
                    .map(
                      (curve) =>
                        `${curve.label} ${pct(shareAt(curve, focusValue, plan.direction))}`
                    )
                    .join(", ")}`
            }
            aria-description="Arrow keys move through observed values. Enter selects rows past this value; Delete clears. Alt-Enter traces it."
            onPointerMove={(event) => {
              const x = plotX(event.clientX);
              const value = snapToValue(plan, x);
              if (value === undefined) {
                return;
              }
              if (drag) {
                setDrag({
                  ...drag,
                  x,
                  moved: drag.moved || Math.abs(x - drag.at) >= 3,
                });
              } else {
                // The cursor shows what a press here does to the selection.
                event.currentTarget.style.cursor = gripCursor(gripAt(x));
                setHovered(value);
              }
            }}
            onPointerLeave={() => {
              if (!drag) {
                setHovered(null);
              }
            }}
            onPointerDown={(event) => {
              // Alt-click traces; the click handler takes it.
              if (event.button !== 0 || event.altKey) {
                return;
              }
              const x = plotX(event.clientX);
              const selection = plan.selection;
              if (snapToValue(plan, x) === undefined) {
                return;
              }
              event.currentTarget.setPointerCapture?.(event.pointerId);
              const grip = gripAt(x);
              if (grip === "draw" || !selection) {
                setDrag({
                  grip: "draw",
                  at: x,
                  origin: [x, x],
                  open: [false, false],
                  x,
                  moved: false,
                });
                return;
              }
              const open: [boolean, boolean] = [
                selection.filter.min === undefined,
                selection.filter.max === undefined,
              ];
              // A threshold has one bound: a press anywhere on it moves that bound.
              const bound = open[0] ? selection.x1 : selection.x0;
              setDrag({
                grip,
                at: x,
                origin:
                  open[0] || open[1]
                    ? [bound, bound]
                    : [selection.x0, selection.x1],
                open,
                x,
                moved: false,
              });
            }}
            onClick={(event) => {
              if (!event.altKey) {
                return;
              }
              event.preventDefault();
              const value = snapToValue(plan, plotX(event.clientX));
              if (value !== undefined) {
                traceAt(value, plotY(event.clientY));
              }
            }}
            onPointerUp={(event) => {
              if (!drag) {
                return;
              }
              if (event.altKey) {
                setDrag(null);
                return;
              }
              setDrag(null);
              const [low, high] = dragEnds(drag);
              if (drag.moved && drag.grip !== "draw") {
                // A moved threshold keeps its open end.
                commit(low ?? high, low === undefined ? undefined : high);
              } else if (drag.moved && low !== high) {
                commit(low, high);
              } else if (!gripsResize(drag.grip)) {
                // A click picks a threshold; a second click on it clears it.
                const value = snapToValue(plan, drag.at)!;
                commit(sameThreshold(value) ? undefined : value);
              }
            }}
            onPointerCancel={() => setDrag(null)}
            onFocus={() =>
              setFocusValue(
                (value) =>
                  value ??
                  plan.selection?.filter.max ??
                  plan.selection?.filter.min ??
                  plan.values[Math.floor(plan.values.length / 2)]!
              )
            }
            onBlur={() => setHovered(null)}
            onKeyDown={handleKey}
          />
          {annotationSlot(settings, annotationFrame)?.(`url(#${clipId})`)}
        </g>
      </svg>
      {readout && <Readout {...readout} />}
    </div>
  );
}
