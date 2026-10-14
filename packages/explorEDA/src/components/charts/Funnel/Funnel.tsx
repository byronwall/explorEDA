import { useId, useMemo, useRef, useState } from "react";
import { useThemeColors } from "@/hooks/useDisplayColorScales";
import { categoryKey, categoryValue } from "@/lib/categories";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps, datum } from "@/types/ChartTypes";
import { ChartMessage, NO_MATCHING_ROWS } from "../ChartMessage";
import { ChartReadout } from "../ChartReadout";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
  STATUS_LINE_HEIGHT,
} from "../ChartStatusLine";
import { isEmptyPlotTarget } from "../emptyPlotClick";
import {
  useChartTrace,
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import {
  funnelSelectionFilter,
  MIN_FUNNEL_STEPS,
  type FunnelSettings,
} from "./definition";
import type { FunnelTrace } from "./FunnelTraceBody";
import {
  funnelSelection,
  planFunnel,
  type FunnelInput,
  type FunnelStep,
} from "./funnelPlan";

const CHAR = 6.4;
const MAX_BAR = 44;

export const funnelPercent = (share: number) =>
  share.toLocaleString("en-US", {
    style: "percent",
    maximumFractionDigits: share > 0 && share < 0.1 ? 1 : 0,
  });

const clip = (text: string, room: number) => {
  const chars = Math.max(3, Math.floor(room / CHAR));
  return text.length > chars ? `${text.slice(0, chars - 1)}…` : text;
};

export function Funnel({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<FunnelSettings>) {
  const owner = useId();
  const api = useChartTraceApi();
  const trace = useChartTrace();
  const revision = useTraceRevision(settings);
  const liveIds = useGetLiveIds(settings, facetIds);
  const allIds = useGetAllIds(settings);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const nonce = useDataLayer((state) => state.nonce);
  const updateChart = useDataLayer((state) => state.updateChart);
  const themeColors = useThemeColors();
  const [hovered, setHovered] = useState<number | null>(null);
  const refs = useRef(new Map<number, SVGRectElement>());

  const { field, entityField, timeField, steps, windowDays } = settings;
  const setupMessage =
    !field || !entityField || !timeField
      ? "Choose the entity, event, and time fields in chart settings."
      : steps.length < MIN_FUNNEL_STEPS
        ? "Choose at least two steps in chart settings."
        : undefined;

  const columns = useMemo(() => {
    void nonce;
    if (setupMessage) return undefined;
    return {
      entity: getColumnData(entityField),
      event: getColumnData(field),
      time: getColumnData(timeField),
    };
  }, [setupMessage, entityField, field, timeField, getColumnData, nonce]);

  const selection = funnelSelectionFilter(settings);
  const plans = useMemo(() => {
    if (!columns) return undefined;
    const base: Omit<FunnelInput, "ids"> = { ...columns, steps, windowDays };
    const live = { ...base, ids: liveIds };
    const plan = planFunnel(live);
    // The axis spans every row, so bars keep their scale while filtering.
    const all = planFunnel({ ...base, ids: allIds });
    const selected = selection
      ? funnelSelection(live, selection.values)
      : undefined;
    const selectedCounts = plan.steps.map((step) =>
      selected
        ? step.contributors.filter((row) =>
            selected.has(
              categoryKey(categoryValue(columns.entity[row.sourceId]))
            )
          ).length
        : step.count
    );
    return { plan, max: all.steps[0]?.count ?? 0, selectedCounts };
  }, [columns, steps, windowDays, liveIds, allIds, selection]);

  const entityLabel = getFieldLabel(entityField);
  const stepLabel = (value: datum) =>
    value == null || typeof value === "string"
      ? String(value ?? "(missing)")
      : formatFieldValue(field, value);

  const source = useMemo((): TraceSource => {
    const plan = plans?.plan;
    const currentRevision = `${revision}:${steps.map(String).join("|")}:${windowDays ?? ""}:${plan?.steps.map((step) => step.count).join(",")}`;
    return {
      role: "chart",
      revision: currentRevision,
      resolve: (kind, id) => {
        if (kind !== "funnel-step" || !plan) return;
        const step = plan.steps[Number(id)];
        if (!step) return;
        const previous = plan.steps[step.index - 1];
        const result: FunnelTrace = {
          kind: "funnel-step",
          id,
          revision: currentRevision,
          step: { ...step, label: stepLabel(step.value) },
          stepCount: plan.steps.length,
          previousLabel: previous && stepLabel(previous.value),
          previousCount: previous?.count,
          firstCount: plan.steps[0]?.count ?? 0,
          entityLabel,
          eventLabel: getFieldLabel(field),
          windowDays,
          excluded: plan.excluded,
        };
        return result;
      },
      findRow: (id) => {
        if (!plan) return;
        const step = [...plan.steps]
          .reverse()
          .find((item) => item.contributors.some((row) => row.sourceId === id));
        return step && { kind: "funnel-step", id: String(step.index) };
      },
      targets: () =>
        (plan?.steps ?? []).map((step) => ({
          kind: "funnel-step",
          id: String(step.index),
          label: `Step ${step.index + 1}: ${stepLabel(step.value)}`,
        })),
    };
    // Labels read field settings, which the revision tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, revision, steps, windowDays, field, entityLabel]);
  useTraceSource(owner, source);
  const inspect = (index: number) =>
    api?.inspect(owner, "funnel-step", String(index));
  const traced =
    trace?.selection?.owner === owner ? Number(trace.selection.id) : undefined;

  if (setupMessage) {
    return (
      <ChartMessage width={width} height={height}>
        {setupMessage}
      </ChartMessage>
    );
  }
  const plan = plans!.plan;
  if (plan.entities === 0) {
    return (
      <ChartMessage width={width} height={height}>
        {liveIds.length > 0
          ? "No row has both an entity and a readable time."
          : NO_MATCHING_ROWS}
      </ChartMessage>
    );
  }

  const selectedKeys = new Set(
    (selection?.values ?? []).map((value) => categoryKey(categoryValue(value)))
  );
  const isSelected = (step: FunnelStep) => selectedKeys.has(step.key);
  const hasSelection = Boolean(selection);
  const select = (step: FunnelStep) => {
    const rest = settings.filters.filter((filter) => filter !== selection);
    updateChart(settings.id, {
      filters: isSelected(step)
        ? rest
        : [...rest, { type: "value", field, values: [step.value] }],
    });
  };

  const top = 6;
  const bottom = STATUS_LINE_HEIGHT + 6;
  const labelWidth = Math.round(Math.min(160, Math.max(72, width * 0.24)));
  const left = 12 + labelWidth + 8;
  const valueRoom = Math.min(150, Math.max(64, width * 0.22));
  const plotWidth = Math.max(40, width - left - valueRoom - 12);
  const rowHeight = Math.max(18, (height - top - bottom) / plan.steps.length);
  const barHeight = Math.min(MAX_BAR, rowHeight * 0.64);
  const max = Math.max(plans!.max, plan.steps[0]?.count ?? 0, 1);
  const x = (count: number) => (count / max) * plotWidth;
  const markColor = themeColors.mark;

  const first = plan.steps[0]!;
  const last = plan.steps[plan.steps.length - 1]!;
  const statusParts = [
    `${first.count.toLocaleString()} entered · ${last.count.toLocaleString()} completed (${funnelPercent(last.ofFirst)})`,
    windowDays ? `within ${windowDays} days` : undefined,
    hasSelection &&
      `${plans!.selectedCounts[0]!.toLocaleString()} ${entityLabel} selected`,
    ...plan.excluded.map(
      (item) =>
        `${item.count.toLocaleString()} rows left out: ${item.reason.toLowerCase()}`
    ),
  ];
  const statusHint =
    !hasSelection &&
    !facetIds &&
    width >= STATUS_HINT_MIN_WIDTH &&
    "Click a step to select who reached it";

  const focusStep = (index: number) => {
    const next = Math.max(0, Math.min(plan.steps.length - 1, index));
    setHovered(next);
    refs.current.get(next)?.focus();
  };
  const hoveredStep = hovered === null ? undefined : plan.steps[hovered];
  const tabStop =
    plan.steps.find((step) => isSelected(step))?.index ?? hovered ?? 0;

  return (
    <div
      className="relative select-none"
      style={{ width, height }}
      onPointerLeave={() => setHovered(null)}
    >
      {hoveredStep && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          <span className="eda-readout-item">
            <span>Step {hoveredStep.index + 1}</span>
            <b>{stepLabel(hoveredStep.value)}</b>
          </span>
          <span className="eda-readout-item">
            <span>{entityLabel}</span>
            <b>{hoveredStep.count.toLocaleString()}</b>
          </span>
          <span className="eda-readout-item">
            <span>Of first</span>
            <b>{funnelPercent(hoveredStep.ofFirst)}</b>
          </span>
          {hoveredStep.index > 0 && (
            <span className="eda-readout-item">
              <span>Of previous</span>
              <b>{funnelPercent(hoveredStep.ofPrevious)}</b>
            </span>
          )}
          {hoveredStep.index > 0 && (
            <span className="eda-readout-item">
              <span>Dropped</span>
              <b>{hoveredStep.dropped.toLocaleString()}</b>
            </span>
          )}
        </ChartReadout>
      )}
      <svg
        width={width}
        height={height}
        className="block"
        role="group"
        aria-label={`Funnel of ${entityLabel} through ${plan.steps.length} steps`}
        onClick={(event) => {
          if (
            !event.altKey &&
            settings.filters.length > 0 &&
            isEmptyPlotTarget(event.target)
          )
            updateChart(settings.id, { filters: [] });
        }}
      >
        {plan.steps.map((step) => {
          const y = top + step.index * rowHeight + (rowHeight - barHeight) / 2;
          const previous = plan.steps[step.index - 1]?.count ?? step.count;
          const barWidth = x(step.count);
          const selected = isSelected(step);
          const isTraced = traced === step.index;
          const emphasis = hovered === step.index || isTraced || selected;
          const label = stepLabel(step.value);
          const share =
            step.index === 0
              ? ""
              : ` · ${funnelPercent(step.ofPrevious)} of previous`;
          const valueText = `${step.count.toLocaleString()} · ${funnelPercent(step.ofFirst)}`;
          const valueX = left + Math.max(barWidth, x(previous)) + 6;
          const fullText = `${valueText}${share}`;
          const room = width - valueX - 12;
          return (
            <g key={step.index} data-plan-id={`step-${step.index}`}>
              <text
                x={12 + labelWidth}
                y={y + barHeight / 2}
                textAnchor="end"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={selected ? 700 : 500}
                className="fill-foreground"
                pointerEvents="none"
              >
                {clip(label, labelWidth)}
              </text>
              {previous > step.count && (
                <rect
                  x={left + barWidth}
                  y={y}
                  width={x(previous) - barWidth}
                  height={barHeight}
                  rx={2}
                  fill={markColor}
                  fillOpacity={0.14}
                  pointerEvents="none"
                />
              )}
              <rect
                x={left}
                y={y}
                width={Math.max(barWidth, step.count > 0 ? 1 : 0)}
                height={barHeight}
                rx={2}
                fill={markColor}
                fillOpacity={hasSelection ? 0.3 : 0.92}
                pointerEvents="none"
              />
              {hasSelection && plans!.selectedCounts[step.index]! > 0 && (
                <rect
                  x={left}
                  y={y}
                  width={Math.max(1, x(plans!.selectedCounts[step.index]!))}
                  height={barHeight}
                  rx={2}
                  fill={markColor}
                  pointerEvents="none"
                />
              )}
              <text
                x={valueX}
                y={y + barHeight / 2}
                dominantBaseline="central"
                fontSize={11}
                className="fill-muted-foreground"
                pointerEvents="none"
              >
                <tspan className="fill-foreground" fontWeight={600}>
                  {valueText}
                </tspan>
                {fullText.length * CHAR <= room && <tspan>{share}</tspan>}
              </text>
              <rect
                ref={(element) => {
                  if (element) refs.current.set(step.index, element);
                  else refs.current.delete(step.index);
                }}
                x={8}
                y={y - 3}
                width={left - 8 + plotWidth + 4}
                height={barHeight + 6}
                rx={3}
                fill="transparent"
                stroke={emphasis ? "var(--foreground)" : "none"}
                strokeWidth={selected || isTraced ? 1.5 : 1}
                strokeDasharray={
                  !selected && !isTraced && hovered === step.index
                    ? "3 2"
                    : undefined
                }
                className="chart-mark cursor-pointer outline-none"
                role="button"
                tabIndex={step.index === tabStop ? 0 : -1}
                aria-pressed={selected}
                aria-label={`Step ${step.index + 1}, ${label}: ${step.count.toLocaleString()}, ${funnelPercent(step.ofFirst)} of the first step`}
                onPointerEnter={() => setHovered(step.index)}
                onFocus={() => setHovered(step.index)}
                onBlur={() =>
                  setHovered((index) => (index === step.index ? null : index))
                }
                onClick={(event) => {
                  event.stopPropagation();
                  if (event.altKey) inspect(step.index);
                  else select(step);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    focusStep(
                      step.index + (event.key === "ArrowDown" ? 1 : -1)
                    );
                  } else if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (event.altKey) inspect(step.index);
                    else select(step);
                  }
                }}
              />
            </g>
          );
        })}
      </svg>
      <ChartStatusLine
        parts={statusParts}
        hint={statusHint}
        left={12}
        right={12}
        bottom={4}
      />
    </div>
  );
}
