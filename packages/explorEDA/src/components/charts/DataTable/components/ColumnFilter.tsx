import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ColumnFilterProps {
  columnId: string;
  columnLabel: string;
  value: string;
  operator: "contains" | "equals" | "startsWith" | "endsWith";
  onChange: (
    columnId: string,
    value: string,
    operator: "contains" | "equals" | "startsWith" | "endsWith"
  ) => void;
  onClear: () => void;
}

export function ColumnFilter({
  columnId,
  columnLabel,
  value,
  operator,
  onChange,
  onClear,
}: ColumnFilterProps) {
  return (
    <div
      className="flex items-center gap-2"
      onClick={(event) => event.stopPropagation()}
    >
      <Select
        value={operator}
        onValueChange={(nextOperator: typeof operator) =>
          onChange(columnId, value, nextOperator)
        }
      >
        <SelectTrigger className="h-8 w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="contains">Contains</SelectItem>
          <SelectItem value="equals">Equals</SelectItem>
          <SelectItem value="startsWith">Starts with</SelectItem>
          <SelectItem value="endsWith">Ends with</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder={`Filter ${columnLabel}...`}
        value={value}
        onChange={(e) => onChange(columnId, e.target.value, operator)}
        className="h-8 w-[200px]"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label={`Clear filter for ${columnLabel}`}
        onClick={onClear}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
