import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import type { ValueDisplaySettings, ValueFormat } from "./valueFormat";

const SELECT_CLASS = "h-9 rounded-md border-input bg-background px-2 text-sm";

/** Show (value or share of total), number format, and decimals. */
export function ValueDisplayControls({
  id,
  settings,
  shareable,
  onChange,
}: {
  id: string;
  settings: ValueDisplaySettings;
  /** Counts and sums have a total to share; rates and averages do not. */
  shareable: boolean;
  onChange: (updates: ValueDisplaySettings) => void;
}) {
  const share = shareable && Boolean(settings.share);
  return (
    <>
      <Label htmlFor={`${id}-show`}>Show</Label>
      <ActionTooltip content="Share of total divides each bar by the sum of all bars, so together they make 100%. Counts and sums only.">
        <select
          id={`${id}-show`}
          className={SELECT_CLASS}
          value={share ? "share" : "value"}
          onChange={(event) =>
            onChange({ share: event.target.value === "share" || undefined })
          }
        >
          <option value="value">Value</option>
          <option value="share" disabled={!shareable}>
            Share of total
          </option>
        </select>
      </ActionTooltip>

      <Label htmlFor={`${id}-format`}>Format</Label>
      <ActionTooltip content="How axis ticks and value labels read. Auto shows shares, and rates of counts such as completions per attempt, as percents. Percent reads 0.685 as 68.5%.">
        <select
          id={`${id}-format`}
          className={SELECT_CLASS}
          value={settings.valueFormat ?? "auto"}
          onChange={(event) => {
            const value = event.target.value;
            onChange({
              valueFormat:
                value === "auto" ? undefined : (value as ValueFormat),
              ...(value !== "plain" ? { valueDecimals: undefined } : {}),
            });
          }}
        >
          <option value="auto">Auto</option>
          <option value="percent">Percent</option>
          <option value="plain">Plain number</option>
        </select>
      </ActionTooltip>

      {settings.valueFormat === "plain" && (
        <>
          <Label htmlFor={`${id}-decimals`}>Decimals</Label>
          <select
            id={`${id}-decimals`}
            className={`${SELECT_CLASS} w-fit`}
            value={settings.valueDecimals ?? ""}
            onChange={(event) =>
              onChange({
                valueDecimals:
                  event.target.value === ""
                    ? undefined
                    : Number(event.target.value),
              })
            }
          >
            <option value="">3 significant digits</option>
            {[0, 1, 2, 3, 4].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </>
      )}
    </>
  );
}
