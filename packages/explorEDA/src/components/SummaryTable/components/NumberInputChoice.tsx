import { Input } from "@/components/ui/input";
import { ActionTooltip } from "@/components/ui/tooltip";
import {
  numberInputLabel,
  type ConversionPreview,
  type FieldSettings,
} from "@/lib/fieldSettings";
import { cn } from "@/lib/utils";

type Props = {
  settings: FieldSettings;
  counts: NonNullable<ConversionPreview["numberInputs"]>;
  onChange: (next: Partial<FieldSettings>) => void;
};

/** The convention that reads the most values, first on a tie. */
export function bestNumberInput(counts: Props["counts"]) {
  return counts.reduce((best, count) =>
    count.validCount > best.validCount ? count : best
  );
}

/**
 * Pick how a numeric field's text writes decimals and digit groups, and
 * whether it carries percent signs, accounting parentheses, or a currency.
 * Each convention shows how many of the field's values it reads and how
 * many fail with the options as set.
 */
export function NumberInputChoice({ settings, counts, onChange }: Props) {
  const currency = settings.currency ?? "USD";
  const best = bestNumberInput(counts);
  const options = [
    {
      key: "percentInput",
      label: "Percent",
      example: "12% reads as 0.12",
    },
    {
      key: "accountingInput",
      label: "Accounting negatives",
      example: "(1,234.50) reads as −1234.5",
    },
    {
      key: "currencyInput",
      label: "Currency sign",
      example: `${currency} 5.00 or its symbol`,
    },
  ] as const;
  return (
    <fieldset className="space-y-1">
      <ActionTooltip content="How this field writes decimals and digit groups. Counts cover every row, with the options below as set.">
        <legend className="text-xs font-semibold">Number input</legend>
      </ActionTooltip>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-1 font-medium">Written as</th>
            <th className="w-16 py-1 text-right font-medium">Reads</th>
            <th className="w-16 py-1 text-right font-medium">Fails</th>
          </tr>
        </thead>
        <tbody>
          {counts.map((count) => {
            const checked = count.input === settings.numberInput;
            const isBest = count === best && count.validCount > 0;
            return (
              <tr
                key={count.input ?? "plain"}
                className={cn(
                  "cursor-pointer border-b transition-colors duration-150 last:border-0 hover:bg-muted/60",
                  checked && "bg-primary/10"
                )}
                onClick={() => onChange({ numberInput: count.input })}
              >
                <td className="py-0.5">
                  <label className="flex cursor-pointer items-center gap-2 font-mono">
                    <input
                      type="radio"
                      name="number-input"
                      checked={checked}
                      onChange={() => onChange({ numberInput: count.input })}
                    />
                    {numberInputLabel(count.input)}
                    {isBest && (
                      <span className="font-sans text-[11px] text-muted-foreground">
                        reads the most
                      </span>
                    )}
                  </label>
                </td>
                <td
                  className={cn(
                    "py-0.5 text-right tabular-nums",
                    isBest && "font-semibold"
                  )}
                >
                  {count.validCount.toLocaleString()}
                </td>
                <td
                  className={cn(
                    "py-0.5 text-right tabular-nums text-muted-foreground",
                    // Only the chosen convention's failures are the user's.
                    checked && count.failedCount > 0 && "text-destructive"
                  )}
                >
                  {count.failedCount.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="space-y-0.5 pt-1 text-xs">
        {options.map((option) => (
          <label
            key={option.key}
            className="flex cursor-pointer flex-wrap items-center gap-x-2 py-0.5"
          >
            <input
              type="checkbox"
              checked={Boolean(settings[option.key])}
              onChange={(event) =>
                onChange(
                  option.key === "currencyInput" && event.target.checked
                    ? {
                        currencyInput: true,
                        currency,
                        // Show the amounts in the currency they carry.
                        format:
                          !settings.format || settings.format === "auto"
                            ? "currency"
                            : settings.format,
                      }
                    : { [option.key]: event.target.checked || undefined }
                )
              }
            />
            <span className="font-medium">{option.label}</span>
            <span className="text-muted-foreground">{option.example}</span>
          </label>
        ))}
        {settings.currencyInput && (
          <label className="flex items-center gap-2 pl-5">
            <span className="text-muted-foreground">Currency code</span>
            <Input
              aria-label="Currency code"
              className="w-16 font-mono"
              value={currency}
              maxLength={3}
              onChange={(event) =>
                onChange({ currency: event.target.value.toUpperCase() })
              }
            />
          </label>
        )}
      </div>
    </fieldset>
  );
}
