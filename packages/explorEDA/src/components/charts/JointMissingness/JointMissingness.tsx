import { useId, useMemo, useState } from "react";
import { useThemeColors } from "@/hooks/useDisplayColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
import { ChartMessage, NO_MATCHING_ROWS } from "../ChartMessage";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
  STATUS_LINE_HEIGHT,
} from "../ChartStatusLine";
import {
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import { useGetLiveIds } from "../useGetLiveData";
import { patternSelection, type JointMissingnessSettings } from "./definition";
import type { JointMissingnessTrace } from "./JointMissingnessTraceBody";
import {
  MIN_MISSINGNESS_FIELDS,
  PATTERN_PAGE_SIZE,
  missingPatternLabel,
  patternKey,
  planPatterns,
  togglePattern,
  type MissingPattern,
} from "./jointMissingnessPlan";

export const sharePercent = (count: number, total: number) =>
  total
    ? (count / total).toLocaleString("en-US", {
        style: "percent",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    : "–";

export function JointMissingness({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<JointMissingnessSettings>) {
  const owner = useId();
  const api = useChartTraceApi();
  const revision = useTraceRevision(settings);
  const liveIds = useGetLiveIds(settings, facetIds);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const updateChart = useDataLayer((state) => state.updateChart);
  const nonce = useDataLayer((state) => state.nonce);
  const calculations = useDataLayer((state) => state.calculations);
  const themeColors = useThemeColors();
  const [page, setPage] = useState(0);

  const { fields } = settings;
  const unknown = useMemo(() => {
    void nonce;
    void calculations;
    const names = new Set(getColumnNames());
    return fields.filter((field) => !names.has(field));
  }, [fields, getColumnNames, nonce, calculations]);

  const plan = useMemo(() => {
    void nonce;
    const columns = Object.fromEntries(
      fields.map((field) => [field, getColumnData(field)])
    );
    return planPatterns({ ids: liveIds, fields, columns });
  }, [fields, liveIds, getColumnData, nonce]);

  const selection = patternSelection(settings);
  const selectedKeys = new Set(selection?.patterns.map(patternKey));
  const label = (missing: readonly string[]) =>
    missingPatternLabel(missing, getFieldLabel);

  const select = (pattern: MissingPattern, add: boolean) => {
    const patterns = togglePattern(
      selection?.patterns ?? [],
      pattern.missing,
      add
    );
    const filters = settings.filters.filter((filter) => filter !== selection);
    if (patterns.length)
      filters.push({ type: "missingness-pattern", field: "__ID", patterns });
    updateChart(settings.id, { filters });
  };

  const source = useMemo((): TraceSource => {
    const currentRevision = `${revision.split(":")[0]}:${fields.join(",")}:${plan.patterns
      .map((pattern) => `${pattern.key}=${pattern.ids.length}`)
      .join(";")}`;
    return {
      role: "chart",
      revision: currentRevision,
      resolve: (kind, id) => {
        if (kind !== "missingness-pattern") return;
        const pattern = plan.patterns.find((item) => item.key === id);
        if (!pattern) return;
        const trace: JointMissingnessTrace = {
          kind: "missingness-pattern",
          id,
          revision: currentRevision,
          owner,
          chartId: settings.id,
          label: label(pattern.missing),
          missing: pattern.missing,
          fields,
          ids: pattern.ids,
          total: plan.total,
        };
        return trace;
      },
      findRow: (id) => {
        const pattern = plan.patterns.find((item) => item.ids.includes(id));
        return pattern && { kind: "missingness-pattern", id: pattern.key };
      },
      targets: () =>
        plan.patterns.map((pattern) => ({
          kind: "missingness-pattern",
          id: pattern.key,
          label: label(pattern.missing),
        })),
    };
    // Labels read field settings, which the revision already tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision, plan, owner, settings.id, fields]);
  useTraceSource(owner, source);
  const inspect = (key: string) =>
    api?.inspect(owner, "missingness-pattern", key);

  const setupMessage =
    fields.length < MIN_MISSINGNESS_FIELDS
      ? `Choose at least ${MIN_MISSINGNESS_FIELDS} fields in chart settings.`
      : unknown.length
        ? `${unknown.map(getFieldLabel).join(", ")} ${unknown.length === 1 ? "is" : "are"} not in the data. Choose fields in chart settings.`
        : undefined;
  if (setupMessage || plan.total === 0) {
    return (
      <ChartMessage width={width} height={height}>
        {setupMessage ?? NO_MATCHING_ROWS}
      </ChartMessage>
    );
  }

  // Narrow charts give the dots and bars the room.
  const labelWidth = Math.max(96, Math.min(220, width * 0.3));
  const pages = Math.ceil(plan.patterns.length / PATTERN_PAGE_SIZE);
  const current = Math.min(page, pages - 1);
  const shown = plan.patterns.slice(
    current * PATTERN_PAGE_SIZE,
    (current + 1) * PATTERN_PAGE_SIZE
  );
  const maxRows = Math.max(1, ...plan.patterns.map((item) => item.ids.length));
  const maxField = Math.max(1, ...plan.fieldTotals);
  const selectedRows = plan.patterns
    .filter((pattern) => selectedKeys.has(pattern.key))
    .reduce((sum, pattern) => sum + pattern.ids.length, 0);
  // A kept pattern with no current rows still belongs to the selection.
  const zeroSelected =
    selection?.patterns.filter(
      (pattern) =>
        !plan.patterns.some((item) => item.key === patternKey(pattern))
    ) ?? [];
  const hiddenRows = plan.patterns
    .filter((_, index) => Math.floor(index / PATTERN_PAGE_SIZE) !== current)
    .reduce((sum, pattern) => sum + pattern.ids.length, 0);
  const statusParts = [
    selection &&
      `${selection.patterns.length} ${selection.patterns.length === 1 ? "pattern" : "patterns"} selected · ${selectedRows.toLocaleString()} of ${plan.total.toLocaleString()} rows (${sharePercent(selectedRows, plan.total)})`,
    zeroSelected.length > 0 &&
      `${zeroSelected.length} selected with no rows: ${zeroSelected.map(label).join("; ")}`,
  ];
  const statusHint =
    !selection &&
    !facetIds &&
    width >= STATUS_HINT_MIN_WIDTH &&
    "Click a pattern to select its rows · Shift-click to add";

  const rowAction = (pattern: MissingPattern) => ({
    onClick: (event: React.MouseEvent) => {
      event.stopPropagation();
      if (event.altKey) inspect(pattern.key);
      else select(pattern, event.shiftKey || event.metaKey || event.ctrlKey);
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      if (event.altKey) inspect(pattern.key);
      else select(pattern, true);
    },
  });

  return (
    <div
      className="eda-missingness relative flex flex-col"
      style={{ width, height }}
    >
      <div
        className="min-h-0 flex-1 overflow-auto px-3"
        style={{ marginBottom: STATUS_LINE_HEIGHT + 6 }}
      >
        <table className="eda-missingness-table">
          <thead>
            <tr>
              <th className="eda-missingness-caption" scope="row">
                Missing per field
              </th>
              {fields.map((field, index) => (
                <th key={field} className="eda-missingness-total">
                  <span className="tabular-nums">
                    {plan.fieldTotals[index]!.toLocaleString()}
                  </span>
                  <span
                    className="eda-missingness-total-bar"
                    style={{
                      height: Math.max(
                        2,
                        (plan.fieldTotals[index]! / maxField) * 32
                      ),
                      background: themeColors.mark,
                    }}
                    aria-hidden="true"
                  />
                </th>
              ))}
              <th colSpan={2} />
            </tr>
            <tr>
              <th className="eda-missingness-caption">Exact missing set</th>
              {fields.map((field) => (
                <th
                  key={field}
                  className="eda-missingness-field"
                  data-field={field}
                >
                  <span>{getFieldLabel(field)}</span>
                </th>
              ))}
              <th className="eda-missingness-caption">Rows</th>
              <th className="eda-missingness-caption text-right">Share</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((pattern) => {
              const selected = selectedKeys.has(pattern.key);
              const name = label(pattern.missing);
              const positions = pattern.missing.map((field) =>
                fields.indexOf(field)
              );
              const first = Math.min(...positions);
              const last = Math.max(...positions);
              return (
                <tr
                  key={pattern.key}
                  className="eda-missingness-row chart-mark"
                  data-selected={selected || undefined}
                  data-dimmed={(selection && !selected) || undefined}
                  data-pinned={pattern.key === "" || undefined}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  aria-label={`${name}: ${pattern.ids.length} rows, ${sharePercent(pattern.ids.length, plan.total)}`}
                  {...rowAction(pattern)}
                >
                  <td
                    className="eda-missingness-label"
                    title={name}
                    style={{ maxWidth: labelWidth }}
                  >
                    {name}
                  </td>
                  {fields.map((field, index) => {
                    const on = pattern.missing.includes(field);
                    const line =
                      positions.length > 1 && index >= first && index <= last;
                    return (
                      <td key={field} className="eda-missingness-dot">
                        {line && (
                          <span
                            className="eda-missingness-link"
                            data-start={index === first || undefined}
                            data-end={index === last || undefined}
                          />
                        )}
                        <i data-on={on || undefined} />
                      </td>
                    );
                  })}
                  <td className="eda-missingness-bar">
                    <span
                      style={{
                        width: `${(pattern.ids.length / maxRows) * 100}%`,
                        background: themeColors.mark,
                      }}
                    />
                    <b className="tabular-nums">
                      {pattern.ids.length.toLocaleString()}
                    </b>
                  </td>
                  <td className="eda-missingness-share tabular-nums">
                    {sharePercent(pattern.ids.length, plan.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {pages > 1 && (
          <div className="eda-missingness-pager">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </button>
            <span>
              Patterns {current * PATTERN_PAGE_SIZE + 1}–
              {current * PATTERN_PAGE_SIZE + shown.length} of{" "}
              {plan.patterns.length} · {hiddenRows.toLocaleString()} rows on
              other pages
            </span>
            <button
              type="button"
              disabled={current === pages - 1}
              onClick={() => setPage(current + 1)}
            >
              Next
            </button>
          </div>
        )}
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
