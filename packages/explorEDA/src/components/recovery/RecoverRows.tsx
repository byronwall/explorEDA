import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  countRows,
  findRecoveryOptions,
  type RecoveryOption,
  type Restriction,
  type RowsRestrictions,
} from "@/lib/recovery/recoverRows";
import type { DataTableRow } from "../charts/DataTable/filteredRows";
import { useDataLayer } from "@/providers/DataLayerProvider";
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
  const best = options.reduce<RecoveryOption | undefined>(
    (top, option) =>
      option.ids.length > (top?.ids.length ?? 0) ? option : top,
    undefined
  );
  const [chosenKey, setChosenKey] = useState(best?.key);
  // A choice that no longer exists, after an edit elsewhere, falls back.
  const chosen =
    options.find((option) => option.key === chosenKey && option.ids.length) ??
    best;

  return (
    <div className="flex max-h-[min(70vh,560px)] flex-col">
      <header className="border-b border-border px-3.5 pt-3 pb-2">
        <h2 className="text-sm font-semibold">Recover rows</h2>
        <p className="text-xs text-muted-foreground">
          No rows pass every filter. Remove one to bring rows back. Nothing
          changes until you apply.
        </p>
      </header>
      <div className="min-h-0 overflow-y-auto">
        <fieldset>
          <legend className="sr-only">Restriction to remove</legend>
          {options.map((option) => (
            <OptionRow
              key={option.key}
              option={option}
              checked={option.key === chosen?.key}
              onChoose={() => setChosenKey(option.key)}
            />
          ))}
        </fieldset>
        {chosen ? (
          <Preview option={chosen} population={population} />
        ) : (
          <p className="px-3.5 py-3 text-xs text-muted-foreground">
            Removing any one filter still leaves no rows. Remove several from
            the filter bar, or clear them all.
          </p>
        )}
      </div>
      <footer className="flex items-center gap-2 border-t border-border bg-muted/40 px-3.5 py-2.5">
        <span className="mr-auto text-xs text-muted-foreground">
          {chosen
            ? `Removes 1 filter and keeps ${options.length - 1}. Undo restores it.`
            : `${options.length} active ${options.length === 1 ? "filter" : "filters"}`}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Keep empty
        </Button>
        <ApplyButton option={chosen} onApplied={onClose} />
      </footer>
    </div>
  );
}

function useRestrictionLabel() {
  const charts = useDataLayer((state) => state.charts);
  const formatting = useFieldFormatting();
  return (restriction: Restriction) => {
    if (restriction.kind === "rows-search") {
      return { owner: "Rows · search", label: `“${restriction.text}”` };
    }
    const label = formatFilterLabel(restriction.filter, formatting);
    if (restriction.kind === "rows-filter") {
      return { owner: "Rows · filter", label };
    }
    if (restriction.kind === "workspace") {
      return { owner: "Workspace", label };
    }
    const chart = charts.find((item) => item.id === restriction.chartId);
    return {
      owner: `${chart?.title || chart?.type || "Chart"} · chart selection`,
      label,
    };
  };
}

function OptionRow({
  option,
  checked,
  onChoose,
}: {
  option: RecoveryOption;
  checked: boolean;
  onChoose: () => void;
}) {
  const { owner, label } = useRestrictionLabel()(option.restriction);
  const count = option.ids.length;
  const disabled = count === 0;
  const pill = !option.relaxes ? (
    <ActionTooltip content="Removing this filter also changes which rows its chart keeps, so it can't be previewed as a removal.">
      <span tabIndex={0} className="eda-recover-count is-none">
        Not exact
      </span>
    </ActionTooltip>
  ) : (
    <span className={cn("eda-recover-count", disabled && "is-none")}>
      {disabled ? "still 0" : `+${count.toLocaleString()} rows`}
    </span>
  );
  return (
    <label
      className={cn(
        "eda-recover-option",
        checked && "is-checked",
        disabled && "is-disabled"
      )}
    >
      <input
        type="radio"
        name="eda-recover-option"
        className="accent-primary"
        checked={checked}
        disabled={disabled}
        onChange={onChoose}
      />
      <span className="min-w-0">
        <span className="block truncate text-[11px] text-muted-foreground">
          {owner}
        </span>
        <span className="block truncate text-sm">{label}</span>
      </span>
      {pill}
    </label>
  );
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
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  // The removed filter's field first, then the other filtered fields, so
  // each row shows why it passes.
  const rowsFilters = useDataLayer((state) => state.rowsSettings.filters);
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
  return (
    <section className="px-3.5 py-2.5" aria-label="Rows that come back">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <h3 className="text-[13px] font-semibold">
          {count.toLocaleString()} {count === 1 ? "row comes" : "rows come"}{" "}
          back
        </h3>
        <span className="text-xs text-muted-foreground">
          {population}
          {count > ids.length ? ` · first ${ids.length} shown` : ""}
        </span>
      </div>
      <div className="overflow-x-auto">
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
      </div>
    </section>
  );
}

function ApplyButton({
  option,
  onApplied,
}: {
  option: RecoveryOption | undefined;
  onApplied: () => void;
}) {
  const holdStateChanges = useDataLayer((state) => state.holdStateChanges);
  const setWorkspaceFilter = useDataLayer((state) => state.setWorkspaceFilter);
  const updateChart = useDataLayer((state) => state.updateChart);
  const charts = useDataLayer((state) => state.charts);
  const rowsSettings = useDataLayer((state) => state.rowsSettings);
  const updateRowsSettings = useDataLayer((state) => state.updateRowsSettings);
  const apply = () => {
    if (!option) return;
    const { restriction } = option;
    // One held change reaches the host as one undo step.
    const release = holdStateChanges();
    try {
      if (restriction.kind === "workspace") {
        setWorkspaceFilter(restriction.field);
      } else if (restriction.kind === "rows-search") {
        updateRowsSettings({ globalSearch: "" });
      } else if (restriction.kind === "rows-filter") {
        const { filters } = rowsSettings;
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
    onApplied();
  };
  return (
    <Button
      type="button"
      size="sm"
      disabled={!option}
      onClick={apply}
      tooltip="Remove this filter. Undo puts it back."
    >
      Apply
    </Button>
  );
}
