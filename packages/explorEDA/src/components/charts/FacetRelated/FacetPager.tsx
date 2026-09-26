import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface FacetOption {
  id: string;
  label: string;
}

export interface FacetPickerProps {
  /** Every facet in the data, in natural order. */
  options: FacetOption[];
  /** The chart's `visibleFacetIds`; undefined shows every facet. */
  visibleIds: string[] | undefined;
  onChange: (visibleIds: string[] | undefined) => void;
}

/** Toggles one facet, appending new picks so the chosen order is kept. */
export function toggleVisibleFacet(
  options: FacetOption[],
  visibleIds: string[] | undefined,
  id: string
) {
  const current = visibleIds ?? options.map((option) => option.id);
  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
  const isAll =
    next.length === options.length &&
    next.every((item, index) => item === options[index]?.id);
  return isAll ? undefined : next;
}

interface FacetPagerProps {
  label: string;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  picker: FacetPickerProps;
}

export function FacetPager({
  label,
  page,
  pageCount,
  onPageChange,
  picker,
}: FacetPagerProps) {
  const paged = pageCount > 1;
  return (
    <div className="flex h-5 shrink-0 items-center justify-center gap-1 overflow-hidden text-xs text-muted-foreground">
      {paged && (
        <button
          type="button"
          className="shrink-0 whitespace-nowrap underline disabled:no-underline disabled:opacity-40"
          disabled={page === 0}
          onClick={() => onPageChange(Math.max(0, page - 1))}
        >
          Previous
        </button>
      )}
      <FacetPicker label={label} {...picker} />
      {paged && (
        <button
          type="button"
          className="shrink-0 whitespace-nowrap underline disabled:no-underline disabled:opacity-40"
          disabled={page === pageCount - 1}
          onClick={() => onPageChange(Math.min(pageCount - 1, page + 1))}
        >
          Next
        </button>
      )}
    </div>
  );
}

function FacetPicker({
  label,
  options,
  visibleIds,
  onChange,
}: FacetPickerProps & { label: string }) {
  const [open, setOpen] = useState(false);
  const visible = new Set(visibleIds ?? options.map((option) => option.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 min-w-0 gap-1 px-1.5 text-xs font-normal text-muted-foreground hover:text-foreground"
          aria-label={`Choose visible facets, ${label}`}
        >
          <span className="min-w-0 truncate">{label}</span>
          <ChevronDown className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="center">
        <Command>
          <CommandInput
            placeholder="Search facets"
            aria-label="Search facets"
          />
          <CommandList className="max-h-64 overflow-y-auto">
            <CommandEmpty>No facets found.</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.id}
                value={`${option.label} ${option.id}`}
                onSelect={() =>
                  onChange(toggleVisibleFacet(options, visibleIds, option.id))
                }
              >
                <Check
                  className={cn(
                    "size-4",
                    visible.has(option.id) ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="min-w-0 truncate">{option.label}</span>
                <span className="sr-only">
                  {visible.has(option.id) ? "shown" : "hidden"}
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <span>
            {visible.size} of {options.length} shown
          </span>
          <button
            type="button"
            className="underline disabled:no-underline disabled:opacity-40"
            disabled={visibleIds === undefined}
            onClick={() => onChange(undefined)}
          >
            Show all
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
