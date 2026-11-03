import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ActionTooltip } from "@/components/ui/tooltip";
import { typeLabels } from "@/components/FieldMetadata";
import type { DataType } from "@/components/SummaryTable/utils/dataTypeDetection";
import type {
  ConversionPreview,
  DatePreset,
  FieldSettings,
} from "@/lib/fieldSettings";
import { NumberInputChoice } from "./NumberInputChoice";

const toggleClass =
  "min-w-0 flex-1 shrink basis-0 px-1 text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary";

const TYPES: Array<{ id: DataType | "auto"; label: string; tooltip: string }> =
  [
    { id: "numeric", label: "Number", tooltip: "Read values as numbers." },
    {
      id: "categorical",
      label: "Text",
      tooltip: "Keep values as text categories.",
    },
    {
      id: "datetime",
      label: "Date",
      tooltip: "Read values as dates in the order you pick.",
    },
    {
      id: "boolean",
      label: "Yes/No",
      tooltip: "Read true and false, yes and no, or 1 and 0.",
    },
  ];

const DATE_ORDERS: Array<{ id: DatePreset; label: string; tooltip: string }> = [
  { id: "iso", label: "ISO", tooltip: "2026-03-04, year first." },
  {
    id: "month-day-year",
    label: "M/D/Y",
    tooltip: "03/04/2026 is March 4.",
  },
  {
    id: "day-month-year",
    label: "D/M/Y",
    tooltip: "03/04/2026 is April 3.",
  },
];

/**
 * How a source field's raw values are read: its type, a number or date
 * input, and the text that means missing. Changes stay in the draft until
 * the inspector applies them.
 */
export function FieldReadAs({
  draft,
  inferredType,
  preview,
  conversionChanged,
  onTypeChange,
  onChange,
}: {
  draft: FieldSettings;
  inferredType: DataType;
  preview: ConversionPreview;
  conversionChanged: boolean;
  onTypeChange: (type: DataType | undefined) => void;
  onChange: (next: Partial<FieldSettings>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="eda-setting-grid eda-setting-grid-narrow">
        <span className="eda-setting-label">Type</span>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          aria-label="Type"
          value={draft.type ?? "auto"}
          onValueChange={(value) => {
            if (value)
              onTypeChange(value === "auto" ? undefined : (value as DataType));
          }}
          className="w-full"
        >
          <ActionTooltip
            content={`Automatic: reads this field as ${typeLabels[inferredType].toLowerCase()} from its values.`}
          >
            <ToggleGroupItem
              value="auto"
              aria-label="Automatic"
              className={toggleClass}
            >
              Auto
            </ToggleGroupItem>
          </ActionTooltip>
          {TYPES.map((type) => (
            <ActionTooltip key={type.id} content={type.tooltip}>
              <ToggleGroupItem
                value={type.id}
                aria-label={type.label}
                className={toggleClass}
              >
                {type.label}
              </ToggleGroupItem>
            </ActionTooltip>
          ))}
        </ToggleGroup>
        {draft.type === "datetime" && (
          <>
            <span className="eda-setting-label">Date order</span>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              aria-label="Date order"
              value={draft.datePreset ?? "iso"}
              onValueChange={(value) => {
                if (value) onChange({ datePreset: value as DatePreset });
              }}
              className="w-full"
            >
              {DATE_ORDERS.map((order) => (
                <ActionTooltip key={order.id} content={order.tooltip}>
                  <ToggleGroupItem
                    value={order.id}
                    aria-label={order.label}
                    className={toggleClass}
                  >
                    {order.label}
                  </ToggleGroupItem>
                </ActionTooltip>
              ))}
            </ToggleGroup>
          </>
        )}
        <label htmlFor="field-null-tokens" className="eda-setting-label">
          Missing text
        </label>
        <TokenInput
          id="field-null-tokens"
          tokens={draft.nullTokens ?? []}
          onChange={(nullTokens) => onChange({ nullTokens })}
        />
      </div>
      {draft.type === "numeric" && preview.numberInputs && (
        <NumberInputChoice
          settings={draft}
          counts={preview.numberInputs}
          onChange={onChange}
        />
      )}
      {conversionChanged && (
        <p className="flex gap-1.5 text-xs text-warning">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
          Applying clears filters on this field.
        </p>
      )}
    </div>
  );
}

const parseTokens = (text: string) =>
  text
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

/**
 * Comma-separated text tokens. The typed text stays as typed, so a comma
 * can start the next token; it resets only when the tokens change elsewhere,
 * such as Discard.
 */
function TokenInput({
  id,
  tokens,
  onChange,
}: {
  id: string;
  tokens: string[];
  onChange: (tokens: string[]) => void;
}) {
  const [text, setText] = useState(tokens.join(", "));
  const key = JSON.stringify(tokens);
  useEffect(() => {
    setText((current) =>
      JSON.stringify(parseTokens(current)) === key ? current : tokens.join(", ")
    );
    // The tokens' content, not their array identity, decides a reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (
    <Input
      id={id}
      value={text}
      placeholder="NA, N/A, -"
      onChange={(event) => {
        setText(event.target.value);
        onChange(parseTokens(event.target.value));
      }}
    />
  );
}
