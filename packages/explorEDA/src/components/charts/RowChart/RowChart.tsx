import {
  categoryEqual,
  categoryIncludes,
  categoryKey,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import { numericScale } from "../Axis/numericScale";
import { BaseChartProps, RowChartSettings } from "@/types/ChartTypes";

import { useColorScales } from "@/hooks/useColorScales";
import { applyFilter } from "@/hooks/applyFilter";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { datum, Filter, ValueFilter } from "@/types/FilterTypes";
import { scaleBand } from "d3-scale";
import { useMemo, useState } from "react";
import { useGetColumnDataForIds } from "../useGetColumnData";
import { BaseChart } from "../BaseChart";
import { getChartAxisFields, getChartAxisLabel } from "../chartAccessibility";
import { useGetLiveData } from "../useGetLiveData";
import { hasFieldDisplayFormat } from "@/lib/fieldSettings";
import { ChartReadout } from "../ChartReadout";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
  STATUS_LINE_HEIGHT,
} from "../ChartStatusLine";

/** Room above the category labels for the field name that titles them. */
const FIELD_TITLE_HEIGHT = 16;

const pct = (share: number) =>
  share.toLocaleString("en-US", { style: "percent", maximumFractionDigits: 1 });

type RowChartProps = BaseChartProps<RowChartSettings>;

export function RowChart({ settings, width, height, facetIds }: RowChartProps) {
  const allData = useGetColumnDataForIds(settings.field);
  const data = useGetLiveData(settings, settings.field, facetIds);

  const { getColorForValue } = useColorScales();

  const updateChart = useDataLayer((s) => s.updateChart);
  const formatFieldValue = useDataLayer((s) => s.formatFieldValue);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const [hovered, setHovered] = useState<string | null>(null);

  const valueFilter = settings.filters.find(
    (f: Filter): f is ValueFilter =>
      f.type === "value" && f.field === settings.field
  );
  const filterValues = valueFilter?.values ?? [];

  const handleBarClick = (label: datum) => {
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
  };

  // Chart dimensions
  const baseMargin = settings.margin;

  // Calculate counts and handle overflow
  const { displayCounts, otherCategories } = useMemo(() => {
    const countMap = new Map<datum, number>();
    allData.forEach((value) => {
      const key = categoryValue(value);
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    // Convert to array and sort by count descending
    const sortedCounts = Array.from(countMap.entries())
      .map(([value, count]) => ({
        value,
        key: categoryKey(value),
        label:
          value != null && hasFieldDisplayFormat(fieldSettings[settings.field])
            ? (formatFieldValue?.(settings.field, value) ??
              categoryLabel(value))
            : categoryLabel(value),
        count,
        other: false,
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate how many rows we can fit based on min and max row height constraints
    const availableHeight = height - baseMargin.top - baseMargin.bottom;
    const rowHeight = Math.max(
      settings.minRowHeight,
      Math.min(settings.maxRowHeight, availableHeight / sortedCounts.length)
    );
    const maxRows = Math.max(2, Math.floor(availableHeight / rowHeight));
    const liveCounts = new Map<datum, number>();
    data.forEach((value) => {
      const key = categoryValue(value);
      liveCounts.set(key, (liveCounts.get(key) ?? 0) + 1);
    });
    const visible = sortedCounts.map((item) => ({
      ...item,
      total: item.count,
      count: liveCounts.get(item.value) ?? 0,
    }));

    // If we have more items than we can display, create an "Others" category
    if (sortedCounts.length > maxRows) {
      const visibleCounts = visible.slice(0, maxRows - 1);
      const otherSum = visible
        .slice(maxRows - 1)
        .reduce((sum, item) => sum + item.count, 0);

      return {
        displayCounts: [
          ...visibleCounts,
          {
            key: "__other",
            label: "Other categories",
            value: undefined,
            other: true,
            count: otherSum,
            total: visible
              .slice(maxRows - 1)
              .reduce((sum, item) => sum + item.total, 0),
          },
        ],
        otherCategories: visible.length - visibleCounts.length,
      };
    }

    return {
      displayCounts: visible,
      otherCategories: 0,
    };
  }, [
    data,
    allData,
    height,
    baseMargin.top,
    baseMargin.bottom,
    settings.minRowHeight,
    settings.maxRowHeight,
    formatFieldValue,
    fieldSettings,
  ]);

  const yLabels = displayCounts.map((d) => d.label);
  const axisFields = getChartAxisFields(settings);
  const xAxisLabel = getChartAxisLabel(
    axisFields.x,
    settings.xAxisLabel,
    getFieldLabel
  );
  const requestedLabelMargin = Math.max(
    baseMargin.left,
    ...yLabels.map((label) => label.length * 7 + 24)
  );
  const minPlotWidth = Math.min(
    80,
    Math.max(0, width - baseMargin.left - baseMargin.right)
  );
  const maxLabelMargin = Math.max(0, width - baseMargin.right - minPlotWidth);
  const labelMargin = Math.min(requestedLabelMargin, maxLabelMargin);
  const margin = {
    ...baseMargin,
    top: baseMargin.top + FIELD_TITLE_HEIGHT,
    left: Math.min(labelMargin, width * 0.42),
    right: Math.max(baseMargin.right, 48),
    bottom:
      Math.max(baseMargin.bottom, xAxisLabel ? 42 : 26) + STATUS_LINE_HEIGHT,
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const chartSettings = { ...settings, margin };

  // Create scales with synchronized limits if in a facet
  const xScale = useMemo(() => {
    const maxValue = Math.max(1, ...displayCounts.map((d) => d.total));

    return numericScale(settings.xAxis)
      .domain([0, maxValue])
      .range([0, innerWidth])
      .nice();
  }, [displayCounts, innerWidth, settings.xAxis]);

  const yScale = useMemo(() => {
    return scaleBand()
      .domain(displayCounts.map((d) => d.key))
      .range([0, innerHeight])
      .padding(0.3);
  }, [displayCounts, innerHeight]);

  if (displayCounts.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-4 text-center text-sm text-muted-foreground"
        style={{ width, height }}
      >
        {settings.field
          ? "No rows match the current filters"
          : "Choose a field in chart settings."}
      </div>
    );
  }

  const yLabelsByKey = new Map(
    displayCounts.map((item) => [item.key, item.label])
  );
  const fieldLabel = getFieldLabel?.(settings.field) ?? settings.field;
  const liveRows = data.length;
  const isSelected = (item: (typeof displayCounts)[number]) =>
    !item.other &&
    Boolean(valueFilter) &&
    applyFilter(item.value, valueFilter!);
  const selectedItems = valueFilter ? displayCounts.filter(isSelected) : [];
  const hoveredItem = displayCounts.find((item) => item.key === hovered);
  const names = selectedItems.map((item) => item.label);
  const statusParts = [
    // Counts lead, so a narrow chart that cuts the line keeps them.
    valueFilter &&
      `${selectedItems
        .reduce((total, item) => total + item.count, 0)
        .toLocaleString()} of ${liveRows.toLocaleString()} rows selected: ${
        names.length > 3
          ? `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`
          : names.join(", ") || "categories in Other"
      }`,
    otherCategories > 0 &&
      `${otherCategories} smaller categories in Other categories`,
    !valueFilter &&
      !facetIds &&
      width >= STATUS_HINT_MIN_WIDTH &&
      "Click rows or labels to select, click more to add",
  ];
  const titleChars = Math.max(4, Math.floor((margin.left - 12) / 6));
  const step = yScale.step();

  return (
    <div className="relative" style={{ width, height }}>
      <BaseChart
        width={width}
        height={height}
        xScale={xScale}
        yScale={yScale}
        settings={chartSettings}
        footer={STATUS_LINE_HEIGHT}
        yTickFormatter={(value) =>
          yLabelsByKey.get(String(value)) ?? String(value)
        }
        overlay={
          <>
            {/* The field name titles the category labels it sits above. */}
            <text
              x={-9}
              y={-8}
              textAnchor="end"
              className="eda-row-field-title"
              aria-hidden="true"
            >
              {fieldLabel.length > titleChars
                ? `${fieldLabel.slice(0, titleChars - 1)}…`
                : fieldLabel}
            </text>
            <g pointerEvents="none">
              {displayCounts.map(({ key, count }) => (
                <text
                  key={key}
                  x={xScale(count) + 5}
                  y={yScale(key)! + yScale.bandwidth() / 2}
                  dominantBaseline="middle"
                  className="fill-foreground"
                  fontSize={11}
                  opacity={
                    valueFilter &&
                    !selectedItems.some((item) => item.key === key) &&
                    hovered !== key
                      ? 0.5
                      : 1
                  }
                >
                  {count.toLocaleString()}
                </text>
              ))}
            </g>
            {/* Labels select their row. The transparent rects catch clicks
                between letters, where SVG text has no hit area. */}
            <g>
              {displayCounts.map((item) =>
                item.other ? null : (
                  <rect
                    key={item.key}
                    x={-margin.left + 4}
                    y={yScale(item.key)! - (step - yScale.bandwidth()) / 2}
                    width={margin.left - 8}
                    height={step}
                    fill="transparent"
                    className="cursor-pointer"
                    aria-hidden="true"
                    onPointerEnter={() => setHovered(item.key)}
                    onPointerLeave={() => setHovered(null)}
                    onClick={() => handleBarClick(item.value)}
                  />
                )
              )}
            </g>
          </>
        }
      >
        <g className="select-none">
          {/* Every row's count before other charts' filters, behind each bar. */}
          {displayCounts.map((item) =>
            !facetIds && item.total > item.count && yScale.bandwidth() >= 1 ? (
              <rect
                key={`${item.key}:total`}
                x={0}
                y={yScale(item.key)}
                width={Math.max(0, xScale(item.total))}
                height={yScale.bandwidth()}
                rx={2}
                pointerEvents="none"
                aria-hidden="true"
                style={{
                  fill: item.other
                    ? "var(--muted-foreground)"
                    : getColorForValue(
                        settings.colorScaleId,
                        item.value,
                        "#3479a8"
                      ),
                  fillOpacity: "var(--eda-flow-context)",
                  opacity: valueFilter && !isSelected(item) ? 0.3 : 1,
                }}
              />
            ) : null
          )}
          {displayCounts.map((item) => {
            const { key, label, value, count, total, other } = item;
            const barHeight = yScale.bandwidth();
            if (barHeight < 1) {
              return null;
            }
            const isHovered = hovered === key;
            // One selected row is outlined; a larger selection reads from the dimming.
            const dimmed = Boolean(valueFilter) && !isSelected(item);
            const outlined =
              selectedItems.length === 1 &&
              selectedItems[0]!.key === key &&
              displayCounts.length > 1;

            return (
              <rect
                key={key}
                x={0}
                y={yScale(key)}
                width={Math.max(0, xScale(count))}
                rx={2}
                role={other ? undefined : "button"}
                tabIndex={other ? undefined : 0}
                aria-label={`${label}: ${count.toLocaleString()} rows${
                  !facetIds && total > count
                    ? ` of ${total.toLocaleString()}`
                    : ""
                }`}
                aria-pressed={other ? undefined : isSelected(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (!other) handleBarClick(value);
                  }
                }}
                onPointerEnter={() => setHovered(key)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(key)}
                onBlur={() => setHovered(null)}
                height={barHeight}
                className={`chart-mark eda-bar ${other ? "" : "cursor-pointer"}`}
                style={{
                  fill: other
                    ? "var(--muted-foreground)"
                    : getColorForValue(settings.colorScaleId, value, "#3479a8"),
                  fillOpacity: other ? 0.45 : undefined,
                  opacity: dimmed && !isHovered ? 0.3 : 1,
                  stroke:
                    outlined || isHovered ? "var(--foreground)" : undefined,
                  strokeWidth: outlined ? 2 : isHovered ? 1.5 : undefined,
                }}
                onClick={() => {
                  if (!other) handleBarClick(value);
                }}
              />
            );
          })}
        </g>
      </BaseChart>
      {hoveredItem && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          <span className="eda-readout-item">
            <span>{fieldLabel}</span>
            <b>{hoveredItem.label}</b>
          </span>
          <span className="eda-readout-item">
            <span>Rows</span>
            <b>
              {hoveredItem.count.toLocaleString()}
              {!facetIds && hoveredItem.total > hoveredItem.count
                ? ` of ${hoveredItem.total.toLocaleString()}`
                : ""}
            </b>
          </span>
          {liveRows > 0 && (
            <span className="eda-readout-item">
              <span>Share</span>
              <b>{pct(hoveredItem.count / liveRows)}</b>
            </span>
          )}
        </ChartReadout>
      )}
      <ChartStatusLine
        parts={statusParts}
        left={margin.left}
        right={margin.right}
      />
    </div>
  );
}
