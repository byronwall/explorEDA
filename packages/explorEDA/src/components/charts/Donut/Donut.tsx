import { useId, useMemo, useState } from "react";
import { arc as shapeArc, pie as shapePie } from "d3-shape";
import { useColorScales } from "@/hooks/useColorScales";
import { useThemeColors } from "@/hooks/useDisplayColorScales";
import { categoryEqual, categoryIncludes } from "@/lib/categories";
import {
  convertFieldValue,
  formatFieldValue as formatValue,
} from "@/lib/fieldSettings";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps, datum } from "@/types/ChartTypes";
import type { ValueFilter } from "@/types/FilterTypes";
import { ChartMessage, NO_MATCHING_ROWS } from "../ChartMessage";
import { ChartReadout } from "../ChartReadout";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
  STATUS_LINE_HEIGHT,
} from "../ChartStatusLine";
import { isEmptyPlotTarget } from "../emptyPlotClick";
import {
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import { useGetLiveIds } from "../useGetLiveData";
import type { DonutSettings } from "./definition";
import type { DonutTrace } from "./DonutTraceBody";
import { planDonut, type DonutSlice } from "./donutPlan";

const OTHER_COLOR = "var(--muted-foreground)";
/** Below this width the legend moves under the ring. */
const SIDE_LEGEND_MIN_WIDTH = 420;

const percent = (share: number) =>
  share.toLocaleString("en-US", {
    style: "percent",
    maximumFractionDigits: share > 0 && share < 0.01 ? 1 : 0,
  });

export function Donut({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<DonutSettings>) {
  const owner = useId();
  const api = useChartTraceApi();
  const revision = useTraceRevision(settings);
  const liveIds = useGetLiveIds(settings, facetIds);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const nonce = useDataLayer((state) => state.nonce);
  const rawData = useDataLayer((state) => state.rawData);
  const calculations = useDataLayer((state) => state.calculations);
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const updateChart = useDataLayer((state) => state.updateChart);
  const { getColorForValue } = useColorScales();
  const themeColors = useThemeColors();
  const [hovered, setHovered] = useState<string | null>(null);

  const measureField =
    settings.aggregation === "sum" ? settings.measureField : undefined;
  const setupMessage = !settings.field
    ? "Choose a category field in chart settings."
    : settings.aggregation === "sum" && !measureField
      ? "Choose a measure in chart settings."
      : undefined;

  const plan = useMemo(() => {
    void nonce;
    if (setupMessage) return { slices: [], total: 0 };
    // Traces show each measure value as it was read, as metric cards do.
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
    return planDonut({
      ids: liveIds,
      category: getColumnData(settings.field),
      aggregation: settings.aggregation,
      measure: measureField ? getColumnData(measureField) : undefined,
      rawInputs,
      exclusionReasons,
      topN: settings.topN,
    });
  }, [
    setupMessage,
    liveIds,
    settings.field,
    settings.aggregation,
    settings.topN,
    measureField,
    getColumnData,
    fieldSettings,
    rawData,
    calculations,
    profiles,
    nonce,
  ]);

  const format = (value: number) =>
    measureField
      ? formatValue(
          measureField,
          value,
          value === 0
            ? { ...fieldSettings[measureField], precision: 0 }
            : fieldSettings[measureField],
          { compact: true }
        )
      : value.toLocaleString();
  const measureName = measureField
    ? `Sum of ${getFieldLabel(measureField)}`
    : "Count of rows";
  const fieldLabel = getFieldLabel(settings.field);
  const sliceLabel = (slice: DonutSlice) =>
    slice.key === "__other" || slice.value == null
      ? slice.label
      : formatFieldValue(settings.field, slice.value);

  const colorOf = (slice: DonutSlice, index: number) =>
    slice.key === "__other"
      ? OTHER_COLOR
      : settings.colorScaleId
        ? getColorForValue(settings.colorScaleId, slice.value, themeColors.mark)
        : (themeColors.categorical[index % themeColors.categorical.length] ??
          themeColors.mark);

  const valueFilter = settings.filters.find(
    (filter): filter is ValueFilter =>
      filter.type === "value" && filter.field === settings.field
  );
  const selectedValues = valueFilter?.values ?? [];
  const memberValues = (slice: DonutSlice) =>
    slice.members ? slice.members.map((member) => member.value) : [slice.value];
  const isSelected = (slice: DonutSlice) =>
    memberValues(slice).every((value) =>
      categoryIncludes(selectedValues, value)
    );
  const select = (slice: DonutSlice) => {
    const members = memberValues(slice);
    const rest = selectedValues.filter(
      (value) => !members.some((member) => categoryEqual(value, member))
    );
    const values = isSelected(slice) ? rest : [...rest, ...members];
    const filters = settings.filters.filter(
      (filter) => filter.type !== "value" || filter.field !== settings.field
    );
    if (values.length)
      filters.push({ type: "value", field: settings.field, values });
    updateChart(settings.id, { filters });
  };
  const clear = () => {
    if (settings.filters.length) updateChart(settings.id, { filters: [] });
  };

  const source = useMemo((): TraceSource => {
    const currentRevision = `${revision.split(":")[0]}:${settings.field}:${plan.slices
      .map((slice) => `${slice.key}=${slice.amount}`)
      .join(";")}`;
    return {
      role: "chart",
      revision: currentRevision,
      resolve: (kind, id) => {
        if (kind !== "donut-slice") return;
        const slice = plan.slices.find((item) => item.key === id);
        if (!slice) return;
        const trace: DonutTrace = {
          kind: "donut-slice",
          id,
          revision: currentRevision,
          owner,
          chartId: settings.id,
          slice: { ...slice, label: sliceLabel(slice) },
          fieldLabel,
          measure: measureName,
          amountText: format(slice.amount),
          totalText: format(plan.total),
          shareText: percent(slice.share),
          memberTexts: (slice.members ?? []).map((member) =>
            format(member.amount)
          ),
          showInputs: settings.aggregation !== "count",
        };
        return trace;
      },
      findRow: (id) => {
        const slice = plan.slices.find((item) =>
          item.row.contributors.some((row) => row.sourceId === id)
        );
        return slice && { kind: "donut-slice", id: slice.key };
      },
      targets: () =>
        plan.slices.map((slice) => ({
          kind: "donut-slice",
          id: slice.key,
          label: sliceLabel(slice),
        })),
    };
    // Formatting reads field settings, which the revision already tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision, plan, owner, settings.id, settings.field, fieldLabel]);
  useTraceSource(owner, source);
  const inspect = (key: string) => api?.inspect(owner, "donut-slice", key);

  if (setupMessage || plan.message || plan.slices.length === 0) {
    return (
      <ChartMessage width={width} height={height}>
        {setupMessage ?? plan.message ?? NO_MATCHING_ROWS}
      </ChartMessage>
    );
  }

  const side = width >= SIDE_LEGEND_MIN_WIDTH;
  const bodyHeight = Math.max(80, height - 32 - STATUS_LINE_HEIGHT - 8);
  const legendRows = plan.slices.length;
  const ringSize = side
    ? Math.min(bodyHeight, width * 0.55)
    : Math.max(
        80,
        Math.min(width - 16, bodyHeight - Math.ceil(legendRows / 2) * 26 - 12)
      );
  const radius = ringSize / 2 - 4;
  const pieLayout = shapePie<DonutSlice>()
    .sort(null)
    .value((slice) => slice.amount)
    .padAngle(plan.slices.length > 1 ? 0.012 : 0);
  const arcs = pieLayout(plan.slices);
  const sliceArc = shapeArc<(typeof arcs)[number]>()
    .innerRadius(radius * 0.62)
    .outerRadius(radius)
    .cornerRadius(2);
  // The total and its measure fit inside the hole, or the measure drops.
  const hole = radius * 0.62 * 2 - 10;
  const totalSize = Math.max(12, Math.min(22, radius * 0.3));
  const centerName = measureField ? getFieldLabel(measureField) : "Rows";
  const centerLabel = centerName.length * 6.2 <= hole ? centerName : undefined;
  const hasSelection = Boolean(valueFilter);
  const hoveredSlice = plan.slices.find((slice) => slice.key === hovered);
  const statusHint =
    !hasSelection &&
    !facetIds &&
    width >= STATUS_HINT_MIN_WIDTH &&
    "Click a slice to select its rows";
  const otherSlice = plan.slices.find((slice) => slice.key === "__other");
  const statusParts = [
    valueFilter &&
      `${selectedValues.length} ${selectedValues.length === 1 ? "category" : "categories"} selected`,
    otherSlice && `${otherSlice.members!.length} smaller categories in Other`,
  ];
  const sliceAction = (slice: DonutSlice) => ({
    onPointerEnter: () => setHovered(slice.key),
    onPointerLeave: () => setHovered(null),
    onFocus: () => setHovered(slice.key),
    onBlur: () => setHovered(null),
    onClick: (event: React.MouseEvent) => {
      event.stopPropagation();
      if (event.altKey) inspect(slice.key);
      else select(slice);
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (event.altKey) inspect(slice.key);
        else select(slice);
      }
    },
  });

  return (
    <div
      className="relative"
      style={{ width, height }}
      onClick={(event) => {
        if (!event.altKey && isEmptyPlotTarget(event.target)) clear();
      }}
    >
      {hoveredSlice && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          <span className="eda-readout-item">
            <span>{fieldLabel}</span>
            <b>{sliceLabel(hoveredSlice)}</b>
          </span>
          <span className="eda-readout-item">
            <span>{measureName}</span>
            <b>{format(hoveredSlice.amount)}</b>
          </span>
          <span className="eda-readout-item">
            <span>Share</span>
            <b>{percent(hoveredSlice.share)}</b>
          </span>
        </ChartReadout>
      )}
      <div
        className={`eda-donut ${side ? "eda-donut-side" : "eda-donut-stacked"}`}
        style={{ height: bodyHeight }}
      >
        <svg
          width={ringSize}
          height={ringSize}
          role="group"
          aria-label={`${fieldLabel} shares of ${measureName}`}
        >
          <g transform={`translate(${ringSize / 2},${ringSize / 2})`}>
            {arcs.map((item, index) => {
              const slice = item.data;
              const selected = isSelected(slice);
              return (
                <path
                  key={slice.key}
                  d={sliceArc(item) ?? undefined}
                  role="button"
                  tabIndex={0}
                  aria-label={`${sliceLabel(slice)}: ${format(slice.amount)}, ${percent(slice.share)}`}
                  aria-pressed={selected}
                  className="chart-mark eda-donut-slice cursor-pointer"
                  data-selected={selected || undefined}
                  style={{
                    fill: colorOf(slice, index),
                    opacity: hasSelection && !selected ? 0.3 : 1,
                  }}
                  {...sliceAction(slice)}
                />
              );
            })}
            <text
              className="eda-donut-total"
              textAnchor="middle"
              y={centerLabel ? -2 : 6}
              fontSize={totalSize}
            >
              {format(plan.total)}
            </text>
            {centerLabel && (
              <text
                className="eda-donut-measure"
                textAnchor="middle"
                y={Math.max(14, totalSize * 0.85)}
              >
                {centerLabel}
              </text>
            )}
          </g>
        </svg>
        <ul className="eda-donut-legend" aria-label={`${fieldLabel} legend`}>
          {plan.slices.map((slice, index) => {
            const selected = isSelected(slice);
            return (
              <li key={slice.key}>
                <button
                  type="button"
                  className="eda-donut-legend-item"
                  aria-pressed={selected}
                  data-dimmed={(hasSelection && !selected) || undefined}
                  {...sliceAction(slice)}
                >
                  <span
                    className="eda-donut-swatch"
                    style={{ background: colorOf(slice, index) }}
                    aria-hidden="true"
                  />
                  <span className="eda-donut-legend-label">
                    {sliceLabel(slice)}
                  </span>
                  <span className="eda-donut-legend-share">
                    {percent(slice.share)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
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
