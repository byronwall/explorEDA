import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
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

const pct = (share: number) =>
  share.toLocaleString("en-US", { style: "percent", maximumFractionDigits: 1 });

function Summary({
  plan,
  heading,
  rows,
  corner,
}: {
  plan: EcdfPlan;
  heading: string;
  rows: {
    key: string;
    label: string;
    color: string;
    share: number;
    count: number;
    total: number;
    dashed: boolean;
  }[];
  corner: "left" | "right";
}) {
  return (
    <div
      className="pointer-events-none absolute z-10 max-w-[min(17rem,70%)] rounded border border-border bg-card/95 px-2 py-1 text-xs text-card-foreground shadow-sm"
      style={{
        top: plan.margin.top + 4,
        ...(corner === "left"
          ? { left: plan.margin.left + 8 }
          : { right: plan.width - plan.margin.left - plan.plotWidth + 8 }),
      }}
      role="status"
    >
      <div className="mb-0.5 font-medium">{heading}</div>
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-1.5">
          <svg width={14} height={8} aria-hidden="true" className="shrink-0">
            <line
              x1={0}
              x2={14}
              y1={4}
              y2={4}
              stroke={row.color}
              strokeWidth={2.5}
              strokeDasharray={row.dashed ? "4 2" : undefined}
            />
          </svg>
          <span className="min-w-0 flex-1 truncate">{row.label}</span>
          <span className="font-medium tabular-nums">{pct(row.share)}</span>
          <span className="tabular-nums text-muted-foreground">
            {row.count.toLocaleString()}/{row.total.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function EcdfChart({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<EcdfSettings>) {
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const formatFieldValue = useDataLayer((s) => s.formatFieldValue);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const updateChart = useDataLayer((s) => s.updateChart);
  const colorScale = useDataLayer((s) =>
    s.colorScales.find((item) => item.id === settings.colorScaleId)
  );
  const liveIds = useGetLiveIds(settings, facetIds);
  const allIds = useGetAllIds();
  const values = useGetColumnData(settings.field);
  const groupData = useGetColumnData(settings.colorField);
  const revision = useTraceRevision(settings);
  const trace = useChartTrace();
  const traceApi = useChartTraceApi();
  const owner = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focusValue, setFocusValue] = useState<number | null>(null);
  const [drag, setDrag] = useState<{
    start: number;
    end: number;
    moved: boolean;
  } | null>(null);

  const snapshot = useMemo(
    (): EcdfSnapshot => ({
      revision,
      allIds,
      liveIds,
      values,
      groupData: settings.colorField ? groupData : undefined,
      colorScale,
    }),
    [
      revision,
      allIds,
      liveIds,
      values,
      groupData,
      settings.colorField,
      colorScale,
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
      <div
        className="flex items-center justify-center p-4 text-center text-sm text-muted-foreground"
        style={{ width, height }}
      >
        Choose a numeric field in chart settings.
      </div>
    );
  }
  if (plan.validCount === 0) {
    return (
      <div
        className="flex items-center justify-center p-4 text-center text-sm text-muted-foreground"
        style={{ width, height }}
      >
        {plan.liveCount > 0
          ? `No numeric values in ${plan.fieldLabel} for these rows`
          : "No rows match the current filters"}
      </div>
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

  const hoverValue = drag ? drag.end : hovered;
  const dragSpan =
    drag?.moved && drag.start !== drag.end
      ? [Math.min(drag.start, drag.end), Math.max(drag.start, drag.end)]
      : undefined;
  const readoutRows = (
    share: (curve: EcdfPlan["curves"][number]) => number,
    count: (curve: EcdfPlan["curves"][number]) => number
  ) =>
    plan.curves
      .filter((curve) => curve.count > 0)
      .map((curve) => ({
        key: curve.key,
        label: curve.label,
        color: curve.color,
        share: share(curve),
        count: count(curve),
        total: curve.count,
        dashed: curve.overall && plan.curves.length > 1,
      }));
  let summary:
    | { heading: string; rows: ReturnType<typeof readoutRows> }
    | undefined;
  if (dragSpan) {
    summary = {
      heading: `${format(dragSpan[0]!)} to ${format(dragSpan[1]!)}`,
      rows: readoutRows(
        (curve) => countInRange(curve, dragSpan[0], dragSpan[1]) / curve.count,
        (curve) => countInRange(curve, dragSpan[0], dragSpan[1])
      ),
    };
  } else if (hoverValue !== null) {
    summary = {
      heading: `${comparator} ${format(hoverValue)}`,
      rows: readoutRows(
        (curve) => shareAt(curve, hoverValue, plan.direction),
        (curve) =>
          Math.round(shareAt(curve, hoverValue, plan.direction) * curve.count)
      ),
    };
  } else if (plan.selection) {
    const { min, max } = plan.selection.filter;
    summary = {
      heading:
        min !== undefined && max !== undefined
          ? `Selected: ${format(min)} to ${format(max)}`
          : `Selected: ${min !== undefined ? `≥ ${format(min)}` : `≤ ${format(max!)}`}`,
      rows: readoutRows(
        (curve) => countInRange(curve, min, max) / curve.count,
        (curve) => countInRange(curve, min, max)
      ),
    };
  }
  const notes = [
    plan.excluded.length > 0 &&
      `${plan.excluded.reduce((total, item) => total + item.count, 0).toLocaleString()} rows without a number left out`,
    plan.otherGroups > 0 && `${plan.otherGroups} smaller groups in Other`,
    plan.logUnavailable && "Log scale needs values above zero",
  ].filter(Boolean);
  const selection = dragSpan
    ? { x0: plan.px(dragSpan[0]!), x1: plan.px(dragSpan[1]!) }
    : plan.selection;

  return (
    <div className="relative select-none" style={{ width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="block overflow-visible"
      >
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
                  fontSize={10}
                  className="fill-muted-foreground"
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
                  y={15}
                  textAnchor="middle"
                  fontSize={10}
                  className="fill-muted-foreground"
                >
                  {tick.label}
                </text>
              </g>
            ))}
            <text
              x={plan.plotWidth / 2}
              y={plan.plotHeight + 32}
              textAnchor="middle"
              fontSize={11}
              className="fill-foreground"
            >
              {plan.fieldLabel}
              {plan.log ? " · log scale" : ""}
            </text>
            <text
              transform={`translate(${-34},${plan.plotHeight / 2}) rotate(-90)`}
              textAnchor="middle"
              fontSize={11}
              className="fill-foreground"
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
                  x={plan.plotWidth - 2}
                  y={plan.py(level) - 4}
                  textAnchor="end"
                  fontSize={10}
                  className="fill-muted-foreground"
                >
                  {level === 0.5
                    ? "median"
                    : plan.direction === "below"
                      ? "90th pct"
                      : "10th pct"}
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
              <line
                x1={plan.px(hoverValue)}
                x2={plan.px(hoverValue)}
                y1={0}
                y2={plan.plotHeight}
                stroke="var(--foreground)"
                strokeOpacity={0.4}
                strokeDasharray="3 3"
              />
              {plan.curves.map((curve) =>
                curve.count ? (
                  <circle
                    key={curve.key}
                    cx={plan.px(hoverValue)}
                    cy={plan.py(shareAt(curve, hoverValue, plan.direction))}
                    r={3.5}
                    fill={curve.color}
                    stroke="var(--background)"
                    strokeWidth={1.5}
                  />
                ) : null
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
              const value = snapToValue(plan, plotX(event.clientX));
              if (value === undefined) {
                return;
              }
              if (drag) {
                setDrag({
                  ...drag,
                  end: value,
                  moved: drag.moved || value !== drag.start,
                });
              } else {
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
              const value = snapToValue(plan, plotX(event.clientX));
              if (value === undefined) {
                return;
              }
              event.currentTarget.setPointerCapture?.(event.pointerId);
              setDrag({ start: value, end: value, moved: false });
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
              if (drag.moved && drag.start !== drag.end) {
                commit(drag.start, drag.end);
              } else {
                commit(sameThreshold(drag.start) ? undefined : drag.start);
              }
              setDrag(null);
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
        </g>
      </svg>
      {summary && (
        <Summary
          plan={plan}
          heading={summary.heading}
          rows={summary.rows}
          corner={plan.direction === "below" ? "left" : "right"}
        />
      )}
      {notes.length > 0 && (
        <div
          className="pointer-events-none absolute truncate text-right text-xs text-muted-foreground"
          style={{
            right: settings.margin.right,
            bottom: settings.margin.bottom,
            maxWidth: "45%",
          }}
        >
          {notes.join(" · ")}
        </div>
      )}
    </div>
  );
}
