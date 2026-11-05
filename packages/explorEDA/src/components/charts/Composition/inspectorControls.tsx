import { NumericInputEnter } from "@/components/NumericInputEnter";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import { useId, type ReactNode } from "react";

export function Segmented<T extends string | number | boolean>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: ReactNode; tooltip: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="eda-segmented" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <ActionTooltip key={String(option.value)} content={option.tooltip}>
          <button
            type="button"
            role="radio"
            aria-checked={option.value === value}
            className="eda-segmented-item"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        </ActionTooltip>
      ))}
    </div>
  );
}

/** A label in the settings column beside a number input. */
export function NumberSetting({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const id = useId();
  return (
    <>
      <Label htmlFor={id}>{label}</Label>
      <NumericInputEnter
        id={id}
        value={value}
        min={min}
        max={max}
        onChange={(next) =>
          Number.isFinite(next) &&
          onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next)))
        }
      />
    </>
  );
}

/** Two numbers on one row, such as X and Y. */
export function PairSetting({
  label,
  names,
  values,
  onChange,
  min,
}: {
  label: string;
  names: [string, string];
  values: [number, number];
  onChange: (values: [number, number]) => void;
  min?: number;
}) {
  const id = useId();
  const clamp = (value: number) => Math.max(min ?? -Infinity, value);
  return (
    <>
      <Label htmlFor={id}>{label}</Label>
      <div className="eda-composition-pair">
        <NumericInputEnter
          id={id}
          aria-label={`${label} ${names[0]}`}
          value={values[0]}
          onChange={(next) =>
            Number.isFinite(next) && onChange([clamp(next), values[1]])
          }
        />
        <span aria-hidden="true">{names[1] === "H" ? "×" : ","}</span>
        <NumericInputEnter
          aria-label={`${label} ${names[1]}`}
          value={values[1]}
          onChange={(next) =>
            Number.isFinite(next) && onChange([values[0], clamp(next)])
          }
        />
      </div>
    </>
  );
}

export function ColorSetting({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <>
      <Label htmlFor={id}>{label}</Label>
      <div className="eda-composition-color">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="font-mono">{value}</span>
      </div>
    </>
  );
}

/**
 * Which rows set an extent: every row, so lengths and colors hold while
 * filtering, or only the rows the filters leave.
 */
export function FitSetting({
  name,
  fit,
  onChange,
}: {
  name: string;
  fit: "filtered" | undefined;
  onChange: (fit: "filtered" | undefined) => void;
}) {
  return (
    <>
      <span className="eda-setting-label">Scale to</span>
      <Segmented
        label={`${name} scale to`}
        value={fit ?? "all"}
        options={[
          {
            value: "all" as const,
            label: "All rows",
            tooltip:
              "Lengths and colors read every row, so filtering keeps them on one scale",
          },
          {
            value: "filtered" as const,
            label: "Filtered",
            tooltip:
              "Fit to the rows the filters leave. Lengths and colors change as filters change.",
          },
        ]}
        onChange={(value) =>
          onChange(value === "filtered" ? "filtered" : undefined)
        }
      />
    </>
  );
}
