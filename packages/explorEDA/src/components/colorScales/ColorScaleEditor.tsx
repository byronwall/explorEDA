import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowLeftRight, Check, RotateCcw } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ActionTooltip } from "@/components/ui/tooltip";
import { useColorScales } from "@/hooks/useColorScales";
import { categoryLabel } from "@/lib/categories";
import {
  EXPLOREDA_CATEGORICAL,
  MISSING_COLOR,
  OTHER_COLOR,
  VISION_MODES,
  findClosestPair,
  getCategoricalPalette,
  getRampPalette,
  isValidColor,
  type Palette,
} from "@/lib/colorPalettes";
import {
  MISSING_CATEGORY,
  assignCategoryColors,
  categoricalPaletteId,
  isDivergingScale,
  scaleGradient,
} from "@/lib/colorScaleMath";
import { hasFieldDisplayFormat } from "@/lib/fieldSettings";
import { finiteNumber } from "@/lib/numeric";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type {
  CategoricalColorScale,
  CategoryColorOrder,
  ColorScaleType,
  NumericalColorScale,
  NumericalScaleTransform,
} from "@/types/ColorScaleTypes";
import { DomainEditor } from "./DomainEditor";
import {
  CATEGORICAL_SECTIONS,
  NUMERICAL_SECTIONS,
  PaletteGallery,
} from "./PaletteGallery";
import { useSimulate } from "./vision";

const numberFormat = new Intl.NumberFormat(undefined, {
  maximumSignificantDigits: 4,
});

function scaleSignature(scale: ColorScaleType) {
  return JSON.stringify(
    scale.type === "categorical"
      ? { ...scale, mapping: [...scale.mapping] }
      : scale
  );
}

/**
 * Edits one color scale in place. Changes apply to every chart that uses the
 * scale as soon as they are valid; Reset returns it to how it was when this
 * editor opened.
 */
export function ColorScaleEditor({
  scale,
  showName = true,
  paletteActions,
}: {
  scale: ColorScaleType;
  showName?: boolean;
  /** Extra controls beside the Palette heading. */
  paletteActions?: ReactNode;
}) {
  const { updateColorScale } = useColorScales();
  const [initial, setInitial] = useState(scale);
  useEffect(() => setInitial(scale), [scale.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const changed = scaleSignature(initial) !== scaleSignature(scale);
  const update = (updates: Partial<ColorScaleType>) =>
    updateColorScale(scale.id, updates);

  return (
    <div className="eda-color-editor">
      {showName && (
        <div className="eda-color-name-row">
          <label
            className="eda-color-label"
            htmlFor={`color-scale-name-${scale.id}`}
          >
            Name
          </label>
          <Input
            id={`color-scale-name-${scale.id}`}
            value={scale.name}
            onChange={(event) => update({ name: event.target.value })}
          />
        </div>
      )}
      {scale.type === "numerical" ? (
        <NumericalScaleEditor
          scale={scale}
          onUpdate={update}
          paletteActions={paletteActions}
        />
      ) : (
        <CategoricalScaleEditor
          scale={scale}
          onUpdate={update}
          paletteActions={paletteActions}
        />
      )}
      <div className="eda-color-editor-foot">
        <span className="eda-color-muted">Changes apply right away.</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!changed}
          tooltip="Undo every change to this scale since you opened it"
          onClick={() => {
            // Restore every field, including ones the edit added.
            const keys = new Set([
              ...Object.keys(scale),
              ...Object.keys(initial),
            ]);
            keys.delete("id");
            update(
              Object.fromEntries(
                [...keys].map((key) => [
                  key,
                  initial[key as keyof ColorScaleType],
                ])
              ) as Partial<ColorScaleType>
            );
          }}
        >
          <RotateCcw aria-hidden="true" />
          Reset
        </Button>
      </div>
    </div>
  );
}

function useFieldValues(field: string | undefined) {
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const rowCount = useDataLayer((state) => state.data.length);
  return useMemo(
    () => (field ? Object.values(getColumnData(field)) : []),
    // Row count stands in for a data change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field, getColumnData, rowCount]
  );
}

function useValueFormatter(field: string | undefined) {
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  return (value: number) =>
    field && hasFieldDisplayFormat(fieldSettings[field])
      ? formatFieldValue(field, value)
      : numberFormat.format(value);
}

function Section({
  heading,
  hint,
  actions,
  children,
}: {
  heading: string;
  hint?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="eda-color-section">
      <div className="eda-color-section-head">
        <h3>{heading}</h3>
        {hint && <span className="eda-color-muted">{hint}</span>}
        {actions && <div className="eda-color-section-actions">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string; tooltip: string }[];
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

const STEP_OPTIONS = [
  {
    value: 0,
    label: "Smooth",
    tooltip: "A continuous ramp. Best for reading fine differences.",
  },
  ...[3, 5, 7, 9].map((steps) => ({
    value: steps,
    label: String(steps),
    tooltip: `${steps} solid classes. Easier to match a mark to the legend, at the cost of detail.`,
  })),
];

const SPACING_OPTIONS: readonly {
  value: NumericalScaleTransform;
  label: string;
  tooltip: string;
}[] = [
  {
    value: "linear",
    label: "Linear",
    tooltip: "Equal value steps take equal color steps.",
  },
  {
    value: "sqrt",
    label: "Sqrt",
    tooltip:
      "Square-root spacing. Spreads out small values when a few large ones dominate.",
  },
  {
    value: "log",
    label: "Log",
    tooltip:
      "Logarithmic spacing. Each tenfold change takes the same color step; suits values that span orders of magnitude.",
  },
];

function NumberField({
  id,
  label,
  value,
  onCommit,
}: {
  id: string;
  label: string;
  value: number;
  onCommit: (value: number) => boolean;
}) {
  const [text, setText] = useState(String(value));
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    if (Number(text) !== value) {
      setText(String(Number(value.toPrecision(8))));
    }
    setInvalid(false);
    // Only outside changes reset the draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className="eda-color-number">
      <label htmlFor={id}>{label}</label>
      <Input
        id={id}
        inputMode="decimal"
        value={text}
        aria-invalid={invalid || undefined}
        onChange={(event) => {
          setText(event.target.value);
          const next = Number(event.target.value);
          const ok =
            event.target.value.trim() !== "" &&
            Number.isFinite(next) &&
            onCommit(next);
          setInvalid(!ok);
        }}
      />
    </div>
  );
}

function NumericalScaleEditor({
  scale,
  onUpdate,
  paletteActions,
}: {
  scale: NumericalColorScale;
  onUpdate: (updates: Partial<NumericalColorScale>) => void;
  paletteActions?: ReactNode;
}) {
  const [preview, setPreview] = useState<Palette>();
  const rawValues = useFieldValues(scale.sourceField);
  const values = useMemo(
    () =>
      rawValues
        .map((value) => finiteNumber(value))
        .filter((value): value is number => value !== undefined),
    [rawValues]
  );
  const sorted = useMemo(() => [...values].sort((a, b) => a - b), [values]);
  const formatValue = useValueFormatter(scale.sourceField);
  const previewScale =
    preview && preview.kind !== "categorical"
      ? { ...scale, palette: preview.id }
      : scale;
  const diverging = isDivergingScale(scale);
  const midpoint = scale.midpoint;
  const quantile = (q: number) =>
    sorted.length
      ? sorted[
          Math.min(sorted.length - 1, Math.floor(q * (sorted.length - 1)))
        ]!
      : undefined;
  const dataLow = sorted[0];
  const dataHigh = sorted[sorted.length - 1];
  const logBlocked = (scale.transform ?? "linear") === "log" && scale.min <= 0;
  const [error, setError] = useState<string>();

  const commit = (key: "min" | "max" | "midpoint") => (value: number) => {
    const next = { min: scale.min, max: scale.max, midpoint, [key]: value };
    if (next.min >= next.max) {
      setError("The start must be below the end.");
      return false;
    }
    if (
      diverging &&
      next.midpoint !== undefined &&
      (next.midpoint <= next.min || next.midpoint >= next.max)
    ) {
      setError("The midpoint must fall between the start and the end.");
      return false;
    }
    setError(undefined);
    onUpdate({ [key]: value });
    return true;
  };

  const center = () => {
    const mid =
      scale.min < 0 && scale.max > 0
        ? 0
        : (midpoint ?? (scale.min + scale.max) / 2);
    const reach = Math.max(
      Math.abs(scale.min - mid),
      Math.abs(scale.max - mid)
    );
    onUpdate({ min: mid - reach, max: mid + reach, midpoint: mid });
  };

  return (
    <>
      <Section
        heading="Range"
        hint={
          dataLow !== undefined
            ? `Data ${formatValue(dataLow)} to ${formatValue(dataHigh!)}`
            : undefined
        }
      >
        <DomainEditor
          scale={scale}
          previewScale={previewScale}
          values={values}
          formatValue={formatValue}
          onChange={(updates) => {
            setError(undefined);
            onUpdate(updates);
          }}
        />
        <div
          className="eda-domain-fields"
          data-diverging={diverging || undefined}
        >
          <NumberField
            id={`color-scale-min-${scale.id}`}
            label="Start"
            value={scale.min}
            onCommit={commit("min")}
          />
          {diverging && (
            <NumberField
              id={`color-scale-mid-${scale.id}`}
              label="Midpoint"
              value={
                midpoint ??
                (scale.min < 0 && scale.max > 0
                  ? 0
                  : (scale.min + scale.max) / 2)
              }
              onCommit={commit("midpoint")}
            />
          )}
          <NumberField
            id={`color-scale-max-${scale.id}`}
            label="End"
            value={scale.max}
            onCommit={commit("max")}
          />
        </div>
        {error && (
          <p className="eda-color-error" role="alert">
            {error}
          </p>
        )}
        <div className="eda-color-chips">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={dataLow === undefined}
            tooltip="Fit the ramp to the smallest and largest values"
            onClick={() =>
              dataLow !== undefined &&
              dataHigh! > dataLow &&
              onUpdate({ min: dataLow, max: dataHigh!, midpoint: undefined })
            }
          >
            Fit to data
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={sorted.length < 10}
            tooltip="Fit the ramp to the middle 96% of values so a few outliers do not wash out the rest"
            onClick={() => {
              const low = quantile(0.02);
              const high = quantile(0.98);
              if (low !== undefined && high !== undefined && high > low) {
                onUpdate({ min: low, max: high, midpoint: undefined });
              }
            }}
          >
            Trim outliers
          </Button>
          {diverging && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              tooltip="Give both sides of the midpoint the same reach, centered on 0 when the range crosses it"
              onClick={center}
            >
              Balance sides
            </Button>
          )}
        </div>
      </Section>

      <Section heading="Palette" actions={paletteActions}>
        <PaletteGallery
          label="Palette"
          sections={NUMERICAL_SECTIONS}
          value={scale.palette}
          reverse={scale.reverse}
          steps={scale.steps}
          onSelect={(palette) => {
            setPreview(undefined);
            onUpdate({ palette: palette.id });
          }}
          onPreview={setPreview}
        />
      </Section>

      <Section heading="Shape">
        <div className="eda-color-options">
          <div className="eda-color-option">
            <span className="eda-color-label">Direction</span>
            <ActionTooltip content="Run the palette from its other end, so low values take the colors high values had">
              <button
                type="button"
                className="eda-toggle-chip"
                aria-pressed={Boolean(scale.reverse)}
                onClick={() => onUpdate({ reverse: !scale.reverse })}
              >
                <ArrowLeftRight aria-hidden="true" />
                Reverse
              </button>
            </ActionTooltip>
          </div>
          <div className="eda-color-option">
            <span className="eda-color-label">Steps</span>
            <Segmented
              label="Steps"
              value={scale.steps ?? 0}
              options={STEP_OPTIONS}
              onChange={(steps) => onUpdate({ steps: steps || undefined })}
            />
          </div>
          <div className="eda-color-option">
            <span className="eda-color-label">Spacing</span>
            <Segmented
              label="Spacing"
              value={scale.transform ?? "linear"}
              options={SPACING_OPTIONS}
              onChange={(transform) =>
                onUpdate({
                  transform: transform === "linear" ? undefined : transform,
                })
              }
            />
          </div>
          {logBlocked && (
            <p className="eda-color-muted">
              The range reaches zero or below, so log spacing uses a symmetric
              log that passes through zero.
            </p>
          )}
        </div>
      </Section>
    </>
  );
}

const ORDER_OPTIONS: readonly {
  value: CategoryColorOrder;
  label: string;
  tooltip: string;
}[] = [
  {
    value: "frequency",
    label: "Most rows",
    tooltip: "The largest categories take the first, most distinct colors.",
  },
  {
    value: "alphabetical",
    label: "A to Z",
    tooltip: "Categories take colors in alphabetical order.",
  },
  {
    value: "data",
    label: "Data order",
    tooltip: "Categories take colors in the order they first appear.",
  },
];

function CategoricalScaleEditor({
  scale,
  onUpdate,
  paletteActions,
}: {
  scale: CategoricalColorScale;
  onUpdate: (updates: Partial<CategoricalColorScale>) => void;
  paletteActions?: ReactNode;
}) {
  const simulate = useSimulate();
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<Palette>();
  const rawValues = useFieldValues(scale.sourceField);
  const counts = useMemo(() => {
    const result = new Map<string, number>();
    rawValues.forEach((value) => {
      const label = categoryLabel(value);
      result.set(label, (result.get(label) ?? 0) + 1);
    });
    return result;
  }, [rawValues]);
  // Categories the scale knows, then any new ones the data has gained.
  const categories = useMemo(() => {
    const labels = [...scale.mapping.keys()];
    counts.forEach((_, label) => {
      if (!scale.mapping.has(label)) {
        labels.push(label);
      }
    });
    return labels;
  }, [counts, scale.mapping]);

  const order = scale.order ?? "data";
  const overflow = scale.overflow ?? "repeat";
  const paletteId = categoricalPaletteId(scale);
  const ordered = Boolean(getRampPalette(paletteId));
  const assign = (
    options: Partial<
      Pick<
        CategoricalColorScale,
        "paletteId" | "reverse" | "order" | "overflow"
      >
    >
  ) => {
    const next = {
      paletteId: paletteId ?? "explorEDA",
      reverse: scale.reverse,
      order,
      overflow,
      ...options,
    };
    const { mapping, palette } = assignCategoryColors(categories, next, counts);
    onUpdate({ ...next, mapping, palette });
  };

  const previewMapping = useMemo(
    () =>
      preview
        ? assignCategoryColors(
            categories,
            { paletteId: preview.id, reverse: false, order, overflow },
            counts
          ).mapping
        : undefined,
    [categories, counts, order, overflow, preview]
  );
  const colorOf = (label: string) =>
    previewMapping?.get(label) ??
    scale.mapping.get(label) ??
    (label === MISSING_CATEGORY ? MISSING_COLOR : OTHER_COLOR);

  const paletteSize = ordered
    ? Infinity
    : (getCategoricalPalette(paletteId)?.colors.length ?? scale.palette.length);
  const named = categories.filter((label) => label !== MISSING_CATEGORY);
  const shownColors = named
    .map((label) => ({ label, color: colorOf(label) }))
    .filter(({ color }) => color !== OTHER_COLOR)
    .slice(0, 12);
  const closest = findClosestPair(shownColors.map(({ color }) => color));
  const lookAlike = (mode: string) =>
    mode === "normal"
      ? "are hard to tell apart."
      : `look alike to readers with ${VISION_MODES.find((item) => item.value === mode)?.label.toLowerCase()}.`;

  const filtered = categories.filter((label) =>
    label.toLowerCase().includes(query.trim().toLowerCase())
  );
  const maxCount = Math.max(1, ...counts.values());

  return (
    <>
      <Section heading="Palette" actions={paletteActions}>
        <PaletteGallery
          label="Palette"
          sections={CATEGORICAL_SECTIONS}
          value={paletteId}
          reverse={scale.reverse}
          onSelect={(palette) => {
            setPreview(undefined);
            assign({
              paletteId: palette.id,
              reverse: false,
              order:
                palette.kind === "categorical" || scale.order
                  ? order
                  : "alphabetical",
            });
          }}
          onPreview={setPreview}
        />
      </Section>

      <Section heading="Assignment">
        <div className="eda-color-options">
          <div className="eda-color-option">
            <span className="eda-color-label">Order</span>
            <Segmented
              label="Color order"
              value={order}
              options={ORDER_OPTIONS}
              onChange={(next) => assign({ order: next })}
            />
          </div>
          {ordered && (
            <div className="eda-color-option">
              <span className="eda-color-label">Direction</span>
              <ActionTooltip content="Run the ramp from its other end">
                <button
                  type="button"
                  className="eda-toggle-chip"
                  aria-pressed={Boolean(scale.reverse)}
                  onClick={() => assign({ reverse: !scale.reverse })}
                >
                  <ArrowLeftRight aria-hidden="true" />
                  Reverse
                </button>
              </ActionTooltip>
            </div>
          )}
          {!ordered && named.length > paletteSize && (
            <div className="eda-color-option">
              <span className="eda-color-label">Past {paletteSize}</span>
              <Segmented
                label={`Categories past the first ${paletteSize}`}
                value={overflow}
                options={[
                  {
                    value: "other",
                    label: "Gray",
                    tooltip: `Categories past the first ${paletteSize} share one gray, so every color names one category.`,
                  },
                  {
                    value: "repeat",
                    label: "Repeat",
                    tooltip:
                      "Categories past the end start the palette again. Repeated colors name more than one category.",
                  },
                ]}
                onChange={(next) => assign({ overflow: next })}
              />
            </div>
          )}
        </div>
        {shownColors.length > 1 &&
          (closest ? (
            <p className="eda-color-check" data-tone="warning">
              <AlertTriangle aria-hidden="true" />
              <span>
                <strong>{shownColors[closest.first]!.label}</strong> and{" "}
                <strong>{shownColors[closest.second]!.label}</strong>{" "}
                {lookAlike(closest.mode)}
              </span>
            </p>
          ) : (
            <p className="eda-color-check" data-tone="good">
              <Check aria-hidden="true" />
              <span>
                Every color stays distinct, including for red-green color
                blindness.
              </span>
            </p>
          ))}
      </Section>

      <Section
        heading="Categories"
        hint={`${categories.length.toLocaleString()} ${categories.length === 1 ? "value" : "values"}`}
      >
        {categories.length > 8 && (
          <Input
            aria-label="Find a category"
            placeholder="Find a category"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        )}
        <ul className="eda-category-list">
          {filtered.slice(0, 100).map((label) => {
            const color = colorOf(label);
            const count = counts.get(label) ?? 0;
            return (
              <li key={label} className="eda-category-row">
                <CategoryColorButton
                  label={label}
                  color={color}
                  swatchColor={simulate(color)}
                  palette={scale.palette}
                  onChange={(next) => {
                    const mapping = new Map(scale.mapping);
                    mapping.set(label, next);
                    onUpdate({ mapping });
                  }}
                />
                <span className="eda-category-name">{label}</span>
                <span className="eda-category-bar" aria-hidden="true">
                  <span style={{ width: `${(count / maxCount) * 100}%` }} />
                </span>
                <span className="eda-category-count">
                  {count.toLocaleString()}
                </span>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="eda-color-muted">No matching categories</li>
          )}
        </ul>
        {filtered.length > 100 && (
          <p className="eda-color-muted">
            First 100 of {filtered.length.toLocaleString()} shown. Search to
            find a category.
          </p>
        )}
      </Section>
    </>
  );
}

const NEUTRALS = ["#3f3f3c", "#6e6d68", OTHER_COLOR, MISSING_COLOR];

function CategoryColorButton({
  label,
  color,
  swatchColor,
  palette,
  onChange,
}: {
  label: string;
  color: string;
  swatchColor: string;
  palette: readonly string[];
  onChange: (color: string) => void;
}) {
  const [draft, setDraft] = useState(color);
  useEffect(() => setDraft(color), [color]);
  const swatches = [
    ...new Set(
      [...palette.slice(0, 12), ...EXPLOREDA_CATEGORICAL, ...NEUTRALS].map(
        (item) => item.toLowerCase()
      )
    ),
  ];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="eda-category-swatch"
          style={{ background: swatchColor }}
          aria-label={`Change the color for ${label}`}
        />
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        collisionPadding={12}
        className="eda-category-color-popover"
      >
        <div className="eda-category-color-head">
          <span className="eda-legend-swatch" style={{ background: color }} />
          <span className="truncate">{label}</span>
        </div>
        <div
          className="eda-swatch-grid"
          role="group"
          aria-label="Suggested colors"
        >
          {swatches.map((swatch) => (
            <button
              key={swatch}
              type="button"
              className="eda-swatch-choice"
              style={{ background: swatch }}
              aria-label={`Use ${swatch}`}
              aria-pressed={swatch === color.toLowerCase()}
              onClick={() => onChange(swatch)}
            />
          ))}
        </div>
        <HexColorPicker
          color={isValidColor(draft) ? draft : color}
          onChange={(next) => {
            setDraft(next);
            onChange(next);
          }}
          className="eda-hex-picker"
        />
        <Input
          aria-label={`Hex color for ${label}`}
          value={draft}
          aria-invalid={!isValidColor(draft) || undefined}
          onChange={(event) => {
            setDraft(event.target.value);
            if (isValidColor(event.target.value)) {
              onChange(event.target.value);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/** A thin preview of a scale's colors, for lists and triggers. */
export function ScaleSwatch({
  scale,
  className = "eda-scale-swatch",
}: {
  scale: ColorScaleType;
  className?: string;
}) {
  const simulate = useSimulate();
  return (
    <span
      className={className}
      style={{ background: simulate(scaleGradient(scale)) }}
      aria-hidden="true"
    />
  );
}

/** The palette's display name, or Custom for hand-picked colors. */
export function paletteLabel(scale: ColorScaleType) {
  if (scale.type === "numerical") {
    return getRampPalette(scale.palette)?.name ?? scale.palette;
  }
  return (
    (
      getCategoricalPalette(categoricalPaletteId(scale)) ??
      getRampPalette(scale.paletteId)
    )?.name ?? "Custom"
  );
}
