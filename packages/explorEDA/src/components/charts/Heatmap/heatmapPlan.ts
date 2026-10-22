import {
  aggregationLabel,
  isAdditiveAggregation,
  summarizeGroup,
  type AggregateContributor,
  type AggregateInputRow,
} from "@/lib/aggregates";
import { STATUS_LINE_HEIGHT } from "../ChartStatusLine";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import { applyFilter } from "@/hooks/applyFilter";
import type { datum } from "@/types/ChartTypes";
import type { DateRangeFilter, Filter, ValueFilter } from "@/types/FilterTypes";
import { utcPeriod } from "@/lib/dailyRollup";
import { dateBound } from "@/lib/valueParsing";
import { periodFilter } from "../LineChart/timeSeriesPlan";
import { heatFill, heatText, planHeatScale } from "../heatScale";
import type { HeatmapSettings } from "./definition";

export interface HeatmapSnapshot {
  revision: string;
  /** Every source row ID. Category ranking uses them so order holds while filtering. */
  allIds: number[];
  /** Rows after other filters. */
  liveIds: number[];
  rowData: Record<number, datum>;
  columnData: Record<number, datum>;
  measureData: Record<number, datum>;
}

export interface HeatmapCategory {
  key: string;
  value: datum;
  label: string;
  /** Rows with this value across all source rows. */
  total: number;
  /** Top-left position of its band in plot coordinates. */
  position: number;
}

/** Empty: no source rows. Invalid: rows, but none with a valid measure. */
export type HeatmapCellState = "value" | "empty" | "invalid";

export interface HeatmapCell {
  id: string;
  row: HeatmapCategory;
  column: HeatmapCategory;
  state: HeatmapCellState;
  value: number | undefined;
  valueText: string;
  rowCount: number;
  contributors: AggregateContributor[];
  x: number;
  y: number;
  width: number;
  height: number;
  /** Where the value sits on the color scale: 0 to 1, or -1 to 1 when diverging. */
  position: number;
  /** Part of the shown cells' total, for counts and sums of values at or above 0. */
  share: number | undefined;
  fill: string;
  textFill: string;
  /** True when this chart's selection includes the cell; undefined without one. */
  selected: boolean | undefined;
}

export interface HeatmapPlan {
  revision: string;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  plotWidth: number;
  plotHeight: number;
  cellWidth: number;
  cellHeight: number;
  rowField: string;
  columnField: string;
  rowFieldLabel: string;
  columnFieldLabel: string;
  rows: HeatmapCategory[];
  columns: HeatmapCategory[];
  /** Categories past the per-axis limit, which the chart leaves out. */
  omitted: { rows: number; columns: number; sourceRows: number };
  cells: HeatmapCell[];
  metricLabel: string;
  /** Names what a cell's share is a part of. */
  shareLabel: string;
  scale: {
    kind: "sequential" | "diverging";
    domain: [number, number];
    transform?: "sqrt";
    population: string;
  };
  hasEmpty: boolean;
  hasInvalid: boolean;
  showValues: boolean;
  rotateColumnLabels: boolean;
  /**
   * Label every this many columns, so rotated labels never overlap. Cells
   * keep their own names; a selected column always shows its label.
   */
  columnLabelEvery: number;
  /** The selected cell's row and column values, when exactly one cell is selected. */
  selection?: { row: datum; column: datum };
  /** Row and column values this chart's selection covers, by category key. */
  selectedKeys: {
    rows: Set<string> | undefined;
    columns: Set<string> | undefined;
  };
  scopeNote: string;
}

export interface HeatmapPlanInput {
  settings: HeatmapSettings;
  width: number;
  height: number;
  snapshot: HeatmapSnapshot;
  getFieldLabel: (field: string) => string;
  formatFieldValue?: (field: string, value: datum) => string;
  /** Whether a row or column field's values take its display format. */
  formatsCategory?: (field: string) => boolean;
}

export const LEGEND_HEIGHT = 30;
const LABEL_CHAR_WIDTH = 6.5;
const VALUE_FONT_SIZE = 11;
/** Room each rotated column label needs along the axis. */
const ROTATED_LABEL_SPACING = 16;

function rankCategories(
  ids: number[],
  data: Record<number, datum>,
  limit: number,
  sortBy: HeatmapSettings["sortBy"],
  format: (value: datum) => string
) {
  const counts = new Map<
    string,
    { value: datum; total: number; first: number }
  >();
  for (const id of ids) {
    const value = categoryValue(data[id]);
    const key = categoryKey(value);
    const item = counts.get(key);
    if (item) {
      item.total += 1;
    } else {
      counts.set(key, { value, total: 1, first: counts.size });
    }
  }
  const ranked = [...counts]
    .map(([key, item]) => ({ key, ...item, label: format(item.value) }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  const shown = ranked.slice(0, Math.max(1, limit));
  if (sortBy === "data") shown.sort((a, b) => a.first - b.first);
  if (sortBy === "label") {
    shown.sort((a, b) =>
      typeof a.value === "number" && typeof b.value === "number"
        ? a.value - b.value
        : a.label.localeCompare(b.label, undefined, { numeric: true })
    );
  }
  return { shown, omitted: ranked.slice(shown.length) };
}

type ColumnInterval = NonNullable<HeatmapSettings["columnInterval"]>;

/** The UTC period a date value falls in, or undefined for an unreadable date. */
export function heatmapPeriod(value: datum, interval: ColumnInterval) {
  const text =
    typeof value === "number" && Number.isFinite(value)
      ? new Date(value).toISOString()
      : value;
  return utcPeriod(text, interval);
}

/** A period's column label: 2019, 2019-02, or 2019-02-11. */
function periodLabel(start: number, interval: ColumnInterval) {
  const day = new Date(start).toISOString().slice(0, 10);
  return interval === "year"
    ? day.slice(0, 4)
    : interval === "month"
      ? day.slice(0, 7)
      : day;
}

/**
 * Every period from the first dated row to the last, so a period with no
 * rows still has its column. Past the limit, the latest periods show.
 */
function rankPeriods(
  ids: number[],
  data: Record<number, datum>,
  limit: number,
  interval: ColumnInterval
) {
  const totals = new Map<number, number>();
  for (const id of ids) {
    const period = heatmapPeriod(data[id], interval);
    if (period) totals.set(period.start, (totals.get(period.start) ?? 0) + 1);
  }
  const starts = [...totals.keys()];
  const periods: {
    key: string;
    value: number;
    label: string;
    total: number;
  }[] = [];
  if (starts.length) {
    const last = Math.max(...starts);
    let start = Math.min(...starts);
    // A guard for a stray far-off date: never build more than 10,000 columns.
    while (start <= last && periods.length < 10_000) {
      periods.push({
        key: categoryKey(start),
        value: start,
        label: periodLabel(start, interval),
        total: totals.get(start) ?? 0,
      });
      start = heatmapPeriod(
        new Date(start).toISOString().slice(0, 10),
        interval
      )!.end;
    }
  }
  const keep = Math.max(1, limit);
  return {
    shown: periods.slice(-keep),
    omitted: periods.slice(0, Math.max(0, periods.length - keep)),
  };
}

export function planHeatmap({
  settings,
  width,
  height,
  snapshot,
  getFieldLabel,
  formatFieldValue,
  formatsCategory,
}: HeatmapPlanInput): HeatmapPlan {
  const rowField = settings.field;
  const columnField = settings.columnField;
  const measureField =
    settings.aggregation === "count" ? undefined : settings.measureField;
  // A category prints as itself, so a year reads 1928, unless its field
  // has a display format of its own.
  const label = (field: string) => (value: datum) =>
    value == null
      ? categoryLabel(value)
      : formatFieldValue &&
          typeof value !== "string" &&
          (!formatsCategory || formatsCategory(field))
        ? formatFieldValue(field, value)
        : categoryLabel(value);
  const rowRank = rankCategories(
    snapshot.allIds,
    snapshot.rowData,
    settings.maxCategories,
    settings.sortBy,
    label(rowField)
  );
  const interval = settings.columnInterval;
  const columnLimit = settings.maxColumns ?? settings.maxCategories;
  const columnRank = interval
    ? rankPeriods(snapshot.allIds, snapshot.columnData, columnLimit, interval)
    : rankCategories(
        snapshot.allIds,
        snapshot.columnData,
        columnLimit,
        settings.columnSortBy ?? settings.sortBy,
        label(columnField)
      );
  // A binned column is the period its date falls in; an unreadable date
  // has no column.
  const columnKeyOf = (id: number) => {
    if (!interval) return categoryKey(categoryValue(snapshot.columnData[id]));
    const period = heatmapPeriod(snapshot.columnData[id], interval);
    return period ? categoryKey(period.start) : undefined;
  };
  const omittedRowKeys = new Set(rowRank.omitted.map((item) => item.key));
  const omittedColumnKeys = new Set(columnRank.omitted.map((item) => item.key));

  // Group live rows into shown cells.
  const groups = new Map<string, AggregateInputRow[]>();
  let omittedSourceRows = 0;
  for (const id of snapshot.liveIds) {
    const rowKey = categoryKey(categoryValue(snapshot.rowData[id]));
    const columnKey = columnKeyOf(id);
    if (
      columnKey === undefined ||
      omittedRowKeys.has(rowKey) ||
      omittedColumnKeys.has(columnKey)
    ) {
      omittedSourceRows += 1;
      continue;
    }
    const key = `${rowKey}|${columnKey}`;
    const input: AggregateInputRow = { __ID: id };
    if (measureField) {
      input[measureField] = snapshot.measureData[id];
    }
    const group = groups.get(key);
    if (group) {
      group.push(input);
    } else {
      groups.set(key, [input]);
    }
  }

  // Layout: row labels on the left under their field name, legend above,
  // column labels and their field name below.
  const rowLabelWidth = Math.min(
    width * 0.4,
    Math.max(
      4,
      getFieldLabel(rowField).length,
      ...rowRank.shown.map((item) => item.label.length)
    ) *
      LABEL_CHAR_WIDTH +
      12
  );
  const left = settings.margin.left + rowLabelWidth;
  const right = settings.margin.right;
  const plotWidth = Math.max(0, width - left - right);
  const naturalColumnWidth = plotWidth / Math.max(1, columnRank.shown.length);
  const longestColumnLabel =
    Math.max(1, ...columnRank.shown.map((item) => item.label.length)) *
    LABEL_CHAR_WIDTH;
  const rotateColumnLabels = longestColumnLabel > naturalColumnWidth - 4;
  const columnLabelHeight = rotateColumnLabels
    ? Math.min(110, longestColumnLabel * 0.71 + 18)
    : 22;
  const top = settings.margin.top + LEGEND_HEIGHT;
  const bottom =
    settings.margin.bottom + columnLabelHeight + 16 + STATUS_LINE_HEIGHT;
  const plotHeight = Math.max(0, height - top - bottom);
  const cellWidth = naturalColumnWidth;
  const cellHeight = plotHeight / Math.max(1, rowRank.shown.length);

  const rows = rowRank.shown.map((item, index) => ({
    key: item.key,
    value: item.value,
    label: item.label,
    total: item.total,
    position: index * cellHeight,
  }));
  const columns = columnRank.shown.map((item, index) => ({
    key: item.key,
    value: item.value,
    label: item.label,
    total: item.total,
    position: index * cellWidth,
  }));

  const summaries = new Map(
    [...groups].map(([key, group]) => [
      key,
      summarizeGroup(group, {
        aggregation: settings.aggregation,
        measureField,
      }),
    ])
  );
  const values = [...summaries.values()].flatMap((summary) =>
    typeof summary.value === "number" && Number.isFinite(summary.value)
      ? [summary.value]
      : []
  );
  const scale = planHeatScale(values, settings.colorDomain);
  const total = values.reduce((sum, value) => sum + value, 0);
  const additive =
    isAdditiveAggregation(settings.aggregation) &&
    scale.domain[0] >= 0 &&
    total > 0;

  const rowFilter = settings.filters.find(
    (filter): filter is ValueFilter =>
      filter.type === "value" && filter.field === rowField
  );
  // A binned column selects by a date range; it covers the periods it spans.
  const columnFilter: ValueFilter | undefined = interval
    ? periodSelection(settings, columnRank.shown)
    : settings.filters.find(
        (filter): filter is ValueFilter =>
          filter.type === "value" && filter.field === columnField
      );
  const hasSelection = Boolean(rowFilter || columnFilter);
  const format = (value: number) =>
    measureField && formatFieldValue
      ? formatFieldValue(measureField, value)
      : value.toLocaleString("en-US", { maximumFractionDigits: 3 });

  const cells: HeatmapCell[] = [];
  for (const row of rows) {
    for (const column of columns) {
      const summary = summaries.get(`${row.key}|${column.key}`);
      const state: HeatmapCellState = !summary
        ? "empty"
        : typeof summary.value === "number" && Number.isFinite(summary.value)
          ? "value"
          : "invalid";
      const position = state === "value" ? scale.position(summary!.value!) : 0;
      const fill =
        state === "value" ? heatFill(position, scale.kind) : "transparent";
      cells.push({
        id: `cell:${row.key}|${column.key}`,
        row,
        column,
        state,
        value: summary?.value,
        valueText:
          state === "value"
            ? format(summary!.value!)
            : state === "empty"
              ? "No rows"
              : "No valid values",
        rowCount: summary?.rowCount ?? 0,
        contributors: summary?.contributors ?? [],
        x: column.position,
        y: row.position,
        width: cellWidth,
        height: cellHeight,
        position,
        share:
          additive && state === "value" ? summary!.value! / total : undefined,
        fill,
        textFill: state === "value" ? heatText(position) : "currentColor",
        selected: hasSelection
          ? (!rowFilter || applyFilter(row.value, rowFilter)) &&
            (!columnFilter || applyFilter(column.value, columnFilter))
          : undefined,
      });
    }
  }

  const metricLabel =
    settings.aggregation === "count"
      ? "Row count"
      : `${aggregationLabel(settings.aggregation)} of ${getFieldLabel(measureField ?? "")}`;
  const longestValue = Math.max(
    0,
    ...cells.map((cell) => (cell.state === "value" ? cell.valueText.length : 0))
  );
  const fits =
    cellHeight >= VALUE_FONT_SIZE + 4 &&
    cellWidth >= longestValue * LABEL_CHAR_WIDTH + 6;

  return {
    revision: snapshot.revision,
    width,
    height,
    margin: { top, right, bottom, left },
    plotWidth,
    plotHeight,
    cellWidth,
    cellHeight,
    rowField,
    columnField,
    rowFieldLabel: getFieldLabel(rowField),
    columnFieldLabel: getFieldLabel(columnField),
    rows,
    columns,
    omitted: {
      rows: rowRank.omitted.length,
      columns: columnRank.omitted.length,
      sourceRows: omittedSourceRows,
    },
    cells,
    metricLabel,
    shareLabel:
      rowRank.omitted.length || columnRank.omitted.length
        ? "Share of shown"
        : "Share of total",
    scale: {
      kind: scale.kind,
      domain: scale.domain,
      transform: scale.transform,
      population:
        scale.fixed.min && scale.fixed.max
          ? "fixed ends from the chart's settings"
          : scale.fixed.min || scale.fixed.max
            ? "shown cells after other filters, with a fixed end"
            : "shown cells after other filters",
    },
    hasEmpty: cells.some((cell) => cell.state === "empty"),
    hasInvalid: cells.some((cell) => cell.state === "invalid"),
    showValues: settings.showValues && fits,
    rotateColumnLabels,
    columnLabelEvery: rotateColumnLabels
      ? Math.max(1, Math.ceil(ROTATED_LABEL_SPACING / Math.max(1, cellWidth)))
      : 1,
    selection:
      rowFilter?.values.length === 1 && columnFilter?.values.length === 1
        ? { row: rowFilter.values[0], column: columnFilter.values[0] }
        : undefined,
    selectedKeys: {
      rows: rowFilter
        ? new Set(
            rowFilter.values.map((value) => categoryKey(categoryValue(value)))
          )
        : undefined,
      columns: columnFilter
        ? new Set(
            columnFilter.values.map((value) =>
              categoryKey(categoryValue(value))
            )
          )
        : undefined,
    },
    scopeNote:
      "Rows after other filters; this chart's selected cell is outlined",
  };
}

/** The settings change that selects one cell, or clears it when it is already selected. */
export function toggleCellFilters(
  settings: HeatmapSettings,
  plan: HeatmapPlan,
  cell: HeatmapCell
) {
  const rest = ownFiltersRemoved(settings);
  const current = plan.selection;
  const same =
    current &&
    categoryKey(categoryValue(current.row)) === cell.row.key &&
    categoryKey(categoryValue(current.column)) === cell.column.key;
  if (same) {
    return rest;
  }
  return [
    ...rest,
    { type: "value" as const, field: settings.field, values: [cell.row.value] },
    columnFilterFor(settings, cell.column),
  ];
}

/**
 * The settings change that selects a whole row or column, or clears it when
 * it is already the whole selection.
 */
export function toggleAxisFilters(
  settings: HeatmapSettings,
  plan: HeatmapPlan,
  axis: "row" | "column",
  category: HeatmapCategory
) {
  const field = axis === "row" ? settings.field : settings.columnField;
  const rest = ownFiltersRemoved(settings);
  const own =
    axis === "row" ? plan.selectedKeys.rows : plan.selectedKeys.columns;
  const other =
    axis === "row" ? plan.selectedKeys.columns : plan.selectedKeys.rows;
  const same = !other && own?.size === 1 && own.has(category.key);
  if (same) {
    return rest;
  }
  return [
    ...rest,
    axis === "column"
      ? columnFilterFor(settings, category)
      : { type: "value" as const, field, values: [category.value] },
  ];
}

/** This chart's filters without its own row and column selection. */
function ownFiltersRemoved(settings: HeatmapSettings) {
  return settings.filters.filter(
    (filter) =>
      !(
        (filter.type === "value" &&
          (filter.field === settings.field ||
            filter.field === settings.columnField)) ||
        (filter.type === "date-range" &&
          settings.columnInterval &&
          filter.field === settings.columnField)
      )
  );
}

/** Selects one column: its value, or its period's dates when binned. */
function columnFilterFor(
  settings: HeatmapSettings,
  column: HeatmapCategory
): Filter {
  if (!settings.columnInterval || typeof column.value !== "number")
    return {
      type: "value",
      field: settings.columnField,
      values: [column.value],
    };
  const period = heatmapPeriod(column.value, settings.columnInterval)!;
  return periodFilter(settings.columnField, period.start, period.end);
}

/**
 * A binned column's date-range selection, read back as the period starts it
 * covers, so cells and labels mark it like a value selection.
 */
function periodSelection(
  settings: HeatmapSettings,
  columns: { value: datum }[]
): ValueFilter | undefined {
  const range = settings.filters.find(
    (filter): filter is DateRangeFilter =>
      filter.type === "date-range" && filter.field === settings.columnField
  );
  if (!range) return undefined;
  const min = range.min ? dateBound(range.min) : -Infinity;
  const max = range.max ? dateBound(range.max) : Infinity;
  return {
    type: "value",
    field: settings.columnField,
    values: columns
      .map((column) => column.value as number)
      .filter((start) => start >= min && start <= max),
  };
}
