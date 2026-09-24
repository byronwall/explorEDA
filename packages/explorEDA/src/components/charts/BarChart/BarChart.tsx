import {
  categoryEqual,
  categoryIncludes,
  categoryKey,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";
import { numericScale } from "../Axis/numericScale";
import { numericBins } from "./bins";
import { useColorScales } from "@/hooks/useColorScales";
import { getRangeFilterForField } from "@/hooks/getAxisFilter";
import { applyFilter } from "@/hooks/applyFilter";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { ValueFilter } from "@/types/FilterTypes";
import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from "d3-scale";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { useCustomCompareMemo } from "use-custom-compare";
import { BaseChart, type ChartGuide } from "../BaseChart";
import { useGetColumnData, useGetColumnDataForIds } from "../useGetColumnData";
import { useGetLiveData, useGetLiveIds } from "../useGetLiveData";
import {
  calculateGroupedAggregate,
  displayAggregateValue,
  type AggregateResult,
  type AggregateResultRow,
} from "@/lib/aggregates";
import { planAggregateBars, type AggregateBarPlan } from "./barPlanner";
import { BarChartSettings } from "./definition";
import { getChartAxisLabel } from "../chartAccessibility";
import {
  useBarTraceSelection,
  type BarTraceSelection,
} from "./BarTraceContext";

const X_SCALE_PADDING = 0.05; // 5% padding on each side
const Y_SCALE_PADDING = 0.1; // 10% padding for top of bars

type NumericBin = {
  label: string;
  start: number;
  end: number;
  value: number;
  isNumeric: true;
};

type CategoryBin = {
  label: string;
  category: datum;
  value: number;
  isNumeric: false;
};

type AggregateBin = {
  label: string;
  category: datum;
  value: number | undefined;
  isNumeric: false;
  aggregateRow: AggregateResultRow;
};

type BarChartProps = BaseChartProps<BarChartSettings> & {
  aggregateResult?: AggregateResult;
  aggregateScope?: string;
};

export function BarChart({
  settings,
  width,
  height,
  facetIds,
  aggregateResult,
  aggregateScope = "This result uses the current globally filtered source rows",
}: BarChartProps) {
  const getAggregateResult = useDataLayer((s) => s.getAggregateResult);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const nonce = useDataLayer((s) => s.nonce);
  const aggregates = useDataLayer((s) => s.aggregates);
  const aggregateLiveItems = useDataLayer((s) => s.getLiveItems(settings));
  const liveIds = useGetLiveIds(settings, facetIds);
  const resolvedAggregateResult = useMemo(() => {
    void aggregates;
    void aggregateLiveItems;
    void fieldSettings;
    void nonce;
    return settings.aggregateId
      ? getAggregateResult(settings.aggregateId, liveIds)
      : undefined;
  }, [
    settings.aggregateId,
    getAggregateResult,
    aggregates,
    aggregateLiveItems,
    fieldSettings,
    liveIds,
    nonce,
  ]);
  const effectiveAggregateResult = aggregateResult ?? resolvedAggregateResult;
  void fieldSettings;
  void nonce;
  const isAggregate = Boolean(settings.aggregateId);
  // Get all data for axis limits calculation (not filtered by current selections)
  const allColData = useGetColumnDataForIds(settings.field);
  const fieldData = useGetColumnData(settings.field);
  // Get filtered data for rendering
  const liveColData = useGetLiveData(settings, settings.field, facetIds);

  const updateChart = useDataLayer((s) => s.updateChart);
  const { getColorForValue } = useColorScales();
  const [hoveredGuide, setHoveredGuide] = useState<ChartGuide | null>(null);
  const traceScope = useBarTraceSelection();
  const traceSelect = traceScope?.select;
  const traceRegister = traceScope?.register;
  const traceRevision = useRef(nonce);
  const owner = useId();

  const isNumeric = useMemo(
    () =>
      !isAggregate &&
      fieldSettings[settings.field]?.type !== "categorical" &&
      !settings.forceString &&
      allColData.some((d) => d != null && d !== "") &&
      allColData
        .filter((d) => d != null && d !== "")
        .every((d) => typeof d !== "boolean" && Number.isFinite(Number(d))),
    [
      allColData,
      fieldSettings,
      isAggregate,
      settings.field,
      settings.forceString,
    ]
  );

  // Calculate chart data from live (filtered) data for rendering
  const chartData = useMemo(() => {
    void nonce;
    if (isAggregate) {
      return (effectiveAggregateResult?.rows ?? []).map(
        (row): AggregateBin => ({
          label: row.groupLabel,
          category: row.groupValue,
          value: row.value,
          isNumeric: false,
          aggregateRow: row,
        })
      );
    }
    if (isNumeric) {
      return numericBins(
        allColData.filter((d) => d != null && d !== "").map(Number),
        liveColData.filter((d) => d != null && d !== "").map(Number),
        settings.binCount || 20
      );
    } else {
      const categories = new Map(
        allColData.map((value) => [categoryKey(value), categoryValue(value)])
      );
      const counts = new Map<string, number>();
      liveColData.forEach((value) =>
        counts.set(
          categoryKey(value),
          (counts.get(categoryKey(value)) ?? 0) + 1
        )
      );
      return Array.from(
        categories,
        ([key, category]): CategoryBin => ({
          label: categoryLabel(category),
          category,
          value: counts.get(key) ?? 0,
          isNumeric: false,
        })
      );
    }
  }, [
    effectiveAggregateResult,
    allColData,
    isAggregate,
    isNumeric,
    liveColData,
    settings.binCount,
    nonce,
  ]);

  // Calculate min/max from ALL data for axis limits
  const { min, max, uniqueValues } = useMemo(() => {
    if (isAggregate) {
      return {
        min: undefined,
        max: undefined,
        uniqueValues: chartData.map((item) => item.label),
      };
    }
    if (isNumeric) {
      const numericData = allColData
        .filter((d) => d != null && d !== "")
        .map(Number);
      const dataMin = Math.min(...numericData);
      const dataMax = Math.max(...numericData);

      return {
        min: dataMin === dataMax ? dataMin - 0.5 : dataMin,
        max: dataMin === dataMax ? dataMax + 0.5 : dataMax,
        uniqueValues: undefined,
      };
    }

    return {
      min: undefined,
      max: undefined,
      uniqueValues: Array.from(new Set(allColData.map(categoryLabel))),
    };
  }, [allColData, chartData, isAggregate, isNumeric]);

  // Keep numeric axis labels and X ticks inside the SVG viewport.
  const populationCounts = isNumeric
    ? numericBins(
        allColData.filter((d) => d != null && d !== "").map(Number),
        allColData.filter((d) => d != null && d !== "").map(Number),
        settings.binCount || 20
      ).map((bin) => bin.value)
    : isAggregate
      ? chartData
          .map((item) => item.value)
          .filter((value): value is number => Number.isFinite(value))
      : Array.from(
          allColData
            .reduce(
              (counts, value) =>
                counts.set(
                  categoryKey(value),
                  (counts.get(categoryKey(value)) ?? 0) + 1
                ),
              new Map<string, number>()
            )
            .values()
        );
  const yScaleMax = Math.max(
    1,
    Math.max(...populationCounts, 0) * (1 + Y_SCALE_PADDING)
  );
  const aggregateMin = isAggregate ? Math.min(...populationCounts, 0) : 0;
  const aggregateMax = isAggregate
    ? Math.max(...populationCounts, 0)
    : yScaleMax;
  const aggregatePadding =
    isAggregate && aggregateMin === aggregateMax
      ? 0.5
      : (aggregateMax - aggregateMin) * Y_SCALE_PADDING;
  const aggregateAxisFields = isAggregate
    ? {
        x: effectiveAggregateResult?.spec.groupField,
        y:
          effectiveAggregateResult?.spec.aggregation === "count"
            ? undefined
            : effectiveAggregateResult?.spec.measureField,
      }
    : undefined;
  const aggregateXAxisLabel =
    effectiveAggregateResult &&
    (settings.xAxisLabel ||
      getFieldLabel(effectiveAggregateResult.spec.groupField));
  const aggregateYAxisLabel = effectiveAggregateResult
    ? settings.yAxisLabel ||
      (effectiveAggregateResult.spec.aggregation === "count"
        ? "Count"
        : getFieldLabel(
            effectiveAggregateResult.spec.measureField ?? "Measure"
          ))
    : settings.yAxisLabel;
  const xAxisLabel = getChartAxisLabel(
    aggregateAxisFields?.x ?? settings.field,
    isAggregate ? aggregateXAxisLabel || "" : settings.xAxisLabel,
    getFieldLabel
  );
  const yAxisLabel = getChartAxisLabel(
    aggregateAxisFields?.y,
    isAggregate ? aggregateYAxisLabel || "" : settings.yAxisLabel,
    getFieldLabel
  );
  const yTickLabelWidth = Math.max(
    ...scaleLinear()
      .domain(
        isAggregate
          ? [
              aggregateMin - (aggregateMin < 0 ? aggregatePadding : 0),
              aggregateMax + aggregatePadding,
            ]
          : [0, yScaleMax]
      )
      .ticks(5)
      .map((tick) => String(tick).length * 7 + (yAxisLabel ? 38 : 18))
  );
  const minPlotWidth = Math.min(
    80,
    Math.max(0, width - settings.margin.left - settings.margin.right)
  );
  const maxLeftMargin = Math.max(
    0,
    width - settings.margin.right - minPlotWidth
  );
  const margin = {
    ...settings.margin,
    left: Math.min(
      Math.max(settings.margin.left, yTickLabelWidth),
      maxLeftMargin
    ),
    bottom: Math.max(settings.margin.bottom, xAxisLabel ? 46 : 28),
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  // Create scales with synchronized limits if in a facet
  const xScale = useCustomCompareMemo(
    () => {
      if (min !== undefined && max !== undefined) {
        // Numerical x-axis
        const padding = (max - min) * X_SCALE_PADDING;
        return numericScale(settings.xAxis)
          .domain([min - padding, max + padding])
          .range([0, innerWidth]);
      } else {
        return scaleBand()
          .domain(uniqueValues ?? [])
          .range([0, innerWidth])
          .padding(0.3);
      }
    },
    [innerWidth, max, min, uniqueValues, settings.xAxis],
    isEqual
  ) as ScaleLinear<number, number> | ScaleBand<string>;

  const yScale = useMemo(() => {
    return numericScale(settings.yAxis)
      .domain(
        isAggregate
          ? [
              aggregateMin - (aggregateMin < 0 ? aggregatePadding : 0),
              aggregateMax + aggregatePadding,
            ]
          : [0, yScaleMax]
      )
      .range([innerHeight, 0]);
  }, [
    aggregateMax,
    aggregateMin,
    aggregatePadding,
    innerHeight,
    isAggregate,
    settings.yAxis,
    yScaleMax,
  ]);

  const isBandScale = "bandwidth" in xScale;

  const countAggregateResult = useMemo<AggregateResult | undefined>(() => {
    if (isAggregate || isNumeric || !isBandScale) return undefined;

    const spec = {
      id: `${settings.id}:count`,
      name: `Count by ${settings.field}`,
      groupField: settings.field,
      aggregation: "count" as const,
    };
    const result = calculateGroupedAggregate(
      liveIds.map((id) => ({ __ID: id, [settings.field]: fieldData[id] })),
      spec
    );
    const rowsByKey = new Map(
      result.rows.map((row) => [categoryKey(row.groupValue), row])
    );
    const rows = chartData
      .filter((item): item is CategoryBin => !item.isNumeric)
      .map(
        (item) =>
          rowsByKey.get(categoryKey(item.category)) ?? {
            id: `${spec.id}:${categoryKey(item.category)}`,
            groupValue: item.category,
            groupLabel: item.label,
            value: 0,
            rowCount: 0,
            contributors: [],
          }
      );
    return { ...result, rows };
  }, [
    chartData,
    fieldData,
    isAggregate,
    isBandScale,
    isNumeric,
    liveIds,
    settings.field,
    settings.id,
  ]);

  const countDomainValues = useMemo(() => {
    if (!countAggregateResult) return undefined;
    const counts = new Map<string, { rowId: string; value: number }>();
    allColData.forEach((value) => {
      const key = categoryKey(value);
      const item = counts.get(key);
      if (item) item.value += 1;
      else {
        counts.set(key, {
          rowId: `${countAggregateResult.spec.id}:${key}`,
          value: 1,
        });
      }
    });
    return Array.from(counts.values());
  }, [allColData, countAggregateResult]);

  const aggregatePlan = useMemo<AggregateBarPlan | undefined>(() => {
    if (!isAggregate || !effectiveAggregateResult || !isBandScale) {
      return undefined;
    }
    return planAggregateBars({
      rows: effectiveAggregateResult.rows,
      width,
      height,
      margin,
      yAxis: settings.yAxis,
      xScale: xScale as ScaleBand<string>,
      yScale,
      colorScaleId: settings.colorScaleId,
      getColor: (value) =>
        getColorForValue(settings.colorScaleId, value, "#3479a8"),
    });
  }, [
    effectiveAggregateResult,
    getColorForValue,
    height,
    isAggregate,
    isBandScale,
    margin,
    settings.colorScaleId,
    settings.yAxis,
    width,
    xScale,
    yScale,
  ]);

  const countPlan = useMemo<AggregateBarPlan | undefined>(() => {
    if (!countAggregateResult || !isBandScale) return undefined;
    return planAggregateBars({
      rows: countAggregateResult.rows,
      width,
      height,
      margin,
      yAxis: settings.yAxis,
      xScale: xScale as ScaleBand<string>,
      yScale,
      domainValues: countDomainValues,
      colorScaleId: settings.colorScaleId,
      getColor: (value) =>
        getColorForValue(settings.colorScaleId, value, "#3479a8"),
    });
  }, [
    countAggregateResult,
    countDomainValues,
    getColorForValue,
    height,
    isBandScale,
    margin,
    settings.colorScaleId,
    settings.yAxis,
    width,
    xScale,
    yScale,
  ]);

  const tracePlan = aggregatePlan ?? countPlan;
  const countScopeDescription =
    "Rows after other chart filters; this chart's selected categories are shown in color";

  const traceScales = useMemo(
    () => ({
      x: {
        type: isBandScale ? "band" : settings.xAxis.scaleType || "linear",
        domain: xScale.domain(),
        range: xScale.range(),
      },
      y: {
        type: settings.yAxis.scaleType || "linear",
        domain: yScale.domain(),
        range: yScale.range(),
      },
    }),
    [isBandScale, settings.xAxis.scaleType, settings.yAxis.scaleType, xScale, yScale]
  );

  const traceRevisionKey = useMemo(
    () =>
      JSON.stringify({
        filters: settings.filters,
        liveIds,
        chartData: chartData.map((item) => ({
          label: item.label,
          value: item.value,
          start: item.isNumeric ? item.start : undefined,
          end: item.isNumeric ? item.end : undefined,
          category: item.isNumeric ? undefined : item.category,
        })),
        bars: tracePlan?.bars.map((bar) => [
          bar.markId,
          bar.value,
          bar.x,
          bar.y,
          bar.width,
          bar.height,
        ]),
        xScale: traceScales.x,
        yScale: traceScales.y,
      }),
    [chartData, liveIds, settings.filters, tracePlan, traceScales]
  );

  const selectTrace = useCallback(
    (selection: Omit<BarTraceSelection, "owner">) => {
      traceSelect?.({ ...selection, owner, revision: traceRevisionKey });
    },
    [owner, traceRevisionKey, traceSelect]
  );

  const traceGuide = useCallback(
    (guide: ChartGuide): Omit<BarTraceSelection, "owner"> => {
      const field =
        guide.axis === "x"
          ? effectiveAggregateResult?.spec.groupField ?? settings.field
          : effectiveAggregateResult?.spec.measureField ??
            (effectiveAggregateResult?.spec.aggregation === "count"
              ? "Row count"
              : settings.field);
      return {
        kind: "guide",
        id: guide.id,
        field,
        fieldLabel: field === "Row count" ? field : getFieldLabel(field),
        revision: traceRevisionKey,
        guide,
        xScale: traceScales.x,
        yScale: traceScales.y,
      };
    },
    [effectiveAggregateResult, getFieldLabel, settings.field, traceRevisionKey, traceScales]
  );

  const valueFilter = settings.filters.find(
    (f): f is ValueFilter => f.type === "value" && f.field === settings.field
  );
  const rangeFilter = isAggregate
    ? undefined
    : getRangeFilterForField(settings.filters, settings.field);
  const hasActiveFilters = !isAggregate && (valueFilter || rangeFilter);

  const handleBarClick = useCallback(
    (label: datum) => {
      if (isAggregate) {
        return;
      }
      if (!isBandScale) {
        return;
      }

      const filterValues = valueFilter?.values ?? [];
      const newValues = categoryIncludes(filterValues, label)
        ? filterValues.filter((f) => !categoryEqual(f, label))
        : [...filterValues, label];

      // Create new filters array with updated value filter
      const newFilters = settings.filters.filter(
        (f) => f.type !== "value" || f.field !== settings.field
      );

      if (newValues.length > 0) {
        newFilters.push({
          type: "value",
          field: settings.field,
          values: newValues,
        });
      }

      updateChart(settings.id, {
        filters: newFilters,
      });
    },
    [
      isBandScale,
      settings.id,
      settings.field,
      updateChart,
      valueFilter,
      settings.filters,
      effectiveAggregateResult,
      isAggregate,
    ]
  );

  const inspectBarGuide = useCallback(
    (guide: ChartGuide) => {
      selectTrace(traceGuide(guide));
    },
    [selectTrace, traceGuide]
  );

  const getTraceGuides = useCallback(() => {
    const guides: ChartGuide[] = [
      { id: "x-axis", axis: "x", role: "axis", x: 0, y: 0 },
      { id: "y-axis", axis: "y", role: "axis", x: 0, y: 0 },
    ];
    if (Number.isFinite(yScale(0))) {
      guides.push({
        id: "y-zero",
        axis: "y",
        role: "zero",
        value: 0,
        x: 0,
        y: yScale(0),
      });
    }
    if ("ticks" in xScale) {
      xScale.ticks(Math.min(settings.xGridLines || 5, 12)).forEach((tick) =>
        guides.push({
          id: `x-tick:${String(tick)}`,
          axis: "x",
          role: "tick",
          value: tick,
          label: String(tick),
          x: xScale(tick),
          y: 0,
        })
      );
    } else {
      xScale.domain().slice(0, 12).forEach((tick) =>
        guides.push({
          id: `x-tick:${String(tick)}`,
          axis: "x",
          role: "tick",
          value: tick,
          label: String(tick),
          x: (xScale(tick) ?? 0) + xScale.bandwidth() / 2,
          y: 0,
        })
      );
    }
    if ("ticks" in yScale) {
      yScale.ticks(Math.min(settings.yGridLines || 5, 12)).forEach((tick) =>
        guides.push({
          id: `y-tick:${String(tick)}`,
          axis: "y",
          role: "tick",
          value: tick,
          label: String(tick),
          x: 0,
          y: yScale(tick),
        })
      );
    }
    return guides.map(traceGuide);
  }, [settings.xGridLines, settings.yGridLines, traceGuide, xScale, yScale]);

  const getTraceTitle = useCallback(
    (): BarTraceSelection => ({
      kind: "title",
      id: "title",
      field: settings.field,
      fieldLabel: getFieldLabel(settings.field),
      revision: traceRevisionKey,
      xScale: traceScales.x,
      yScale: traceScales.y,
    }),
    [getFieldLabel, settings.field, traceRevisionKey, traceScales]
  );

  const inspectAggregateBar = useCallback(
    (bar: AggregateBarPlan["bars"][number], result: AggregateResult) => {
      selectTrace({
        kind: "bar",
        id: bar.markId,
        field: result.spec.groupField,
        fieldLabel: getFieldLabel(result.spec.groupField),
        bar: {
          markId: bar.markId,
          label: bar.label,
          value: bar.value,
          groupValue: bar.groupValue,
          geometry: { x: bar.x, y: bar.y, width: bar.width, height: bar.height },
          baseline: bar.baseline,
          fill: bar.fill,
        },
        result,
        selectedRowId: bar.rowId,
        plan: tracePlan,
        xScale: traceScales.x,
        yScale: traceScales.y,
        scopeDescription: isAggregate ? aggregateScope : countScopeDescription,
      });
    },
    [aggregateScope, countScopeDescription, getFieldLabel, isAggregate, selectTrace, tracePlan, traceScales]
  );

  const inspectRegularBar = useCallback(
    (item: NumericBin | CategoryBin, index: number, x: number, y: number, width: number, height: number) => {
      selectTrace({
        kind: "bar",
        id: `bar:${index}`,
        field: settings.field,
        fieldLabel: getFieldLabel(settings.field),
        bar: {
          markId: `bar:${index}`,
          label: item.label,
          value: item.value,
          groupValue: item.isNumeric ? item.start : item.category,
          start: item.isNumeric ? item.start : undefined,
          end: item.isNumeric ? item.end : undefined,
          geometry: { x, y, width, height },
          baseline: yScale(0),
          fill: getColorForValue(settings.colorScaleId, item.isNumeric ? item.start : item.category, "#3479a8"),
        },
        xScale: traceScales.x,
        yScale: traceScales.y,
      });
    },
    [getColorForValue, getFieldLabel, selectTrace, settings.colorScaleId, settings.field, traceScales, yScale]
  );

  const inspectBarAtPoint = useCallback(
    (point: [number, number], _anchor: DOMRect) => {
      const [pointX, pointY] = point;
      const plannedBar = tracePlan?.bars.find(
        (bar) =>
          pointX >= bar.x &&
          pointX <= bar.x + bar.width &&
          pointY >= bar.y &&
          pointY <= bar.y + bar.height
      );
      if (plannedBar && (aggregatePlan || countPlan)) {
        inspectAggregateBar(plannedBar, isAggregate ? effectiveAggregateResult! : countAggregateResult!);
        return true;
      }

      if (!isNumeric) return false;
      const linearScale = xScale as ScaleLinear<number, number>;
      const baseline = yScale(0);
      const numericBarIndex = chartData.findIndex((item) => {
        if (!item.isNumeric || typeof item.value !== "number") return false;
        const bin = item as NumericBin;
        const x = linearScale(bin.start);
        const width = linearScale(bin.end) - x;
        const valuePosition = yScale(item.value);
        const y = Math.min(baseline, valuePosition);
        const height = Math.max(1, Math.abs(baseline - valuePosition));
        return (
          pointX >= x &&
          pointX <= x + Math.max(0, width - 1) &&
          pointY >= y &&
          pointY <= y + height
        );
      });
      if (numericBarIndex < 0) return false;
      const numericBar = chartData[numericBarIndex] as NumericBin;

      const x = linearScale(numericBar.start);
      inspectRegularBar(
        numericBar,
        numericBarIndex,
        x,
        Math.min(baseline, yScale(numericBar.value)),
        Math.max(0, linearScale(numericBar.end) - x - 1),
        Math.max(1, Math.abs(baseline - yScale(numericBar.value)))
      );
      return true;
    },
    [chartData, countAggregateResult, effectiveAggregateResult, inspectAggregateBar, inspectRegularBar, isAggregate, isNumeric, tracePlan, xScale, yScale]
  );

  const findTraceRow = useCallback(
    (id: number) => {
      if (isAggregate || countAggregateResult) {
        const result = isAggregate ? effectiveAggregateResult : countAggregateResult;
        const row = result?.rows.find((candidate) =>
          candidate.contributors.some((contributor) => contributor.sourceId === id)
        );
        const bar = row && tracePlan?.bars.find((candidate) => candidate.rowId === row.id);
        if (row && bar && result) {
          inspectAggregateBar(bar, result);
          return true;
        }
        return false;
      }
      if (!liveIds.includes(id)) return false;
      const value = fieldData[id];
      if (value === undefined) return false;
      if (isNumeric) {
        const number = Number(value);
        const index = chartData.findIndex((item, itemIndex) => {
          if (!item.isNumeric) return false;
          return number >= item.start &&
            (number < item.end || itemIndex === chartData.length - 1);
        });
        const item = chartData[index];
        if (index >= 0 && item?.isNumeric && typeof item.value === "number") {
          const scale = xScale as ScaleLinear<number, number>;
          const x = scale(item.start);
          inspectRegularBar(item as NumericBin, index, x, Math.min(yScale(0), yScale(item.value)), Math.max(0, scale(item.end) - x - 1), Math.max(1, Math.abs(yScale(0) - yScale(item.value))));
          return true;
        }
        return false;
      }
      const index = chartData.findIndex(
        (item) => !item.isNumeric && categoryEqual(item.category, value)
      );
      const item = chartData[index];
      if (index < 0 || !item || item.isNumeric || typeof item.value !== "number") return false;
      const scale = xScale as ScaleBand<string>;
      const x = scale(item.label) ?? 0;
      inspectRegularBar(item as CategoryBin, index, x, Math.min(yScale(0), yScale(item.value)), scale.bandwidth(), Math.max(1, Math.abs(yScale(0) - yScale(item.value))));
      return true;
    },
    [chartData, countAggregateResult, effectiveAggregateResult, fieldData, inspectAggregateBar, inspectRegularBar, isAggregate, isNumeric, liveIds, tracePlan, xScale, yScale]
  );

  useEffect(() => {
    const selection = traceScope?.selection;
    if (selection?.owner !== owner) return;
    if (selection.revision !== traceRevisionKey) {
      traceSelect?.(null);
    }
  }, [owner, traceRevisionKey, traceScope?.selection, traceSelect]);

  useEffect(() => {
    if (traceRevision.current === nonce) return;
    traceRevision.current = nonce;
    if (traceScope?.selection?.owner === owner) traceSelect?.(null);
  }, [nonce, owner, traceScope?.selection, traceSelect]);

  useEffect(
    () =>
      traceRegister?.(owner, {
        inspect: (selection) => traceSelect?.({ ...selection, owner, revision: traceRevisionKey }),
        findRow: findTraceRow,
        guides: getTraceGuides,
        title: getTraceTitle,
      }),
    [findTraceRow, getTraceGuides, getTraceTitle, owner, traceRegister, traceRevisionKey, traceSelect]
  );

  const handleBrushChange = useCallback(
    (extent: [[number, number], [number, number]] | null) => {
      if (!extent) {
        // Remove both value and range filters for the field
        const newFilters = settings.filters.filter(
          (f) => f.field !== settings.field
        );
        updateChart(settings.id, {
          filters: newFilters,
        });
        return;
      }

      if (isBandScale) {
        return;
      }

      const xStart = extent?.[0]?.[0];
      const xEnd = extent?.[1]?.[0];

      const linearScale = xScale as ScaleLinear<number, number>;
      const start = linearScale.invert(xStart);
      const end = linearScale.invert(xEnd);

      // Create new filters array with updated range filter
      const newFilters = settings.filters.filter(
        (f) => f.field !== settings.field
      );

      newFilters.push({
        type: "range",
        field: settings.field,
        min: start,
        max: end,
      });

      updateChart(settings.id, {
        filters: newFilters,
      });
    },
    [
      isBandScale,
      settings.id,
      settings.field,
      updateChart,
      xScale,
      settings.filters,
    ]
  );

  return (
    <div className="relative" style={{ width, height }}>
      <BaseChart
        width={width}
        height={height}
        xScale={xScale}
        yScale={yScale}
        brushingMode={isBandScale ? "none" : "horizontal"}
        onBrushChange={handleBrushChange}
        settings={{
          ...settings,
          ...(isAggregate
            ? {
                xAxisLabel: aggregateXAxisLabel || "",
                yAxisLabel: aggregateYAxisLabel || "",
              }
            : {}),
          margin,
          yAxis: { grid: true, ...settings.yAxis },
        }}
        axisFields={aggregateAxisFields}
        onInspectGuide={inspectBarGuide}
        onHoverGuide={setHoveredGuide}
        onInspectPlot={inspectBarAtPoint}
        overlay={
          Number.isFinite(yScale(0)) ? (
            <line
              x1={0}
              x2={innerWidth}
              y1={yScale(0)}
              y2={yScale(0)}
              className="stroke-border"
              data-guide-id="y-zero"
              data-guide-axis="y"
              data-guide-role="zero"
              data-guide-value={0}
              data-guide-x={0}
              data-guide-y={yScale(0)}
              tabIndex={0}
              role="button"
              aria-label="Zero baseline"
            />
          ) : undefined
        }
      >
        <g>
          {aggregatePlan || countPlan
            ? (aggregatePlan ?? countPlan)!.bars.map((bar) => {
                const isCountBar = Boolean(countPlan && !aggregatePlan);
                const isFiltered = valueFilter
                  ? applyFilter(bar.groupValue, valueFilter)
                  : true;
                const fill =
                  isCountBar && hasActiveFilters && !isFiltered
                    ? "rgb(156 163 175)"
                    : bar.fill;
                const measureLabel = isCountBar
                  ? `${bar.value} records`
                  : displayAggregateValue(bar.value);

                return (
                  <rect
                    key={bar.markId}
                    data-plan-id={bar.markId}
                    data-aggregate-row-id={bar.rowId}
                    data-guide-id={`bar:${bar.markId}`}
                    data-guide-axis="y"
                    data-guide-role="bar"
                    data-guide-value={bar.value}
                    data-guide-label={bar.label}
                    data-guide-x={bar.x}
                    data-guide-y={bar.y}
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    rx={1.5}
                    role="button"
                    tabIndex={0}
                    aria-label={`${bar.label}: ${measureLabel}`}
                    aria-pressed={
                      isCountBar && valueFilter
                        ? applyFilter(bar.groupValue, valueFilter)
                        : undefined
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (event.altKey) {
                          inspectAggregateBar(
                            bar,
                            isCountBar ? countAggregateResult! : effectiveAggregateResult!
                          );
                        } else if (isCountBar) {
                          handleBarClick(bar.groupValue);
                        }
                      }
                    }}
                    className="chart-mark cursor-pointer"
                    style={{ fill }}
                    onClick={(event) => {
                      if (isCountBar) {
                        if (event.altKey) {
                          event.preventDefault();
                          event.stopPropagation();
                          inspectAggregateBar(bar, countAggregateResult!);
                        } else {
                          handleBarClick(bar.groupValue);
                        }
                        return;
                      }
                      if (event.altKey) {
                        event.preventDefault();
                        event.stopPropagation();
                        inspectAggregateBar(bar, effectiveAggregateResult!);
                      }
                    }}
                  />
                );
              })
            : chartData.map((d, i) => {
                const isNumeric = d.isNumeric;
                let x: number;
                let barWidth: number;

                if (isNumeric) {
                  const numericBin = d as NumericBin;
                  const linearScale = xScale as ScaleLinear<number, number>;
                  x = linearScale(numericBin.start);
                  barWidth =
                    linearScale(numericBin.end) - linearScale(numericBin.start);
                } else {
                  const categoryBin = d as CategoryBin;
                  const bandScale = xScale as ScaleBand<string>;
                  x = bandScale(categoryBin.label) || 0;
                  barWidth = bandScale.bandwidth();
                }

                const value = isNumeric
                  ? (d as NumericBin).start
                  : (d as CategoryBin).category;
                const aggregateRow =
                  !isNumeric && "aggregateRow" in d
                    ? (d as AggregateBin).aggregateRow
                    : undefined;
                let isFiltered = true;

                // Apply value and range filters using applyFilter
                if (valueFilter) {
                  isFiltered = applyFilter(value, valueFilter);
                }

                if (rangeFilter && isNumeric) {
                  isFiltered = applyFilter(value, rangeFilter);
                }

                const color =
                  hasActiveFilters && !isFiltered
                    ? "rgb(156 163 175)" // gray-400 for filtered out points
                    : getColorForValue(settings.colorScaleId, value, "#3479a8");

                if (typeof d.value !== "number" || !Number.isFinite(d.value)) {
                  return null;
                }

                const baseline = yScale(0);
                const valuePosition = yScale(d.value);
                const barHeight = Math.abs(baseline - valuePosition);
                const barY = Math.min(baseline, valuePosition);

                if (barWidth < 1) {
                  return null;
                }

                const displayHeight = Math.max(1, barHeight);
                const measureLabel = isAggregate
                  ? aggregateRow && aggregateRow.value === undefined
                    ? "No valid numbers"
                    : displayAggregateValue(d.value)
                  : `${d.value} records`;

                return (
                  <rect
                    key={i}
                    data-guide-id={`bar:${i}`}
                    data-guide-axis="y"
                    data-guide-role="bar"
                    data-guide-value={d.value}
                    data-guide-label={d.label}
                    data-guide-x={x}
                    data-guide-y={barY}
                    data-guide-start={
                      isNumeric ? (d as NumericBin).start : undefined
                    }
                    data-guide-end={
                      isNumeric ? (d as NumericBin).end : undefined
                    }
                    x={x}
                    y={barY}
                    width={Math.max(0, barWidth - (isNumeric ? 1 : 0))}
                    rx={1.5}
                    role={isBandScale || isNumeric ? "button" : undefined}
                    tabIndex={isBandScale || isNumeric ? 0 : undefined}
                    aria-label={`${d.label}: ${measureLabel}`}
                    aria-pressed={
                      isBandScale
                        ? !!valueFilter && applyFilter(value, valueFilter)
                        : undefined
                    }
                    onKeyDown={(event) => {
                      if (
                        (isBandScale || isNumeric) &&
                        event.altKey &&
                        event.key === "Enter"
                      ) {
                        event.preventDefault();
                        inspectRegularBar(d as NumericBin | CategoryBin, i, x, barY, Math.max(0, barWidth - (isNumeric ? 1 : 0)), displayHeight);
                      } else if (
                        isBandScale &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();
                        handleBarClick(value);
                      }
                    }}
                    className={`chart-mark ${isBandScale ? "cursor-pointer" : ""}`}
                    style={{ fill: color }}
                    onClick={(event) => {
                      if (event.altKey) {
                        event.preventDefault();
                        event.stopPropagation();
                        inspectRegularBar(d as NumericBin | CategoryBin, i, x, barY, Math.max(0, barWidth - (isNumeric ? 1 : 0)), displayHeight);
                      } else if (isBandScale) {
                        handleBarClick((d as CategoryBin).category);
                      }
                    }}
                    height={displayHeight}
                  />
                );
              })}
        </g>
      </BaseChart>
      {hoveredGuide && (
        <div
          className="pointer-events-none absolute left-2 top-2 max-w-[min(16rem,70%)] rounded border border-border bg-card/95 px-2 py-1 text-xs text-card-foreground shadow-sm"
          role="status"
        >
          <div>
            {hoveredGuide.role === "bar"
              ? `Bar · ${hoveredGuide.label ?? "value"}`
              : `${hoveredGuide.axis === "x" ? "Horizontal" : "Vertical"} ${hoveredGuide.role}`}
          </div>
          {hoveredGuide.start !== undefined &&
          hoveredGuide.end !== undefined ? (
            <div>
              Bin interval: {hoveredGuide.start} to {hoveredGuide.end}
            </div>
          ) : (
            hoveredGuide.value !== undefined && (
              <div>Value: {String(hoveredGuide.value)}</div>
            )
          )}
          {hoveredGuide.role !== "bar" && hoveredGuide.label && (
            <div>Label: {hoveredGuide.label}</div>
          )}
        </div>
      )}
    </div>
  );
}
