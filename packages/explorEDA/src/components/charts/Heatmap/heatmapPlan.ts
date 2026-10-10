import {
  summarizeGroup,
  type AggregateContributor,
  type AggregateInputRow,
} from "@/lib/aggregates";
import { STATUS_LINE_HEIGHT } from "../ChartStatusLine";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import { applyFilter } from "@/hooks/applyFilter";
import type { datum } from "@/types/ChartTypes";
import type { ValueFilter } from "@/types/FilterTypes";
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
    population: string;
  };
  hasEmpty: boolean;
  hasInvalid: boolean;
  showValues: boolean;
  rotateColumnLabels: boolean;
  /** The selected cell's row and column values, when exactly one cell is selected. */
  selection?: { row: datum; column: datum };
  /** Row and column values this chart's selection covers, by category key. */
  selectedKeys: { rows: Set<string> | undefined; columns: Set<string> | undefined };
  scopeNote: string;
}

export interface HeatmapPlanInput {
  settings: HeatmapSettings;
  width: number;
  height: number;
  snapshot: HeatmapSnapshot;
  getFieldLabel: (field: string) => string;
  formatFieldValue?: (field: string, value: datum) => string;
}

export const LEGEND_HEIGHT = 30;
const LABEL_CHAR_WIDTH = 6.5;
const VALUE_FONT_SIZE = 11;

function rankCategories(
  ids: number[],
  data: Record<number, datum>,
  limit: number,
  sortBy: HeatmapSettings["sortBy"],
  format: (value: datum) => string
) {
  const counts = new Map<string, { value: datum; total: number }>();
  for (const id of ids) {
    const value = categoryValue(data[id]);
    const key = categoryKey(value);
    const item = counts.get(key);
    if (item) {item.total += 1;}
    else {counts.set(key, { value, total: 1 });}
  }
  const ranked = [...counts]
    .map(([key, item]) => ({ key, ...item, label: format(item.value) }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  const shown = ranked.slice(0, Math.max(1, limit));
  if (sortBy === "label") {
    shown.sort((a, b) =>
      typeof a.value === "number" && typeof b.value === "number"
        ? a.value - b.value
        : a.label.localeCompare(b.label, undefined, { numeric: true })
    );
  }
  return { shown, omitted: ranked.slice(shown.length) };
}

export function planHeatmap({
  settings,
  width,
  height,
  snapshot,
  getFieldLabel,
  formatFieldValue,
}: HeatmapPlanInput): HeatmapPlan {
  const rowField = settings.field;
  const columnField = settings.columnField;
  const measureField =
    settings.aggregation === "count" ? undefined : settings.measureField;
  const label = (field: string) => (value: datum) =>
    value == null
      ? categoryLabel(value)
      : formatFieldValue && typeof value !== "string"
        ? formatFieldValue(field, value)
        : categoryLabel(value);
  const rowRank = rankCategories(
    snapshot.allIds,
    snapshot.rowData,
    settings.maxCategories,
    settings.sortBy,
    label(rowField)
  );
  const columnRank = rankCategories(
    snapshot.allIds,
    snapshot.columnData,
    settings.maxCategories,
    settings.sortBy,
    label(columnField)
  );
  const omittedRowKeys = new Set(rowRank.omitted.map((item) => item.key));
  const omittedColumnKeys = new Set(
    columnRank.omitted.map((item) => item.key)
  );

  // Group live rows into shown cells.
  const groups = new Map<string, AggregateInputRow[]>();
  let omittedSourceRows = 0;
  for (const id of snapshot.liveIds) {
    const rowKey = categoryKey(categoryValue(snapshot.rowData[id]));
    const columnKey = categoryKey(categoryValue(snapshot.columnData[id]));
    if (omittedRowKeys.has(rowKey) || omittedColumnKeys.has(columnKey)) {
      omittedSourceRows += 1;
      continue;
    }
    const key = `${rowKey}|${columnKey}`;
    const input: AggregateInputRow = { __ID: id };
    if (measureField) {input[measureField] = snapshot.measureData[id];}
    const group = groups.get(key);
    if (group) {group.push(input);}
    else {groups.set(key, [input]);}
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
      summarizeGroup(group, { aggregation: settings.aggregation, measureField }),
    ])
  );
  const values = [...summaries.values()].flatMap((summary) =>
    typeof summary.value === "number" && Number.isFinite(summary.value)
      ? [summary.value]
      : []
  );
  const scale = planHeatScale(values);
  const total = values.reduce((sum, value) => sum + value, 0);
  const additive =
    settings.aggregation !== "average" && scale.domain[0] >= 0 && total > 0;

  const rowFilter = settings.filters.find(
    (filter): filter is ValueFilter =>
      filter.type === "value" && filter.field === rowField
  );
  const columnFilter = settings.filters.find(
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
        share: additive && state === "value" ? summary!.value! / total : undefined,
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
      : `${settings.aggregation === "sum" ? "Sum" : "Average"} of ${getFieldLabel(measureField ?? "")}`;
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
      population: "shown cells after other filters",
    },
    hasEmpty: cells.some((cell) => cell.state === "empty"),
    hasInvalid: cells.some((cell) => cell.state === "invalid"),
    showValues: settings.showValues && fits,
    rotateColumnLabels,
    selection:
      rowFilter?.values.length === 1 && columnFilter?.values.length === 1
        ? { row: rowFilter.values[0], column: columnFilter.values[0] }
        : undefined,
    selectedKeys: {
      rows: rowFilter
        ? new Set(rowFilter.values.map((value) => categoryKey(categoryValue(value))))
        : undefined,
      columns: columnFilter
        ? new Set(columnFilter.values.map((value) => categoryKey(categoryValue(value))))
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
  const rest = settings.filters.filter(
    (filter) =>
      filter.type !== "value" ||
      (filter.field !== settings.field && filter.field !== settings.columnField)
  );
  const current = plan.selection;
  const same =
    current &&
    categoryKey(categoryValue(current.row)) === cell.row.key &&
    categoryKey(categoryValue(current.column)) === cell.column.key;
  if (same) {return rest;}
  return [
    ...rest,
    { type: "value" as const, field: settings.field, values: [cell.row.value] },
    {
      type: "value" as const,
      field: settings.columnField,
      values: [cell.column.value],
    },
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
  const rest = settings.filters.filter(
    (filter) =>
      filter.type !== "value" ||
      (filter.field !== settings.field && filter.field !== settings.columnField)
  );
  const own = axis === "row" ? plan.selectedKeys.rows : plan.selectedKeys.columns;
  const other = axis === "row" ? plan.selectedKeys.columns : plan.selectedKeys.rows;
  const same = !other && own?.size === 1 && own.has(category.key);
  if (same) {return rest;}
  return [...rest, { type: "value" as const, field, values: [category.value] }];
}
