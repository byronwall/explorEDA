import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search } from "lucide-react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { DataTableSettings } from "./definition";
import { getFilteredRows } from "./filteredRows";

interface DataTableToolbarProps {
  settings: DataTableSettings;
}

export function DataTableToolbar({ settings }: DataTableToolbarProps) {
  const updateChart = useDataLayer((state) => state.updateChart);
  const data = useDataLayer((state) => state.data);
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));

  const handleSearch = (value: string) => {
    updateChart(settings.id, {
      ...settings,
      globalSearch: value,
      currentPage: 1, // Reset to first page when searching
    });
  };

  const handleExport = () => {
    const filteredData = getFilteredRows(data, liveItems, settings);

    // Create CSV content
    const headers = settings.columns.map((col) => col.field).join(",");
    const rows = searchFilteredData.map((row) =>
      settings.columns
        .map((col) => {
          const value = row[col.field];
          // Escape commas and quotes in the value
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
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
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8"
            value={settings.globalSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
