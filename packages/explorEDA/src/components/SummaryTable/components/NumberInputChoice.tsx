import { Input } from "@/components/ui/input";
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

/**
 * Pick how a numeric field's text writes decimals and digit groups, and
 * whether it carries percent signs, accounting parentheses, or a currency.
 * Each convention shows how many of the field's values it reads and how
 * many fail with the options as set.
 */
export function NumberInputChoice({ settings, counts, onChange }: Props) {
  const currency = settings.currency ?? "USD";
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
    <fieldset className="space-y-1.5">
      <legend className="text-sm leading-none font-medium">Number input</legend>
      <p className="text-xs text-muted-foreground">
        How this field writes decimals and digit groups. Counts cover every row.
      </p>
      <table className="text-xs">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-1 pr-4 font-medium">Written as</th>
            <th className="py-1 pr-4 text-right font-medium">Valid</th>
            <th className="py-1 text-right font-medium">Failed</th>
          </tr>
        </thead>
        <tbody>
          {counts.map((count) => {
            const label = numberInputLabel(count.input);
            const checked = count.input === settings.numberInput;
            return (
              <tr
                key={count.input ?? "plain"}
                className={cn(
                  "cursor-pointer border-b last:border-0 hover:bg-muted/50",
                  checked && "bg-muted"
                )}
                onClick={() => onChange({ numberInput: count.input })}
              >
                <td className="py-1 pr-4">
                  <label className="flex cursor-pointer items-center gap-2 font-mono">
                    <input
                      type="radio"
                      name="number-input"
                      checked={checked}
                      onChange={() => onChange({ numberInput: count.input })}
                    />
                    {label}
                  </label>
                </td>
                <td className="py-1 pr-4 text-right tabular-nums">
                  {count.validCount}
                </td>
                <td
                  className={cn(
                    "py-1 text-right tabular-nums",
                    count.failedCount > 0 && "text-destructive"
                  )}
                >
                  {count.failedCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="space-y-1 pt-1 text-xs">
        {options.map((option) => (
          <label key={option.key} className="flex items-center gap-2">
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
              className="h-7 w-16 font-mono text-xs"
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
