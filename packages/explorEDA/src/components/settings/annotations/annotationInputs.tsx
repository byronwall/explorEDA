import { useRef, type ReactNode } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { parseDateText } from "@/lib/valueParsing";
import { NumericInputEnter } from "../../NumericInputEnter";
import { Input } from "../../ui/input";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";
import { ActionTooltip } from "../../ui/tooltip";

export const toggleClass =
  "w-full min-w-0 px-1 text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary";

/**
 * Typing in a field is one host change, reported when the field loses
 * focus, rather than one undo step per keystroke.
 */
export function useHeldTyping() {
  const holdStateChanges = useDataLayer((state) => state.holdStateChanges);
  const release = useRef<(() => void) | null>(null);
  return {
    onFocus: () => {
      release.current ??= holdStateChanges();
    },
    onBlur: () => {
      release.current?.();
      release.current = null;
    },
  };
}

/** A text field whose typing is one undo step. */
export function HeldInput({
  id,
  value,
  placeholder,
  onChange,
  "aria-label": ariaLabel,
}: {
  id?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
}) {
  const typing = useHeldTyping();
  return (
    <Input
      id={id}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      {...typing}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

const dateText = (time: number) =>
  Number.isFinite(time) ? new Date(time).toISOString().slice(0, 10) : "";

/**
 * A value in data units: a number, or a calendar date on a date axis, which
 * saves as a UTC timestamp.
 */
export function ValueInput({
  id,
  value,
  date,
  onChange,
  "aria-label": ariaLabel,
}: {
  id?: string;
  value: number;
  date?: boolean;
  onChange: (value: number) => void;
  "aria-label"?: string;
}) {
  if (date)
    return (
      <Input
        id={id}
        type="date"
        aria-label={ariaLabel}
        value={dateText(value)}
        onChange={(event) => {
          const time = parseDateText(event.target.value);
          if (Number.isFinite(time)) onChange(time);
        }}
      />
    );
  return (
    <NumericInputEnter
      id={id}
      aria-label={ariaLabel}
      className="max-w-none"
      value={value}
      onChange={onChange}
    />
  );
}

/** A two-way choice, each option explained by a tooltip. */
export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; help: ReactNode; disabled?: boolean }[];
  onChange: (value: T) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as T);
      }}
      aria-label={label}
      variant="outline"
      size="sm"
      className="grid w-full"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((option) => (
        <ActionTooltip key={option.value} content={option.help}>
          <ToggleGroupItem
            value={option.value}
            aria-label={option.label}
            className={toggleClass}
            disabled={option.disabled}
          >
            {option.label}
          </ToggleGroupItem>
        </ActionTooltip>
      ))}
    </ToggleGroup>
  );
}
