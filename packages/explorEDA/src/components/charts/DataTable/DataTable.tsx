import { BaseChartProps } from "@/types/ChartTypes";
import { DataTableBody } from "./DataTableBody";
import { DataTableHeader } from "./DataTableHeader";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTableSettings } from "./definition";
import { getChartSummary } from "../chartAccessibility";

interface DataTableProps extends BaseChartProps {
  settings: DataTableSettings;
}

export function DataTable({ settings, height }: DataTableProps) {
  return (
    <div className="flex flex-col h-full w-full">
      <DataTableToolbar settings={settings} />
      <div
        className="flex-1 overflow-auto relative"
        style={{ maxHeight: `${height - 100}px` }} // Subtract toolbar and pagination height
      >
        <table className="w-full border-collapse">
          <caption className="sr-only">{getChartSummary(settings)}</caption>
          <DataTableHeader settings={settings} />
          <DataTableBody settings={settings} />
        </table>
      </div>
      <DataTablePagination settings={settings} />
    </div>
  );
}
