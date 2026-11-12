import { TableHead } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ColumnHeaderProps {
  column: {
    id: string;
    label: string;
    sortable: boolean;
  };
  sortConfig: {
    key: string;
    direction: "asc" | "desc";
  }[];
}

export function ColumnHeader({ column, sortConfig }: ColumnHeaderProps) {
  const isSorted = sortConfig.some((sort) => sort.key === column.id);
  const sortDirection = isSorted
    ? sortConfig.find((sort) => sort.key === column.id)?.direction
    : null;

  return (
    <TableHead>
      <Button
        variant="ghost"
        className={cn(
          "flex items-center gap-2",
          !column.sortable && "cursor-default",
          isSorted && "text-primary"
        )}
        disabled={!column.sortable}
      >
        {column.label}
        {column.sortable && (
          <ArrowUpDown
            className={cn("h-4 w-4", sortDirection === "desc" && "rotate-180")}
          />
        )}
      </Button>
    </TableHead>
  );
}
