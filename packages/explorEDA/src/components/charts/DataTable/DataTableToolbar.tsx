import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { DataTableSettings } from "./definition";
import { DataTableRow, getFilteredRows } from "./filteredRows";

interface DataTableToolbarProps {
  settings: DataTableSettings;
  rows?: DataTableRow[];
  onSettingsChange?: (settings: Partial<DataTableSettings>) => void;
  compact?: boolean;
}

export function DataTableToolbar({
  settings,
  rows,
  onSettingsChange,
  compact = false,
}: DataTableToolbarProps) {
  const updateChart = useDataLayer((state) => state.updateChart);
  const data = useDataLayer((state) => state.data);
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));

  const filteredData = rows ?? getFilteredRows(data, liveItems, settings);
  const handleSearch = (globalSearch: string) => {
    if (onSettingsChange) onSettingsChange({ globalSearch });
    else updateChart(settings.id, { globalSearch });
  };

  const handleExport = () => {
    // Create CSV content
    const headers = settings.columns.map((col) => col.field).join(",");
    const rows = filteredData.map((row) =>
      settings.columns
        .map((col) => {
          const value = row[col.field];
          // Escape commas and quotes in the value
          if (typeof value === "string" && /[",\r\n]/.test(value)) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
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
        placeholder="Search rows…"
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
      <span
        className="ml-auto whitespace-nowrap text-muted-foreground tabular-nums"
        aria-live="polite"
      >
        {filteredData.length.toLocaleString()}{" "}
        {filteredData.length === 1 ? "row" : "rows"}
      </span>
      {compact && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={
                settings.globalSearch
                  ? `Search rows: ${settings.globalSearch}`
                  : "Search rows"
              }
              title={
                settings.globalSearch
                  ? `Search: ${settings.globalSearch}`
                  : "Search rows"
              }
              className={settings.globalSearch ? "text-primary bg-accent" : ""}
            >
              <Search className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="eda-table-search-popover w-64 p-2"
          >
            {search}
          </PopoverContent>
        </Popover>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleExport}
        aria-label="Export rows as CSV"
        title="Export rows as CSV"
      >
        <Download className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
