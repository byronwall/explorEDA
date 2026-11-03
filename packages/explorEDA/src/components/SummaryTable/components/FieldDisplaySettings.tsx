import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ActionTooltip } from "@/components/ui/tooltip";
import type { DataType } from "@/components/SummaryTable/utils/dataTypeDetection";
import {
  formatFieldValue,
  type FieldFormat,
  type FieldSettings,
} from "@/lib/fieldSettings";
import type { datum } from "@/types/ChartTypes";

const toggleClass =
  "min-w-0 flex-1 shrink basis-0 px-1 text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary";

const FORMATS: Record<
  "numeric" | "datetime",
  Array<{ id: FieldFormat; label: string; tooltip: string }>
> = {
  numeric: [
    {
      id: "auto",
      label: "Auto",
      tooltip: "Up to three decimals, with digit groups.",
    },
    {
      id: "number",
      label: "Number",
      tooltip: "A plain number with the precision you set.",
    },
    {
      id: "currency",
      label: "Currency",
      tooltip: "An amount in the currency code you set.",
    },
    { id: "percent", label: "Percent", tooltip: "0.12 shows as 12%." },
  ],
  datetime: [
    {
      id: "auto",
      label: "Auto",
      tooltip: "The date, and the time when there is one.",
    },
    { id: "date", label: "Date", tooltip: "Mar 4, 2026." },
    {
      id: "datetime",
      label: "Date and time",
      tooltip: "Mar 4, 2026, 3:30 PM.",
    },
  ],
};

/**
 * A field's label, description, and how its values show. Sample values
 * preview the draft format beside the controls.
 */
export function FieldDisplaySettings({
  field,
  draft,
  type,
  samples,
  onChange,
}: {
  field: string;
  draft: FieldSettings;
  type: DataType;
  /** Values to preview, such as the minimum, median, and maximum. */
  samples: Array<{ label: string; value: datum }>;
  onChange: (next: Partial<FieldSettings>) => void;
}) {
  const formats =
    type === "numeric" || type === "datetime" ? FORMATS[type] : undefined;
  return (
    <div className="eda-setting-grid">
      <label htmlFor="field-label" className="eda-setting-label">
        Label
      </label>
      <Input
        id="field-label"
        aria-label="Display label"
        value={draft.label ?? ""}
        placeholder={field}
        onChange={(event) => onChange({ label: event.target.value })}
      />
      <label htmlFor="field-description" className="eda-setting-label">
        Description
      </label>
      <Input
        id="field-description"
        value={draft.description ?? ""}
        placeholder="Shown under the field name"
        onChange={(event) => onChange({ description: event.target.value })}
      />
      {formats && (
        <>
          <span className="eda-setting-label">Format</span>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            aria-label="Display format"
            value={draft.format ?? "auto"}
            onValueChange={(value) => {
              if (value) onChange({ format: value as FieldFormat });
            }}
            className="w-full"
          >
            {formats.map((format) => (
              <ActionTooltip key={format.id} content={format.tooltip}>
                <ToggleGroupItem
                  value={format.id}
                  aria-label={format.label}
                  className={toggleClass}
                >
                  {format.label}
                </ToggleGroupItem>
              </ActionTooltip>
            ))}
          </ToggleGroup>
        </>
      )}
      {type === "numeric" && (
        <>
          <label htmlFor="field-precision" className="eda-setting-label">
            Decimals
          </label>
          <div className="flex items-center gap-3">
            <Input
              id="field-precision"
              aria-label="Precision"
              type="number"
              min={0}
              max={20}
              className="w-20"
              placeholder="Auto"
              value={draft.precision ?? ""}
              onChange={(event) =>
                onChange({
                  precision:
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                })
              }
            />
            {draft.format === "currency" && (
              <label className="flex items-center gap-2">
                <span className="eda-setting-label">Currency</span>
                <Input
                  id="field-currency"
                  aria-label="Currency code"
                  className="w-16 font-mono"
                  value={draft.currency ?? "USD"}
                  maxLength={3}
                  onChange={(event) =>
                    onChange({ currency: event.target.value.toUpperCase() })
                  }
                />
              </label>
            )}
          </div>
        </>
      )}
      <label htmlFor="field-unit" className="eda-setting-label">
        Unit
      </label>
      <Input
        id="field-unit"
        aria-label="Unit suffix"
        value={draft.unit ?? ""}
        placeholder={type === "numeric" ? "kg, ms" : "Shown after each value"}
        onChange={(event) => onChange({ unit: event.target.value })}
      />
      {samples.length > 0 && (
        <>
          <span className="eda-setting-label self-start pt-1">Shows as</span>
          <dl
            aria-label="Format preview"
            className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 rounded-md bg-muted/50 px-2 py-1.5 text-xs"
          >
            {samples.map((sample) => (
              <div key={sample.label} className="contents">
                <dt className="text-muted-foreground">{sample.label}</dt>
                <dd className="font-medium tabular-nums">
                  {formatFieldValue(field, sample.value, { ...draft, type })}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  );
}
