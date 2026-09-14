import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DataTableSettings } from "./definition";
import { getFilteredRows } from "./filteredRows";

interface DataTablePaginationProps {
  settings: DataTableSettings;
}

const PAGE_SIZE_OPTIONS = [
  { label: "10 rows", value: 10 },
  { label: "25 rows", value: 25 },
  { label: "50 rows", value: 50 },
  { label: "100 rows", value: 100 },
];

export function DataTablePagination({ settings }: DataTablePaginationProps) {
  const { pageSize, currentPage } = settings;
  const data = useDataLayer((state) => state.data);
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));
  const updateChart = useDataLayer((state) => state.updateChart);

  const filteredData = getFilteredRows(data, liveItems, settings);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const page = Math.min(Math.max(1, currentPage), totalPages);

  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value, 10);
    const newCurrentPage = Math.min(
      Math.ceil((page * pageSize) / newPageSize),
      Math.max(1, Math.ceil(filteredData.length / newPageSize))
    );
    updateChart(settings.id, {
      pageSize: newPageSize,
      currentPage: newCurrentPage,
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateChart(settings.id, { currentPage: newPage });
    }
  };

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-gray-700">{filteredData.length} rows</p>
      </div>
      <div className="flex items-center space-x-2">
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="h-8 w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="Go to previous page"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </p>
          <Button
            variant="outline"
            size="sm"
            aria-label="Go to next page"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
