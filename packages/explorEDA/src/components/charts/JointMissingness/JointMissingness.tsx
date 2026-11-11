import { useId, useMemo, useState, type CSSProperties } from "react";
import { useThemeColors } from "@/hooks/useDisplayColorScales";
import { useNotebookKeep } from "@/components/notebook/NotebookKeep";
import { Button } from "@/components/ui/button";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { SavedChartSettings } from "@/types/SavedDataTypes";
import type { BaseChartProps } from "@/types/ChartTypes";
import { ChartMessage, NO_MATCHING_ROWS } from "../ChartMessage";
import { ChartReadout } from "../ChartReadout";
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
import {
  inputSelection,
  patternSelection,
  type JointMissingnessSettings,
} from "./definition";
import type { JointMissingnessTrace } from "./JointMissingnessTraceBody";
import {
  MIN_MISSINGNESS_FIELDS,
  PATTERN_PAGE_SIZE,
  countByGroup,
  inputTest,
  planGroups,
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
  const [hovered, setHovered] = useState<string | null>(null);

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
    return planPatterns({ ids: liveIds, fields, columns, sort: settings.sort });
  }, [fields, liveIds, getColumnData, nonce, settings.sort]);

  // Each group's share divides by that group's own rows in scope.
  const { groupField } = settings;
  const groups = useMemo(() => {
    void nonce;
    return groupField
      ? planGroups(liveIds, getColumnData(groupField))
      : undefined;
  }, [groupField, liveIds, getColumnData, nonce]);

  const selection = patternSelection(settings);
  const inputs = inputSelection(settings);
  const selectedKeys = new Set(selection?.patterns.map(patternKey));

  // Rows a later step can use: present, or also finite numbers.
  const rule = settings.eligibility;
  const usable = useMemo(() => {
    void nonce;
    if (!rule?.fields.length) return undefined;
    const columns = Object.fromEntries(
      rule.fields.map((field) => [field, getColumnData(field)])
    );
    const present = inputTest({ ...rule, requirement: "present" }, columns);
    const admitted = inputTest(rule, columns);
    return {
      present: liveIds.filter(present).length,
      admitted: liveIds.filter(admitted).length,
    };
  }, [rule, liveIds, getColumnData, nonce]);
  const selectInputs = (side: "admitted" | "excluded") => {
    const filters = settings.filters.filter(
      (filter) => filter !== selection && filter !== inputs
    );
    // Clicking the selected side again clears it.
    if (inputs?.side !== side)
      filters.push({ type: "missingness-inputs", field: "__ID", side });
    updateChart(settings.id, { filters });
  };
  // In a notebook, Keep and Reset show only while the live selection
  // differs from the one the text saves.
  const notebook = useNotebookKeep();
  const kept =
    notebook && patternSelection({ filters: notebook.kept(settings.id) });
  const keptInputs =
    notebook && inputSelection({ filters: notebook.kept(settings.id) });
  const meaning = (
    patterns: typeof selection,
    rows: typeof inputs | null | undefined
  ) =>
    patterns ? patterns.patterns.map(patternKey).sort().join("|") : rows?.side;
  const unkept =
    Boolean(notebook) &&
    meaning(selection, inputs) !== meaning(kept ?? undefined, keptInputs);
  const resetToKept = () =>
    updateChart(settings.id, {
      filters: [
        ...settings.filters.filter(
          (filter) => filter !== selection && filter !== inputs
        ),
        ...(kept ? [kept] : []),
        ...(keptInputs ? [keptInputs] : []),
      ],
    });
  const label = (missing: readonly string[]) =>
    missingPatternLabel(missing, getFieldLabel);

  const select = (pattern: MissingPattern, add: boolean) => {
    const patterns = togglePattern(
      selection?.patterns ?? [],
      pattern.missing,
      add
    );
    // A pattern selection replaces an input selection.
    const filters = settings.filters.filter(
      (filter) => filter !== selection && filter !== inputs
    );
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
  // A field header selects every pattern that misses it: the rows missing
  // that field, as a union of exact patterns.
  const fieldPatterns = (field: string) =>
    plan.patterns
      .filter((pattern) => pattern.missing.includes(field))
      .map((pattern) => pattern.missing);
  const fieldSelected = (field: string) => {
    const keys = fieldPatterns(field).map(patternKey);
    return (
      keys.length > 0 &&
      keys.length === selectedKeys.size &&
      keys.every((key) => selectedKeys.has(key))
    );
  };
  const selectField = (field: string, add: boolean) => {
    const own = fieldPatterns(field);
    const keys = new Set(own.map(patternKey));
    const patterns = fieldSelected(field)
      ? []
      : add
        ? [
            ...(selection?.patterns ?? []).filter(
              (pattern) => !keys.has(patternKey(pattern))
            ),
            ...own.map((missing) => [...missing].sort()),
          ]
        : own.map((missing) => [...missing].sort());
    const filters = settings.filters.filter(
      (filter) => filter !== selection && filter !== inputs
    );
    if (patterns.length)
      filters.push({ type: "missingness-pattern", field: "__ID", patterns });
    updateChart(settings.id, { filters });
  };
  const setSort = (sort: "rows" | "fields") =>
    updateChart(settings.id, {
      sort: sort === "rows" ? undefined : "fields",
    });

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

  const pages = Math.ceil(plan.patterns.length / PATTERN_PAGE_SIZE);
  const current = Math.min(page, pages - 1);
  const shown = plan.patterns.slice(
    current * PATTERN_PAGE_SIZE,
    (current + 1) * PATTERN_PAGE_SIZE
  );
  const maxRows = Math.max(1, ...plan.patterns.map((item) => item.ids.length));
  const maxField = Math.max(1, ...plan.fieldTotals);
  // Field names stand on one baseline, as tall as the longest needs.
  const nameHeight = Math.min(
    88,
    Math.max(
      36,
      ...fields.map((field) => Math.ceil(getFieldLabel(field).length * 6.2) + 2)
    )
  );
  const complete = plan.patterns[0]!.ids.length;
  const commonGap = plan.patterns
    .slice(1)
    .reduce<
      MissingPattern | undefined
    >((best, pattern) => (!best || pattern.ids.length > best.ids.length ? pattern : best), undefined);
  const hoveredPattern = plan.patterns.find((item) => item.key === hovered);
  const hoveredIndex = hovered?.startsWith("field:")
    ? fields.indexOf(hovered.slice(6))
    : -1;
  const hoveredField =
    hoveredIndex >= 0
      ? { field: fields[hoveredIndex]!, total: plan.fieldTotals[hoveredIndex]! }
      : undefined;
  const selectedRows = plan.patterns
    .filter((pattern) => selectedKeys.has(pattern.key))
    .reduce((sum, pattern) => sum + pattern.ids.length, 0);
  // A kept pattern with no current rows still belongs to the selection.
  const zeroSelected =
    selection?.patterns.filter(
      (pattern) =>
        !plan.patterns.some((item) => item.key === patternKey(pattern))
    ) ?? [];
  const selectedByGroup =
    groups &&
    selection &&
    countByGroup(
      plan.patterns
        .filter((pattern) => selectedKeys.has(pattern.key))
        .flatMap((pattern) => pattern.ids),
      groups
    );
  const groupShares = groups?.columns
    .filter((column) => column.total > 0)
    .map((column) => ({
      column,
      share: (selectedByGroup?.get(column.key) ?? 0) / column.total,
    }));
  const highest = groupShares?.reduce(
    (a, b) => (b.share > a.share ? b : a),
    groupShares[0]!
  );
  const lowest = groupShares?.reduce(
    (a, b) => (b.share < a.share ? b : a),
    groupShares[0]!
  );
  const gapText =
    selectedByGroup &&
    highest &&
    lowest &&
    highest !== lowest &&
    `${highest.column.label} − ${lowest.column.label}: ${((highest.share - lowest.share) * 100).toFixed(1)} points`;
  const groupCell = (count: number, total: number) => {
    const share = total ? count / total : 0;
    return (
      <span
        style={{
          background: `color-mix(in srgb, ${themeColors.mark} ${Math.round(Math.min(1, share * 1.6) * 100)}%, transparent)`,
          color: share > 0.35 ? "white" : undefined,
        }}
      >
        {sharePercent(count, total)}
      </span>
    );
  };
  const hiddenRows = plan.patterns
    .filter((_, index) => Math.floor(index / PATTERN_PAGE_SIZE) !== current)
    .reduce((sum, pattern) => sum + pattern.ids.length, 0);
  const statusParts = [
    inputs &&
      usable &&
      `${inputs.side === "admitted" ? "Usable" : "Excluded"} rows selected · ${(inputs.side === "admitted" ? usable.admitted : plan.total - usable.admitted).toLocaleString()} of ${plan.total.toLocaleString()}`,
    selection &&
      `${selection.patterns.length} ${selection.patterns.length === 1 ? "pattern" : "patterns"} selected · ${selectedRows.toLocaleString()} of ${plan.total.toLocaleString()} rows (${sharePercent(selectedRows, plan.total)})`,
    gapText,
    zeroSelected.length > 0 &&
      `${zeroSelected.length} selected with no rows: ${zeroSelected.map(label).join("; ")}`,
  ];
  const statusHint =
    !selection &&
    !inputs &&
    !facetIds &&
    width >= STATUS_HINT_MIN_WIDTH &&
    "Click a pattern to select its rows · Shift-click to add";

  const rowAction = (pattern: MissingPattern) => ({
    onClick: (event: React.MouseEvent) => {
      event.stopPropagation();
      if (event.altKey) inspect(pattern.key);
      else select(pattern, event.shiftKey || event.metaKey || event.ctrlKey);
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const row = event.currentTarget;
        const next =
          event.key === "ArrowDown"
            ? row.nextElementSibling
            : row.previousElementSibling;
        (next as HTMLElement | null)?.focus();
        return;
      }
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      if (event.altKey) inspect(pattern.key);
      else select(pattern, true);
    },
  });

  return (
    <div
      className="eda-missingness relative flex flex-col"
      style={
        {
          width,
          height,
          // Pattern dots take a deeper shade of the bar color, not black.
          "--eda-missingness-on": `color-mix(in oklab, ${themeColors.mark} 72%, var(--foreground))`,
        } as CSSProperties
      }
    >
      {unkept && (
        <div className="eda-missingness-keep" data-export="omit">
          <span className="eda-missingness-unkept">Unkept changes</span>
          <Button
            size="sm"
            variant="outline"
            tooltip="Put back the selection the notebook's text saves."
            onClick={resetToKept}
          >
            Reset to kept
          </Button>
          <Button
            size="sm"
            tooltip="Write this selection into the notebook's text, so it reopens with the same patterns."
            onClick={() => notebook!.keep(settings as SavedChartSettings)}
          >
            Keep selection
          </Button>
        </div>
      )}
      {usable && rule && (
        <div className="eda-missingness-inputs">
          <span className="min-w-0 truncate">
            Inputs: {rule.fields.map(getFieldLabel).join(", ")} ·{" "}
            {rule.requirement === "finite" ? "finite numbers" : "have values"}
          </span>
          <button
            type="button"
            aria-pressed={inputs?.side === "admitted"}
            onClick={() => selectInputs("admitted")}
          >
            Usable{" "}
            <b className="tabular-nums">{usable.admitted.toLocaleString()}</b> (
            {sharePercent(usable.admitted, plan.total)})
          </button>
          <button
            type="button"
            aria-pressed={inputs?.side === "excluded"}
            onClick={() => selectInputs("excluded")}
          >
            Excluded{" "}
            <b className="tabular-nums">
              {(plan.total - usable.admitted).toLocaleString()}
            </b>
          </button>
          {usable.present > usable.admitted && (
            <span className="text-muted-foreground">
              {(usable.present - usable.admitted).toLocaleString()} have values
              that are not numbers
            </span>
          )}
        </div>
      )}
      <div className="eda-missingness-summary">
        <span>
          Complete rows{" "}
          <b className="tabular-nums">{complete.toLocaleString()}</b> of{" "}
          {plan.total.toLocaleString()} ({sharePercent(complete, plan.total)})
          {commonGap && (
            <>
              {" · "}most common gap {label(commonGap.missing)},{" "}
              <b className="tabular-nums">
                {commonGap.ids.length.toLocaleString()}
              </b>{" "}
              rows
            </>
          )}
        </span>
        <span
          className="eda-missingness-sort"
          role="group"
          aria-label="Sort patterns"
        >
          {(
            [
              ["rows", "Most rows"],
              ["fields", "Fewest missing"],
            ] as const
          ).map(([value, text]) => (
            <button
              key={value}
              type="button"
              aria-pressed={(settings.sort ?? "rows") === value}
              onClick={() => setSort(value)}
            >
              {text}
            </button>
          ))}
        </span>
      </div>
      {hoveredPattern && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          <span className="eda-readout-item">
            <span>Missing</span>
            <b>
              {hoveredPattern.missing.length
                ? label(hoveredPattern.missing)
                : "Nothing"}
            </b>
          </span>
          <span className="eda-readout-item">
            <span>Rows</span>
            <b>
              {hoveredPattern.ids.length.toLocaleString()} (
              {sharePercent(hoveredPattern.ids.length, plan.total)})
            </b>
          </span>
        </ChartReadout>
      )}
      {hoveredField && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          <span className="eda-readout-item">
            <span>{getFieldLabel(hoveredField.field)}</span>
            <b>
              {hoveredField.total.toLocaleString()} missing (
              {sharePercent(hoveredField.total, plan.total)})
            </b>
          </span>
          <span className="eda-readout-item">
            <span>Click</span>
            <b>select every pattern missing it</b>
          </span>
        </ChartReadout>
      )}
      <div
        className="min-h-0 flex-1 overflow-auto px-3"
        style={{ marginBottom: STATUS_LINE_HEIGHT + 6 }}
      >
        <table className="eda-missingness-table">
          <thead>
            <tr>
              {fields.map((field, index) => {
                const total = plan.fieldTotals[index]!;
                const name = getFieldLabel(field);
                return (
                  <th key={field} className="eda-missingness-field">
                    <button
                      type="button"
                      data-field={field}
                      aria-label={`Select every pattern missing ${name}: ${total} rows`}
                      aria-pressed={fieldSelected(field)}
                      onClick={(event) =>
                        selectField(
                          field,
                          event.shiftKey || event.metaKey || event.ctrlKey
                        )
                      }
                      onPointerEnter={() => setHovered(`field:${field}`)}
                      onPointerLeave={() => setHovered(null)}
                    >
                      <span className="eda-missingness-total tabular-nums">
                        {total.toLocaleString()}
                      </span>
                      <span
                        className="eda-missingness-total-bar"
                        style={{
                          height: Math.max(2, (total / maxField) * 28),
                          background: themeColors.mark,
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className="eda-missingness-name"
                        style={{ height: nameHeight }}
                      >
                        {name}
                      </span>
                    </button>
                  </th>
                );
              })}
              <th className="eda-missingness-caption">Rows</th>
              <th className="eda-missingness-caption text-right">Share</th>
              {groups?.columns.map((column) => (
                <th key={column.key} className="eda-missingness-group">
                  <span>{column.label}</span>
                  <small className="tabular-nums">
                    of {column.total.toLocaleString()}
                  </small>
                </th>
              ))}
              <th className="eda-missingness-caption">Missing</th>
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
              const byGroup = groups && countByGroup(pattern.ids, groups);
              return (
                <tr
                  key={pattern.key}
                  className="eda-missingness-row chart-mark"
                  data-selected={selected || undefined}
                  data-dimmed={(selection && !selected) || undefined}
                  data-pinned={pattern.key === "" || undefined}
                  data-hovered={hovered === pattern.key || undefined}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  aria-label={`${name}: ${pattern.ids.length} rows, ${sharePercent(pattern.ids.length, plan.total)}`}
                  onPointerEnter={() => setHovered(pattern.key)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(pattern.key)}
                  onBlur={() => setHovered(null)}
                  {...rowAction(pattern)}
                >
                  {fields.map((field, index) => {
                    const on = pattern.missing.includes(field);
                    const line =
                      positions.length > 1 && index >= first && index <= last;
                    return (
                      <td
                        key={field}
                        className="eda-missingness-dot"
                        data-field-hovered={
                          hovered === `field:${field}` || undefined
                        }
                      >
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
                  {groups?.columns.map((column) => (
                    <td
                      key={column.key}
                      className="eda-missingness-group-cell tabular-nums"
                    >
                      {groupCell(byGroup!.get(column.key) ?? 0, column.total)}
                    </td>
                  ))}
                  <td className="eda-missingness-label">
                    {pattern.missing.length ? (
                      name
                    ) : (
                      <span className="eda-missingness-complete">
                        Complete rows
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {selectedByGroup && (
            <tfoot>
              <tr className="eda-missingness-selected">
                <th
                  scope="row"
                  colSpan={fields.length}
                  className="eda-missingness-caption text-right"
                >
                  Selected
                </th>
                <td className="tabular-nums">
                  <b>{selectedRows.toLocaleString()}</b>
                </td>
                <td className="eda-missingness-share tabular-nums">
                  {sharePercent(selectedRows, plan.total)}
                </td>
                {groups!.columns.map((column) => (
                  <td
                    key={column.key}
                    className="eda-missingness-group-cell tabular-nums"
                  >
                    {groupCell(
                      selectedByGroup.get(column.key) ?? 0,
                      column.total
                    )}
                  </td>
                ))}
                <td />
              </tr>
            </tfoot>
          )}
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
