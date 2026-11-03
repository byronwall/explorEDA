import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  countRows,
  findConflict,
  findRecoveryOptions,
  type RecoveryOption,
  type Restriction,
  type RowsRestrictions,
} from "@/lib/recovery/recoverRows";
import type { DataTableRow } from "../charts/DataTable/filteredRows";
import { useDataLayer, type IdType } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/FilterTypes";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ActionTooltip } from "../ui/tooltip";
import {
  formatFilterLabel,
  isActiveFilter,
  useFieldFormatting,
} from "../ActiveFilterStatus";

/** Records shown for the chosen option; the count covers all of them. */
const PREVIEW_ROWS = 5;
const PREVIEW_COLUMNS = 4;
const PREVIEW_VALUES = 3;

/**
 * The Rows view's own filters and search, reading rows as its table does:
 * source values plus calculated fields.
 */
export function useRowsRestrictions(): RowsRestrictions {
  const data = useDataLayer((state) => state.data);
  const rowsSettings = useDataLayer((state) => state.rowsSettings);
  const calculations = useDataLayer((state) => state.calculations);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const nonce = useDataLayer((state) => state.nonce);
  return useMemo(() => {
    void nonce;
    const byId = new Map(data.map((row) => [row.__ID, row]));
    const calculated = calculations.map(
      (calc) =>
        [calc.resultColumnName, getColumnData(calc.resultColumnName)] as const
    );
    return {
      filters: rowsSettings.filters,
      search: rowsSettings.globalSearch,
      row: (id) => {
        const row = byId.get(id) as DataTableRow | undefined;
        if (!row || !calculated.length) return row;
        return {
          ...row,
          ...Object.fromEntries(
            calculated.map(([name, values]) => [name, values[id]])
          ),
        };
      },
    };
  }, [data, rowsSettings, calculations, getColumnData, nonce]);
}

/**
 * Recover rows for the Rows table, shown when its own result is empty: the
 * workspace's rows, then its filters and search.
 */
export function RowsRecovery() {
  const crossfilter = useDataLayer((state) => state.crossfilterWrapper);
  const liveItems = useDataLayer((state) => state.liveItems);
  const total = useDataLayer((state) => state.data.length);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const rows = useRowsRestrictions();
  const restricted = useDataLayer(
    (state) =>
      state.workspaceFilters.some(isActiveFilter) ||
      state.charts.some((chart) => chart.filters.some(isActiveFilter)) ||
      state.rowsSettings.filters.some(isActiveFilter) ||
      state.rowsSettings.globalSearch !== ""
  );
  const empty = useMemo(() => {
    void liveItems;
    if (!restricted || total === 0) return false;
    return (
      countRows(crossfilter.getFilteredRowIds(), rows, (field) =>
        getColumnData(field)
      ) === 0
    );
  }, [crossfilter, liveItems, rows, getColumnData, restricted, total]);
  return empty ? <RecoverRows rowsView /> : null;
}

/**
 * Offered when filters leave no rows: in the workspace, or with `rowsView`,
 * in the Rows table. It lists each active restriction with the exact rows
 * that come back if only it is removed, and changes nothing until Apply.
 */
export function RecoverRows({ rowsView = false }: { rowsView?: boolean }) {
  const population = rowsView ? "Rows view" : "Workspace rows";
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="eda-recover-rows"
          aria-label="Recover rows"
          tooltip="See which filter to remove to bring rows back. Nothing changes until you apply."
        >
          <RotateCcw aria-hidden="true" />
          Recover rows
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        aria-label="Recover rows"
        className="eda-recover-popover w-[32rem] max-w-[calc(100vw-2rem)] p-0"
        onOpenAutoFocus={(event) => {
          // Arrow keys move the choice from the start.
          const checked = (
            event.currentTarget as HTMLElement | null
          )?.querySelector<HTMLInputElement>("input[type=radio]:checked");
          if (!checked) return;
          event.preventDefault();
          checked.focus();
        }}
        onCloseAutoFocus={(event) => {
          // After Apply the button is gone; the row count takes focus.
          const trigger =
            document.querySelector<HTMLElement>(".eda-recover-rows");
          if (trigger) return;
          event.preventDefault();
          document.querySelector<HTMLElement>(".eda-row-count")?.focus();
        }}
      >
        {open && (
          <RecoverRowsPanel
            population={population}
            rowsView={rowsView}
            onClose={() => setOpen(false)}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function RecoverRowsPanel({
  population,
  rowsView,
  onClose,
}: {
  population: string;
  rowsView: boolean;
  onClose: () => void;
}) {
  const rows = useRowsRestrictions();
  const data = useDataLayer((state) => state.data);
  const charts = useDataLayer((state) => state.charts);
  const workspaceFilters = useDataLayer((state) => state.workspaceFilters);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const localSelections = useDataLayer((state) => state.localSelections);
  const nonce = useDataLayer((state) => state.nonce);
  const options = useMemo(() => {
    void nonce;
    return findRecoveryOptions({
      ids: data.map((row) => row.__ID),
      charts,
      workspaceFilters,
      fieldGetter: (field) => getColumnData(field),
      localSelections: localSelections ?? false,
      rows: rowsView ? rows : undefined,
    });
  }, [
    data,
    charts,
    workspaceFilters,
    getColumnData,
    localSelections,
    nonce,
    rowsView,
    rows,
  ]);
  // Most rows back first; removals that bring nothing back sit below.
  const ranked = [...options].sort((a, b) => b.ids.length - a.ids.length);
  const live = ranked.filter((option) => option.ids.length > 0);
  const dead = ranked.filter((option) => option.ids.length === 0);
  const [chosenKey, setChosenKey] = useState(live[0]?.key);
  const [hoverKey, setHoverKey] = useState<string>();
  // A choice that no longer exists, after an edit elsewhere, falls back.
  const chosen = live.find((option) => option.key === chosenKey) ?? live[0];
  const previewed = live.find((option) => option.key === hoverKey) ?? chosen;
  const label = useRestrictionLabel();
  const apply = useApplyRestriction();
  const conflict = findConflict(options.map((option) => option.restriction));
  const applyChosen = () => {
    if (!chosen) return;
    apply(chosen.restriction);
    onClose();
  };
  const describe = (restriction: Restriction) => {
    const { owner, label: text } = label(restriction);
    return (
      <>
        <span className="font-medium text-foreground">{text}</span> ({owner})
      </>
    );
  };

  return (
    <div
      className="eda-recover-panel"
      onKeyDown={(event) => {
        if (
          event.key !== "Enter" ||
          !(event.target instanceof HTMLInputElement)
        )
          return;
        event.preventDefault();
        applyChosen();
      }}
    >
      <header className="eda-recover-head">
        <h2>
          No rows match all {options.length}{" "}
          {options.length === 1 ? "filter" : "filters"}
        </h2>
        <p>
          {conflict ? (
            <>
              {describe(conflict[0])} and {describe(conflict[1])} share no rows.
            </>
          ) : (
            "Remove one filter to bring rows back. Nothing changes until you apply."
          )}
        </p>
      </header>
      <div className="min-h-0 overflow-y-auto">
        <fieldset onPointerLeave={() => setHoverKey(undefined)}>
          <legend className="sr-only">Filter to remove</legend>
          {live.map((option) => (
            <OptionRow
              key={option.key}
              option={option}
              total={data.length}
              checked={option.key === chosen?.key}
              previewed={option.key === previewed?.key}
              onChoose={() => setChosenKey(option.key)}
              onHover={() => setHoverKey(option.key)}
            />
          ))}
          {dead.length > 0 && (
            <p className="eda-recover-group">
              {live.length
                ? "Still no rows when removed alone"
                : "Removing any one filter still leaves no rows"}
            </p>
          )}
          {dead.map((option) => (
            <OptionRow
              key={option.key}
              option={option}
              total={data.length}
              checked={false}
              previewed={false}
            />
          ))}
        </fieldset>
        {previewed ? (
          <Preview option={previewed} population={population} />
        ) : (
          <p className="eda-recover-empty">
            Remove several filters from the filter bar, or clear them all.
          </p>
        )}
      </div>
      <footer className="eda-recover-foot">
        <span className="eda-recover-keys" aria-hidden="true">
          <kbd>↑</kbd>
          <kbd>↓</kbd> choose <kbd>Enter</kbd> apply
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Keep empty
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!chosen}
          onClick={applyChosen}
          tooltip="Remove this one filter and keep the rest. Undo puts it back."
        >
          {chosen ? `Remove ${label(chosen.restriction).label}` : "Apply"}
        </Button>
      </footer>
    </div>
  );
}

function useRestrictionLabel() {
  const charts = useDataLayer((state) => state.charts);
  const formatting = useFieldFormatting();
  return (restriction: Restriction) => {
    if (restriction.kind === "rows-search") {
      return { owner: "Rows search", label: `“${restriction.text}”` };
    }
    const label = formatFilterLabel(restriction.filter, formatting);
    if (restriction.kind === "rows-filter") {
      return { owner: "Rows filter", label };
    }
    if (restriction.kind === "workspace") {
      return { owner: "Workspace", label };
    }
    const chart = charts.find((item) => item.id === restriction.chartId);
    return { owner: chart?.title || chart?.type || "Chart", label };
  };
}

function OptionRow({
  option,
  total,
  checked,
  previewed,
  onChoose,
  onHover,
}: {
  option: RecoveryOption;
  total: number;
  checked: boolean;
  previewed: boolean;
  onChoose?: () => void;
  onHover?: () => void;
}) {
  const { owner, label } = useRestrictionLabel()(option.restriction);
  const count = option.ids.length;
  const disabled = count === 0;
  const share = total ? count / total : 0;
  return (
    <label
      className={cn(
        "eda-recover-option",
        checked && "is-checked",
        previewed && !checked && "is-previewed",
        disabled && "is-disabled"
      )}
      onPointerEnter={onHover}
    >
      <input
        type="radio"
        name="eda-recover-option"
        className="accent-primary"
        checked={checked}
        disabled={disabled}
        onChange={onChoose}
      />
      <span className="eda-recover-option-text">
        <span className="eda-recover-option-label">{label}</span>
        <span className="eda-recover-option-owner">{owner}</span>
      </span>
      {option.relaxes ? (
        <>
          {!disabled && (
            <span className="eda-recover-bar" aria-hidden="true">
              <span style={{ width: `${Math.max(share * 100, 3)}%` }} />
            </span>
          )}
          <span className="eda-recover-count">
            {disabled ? "0" : `+${count.toLocaleString()}`}
            <span className="sr-only"> rows</span>
          </span>
        </>
      ) : (
        <ActionTooltip content="Removing this filter also changes which rows its chart keeps, so it can't be previewed as a removal.">
          <span tabIndex={0} className="eda-recover-count col-span-2">
            Not exact
          </span>
        </ActionTooltip>
      )}
    </label>
  );
}

/** The most common values of a field among the rows, largest first. */
function topValues(
  ids: readonly IdType[],
  values: Record<IdType, datum>,
  format: (value: datum) => string
) {
  const counts = new Map<string, number>();
  for (const id of ids) {
    const key = format(values[id]);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]);
}

function Preview({
  option,
  population,
}: {
  option: RecoveryOption;
  population: string;
}) {
  const workspaceFilters = useDataLayer((state) => state.workspaceFilters);
  const charts = useDataLayer((state) => state.charts);
  const rowsFilters = useDataLayer((state) => state.rowsSettings.filters);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  // The removed filter's field first, then the other filtered fields, so
  // each row shows why it passes.
  const removed =
    option.restriction.kind === "rows-search"
      ? undefined
      : option.restriction.filter.field;
  const filtered = [
    ...workspaceFilters.map((filter) => filter.field),
    ...charts.flatMap((chart) => chart.filters.map((filter) => filter.field)),
    ...rowsFilters.map((filter) => filter.field),
  ];
  const fields = [
    ...new Set([
      ...(removed ? [removed] : []),
      ...filtered,
      ...getColumnNames(),
    ]),
  ]
    .filter((field) => field !== "__ID")
    .slice(0, PREVIEW_COLUMNS);
  const columns = fields.map((field) => ({
    field,
    values: getColumnData(field),
  }));
  const ids = option.ids.slice(0, PREVIEW_ROWS);
  const count = option.ids.length;
  // What the removed field holds among the rows that come back.
  const mix = removed
    ? topValues(option.ids, getColumnData(removed), (value) =>
        formatFieldValue(removed, value)
      )
    : [];
  return (
    <section className="eda-recover-preview" aria-label="Rows that come back">
      <div className="eda-recover-preview-head">
        <h3>
          {count.toLocaleString()} {count === 1 ? "row comes" : "rows come"}{" "}
          back
        </h3>
        <span>{population}</span>
      </div>
      {removed && (
        <p className="eda-recover-mix">
          <span className="text-muted-foreground">
            {getFieldLabel(removed)}:
          </span>{" "}
          {mix.slice(0, PREVIEW_VALUES).map(([value, n], index) => (
            <span key={value}>
              {index > 0 && <span className="text-muted-foreground"> · </span>}
              {value} <span className="tabular-nums">{n.toLocaleString()}</span>
            </span>
          ))}
          {mix.length > PREVIEW_VALUES && (
            <span className="text-muted-foreground">
              {" "}
              · {mix.length - PREVIEW_VALUES} more
            </span>
          )}
        </p>
      )}
      <div className="eda-recover-sample">
        <table className="eda-recover-table w-full text-xs tabular-nums">
          <thead>
            <tr>
              {columns.map(({ field }) => (
                <th key={field} scope="col">
                  {getFieldLabel(field)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ids.map((id) => (
              <tr key={id}>
                {columns.map(({ field, values }) => (
                  <td
                    key={field}
                    className={cn(field === removed && "is-removed")}
                  >
                    {formatFieldValue(field, values[id])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {count > ids.length && (
          <p className="eda-recover-more">
            First {ids.length} of {count.toLocaleString()}
          </p>
        )}
      </div>
    </section>
  );
}

/** Removes one restriction as a single held change: one undo step. */
function useApplyRestriction() {
  const holdStateChanges = useDataLayer((state) => state.holdStateChanges);
  const setWorkspaceFilter = useDataLayer((state) => state.setWorkspaceFilter);
  const updateChart = useDataLayer((state) => state.updateChart);
  const charts = useDataLayer((state) => state.charts);
  const rowsSettings = useDataLayer((state) => state.rowsSettings);
  const updateRowsSettings = useDataLayer((state) => state.updateRowsSettings);
  return (restriction: Restriction) => {
    const release = holdStateChanges();
    try {
      if (restriction.kind === "workspace") {
        setWorkspaceFilter(restriction.field);
      } else if (restriction.kind === "rows-search") {
        updateRowsSettings({ globalSearch: "" });
      } else if (restriction.kind === "rows-filter") {
        const { filters } = rowsSettings;
        // Skip a filter that changed since the panel read it.
        if (filters[restriction.index] === restriction.filter) {
          updateRowsSettings({
            filters: filters.filter((_, i) => i !== restriction.index),
          });
        }
      } else {
        const chart = charts.find((item) => item.id === restriction.chartId);
        if (chart?.filters[restriction.index] === restriction.filter) {
          updateChart(chart.id, {
            filters: chart.filters.filter((_, i) => i !== restriction.index),
          });
        }
      }
    } finally {
      release();
    }
  };
}
