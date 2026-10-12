import { useId, useMemo, useState } from "react";
import { scaleBand } from "d3-scale";
import { applyFilter } from "@/hooks/applyFilter";
import { categoryEqual, categoryIncludes } from "@/lib/categories";
import {
  convertFieldValue,
  formatFieldValue as formatValue,
} from "@/lib/fieldSettings";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps, datum } from "@/types/ChartTypes";
import type { Filter, ValueFilter } from "@/types/FilterTypes";
import { boundedDomain, hasAxisBounds } from "../Axis/axisBounds";
import { numericScale } from "../Axis/numericScale";
import { BaseChart } from "../BaseChart";
import { ChartMessage, NO_MATCHING_ROWS } from "../ChartMessage";
import { ChartReadout } from "../ChartReadout";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
  STATUS_LINE_HEIGHT,
} from "../ChartStatusLine";
import { useAxisTypography } from "../chartTypography";
import {
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import type { WaterfallTrace } from "./WaterfallTraceBody";
import {
  planBridge,
  type WaterfallBar,
  type WaterfallPlan,
} from "./waterfallPlan";
import { stateMeasureField, type WaterfallSettings } from "./waterfallTypes";

const BAR_FILL: Record<string, string> = {
  up: "var(--eda-waterfall-up)",
  down: "var(--eda-waterfall-down)",
  total: "var(--eda-waterfall-total)",
};

function barTone(bar: WaterfallBar) {
  if (bar.kind !== "step") return "total";
  return bar.amount < 0 ? "down" : "up";
}

/** Whether two filter lists select the same rows, ignoring order. */
function sameFilters(left: Filter[], right: Filter[]) {
  if (left.length !== right.length) return false;
  const key = (filter: Filter) => JSON.stringify(filter);
  const keys = new Set(left.map(key));
  return right.every((filter) => keys.has(key(filter)));
}

export function Waterfall({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<WaterfallSettings>) {
  const owner = useId();
  const api = useChartTraceApi();
  const revision = useTraceRevision(settings);
  const liveIds = useGetLiveIds(settings, facetIds);
  const allIds = useGetAllIds(settings);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const nonce = useDataLayer((state) => state.nonce);
  const rawData = useDataLayer((state) => state.rawData);
  const calculations = useDataLayer((state) => state.calculations);
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const updateChart = useDataLayer((state) => state.updateChart);
  const typography = useAxisTypography();
  const [hovered, setHovered] = useState<string | null>(null);

  const states = settings.states;
  const measureFields = [0, 1].map((index) =>
    stateMeasureField(settings, states[index])
  );
  const setupMessage = !settings.field
    ? "Choose a step field in chart settings."
    : states.length < 2
      ? "Name a start state and an end state in chart settings."
      : settings.aggregation === "sum" && measureFields.some((field) => !field)
        ? "Choose a measure in chart settings."
        : undefined;

  const plan = useMemo((): WaterfallPlan => {
    void nonce;
    void fieldSettings;
    if (setupMessage) return { bars: [] };
    const stateInputs = [0, 1].map((index) => {
      const state = states[index]!;
      const tests = state.filters.map((filter) => ({
        filter,
        values: getColumnData(filter.field),
      }));
      const measureField = measureFields[index];
      // Traces show each measure value as it was read, and why a value that
      // failed conversion was left out, as metric cards do.
      const rawInputs: Record<number, datum> = {};
      const exclusionReasons: Record<number, string> = {};
      if (
        measureField &&
        !calculations.some((calc) => calc.resultColumnName === measureField)
      ) {
        const format = fieldSettings[measureField] ?? {};
        const type =
          format.type ??
          profiles.find((profile) => profile.name === measureField)?.dataType ??
          "categorical";
        for (const id of liveIds) {
          const raw = (rawData[id] as Record<string, datum> | undefined)?.[
            measureField
          ];
          rawInputs[id] = raw;
          const converted = convertFieldValue(raw, type, format);
          if (converted.error)
            exclusionReasons[id] = `Conversion failed: ${converted.error}`;
        }
      }
      return {
        label: state.label,
        rawInputs,
        exclusionReasons,
        measure: measureField ? getColumnData(measureField) : undefined,
        includes: (id: number) =>
          tests.every(({ filter, values }) => applyFilter(values[id], filter)),
      };
    }) as Parameters<typeof planBridge>[0]["states"];
    return planBridge({
      ids: liveIds,
      orderIds: allIds,
      step: getColumnData(settings.field),
      parent: settings.parentField
        ? getColumnData(settings.parentField)
        : undefined,
      aggregation: settings.aggregation,
      states: stateInputs,
    });
    // measureFields derives from settings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setupMessage,
    states,
    settings.field,
    settings.parentField,
    settings.aggregation,
    settings.measureField,
    liveIds,
    allIds,
    getColumnData,
    nonce,
    fieldSettings,
    rawData,
    calculations,
    profiles,
  ]);

  const measureField = measureFields[1] ?? measureFields[0];
  const format = (value: number | undefined, signed = false) => {
    if (value === undefined || !Number.isFinite(value)) return "—";
    const text = measureField
      ? formatValue(
          measureField,
          value,
          value === 0
            ? { ...fieldSettings[measureField], precision: 0 }
            : fieldSettings[measureField],
          { compact: true }
        )
      : value.toLocaleString();
    return signed && value > 0 ? `+${text}` : text;
  };
  const amountText = (bar: WaterfallBar) =>
    format(bar.amount, bar.kind === "step");
  const measureName = (index: number) =>
    settings.aggregation === "count"
      ? "Count of rows"
      : `Sum of ${getFieldLabel(measureFields[index] ?? "")}`;
  const stepLabel = getFieldLabel(settings.field);

  const valueFilter = settings.filters.find(
    (filter): filter is ValueFilter =>
      filter.type === "value" && filter.field === settings.field
  );
  const selectedValues = valueFilter?.values ?? [];
  const stateSelected = (index: number) => {
    const filters = states[index]?.filters ?? [];
    return filters.length > 0 && sameFilters(settings.filters, filters);
  };
  const isSelected = (bar: WaterfallBar) => {
    switch (bar.kind) {
      case "step":
        return categoryIncludes(selectedValues, bar.value);
      case "subtotal":
        return (bar.members ?? []).every((value) =>
          categoryIncludes(selectedValues, value)
        );
      case "start":
        return stateSelected(0);
      case "end":
        return stateSelected(1);
    }
  };
  const hasSelection = settings.filters.length > 0;

  const setStepValues = (values: datum[]) => {
    const filters = settings.filters.filter(
      (filter) => filter.type !== "value" || filter.field !== settings.field
    );
    if (values.length) {
      filters.push({ type: "value", field: settings.field, values });
    }
    updateChart(settings.id, { filters });
  };
  const select = (bar: WaterfallBar) => {
    if (bar.kind === "step") {
      setStepValues(
        categoryIncludes(selectedValues, bar.value)
          ? selectedValues.filter((value) => !categoryEqual(value, bar.value))
          : [...selectedValues, bar.value]
      );
      return;
    }
    if (bar.kind === "subtotal") {
      const members = bar.members ?? [];
      const rest = selectedValues.filter(
        (value) => !members.some((member) => categoryEqual(value, member))
      );
      setStepValues(isSelected(bar) ? rest : [...rest, ...members]);
      return;
    }
    // A total selects its state's rows, or every row for a state without
    // conditions.
    const filters = states[bar.kind === "start" ? 0 : 1]?.filters ?? [];
    updateChart(settings.id, {
      filters: isSelected(bar) ? [] : filters.map((filter) => ({ ...filter })),
    });
  };

  const source = useMemo((): TraceSource => {
    const currentRevision = `${revision.split(":")[0]}:${settings.field}:${plan.bars
      .map((bar) => `${bar.key}=${bar.amount}`)
      .join(";")}`;
    const traceStates = [0, 1].map((index) => ({
      label: states[index]?.label ?? "",
      measure: measureName(index),
      filters: states[index]?.filters ?? [],
    }));
    return {
      role: "chart",
      revision: currentRevision,
      resolve: (kind, id) => {
        if (kind !== "waterfall-bar") return;
        const bar = plan.bars.find((item) => item.key === id);
        if (!bar) return;
        const trace: WaterfallTrace = {
          kind: "waterfall-bar",
          id,
          revision: currentRevision,
          owner,
          chartId: settings.id,
          bar,
          states: traceStates,
          stepLabel,
          amountText: amountText(bar),
          valueTexts: bar.states
            ? [format(bar.states[0].value), format(bar.states[1].value)]
            : undefined,
          showInputs: settings.aggregation !== "count",
        };
        return trace;
      },
      findRow: (id) => {
        const bar = plan.bars.find(
          (item) =>
            item.kind === "step" &&
            item.states?.some((state) =>
              state.contributors.some((row) => row.sourceId === id)
            )
        );
        return bar && { kind: "waterfall-bar", id: bar.key };
      },
      targets: () =>
        plan.bars.map((bar) => ({
          kind: "waterfall-bar",
          id: bar.key,
          label: bar.label,
        })),
    };
    // Formatting reads field settings, which the revision already tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision, plan, owner, settings.id, settings.field, states, stepLabel]);
  useTraceSource(owner, source);
  const inspect = (key: string) => api?.inspect(owner, "waterfall-bar", key);

  const chartHeight = Math.max(40, height - 32);
  const bars = plan.bars;
  // A subtotal is named for its group, so the axis says it is a subtotal.
  const axisLabel = (bar: WaterfallBar) =>
    bar.kind === "subtotal" ? `${bar.label} subtotal` : bar.label;
  const labels = bars.map(axisLabel);
  const tickSize = settings.yAxis.tickFontSize ?? typography.tickSize;
  const requestedLabelMargin = Math.max(
    settings.margin.left,
    ...labels.map(
      (label) =>
        Math.max(
          label.length * tickSize * 0.7,
          typography.measure(label, tickSize)
        ) + 24
    )
  );
  const xAxisLabel =
    settings.xAxisLabel ||
    (settings.aggregation === "count"
      ? "Rows"
      : getFieldLabel(measureField ?? ""));
  const valueLabelRoom = Math.max(
    48,
    ...bars.map((bar) => typography.measure(amountText(bar), 11) + 12)
  );
  const margin = {
    ...settings.margin,
    left: Math.min(
      requestedLabelMargin,
      width * 0.42,
      Math.max(0, width - settings.margin.right - 80)
    ),
    right: Math.max(settings.margin.right, valueLabelRoom),
    bottom:
      Math.max(settings.margin.bottom, xAxisLabel ? 42 : 26) +
      STATUS_LINE_HEIGHT,
  };
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const rowHeight = 30;
  const bandHeight = Math.min(
    chartHeight - margin.top - margin.bottom,
    bars.length * rowHeight * 1.4
  );
  const axisRise = Math.max(
    0,
    chartHeight - margin.top - margin.bottom - Math.max(0, bandHeight)
  );
  margin.bottom += axisRise;
  const innerHeight = Math.max(0, chartHeight - margin.top - margin.bottom);

  const xScale = useMemo(() => {
    const values = bars.flatMap((bar) => [bar.from, bar.to]);
    let min = Math.min(0, ...values);
    const max = Math.max(0, ...values, Number.MIN_VALUE);
    // Labels of falling steps can sit left of the lowest bar.
    if (min < 0 && innerWidth > valueLabelRoom * 2) {
      min -= (valueLabelRoom / (innerWidth - valueLabelRoom)) * (max - min);
    }
    const scale = numericScale(settings.xAxis)
      .domain(boundedDomain([min, max], settings.xAxis))
      .range([0, innerWidth]);
    return hasAxisBounds(settings.xAxis) ? scale : scale.nice();
  }, [bars, innerWidth, settings.xAxis, valueLabelRoom]);
  const yScale = useMemo(
    () =>
      scaleBand<string>()
        .domain(bars.map((bar) => bar.key))
        .range([0, innerHeight])
        .padding(0.28),
    [bars, innerHeight]
  );

  if (setupMessage || plan.message || bars.length === 0) {
    return (
      <ChartMessage width={width} height={height}>
        {setupMessage ?? plan.message ?? NO_MATCHING_ROWS}
      </ChartMessage>
    );
  }

  const labelsByKey = new Map(bars.map((bar) => [bar.key, axisLabel(bar)]));
  const hoveredBar = bars.find((bar) => bar.key === hovered);
  const span = (bar: WaterfallBar) => {
    const a = xScale(bar.from);
    const b = xScale(bar.to);
    return { x: Math.min(a, b), width: Math.max(1, Math.abs(b - a)) };
  };
  const statusParts = [
    valueFilter &&
      `${selectedValues.length} ${selectedValues.length === 1 ? "step" : "steps"} selected`,
    stateSelected(0) && `${states[0]!.label} rows selected`,
    stateSelected(1) && `${states[1]!.label} rows selected`,
  ];
  const statusHint =
    !hasSelection &&
    !facetIds &&
    width >= STATUS_HINT_MIN_WIDTH &&
    "Click a step to select its rows";
  const zero = xScale(0);

  return (
    <div className="relative" style={{ width, height }}>
      {hoveredBar && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          <span className="eda-readout-item">
            <span>
              {hoveredBar.kind === "step"
                ? stepLabel
                : hoveredBar.kind === "subtotal"
                  ? "Subtotal"
                  : "Total"}
            </span>
            <b>{hoveredBar.label}</b>
          </span>
          <span className="eda-readout-item">
            <span>{hoveredBar.kind === "step" ? "Change" : "Value"}</span>
            <b>{amountText(hoveredBar)}</b>
          </span>
          {hoveredBar.kind === "step" &&
            hoveredBar.states?.map((state, index) => (
              <span key={index} className="eda-readout-item">
                <span>{states[index]!.label}</span>
                <b>{format(state.value)}</b>
              </span>
            ))}
        </ChartReadout>
      )}
      <BaseChart
        width={width}
        height={chartHeight}
        footer={axisRise + STATUS_LINE_HEIGHT}
        xScale={xScale}
        yScale={yScale}
        settings={{ ...settings, margin, xAxisLabel }}
        axisFields={{ x: measureField }}
        onClearPlot={() => updateChart(settings.id, { filters: [] })}
        yTickFormatter={(value) =>
          labelsByKey.get(String(value)) ?? String(value)
        }
        overlay={
          <g pointerEvents="none">
            {bars.map((bar) => {
              const left = bar.kind === "step" ? bar.amount < 0 : bar.to < 0;
              const edge = left
                ? Math.min(xScale(bar.from), xScale(bar.to))
                : Math.max(xScale(bar.from), xScale(bar.to));
              return (
                <text
                  key={bar.key}
                  x={left ? edge - 5 : edge + 5}
                  y={yScale(bar.key)! + yScale.bandwidth() / 2}
                  dominantBaseline="middle"
                  textAnchor={left ? "end" : "start"}
                  className="eda-waterfall-value"
                  fontWeight={bar.kind === "step" ? undefined : 600}
                >
                  {amountText(bar)}
                </text>
              );
            })}
          </g>
        }
      >
        <g className="select-none">
          {zero > 0 && zero < innerWidth && (
            <line
              x1={zero}
              x2={zero}
              y1={0}
              y2={innerHeight}
              className="stroke-muted-foreground"
              strokeWidth={1}
              pointerEvents="none"
              aria-hidden="true"
            />
          )}
          <g aria-hidden="true" pointerEvents="none">
            {bars.slice(1).map((bar, index) => {
              const previous = bars[index]!;
              const x = xScale(previous.to);
              return (
                <line
                  key={`${bar.key}:connector`}
                  className="eda-waterfall-connector"
                  x1={x}
                  x2={x}
                  y1={yScale(previous.key)! + yScale.bandwidth()}
                  y2={yScale(bar.key)!}
                />
              );
            })}
          </g>
          {bars.map((bar) => {
            const selected = isSelected(bar);
            const dimmed = hasSelection && !selected;
            const box = span(bar);
            const kindText =
              bar.kind === "step"
                ? `change ${amountText(bar)}`
                : bar.kind === "subtotal"
                  ? `subtotal ${amountText(bar)}`
                  : `total ${amountText(bar)}`;
            return (
              <rect
                key={bar.key}
                {...box}
                y={yScale(bar.key)}
                height={yScale.bandwidth()}
                rx={2}
                role="button"
                tabIndex={0}
                aria-label={`${bar.label}, ${kindText}`}
                aria-pressed={selected}
                data-waterfall-kind={bar.kind}
                className="chart-mark cursor-pointer"
                style={{
                  fill: BAR_FILL[barTone(bar)],
                  opacity: dimmed ? 0.3 : 1,
                }}
                onPointerEnter={() => setHovered(bar.key)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(bar.key)}
                onBlur={() => setHovered(null)}
                onClick={(event) => {
                  if (event.altKey) inspect(bar.key);
                  else select(bar);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (event.altKey) inspect(bar.key);
                    else select(bar);
                  }
                }}
              />
            );
          })}
        </g>
      </BaseChart>
      <ChartStatusLine
        parts={statusParts}
        hint={statusHint}
        left={margin.left}
        right={margin.right}
        bottom={34}
      />
    </div>
  );
}
