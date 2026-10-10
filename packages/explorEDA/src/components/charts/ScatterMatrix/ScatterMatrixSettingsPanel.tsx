import { FieldSelector } from "@/components/FieldSelector";
import { Button } from "@/components/ui/button";
import { NumericInputEnter } from "@/components/NumericInputEnter";
import { Label } from "@/components/ui/label";
import { ActionTooltip } from "@/components/ui/tooltip";
import { ColorScaleControl } from "@/components/colorScales/ColorScaleControl";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { useMemo } from "react";
import {
  DEFAULT_DIAGONAL_CELLS,
  DEFAULT_LOWER_CELLS,
  DEFAULT_UPPER_CELLS,
  MAX_MATRIX_CATEGORIES,
  MAX_MATRIX_FIELDS,
  MIN_MATRIX_FIELDS,
  type MatrixDiagonalCells,
  type MatrixTriangleCells,
  type ScatterMatrixSettings,
} from "./definition";

/** Options as [value, short label, help]. */
type Options = readonly (readonly [string, string, string])[];

const NUMERIC_CELLS: Options = [
  ["points", "Points", "Draw each row as a point."],
  [
    "correlation",
    "Corr",
    "Show the Pearson correlation of the two fields and the rows it uses.",
  ],
  ["blank", "Blank", "Leave these cells empty."],
];
const MIXED_CELLS: Options = [
  [
    "points",
    "Points",
    "Draw each row as a point, spread across its category's band.",
  ],
  [
    "box",
    "Box",
    "Show a box plot of the number for each category. Click a box to select its category.",
  ],
  ["blank", "Blank", "Leave these cells empty."],
];
const CATEGORICAL_CELLS: Options = [
  [
    "points",
    "Points",
    "Draw each row as a point, spread inside its pair of categories.",
  ],
  [
    "tiles",
    "Tiles",
    "Size a square by how many rows share each pair of categories.",
  ],
  [
    "shares",
    "Shares",
    "Draw a bar for each pair, as long as its share of the column category's rows.",
  ],
  ["blank", "Blank", "Leave these cells empty."],
];
const CONTINUOUS_DIAGONAL: Options = [
  [
    "density",
    "Density",
    "Draw a smoothed curve of the field, scaled to row counts so a selection's curve sits inside the whole one.",
  ],
  [
    "histogram",
    "Histogram",
    "Count rows in 20 equal bins. Click a bin to select its range.",
  ],
  ["label", "Name", "Show only the field name."],
];
const CATEGORICAL_DIAGONAL: Options = [
  ["bars", "Bars", "Count rows in each category. Click a bar to select it."],
  ["label", "Name", "Show only the field name."],
];

function Segmented({
  label,
  help,
  value,
  options,
  onChange,
}: {
  label: string;
  help: string;
  value: string;
  options: Options;
  onChange: (value: string) => void;
}) {
  return (
    <>
      <ActionTooltip content={help}>
        <span className="eda-setting-label">{label}</span>
      </ActionTooltip>
      <div className="eda-segmented" role="radiogroup" aria-label={label}>
        {options.map(([option, short, tip]) => (
          <ActionTooltip key={option} content={tip}>
            <button
              type="button"
              role="radio"
              aria-checked={option === value}
              className="eda-segmented-item"
              onClick={() => onChange(option)}
            >
              {short}
            </button>
          </ActionTooltip>
        ))}
      </div>
    </>
  );
}
import { moveField } from "./matrixPlan";

export function ScatterMatrixSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ScatterMatrixSettings>) {
  const getColumnNames = useDataLayer((s) => s.getColumnNames);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const calculations = useDataLayer((s) => s.calculations);
  const allFields = useMemo(() => {
    void calculations;
    return getColumnNames();
  }, [calculations, getColumnNames]);
  const used = new Set(settings.fields);
  const { getOrCreateScaleForField } = useColorScales();

  const change = (next: Partial<ScatterMatrixSettings>) =>
    onSettingsChange({ ...settings, ...next });
  const setFields = (fields: string[]) => {
    const keep = new Set([...fields, "__ID"]);
    // A removed field takes its selection with it.
    change({
      fields,
      filters: settings.filters.filter((filter) => keep.has(filter.field)),
    });
  };

  return (
    <div className="space-y-2.5">
      <section className="space-y-2" aria-labelledby="matrix-fields-heading">
        <div className="flex items-baseline justify-between">
          <h5 id="matrix-fields-heading" className="text-sm font-medium">
            Fields, in order
          </h5>
          <span className="text-xs text-muted-foreground">
            {settings.fields.length} of {MAX_MATRIX_FIELDS}
          </span>
        </div>
        <ol className="space-y-1.5">
          {settings.fields.map((field, index) => {
            const label = getFieldLabel(field);
            return (
              <li
                key={`${field}-${index}`}
                className="flex min-w-0 items-center gap-1"
              >
                <span className="w-4 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <FieldSelector
                    label=""
                    placeholder={`Field ${index + 1}`}
                    value={field}
                    fields={allFields.filter(
                      (item) => item === field || !used.has(item)
                    )}
                    onChange={(next) =>
                      setFields(
                        settings.fields.map((item, position) =>
                          position === index ? next : item
                        )
                      )
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${label} earlier`}
                  tooltip="Move this field one place earlier: left in the columns and up in the rows."
                  disabled={index === 0}
                  onClick={() =>
                    setFields(moveField(settings.fields, index, index - 1))
                  }
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${label} later`}
                  tooltip="Move this field one place later: right in the columns and down in the rows."
                  disabled={index === settings.fields.length - 1}
                  onClick={() =>
                    setFields(moveField(settings.fields, index, index + 1))
                  }
                >
                  <ArrowDown />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Remove ${label}`}
                  tooltip="Remove this field and its selection."
                  disabled={settings.fields.length <= MIN_MATRIX_FIELDS}
                  onClick={() =>
                    setFields(
                      settings.fields.filter(
                        (_, position) => position !== index
                      )
                    )
                  }
                >
                  <X />
                </Button>
              </li>
            );
          })}
        </ol>
        {settings.fields.length < MAX_MATRIX_FIELDS && (
          <FieldSelector
            label=""
            placeholder="Add a field"
            value=""
            fields={allFields.filter((field) => !used.has(field))}
            onChange={(field) =>
              field && setFields([...settings.fields, field])
            }
          />
        )}
      </section>

      {(["lower", "upper"] as const).map((triangle) => {
        const cells: MatrixTriangleCells = {
          ...(triangle === "lower" ? DEFAULT_LOWER_CELLS : DEFAULT_UPPER_CELLS),
          ...settings[triangle],
        };
        const set = (key: keyof MatrixTriangleCells, value: string) =>
          change({ [triangle]: { ...cells, [key]: value } });
        return (
          <section
            key={triangle}
            className="eda-setting-section"
            aria-label={
              triangle === "lower" ? "Below the diagonal" : "Above the diagonal"
            }
          >
            <h5>
              {triangle === "lower"
                ? "Below the diagonal"
                : "Above the diagonal"}
            </h5>
            <div className="eda-setting-grid">
              <Segmented
                label="Numbers"
                help="Cells that pair two number or date fields."
                value={cells.numeric}
                options={NUMERIC_CELLS}
                onChange={(value) => set("numeric", value)}
              />
              <Segmented
                label="Mixed"
                help="Cells that pair a number or date field with a category field."
                value={cells.mixed}
                options={MIXED_CELLS}
                onChange={(value) => set("mixed", value)}
              />
              <Segmented
                label="Categories"
                help="Cells that pair two category fields."
                value={cells.categorical}
                options={CATEGORICAL_CELLS}
                onChange={(value) => set("categorical", value)}
              />
            </div>
          </section>
        );
      })}

      <section className="eda-setting-section" aria-label="Diagonal">
        <h5>Diagonal</h5>
        <div className="eda-setting-grid">
          {(
            [
              [
                "continuous",
                "Numbers",
                "Diagonal cells of number and date fields.",
                CONTINUOUS_DIAGONAL,
              ],
              [
                "categorical",
                "Categories",
                "Diagonal cells of category fields.",
                CATEGORICAL_DIAGONAL,
              ],
            ] as const
          ).map(([key, label, help, options]) => {
            const diagonal: MatrixDiagonalCells = {
              ...DEFAULT_DIAGONAL_CELLS,
              ...settings.diagonal,
            };
            return (
              <Segmented
                key={key}
                label={label}
                help={help}
                value={diagonal[key]}
                options={options}
                onChange={(value) =>
                  change({ diagonal: { ...diagonal, [key]: value } })
                }
              />
            );
          })}
        </div>
      </section>

      <section className="eda-setting-section" aria-label="Points">
        <h5>Points</h5>
        <div className="eda-setting-grid">
          <ActionTooltip content="Color points, distributions, and correlations by a category field. Box plots and tiles keep one color.">
            <Label>Color</Label>
          </ActionTooltip>
          <FieldSelector
            label=""
            placeholder="One color"
            value={settings.colorField ?? ""}
            allowClear
            onChange={(value) =>
              change({
                colorField: value || undefined,
                colorScaleId: value
                  ? getOrCreateScaleForField(value)
                  : undefined,
                // A legend selection belongs to the old color field.
                filters: settings.colorField
                  ? settings.filters.filter(
                      (filter) =>
                        filter.field !== settings.colorField ||
                        used.has(filter.field)
                    )
                  : settings.filters,
              })
            }
          />
          {settings.colorScaleId && (
            <div className="col-start-2 -mt-2">
              <ColorScaleControl scaleId={settings.colorScaleId} />
            </div>
          )}
          <ActionTooltip content="How much of a category's band jittered points spread across. 0 stacks them on one line; 1 fills the band.">
            <Label htmlFor="matrix-jitter">Jitter</Label>
          </ActionTooltip>
          <NumericInputEnter
            id="matrix-jitter"
            value={settings.jitter ?? 0.8}
            min={0}
            max={1}
            stepSmall={0.05}
            stepMedium={0.1}
            stepLarge={0.25}
            onChange={(value) =>
              change({ jitter: Math.min(1, Math.max(0, value)) })
            }
          />
        </div>
        <p className="eda-setting-note">
          {`Category fields with more than ${MAX_MATRIX_CATEGORIES} values fold the least common into Other categories.`}
        </p>
      </section>
    </div>
  );
}
