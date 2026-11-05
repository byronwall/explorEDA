"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CommandList } from "cmdk";

interface ComboBoxProps<T> {
  value: T | undefined;
  options: T[];
  onChange: (value: T | undefined) => void;
  optionToString?: (option: T) => string;
  /** More text a search matches, such as a field's column name. */
  optionKeywords?: (option: T) => string[];
  optionToNode?: (option: T) => React.ReactNode;
  placeholder?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
  /** More groups after the options, such as related tables' fields. */
  extra?: (close: () => void) => React.ReactNode;
}

export function ComboBox<T>({
  value,
  options,
  onChange,
  optionToString = (option) => String(option),
  optionKeywords,
  optionToNode,
  placeholder = "Select option...",
  className,
  id,
  "aria-label": ariaLabel,
  extra,
}: ComboBoxProps<T>) {
  const [open, setOpen] = useState(false);

  const renderOption = (option: T) => {
    if (optionToNode) {
      return optionToNode(option);
    }
    return optionToString(option);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          id={id}
          aria-label={ariaLabel}
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="min-w-0 truncate">
            {value ? optionToString(value) : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[max(18rem,var(--radix-popover-trigger-width))] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList className="max-h-72 overflow-y-auto">
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option, index) => {
                return (
                  <CommandItem
                    key={index}
                    onSelect={() => {
                      onChange(option === value ? undefined : option);
                      setOpen(false);
                    }}
                    value={optionToString(option)}
                    keywords={optionKeywords?.(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {renderOption(option)}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {extra?.(() => setOpen(false))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
