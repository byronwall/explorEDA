import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Columns3, Download, Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { DataTableSettings } from "./definition";
import { DataTableRow, getFilteredRows } from "./filteredRows";
import { useState } from "react";
import { ActionTooltip } from "@/components/ui/tooltip";
import { FieldMetadata, resolveFieldProfile } from "@/components/FieldMetadata";

interface DataTableToolbarProps {
  settings: DataTableSettings;
  rows?: DataTableRow[];
  onSettingsChange?: (settings: Partial<DataTableSettings>) => void;
  compact?: boolean;
  localFilters?: boolean;
}

export function DataTableToolbar({
  settings,
  rows,
  onSettingsChange,
  compact = false,
  localFilters = false,
}: DataTableToolbarProps) {
  const [fieldSearch, setFieldSearch] = useState("");
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const updateChart = useDataLayer((state) => state.updateChart);
  const data = useDataLayer((state) => state.data);
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));
  const getColumnNames = useDataLayer((state) => state.getColumnNames);

  const filteredData = rows ?? getFilteredRows(data, liveItems, settings);
  const handleSearch = (globalSearch: string) => {
    if (onSettingsChange) onSettingsChange({ globalSearch });
    else updateChart(settings.id, { globalSearch });
  };

  const handleExport = () => {
    const csvContent = toTableCsv(
      filteredData,
      settings.columns.map((column) => column.field)
    );
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `table-export-${new Date().toISOString()}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const search = (
    <div className="eda-table-search relative min-w-0">
      <Input
        className="h-8 text-xs"
        placeholder="Search this table…"
        aria-label="Search table"
        value={settings.globalSearch}
        onChange={(event) => handleSearch(event.target.value)}
      />
      {settings.globalSearch && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-8 w-8"
          aria-label="Clear table search"
          onClick={() => handleSearch("")}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  return (
    <div
      className={compact ? "eda-table-toolbar-compact" : "eda-table-toolbar"}
    >
      {!compact && search}
      {localFilters && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="eda-columns-trigger"
              aria-label="Choose visible columns"
            >
              <Columns3 className="h-3.5 w-3.5" /> Columns{" "}
              <span className="tabular-nums">{settings.columns.length}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            aria-label="Visible columns"
            className="w-96 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Visible columns</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onSettingsChange?.({
                    columns: getColumnNames()
                      .filter((field) => field !== "__ID")
                      .map(
                        (field) =>
                          settings.columns.find(
                            (column) => column.field === field
                          ) ?? { id: field, field }
                      ),
                  })
                }
              >
                Show all
              </Button>
            </div>
            <Input
              aria-label="Find columns"
              placeholder="Find a column…"
              value={fieldSearch}
              onChange={(event) => setFieldSearch(event.target.value)}
            />
            <div className="grid max-h-72 gap-1 overflow-y-auto">
              {getColumnNames()
                .filter(
                  (field) =>
                    field !== "__ID" &&
                    field.toLowerCase().includes(fieldSearch.toLowerCase())
                )
                .map((field) => {
                  const checked = settings.columns.some(
                    (column) => column.field === field
                  );
                  return (
                    <label
                      key={field}
                      className="flex min-w-0 cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        aria-label={getFieldLabel(field)}
                        onChange={(event) =>
                          onSettingsChange?.({
                            columns: event.target.checked
                              ? [...settings.columns, { id: field, field }]
                              : settings.columns.filter(
                                  (column) => column.field !== field
                                ),
                          })
                        }
                      />
                      <FieldMetadata
                        profile={resolveFieldProfile(
                          field,
                          fieldProfiles,
                          getColumnData
                        )}
                        label={getFieldLabel(field)}
                        compact
                      />
                    </label>
                  );
                })}
            </div>
          </PopoverContent>
        </Popover>
      )}
      <span
        className="ml-auto whitespace-nowrap text-muted-foreground tabular-nums"
        aria-live="polite"
      >
        {filteredData.length.toLocaleString()}{" "}
        {filteredData.length === 1 ? "row" : "rows"}
      </span>

      {compact && (
        <Popover>
          <ActionTooltip content="Search rows">
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={
                  settings.globalSearch
                    ? `Search rows: ${settings.globalSearch}`
                    : "Search rows"
                }
                className={
                  settings.globalSearch ? "text-primary bg-accent" : ""
                }
              >
                <Search className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
          </ActionTooltip>
          <PopoverContent
            align="end"
            className="eda-table-search-popover w-64 p-2"
          >
            {search}
          </PopoverContent>
        </Popover>
      )}
      <ActionTooltip content="Export rows as CSV">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExport}
          aria-label="Export rows as CSV"
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </ActionTooltip>
    </div>
  );
}

export function toTableCsv(rows: DataTableRow[], fields: string[]): string {
  const cell = (value: unknown) => {
    const text = String(value ?? "");
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [
    fields.map(cell).join(","),
    ...rows.map((row) => fields.map((field) => cell(row[field])).join(",")),
  ].join("\n");
}
