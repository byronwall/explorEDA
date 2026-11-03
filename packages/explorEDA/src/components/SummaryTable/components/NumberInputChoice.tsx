import {
  numberInputLabel,
  type ConversionPreview,
  type NumberInput,
} from "@/lib/fieldSettings";
import { cn } from "@/lib/utils";

type Props = {
  value: NumberInput | undefined;
  counts: NonNullable<ConversionPreview["numberInputs"]>;
  onChange: (value: NumberInput | undefined) => void;
};

/**
 * Pick how a numeric field's text writes decimals and digit groups. Each
 * choice shows how many of the field's values it reads and how many fail.
 */
export function NumberInputChoice({ value, counts, onChange }: Props) {
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
            const checked = count.input === value;
            return (
              <tr
                key={count.input ?? "plain"}
                className={cn(
                  "cursor-pointer border-b last:border-0 hover:bg-muted/50",
                  checked && "bg-muted"
                )}
                onClick={() => onChange(count.input)}
              >
                <td className="py-1 pr-4">
                  <label className="flex cursor-pointer items-center gap-2 font-mono">
                    <input
                      type="radio"
                      name="number-input"
                      checked={checked}
                      onChange={() => onChange(count.input)}
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
    </fieldset>
  );
}
